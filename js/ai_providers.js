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
      // The gateway routes on the model's family prefix (claude-* / gemini-* /
      // gpt-*|o3*|o4*), so one endpoint reaches all three vendors. A model only
      // works once its vendor's secret is set on the function; picking one
      // without the secret returns a message naming the secret to add.
      models: [
        { id: 'claude-opus-4-8',   label: 'Claude Opus 4.8 — เก่งสุด แนะนำ',     tier: 'paid' },
        { id: 'claude-sonnet-5',   label: 'Claude Sonnet 5 — สมดุล',             tier: 'paid' },
        { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5 — เร็ว ถูกสุด',      tier: 'paid' },
        { id: 'gemini-2.5-pro',    label: 'Gemini 2.5 Pro — เก่งสุดของ Google',  tier: 'paid' },
        { id: 'gemini-2.5-flash',  label: 'Gemini 2.5 Flash — เร็ว โควตาฟรีเยอะ', tier: 'free' },
        { id: 'gemini-2.0-flash',  label: 'Gemini 2.0 Flash',                    tier: 'free' },
        { id: 'gpt-4o',            label: 'GPT-4o',                              tier: 'paid' },
        { id: 'gpt-4o-mini',       label: 'GPT-4o mini — ถูก',                   tier: 'paid' },
        { id: 'gpt-4.1',           label: 'GPT-4.1',                             tier: 'paid' },
        { id: 'o3-mini',           label: 'o3-mini — คิดลึก',                    tier: 'paid' }
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

  var SYSTEM_PROMPT = [
    'You are a senior dashboard designer. You output ONE complete, self-contained HTML document and nothing else.',
    '',
    'ABSOLUTE RULES — a response breaking any of these is discarded:',
    '1. Output raw HTML only. No markdown fences, no commentary, no JSON wrapper.',
    '2. NO JavaScript whatsoever. No <script>, no on* attributes, no javascript: URLs.',
    '3. NO external resources. No CDN links, no <link>, no @import, no web fonts,',
    '   no remote images, no http:// or https:// anywhere in the document.',
    '4. Draw every chart as INLINE SVG that you compute by hand from the numbers given.',
    '5. Use ONLY numbers present in the supplied facts. Never invent, extrapolate,',
    '   round differently, or add a metric that was not provided. If a fact is',
    '   missing, leave that element out entirely rather than filling it in.',
    '',
    'DESIGN BRIEF:',
    '- Thai-language UI. Keep every label exactly as supplied in the facts.',
    '- Modern business-dashboard look: KPI cards on top with a coloured icon badge',
    '  and direction-aware delta, then charts, then supporting tables.',
    '- Give each KPI card its own hue. Use colour to carry meaning (green = good,',
    '  red = bad) and never as decoration alone.',
    '- One measure per axis; never a dual-axis chart.',
    '- System font stack only. Responsive with CSS grid/flex; nothing may overflow',
    '  horizontally on a 1280px-wide viewport.',
    '- Aim for a page that looks designed, not generated: consistent spacing scale,',
    '  restrained borders, generous whitespace.'
  ].join('\n');

  function buildUserPrompt(facts) {
    return [
      'สร้างหน้า Dashboard จากข้อมูลจริงชุดนี้ (ตัวเลขทั้งหมดคำนวณมาแล้ว ห้ามแก้ค่า):',
      '',
      JSON.stringify(facts, null, 2),
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
          max_tokens: 16000,
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
          generationConfig: { maxOutputTokens: 16000, temperature: 0.6 }
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
        max_tokens: 16000,
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
    return msg ? String(msg) : ('HTTP ' + status);
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
        return { ok: false, reason: err.message || 'เรียก API ไม่สำเร็จ' };
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
    // exposed for testing
    _isDocumentSafe: isDocumentSafe,
    _stripFences: stripFences
  };
})();
