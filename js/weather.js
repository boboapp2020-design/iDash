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

  /* ── Zones (สะหวันนะเขต all 15 districts + คำม่วน main towns) ──────────── */
  var ZONES = [
    { name: 'เมืองสะหวันนะเขต (ไกสอน)', prov: 'สะหวันนะเขต', lat: 16.556, lon: 104.751, factory: true },
    { name: 'อุทุมพอน (Outhoumphone)', prov: 'สะหวันนะเขต', lat: 16.620, lon: 105.030 },
    { name: 'ไซบูลี (Xaybuly)', prov: 'สะหวันนะเขต', lat: 16.860, lon: 105.130 },
    { name: 'ไซพูทอง (Xaiphouthong)', prov: 'สะหวันนะเขต', lat: 16.330, lon: 104.960 },
    { name: 'จำพอน (Champhone)', prov: 'สะหวันนะเขต', lat: 16.220, lon: 105.140 },
    { name: 'สองคอน (Songkhone)', prov: 'สะหวันนะเขต', lat: 16.100, lon: 105.000 },
    { name: 'ท่าปางทอง (Thapangthong)', prov: 'สะหวันนะเขต', lat: 16.400, lon: 105.330 },
    { name: 'อาดสะพังทอง (Atsaphangthong)', prov: 'สะหวันนะเขต', lat: 16.730, lon: 105.300 },
    { name: 'พะลานไซ (Phalanxay)', prov: 'สะหวันนะเขต', lat: 16.480, lon: 105.520 },
    { name: 'อาดสะพอน (Atsaphone)', prov: 'สะหวันนะเขต', lat: 16.930, lon: 105.520 },
    { name: 'ซนบุรี (Xonbuly)', prov: 'สะหวันนะเขต', lat: 15.950, lon: 105.420 },
    { name: 'พิน (Phine)', prov: 'สะหวันนะเขต', lat: 16.530, lon: 105.750 },
    { name: 'วีละบุรี (Vilabuly)', prov: 'สะหวันนะเขต', lat: 16.720, lon: 105.950 },
    { name: 'เซโปน (Xepon)', prov: 'สะหวันนะเขต', lat: 16.690, lon: 106.220 },
    { name: 'นอง (Nong)', prov: 'สะหวันนะเขต', lat: 16.450, lon: 106.420 },
    { name: 'ท่าแขก (Thakhek)', prov: 'คำม่วน', lat: 17.411, lon: 104.821 },
    { name: 'หนองบก (Nongbok)', prov: 'คำม่วน', lat: 17.100, lon: 104.930 },
    { name: 'เซบั้งไฟ (Xebangfai)', prov: 'คำม่วน', lat: 16.980, lon: 105.120 },
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

  /* ── Open-Meteo: 7 past + 7 future days + current, one call ──────────── */
  function forecast(lat, lon) {
    var url = FORECAST + '?latitude=' + lat + '&longitude=' + lon +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset' +
      '&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code' +
      '&timezone=auto&forecast_days=7&past_days=7';
    return fetch(url).then(function (r) { return r.json(); });
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

  /* ── Cane advisory (cane-brain grounded, deterministic) ───────────────── */
  function caneAdvisory(f) {
    var rainDays = 0, maxP = 0, maxDay = '';
    for (var i = 0; i < f.time.length; i++) {
      var p = f.rain[i] || 0;
      if (p >= 10) rainDays++;
      if (p > maxP) { maxP = p; maxDay = f.time[i]; }
    }
    if (f.past7 >= 60) return { lv: 'high', txt: 'ฝนสะสม 7 วันที่ผ่านมา ' + fmt(f.past7, 0) + ' มม. — ดินยังแฉะ เสี่ยงรถตัด/รถบรรทุกติดหล่ม ดินอัดแน่น และดินติดอ้อย ควรรอแปลงแห้งก่อนตัด (หลังฝนหนักควรเว้น 7-14 วัน)' };
    if (maxP >= 30) return { lv: 'high', txt: 'มีวันฝนหนัก (' + fmt(maxP, 0) + ' มม. ' + thDate(maxDay) + ') — ฝนก่อนตัดทำให้อ้อยดูดน้ำ Brix เจือจาง CCS ตกชั่วคราว วางแผนเลี่ยง/เลื่อนคิวตัดเขตนี้' };
    if (rainDays >= 3) return { lv: 'mid', txt: 'ฝนตกต่อเนื่องใน 7 วันนี้ (' + rainDays + ' วัน) — วางแผนตัดอ้อยล่วงหน้า จัดคิวรถเผื่อแปลงแฉะ' };
    if (f.past7 >= 20) return { lv: 'watch', txt: 'ฝนสะสม 7 วันที่ผ่านมา ' + fmt(f.past7, 0) + ' มม. — แปลงบางจุดอาจยังชื้น ตรวจหน้าดินก่อนเอารถหนักลง' };
    if (rainDays >= 1) return { lv: 'watch', txt: 'มีฝนบางวัน — เฝ้าระวังเป็นช่วง ๆ' };
    if (Math.max.apply(null, f.tmax) >= 38) return { lv: 'watch', txt: 'ร้อนจัด — อ้อยเครียด ควรตัดช่วงเช้าและส่งเข้าหีบเร็ว ลดการสูญเสียน้ำหนัก/ความหวาน' };
    return { lv: 'ok', txt: 'อากาศดีและแปลงแห้ง — เหมาะเก็บเกี่ยวและขนส่งเต็มกำลัง' };
  }

  /* ── Right panel ─────────────────────────────────────────────────────── */
  function panelLoading(title) {
    var p = document.getElementById('wxPanel'); if (!p) return;
    p.innerHTML = '<div class="wxp-empty">กำลังโหลดพยากรณ์ ' + esc(title) + '…</div>';
  }
  function renderPanel(title, sub, factory, data) {
    var p = document.getElementById('wxPanel'); if (!p) return;
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
      '<div class="wxp-head">' +
        '<div class="wxp-title">' + (factory ? '🏭 ' : '📍 ') + esc(title) + '</div>' +
        '<div class="wxp-sub">' + esc(sub) + '</div>' +
      '</div>' +
      '<div class="wxp-now">' +
        '<div class="wxp-now-emoji">' + cw.e + '</div>' +
        '<div>' +
          '<div class="wxp-now-temp">' + fmt(cur.temperature_2m !== undefined ? cur.temperature_2m : f.tmax[0], 0) + '°<span>/ ' + fmt(f.tmin[0], 0) + '°</span></div>' +
          '<div class="wxp-now-desc">' + esc(cw.t) + ' · ฝนวันนี้ ' + fmt(f.rain[0], 1) + ' มม. (' + fmt(f.prob[0], 0) + '%)</div>' +
          '<div class="wxp-now-meta">ความชื้น ' + fmt(cur.relative_humidity_2m, 0) + '% · ลม ' + fmt(cur.wind_speed_10m, 1) + ' กม./ชม. (' + windDir(cur.wind_direction_10m) + ')</div>' +
        '</div>' +
      '</div>' +
      '<div class="wxp-alert lv-' + adv.lv + '">🌱 ' + esc(adv.txt) + '</div>' +
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
      '</div>';
  }
  /* 3-way operational status (deterministic, cane-brain thresholds):
     ตัดอ้อย = today's rain + wet-field; ขนส่ง = soil trafficability from
     past-7d accumulation; ความหวาน = Brix dilution risk from recent rain. */
  function statusStrip(f) {
    var today = f.rain[0] || 0;
    function chip(label, lv, txt) {
      return '<div class="wxs lv-' + lv + '"><div class="wxs-n">' + label + '</div><div class="wxs-v">' + txt + '</div></div>';
    }
    var cut = (today >= 30 || f.past7 >= 60) ? ['bad', 'ควรเลื่อน'] : (today >= 10 || f.past7 >= 20) ? ['watch', 'เฝ้าระวัง'] : ['ok', 'ตัดได้'];
    var haul = f.past7 >= 60 ? ['bad', 'เสี่ยงติดหล่ม'] : (f.past7 >= 20 || today >= 10) ? ['watch', 'ระวังแปลงแฉะ'] : ['ok', 'คล่องตัว'];
    var ccs = today >= 10 ? ['watch', 'Brix เจือจาง'] : f.past7 >= 60 ? ['watch', 'รอแปลงแห้ง'] : ['ok', 'ปกติ'];
    return '<div class="wxp-status">' +
      chip('🚜 ตัดอ้อย', cut[0], cut[1]) +
      chip('🚚 ขนส่ง', haul[0], haul[1]) +
      chip('🍬 ความหวาน', ccs[0], ccs[1]) +
    '</div>';
  }

  function tile(emoji, hue, name, big, sub) {
    return '<div class="wxt"><div class="wxt-ic hue-' + hue + '">' + emoji + '</div><div class="wxt-name">' + esc(name) + '</div>' +
      '<div class="wxt-big">' + esc(big) + '</div><div class="wxt-sub">' + esc(sub) + '</div></div>';
  }

  /* ── AI brief (Groq via gateway, cane-brain-grounded system prompt) ───── */
  var AI_SYSTEM = [
    'คุณคือนักวิชาการเกษตรผู้เชี่ยวชาญอ้อยของโรงงานน้ำตาลมิตรลาว ให้คำแนะนำวางแผนตัด-ขนส่งอ้อยจากพยากรณ์อากาศจริงเท่านั้น',
    'หลักวิชาการที่ต้องใช้ (cane-brain):',
    '- ฝนตกก่อนตัด → อ้อยดูดน้ำ Brix เจือจาง CCS ตกชั่วคราว ควรรอ 7-14 วันหลังฝนหยุดถ้าเลือกได้',
    '- ดินแฉะ (ฝนสะสมมาก) → รถตัด/รถบรรทุกติดหล่ม ดินอัดแน่น กอช้ำ ดินติดอ้อยเพิ่ม',
    '- อากาศร้อนจัด → ตัดเช้า ส่งเข้าหีบเร็ว ลดการสูญเสียน้ำหนัก/ความหวาน',
    'กติกา: 1) ใช้เฉพาะตัวเลขใน facts ห้ามเดา 2) ตอบไทย กระชับ จัดกลุ่มเป็น: เขตที่ตัดได้เต็มกำลัง / เขตที่ต้องเฝ้าระวัง / เขตที่ควรเลี่ยง-เลื่อน พร้อมเหตุผลสั้นๆ และคำแนะนำจัดคิวรถ 1-2 ข้อ 3) ถ้าคำถามไม่เกี่ยวกับการวางแผนตัดอ้อย/อากาศ ให้ปฏิเสธ'
  ].join('\n');

  function aiBrief() {
    var box = document.getElementById('wxAiBody');
    var btn = document.getElementById('wxAiBtn');
    if (!box) return;
    var zonesReady = ZONES.filter(function (z) { return z._f; });
    if (zonesReady.length < 5) { box.innerHTML = '<div class="wxai-load">ข้อมูลเขตยังโหลดไม่ครบ ลองอีกครั้งในอีกสักครู่</div>'; return; }
    if (btn) btn.disabled = true;
    box.innerHTML = '<div class="wxai-load">🤖 AI กำลังวิเคราะห์ทุกเขต…</div>';
    var facts = zonesReady.map(function (z) {
      return { zone: z.name, province: z.prov, rain_past7day_mm: Math.round(z._f.past7 * 10) / 10,
        rain_today_mm: Math.round((z._f.rain[0] || 0) * 10) / 10,
        rain_next3day_mm: Math.round(((z._f.rain[0] || 0) + (z._f.rain[1] || 0) + (z._f.rain[2] || 0)) * 10) / 10,
        tmax_today: z._f.tmax[0] };
    });
    var prompt = 'พยากรณ์จริงรายเขต (past7=ฝนสะสม7วันที่ผ่านมา, today=ฝนวันนี้, next3=ฝนรวม3วันข้างหน้า หน่วย มม.):\n' +
      JSON.stringify(facts) + '\n\nช่วยสรุปแผนตัด-ขนส่งอ้อยวันนี้สำหรับทุกเขต';
    fetch(AI_GATEWAY, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + AI_ANON, 'apikey': AI_ANON },
      body: JSON.stringify({ action: 'quick-ask', payload: { provider: 'groq', model: 'llama-3.3-70b-versatile', system: AI_SYSTEM, prompt: prompt, facts: { kpis: [] }, maxTokens: 900 } })
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
    return fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var frames = (j && j.radar && j.radar.past) || [];
        var last = frames[frames.length - 1];
        if (last) { radar.host = j.host; radar.path = last.path; radar.time = last.time; }
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
  var activeGoTo = null, activeDrawBoundary = null;

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

      ZONES.forEach(function (z) {
        var el = document.createElement('div');
        el.className = 'wx-pin' + (z.factory ? ' factory' : '');
        el.title = (z.factory ? '🏭 ' : '') + z.name + ' · ' + z.prov;
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

    ZONES.forEach(function (z) {
      var m = L.circleMarker([z.lat, z.lon], { radius: z.factory ? 11 : 8, color: '#ffffff', weight: 2.5, fillColor: '#64748b', fillOpacity: 1 }).addTo(map);
      m.bindTooltip((z.factory ? '🏭 ' : '') + z.name + ' · ' + z.prov, { direction: 'top' });
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

  /* ── Header date + tabs + AI wiring ──────────────────────────────────── */
  function wireChrome() {
    var d = new Date();
    var el = document.getElementById('wxToday');
    if (el) el.textContent = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' +
      ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' น.';
    var rf = document.getElementById('wxRefresh');
    if (rf) rf.addEventListener('click', function () { location.reload(); });

    var aiBtn = document.getElementById('wxAiBtn');
    if (aiBtn) aiBtn.addEventListener('click', aiBrief);
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
    if (document.getElementById('wxMap')) { bootMap(); wireSearch(); wireChrome(); return; }
    bootHome();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
