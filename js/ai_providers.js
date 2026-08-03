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
      defaultModel: 'claude-sonnet-5',
      keyHint: 'ใส่ anon key ของโปรเจกต์ (ปลอดภัยที่จะอยู่ฝั่งเบราว์เซอร์)',
      keyUrl: 'supabase.com/dashboard → Settings → API',
      needsEndpoint: true,
      endpointHint: 'https://<project>.supabase.co/functions/v1/llm-gateway',
      // Anthropic only, by user directive (2026-07-31). Keeping the gateway
      // single-vendor means one secret to manage (ANTHROPIC_API_KEY) and one
      // upstream to keep working. If you need Gemini or GPT, "ต่อ AI โดยตรง"
      // already covers them without the extra hop.
      // Every model is usable here now. The old ranking (Haiku only; Sonnet
      // and Opus killed at HTTP 546) measured a design where one worker had to
      // write the entire page in one invocation — Sonnet needed >120s for that
      // and got killed. generateSectioned replaced it: the page is written as
      // several short sections in parallel, so no single worker runs long
      // enough to be killed and the slower, better models are back on the
      // table. Speed now only affects how long the whole batch takes.
      models: [
        { id: 'claude-opus-4-8',   label: 'Claude Opus 4.8 — สวยที่สุด (ช้าสุด ~2-3 นาที)',  tier: 'paid' },
        { id: 'claude-sonnet-5',   label: 'Claude Sonnet 5 — สวยมาก สมดุลที่สุด (แนะนำ)',    tier: 'paid' },
        { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5 — เร็วที่สุด (~40 วิ) งานเรียบง่ายกว่า', tier: 'paid' }
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

  /* ── Sectioned composition (gateway mode) ───────────────────────────── */

  /**
   * A Supabase Edge Function holds the connection open for the whole
   * generation and the worker is killed (HTTP 546) if that takes too long.
   * That ceiling used to be paid for by shrinking the page — 8000 tokens,
   * Haiku only — which is exactly the wrong trade: it made the one mode that
   * keeps the Anthropic key off the browser also the mode that produces the
   * worst-looking dashboard.
   *
   * The ceiling is per invocation, not per dashboard. So the page is written
   * as five sections in five parallel invocations. No single worker runs long
   * enough to be killed, every model becomes usable again, and the total
   * budget (5 x 9000) is larger than the 32000 the direct-API mode gets in one
   * shot. Sections are independent requests, so one failing costs that band,
   * not the page.
   *
   * Consistency across parallel writers comes from DESIGN_TOKENS below: the
   * stylesheet is ours, fixed before any call goes out, and every section is
   * told to use those classes and variables. Left to agree among themselves,
   * five independent calls would produce five different-looking strips.
   */
  var SECTION_TOKENS = 9000;

  var SECTIONS = [
    {
      id: 'header',
      label: 'ส่วนหัว + KPI',
      brief: [
        'เขียนเฉพาะ (ก) แถบหัวเรื่อง และ (ข) แถว KPI',
        '- แถบหัว: ชื่อ Dashboard, ชื่อไฟล์ต้นทาง, บรรทัด "ข้อมูล ณ ..." (ใช้วันที่จาก facts เท่านั้น',
        '  ถ้าไม่มีให้เขียน "ข้อมูลจากไฟล์ <filename>") และถ้ามีช่วงเวลาใน trend ให้ระบุช่วงนั้น',
        '- แถว KPI: การ์ดไม่เกิน 6 ใบ จาก facts.kpis (ถ้าว่างให้เลือกเองจาก dataProfile)',
        '  แต่ละใบ: ไอคอนวงกลมมีสี, ป้ายชื่อ, ค่าตัวใหญ่พร้อมหน่วย, delta พร้อมชื่อฐานเปรียบเทียบ',
        '  และ sparkline เป็น inline SVG เมื่อมี series ให้',
        'ห้ามเขียนกราฟใหญ่ ตาราง หรือ footer ในส่วนนี้'
      ].join('\n')
    },
    {
      id: 'hero',
      label: 'กราฟหลัก',
      brief: [
        'เขียนเฉพาะแถวกราฟหลัก: กราฟเส้น/พื้นที่ตามเวลา (กว้างประมาณ 60%)',
        'วางคู่กับกราฟสัดส่วนหรือกราฟจัดอันดับ (กว้างประมาณ 40%) ในแถวเดียวกัน',
        'ใช้ facts.trend / facts.donut / facts.ranked เป็นหลัก',
        'ถ้าไม่มีแกนเวลาเลย ให้ใช้กราฟแท่งเรียงจากมากไปน้อยเป็นกราฟหลักแทน',
        'ทุกแกนต้องมีหน่วยกำกับ · ใต้กราฟเส้นต้องบอกช่วงเวลาที่ครอบคลุม',
        'ห้ามทำ KPI card ซ้ำ ห้ามทำตาราง'
      ].join('\n')
    },
    {
      id: 'breakdown',
      label: 'กราฟแยกย่อย',
      brief: [
        'เขียนเฉพาะกราฟรอง 2-3 ชิ้นที่อธิบายกราฟหลักให้ลึกขึ้น',
        'เลือกจากสิ่งที่ facts และ dataProfile มีจริง เช่น การกระจายตัว (histogram),',
        'เปรียบเทียบข้ามหมวดหมู่ (แท่งเรียงลำดับ), หรือสัดส่วนสะสม',
        'ถ้ามีข้อมูลพอทำได้แค่ชิ้นเดียว ให้ทำชิ้นเดียว อย่าเติมกราฟที่ไม่มีข้อมูลรองรับ',
        'ห้ามทำซ้ำกราฟที่อยู่ในแถวกราฟหลักแล้ว ห้ามทำ KPI card ห้ามทำ footer'
      ].join('\n')
    },
    {
      id: 'insight',
      label: 'พาเนลวิเคราะห์',
      brief: [
        'เขียนเฉพาะพาเนลวิเคราะห์: สถานะ/การแจ้งเตือน/ข้อค้นพบ',
        'ใช้ facts.alerts และ facts.statusRows เท่านั้น แสดงระดับความรุนแรงด้วยสีคู่กับข้อความเสมอ',
        'จัดชั้นให้ชัด: ข้อเท็จจริง → สิ่งที่ผิดปกติ → สิ่งที่ควรทำต่อ',
        'ถ้า facts.alerts และ facts.statusRows ว่างทั้งคู่ ให้ตอบกลับเป็น',
        'ความว่างเปล่า ไม่ต้องแต่งเนื้อหาขึ้นเอง (ตอบ <!--skip--> อย่างเดียว)',
        'ห้ามทำกราฟ ห้ามทำ KPI card'
      ].join('\n')
    },
    {
      id: 'detail',
      label: 'ตาราง + ท้ายหน้า',
      brief: [
        'เขียนเฉพาะ (ก) ตารางรายละเอียด และ (ข) footer',
        '- ตาราง: จาก facts.statusRows หรือ facts.ranked หัวตารางติดอยู่กับที่ แถวสลับสี',
        '  ค่าตัวเลขชิดขวาและใช้ตัวเลขความกว้างเท่ากัน สถานะแสดงเป็น pill มีสี',
        '  ถ้าไม่มีข้อมูลตารางจริง ให้ข้ามตารางไป',
        '- footer: "สร้างโดย iDash · ตัวเลขทั้งหมดคำนวณจากไฟล์ของผู้ใช้" ตามด้วยบรรทัด ข้อมูล ณ ...',
        'ห้ามทำกราฟ ห้ามทำ KPI card'
      ].join('\n')
    }
  ];

  /**
   * The page's visual system, decided here rather than by the model. Five
   * parallel writers cannot agree on a palette between themselves, so they are
   * handed one. It also means the accent follows the dashboard's own theme
   * instead of whatever hue the model felt like.
   */
  // Deep, professional hues only — each one still leaves green/amber/red free
  // to mean good/warning/bad, which a lighter or warmer accent would muddy.
  var ACCENTS = ['#2563eb', '#0f766e', '#7c3aed', '#0369a1', '#b45309', '#be123c', '#15803d', '#4338ca'];

  function designTokens(facts) {
    var accent;
    if (facts && facts.theme && /^#[0-9a-f]{6}$/i.test(facts.theme.accent)) {
      accent = facts.theme.accent;
    } else {
      // Keyed on the business domain, not on chance: the same kind of data
      // wears the same colour every time (P5 — no random design choices), and
      // two different domains do not both come out generic blue.
      var seed = String((facts && facts.domainNameTH) || '') + '|' +
                 String((facts && facts.dashboardTitle) || '');
      var h = 0;
      for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000;
      accent = ACCENTS[h % ACCENTS.length];
    }
    return {
      accent: accent,
      css: [
        ':root{',
        '  --accent:' + accent + ';',
        '  --ink:#0f1b2d; --ink-2:#42536b; --ink-3:#7c8ba1;',
        '  --bg:#eef2f9; --card:#ffffff; --line:#e3eaf6;',
        '  --good:#12a86a; --warn:#f0a91c; --bad:#e5484d;',
        '  --r-sm:10px; --r-md:14px; --r-lg:20px;',
        '  --sh-1:0 1px 2px rgba(16,40,90,.05),0 6px 20px -6px rgba(16,40,90,.10);',
        '  --sh-2:0 2px 6px rgba(16,40,90,.07),0 18px 40px -14px rgba(16,40,90,.18);',
        '  --s-1:6px; --s-2:12px; --s-3:20px; --s-4:32px;',
        '}',
        '*{box-sizing:border-box}',
        'body{margin:0;background:',
        '  radial-gradient(1100px 520px at 12% -8%,color-mix(in srgb,var(--accent) 14%,transparent),transparent 60%),',
        '  radial-gradient(900px 460px at 88% 0%,color-mix(in srgb,var(--accent) 8%,transparent),transparent 55%),',
        '  var(--bg);',
        '  color:var(--ink);font-family:"IBM Plex Sans Thai",Inter,system-ui,-apple-system,"Segoe UI",sans-serif;',
        '  font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}',
        '.wrap{max-width:1280px;margin:0 auto;padding:var(--s-4) var(--s-3) var(--s-4)}',
        '.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r-md);',
        '  box-shadow:var(--sh-1);padding:var(--s-3);overflow:hidden}',
        '.card-hd{font-size:12px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;',
        '  color:var(--ink-3);margin:0 0 var(--s-2)}',
        '.row{display:grid;gap:var(--s-3);margin-bottom:var(--s-3)}',
        '.kpis{display:grid;gap:var(--s-2);grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin-bottom:var(--s-3)}',
        '.hero{grid-template-columns:1.6fr 1fr}',
        '.split{grid-template-columns:1fr 1fr}',
        '.num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}',
        '.big{font-size:30px;font-weight:800;letter-spacing:-.02em}',
        '.unit{font-size:12px;font-weight:600;color:var(--ink-3);margin-left:4px}',
        '.muted{color:var(--ink-3);font-size:12px}',
        '.up{color:var(--good)} .down{color:var(--bad)} .flat{color:var(--ink-3)}',
        '.pill{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;',
        '  border-radius:999px;padding:2px 9px}',
        '.pill.ok{background:#e6f7ef;color:#0b7a4d} .pill.warn{background:#fdf3dd;color:#8a6100}',
        '.pill.bad{background:#fdeaea;color:#a51f24}',
        'table{width:100%;border-collapse:collapse;font-size:13px}',
        'th{position:sticky;top:0;background:var(--card);text-align:left;font-size:11px;',
        '  letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);',
        '  padding:8px 10px;border-bottom:1px solid var(--line)}',
        'td{padding:8px 10px;border-bottom:1px solid var(--line)}',
        'tbody tr:nth-child(even){background:#fafcff}',
        'td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}',
        '.foot{color:var(--ink-3);font-size:12px;text-align:center;padding:var(--s-3) 0 0;',
        '  border-top:1px solid var(--line);margin-top:var(--s-3)}',
        '@media(max-width:900px){.hero,.split{grid-template-columns:1fr}}'
      ].join('\n')
    };
  }

  function sectionSystemPrompt(tokens) {
    return [
      'You are a senior dashboard architect writing ONE SECTION of a larger Thai-language dashboard page.',
      'Other sections are being written in parallel by your colleagues against the same stylesheet.',
      '',
      'ABSOLUTE RULES — a response breaking any of these is discarded:',
      '1. Output an HTML FRAGMENT only. No <!DOCTYPE>, no <html>, <head> or <body>.',
      '   No markdown fences, no commentary. Start with a tag, end with a tag.',
      '2. NO JavaScript whatsoever. No <script>, no on* attributes, no javascript: URLs.',
      '3. NO external resources — no <link>, no @import, no web fonts, no remote images,',
      '   no http:// or https:// anywhere except the SVG namespace on <svg> elements.',
      '4. Draw every chart as INLINE SVG computed by hand from the numbers given.',
      '5. Use ONLY numbers present in the payload (including dataProfile.columns[].stats).',
      '   Never invent, extrapolate or derive a figure that was not given. A missing',
      '   fact means the element is left out, never filled in.',
      '6. Write ONLY the section you were asked for. Anything belonging to another',
      '   section is a duplicate on the finished page.',
      '',
      'THE STYLESHEET IS ALREADY WRITTEN AND LOADED. Use its classes and variables:',
      '  layout   .wrap .row .hero .split .kpis .card .card-hd',
      '  numbers  .num .big .unit .muted .up .down .flat',
      '  state    .pill.ok .pill.warn .pill.bad',
      '  tokens   var(--accent) --ink --ink-2 --ink-3 --card --line --good --warn --bad',
      '           --r-sm/--r-md/--r-lg  --sh-1/--sh-2  --s-1..--s-4',
      'The accent hue for this page is ' + tokens.accent + ' — build chart series as tints of it.',
      'You may add ONE <style> block for rules unique to your section, but every',
      'selector in it MUST be prefixed with your section id class so it cannot',
      'collide with a colleague\'s. Never redefine :root, body, table, th or td.',
      '',
      'CONTEXT RULES (numbers without context get misread):',
      '- Every number carries its unit. No unit supplied = label the aggregation',
      '  instead (รวม / เฉลี่ย / จำนวน).',
      '- Every delta names its baseline visibly beside the value. No baseline in the',
      '  facts = no delta shown at all.',
      '- Colour by business meaning, never by arithmetic sign: for cost / downtime /',
      '  defect / waste metrics a DECREASE is good. Two-sided metrics (pH-like) get',
      '  no good/bad arrow unless a target is supplied.',
      '- Never signal with colour alone — pair it with an arrow or text.',
      '',
      'CHART RULES:',
      '- One measure per axis. NEVER a dual-axis chart.',
      '- Part-to-whole with 4+ categories: horizontal bar ranked largest-first.',
      '  Donut only for 2-3 parts, with the total in the centre. Never negatives in a donut.',
      '- Bars sorted descending unless the category order is chronological.',
      '- Rounded bar caps, gradient fills under area/line, gridlines at ~8% opacity,',
      '  direct value labels, legend only when 2+ series.',
      '',
      'QUALITY BAR — this is a flagship product surface. Spend the effort: real depth',
      'on cards, a deliberate type hierarchy (oversized bold values, small tracked',
      'labels, quiet secondary text), generous whitespace, nothing cramped and nothing',
      'floating alone in a big empty card. Nothing may overflow horizontally at 1280px.',
      'Finish every element you start and close every tag.'
    ].join('\n');
  }

  function sectionUserPrompt(section, facts) {
    return [
      'สร้าง "' + section.label + '" ของหน้า Dashboard นี้',
      '',
      'ขอบเขตของส่วนนี้:',
      section.brief,
      '',
      'ข้อมูลทั้งหมดที่ใช้ได้ (ใช้เฉพาะตัวเลขในนี้เท่านั้น):',
      JSON.stringify(facts, null, 2),
      '',
      'วิธีอ่าน payload:',
      '- dataProfile = โครงสร้างจริงของตารางที่ผู้ใช้อัปโหลด ทุกคอลัมน์ ชนิดข้อมูล',
      '  ค่าสถิติที่คำนวณแล้ว ช่วงวันที่ และตัวอย่างค่าหมวดหมู่',
      '- kpis / trend / donut / ranked / statusRows / alerts = ข้อเสนอจากระบบ',
      '  ใช้ได้เลยถ้าเหมาะ ถ้าเห็นจาก dataProfile ว่ามีอย่างอื่นสำคัญกว่าให้เลือกอย่างนั้น',
      '- คอลัมน์ที่ likelyIdentifier = true คือรหัส/เลขที่เอกสาร ห้ามเอามารวมเป็น KPI',
      '- คอลัมน์ที่มี note: ชื่อในไฟล์ไม่น่าเชื่อถือ ให้ตั้งชื่อที่สื่อความหมายเองจากค่าที่เห็น',
      '  ห้ามแสดงชื่ออย่าง "column_12" บนหน้าจอเด็ดขาด',
      '',
      'ตอบกลับเป็น HTML fragment ของส่วนนี้เท่านั้น ไม่มีคำอธิบายใดๆ'
    ].join('\n');
  }

  /** One section = one Edge Function invocation, so none of them runs long. */
  function requestSection(cfg, section, facts, tokens) {
    var body = {
      action: 'dashboard-section',
      runId: 'ai-sec-' + section.id + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      payload: {
        model: cfg.model,
        system: sectionSystemPrompt(tokens),
        prompt: sectionUserPrompt(section, facts),
        facts: facts,
        maxTokens: SECTION_TOKENS
      }
    };
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, TIMEOUT) : null;

    return fetch(cfg.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + cfg.apiKey,
        'apikey': cfg.apiKey
      },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    })
      .then(function (resp) {
        return resp.text().then(function (raw) {
          var data = null;
          try { data = JSON.parse(raw); } catch (e) {}
          if (!resp.ok) throw new Error(extractError(data, resp.status));
          var r = (data && data.result) || {};
          return { id: section.id, html: stripFences(typeof r === 'string' ? r : r.html) };
        });
      })
      .catch(function (err) {
        return { id: section.id, html: '', error: err && err.message ? err.message : String(err) };
      })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  /** Fragment rules are the inverse of a document's: it must NOT be one. */
  function isFragmentSafe(html) {
    if (typeof html !== 'string' || html.length < 80) return { ok: false, why: 'สั้นผิดปกติ' };
    if (/<!doctype|<html[\s>]|<body[\s>]|<head[\s>]/i.test(html)) {
      return { ok: false, why: 'ส่งเอกสารเต็มมาแทนที่จะเป็นชิ้นส่วน' };
    }
    for (var i = 0; i < UNSAFE.length; i++) {
      if (UNSAFE[i].re.test(html)) return { ok: false, why: UNSAFE[i].why };
    }
    return { ok: true };
  }

  function generateSectioned(cfg, facts, onProgress) {
    var tokens = designTokens(facts);
    var done = 0;
    var report = function () {
      if (typeof onProgress === 'function') onProgress(done, SECTIONS.length);
    };

    return Promise.all(SECTIONS.map(function (s) {
      return requestSection(cfg, s, facts, tokens).then(function (r) {
        done++; report();
        return r;
      });
    })).then(function (parts) {
      var kept = [];
      var dropped = [];
      parts.forEach(function (p) {
        // A section with nothing to say answers <!--skip-->, which is a correct
        // outcome rather than a failure — the insight panel is told to do
        // exactly that when no alerts exist. Not the same as an error.
        if (!p.html || /^<!--\s*skip\s*-->$/i.test(p.html.trim())) {
          if (p.error) dropped.push(p.id + ': ' + p.error);
          return;
        }
        var safe = isFragmentSafe(p.html);
        if (!safe.ok) { dropped.push(p.id + ': ' + safe.why); return; }
        kept.push(p);
      });

      // The header carries the title and the KPI row. Without it the rest is a
      // pile of charts with nothing naming what they are, so that is a failed
      // page rather than a thin one — fall back to the deterministic render.
      var hasHeader = kept.some(function (p) { return p.id === 'header'; });
      if (!hasHeader || kept.length < 2) {
        return {
          ok: false,
          reason: 'AI สร้างหน้าไม่ครบ (ได้ ' + kept.length + '/' + SECTIONS.length + ' ส่วน)' +
                  (dropped.length ? ' — ' + explainError(cfg, dropped[0]) : '')
        };
      }

      var html = [
        '<!DOCTYPE html>',
        '<html lang="th"><head><meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        '<title>Dashboard — iDash</title>',
        '<style>\n' + tokens.css + '\n</style>',
        '</head><body><div class="wrap">',
        kept.map(function (p) { return p.html; }).join('\n'),
        '</div></body></html>'
      ].join('\n');

      return {
        ok: true,
        html: html,
        providerId: cfg.providerId,
        label: cfg.label,
        model: cfg.model,
        numbersVerified: citesRealNumbers(html, facts),
        sections: kept.length,
        sectionsDropped: dropped
      };
    });
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
    // Supabase's own code for "the worker was killed for using too much".
    // Nothing about the user's keys is wrong here, so say so plainly rather
    // than sending them back to re-check credentials that are already fine.
    if (/\b546\b|not having enough compute|compute resources|WORKER_LIMIT|resource limit/i.test(m)) {
      return 'Supabase Edge Function ถูกตัดกลางคัน (ไม่ใช่ปัญหาของ key) — ' +
             'gateway ที่ deploy อยู่เป็นเวอร์ชันเก่าที่เขียนทั้งหน้าในครั้งเดียว ' +
             'ให้วางโค้ดจาก _dev/supabase/functions/llm-gateway/index.ts ทับแล้ว Deploy ใหม่ ' +
             '(เวอร์ชันใหม่แบ่งหน้าเป็นหลายส่วน ทำให้แต่ละครั้งสั้นพอที่จะไม่โดนตัด)' + rawHint(m);
    }
    if (viaGateway && /504|timed out|timeout/i.test(m)) {
      return 'Edge Function รอ Anthropic นานเกินกำหนด — ลองโมเดลที่เร็วกว่า (Sonnet 5 / Haiku 4.5) ' +
             'หรือใช้โหมด "ต่อ AI โดยตรง"' + rawHint(m);
    }
    if (viaGateway && /404|not found|BOOT_ERROR|failed to load|worker/i.test(m)) {
      return 'เรียก Edge Function ตาม URL นี้ไม่เจอ หรือ Function บูตไม่ขึ้น — ' +
             'ตรวจว่าชื่อ Function ท้าย URL ตรงกับที่ deploy ไว้จริง และโค้ด deploy สำเร็จ' + rawHint(m);
    }
    if (viaGateway && /unsupported action|payload\.prompt/i.test(m)) {
      return 'Edge Function ที่ URL นี้ไม่รู้จักคำสั่ง dashboard-section — เป็น gateway เวอร์ชันเก่า ' +
             'วางโค้ดจาก _dev/supabase/functions/llm-gateway/index.ts ทับแล้ว Deploy ใหม่' + rawHint(m);
    }
    // The old gateway validated every reply as a whole document, so a section
    // fragment fails its check. Naming the cause beats leaving the user to
    // wonder what the model did wrong — it did nothing wrong.
    if (viaGateway && /not a complete HTML document/i.test(m)) {
      return 'Edge Function เป็นเวอร์ชันเก่าที่ยอมรับเฉพาะหน้าเต็ม จึงปฏิเสธชิ้นส่วนที่ระบบส่งไป — ' +
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

  function generateDashboard(facts, onProgress) {
    var problem = configProblem();
    if (problem) return Promise.resolve({ ok: false, reason: problem });

    var cfg = currentConfig();
    // Gateway mode writes the page in parallel sections; see generateSectioned
    // for why. Direct mode has no worker between the browser and Anthropic, so
    // it keeps the single 32000-token call.
    if (cfg.shape === 'supabase') {
      return generateSectioned(cfg, facts, onProgress)
        .catch(function (err) {
          return { ok: false, reason: explainError(cfg, err && err.message) || 'เรียก API ไม่สำเร็จ' };
        });
    }
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
          if (!resp.ok) {
            var msg = extractError(data, resp.status);
            // The gateway only speaks dashboard-compose and validates its
            // output as a full HTML page, so a 16-token probe reply is
            // legitimately "too short to be a page". Reaching that check is
            // itself the proof this test wants: the anon key was accepted, the
            // function was found, ANTHROPIC_API_KEY was read, and Anthropic
            // answered. Failing the connection test on it would report a
            // working setup as broken — which it did.
            if (cfg.shape === 'supabase' && /generated page rejected|too short to be a page|model returned no text/i.test(msg)) {
              return { ok: true, label: cfg.label, model: cfg.model, note: 'ครบทั้งเส้นทาง: Supabase → Anthropic' };
            }
            throw new Error(msg);
          }
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
