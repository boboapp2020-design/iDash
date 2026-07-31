/**
 * iDash — direct browser→AI-provider client for the AI Autopilot path.
 *
 * The user supplies their own API key; it is kept in this browser's
 * localStorage and sent straight to the provider they picked. Nothing passes
 * through an iDash server — which also means the key is visible to anyone who
 * opens DevTools on this machine. That is the accepted trade-off for a
 * backend-free app (user decision, 2026-07-29).
 *
 * P6 still holds: only the pre-aggregated facts the deterministic pipeline
 * already computed are sent. Raw rows never leave the browser.
 *
 * The model is asked for a script-free HTML document (inline CSS + inline SVG
 * charts). That keeps the output renderable inside a fully sandboxed iframe,
 * which is the real containment boundary — the regex screen in
 * isDocumentSafe() is defense in depth on top of it.
 */
(function () {
  'use strict';

  var LS_KEY  = 'idash.aiProvider';
  var TIMEOUT = 180000; // full-page HTML on a large model legitimately runs long

  /* ── Provider registry ──────────────────────────────────────────────────
   * `shape` picks the request/response adapter:
   *   anthropic → POST /v1/messages
   *   gemini    → POST /v1beta/models/{model}:generateContent
   *   openai    → POST /chat/completions   ("custom" reuses this shape — any
   *               OpenAI-compatible endpoint the user points it at)
   *   supabase  → POST the project's llm-gateway Edge Function, which holds the
   *               provider key server-side. `apiKey` here is the project's anon
   *               key, which is safe to ship client-side by design.
   * `defaultModel` is only a starting value, and `models` is a convenience
   * shortlist for the dropdown rather than a constraint — every provider also
   * offers "พิมพ์เอง", so a model released after this file was written stays
   * reachable without a code change. `tier` is what the provider's own pricing
   * page says: 'free' = usable at no cost (often rate-limited), 'paid' =
   * billed per token.
   */
  var PROVIDERS = {
    supabase: {
      label: 'Supabase (llm-gateway ของคุณ)',
      shape: 'supabase',
      endpoint: '',
      defaultModel: 'claude-opus-4-8',
      keyHint: 'ใส่ anon key ของโปรเจกต์ (ปลอดภัยที่จะอยู่ฝั่งเบราว์เซอร์)',
      keyUrl: 'supabase.com/dashboard → Settings → API',
      needsEndpoint: true,
      endpointHint: 'https://<project>.supabase.co/functions/v1/llm-gateway',
      // Anthropic only, by user directive (2026-07-31). Keeping the gateway
      // single-vendor means one secret to manage (ANTHROPIC_API_KEY) and one
      // upstream to keep working. If you need Gemini or GPT, "ต่อ AI โดยตรง"
      // already covers them without the extra hop.
      models: [
        { id: 'claude-opus-4-8',   label: 'Claude Opus 4.8 — เก่งสุด แนะนำ', tier: 'paid' },
        { id: 'claude-sonnet-5',   label: 'Claude Sonnet 5 — สมดุล',         tier: 'paid' },
        { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5 — เร็ว ถูกสุด',  tier: 'paid' }
      ]
    },
    anthropic: {
      label: 'Anthropic (Claude)',
      shape: 'anthropic',
      endpoint: 'https://api.anthropic.com/v1/messages',
      defaultModel: 'claude-opus-4-8',
      keyHint: 'ขึ้นต้นด้วย sk-ant-',
      keyUrl: 'console.anthropic.com',
      models: [
        { id: 'claude-opus-4-8',   label: 'Claude Opus 4.8 — เก่งสุด แนะนำ', tier: 'paid' },
        { id: 'claude-fable-5',    label: 'Claude Fable 5 — สูงสุด แพงสุด',  tier: 'paid' },
        { id: 'claude-opus-4-7',   label: 'Claude Opus 4.7',                 tier: 'paid' },
        { id: 'claude-opus-4-6',   label: 'Claude Opus 4.6',                 tier: 'paid' },
        { id: 'claude-sonnet-5',   label: 'Claude Sonnet 5 — สมดุล',         tier: 'paid' },
        { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6',               tier: 'paid' },
        { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5 — เร็ว ถูกสุด',  tier: 'paid' }
      ]
    },
    gemini: {
      label: 'Google Gemini',
      shape: 'gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
      defaultModel: 'gemini-2.5-flash',
      keyHint: 'ขึ้นต้นด้วย AIza',
      keyUrl: 'aistudio.google.com/apikey',
      models: [
        { id: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash — เร็ว โควตาฟรีเยอะ', tier: 'free' },
        { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite — เบาสุด',       tier: 'free' },
        { id: 'gemini-2.0-flash',      label: 'Gemini 2.0 Flash',                     tier: 'free' },
        { id: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro — เก่งสุด',             tier: 'paid' }
      ]
    },
    openai: {
      label: 'OpenAI (GPT)',
      shape: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      defaultModel: 'gpt-4o',
      keyHint: 'ขึ้นต้นด้วย sk-',
      keyUrl: 'platform.openai.com/api-keys',
      models: [
        { id: 'gpt-4o',      label: 'GPT-4o — แนะนำ',   tier: 'paid' },
        { id: 'gpt-4o-mini', label: 'GPT-4o mini — ถูก', tier: 'paid' },
        { id: 'gpt-4.1',     label: 'GPT-4.1',           tier: 'paid' },
        { id: 'o3-mini',     label: 'o3-mini — คิดลึก',  tier: 'paid' }
      ]
    },
    custom: {
      label: 'อื่นๆ (ระบุ URL เอง)',
      shape: 'openai',
      endpoint: '',
      defaultModel: '',
      keyHint: 'ต้องเป็น API ที่เข้ากันได้กับ OpenAI',
      keyUrl: '',
      needsEndpoint: true,
      endpointHint: 'https://.../v1/chat/completions',
      models: []
    }
  };

  /* ── Settings (per-provider, so switching back keeps the old key) ─────── */

  function loadSettings() {
    var s;
    try { s = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) { s = {}; }
    if (!s.providerId || !PROVIDERS[s.providerId]) s.providerId = 'anthropic';
    if (!s.byProvider) s.byProvider = {};
    return s;
  }

  function saveSettings(s) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); return true; }
    catch (e) { return false; }
  }

  /** Resolved config for whichever provider is currently selected. */
  function currentConfig() {
    var s = loadSettings();
    var def = PROVIDERS[s.providerId];
    var saved = s.byProvider[s.providerId] || {};
    return {
      providerId: s.providerId,
      label: def.label,
      shape: def.shape,
      endpoint: (saved.endpoint || def.endpoint || '').trim(),
      model: (saved.model || def.defaultModel || '').trim(),
      apiKey: (saved.apiKey || '').trim()
    };
  }

  function setProviderConfig(providerId, patch) {
    if (!PROVIDERS[providerId]) return false;
    var s = loadSettings();
    s.providerId = providerId;
    s.byProvider[providerId] = Object.assign({}, s.byProvider[providerId] || {}, patch || {});
    return saveSettings(s);
  }

  /** @returns {string|null} why the current config can't be used, or null. */
  function configProblem() {
    var c = currentConfig();
    if (!c.apiKey) return 'ยังไม่ได้ใส่ API key';
    if (!c.model) return 'ยังไม่ได้ระบุชื่อโมเดล';
    if (!c.endpoint) return 'ยังไม่ได้ระบุ API URL';
    return null;
  }

  /* ── Prompt ─────────────────────────────────────────────────────────── */

  /* The design rules below encode the dashboard-architect skill: the page is
   * judged by whether a manager can answer "what's wrong, how bad, what next"
   * within 30 seconds — not by how pretty it is. The five failures the skill
   * catalogues from 45 real dashboards (KPI with no context, sparkline with
   * no period, no as-of stamp, delta coloured by sign instead of by business
   * direction, delta with an unnamed baseline) are each addressed by name. */
  var SYSTEM_PROMPT = [
    'You are a senior dashboard architect. You output ONE complete, self-contained HTML document and nothing else.',
    '',
    'ABSOLUTE RULES — a response breaking any of these is discarded:',
    '1. Output raw HTML only. No markdown fences, no commentary, no JSON wrapper.',
    '2. NO JavaScript whatsoever. No <script>, no on* attributes, no javascript: URLs.',
    '3. NO external resources. No CDN links, no <link>, no @import, no web fonts,',
    '   no remote images, no http:// or https:// anywhere in the document.',
    '4. Draw every chart as INLINE SVG that you compute by hand from the numbers given.',
    '5. Use ONLY numbers present in the supplied payload — including the computed',
    '   statistics in dataProfile.columns[].stats. Never invent, extrapolate,',
    '   round differently, or derive a figure that was not given. If a fact is',
    '   missing, leave that element out entirely rather than filling it in.',
    '6. Every file must produce a usable dashboard. The pre-bound widgets',
    '   (kpis/trend/donut/ranked) are a suggestion the pipeline made; when they',
    '   are thin or empty, design from dataProfile instead — it describes the',
    '   real table. Never return an "insufficient data" page.',
    '',
    'GOAL — the 30-second test: a manager opening this page must be able to answer',
    '"what is unusual, how severe, what to look at next" within 30 seconds. Order',
    'content by importance to that question, not by the order facts arrive in.',
    '',
    'CONTEXT RULES (numbers without context get misread):',
    '- Header must carry the dashboard title, the source filename, and an as-of line',
    '  ("ข้อมูล ณ ..."). Use dates only if present in the facts; otherwise write',
    '  "ข้อมูลจากไฟล์ <filename>". If trend periods exist, show the covered range.',
    '- Every number carries its unit, on KPI cards AND on every chart axis. If no',
    '  unit is supplied, label the aggregation instead (รวม / เฉลี่ย / จำนวน).',
    '- Every delta names its baseline visibly next to the value (e.g. "เทียบช่วงก่อนหน้า"),',
    '  never only in a tooltip. No baseline in the facts = no delta shown.',
    '- A sparkline or trend line must say what period it spans.',
    '',
    'DIRECTION RULES (colour by business meaning, never by arithmetic sign):',
    '- For cost / downtime / defect / waste / complaint metrics, a DECREASE is good',
    '  (green with down-arrow); an increase is bad (red). Reverse for revenue-like metrics.',
    '- Never signal with colour alone — always pair colour with an arrow and text.',
    '- Metrics that are two-sided (pH-like, where both extremes are bad): show the value',
    '  neutrally with no good/bad arrow unless a target is supplied in the facts.',
    '',
    'CHART RULES:',
    '- One measure per axis. NEVER a dual-axis chart.',
    '- Part-to-whole with 4+ categories: horizontal bar ranked largest-first, never',
    '  a pie/donut. Donut only for 2-3 parts, with the total in the centre.',
    '- Bars sorted by value descending unless the category order is chronological.',
    '- Never put negative values in a pie/donut.',
    '- If facts contain both a total and its breakdown, show them together only when',
    '  the breakdown actually sums to the total.',
    '',
    'LAYOUT (top to bottom):',
    '- KPI strip of at most 6 cards (label / value+unit / delta+baseline / spark if series given).',
    '- Hero row: main time-series (~60% width) beside one composition or ranking (~40%).',
    '- Secondary charts, then tables. If alerts/insights are supplied in the facts,',
    '  render them as a prominent panel with severity and the suggested action —',
    '  and if none are supplied, omit that section entirely rather than inventing one.',
    '- Footer: "สร้างโดย iDash · ตัวเลขทั้งหมดคำนวณจากไฟล์ของผู้ใช้" plus the as-of line.',
    '',
    'DESIGN BRIEF — this is a flagship product surface, not a report printout.',
    'Spend the effort. A plain page with three boxes is a failure even if every',
    'number on it is correct.',
    '- Thai-language UI. Keep every label exactly as supplied in the facts.',
    '- Build a real visual system first, then apply it: a background treatment',
    '  (soft gradient mesh / layered tints — not flat white), an elevation scale,',
    '  a radius scale, and a spacing scale used consistently across every card.',
    '- KPI cards: coloured icon badge per card, large tabular-figure value, unit,',
    '  delta with its baseline, and an inline SVG sparkline when a series exists.',
    '  Give the cards depth — subtle gradient fill, hairline border, soft shadow.',
    '- Charts as polished inline SVG: rounded bar caps, gradient fills under area',
    '  and line charts, gridlines at ~8% opacity, direct value labels on bars,',
    '  a donut with the total in the centre. Add a legend only when 2+ series.',
    '- Compose an asymmetric layout — a wide hero chart beside a narrower',
    '  companion, not a uniform grid of equal boxes.',
    '- Type: one system font stack, but a deliberate hierarchy — oversized bold',
    '  KPI values, small uppercase-tracked section labels, quiet secondary text.',
    '- Colour: pick ONE accent hue and build tints of it for chart series; reserve',
    '  green/amber/red strictly for good/warning/bad. Never a rainbow of series.',
    '- Include a header band with the dashboard title, filename and as-of line,',
    '  and a closing footer line.',
    '- Responsive with CSS grid/flex; nothing may overflow horizontally at 1280px.',
    '- Dense but breathable: generous whitespace, restrained borders, nothing',
    '  cramped and nothing floating alone in a big empty card.',
    '',
    'Do not cut the page short to save output length — finish every section you',
    'start, and close every tag.'
  ].join('\n');

  function buildUserPrompt(facts) {
    var hasProfile = facts && facts.dataProfile && facts.dataProfile.columns &&
                     facts.dataProfile.columns.length > 0;
    return [
      'ออกแบบหน้า Dashboard จากข้อมูลชุดนี้',
      '',
      JSON.stringify(facts, null, 2),
      '',
      'วิธีอ่าน payload:',
      '- dataProfile = โครงสร้างจริงของตารางที่ผู้ใช้อัปโหลด — ทุกคอลัมน์ ชนิดข้อมูล',
      '  ค่าสถิติที่คำนวณแล้ว (sum/avg/min/max/count) ช่วงวันที่ และตัวอย่างค่าหมวดหมู่',
      '  ใช้ส่วนนี้เป็นหลักในการตัดสินใจว่าอะไรควรเป็น KPI และอะไรควรเป็นกราฟ',
      '- kpis / trend / donut / ranked / statusRows / alerts = ข้อเสนอเบื้องต้น',
      '  จากระบบ ใช้ได้เลยถ้าเหมาะ แต่ไม่ต้องยึดติด ถ้าเห็นจาก dataProfile ว่ามีอย่างอื่น',
      '  ที่สำคัญกว่า ให้เลือกอย่างนั้นแทน',
      '',
      'กติกาการเลือกตัวเลข:',
      '- ใช้ได้เฉพาะตัวเลขที่ปรากฏใน payload นี้ (รวมค่าใน dataProfile.columns[].stats)',
      '  ห้ามคำนวณค่าใหม่ที่ไม่มีให้ ห้ามเดา ห้ามประมาณ',
      '- คอลัมน์ที่มี likelyIdentifier = true คือรหัส/เลขที่เอกสาร ไม่ใช่ค่าที่วัดได้',
      '  ห้ามเอามาทำ KPI แบบผลรวม (ถ้าจะใช้ ให้ใช้เป็นจำนวนรายการเท่านั้น)',
      '- คอลัมน์ที่มีฟิลด์ note: ชื่อคอลัมน์ในไฟล์ไม่น่าเชื่อถือ ให้ตั้งชื่อที่สื่อ',
      '  ความหมายเองจากค่าที่เห็น หรือถ้าเดาไม่ได้ให้ข้ามคอลัมน์นั้นไป',
      '  ห้ามแสดงชื่ออย่าง "column_12" หรือชื่อที่เป็นตัวเลขล้วนบนหน้าจอเด็ดขาด',
      '- คอลัมน์ type=category ใช้เป็นแกนจัดกลุ่ม · type=number ใช้เป็นค่าที่วัด',
      '  · type=date ใช้เป็นแกนเวลา',
      hasProfile
        ? '- ถ้า kpis/trend/donut ว่างเปล่า ให้สร้าง Dashboard จาก dataProfile เอง — ทุกไฟล์ต้องได้หน้าที่ใช้งานได้'
        : '- ถ้าข้อมูลบางส่วนขาด ให้ตัดส่วนนั้นออก อย่าเติมตัวเลขเอง',
      '',
      'ตอบกลับเป็นเอกสาร HTML สมบูรณ์เพียงอย่างเดียว เริ่มด้วย <!DOCTYPE html> และจบด้วย </html>'
    ].join('\n');
  }

  /* ── Request adapters ───────────────────────────────────────────────── */

  function buildRequest(cfg, facts) {
    var userPrompt = buildUserPrompt(facts);

    if (cfg.shape === 'anthropic') {
      return {
        url: cfg.endpoint,
        headers: {
          'content-type': 'application/json',
          'x-api-key': cfg.apiKey,
          'anthropic-version': '2023-06-01',
          // Required for calls made straight from a browser; without it the
          // API rejects the request rather than sending CORS headers.
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: {
          model: cfg.model,
          max_tokens: 32000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }]
        }
      };
    }

    if (cfg.shape === 'gemini') {
      var base = cfg.endpoint.replace(/\/+$/, '');
      // Key travels in a header, never in the query string.
      return {
        url: base + '/' + encodeURIComponent(cfg.model) + ':generateContent',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.apiKey },
        body: {
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 32000, temperature: 0.6 }
        }
      };
    }

    if (cfg.shape === 'supabase') {
      // The Edge Function owns the provider key and the prompt budget; we hand
      // it the same facts and let it call Anthropic server-side.
      return {
        url: cfg.endpoint,
        headers: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + cfg.apiKey,
          'apikey': cfg.apiKey
        },
        body: {
          action: 'dashboard-compose',
          runId: 'ai-page-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          payload: { model: cfg.model, system: SYSTEM_PROMPT, prompt: userPrompt, facts: facts }
        }
      };
    }

    // OpenAI-compatible (Groq / OpenRouter / DeepSeek / OpenAI / Mistral / xAI /
    // Cerebras / Together / custom)
    return {
      url: cfg.endpoint,
      headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: {
        model: cfg.model,
        max_tokens: 32000,
        temperature: 0.6,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ]
      }
    };
  }

  function extractText(cfg, data) {
    if (!data) return '';
    if (cfg.shape === 'supabase') {
      // The gateway wraps its answer in { result: ... }; accept either an
      // {html} envelope or a plain string so a gateway tweak doesn't break us.
      var r = data.result !== undefined ? data.result : data;
      if (typeof r === 'string') return r;
      return (r && (r.html || r.text)) || '';
    }
    if (cfg.shape === 'anthropic') {
      // Responses can lead with a thinking block, so take the first text block
      // rather than content[0].
      var blocks = data.content || [];
      for (var i = 0; i < blocks.length; i++) {
        if (blocks[i] && blocks[i].type === 'text' && blocks[i].text) return blocks[i].text;
      }
      return '';
    }
    if (cfg.shape === 'gemini') {
      var cand = (data.candidates || [])[0];
      var parts = (cand && cand.content && cand.content.parts) || [];
      return parts.map(function (p) { return p.text || ''; }).join('');
    }
    var choice = (data.choices || [])[0];
    return (choice && choice.message && choice.message.content) || '';
  }

  /** Pull the API's own error text out, whatever envelope it used. */
  function extractError(data, status) {
    var msg = data && (
      (data.error && (data.error.message || data.error)) ||
      data.message ||
      (data.detail && (data.detail.message || data.detail))
    );
    if (typeof msg === 'object') msg = JSON.stringify(msg);
    // Keep the status alongside the text. explainError classifies on both, and
    // a message like "Invalid JWT" carries no code of its own — without this
    // the 401 that identifies it is thrown away before anyone can use it.
    if (msg) return 'HTTP ' + status + ': ' + String(msg);
    return 'HTTP ' + status;
  }

  /* ── Output handling ────────────────────────────────────────────────── */

  // Models often wrap output in a fence even when told not to.
  function stripFences(text) {
    var t = String(text || '').trim();
    var m = t.match(/^```(?:html)?\s*\n([\s\S]*?)\n?```$/i);
    if (m) t = m[1].trim();
    var start = t.search(/<!doctype html|<html[\s>]/i);
    if (start > 0) t = t.slice(start);
    return t.trim();
  }

  var UNSAFE = [
    { re: /<script/i,        why: 'มี <script>' },
    { re: /\son\w+\s*=/i,    why: 'มี event handler (onclick ฯลฯ)' },
    { re: /javascript:/i,    why: 'มี javascript: URL' },
    { re: /<link[\s>]/i,     why: 'มี <link> ไปทรัพยากรภายนอก' },
    { re: /<iframe/i,        why: 'มี <iframe>' },
    { re: /<object[\s>]/i,   why: 'มี <object>' },
    { re: /<embed[\s>]/i,    why: 'มี <embed>' },
    { re: /@import/i,        why: 'มี @import' },
    // SVG/XML namespace declarations are the one benign http(s) string.
    { re: /https?:\/\/(?!www\.w3\.org)/i, why: 'มีการเรียกทรัพยากรจากภายนอก' }
  ];

  function isDocumentSafe(html) {
    if (typeof html !== 'string' || html.length < 200) return { ok: false, why: 'ผลลัพธ์สั้นผิดปกติ' };
    if (!/<html[\s>]/i.test(html)) return { ok: false, why: 'ไม่ใช่เอกสาร HTML สมบูรณ์' };
    for (var i = 0; i < UNSAFE.length; i++) {
      if (UNSAFE[i].re.test(html)) return { ok: false, why: UNSAFE[i].why };
    }
    return { ok: true };
  }

  /** Did the model actually use the numbers it was given? Advisory only. */
  function citesRealNumbers(html, facts) {
    var kpis = (facts && facts.kpis) || [];
    if (!kpis.length) return true;
    var digits = html.replace(/,/g, '');
    var hits = 0;
    kpis.forEach(function (k) {
      if (k.value == null) return;
      if (digits.indexOf(String(Math.round(k.value))) >= 0) hits++;
    });
    return hits >= Math.ceil(kpis.length * 0.5);
  }

  /* ── Main entry ─────────────────────────────────────────────────────── */

  /**
   * @param {Object} facts P6-safe aggregated facts
   * @returns {Promise<{ok:true, html, providerId, label, model, numbersVerified}
   *                  |{ok:false, reason}>}
   */
  /**
   * Turn a provider's raw error into one that says which key is wrong and
   * where to fix it.
   *
   * "invalid x-api-key" is Anthropic's wording and it arrives identically in
   * two completely different situations: the key typed into this browser is
   * bad (direct mode), or the ANTHROPIC_API_KEY secret on the Edge Function is
   * bad (gateway mode — our gateway relays Anthropic's message verbatim). The
   * user cannot tell those apart, so they end up guessing which of two keys to
   * re-check. Only this function knows which mode is in play, so it is the
   * only place that can say.
   */
  function explainError(cfg, message) {
    var m = String(message || '');
    var viaGateway = cfg.shape === 'supabase';

    // ORDER MATTERS. Supabase answers a rejected anon key with 401 "Invalid
    // JWT", and Anthropic answers a bad API key with 401 too. Testing for a
    // bare 401 first would blame the Edge Function's Anthropic secret for
    // what is actually a browser-side anon-key problem — the two keys the
    // user is already struggling to tell apart. JWT is the specific case, so
    // it is checked first.
    if (viaGateway && /invalid jwt|\bjwt\b|missing authorization/i.test(m)) {
      return 'Supabase ปฏิเสธ anon key ในหน้านี้ (ไม่เกี่ยวกับ ANTHROPIC_API_KEY) — ' +
             'ปิดสวิตช์ "Verify JWT" ที่ Edge Function หรือใช้ legacy anon key (ขึ้นต้น eyJ) แทน' + rawHint(m);
    }
    if (/invalid x-api-key|authentication_error|invalid_api_key|incorrect api key|\b401\b/i.test(m)) {
      return (viaGateway
        ? 'Supabase เรียก Anthropic ไม่ผ่าน เพราะ ANTHROPIC_API_KEY บนฝั่ง Edge Function ไม่ถูกต้อง ' +
          '(ไม่ใช่ anon key ในหน้านี้) → แก้ที่ Supabase → Edge Functions → Secrets ' +
          'ใส่ค่าที่ขึ้นต้นด้วย sk-ant- จาก console.anthropic.com'
        : 'API key ของ ' + cfg.label + ' ไม่ถูกต้อง — ตรวจว่าคัดลอกมาครบและยังไม่ถูกเพิกถอน ' +
          '(ของ Anthropic ต้องขึ้นต้น sk-ant- และมาจาก console.anthropic.com เท่านั้น ' +
          'สมาชิก claude.ai ใช้กับ API ไม่ได้)') + rawHint(m);
    }
    if (/credit balance|insufficient|quota|billing/i.test(m)) {
      return (viaGateway
        ? 'บัญชี Anthropic ที่ผูกกับ Edge Function ยังไม่มีเครดิต — เติมที่ console.anthropic.com → Billing'
        : 'บัญชี ' + cfg.label + ' ยังไม่มีเครดิตพอ — เติมเงินก่อนใช้งาน') + rawHint(m);
    }
    // "rate" as a bare substring matched inside gene*rate*d, ope*rate*,
    // sepa*rate* — any upstream sentence containing one of those was reported
    // as a rate limit. Match the actual phrases instead.
    if (/rate[ _-]?limit|429|overloaded|too many requests/i.test(m)) {
      return 'ผู้ให้บริการกำลังรับงานหนัก (rate limit) — รออีกสักครู่แล้วลองใหม่' + rawHint(m);
    }
    if (/not set on this function|ANTHROPIC_API_KEY/i.test(m)) {
      return 'Edge Function ยังไม่มี ANTHROPIC_API_KEY — เพิ่มที่ Supabase → Edge Functions → Secrets' + rawHint(m);
    }
    if (viaGateway && /404|not found|BOOT_ERROR|failed to load|worker/i.test(m)) {
      return 'เรียก Edge Function ตาม URL นี้ไม่เจอ หรือ Function บูตไม่ขึ้น — ' +
             'ตรวจว่าชื่อ Function ท้าย URL ตรงกับที่ deploy ไว้จริง และโค้ด deploy สำเร็จ' + rawHint(m);
    }
    if (viaGateway && /unsupported action|payload\.prompt/i.test(m)) {
      return 'Edge Function ที่ URL นี้ไม่ใช่ llm-gateway ของ iDash (มันไม่รู้จักคำสั่ง dashboard-compose) — ' +
             'วางโค้ดจาก _dev/supabase/functions/llm-gateway/index.ts ทับแล้ว Deploy ใหม่' + rawHint(m);
    }
    return m;
  }

  /**
   * Keeps the provider's own words visible after our interpretation. When the
   * classification above is wrong — and a substring match on someone else's
   * error text will sometimes be wrong — the untranslated message is the only
   * thing that lets anyone see what really happened instead of debugging our
   * guess about it.
   */
  function rawHint(m) {
    var s = String(m || '').trim();
    if (!s) return '';
    if (s.length > 160) s = s.slice(0, 160) + '…';
    return '  [ข้อความจากปลายทาง: ' + s + ']';
  }

  function generateDashboard(facts) {
    var problem = configProblem();
    if (problem) return Promise.resolve({ ok: false, reason: problem });

    var cfg = currentConfig();
    var req = buildRequest(cfg, facts);
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timedOut = false;
    var timer = controller ? setTimeout(function () { timedOut = true; controller.abort(); }, TIMEOUT) : null;

    return fetch(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(req.body),
      signal: controller ? controller.signal : undefined
    })
      .then(function (resp) {
        return resp.text().then(function (raw) {
          var data = null;
          try { data = JSON.parse(raw); } catch (e) {}
          if (!resp.ok) throw new Error(extractError(data, resp.status));
          if (!data) throw new Error('ตอบกลับมาไม่ใช่ JSON');
          return data;
        });
      })
      .then(function (data) {
        var html = stripFences(extractText(cfg, data));
        var safe = isDocumentSafe(html);
        if (!safe.ok) return { ok: false, reason: 'ผลลัพธ์ไม่ผ่านการตรวจความปลอดภัย — ' + safe.why };
        return {
          ok: true,
          html: html,
          providerId: cfg.providerId,
          label: cfg.label,
          model: cfg.model,
          numbersVerified: citesRealNumbers(html, facts)
        };
      })
      .catch(function (err) {
        if (timedOut) {
          return { ok: false, reason: 'ใช้เวลานานเกิน ' + Math.round(TIMEOUT / 1000) + ' วินาที' };
        }
        // fetch() rejects with a bare TypeError when the browser blocks the
        // response for CORS — the message never says so, hence the hint.
        if (err instanceof TypeError) {
          return {
            ok: false,
            reason: 'เชื่อมต่อ API ไม่สำเร็จ — ผู้ให้บริการรายนี้อาจไม่อนุญาตให้เรียกตรงจากเบราว์เซอร์ (CORS) หรือไม่มีอินเทอร์เน็ต'
          };
        }
        return { ok: false, reason: explainError(cfg, err.message) || 'เรียก API ไม่สำเร็จ' };
      })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  /**
   * Cheap round-trip that answers "is this configuration usable?" in a couple
   * of seconds. Uploading a file, waiting through the whole pipeline and
   * reading a failure at the end is a terrible way to learn that a key is
   * wrong — especially when the same message can mean two different keys.
   * Asks for 16 tokens, so a successful test costs a fraction of a satang.
   */
  function testConnection() {
    var problem = configProblem();
    if (problem) return Promise.resolve({ ok: false, reason: problem });

    var cfg = currentConfig();
    var req = buildRequest(cfg, { probe: true });
    // Replace the full dashboard request with a minimal one.
    if (cfg.shape === 'anthropic') {
      req.body = { model: cfg.model, max_tokens: 16, messages: [{ role: 'user', content: 'ping' }] };
    } else if (cfg.shape === 'gemini') {
      req.body = { contents: [{ role: 'user', parts: [{ text: 'ping' }] }], generationConfig: { maxOutputTokens: 16 } };
    } else if (cfg.shape === 'supabase') {
      req.body = {
        action: 'dashboard-compose',
        runId: 'probe-' + Date.now(),
        payload: { model: cfg.model, system: 'reply with the single word: pong', prompt: 'ping', facts: { probe: true } }
      };
    } else {
      req.body = { model: cfg.model, max_tokens: 16, messages: [{ role: 'user', content: 'ping' }] };
    }

    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 45000) : null;

    return fetch(req.url, {
      method: 'POST', headers: req.headers, body: JSON.stringify(req.body),
      signal: controller ? controller.signal : undefined
    })
      .then(function (resp) {
        return resp.text().then(function (raw) {
          var data = null;
          try { data = JSON.parse(raw); } catch (e) {}
          if (!resp.ok) throw new Error(extractError(data, resp.status));
          return { ok: true, label: cfg.label, model: cfg.model };
        });
      })
      .catch(function (err) {
        if (err instanceof TypeError) {
          return { ok: false, reason: 'ติดต่อปลายทางไม่ได้ — ตรวจ API URL และการเชื่อมต่ออินเทอร์เน็ต' };
        }
        return { ok: false, reason: explainError(cfg, err.message) };
      })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  window.iDashAIProviders = {
    PROVIDERS: PROVIDERS,
    loadSettings: loadSettings,
    currentConfig: currentConfig,
    setProviderConfig: setProviderConfig,
    configProblem: configProblem,
    generateDashboard: generateDashboard,
    testConnection: testConnection,
    // exposed for testing
    _isDocumentSafe: isDocumentSafe,
    _stripFences: stripFences
  };
})();
