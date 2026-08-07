// Home page KPI row — live values from the Production Dashboard sheet.
//
// Data source: Google Apps Script Web App deployed on the "Dashboard ML"
// spreadsheet (tab DailyReport). Script source of truth lives at
// app/data/integrations/production_kpi_api.gs — redeploy it there, then paste
// the /exec URL below.
//
// Nothing is fabricated: a KPI whose column has no usable value renders "—".
(function () {
  'use strict';

  // ── Apps Script Web App /exec URL ─────────────────────────────────────────
  // Its own deployment, separate from the one the Production Dashboard uses
  // (AKfycbyT2OQj…) — that endpoint is untouched and keeps its own code version.
  var KPI_API_URL = 'https://script.google.com/macros/s/AKfycbx2KmyntEHLOMW5MfWtxmNlntB8I7_mJ_mQdxdadzLaI88AXDHuD3EmVUyP7nv2sNnl/exec';
  // ──────────────────────────────────────────────────────────────────────────
  // Alternatively set it without editing this file, from the browser console:
  //   iDashHomeKpi.setUrl('https://script.google.com/macros/s/.../exec')
  // Most specific wins. The built-in URL was first in this chain, which made
  // setUrl() below silently do nothing — an override has to outrank the default
  // or it isn't an override.
  function apiUrl() {
    try {
      var saved = localStorage.getItem('idash.kpiApiUrl');
      if (saved) return saved;
    } catch (e) { /* private mode — fall through */ }
    return window.IDASH_KPI_API_URL || KPI_API_URL || '';
  }

  var CACHE_KEY = 'idash.homeKpiCache';
  // Stale-while-revalidate: cached numbers are painted immediately no matter
  // how old, then replaced when the network answers. Apps Script cold starts
  // take seconds, and showing yesterday's figure for one of them beats showing
  // "กำลังโหลด…" — the age is stated on screen so nothing is passed off as live.
  var FRESH_MS = 5 * 60 * 1000;

  function fmtNumber(value, decimals) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    var abs = Math.abs(value);
    // Large counts read better compacted; percentages and CCS stay exact.
    if (decimals === 0 && abs >= 1000000) return (value / 1000000).toFixed(2) + 'M';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function buildSpark(values, color, uid) {
    if (!values || values.length < 2) return '';
    var W = 240, H = 46, PAD = 4;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var span = max - min;
    var stepX = W / (values.length - 1);

    var xy = values.map(function (v, i) {
      var x = Math.round(i * stepX * 100) / 100;
      // Flat series sit on the middle line rather than dividing by zero.
      var ratio = span === 0 ? 0.5 : (v - min) / span;
      var y = Math.round((H - PAD - ratio * (H - PAD * 2)) * 100) / 100;
      return [x, y];
    });
    var pts = xy.map(function (p) { return p[0] + ',' + p[1]; });

    // A dot on every reading, as in `icon graphic.png`. Inset the end dots so
    // they are not clipped by the viewBox edge.
    var dots = xy.map(function (p) {
      var cx = Math.min(W - 2.5, Math.max(2.5, p[0]));
      return '<circle cx="' + cx + '" cy="' + p[1] + '" r="2.2" fill="' + color + '"/>';
    }).join('');

    var gid = 'spk_' + uid;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity=".22"/>' +
      '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<path d="M' + pts.join(' L') + ' L' + W + ',' + H + ' L0,' + H + ' Z" fill="url(#' + gid + ')"/>' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color +
      '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots +
      '</svg>';
  }

  function renderKpi(card, kpi) {
    var valueEl = card.querySelector('[data-kpi-value]');
    var deltaEl = card.querySelector('[data-kpi-delta]');
    var sparkEl = card.querySelector('[data-kpi-spark]');
    // The card's hue lives in the --acc custom property, which also drives its
    // top band, halo and border in home.css — one declaration, one colour.
    var accent = (card.style.getPropertyValue('--acc') || '').trim() || '#3b82f6';

    // The row is "ภาพรวมการทำงานของโรงงานวันนี้": the headline is the LATEST
    // DAY's figure, not the season total. The API sends both — cumulative stays
    // available on hover below. `today` is preferred; `value` is the fallback
    // for a KPI whose daily column is empty.
    var headline = (kpi && kpi.today !== null && kpi.today !== undefined)
      ? kpi.today
      : (kpi ? kpi.value : null);

    if (!kpi || headline === null || headline === undefined) {
      valueEl.textContent = '—';
      deltaEl.className = 'home-kpi-delta';
      deltaEl.textContent = 'ไม่มีข้อมูลในชีต';
      if (sparkEl) sparkEl.innerHTML = '';
      return;
    }

    var num = fmtNumber(headline, kpi.decimals || 0);
    valueEl.innerHTML = kpi.unit
      ? num + '<span class="unit">' + kpi.unit + '</span>'
      : num;

    // Delta is that same daily figure vs the day before it.
    if (kpi.delta === null || kpi.delta === undefined) {
      deltaEl.className = 'home-kpi-delta';
      deltaEl.textContent = kpi.todate
        ? 'สะสม ' + fmtNumber(kpi.todate, kpi.decimals || 0)
        : '';
    } else {
      // direction carries meaning ('up' = good), the arrow carries arithmetic sign
      var arrow = kpi.delta >= 0 ? '↑' : '↓';
      deltaEl.className = 'home-kpi-delta ' + (kpi.direction === 'down' ? 'down' : 'up');
      deltaEl.innerHTML = arrow + ' ' + Math.abs(kpi.delta).toFixed(1) +
        '% <span class="base">จากวันก่อน</span>';
    }

    // Full picture on hover: cumulative, latest day, and target — all real.
    var tip = [];
    if (kpi.todate !== null && kpi.todate !== undefined) tip.push('สะสม ' + fmtNumber(kpi.todate, kpi.decimals || 0) + ' ' + kpi.unit);
    if (kpi.today !== null && kpi.today !== undefined) tip.push('วันล่าสุด ' + fmtNumber(kpi.today, kpi.decimals || 0) + ' ' + kpi.unit);
    if (kpi.target !== null && kpi.target !== undefined) tip.push('เป้าหมาย ' + fmtNumber(kpi.target, kpi.decimals || 0) + ' ' + kpi.unit);
    card.title = tip.join('\n');

    if (sparkEl) sparkEl.innerHTML = buildSpark(kpi.spark, accent, kpi.id);
  }

  /* ── Payload adapters ───────────────────────────────────────────────────
   * The endpoint now serves the Production Dashboard's own feed
   * ({success, daily[], water, stop}) rather than the {latestDate, kpis[]}
   * shape this row was written against. Nothing errored — `payload.kpis` was
   * simply undefined, so every refresh painted nothing and the row sat on its
   * cached values behind a permanent "กำลังอัปเดต…".
   *
   * The five headline figures are all present in `daily`, so they are derived
   * here. The legacy shape is still accepted in case that deployment returns.
   */
  var DAILY_KPIS = [
    { id: 'cane_crushed', field: 'cane_today',    label: 'จำนวนอ้อยเข้าหีบ', unit: 'ตัน',  decimals: 0, todate: 'cane_todate',    target: 'cane_target' },
    { id: 'ccs_factory',  field: 'ccs_today',     label: 'CCS of Factory',   unit: '',      decimals: 2, todate: 'ccs_todate',     target: 'ccs_target' },
    // Burnt cane is a defect rate: falling is the good direction.
    { id: 'burnt_cane',   field: 'burnt_today',   label: '% Burnt Cane',     unit: '%',     decimals: 2, todate: 'burnt_todate',   lowerIsBetter: true },
    { id: 'cane_as_telq', field: 'pcttelq_today', label: '% Cane as TELQ',   unit: '%',     decimals: 2, todate: 'pcttelq_todate', target: 'pcttelq_target' },
    { id: 'edl_export',   field: 'edl_today',     label: 'ขายไฟ (EDL)',      unit: 'kWh',   decimals: 0, todate: 'edl_todate',     target: 'edl_target' }
  ];

  function toNum(v) {
    if (v === null || v === undefined || v === '') return null;
    var n = parseFloat(String(v).replace(/[, ]/g, ''));
    return isNaN(n) ? null : n;
  }

  function fromDaily(payload) {
    var rows = (payload.daily || []).filter(function (r) { return r && r.date; });
    if (rows.length === 0) return null;
    var last = rows[rows.length - 1];
    var prev = rows.length > 1 ? rows[rows.length - 2] : null;

    var kpis = DAILY_KPIS.map(function (d) {
      var today = toNum(last[d.field]);
      var before = prev ? toNum(prev[d.field]) : null;
      // A percentage change against zero is undefined, not infinite — leave the
      // delta out rather than print a meaningless number.
      var delta = (today !== null && before !== null && before !== 0)
        ? ((today - before) / Math.abs(before)) * 100
        : null;
      var direction = delta === null ? null
        : ((d.lowerIsBetter ? delta < 0 : delta > 0) ? 'up' : 'down');

      return {
        id: d.id, nameTH: d.label, unit: d.unit, decimals: d.decimals,
        today: today,
        value: today,
        todate: d.todate ? toNum(last[d.todate]) : null,
        target: d.target ? toNum(last[d.target]) : null,
        delta: delta,
        direction: direction,
        spark: rows.slice(-14).map(function (r) { return toNum(r[d.field]); })
                   .filter(function (v) { return v !== null; })
      };
    });

    return { latestDate: last.date, kpis: kpis };
  }

  /** Accept either payload shape; returns the {latestDate, kpis} form. */
  function normalize(payload) {
    if (!payload) return null;
    if (Array.isArray(payload.kpis) && payload.kpis.length) return payload;
    if (Array.isArray(payload.daily) && payload.daily.length) return fromDaily(payload);
    return null;
  }

  function renderAll(rawPayload, staleAt) {
    var payload = normalize(rawPayload);
    if (!payload) { renderUnconfigured('รูปแบบข้อมูลจากชีตไม่ตรงกับที่รองรับ'); return; }
    var byId = {};
    (payload.kpis || []).forEach(function (k) { byId[k.id] = k; });

    document.querySelectorAll('#homeKpiRow .home-kpi').forEach(function (card) {
      renderKpi(card, byId[card.getAttribute('data-kpi')]);
    });

    var stamp = document.getElementById('homeKpiStamp');
    if (stamp && payload.latestDate) {
      stamp.textContent = 'ข้อมูลล่าสุด ' + payload.latestDate +
        (staleAt ? ' · กำลังอัปเดต…' : '');
      stamp.hidden = false;
    }
  }

  function renderUnconfigured(message) {
    document.querySelectorAll('#homeKpiRow .home-kpi').forEach(function (card) {
      var valueEl = card.querySelector('[data-kpi-value]');
      var deltaEl = card.querySelector('[data-kpi-delta]');
      var sparkEl = card.querySelector('[data-kpi-spark]');
      valueEl.textContent = '—';
      deltaEl.className = 'home-kpi-delta';
      deltaEl.textContent = message;
      if (sparkEl) sparkEl.innerHTML = '';
    });
  }

  /** @returns {{payload:Object, at:number}|null} — any age; caller decides. */
  function readCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return (c && c.at && c.payload) ? c : null;
    } catch (e) { return null; }
  }

  function writeCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), payload: payload }));
    } catch (e) { /* quota — cache is optional */ }
  }

  // Kick the request off the moment this file runs, before the DOM is ready.
  // The row can't be painted yet, but the round-trip — which is the slow part —
  // is already in flight by the time it can be.
  var inFlight = null;
  function startFetch() {
    var url = apiUrl();
    if (!url) return null;
    return fetch(url, { method: 'GET' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (payload) {
        if (payload.error) throw new Error(payload.error);
        // Cache the five derived figures, not the ~1.2MB raw feed the endpoint
        // returns — the row only ever needs the small form.
        var slim = normalize(payload);
        if (slim) writeCache(slim);
        return slim || payload;
      });
  }

  function paint() {
    var url = apiUrl();
    var cached = readCache();
    var stale = cached && (Date.now() - cached.at > FRESH_MS);

    if (cached) renderAll(cached.payload, stale);

    if (!url) {
      if (!cached) renderUnconfigured('ยังไม่ได้เชื่อมต่อชีต');
      return;
    }
    if (!inFlight) inFlight = startFetch();

    inFlight
      .then(function (payload) { renderAll(payload); })
      .catch(function (err) {
        console.warn('[iDash] KPI fetch failed:', err.message);
        // With cached numbers on screen, drop the "updating" note rather than
        // wiping real values off the row.
        if (cached) renderAll(cached.payload);
        else renderUnconfigured('เชื่อมต่อข้อมูลไม่สำเร็จ');
      });
  }

  function load() { inFlight = null; paint(); }

  window.iDashHomeKpi = {
    // Point the row at a deployed Apps Script Web App without editing this file.
    setUrl: function (url) {
      localStorage.setItem('idash.kpiApiUrl', url);
      localStorage.removeItem(CACHE_KEY);
      load();
      return url;
    },
    reload: function () {
      localStorage.removeItem(CACHE_KEY);
      load();
    },
    render: renderAll,
    // Shared with the Quick bot: the same normalized {latestDate, kpis[]} the
    // row paints, so the bot answers from the identical real figures (one
    // source of truth — the KPI definitions live only here).
    getData: function () { var c = readCache(); return c ? c.payload : null; },
    refresh: function () { inFlight = startFetch(); return inFlight; }
  };

  // Network first, DOM second — this file is loaded `async` from <head>, so it
  // usually runs well before the body exists.
  inFlight = startFetch();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
})();
