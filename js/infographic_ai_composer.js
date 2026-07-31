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

  /* ── Data profile for the AI ──────────────────────────────────────────
   * The facts below are what the deterministic pipeline managed to bind into
   * widgets. That is a narrow view: anything the composer couldn't interpret
   * arrives as "column_12" or not at all, and the model has no way to do
   * better because it never sees the data — only our digest of it.
   *
   * This sends the shape of the actual table instead: every column, what kind
   * of values it holds, its range and totals, and its top category labels.
   * The model can then decide for itself what deserves to be a KPI and what
   * groups a chart — which is the whole reason pasting a file into Claude
   * directly produces a better dashboard than this pipeline did.
   *
   * P6 holds: no raw rows. Column names, computed statistics and at most 12
   * category labels per column — exactly the categories the rule permits.
   */
  var MAX_LABELS_PER_COL = 12;
  var MAX_PROFILED_COLS = 40;

  function isNumericVal(v) {
    if (typeof v === 'number') return isFinite(v);
    if (typeof v !== 'string') return false;
    var s = v.replace(/,/g, '').trim();
    return s !== '' && !isNaN(Number(s));
  }

  function isDateVal(v) {
    if (v instanceof Date) return !isNaN(v.getTime());
    if (typeof v !== 'string') return false;
    if (!/\d{4}|\d{1,2}[\/-]\d{1,2}/.test(v)) return false;
    return !isNaN(new Date(v).getTime());
  }

  function buildDataProfile(dataset) {
    if (!dataset || !dataset.data || !dataset.data.length) return null;
    var rows = dataset.data;
    var names = dataset.columns
      ? dataset.columns.map(function (c) { return typeof c === 'string' ? c : (c && c.name); })
      : Object.keys(rows[0] || {});
    names = names.filter(Boolean).slice(0, MAX_PROFILED_COLS);
    var sample = rows.length > 1000 ? rows.slice(0, 1000) : rows;

    var cols = names.map(function (name) {
      var nums = [], dates = 0, blanks = 0, seen = {}, labels = [], distinct = 0;
      sample.forEach(function (r) {
        var v = r[name];
        if (v == null || v === '') { blanks++; return; }
        if (isNumericVal(v)) nums.push(Number(String(v).replace(/,/g, '')));
        else if (isDateVal(v)) dates++;
        var k = String(v);
        if (seen[k] === undefined) { seen[k] = 0; distinct++; if (labels.length < MAX_LABELS_PER_COL) labels.push(k); }
        seen[k]++;
      });
      var filled = sample.length - blanks;
      var out = {
        name: name,
        distinct: distinct,
        blankPct: sample.length ? Math.round(blanks / sample.length * 100) : 0
      };
      var trimmed = String(name).trim();
      if (PLACEHOLDER_NAME.test(trimmed)) {
        // Say so rather than hiding it — the model can judge from the values
        // whether the column is worth using, and can label it honestly.
        out.note = 'หัวตารางในไฟล์ว่าง — ชื่อนี้ระบบตั้งให้อัตโนมัติ';
      } else if (trimmed && !isNaN(Number(trimmed.replace(/,/g, '')))) {
        // Marked here, judged after the loop — see the numeric-name pass below.
        out._numericName = true;
      }
      if (filled > 0 && nums.length / filled >= 0.7) {
        out.type = 'number';
        var sum = 0, min = Infinity, max = -Infinity;
        nums.forEach(function (n) { sum += n; if (n < min) min = n; if (n > max) max = n; });
        out.stats = {
          sum: Math.round(sum * 100) / 100,
          avg: Math.round(sum / nums.length * 100) / 100,
          min: min, max: max, count: nums.length
        };
        // Near-unique dense integers are row labels, not measurements. Flag
        // rather than drop: the model may still want it as an axis or a key.
        //
        // The density test is essential, not decoration — near-uniqueness
        // alone flags legitimate integer measures (money, counts) whose values
        // happen not to repeat. An identifier's distinct values sit in a tight
        // run; a measure's scatter. Same lesson the generator's own screen
        // learned, applied with the same threshold.
        var allInt = nums.every(function (n) { return n === Math.floor(n); });
        if (allInt && distinct / filled >= 0.85 && nums.length > 3) {
          var uniq = Object.keys(seen).map(Number).filter(function (n) { return !isNaN(n); })
            .sort(function (a, b) { return a - b; });
          var gaps = [];
          for (var gi = 1; gi < uniq.length; gi++) gaps.push(uniq[gi] - uniq[gi - 1]);
          gaps.sort(function (a, b) { return a - b; });
          if (gaps.length && gaps[Math.floor(gaps.length / 2)] <= 2) out.likelyIdentifier = true;
        }
      } else if (filled > 0 && dates / filled >= 0.5) {
        out.type = 'date';
        var ds = sample.map(function (r) { return r[name]; })
          .filter(function (v) { return v != null && v !== '' && isDateVal(v); })
          .map(function (v) { return new Date(v); })
          .sort(function (a, b) { return a - b; });
        if (ds.length) { out.min = ds[0].toISOString().slice(0, 10); out.max = ds[ds.length - 1].toISOString().slice(0, 10); }
      } else {
        out.type = 'category';
        out.topValues = labels;
      }
      return out;
    });

    /* Numeric column names mean one of two very different things, and the
     * difference is only visible across the whole table:
     *   most names numeric  → the file had no header row and a data row was
     *                         read as one; the names are meaningless.
     *   a few names numeric → ordinary year/period columns in a budget-style
     *                         sheet ("2025", "2026"); those names are correct
     *                         and telling the model to rename or skip them
     *                         would throw away real data.
     * Only the first case gets a warning. */
    var numericNamed = cols.filter(function (c) { return c._numericName; });
    if (numericNamed.length > cols.length * 0.6) {
      numericNamed.forEach(function (c) {
        c.note = 'ชื่อคอลัมน์เป็นตัวเลข — ไฟล์อาจไม่มีแถวหัวตาราง ควรตั้งชื่อจากค่าที่เห็น';
      });
    }
    cols.forEach(function (c) { delete c._numericName; });

    return { rowCount: rows.length, sampledRows: sample.length, columns: cols };
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

    // Strip only what is actively misleading. These widgets are a suggested
    // starting point, not the whole brief — the model also gets dataProfile
    // below and can build past anything dropped here. Removing a KPI called
    // "ผลรวม — column_12" costs nothing, because the same column still
    // appears in the profile with its statistics and an honest note.
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
      alerts: alerts.slice(0, 4),
      // The table's own shape. When the pipeline understood the file this
      // agrees with the widgets above; when it didn't, this is what lets the
      // model build something anyway instead of us refusing the file.
      dataProfile: (meta && meta.dataset) ? buildDataProfile(meta.dataset) : null
    };
  }

  /**
   * Can we attempt a dashboard at all? Deliberately generous: the model gets
   * the full column profile, so it can work from raw column statistics even
   * when the deterministic pipeline bound nothing. The only true blocker is
   * an empty table — there is no design to make from zero rows.
   *
   * (This used to demand pre-bound widgets and refused files the model could
   * have handled perfectly well. Refusing to try is worse than trying.)
   */
  function factsAreSubstantial(facts) {
    if (facts.dataProfile && facts.dataProfile.rowCount > 0 &&
        facts.dataProfile.columns && facts.dataProfile.columns.length > 0) return true;
    var visuals = (facts.trend ? 1 : 0) + (facts.donut ? 1 : 0) + (facts.ranked ? 1 : 0);
    return facts.kpis.length >= 1 || visuals >= 1;
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
    // The main AI Autopilot path in app.js builds facts and calls the provider
    // itself rather than going through composeWithAI, so it needs this guard
    // exported — otherwise the "don't pay for a call about nothing" check only
    // protected the one path that no longer runs.
    factsAreSubstantial: factsAreSubstantial,
    composeWithAI: composeWithAI,
    fetchDesignTokens: fetchDesignTokens,
    // exposed for testing
    _isHtmlSafe: isHtmlSafe
  };
})();
