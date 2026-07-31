/**
 * iDash AI Layout Composer — prototype 4th LLM call site (doc D18 exception,
 * scoped to this experimental path only — the main ①-⑨ pipeline's ≤3-call
 * budget is untouched, this uses its own runId).
 *
 * Explicitly opt-in: only fires when the user clicks "AI Layout (ทดลอง)" in
 * infographic.html. Never runs automatically, never replaces the
 * deterministic infographic as the default output.
 *
 * P6: only pre-aggregated facts (KPI values, series, group breakdowns,
 * status rows, alerts) go to the LLM — never the raw detail table. Those
 * facts are the SAME numbers the deterministic renderer already computed
 * from dashboardSpec; this module doesn't touch the source dataset.
 *
 * Safety: the gateway is instructed to return an HTML fragment (no
 * <script>, no external URLs) inside a JSON envelope; this module runs a
 * second, independent check before ever handing the string to the DOM, and
 * the caller renders it inside a fully sandboxed iframe (sandbox="") as a
 * second, unconditional layer — belt and suspenders.
 */
(function () {
  'use strict';

  var GATEWAY_URL = null;
  var ANON_KEY = null;
  // Claude generation can legitimately take 20-40s under a rich payload,
  // but with no client timeout a stalled network/gateway call spins the
  // loading overlay forever with no fallback. Raised 45s → 100s when
  // dashboard-compose moved back to Sonnet (2026-07-20 demo directive):
  // a cold Edge Function + Sonnet at 8000 max_tokens was observed blowing
  // past 45s and silently falling back to DET — which would look like "AI
  // doesn't work" in a demo. Deterministic fallback still kicks in after.
  var REQUEST_TIMEOUT_MS = 100000;

  function configure(opts) {
    if (opts && opts.gatewayUrl) GATEWAY_URL = opts.gatewayUrl;
    if (opts && opts.anonKey) ANON_KEY = opts.anonKey;
  }

  // Returns { result, timedOut } so callers can decide whether retrying is
  // worth it — a stall is likely to stall again, so a timed-out attempt
  // should fail straight to the deterministic fallback instead of doubling
  // the user's wait with an equally-likely-to-hang retry.
  function callGateway(action, payload, runId) {
    if (!GATEWAY_URL) return Promise.resolve({ result: null, timedOut: false });
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var didTimeout = false;
    var timeoutId = controller ? setTimeout(function () { didTimeout = true; controller.abort(); }, REQUEST_TIMEOUT_MS) : null;
    return fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ANON_KEY,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({ action: action, payload: payload, runId: runId }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (resp) { return resp.ok ? resp.json() : null; })
      .then(function (data) { return { result: (data && data.result) ? data.result : null, timedOut: false }; })
      .catch(function () { return { result: null, timedOut: didTimeout }; })
      .finally(function () { if (timeoutId) clearTimeout(timeoutId); });
  }

  // ── Extract P6-safe facts from the already-computed dashboardSpec ──
  // Mirrors infographic_renderer.js's gene-collection logic but keeps only
  // aggregated values — no per-row detail table is ever included here.
  /* ── Data-quality gate ────────────────────────────────────────────────
   * The AI renders faithfully whatever facts it is handed, so anything
   * meaningless that reaches it comes back rendered beautifully and
   * meaninglessly. Two junk shapes actually shipped to users:
   *
   *   "ผลรวม — column_12"   profiler names a blank header cell column_N;
   *                          summing it produces a number about nothing.
   *   bar labels "1275.2346861714814", "0", "-"
   *                          a numeric column used as a grouping dimension —
   *                          those are measurements, not categories.
   *
   * Both are filtered here rather than in the prompt: a prompt asks the model
   * to please ignore bad input, a gate means the bad input never arrives.
   */
  var PLACEHOLDER_NAME = /^(column_\d+|col_?\d+|unnamed[:_ ]?\d*|field_?\d+|_\d+)$/i;

  function isMeaningfulName(name) {
    var s = String(name == null ? '' : name).trim();
    if (!s) return false;
    if (PLACEHOLDER_NAME.test(s)) return false;
    // "ผลรวม — column_12" / "จำนวน — Unnamed: 3": the junk hides behind a
    // generated prefix, so test the part after the separator too.
    var tail = s.split(/[—–-]\s*/).pop().trim();
    if (tail && PLACEHOLDER_NAME.test(tail)) return false;
    return true;
  }

  /** A dimension whose labels are numbers isn't a dimension. */
  function looksLikeRealCategories(groups) {
    if (!groups || groups.length === 0) return false;
    var numericLabels = 0, usable = 0;
    groups.forEach(function (g) {
      var label = String(g.name == null ? '' : g.name).trim();
      if (!label || label === '-' || label === '0') return;
      usable++;
      if (!isNaN(Number(label.replace(/,/g, '')))) numericLabels++;
    });
    if (usable < 2) return false;
    return numericLabels / usable < 0.5;
  }

  function buildFactsPayload(spec, meta) {
    var kpis = [];
    var trend = null;
    var donut = null;
    var ranked = null;
    var statusRows = [];
    var alerts = [];

    if (spec && spec.pages) {
      spec.pages.forEach(function (page) {
        (page.sections || []).forEach(function (sec) {
          (sec.widgets || []).forEach(function (w) {
            var gid = w.geneId || '';
            if (gid === 'gene.kpi_card_trend' || gid === 'gene.kpi_card_static' || gid === 'gene.highlight_card') {
              kpis.push({
                name: w.nameTH || w.kpiId,
                value: w.value,
                format: w.format,
                deltaPct: w.deltaPct != null ? w.deltaPct : null
              });
            } else if (!trend && (gid === 'gene.trend_line' || gid === 'gene.multi_line')) {
              if (w.periods && w.parts) {
                trend = { title: w.nameTH, periods: w.periods, series: w.parts.map(function (p) { return { name: p.name, values: p.values }; }) };
              } else if (w.series) {
                trend = { title: w.nameTH, periods: w.series.map(function (s) { return s.period || s.label; }), series: [{ name: w.nameTH, values: w.series.map(function (s) { return s.value; }) }] };
              }
            } else if (!donut && gid === 'gene.donut') {
              donut = { title: w.nameTH, groups: (w.groups || []).slice(0, 6).map(function (g) { return { name: g.group || g.name, value: g.value }; }) };
            } else if (!ranked && gid === 'gene.ranking_hbar') {
              ranked = { title: w.nameTH, groups: (w.groups || []).slice(0, 8).map(function (g) { return { name: g.group || g.name, value: g.value }; }) };
            } else if (gid === 'gene.kpi_status_table') {
              statusRows = (w.rows || []).map(function (r) { return { name: r.nameTH, value: r.value, format: r.format, status: r.status, deltaPct: r.deltaPct }; });
            } else if (gid === 'gene.alert_feed') {
              // "info"-severity items are data-gap transparency notes (P3
              // reasoning ledger material — "we couldn't answer X") rather
              // than real alerts. Sending them made the AI render "no data
              // yet" banners as the FIRST thing on screen, above the KPI
              // row — the opposite of professional. Real alerts only.
              alerts = (w.items || []).filter(function (a) { return a.severity !== 'info'; })
                .map(function (a) { return { severity: a.severity, message: a.message }; });
            }
          });
        });
      });
    }

    var domainName = (meta && meta.domainNameTH) || '';
    var dashboardTitle = (window.iDashInfographic && window.iDashInfographic.resolveDashboardTitle)
      ? window.iDashInfographic.resolveDashboardTitle(meta, domainName)
      : ((meta && meta.filename) || domainName);

    // Apply the gate to everything before it leaves the browser.
    kpis = kpis.filter(function (k) { return isMeaningfulName(k.name) && k.value != null; });
    statusRows = statusRows.filter(function (r) { return isMeaningfulName(r.name); });
    if (donut && !looksLikeRealCategories(donut.groups)) donut = null;
    if (ranked && !looksLikeRealCategories(ranked.groups)) ranked = null;
    if (trend && !isMeaningfulName(trend.title)) {
      trend.series = (trend.series || []).filter(function (s) { return isMeaningfulName(s.name); });
      if (trend.series.length === 0) trend = null;
    }

    return {
      dashboardTitle: dashboardTitle,
      domainNameTH: domainName,
      filename: (meta && meta.filename) || '',
      kpis: kpis.slice(0, 6),
      trend: trend,
      donut: donut,
      ranked: ranked,
      statusRows: statusRows.slice(0, 6),
      alerts: alerts.slice(0, 4)
    };
  }

  /**
   * Is there enough here to be worth an AI call? Sending a payload with one
   * unnamed number produces a confident-looking page about nothing and bills
   * the user for it — better to say so and let the deterministic renderer,
   * which shows its own data-gap notes honestly, handle the file.
   */
  function factsAreSubstantial(facts) {
    var visuals = (facts.trend ? 1 : 0) + (facts.donut ? 1 : 0) + (facts.ranked ? 1 : 0);
    return facts.kpis.length >= 2 || (facts.kpis.length >= 1 && visuals >= 1) || visuals >= 2;
  }

  // ── Post-generation safety check — independent of the gateway's own ──
  var UNSAFE_PATTERNS = [
    /<script/i, /on\w+\s*=/i, /javascript:/i, /<link/i, /<iframe/i,
    /<object/i, /<embed/i, /@import/i, /https?:\/\//i, /<!doctype/i, /<html/i, /<body/i
  ];

  function isHtmlSafe(html) {
    if (typeof html !== 'string' || html.length === 0) return false;
    for (var i = 0; i < UNSAFE_PATTERNS.length; i++) {
      if (UNSAFE_PATTERNS[i].test(html)) return false;
    }
    return true;
  }

  // Best-effort citation check: every KPI value the AI was given should
  // appear verbatim somewhere in its output. Doesn't block on failure
  // (formatting differences are expected) — only used to flag the badge.
  function citesRealNumbers(html, facts) {
    if (!facts.kpis || facts.kpis.length === 0) return true;
    // Strip thousands separators from both sides before comparing — the AI
    // is expected (and told) to comma-format currency, so a literal digit
    // match must ignore commas or every correctly-formatted number false-flags.
    var htmlDigits = html.replace(/,/g, '');
    var hits = 0;
    facts.kpis.forEach(function (k) {
      if (k.value == null) return;
      var raw = String(Math.round(k.value));
      if (htmlDigits.indexOf(raw) >= 0) hits++;
    });
    return hits >= Math.ceil(facts.kpis.length * 0.5);
  }

  /**
   * @param {Object} spec - dashboardSpec (from sessionStorage idash.dashboardSpec)
   * @param {Object} meta - dashboardMeta (from sessionStorage idash.dashboardMeta),
   *   may carry meta.referenceTemplate ({id, title, category, fullText}) set
   *   by the 45-style picker (see reference_template_library.js) — when
   *   present it becomes the PRIMARY layout/color directive sent to the
   *   gateway, taking priority over the generic style-token library.
   * @param {Object} [opts] - { autopilot: boolean, forceRandom: boolean, excludeStyleId: string }
   *   forceRandom: pick a fresh random style regardless of autopilot (used by
   *   the "Regenerate" action — same data, deliberately different layout).
   *   excludeStyleId: avoid repeating the immediately-previous style when
   *   forceRandom is set and the module has more than one style to offer.
   * @returns {Promise<{ok:true, html, styleId, styleName, numbersVerified}|{ok:false, reason}>}
   */
  function composeWithAI(spec, meta, opts) {
    opts = opts || {};
    if (!window.iDashPromptLibrary) return Promise.resolve({ ok: false, reason: 'prompt library not loaded' });
    if (!GATEWAY_URL) return Promise.resolve({ ok: false, reason: 'LLM gateway not configured' });

    var domainId = (meta && meta.domainId) || 'generic_business';
    var lib = window.iDashPromptLibrary;
    var styleId;
    if (opts.styleId && lib.STYLE_TOKENS[opts.styleId]) {
      // Pinned style — used by the timeout-retry path so the retried payload
      // is byte-identical to the first attempt and hits the gateway cache.
      styleId = opts.styleId;
    } else if (opts.forceRandom) {
      var ids = (lib.MODULE_STYLE_MAP[domainId] || Object.keys(lib.STYLE_TOKENS)).slice();
      if (opts.excludeStyleId && ids.length > 1) ids = ids.filter(function (id) { return id !== opts.excludeStyleId; });
      styleId = ids[Math.floor(Math.random() * ids.length)];
    } else {
      styleId = opts.autopilot ? lib.pickStyleForAutopilot(domainId) : lib.pickStyleForModule(domainId, spec && spec._dataset);
    }
    var styleTokens = lib.getStyleTokens(styleId);
    var moduleCtx = lib.getModuleContext(domainId);
    var facts = buildFactsPayload(spec, meta);
    if (!factsAreSubstantial(facts)) {
      return Promise.resolve({
        ok: false,
        reason: 'ข้อมูลในไฟล์นี้ยังไม่พอให้ AI ออกแบบได้ — หัวตารางบางคอลัมน์ว่าง ' +
                'หรือยังไม่พบคอลัมน์หมวดหมู่ที่ใช้จัดกลุ่มได้ ' +
                'กรุณาตรวจว่าแถวหัวตารางมีชื่อครบทุกคอลัมน์ แล้วลองใหม่ ' +
                '(ระหว่างนี้เลือก "สร้างจาก Template" จะได้ Dashboard จากตัวเลขจริงทันที)'
      });
    }

    var referenceTemplate = opts.referenceTemplate || (meta && meta.referenceTemplate) || null;

    var payload = {
      moduleId: domainId,
      moduleNameTH: moduleCtx.nameTH,
      vocabulary: moduleCtx.vocabulary,
      widgetPreset: moduleCtx.widgetPreset,
      styleId: styleId,
      styleTokens: styleTokens,
      facts: facts,
      referenceLayoutPrompt: referenceTemplate ? referenceTemplate.fullText : null,
      referenceLayoutTitle: referenceTemplate ? referenceTemplate.title : null
    };

    var runId = 'ai-layout-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

    return callGateway('dashboard-compose', payload, runId).then(function (outcome) {
      var result = outcome.result;
      if (!result || typeof result.html !== 'string') {
        return {
          ok: false,
          timedOut: outcome.timedOut,
          styleId: styleId,
          reason: outcome.timedOut
            ? 'ใช้เวลานานเกินไป (เกิน ' + Math.round(REQUEST_TIMEOUT_MS / 1000) + ' วินาที)'
            : 'gateway returned no HTML (fell through to DET-only mode or an error)'
        };
      }
      if (!isHtmlSafe(result.html)) {
        return { ok: false, timedOut: false, reason: 'AI output failed the safety check (script/external-resource pattern found) — discarded' };
      }
      return {
        ok: true,
        html: result.html,
        styleId: styleId,
        styleName: referenceTemplate ? referenceTemplate.title : styleTokens.name,
        referenceTemplate: referenceTemplate ? { id: referenceTemplate.id, title: referenceTemplate.title } : null,
        numbersVerified: citesRealNumbers(result.html, facts)
      };
    });
  }

  // ── AI design tokens (fast path) ──────────────────────────────────
  // Asks the gateway for a small JSON of colors/style derived from the
  // picked reference template. This gates the FIRST PAINT of the AI
  // Autopilot view, so it has its own short timeout — on any failure the
  // caller falls back to the deterministically-derived theme it already has.
  var TOKENS_TIMEOUT_MS = 25000;
  var TOKEN_HEX_RE = /^#[0-9a-f]{6}$/i;

  function validTokens(t) {
    if (!t || typeof t !== 'object') return false;
    var hexFields = ['bg', 'cardBg', 'accent', 'textPrimary', 'textSecondary', 'textMuted', 'border'];
    for (var i = 0; i < hexFields.length; i++) {
      if (typeof t[hexFields[i]] !== 'string' || !TOKEN_HEX_RE.test(t[hexFields[i]])) return false;
    }
    if (!Array.isArray(t.chart) || t.chart.length < 5) return false;
    for (var j = 0; j < t.chart.length; j++) {
      if (typeof t.chart[j] !== 'string' || !TOKEN_HEX_RE.test(t.chart[j])) return false;
    }
    return typeof t.dark === 'boolean';
  }

  /**
   * @param {{title:string, fullText:string}} referenceTemplate
   * @returns {Promise<Object|null>} theme object shaped for
   *   interactive_dashboard_generator.generate(), or null on any failure.
   */
  function fetchDesignTokens(referenceTemplate) {
    if (!GATEWAY_URL || !referenceTemplate || !referenceTemplate.fullText) {
      return Promise.resolve(null);
    }
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, TOKENS_TIMEOUT_MS) : null;
    return fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ANON_KEY,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({
        action: 'design-tokens',
        payload: {
          referenceLayoutTitle: referenceTemplate.title || '',
          referenceLayoutPrompt: referenceTemplate.fullText
        },
        runId: 'tokens-' + Date.now()
      }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (resp) { return resp.ok ? resp.json() : null; })
      .then(function (data) {
        var t = data && data.result;
        if (!validTokens(t)) return null;
        var chart = t.chart.slice(0, 7);
        while (chart.length < 7) chart.push(chart[chart.length % t.chart.length]);
        return {
          id: 'ai_tokens',
          name: t.name || (referenceTemplate.title || 'AI Design'),
          accent: t.accent,
          chart: chart,
          bg: t.bg,
          cardBg: t.cardBg,
          border: t.border,
          textPrimary: t.textPrimary,
          textSecondary: t.textSecondary,
          textMuted: t.textMuted,
          dark: !!t.dark,
          category: t.dark ? 'dark' : 'light'
        };
      })
      .catch(function () { return null; })
      .finally(function () { if (timeoutId) clearTimeout(timeoutId); });
  }

  window.iDashAIComposer = {
    configure: configure,
    buildFactsPayload: buildFactsPayload,
    composeWithAI: composeWithAI,
    fetchDesignTokens: fetchDesignTokens,
    // exposed for testing
    _isHtmlSafe: isHtmlSafe
  };
})();
