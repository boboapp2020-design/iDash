/**
 * iDash — อากาศ × อ้อย (Weather × Cane) — iField design
 * ---------------------------------------------------------------------------
 * Layout per the owner's iField mock: a map card with three layer tabs —
 *   สะสมในแปลง  pin colours = REAL past-7-day rain accumulation (wet-field risk)
 *   เรดาร์ฝน     live rain radar overlay (RainViewer, free, no key)
 *   ดาวเทียม     satellite base (MapTiler hybrid in 3D, Esri in 2D fallback)
 * — and a right panel for the selected point: big current conditions, a
 * cane advisory, 7-day forecast cards, and wind/humidity/pressure/sun tiles.
 *
 * Cane rules follow the cane-brain skill (agronomy, not invented):
 *   · ฝนตกก่อนตัด → อ้อยดูดน้ำ Brix เจือจาง CCS ตกชั่วคราว ควรรอ 7-14 วันหลังฝนหยุด
 *   · ดินแฉะ → รถตัด/รถบรรทุกติดหล่ม ดินอัดแน่น กอช้ำ และดินติดอ้อยเพิ่ม
 * The AI brief (Groq via the iDash gateway) is grounded on those rules and the
 * REAL per-zone numbers; everything else is deterministic.
 *
 * Data: Open-Meteo forecast+current+past_days (free), RainViewer tiles (free),
 * Nominatim geocoding + boundaries (free). MapTiler key = public map key.
 */
(function () {
  'use strict';

  var FORECAST = 'https://api.open-meteo.com/v1/forecast';
  var MAPTILER_KEY = '9ZNAFkXEzT9KdManlDo0';

  // Same shared gateway the Copilot uses (Groq free tier; key stays server-side).
  var AI_GATEWAY = 'https://hcckwaukoaioxpsfpipk.supabase.co/functions/v1/swift-action';
  var AI_ANON = 'sb_publishable_BZEZ_UVLqNLg2pQsXtNUjQ_cp2ZPY5h';

  /* ── Zones (สะหวันนะเขต all 15 districts + คำม่วน main towns) ────────────
   * key: true = the owner's priority cane zones (เน้นเป็นพิเศษ): gold star
   * pins, a quick-select bar above the map, and first place in the AI brief.
   * นาสะอาด is not in OSM — coordinates are approximate (Khammouane cane belt
   * between Nongbok and Xebangfai) until the owner pins the exact spot. */
  var ZONES = [
    { name: 'เมืองสะหวันนะเขต (ไกสอน)', prov: 'สะหวันนะเขต', lat: 16.556, lon: 104.751, factory: true },
    { name: 'เซโน (Seno)', short: 'เซโน', prov: 'สะหวันนะเขต', lat: 16.679, lon: 104.964, key: true },
    { name: 'ไซบูลี (Xaybuly)', short: 'ไซบูลี', prov: 'สะหวันนะเขต', lat: 16.860, lon: 105.130, key: true },
    // จำพอน pin sits on the district's actual cane cluster (the 9 analysed
    // fields all fall 16.51-16.59 × 105.05-105.10), not the far-south edge.
    { name: 'จำพอน (Champhone)', short: 'จำพอน', prov: 'สะหวันนะเขต', lat: 16.550, lon: 105.070, key: true },
    { name: 'อาดสะพังทอง (Atsaphangthong)', short: 'อาดสะพังทอง', prov: 'สะหวันนะเขต', lat: 16.730, lon: 105.300, key: true },
    { name: 'เซบั้งไฟ (Xebangfai)', short: 'เซบั้งไฟ', prov: 'คำม่วน', lat: 16.980, lon: 105.120, key: true },
    // นาสะอาด: per the owner's map screenshot — on Route 13 just east of Nong
    // Bok town (which sits by the Mekong at ~16.96,104.80), between Ban Nadon
    // (N) and Ban Nongpèn (SE).
    { name: 'นาสะอาด (คำม่วน)', short: 'นาสะอาด', prov: 'คำม่วน', lat: 16.968, lon: 104.878, key: true, approx: true },
    { name: 'อุทุมพอน (Outhoumphone)', prov: 'สะหวันนะเขต', lat: 16.620, lon: 105.030 },
    { name: 'ไซพูทอง (Xaiphouthong)', prov: 'สะหวันนะเขต', lat: 16.330, lon: 104.960 },
    { name: 'สองคอน (Songkhone)', prov: 'สะหวันนะเขต', lat: 16.100, lon: 105.000 },
    { name: 'ท่าปางทอง (Thapangthong)', prov: 'สะหวันนะเขต', lat: 16.400, lon: 105.330 },
    { name: 'พะลานไซ (Phalanxay)', prov: 'สะหวันนะเขต', lat: 16.480, lon: 105.520 },
    { name: 'อาดสะพอน (Atsaphone)', prov: 'สะหวันนะเขต', lat: 16.930, lon: 105.520 },
    { name: 'ซนบุรี (Xonbuly)', prov: 'สะหวันนะเขต', lat: 15.950, lon: 105.420 },
    { name: 'พิน (Phine)', prov: 'สะหวันนะเขต', lat: 16.530, lon: 105.750 },
    { name: 'วีละบุรี (Vilabuly)', prov: 'สะหวันนะเขต', lat: 16.720, lon: 105.950 },
    { name: 'เซโปน (Xepon)', prov: 'สะหวันนะเขต', lat: 16.690, lon: 106.220 },
    { name: 'นอง (Nong)', prov: 'สะหวันนะเขต', lat: 16.450, lon: 106.420 },
    { name: 'ท่าแขก (Thakhek)', prov: 'คำม่วน', lat: 17.411, lon: 104.821 },
    { name: 'หนองบก (Nongbok)', prov: 'คำม่วน', lat: 16.958, lon: 104.802 },
    { name: 'มะหาไซ (Mahaxay)', prov: 'คำม่วน', lat: 17.400, lon: 105.200 }
  ];

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmt(v, d) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    return Number(v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }
  function wx(code) {
    var c = Number(code);
    if (c === 0) return { e: '☀️', t: 'แจ่มใส' };
    if (c <= 3) return { e: '⛅', t: 'มีเมฆบางส่วน' };
    if (c === 45 || c === 48) return { e: '🌫️', t: 'หมอก' };
    if (c >= 51 && c <= 57) return { e: '🌦️', t: 'ฝนปรอย' };
    if (c >= 61 && c <= 67) return { e: '🌧️', t: 'ฝนตก' };
    if (c >= 80 && c <= 82) return { e: '🌧️', t: 'ฝนซู่' };
    if (c >= 95) return { e: '⛈️', t: 'พายุฝนฟ้าคะนอง' };
    return { e: '🌤️', t: 'ทั่วไป' };
  }
  function thDate(iso) { var p = String(iso).split('-'); return p.length === 3 ? p[2] + '/' + p[1] : iso; }
  function thWeekday(iso) {
    var d = new Date(iso + 'T00:00:00'); var w = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    return isNaN(d) ? '' : w[d.getDay()];
  }
  function windDir(deg) {
    if (deg === null || deg === undefined || isNaN(deg)) return '';
    var dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }
  function hhmm(iso) { var m = String(iso || '').match(/T(\d{2}:\d{2})/); return m ? m[1] : '—'; }

  // Forecast-rain risk (today) and past-7-day wet-field risk — two scales.
  function riskColor(p) { return p >= 30 ? '#dc2626' : p >= 10 ? '#f59e0b' : '#16a34a'; }
  function wetColor(acc) { return acc >= 60 ? '#dc2626' : acc >= 20 ? '#f59e0b' : '#16a34a'; }

  /* ── Production-season model (cane-brain) ─────────────────────────────────
   * Lao/Thai cane calendar: harvest/crush ธ.ค.–มี.ค.; ปลูก/แต่งตอ เม.ย.–พ.ค.;
   * grand growth (ย่างปล้อง — peak water demand, rain is GOOD) มิ.ย.–ต.ค.;
   * พ.ย. = ripening/sugar build-up before opening. Advice must follow the
   * stage — "delay cutting" in August is meaningless. */
  function seasonInfo() {
    var m = new Date().getMonth() + 1;
    if (m === 12 || m <= 3) return { id: 'harvest', emoji: '🚜', label: 'ฤดูเก็บเกี่ยว (เปิดหีบ)', range: 'ธ.ค.–มี.ค.' };
    if (m === 4 || m === 5) return { id: 'plant', emoji: '🌱', label: 'ฤดูปลูก / แต่งตอ', range: 'เม.ย.–พ.ค.' };
    if (m === 11) return { id: 'preharvest', emoji: '🍬', label: 'ช่วงสร้างความหวาน ก่อนเปิดหีบ', range: 'พ.ย.' };
    return { id: 'grow', emoji: '🌿', label: 'ฤดูบำรุง (ย่างปล้อง)', range: 'มิ.ย.–ต.ค.' };
  }
  function daysToHarvest() {
    var now = new Date();
    var open = new Date(now.getFullYear(), 11, 1);   // 1 Dec
    if (now > open) return 0;
    return Math.ceil((open - now) / 86400000);
  }

  /* ── Open-Meteo: 7 past + 7 future days + current, one call ────────────
   * Responses are cached in localStorage for 30 min so a refresh paints every
   * pin + the panel instantly instead of re-fetching 19 forecasts. */
  var WX_TTL = 30 * 60 * 1000;
  function wxCacheAll() {
    try { return JSON.parse(localStorage.getItem('idash.wxCache') || '{}'); } catch (e) { return {}; }
  }
  function forecast(lat, lon) {
    var key = Number(lat).toFixed(3) + ',' + Number(lon).toFixed(3);
    var hit = wxCacheAll()[key];
    if (hit && Date.now() - hit.ts < WX_TTL) return Promise.resolve(hit.d);
    var url = FORECAST + '?latitude=' + lat + '&longitude=' + lon +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset' +
      '&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code' +
      '&timezone=auto&forecast_days=7&past_days=7';
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.daily) {
        try {
          var all = wxCacheAll();
          all[key] = { ts: Date.now(), d: d };
          localStorage.setItem('idash.wxCache', JSON.stringify(all));
        } catch (e) {}
      }
      return d;
    });
  }
  // daily arrays carry 14 entries: [0..6] past, [7..13] today onward.
  function splitDaily(daily) {
    var past7 = 0;
    for (var i = 0; i < 7; i++) past7 += daily.precipitation_sum[i] || 0;
    function slice(arr) { return (arr || []).slice(7); }
    return {
      past7: past7,
      time: slice(daily.time),
      code: slice(daily.weather_code),
      tmax: slice(daily.temperature_2m_max),
      tmin: slice(daily.temperature_2m_min),
      rain: slice(daily.precipitation_sum),
      prob: slice(daily.precipitation_probability_max),
      sunrise: slice(daily.sunrise),
      sunset: slice(daily.sunset)
    };
  }

  /* ── Soil layer (REAL lab data — window.IFIELD_SOIL from js/soil_data.js) ─
   * 188 analysed fields: OM %, pH, P, K, soil texture, district. The panel
   * summarises fields within 15 km of the selected point; the map can show
   * every sampling point coloured by OM level. Interpretation follows
   * cane-brain: low OM → build organic matter (trash blanketing, filter cake),
   * acid soil → lime per field analysis, low P → banded basal P, sandy soil →
   * split fertiliser applications. */
  function omColor(om) { return om < 0.8 ? '#ef4444' : om < 1.5 ? '#f59e0b' : om < 2.5 ? '#84cc16' : '#22c55e'; }
  function soilSummary(lat, lon) {
    var S = window.IFIELD_SOIL; if (!S || !S.pts) return null;
    var kmLat = 111.32, kmLon = 111.32 * Math.cos(lat * Math.PI / 180);
    var near = S.pts.map(function (p) {
      var d = Math.sqrt(Math.pow((p[0] - lat) * kmLat, 2) + Math.pow((p[1] - lon) * kmLon, 2));
      return { p: p, d: d };
    }).filter(function (x) { return x.d <= 15; }).sort(function (a, b) { return a.d - b.d; });
    if (near.length < 2) return null;
    var pts = near.slice(0, 40).map(function (x) { return x.p; });
    function avg(i) { var s = 0, n = 0; pts.forEach(function (p) { if (p[i] != null && p[i] > -900) { s += p[i]; n++; } }); return n ? s / n : null; }
    var soils = {};
    pts.forEach(function (p) { if (p[6]) soils[p[6]] = (soils[p[6]] || 0) + 1; });
    var top = Object.keys(soils).sort(function (a, b) { return soils[b] - soils[a]; })[0] || '';
    return { n: pts.length, om: avg(2), ph: avg(3), p: avg(4), k: avg(5), soil: top,
      lowOM: pts.filter(function (p) { return p[2] < 1.5; }).length };
  }
  function soilCell(n, v, c) {
    return '<div class="wxsc"><div class="wxsc-n">' + n + '</div><div class="wxsc-v" style="color:' + c + '">' + v + '</div></div>';
  }
  function soilBlockHtml(lat, lon) {
    var s = soilSummary(lat, lon); if (!s) return '';
    var recs = [];
    if (s.om !== null && s.om < 1.5) recs.push('OM ต่ำ (เฉลี่ย ' + fmt(s.om, 2) + '%) — เพิ่มอินทรียวัตถุ: ไว้ใบอ้อยคลุมดินแทนการเผา ใส่กากหม้อกรอง/ปุ๋ยคอก');
    if (s.ph !== null && s.ph < 5.5) recs.push('ดินค่อนข้างกรด (pH ' + fmt(s.ph, 1) + ') — พิจารณาปูน/โดโลไมท์ตามค่าวิเคราะห์รายแปลง');
    if (s.p !== null && s.p < 10) recs.push('ฟอสฟอรัสต่ำ (' + fmt(s.p, 1) + ' ppm) — รองพื้น P ตอนปลูก/แต่งตอให้ตรงจุด');
    if (/ทราย/.test(s.soil)) recs.push('เนื้อดินเด่น: ' + s.soil + ' — อุ้มน้ำ/ธาตุอาหารต่ำ ควรแบ่งใส่ปุ๋ยหลายครั้ง');
    else if (s.soil) recs.push('เนื้อดินเด่น: ' + s.soil);
    return '<div class="wxp-soil">' +
      '<div class="wxp-soil-h">🟤 คุณภาพดินรอบจุดนี้ <span>(' + s.n + ' แปลงตรวจจริงในรัศมี 15 กม.)</span></div>' +
      '<div class="wxp-soil-grid">' +
        soilCell('OM', fmt(s.om, 2) + '%', omColor(s.om)) +
        soilCell('pH', fmt(s.ph, 1), s.ph < 5.5 ? '#fbbf24' : '#6ee7b7') +
        soilCell('P', fmt(s.p, 1) + ' ppm', s.p < 10 ? '#f87171' : '#6ee7b7') +
        soilCell('K', fmt(s.k, 0) + ' ppm', s.k < 80 ? '#fbbf24' : '#6ee7b7') +
      '</div>' +
      (recs.length ? '<div class="wxp-soil-rec">' + recs.map(function (r) { return '🌱 ' + esc(r); }).join('<br>') + '</div>' : '') +
      '<div class="wxp-soil-src">' + esc((window.IFIELD_SOIL.source || '')) + ' · ' + s.lowOM + '/' + s.n + ' แปลงมี OM&lt;1.5%</div>' +
    '</div>';
  }

  /* ── Soil × Weather combined analysis (cane-brain, deterministic) ────────
   * The point where the two real datasets meet: each soil texture responds to
   * the same rain differently —
   *   sandy  + heavy rain   → little ponding but heavy N/K leaching
   *   clayey + accumulated  → slow drainage, waterlogging, bogging risk
   *   low OM + heavy rain   → weak topsoil structure, crusting/erosion
   *   low OM + dry spell    → poor water holding → early drought stress
   *   acid   + wet season   → continued base leaching, pH drifts lower
   * Harvest season adds trafficability: sandy fields re-enter days after rain,
   * clay fields need the longer 7-14 day wait. */
  function comboAnalysis(f, s) {
    if (!f || !s) return [];
    var season = seasonInfo();
    var sandy = /ทราย/.test(s.soil) && !/เหนียว/.test(s.soil);
    var clayey = /เหนียว/.test(s.soil);
    var heavy3 = Math.max(f.rain[0] || 0, f.rain[1] || 0, f.rain[2] || 0);
    var next3 = (f.rain[0] || 0) + (f.rain[1] || 0) + (f.rain[2] || 0);
    var out = [];

    if (season.id === 'harvest') {
      if (clayey && f.past7 >= 30) out.push({ lv: 'high', txt: 'ดินเด่นแถบนี้เป็น' + s.soil + ' ระบายน้ำช้า + ฝนสะสม ' + fmt(f.past7, 0) + ' มม. — แห้งช้ากว่าแปลงดินทราย ควรเว้นนานกว่าปกติก่อนเอารถลง และสลับคิวไปตัดโซนดินทรายก่อน' });
      if (sandy && f.past7 >= 30) out.push({ lv: 'ok', txt: s.soil + 'ระบายน้ำเร็ว — แม้ฝนสะสม ' + fmt(f.past7, 0) + ' มม. แปลงโซนนี้กลับเข้าได้เร็วกว่าโซนดินเหนียว จัดคิวตัดที่นี่ก่อนได้' });
    } else {
      if (sandy && (heavy3 >= 30 || next3 >= 50)) out.push({ lv: 'watch', txt: s.soil + ' + ฝนหนักที่กำลังมา (' + fmt(next3, 0) + ' มม./3วัน) — น้ำไม่ค่อยขังแต่ชะล้าง N/K สูง อย่าใส่ปุ๋ยก่อนฝนหนัก รอฝนซาแล้วแบ่งใส่ทีละน้อย' });
      if (clayey && f.past7 >= 100) out.push({ lv: 'high', txt: s.soil + 'ระบายน้ำช้า + ฝนสะสม ' + fmt(f.past7, 0) + ' มม./7วัน — เสี่ยงน้ำขังแปลงลุ่ม รากขาดออกซิเจน เร่งเปิดร่องระบายน้ำ' });
      if (s.om !== null && s.om < 1 && heavy3 >= 30) out.push({ lv: 'watch', txt: 'OM ต่ำ (' + fmt(s.om, 2) + '%) โครงสร้างหน้าดินอ่อนแอ + ฝนหนัก — เสี่ยงหน้าดินถูกชะล้าง/แน่นทึบ ใบอ้อยคลุมดินช่วยรับแรงเม็ดฝนได้มาก' });
      if (s.om !== null && s.om < 1 && f.past7 < 10) out.push({ lv: 'watch', txt: 'OM ต่ำ (' + fmt(s.om, 2) + '%) ดินอุ้มน้ำได้น้อย + ฝนทิ้งช่วง — แปลงโซนนี้จะเครียดน้ำเร็วกว่าโซน OM สูง ถ้ามีแหล่งน้ำให้ลำดับความสำคัญที่นี่ก่อน' });
      if (s.ph !== null && s.ph < 5.5 && f.past7 >= 60) out.push({ lv: 'watch', txt: 'ดินกรด (pH ' + fmt(s.ph, 1) + ') + ฝนชุกต่อเนื่อง — ธาตุเบสถูกชะล้างเพิ่ม ดินมีแนวโน้มกรดขึ้น วางแผนใส่ปูน/โดโลไมต์ช่วงปลายฝน (ขี้เถ้าหม้อไอน้ำของโรงงานก็ช่วยปรับ pH + ให้ K/Si ได้)' });
    }
    if (!out.length) out.push({ lv: 'ok', txt: s.soil + ' + สภาพอากาศช่วงนี้ — ไม่มีความเสี่ยงร่วมที่ต้องเฝ้าเป็นพิเศษ' });
    return out;
  }
  function comboBlockHtml(f, lat, lon) {
    var s = soilSummary(lat, lon);
    if (!s) return '';
    var items = comboAnalysis(f, s);
    return '<div class="wxp-combo">' +
      '<div class="wxp-combo-h">🧬 วิเคราะห์ร่วม ดิน × อากาศ</div>' +
      items.map(function (it) { return '<div class="wxp-combo-i lv-' + it.lv + '">' + esc(it.txt) + '</div>'; }).join('') +
    '</div>';
  }

  /* ── Cane advisory (cane-brain grounded, deterministic, SEASON-aware) ──── */
  function caneAdvisory(f) {
    var s = seasonInfo();
    var rainDays = 0, maxP = 0, maxDay = '';
    for (var i = 0; i < f.time.length; i++) {
      var p = f.rain[i] || 0;
      if (p >= 10) rainDays++;
      if (p > maxP) { maxP = p; maxDay = f.time[i]; }
    }

    if (s.id === 'grow') {
      // ย่างปล้อง: อ้อยต้องการน้ำมากที่สุด — ฝนคือเรื่องดี เฝ้าเฉพาะท่วมขัง/แล้ง
      if (f.past7 >= 150) return { lv: 'high', txt: 'ฝนสะสม 7 วัน ' + fmt(f.past7, 0) + ' มม. — เสี่ยงน้ำท่วมขังแปลงลุ่ม อ้อยทนน้ำขังได้ไม่กี่วัน รากจะเริ่มตาย ต้องรีบระบายน้ำออกให้เร็วที่สุด และเฝ้าระวังโรคที่มากับน้ำ (เหี่ยวเน่าแดง)' };
      if (f.past7 >= 60) return { lv: 'watch', txt: 'ฝนชุก (สะสม ' + fmt(f.past7, 0) + ' มม./7วัน) — ดีต่ออ้อยช่วงย่างปล้อง แต่ตรวจการระบายน้ำแปลงลุ่ม และถนนในไร่ลื่น สัญจรระวัง' };
      if (f.past7 < 10 && rainDays === 0) return { lv: 'watch', txt: 'ฝนทิ้งช่วง — ย่างปล้องคือช่วงที่อ้อยต้องการน้ำมากที่สุด แล้งต่อเนื่องกระทบผลผลิต พิจารณาให้น้ำเสริมถ้ามีแหล่งน้ำ' };
      return { lv: 'ok', txt: 'ฝนเหมาะสม — อ้อยช่วงย่างปล้องโตเร็ว ฝนช่วยสะสมน้ำหนักลำ (เก็บเกี่ยว ธ.ค.–มี.ค.)' };
    }
    if (s.id === 'preharvest') {
      // พ.ย.: อ้อยแห้งตัวสร้างความหวาน — ฝนตอนนี้ชะลอการสุกแก่
      if (maxP >= 30 || rainDays >= 3) return { lv: 'mid', txt: 'ฝนมากช่วงก่อนเปิดหีบ — ชะลอการสุกแก่/การสร้างความหวาน ถ้าฝนลากยาว CCS ต้นฤดูหีบอาจต่ำ วางแผนคิวเปิดหีบเผื่อ' };
      return { lv: 'ok', txt: 'อากาศเริ่มแห้ง — อ้อยเข้าสู่ช่วงสร้างความหวาน เตรียมความพร้อมรถตัด/คิวขนส่งก่อนเปิดหีบ ธ.ค.' };
    }
    if (s.id === 'plant') {
      if (maxP >= 30) return { lv: 'mid', txt: 'ฝนหนัก — เลื่อนปลูกช่วงดินแฉะ ท่อนพันธุ์เสี่ยงเน่า รอดินหมาดก่อนลงปลูก/แต่งตอ' };
      if (f.past7 < 5) return { lv: 'watch', txt: 'ดินแห้ง — การปลูก/แต่งตอควรรอฝนหรือให้น้ำช่วยการงอกของท่อนพันธุ์และตออ้อย' };
      return { lv: 'ok', txt: 'ความชื้นดินเหมาะปลูกและแต่งตอ — ท่อนพันธุ์งอกดี ตอแตกกอไว' };
    }

    // ฤดูเก็บเกี่ยว (ธ.ค.–มี.ค.) — กติกาตัด/ขนส่ง/CCS
    if (f.past7 >= 60) return { lv: 'high', txt: 'ฝนสะสม 7 วันที่ผ่านมา ' + fmt(f.past7, 0) + ' มม. — ดินยังแฉะ เสี่ยงรถตัด/รถบรรทุกติดหล่ม ดินอัดแน่น และดินติดอ้อย ควรรอแปลงแห้งก่อนตัด (หลังฝนหนักควรเว้น 7-14 วัน)' };
    if (maxP >= 30) return { lv: 'high', txt: 'มีวันฝนหนัก (' + fmt(maxP, 0) + ' มม. ' + thDate(maxDay) + ') — ฝนก่อนตัดทำให้อ้อยดูดน้ำ Brix เจือจาง CCS ตกชั่วคราว วางแผนเลี่ยง/เลื่อนคิวตัดเขตนี้' };
    if (rainDays >= 3) return { lv: 'mid', txt: 'ฝนตกต่อเนื่องใน 7 วันนี้ (' + rainDays + ' วัน) — วางแผนตัดอ้อยล่วงหน้า จัดคิวรถเผื่อแปลงแฉะ' };
    if (f.past7 >= 20) return { lv: 'watch', txt: 'ฝนสะสม 7 วันที่ผ่านมา ' + fmt(f.past7, 0) + ' มม. — แปลงบางจุดอาจยังชื้น ตรวจหน้าดินก่อนเอารถหนักลง' };
    if (rainDays >= 1) return { lv: 'watch', txt: 'มีฝนบางวัน — เฝ้าระวังเป็นช่วง ๆ' };
    if (Math.max.apply(null, f.tmax) >= 38) return { lv: 'watch', txt: 'ร้อนจัด — อ้อยเครียด ควรตัดช่วงเช้าและส่งเข้าหีบเร็ว ลดการสูญเสียน้ำหนัก/ความหวาน' };
    return { lv: 'ok', txt: 'อากาศดีและแปลงแห้ง — เหมาะเก็บเกี่ยวและขนส่งเต็มกำลัง' };
  }

  /* ── Right panel ─────────────────────────────────────────────────────── */
  // The card's static header (#wxSelTitle/#wxCoord) is the ONE place the
  // selected-point name lives — the body never repeats it.
  function setPanelHead(title, sub) {
    var t = document.getElementById('wxSelTitle');
    var c = document.getElementById('wxCoord');
    if (t) t.textContent = title;
    if (c) c.textContent = sub || '—';
  }
  function panelLoading(title) {
    var p = document.getElementById('wxPanel'); if (!p) return;
    p.innerHTML = '<div class="wxp-empty">กำลังโหลดพยากรณ์ ' + esc(title) + '…</div>';
  }
  function renderPanel(title, sub, factory, data) {
    var p = document.getElementById('wxPanel'); if (!p) return;
    setPanelHead((factory ? '🏭 ' : '📍 ') + title, sub);
    if (!data || !data.daily || !data.daily.time) { p.innerHTML = '<div class="wxp-empty">ดึงพยากรณ์ไม่สำเร็จ</div>'; return; }
    var f = splitDaily(data.daily);
    var cur = data.current || {};
    var cw = wx(cur.weather_code !== undefined ? cur.weather_code : f.code[0]);
    var adv = caneAdvisory(f);

    var days = f.time.map(function (t, i) {
      var w = wx(f.code[i]);
      var pr = f.rain[i] || 0, prob = f.prob[i] || 0;
      var lv = pr >= 30 ? 'high' : pr >= 10 ? 'mid' : (pr >= 1 || prob >= 60) ? 'watch' : 'ok';
      return '<div class="wxd lv-' + lv + '">' +
        '<div class="wxd-dow">' + thWeekday(t) + ' ' + thDate(t) + '</div>' +
        '<div class="wxd-emoji">' + w.e + '</div>' +
        '<div class="wxd-temp">' + fmt(f.tmax[i], 0) + '° / ' + fmt(f.tmin[i], 0) + '°</div>' +
        '<div class="wxd-rain">💧 ' + fmt(pr, 1) + '</div>' +
        '<div class="wxd-prob">' + fmt(prob, 0) + '%</div>' +
      '</div>';
    }).join('');

    p.innerHTML =
      '<div class="wxp-now">' +
        '<div class="wxp-now-emoji">' + cw.e + '</div>' +
        '<div>' +
          '<div class="wxp-now-temp">' + fmt(cur.temperature_2m !== undefined ? cur.temperature_2m : f.tmax[0], 0) + '°<span>/ ' + fmt(f.tmin[0], 0) + '°</span></div>' +
          '<div class="wxp-now-desc">' + esc(cw.t) + ' · ฝนวันนี้ ' + fmt(f.rain[0], 1) + ' มม. (' + fmt(f.prob[0], 0) + '%)</div>' +
          '<div class="wxp-now-meta">ความชื้น ' + fmt(cur.relative_humidity_2m, 0) + '% · ลม ' + fmt(cur.wind_speed_10m, 1) + ' กม./ชม. (' + windDir(cur.wind_direction_10m) + ')</div>' +
        '</div>' +
      '</div>' +
      '<div class="wxp-alert lv-' + adv.lv + '">🌱 ' + esc(adv.txt) + '</div>' +
      (lastLL ? comboBlockHtml(f, lastLL[0], lastLL[1]) : '') +
      statusStrip(f) +
      '<div class="wxp-acc">ฝนสะสม 7 วันที่ผ่านมา: <b style="color:' + wetColor(f.past7) + '">' + fmt(f.past7, 1) + ' มม.</b>' +
        (f.past7 >= 20 ? ' · แปลงอาจยังชื้น' : ' · แปลงแห้ง') + '</div>' +
      '<div class="wxp-days">' + days + '</div>' +
      '<div class="wxp-note">💧 = ฝน (มม.) · % = โอกาสฝน · ข้อมูล Open-Meteo</div>' +
      '<div class="wxp-tiles">' +
        tile('💨', 'sky', 'ลม', fmt(cur.wind_speed_10m, 1), 'กม./ชม. ' + windDir(cur.wind_direction_10m)) +
        tile('💧', 'blue', 'ความชื้น', fmt(cur.relative_humidity_2m, 0) + '%', (cur.relative_humidity_2m >= 80 ? 'สูง' : 'ปกติ')) +
        tile('🌡️', 'violet', 'ความกดอากาศ', fmt(cur.surface_pressure, 0), 'hPa') +
        tile('🌅', 'amber', 'พระอาทิตย์', hhmm(f.sunrise[0]) + ' ขึ้น', hhmm(f.sunset[0]) + ' ตก') +
      '</div>' +
      (lastLL ? soilBlockHtml(lastLL[0], lastLL[1]) : '');
  }
  /* 3-way operational status — the three chips change with the production
     season (cane-brain): harvest = cut/haul/CCS; grand-growth = growth/water-
     logging/travel; planting = germination/soil-moisture/field prep;
     pre-harvest = sugar build-up/dry-down/crush prep. */
  function statusStrip(f) {
    var s = seasonInfo();
    var today = f.rain[0] || 0;
    function chip(label, lv, txt) {
      return '<div class="wxs lv-' + lv + '"><div class="wxs-n">' + label + '</div><div class="wxs-v">' + txt + '</div></div>';
    }
    var a, b, c;
    if (s.id === 'grow') {
      a = (f.past7 < 10) ? ['🌿 การเจริญเติบโต', 'watch', 'ฝนทิ้งช่วง'] : ['🌿 การเจริญเติบโต', 'ok', 'ฝนดีต่ออ้อย'];
      b = f.past7 >= 150 ? ['💧 น้ำในแปลง', 'bad', 'เสี่ยงท่วมขัง'] : f.past7 >= 60 ? ['💧 น้ำในแปลง', 'watch', 'ระวังน้ำขัง'] : ['💧 น้ำในแปลง', 'ok', 'ปกติ'];
      c = today >= 30 ? ['🛣️ การเดินทาง', 'bad', 'ถนนลื่น/น้ำขัง'] : today >= 10 ? ['🛣️ การเดินทาง', 'watch', 'ระวังถนนลื่น'] : ['🛣️ การเดินทาง', 'ok', 'สะดวก'];
    } else if (s.id === 'plant') {
      a = today >= 30 ? ['🌱 การปลูก/งอก', 'watch', 'รอดินหมาด'] : f.past7 < 5 ? ['🌱 การปลูก/งอก', 'watch', 'ดินแห้ง'] : ['🌱 การปลูก/งอก', 'ok', 'เหมาะปลูก'];
      b = f.past7 >= 60 ? ['💧 ความชื้นดิน', 'watch', 'แฉะเกิน'] : f.past7 >= 5 ? ['💧 ความชื้นดิน', 'ok', 'พอดี'] : ['💧 ความชื้นดิน', 'watch', 'ต้องให้น้ำ'];
      c = today >= 10 ? ['🚜 เตรียมแปลง', 'watch', 'ระวังดินแฉะ'] : ['🚜 เตรียมแปลง', 'ok', 'ทำได้'];
    } else if (s.id === 'preharvest') {
      a = (today >= 10 || f.past7 >= 60) ? ['🍬 สร้างความหวาน', 'watch', 'ฝนช้าการสุก'] : ['🍬 สร้างความหวาน', 'ok', 'กำลังดี'];
      b = f.past7 >= 60 ? ['💧 แปลงแห้งตัว', 'watch', 'ยังชื้น'] : ['💧 แปลงแห้งตัว', 'ok', 'แห้งตามแผน'];
      c = ['🛠️ เตรียมเปิดหีบ', 'ok', 'อีก ' + daysToHarvest() + ' วัน'];
    } else {
      a = (today >= 30 || f.past7 >= 60) ? ['🚜 ตัดอ้อย', 'bad', 'ควรเลื่อน'] : (today >= 10 || f.past7 >= 20) ? ['🚜 ตัดอ้อย', 'watch', 'เฝ้าระวัง'] : ['🚜 ตัดอ้อย', 'ok', 'ตัดได้'];
      b = f.past7 >= 60 ? ['🚚 ขนส่ง', 'bad', 'เสี่ยงติดหล่ม'] : (f.past7 >= 20 || today >= 10) ? ['🚚 ขนส่ง', 'watch', 'ระวังแปลงแฉะ'] : ['🚚 ขนส่ง', 'ok', 'คล่องตัว'];
      c = today >= 10 ? ['🍬 ความหวาน', 'watch', 'Brix เจือจาง'] : f.past7 >= 60 ? ['🍬 ความหวาน', 'watch', 'รอแปลงแห้ง'] : ['🍬 ความหวาน', 'ok', 'ปกติ'];
    }
    return '<div class="wxp-status">' + chip(a[0], a[1], a[2]) + chip(b[0], b[1], b[2]) + chip(c[0], c[1], c[2]) + '</div>';
  }

  function tile(emoji, hue, name, big, sub) {
    return '<div class="wxt"><div class="wxt-ic hue-' + hue + '">' + emoji + '</div><div class="wxt-name">' + esc(name) + '</div>' +
      '<div class="wxt-big">' + esc(big) + '</div><div class="wxt-sub">' + esc(sub) + '</div></div>';
  }

  /* ── AI brief (Groq via gateway, cane-brain-grounded system prompt) ───── */
  function aiSystem() {
    var s = seasonInfo();
    var base = [
      'คุณคือนักวิชาการเกษตรผู้เชี่ยวชาญอ้อยของโรงงานน้ำตาลมิตรลาว ให้คำแนะนำจากพยากรณ์อากาศจริงเท่านั้น',
      'หลักวิชาการ (cane-brain): ฝนก่อนตัด → Brix เจือจาง CCS ตกชั่วคราว รอ 7-14 วันหลังฝน · ดินแฉะ → รถติดหล่ม ดินอัดแน่น ดินติดอ้อย · ย่างปล้อง (มิ.ย.-ต.ค.) อ้อยต้องการน้ำมากที่สุด ฝนคือผลดี แต่ระวังน้ำท่วมขังเกิน 24-48 ชม. รากขาดออกซิเจน · พ.ย. อ้อยแห้งตัวสร้างความหวาน ฝนชะลอการสุกแก่ · ร้อนจัด → ตัดเช้า ส่งหีบเร็ว',
      'ปฏิสัมพันธ์ดิน×ฝน (ใช้ soil_* ใน facts): ดินทราย+ฝนหนัก → ปุ๋ย N/K ถูกชะล้าง ห้ามใส่ปุ๋ยก่อนฝน รอฝนซาแล้วแบ่งใส่ · ดินเหนียว+ฝนสะสมมาก → ระบายช้า เสี่ยงน้ำขัง เร่งเปิดร่องระบาย และแห้งช้ากว่าดินทราย (ตัดโซนดินทรายก่อน) · OM ต่ำ (<1%)+ฝนหนัก → หน้าดินถูกชะล้าง/แน่นทึบ ควรไว้ใบอ้อยคลุมดิน · OM ต่ำ+ฝนทิ้งช่วง → อุ้มน้ำได้น้อย เครียดน้ำเร็ว ให้น้ำโซนนี้ก่อน · ดินกรด (pH<5.5)+ฝนชุก → ธาตุเบสถูกชะล้าง ใส่ปูน/โดโลไมต์หรือขี้เถ้าหม้อไอน้ำปลายฝน',
      'บริบทปัจจุบัน: ' + s.emoji + ' ' + s.label + ' (' + s.range + ') · ฤดูเก็บเกี่ยวคือ ธ.ค.–มี.ค.' +
        (s.id === 'harvest'
          ? ' — โฟกัสแผนตัด-ขนส่งรายวัน จัดกลุ่ม: ตัดได้เต็มกำลัง / เฝ้าระวัง / ควรเลี่ยง-เลื่อน + คำแนะนำจัดคิวรถ'
          : ' — ตอนนี้ยังไม่ใช่ฤดูตัด ห้ามแนะนำให้ตัดอ้อย! อีก ' + daysToHarvest() + ' วันจะเปิดหีบ โฟกัส: การดูแลแปลงช่วงนี้ การระบายน้ำ/น้ำท่วมขัง โรคช่วงฝน การเดินทางเข้าแปลง และการเตรียมพร้อมก่อนเปิดหีบ จัดกลุ่มเขตเป็น: ปกติ-ฝนดีต่ออ้อย / เฝ้าระวังน้ำขัง-การเดินทาง / ต้องเร่งระบายน้ำ'),
      'กติกา: 1) ใช้เฉพาะตัวเลขใน facts ห้ามเดา 2) ตอบไทย กระชับ 3) นอกเรื่องอ้อย/อากาศ ให้ปฏิเสธ'
    ];
    return base.join('\n');
  }

  function aiBrief() {
    var box = document.getElementById('wxAiBody');
    var btn = document.getElementById('wxAiBtn');
    if (!box) return;
    var zonesReady = ZONES.filter(function (z) { return z._f; });
    if (zonesReady.length < 5) { box.innerHTML = '<div class="wxai-load">ข้อมูลเขตยังโหลดไม่ครบ ลองอีกครั้งในอีกสักครู่</div>'; return; }
    if (btn) btn.disabled = true;
    box.innerHTML = '<div class="wxai-load">🤖 AI กำลังวิเคราะห์ทุกเขต…</div>';
    var facts = zonesReady.map(function (z) {
      var one = { zone: z.name, province: z.prov, priority: z.key ? 1 : 0,
        rain_past7day_mm: Math.round(z._f.past7 * 10) / 10,
        rain_today_mm: Math.round((z._f.rain[0] || 0) * 10) / 10,
        rain_next3day_mm: Math.round(((z._f.rain[0] || 0) + (z._f.rain[1] || 0) + (z._f.rain[2] || 0)) * 10) / 10,
        tmax_today: z._f.tmax[0] };
      // Real lab soil data for the zone (fields within 15 km), when available.
      var s = soilSummary(z.lat, z.lon);
      if (s) {
        one.soil_texture = s.soil;
        one.soil_om_pct = s.om !== null ? Math.round(s.om * 100) / 100 : null;
        one.soil_ph = s.ph !== null ? Math.round(s.ph * 10) / 10 : null;
        one.soil_fields_tested = s.n;
      }
      return one;
    });
    var s = seasonInfo();
    var prompt = 'พยากรณ์จริง + ข้อมูลดินจากผลแล็บรายเขต (past7=ฝนสะสม7วันที่ผ่านมา, today=ฝนวันนี้, next3=ฝนรวม3วันข้างหน้า หน่วย มม.; soil_texture=ชนิดดินเด่น, soil_om_pct=อินทรียวัตถุ%, soil_ph=pH ดิน, soil_fields_tested=จำนวนแปลงตรวจจริง):\n' +
      JSON.stringify(facts) + '\n\n' +
      (s.id === 'harvest' ? 'ช่วยสรุปแผนตัด-ขนส่งอ้อยวันนี้สำหรับทุกเขต'
        : 'ช่วยสรุปสถานการณ์แปลงอ้อยวันนี้ทุกเขต (ตอนนี้' + s.label + ' ยังไม่ตัด) — การดูแลแปลง การระบายน้ำ การเดินทาง และการเตรียมพร้อมก่อนเปิดหีบ') +
      '\nสำคัญ: เขตที่ priority=1 คือโซนอ้อยหลักของโรงงาน ให้วิเคราะห์โซนเหล่านี้ก่อนแบบละเอียดรายเขต (ขึ้นหัวข้อ "⭐ โซนอ้อยหลัก") โดยผสมข้อมูลดิน (soil_*) กับฝนตามหลักปฏิสัมพันธ์ดิน×ฝน แล้วค่อยสรุปเขตอื่นแบบย่อ · ถ้าเขตใดไม่มี soil_* คือยังไม่มีผลตรวจดินใกล้เคียง ห้ามเดาค่าดิน';
    fetch(AI_GATEWAY, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + AI_ANON, 'apikey': AI_ANON },
      body: JSON.stringify({ action: 'quick-ask', payload: { provider: 'groq', model: 'llama-3.3-70b-versatile', system: aiSystem(), prompt: prompt, facts: { kpis: [] }, maxTokens: 900 } })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (btn) btn.disabled = false;
        if (d && d.result && d.result.text) {
          // Collapsible result: a header bar toggles the body so the analysis
          // doesn't permanently push the forecast panel down.
          box.innerHTML =
            '<div class="wxai-bar" id="wxAiBar">' +
              '<span>🤖 ผลวิเคราะห์ AI · ' + zonesReady.length + ' เขต</span>' +
              '<span class="wxai-toggle" id="wxAiToggle">พับเก็บ ▴</span>' +
            '</div>' +
            '<div class="wxai-wrap" id="wxAiWrap">' +
              '<div class="wxai-text">' + esc(d.result.text.trim()).replace(/\n/g, '<br>') + '</div>' +
              '<div class="wxai-cred">🤖 AI · วิเคราะห์จากพยากรณ์จริง ' + zonesReady.length + ' เขต · หลักวิชาการอ้อย</div>' +
            '</div>';
          var bar = document.getElementById('wxAiBar');
          bar.addEventListener('click', function () {
            var w = document.getElementById('wxAiWrap');
            var t = document.getElementById('wxAiToggle');
            var hide = !w.hidden;
            w.hidden = hide;
            t.textContent = hide ? 'ดูผล ▾' : 'พับเก็บ ▴';
          });
        } else {
          var em = (d && d.error && d.error.message) || 'ไม่ทราบสาเหตุ';
          box.innerHTML = '<div class="wxai-load">' + (/rate limit|TPM/i.test(em) ? '⏳ AI ไม่ว่างชั่วคราว รอ 20-30 วิแล้วลองใหม่' : 'ตอบไม่สำเร็จ: ' + esc(em)) + '</div>';
        }
      })
      .catch(function () { if (btn) btn.disabled = false; box.innerHTML = '<div class="wxai-load">เชื่อมต่อ AI ไม่สำเร็จ</div>'; });
  }

  /* ── Rain radar (RainViewer, free) ────────────────────────────────────── */
  var radar = { host: null, path: null, time: null };
  function loadRadarMeta() {
    // 5-min cache — radar frames update every ~10 min anyway.
    try {
      var c = JSON.parse(localStorage.getItem('idash.wxRadar') || 'null');
      if (c && Date.now() - c.ts < 300000) { radar.host = c.host; radar.path = c.path; radar.time = c.time; return Promise.resolve(radar); }
    } catch (e) {}
    return fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var frames = (j && j.radar && j.radar.past) || [];
        var last = frames[frames.length - 1];
        if (last) {
          radar.host = j.host; radar.path = last.path; radar.time = last.time;
          try { localStorage.setItem('idash.wxRadar', JSON.stringify({ ts: Date.now(), host: radar.host, path: radar.path, time: radar.time })); } catch (e) {}
        }
        return radar;
      });
  }
  function radarTileUrl() {
    return radar.host && radar.path ? (radar.host + radar.path + '/256/{z}/{x}/{y}/2/1_1.png') : null;
  }
  function stampUpdated() {
    var el = document.getElementById('wxStamp');
    if (!el) return;
    var d = radar.time ? new Date(radar.time * 1000) : new Date();
    el.textContent = 'อัปเดตล่าสุด ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' น.';
  }

  /* ── Map (3D MapLibre with key → fallback 2D Leaflet) ─────────────────── */
  // One view only, per the owner: the weather map (satellite base + live rain
  // radar always on). Pins colour by today's forecast rain risk.
  var activeGoTo = null, activeDrawBoundary = null, activeSoilToggle = null;
  var lastLL = null;   // the point the panel is describing (for the soil block)
  var soilOn = false;

  function pinColorFor(z) {
    if (!z._f) return '#64748b';
    return riskColor(z._f.rain[0] || 0);
  }
  function repaintPins() {
    ZONES.forEach(function (z) {
      var c = pinColorFor(z);
      if (z._el) z._el.style.background = c;
      if (z._m) z._m.setStyle({ fillColor: c });
    });
  }

  function selectZoneCommon(z) {
    lastLL = [z.lat, z.lon];
    if (activeDrawBoundary) activeDrawBoundary(null);
    if (z._data) renderPanel(z.name, z.prov, z.factory, z._data);
    else {
      panelLoading(z.name);
      forecast(z.lat, z.lon).then(function (d) { z._data = d; z._f = splitDaily(d.daily); repaintPins(); renderPanel(z.name, z.prov, z.factory, d); })
        .catch(function () { renderPanel(z.name, z.prov, z.factory, null); });
    }
  }
  function prefetchZones() {
    ZONES.forEach(function (z) {
      forecast(z.lat, z.lon).then(function (d) {
        z._data = d; z._f = splitDaily(d.daily);
        var c = pinColorFor(z);
        if (z._el) z._el.style.background = c;
        if (z._m) z._m.setStyle({ fillColor: c });
      }).catch(function () {});
    });
  }

  function boot3D(mapEl) {
    mapEl.innerHTML = '';
    var map, loaded = false;
    var fallback = setTimeout(function () {
      if (loaded) return;
      try { map.remove(); } catch (e) {}
      mapEl.innerHTML = '';
      if (window.L) boot2D(mapEl); else mapEl.innerHTML = '<div class="wx-fallback">แผนที่โหลดไม่สำเร็จ</div>';
    }, 8000);

    map = new maplibregl.Map({
      container: 'wxMap',
      style: 'https://api.maptiler.com/maps/hybrid/style.json?key=' + MAPTILER_KEY,
      center: [105.1, 16.7], zoom: 7.0, pitch: 55, bearing: -12, maxPitch: 80, attributionControl: true
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    activeGoTo = function (lat, lon) { map.flyTo({ center: [lon, lat], zoom: 11, pitch: 60, duration: 900 }); };
    activeDrawBoundary = function (geojson) {
      var empty = { type: 'FeatureCollection', features: [] };
      var data = geojson ? { type: 'Feature', geometry: geojson, properties: {} } : empty;
      var src = map.getSource('wx-boundary');
      if (src) { src.setData(data); return; }
      if (!map.isStyleLoaded()) { map.once('load', function () { activeDrawBoundary(geojson); }); return; }
      map.addSource('wx-boundary', { type: 'geojson', data: data });
      map.addLayer({ id: 'wx-boundary-fill', type: 'fill', source: 'wx-boundary', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.14 } });
      map.addLayer({ id: 'wx-boundary-line', type: 'line', source: 'wx-boundary', paint: { 'line-color': '#60a5fa', 'line-width': 2.5, 'line-opacity': 0.95 } });
    };

    map.on('load', function () {
      loaded = true; clearTimeout(fallback);
      try {
        map.addSource('terrain', { type: 'raster-dem', url: 'https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=' + MAPTILER_KEY });
        map.setTerrain({ source: 'terrain', exaggeration: 1.4 });
      } catch (e) {}

      // Live rain radar — always on over the satellite base.
      loadRadarMeta().then(function () {
        var url = radarTileUrl();
        if (url) {
          try {
            map.addSource('wx-radar', { type: 'raster', tiles: [url], tileSize: 256 });
            map.addLayer({ id: 'wx-radar', type: 'raster', source: 'wx-radar', paint: { 'raster-opacity': 0.8 } });
          } catch (e) {}
        }
        stampUpdated();
      });

      // Soil sampling points (lazy — built on first toggle).
      var soilEls = [];
      activeSoilToggle = function (on) {
        if (on && !soilEls.length && window.IFIELD_SOIL) {
          window.IFIELD_SOIL.pts.forEach(function (p) {
            var el = document.createElement('div');
            el.className = 'wx-soil';
            el.style.background = omColor(p[2]);
            el.title = 'OM ' + p[2] + '% · pH ' + p[3] + ' · ' + (p[6] || '') + ' · ' + (p[7] || '');
            new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([p[1], p[0]]).addTo(map);
            soilEls.push(el);
          });
        }
        soilEls.forEach(function (el) { el.style.display = on ? '' : 'none'; });
      };

      ZONES.forEach(function (z) {
        var el = document.createElement('div');
        el.className = 'wx-pin' + (z.factory ? ' factory' : '') + (z.key ? ' key' : '');
        el.title = (z.factory ? '🏭 ' : z.key ? '⭐ ' : '') + z.name + ' · ' + z.prov;
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([z.lon, z.lat]).addTo(map);
        z._el = el;
        el.addEventListener('click', function (ev) {
          ev.stopPropagation();
          map.flyTo({ center: [z.lon, z.lat], zoom: Math.max(map.getZoom(), 9.5), duration: 800 });
          selectZoneCommon(z);
        });
      });
      prefetchZones();
      selectZoneCommon(ZONES[0]);
    });

    map.on('click', function (e) {
      panelLoading('จุดที่เลือก');
      setCoordLabel(e.lngLat.lat, e.lngLat.lng);
      forecast(e.lngLat.lat, e.lngLat.lng)
        .then(function (d) { renderPanel('จุดที่เลือกบนแผนที่', fmt(e.lngLat.lat, 3) + ', ' + fmt(e.lngLat.lng, 3), false, d); })
        .catch(function () { renderPanel('จุดที่เลือก', '', false, null); });
    });
    return true;
  }

  function boot2D(mapEl) {
    var map = L.map('wxMap', { scrollWheelZoom: true, zoomControl: true }).fitBounds([[15.4, 104.3], [18.0, 106.6]]);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
    activeGoTo = function (lat, lon) { map.setView([lat, lon], 12, { animate: true }); };
    var boundaryLayer = null;
    activeDrawBoundary = function (geojson) {
      if (boundaryLayer) { try { map.removeLayer(boundaryLayer); } catch (e) {} boundaryLayer = null; }
      if (!geojson) return;
      boundaryLayer = L.geoJSON({ type: 'Feature', geometry: geojson, properties: {} }, {
        style: { color: '#60a5fa', weight: 2.5, opacity: 0.95, fillColor: '#3b82f6', fillOpacity: 0.14 }
      }).addTo(map);
    };

    // Live rain radar — always on.
    loadRadarMeta().then(function () {
      var url = radarTileUrl();
      if (url) L.tileLayer(url, { opacity: 0.8 }).addTo(map);
      stampUpdated();
    });

    // Soil sampling points (Leaflet layer, lazy-built).
    var soilLayer = null;
    activeSoilToggle = function (on) {
      if (on) {
        if (!soilLayer && window.IFIELD_SOIL) {
          soilLayer = L.layerGroup(window.IFIELD_SOIL.pts.map(function (p) {
            return L.circleMarker([p[0], p[1]], { radius: 4, color: '#0b1220', weight: 1, fillColor: omColor(p[2]), fillOpacity: .9 })
              .bindTooltip('OM ' + p[2] + '% · pH ' + p[3] + ' · ' + (p[6] || '') + ' · ' + (p[7] || ''));
          }));
        }
        if (soilLayer) soilLayer.addTo(map);
      } else if (soilLayer) { map.removeLayer(soilLayer); }
    };

    ZONES.forEach(function (z) {
      var m = L.circleMarker([z.lat, z.lon], {
        radius: z.factory ? 11 : z.key ? 10 : 8,
        color: z.key ? '#fbbf24' : '#ffffff', weight: z.key ? 3.5 : 2.5,
        fillColor: '#64748b', fillOpacity: 1
      }).addTo(map);
      m.bindTooltip((z.factory ? '🏭 ' : z.key ? '⭐ ' : '') + z.name + ' · ' + z.prov, { direction: 'top' });
      m.on('click', function () { selectZoneCommon(z); });
      z._m = m;
    });
    prefetchZones();
    selectZoneCommon(ZONES[0]);

    map.on('click', function (e) {
      panelLoading('จุดที่เลือก');
      setCoordLabel(e.latlng.lat, e.latlng.lng);
      forecast(e.latlng.lat, e.latlng.lng)
        .then(function (d) { renderPanel('จุดที่เลือกบนแผนที่', fmt(e.latlng.lat, 3) + ', ' + fmt(e.latlng.lng, 3), false, d); })
        .catch(function () { renderPanel('จุดที่เลือก', '', false, null); });
    });

    setTimeout(function () { map.invalidateSize(); }, 200);
    return true;
  }

  function setCoordLabel(lat, lon) {
    lastLL = [lat, lon];
    var el = document.getElementById('wxCoord');
    if (el) el.textContent = fmt(lat, 3) + ', ' + fmt(lon, 3);
  }

  function bootMap() {
    var mapEl = document.getElementById('wxMap');
    if (!mapEl) return false;
    if (MAPTILER_KEY && window.maplibregl) return boot3D(mapEl);
    if (window.L) return boot2D(mapEl);
    mapEl.innerHTML = '<div class="wx-fallback">แผนที่โหลดไม่สำเร็จ — ต้องต่ออินเทอร์เน็ต</div>';
    return true;
  }

  /* ── Village search (Nominatim, boundary geojson) ─────────────────────── */
  function geocode(name) {
    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=th&countrycodes=la,th&polygon_geojson=1&q=' + encodeURIComponent(name);
    return fetch(url).then(function (r) { return r.json(); }).then(function (list) {
      return (list || []).map(function (r) {
        return { name: r.name || String(r.display_name || '').split(',')[0], display: r.display_name || r.name,
          latitude: parseFloat(r.lat), longitude: parseFloat(r.lon), geojson: r.geojson || null };
      }).filter(function (r) { return !isNaN(r.latitude) && !isNaN(r.longitude); });
    });
  }
  function wireSearch() {
    var inp = document.getElementById('wxSearchInput');
    var btn = document.getElementById('wxSearchBtn');
    var res = document.getElementById('wxSearchResults');
    if (!inp || !btn) return;
    function go() {
      var q = inp.value.trim(); if (!q) return;
      res.innerHTML = '<div class="wx-sr-load">กำลังค้นหา…</div>';
      geocode(q).then(function (list) {
        if (!list.length) { res.innerHTML = '<div class="wx-sr-load">ไม่พบ "' + esc(q) + '" — ลองพิมพ์เป็นอังกฤษ หรือคลิกจุดบนแผนที่</div>'; return; }
        res.innerHTML = list.map(function (r, i) { return '<button class="wx-sr" data-i="' + i + '">' + esc(r.display) + '</button>'; }).join('');
        [].forEach.call(res.querySelectorAll('.wx-sr'), function (b) {
          b.addEventListener('click', function () {
            var r = list[+b.getAttribute('data-i')];
            res.innerHTML = ''; inp.value = r.name;
            if (activeGoTo) activeGoTo(r.latitude, r.longitude);
            if (activeDrawBoundary) activeDrawBoundary(r.geojson && /Polygon/i.test(r.geojson.type) ? r.geojson : null);
            setCoordLabel(r.latitude, r.longitude);
            panelLoading(r.name);
            var sub = String(r.display || '').split(',').slice(1, 4).join(',').trim() || (fmt(r.latitude, 3) + ', ' + fmt(r.longitude, 3));
            forecast(r.latitude, r.longitude)
              .then(function (d) { renderPanel(r.name, sub, false, d); })
              .catch(function () { renderPanel(r.name, sub, false, null); });
          });
        });
      }).catch(function () { res.innerHTML = '<div class="wx-sr-load">ค้นหาไม่สำเร็จ — ตรวจอินเทอร์เน็ต</div>'; });
    }
    btn.addEventListener('click', go);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  }

  /* ── Priority-zone quick bar (⭐ key zones — one tap to its forecast) ──── */
  function wireKeyBar() {
    var bar = document.getElementById('wxKeyBar');
    if (!bar) return;
    ZONES.filter(function (z) { return z.key; }).forEach(function (z) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'if-key';
      b.textContent = '⭐ ' + (z.short || z.name);
      b.title = z.name + ' · ' + z.prov + (z.approx ? ' (พิกัดโดยประมาณ)' : '');
      b.addEventListener('click', function () {
        [].forEach.call(bar.querySelectorAll('.if-key'), function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        if (activeGoTo) activeGoTo(z.lat, z.lon);
        selectZoneCommon(z);
      });
      bar.appendChild(b);
    });
  }

  /* ── Header date + tabs + AI wiring ──────────────────────────────────── */
  function wireChrome() {
    var d = new Date();
    var el = document.getElementById('wxToday');
    if (el) el.textContent = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' +
      ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' น.';
    var rf = document.getElementById('wxRefresh');
    if (rf) rf.addEventListener('click', function () { location.reload(); });

    // Season pill + season-appropriate AI button label.
    var s = seasonInfo();
    var sp = document.getElementById('wxSeason');
    if (sp) {
      sp.textContent = s.emoji + ' ' + s.label +
        (s.id === 'harvest' ? ' · กำลังเปิดหีบ' : ' · อีก ' + daysToHarvest() + ' วันถึงเปิดหีบ (ธ.ค.–มี.ค.)');
    }
    var aiBtn = document.getElementById('wxAiBtn');
    if (aiBtn) {
      aiBtn.textContent = s.id === 'harvest' ? '🤖 AI วางแผนตัดวันนี้' : '🤖 AI วิเคราะห์แปลงวันนี้';
      aiBtn.addEventListener('click', aiBrief);
    }

    var soilBtn = document.getElementById('wxSoilBtn');
    if (soilBtn) {
      soilBtn.addEventListener('click', function () {
        soilOn = !soilOn;
        soilBtn.classList.toggle('on', soilOn);
        if (activeSoilToggle) activeSoilToggle(soilOn);
      });
    }
  }

  /* ── Home preview card (#homeWx) ─────────────────────────────────────── */
  function bootHome() {
    var el = document.getElementById('homeWx');
    if (!el) return false;
    var z = ZONES[0];
    forecast(z.lat, z.lon).then(function (data) {
      if (!data || !data.daily) { el.querySelector('[data-wxbody]').textContent = 'ดึงพยากรณ์ไม่สำเร็จ'; return; }
      var f = splitDaily(data.daily);
      var adv = caneAdvisory(f);
      var mini = f.time.slice(0, 4).map(function (t, i) {
        var w = wx(f.code[i]);
        return '<div class="hw-day"><div class="hw-dow">' + thWeekday(t) + '</div>' +
          '<div class="hw-emoji">' + w.e + '</div>' +
          '<div class="hw-t">' + fmt(f.tmax[i], 0) + '°</div>' +
          '<div class="hw-r">💧' + fmt(f.rain[i], 0) + '</div></div>';
      }).join('');
      el.querySelector('[data-wxbody]').innerHTML =
        '<div class="hw-alert lv-' + adv.lv + '">' + esc(adv.txt.length > 90 ? adv.txt.slice(0, 90) + '…' : adv.txt) + '</div>' +
        '<div class="hw-days">' + mini + '</div>';
    }).catch(function () { el.querySelector('[data-wxbody]').textContent = 'ดึงพยากรณ์ไม่สำเร็จ'; });
    return true;
  }

  function boot() {
    if (document.getElementById('wxMap')) { bootMap(); wireSearch(); wireChrome(); wireKeyBar(); return; }
    bootHome();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
