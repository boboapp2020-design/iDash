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
    var accent = card.getAttribute('data-accent') || '#3b82f6';

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

  function renderAll(payload, staleAt) {
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
        writeCache(payload);
        return payload;
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
    render: renderAll
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
