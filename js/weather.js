/**
 * iDash — อากาศ × อ้อย (Weather × Cane)
 * ---------------------------------------------------------------------------
 * Free weather for the factory + cane-growing zones via Open-Meteo (no API key,
 * CORS-friendly). Each zone shows a 7-day forecast (rain, temp, chance of rain)
 * with a rule-based cane-impact advisory (harvest / haulage / CCS) — no AI, so
 * nothing is invented; the advisory is a fixed reading of the real forecast.
 *
 * Zones are user-managed: type a place name, we geocode it (Open-Meteo geocoding)
 * and store {name, lat, lon} in localStorage. Ships with one editable example.
 */
(function () {
  'use strict';

  var GEO = 'https://geocoding-api.open-meteo.com/v1/search';
  var FORECAST = 'https://api.open-meteo.com/v1/forecast';
  var ZONES_KEY = 'idash.weatherZones';

  var DEFAULT_ZONES = [
    { name: 'สะหวันนะเขต (โรงงาน)', lat: 16.556, lon: 104.751, factory: true }
  ];

  function loadZones() {
    try {
      var z = JSON.parse(localStorage.getItem(ZONES_KEY) || 'null');
      if (Array.isArray(z) && z.length) return z;
    } catch (e) {}
    return DEFAULT_ZONES.slice();
  }
  function saveZones(z) {
    try { localStorage.setItem(ZONES_KEY, JSON.stringify(z)); } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmt(v, d) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    return Number(v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }

  /* ── WMO weather codes → emoji + Thai ─────────────────────────────────── */
  function wx(code) {
    var c = Number(code);
    if (c === 0) return { e: '☀️', t: 'แจ่มใส' };
    if (c <= 3) return { e: '⛅', t: 'มีเมฆบางส่วน' };
    if (c === 45 || c === 48) return { e: '🌫️', t: 'หมอก' };
    if (c >= 51 && c <= 57) return { e: '🌦️', t: 'ฝนปรอย' };
    if (c >= 61 && c <= 67) return { e: '🌧️', t: 'ฝนตก' };
    if (c >= 71 && c <= 77) return { e: '🌨️', t: 'หิมะ' };
    if (c >= 80 && c <= 82) return { e: '🌧️', t: 'ฝนซู่' };
    if (c >= 95) return { e: '⛈️', t: 'พายุฝนฟ้าคะนอง' };
    return { e: '🌤️', t: 'ทั่วไป' };
  }

  /* ── Rule-based cane advisory (no AI) ─────────────────────────────────── */
  function dayAdvisory(precip, prob, tmax) {
    if (precip >= 30) return { lv: 'high', txt: 'ฝนหนัก — รถตัด/รถบรรทุกเข้าแปลงลำบาก อ้อยเปียก ดินติดเยอะ เสี่ยง CCS/ความหวานลด ควรปรับแผนตัด' };
    if (precip >= 10) return { lv: 'mid', txt: 'ฝนปานกลาง — แปลงอาจแฉะ ระวังอ้อยเปียก/ดินติดเพิ่ม' };
    if (precip >= 1 || prob >= 60) return { lv: 'watch', txt: 'มีฝนเล็กน้อย/โอกาสฝนสูง — เฝ้าระวังแผนตัดและขนส่ง' };
    if (tmax >= 38) return { lv: 'heat', txt: 'ร้อนจัด — อ้อยเครียด อาจสุกช้า' };
    return { lv: 'ok', txt: 'อากาศดี เหมาะเก็บเกี่ยวและขนส่ง' };
  }

  // Zone-level summary from the 7-day forecast.
  function zoneSummary(daily) {
    var rainDays = 0, maxP = 0, maxPDay = '';
    for (var i = 0; i < daily.time.length; i++) {
      var p = daily.precipitation_sum[i] || 0;
      if (p >= 10) rainDays++;
      if (p > maxP) { maxP = p; maxPDay = daily.time[i]; }
    }
    if (maxP >= 30) return { lv: 'high', txt: 'เตือน: มีวันฝนหนัก (' + fmt(maxP, 0) + ' มม. วันที่ ' + thDate(maxPDay) + ') — เสี่ยงกระทบการตัด/ขนส่ง/CCS' };
    if (rainDays >= 3) return { lv: 'mid', txt: 'ฝนหลายวันใน 7 วันนี้ (' + rainDays + ' วัน) — วางแผนตัดเผื่อแปลงแฉะ' };
    if (rainDays >= 1) return { lv: 'watch', txt: 'มีฝนบางวัน — เฝ้าระวังเป็นช่วงๆ' };
    return { lv: 'ok', txt: 'อากาศดีตลอด 7 วัน เหมาะเก็บเกี่ยว' };
  }

  function thDate(iso) {
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    return p[2] + '/' + p[1];
  }
  function thWeekday(iso) {
    // Avoid Date locale surprises — derive weekday from the ISO date only.
    var d = new Date(iso + 'T00:00:00');
    var w = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    return isNaN(d) ? '' : w[d.getDay()];
  }

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  function geocode(name) {
    var url = GEO + '?name=' + encodeURIComponent(name) + '&count=5&language=th&format=json';
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) { return (j && j.results) || []; });
  }
  function forecast(lat, lon) {
    var url = FORECAST + '?latitude=' + lat + '&longitude=' + lon +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=auto&forecast_days=7';
    return fetch(url).then(function (r) { return r.json(); });
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  function zoneCard(zone, idx) {
    var el = document.createElement('div');
    el.className = 'wx-card';
    el.innerHTML =
      '<div class="wx-head">' +
        '<div><div class="wx-name">' + (zone.factory ? '🏭 ' : '📍 ') + esc(zone.name) + '</div>' +
          '<div class="wx-coord">' + fmt(zone.lat, 3) + ', ' + fmt(zone.lon, 3) + '</div></div>' +
        '<button class="wx-del" title="ลบเขต" data-idx="' + idx + '">✕</button>' +
      '</div>' +
      '<div class="wx-alert" data-alert>กำลังโหลดพยากรณ์…</div>' +
      '<div class="wx-days" data-days></div>';
    return el;
  }

  function fillCard(el, data) {
    var alertEl = el.querySelector('[data-alert]');
    var daysEl = el.querySelector('[data-days]');
    if (!data || !data.daily || !data.daily.time) {
      alertEl.className = 'wx-alert lv-err';
      alertEl.textContent = 'ดึงพยากรณ์ไม่สำเร็จ';
      return;
    }
    var d = data.daily;
    var sum = zoneSummary(d);
    alertEl.className = 'wx-alert lv-' + sum.lv;
    alertEl.innerHTML = '<b>' + esc(sum.txt) + '</b>';

    daysEl.innerHTML = d.time.map(function (t, i) {
      var w = wx(d.weather_code[i]);
      var p = d.precipitation_sum[i] || 0;
      var prob = d.precipitation_probability_max ? (d.precipitation_probability_max[i] || 0) : 0;
      var adv = dayAdvisory(p, prob, d.temperature_2m_max[i]);
      return '<div class="wx-day lv-' + adv.lv + '" title="' + esc(adv.txt) + '">' +
        '<div class="wx-dow">' + thWeekday(t) + ' ' + thDate(t) + '</div>' +
        '<div class="wx-emoji">' + w.e + '</div>' +
        '<div class="wx-temp">' + fmt(d.temperature_2m_max[i], 0) + '° / ' + fmt(d.temperature_2m_min[i], 0) + '°</div>' +
        '<div class="wx-rain">💧 ' + fmt(p, 1) + ' มม.</div>' +
        '<div class="wx-prob">' + fmt(prob, 0) + '%</div>' +
      '</div>';
    }).join('');
  }

  function renderAll() {
    var wrap = document.getElementById('wxZones');
    if (!wrap) return;
    var zones = loadZones();
    wrap.innerHTML = '';
    if (!zones.length) {
      wrap.innerHTML = '<div class="wx-empty">ยังไม่มีเขต — เพิ่มเขตแรกด้านล่าง (พิมพ์ชื่อเมือง/อำเภอ)</div>';
      return;
    }
    zones.forEach(function (z, i) {
      var card = zoneCard(z, i);
      wrap.appendChild(card);
      forecast(z.lat, z.lon)
        .then(function (data) { fillCard(card, data); })
        .catch(function () { fillCard(card, null); });
    });
    // Delete handlers.
    [].forEach.call(wrap.querySelectorAll('.wx-del'), function (b) {
      b.addEventListener('click', function () {
        var zs = loadZones();
        zs.splice(+b.getAttribute('data-idx'), 1);
        saveZones(zs);
        renderAll();
      });
    });
  }

  /* ── Add-zone flow (geocode a place name) ─────────────────────────────── */
  function wireAdd() {
    var input = document.getElementById('wxAddInput');
    var btn = document.getElementById('wxAddBtn');
    var results = document.getElementById('wxResults');
    if (!input || !btn) return;

    function search() {
      var q = input.value.trim();
      if (!q) return;
      results.innerHTML = '<div class="wx-searching">กำลังค้นหา…</div>';
      geocode(q).then(function (list) {
        if (!list.length) { results.innerHTML = '<div class="wx-searching">ไม่พบสถานที่ "' + esc(q) + '" — ลองพิมพ์ชื่อเมือง/จังหวัดเป็นภาษาอังกฤษ</div>'; return; }
        results.innerHTML = list.map(function (r, i) {
          var place = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
          return '<button class="wx-result" data-i="' + i + '">' + esc(place) +
            ' <span>(' + fmt(r.latitude, 2) + ', ' + fmt(r.longitude, 2) + ')</span></button>';
        }).join('');
        [].forEach.call(results.querySelectorAll('.wx-result'), function (b) {
          b.addEventListener('click', function () {
            var r = list[+b.getAttribute('data-i')];
            var zs = loadZones();
            zs.push({ name: input.value.trim() || r.name, lat: r.latitude, lon: r.longitude });
            saveZones(zs);
            input.value = '';
            results.innerHTML = '';
            renderAll();
          });
        });
      }).catch(function () { results.innerHTML = '<div class="wx-searching">ค้นหาไม่สำเร็จ — ตรวจอินเทอร์เน็ต</div>'; });
    }

    btn.addEventListener('click', search);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); search(); } });
  }

  function boot() {
    if (!document.getElementById('wxZones')) return;
    renderAll();
    wireAdd();
    var refresh = document.getElementById('wxRefresh');
    if (refresh) refresh.addEventListener('click', renderAll);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
