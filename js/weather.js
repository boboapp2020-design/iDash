/**
 * iDash — อากาศ × อ้อย (Weather × Cane)
 * ---------------------------------------------------------------------------
 * A real, clickable map (Leaflet + OpenStreetMap) focused on the two Lao
 * provinces that feed the mill: แขวงคำม่วน (Khammouane) and แขวงสะหวันนะเขต
 * (Savannakhet). Cane-zone pins are coloured by rain risk; clicking a pin — or
 * anywhere on the map — opens a 7-day Open-Meteo forecast with a rule-based
 * cane advisory (no AI; the advisory is a fixed reading of the real forecast).
 *
 * The same file also fills a compact preview card on Home (#homeWx).
 * Open-Meteo is free, needs no key, and is CORS-friendly.
 */
(function () {
  'use strict';

  var FORECAST = 'https://api.open-meteo.com/v1/forecast';

  // MapTiler key (public by design, domain-restrictable). When set, the map
  // renders in 3D terrain + satellite via MapLibre; empty → the reliable 2D
  // Leaflet map. Get a free key at cloud.maptiler.com.
  var MAPTILER_KEY = '9ZNAFkXEzT9KdManlDo0';

  // Zones down to the district level. Savannakhet is covered densely (all 15
  // districts) per the owner; Khammouane keeps its main towns. Coordinates are
  // approximate district centres — the map also lets you click ANY point for an
  // exact-spot forecast.
  var ZONES = [
    // ── แขวงสะหวันนะเขต (Savannakhet) — 15 เมือง ──
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
    // ── แขวงคำม่วน (Khammouane) ──
    { name: 'ท่าแขก (Thakhek)', prov: 'คำม่วน', lat: 17.411, lon: 104.821 },
    { name: 'หนองบก (Nongbok)', prov: 'คำม่วน', lat: 17.100, lon: 104.930 },
    { name: 'เซบั้งไฟ (Xebangfai)', prov: 'คำม่วน', lat: 16.980, lon: 105.120 },
    { name: 'มะหาไซ (Mahaxay)', prov: 'คำม่วน', lat: 17.400, lon: 105.200 }
  ];

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
    if (c >= 71 && c <= 77) return { e: '🌨️', t: 'หิมะ' };
    if (c >= 80 && c <= 82) return { e: '🌧️', t: 'ฝนซู่' };
    if (c >= 95) return { e: '⛈️', t: 'พายุฝนฟ้าคะนอง' };
    return { e: '🌤️', t: 'ทั่วไป' };
  }

  function dayAdvisory(precip, prob, tmax) {
    if (precip >= 30) return { lv: 'high', txt: 'ฝนหนัก — รถตัด/รถบรรทุกเข้าแปลงลำบาก อ้อยเปียก ดินติดเยอะ เสี่ยง CCS/ความหวานลด ควรปรับแผนตัด' };
    if (precip >= 10) return { lv: 'mid', txt: 'ฝนปานกลาง — แปลงอาจแฉะ ระวังอ้อยเปียก/ดินติดเพิ่ม' };
    if (precip >= 1 || prob >= 60) return { lv: 'watch', txt: 'มีฝนเล็กน้อย/โอกาสฝนสูง — เฝ้าระวังแผนตัดและขนส่ง' };
    if (tmax >= 38) return { lv: 'heat', txt: 'ร้อนจัด — อ้อยเครียด อาจสุกช้า' };
    return { lv: 'ok', txt: 'อากาศดี เหมาะเก็บเกี่ยวและขนส่ง' };
  }
  function zoneSummary(daily) {
    var rainDays = 0, maxP = 0, maxPDay = '';
    for (var i = 0; i < daily.time.length; i++) {
      var p = daily.precipitation_sum[i] || 0;
      if (p >= 10) rainDays++;
      if (p > maxP) { maxP = p; maxPDay = daily.time[i]; }
    }
    if (maxP >= 30) return { lv: 'high', txt: 'เตือน: มีวันฝนหนัก (' + fmt(maxP, 0) + ' มม. ' + thDate(maxPDay) + ') — เสี่ยงกระทบการตัด/ขนส่ง/CCS' };
    if (rainDays >= 3) return { lv: 'mid', txt: 'ฝนหลายวันใน 7 วันนี้ (' + rainDays + ' วัน) — วางแผนตัดเผื่อแปลงแฉะ' };
    if (rainDays >= 1) return { lv: 'watch', txt: 'มีฝนบางวัน — เฝ้าระวังเป็นช่วง ๆ' };
    return { lv: 'ok', txt: 'อากาศดีตลอด 7 วัน เหมาะเก็บเกี่ยว' };
  }
  function thDate(iso) { var p = String(iso).split('-'); return p.length === 3 ? p[2] + '/' + p[1] : iso; }
  function thWeekday(iso) {
    var d = new Date(iso + 'T00:00:00'); var w = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    return isNaN(d) ? '' : w[d.getDay()];
  }
  function riskColor(p) { return p >= 30 ? '#dc2626' : p >= 10 ? '#f59e0b' : '#16a34a'; }

  // Set by whichever map booted, so the village search can recentre it.
  var activeGoTo = null;

  // Nominatim (OpenStreetMap) — reaches village/บ้าน level in Laos, unlike the
  // Open-Meteo geocoder. Biased to Laos + Thailand. polygon_geojson gives the
  // administrative BOUNDARY of a district/village when OSM has one mapped.
  function geocode(name) {
    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=th&countrycodes=la,th&polygon_geojson=1&q=' + encodeURIComponent(name);
    return fetch(url).then(function (r) { return r.json(); }).then(function (list) {
      return (list || []).map(function (r) {
        return {
          name: r.name || String(r.display_name || '').split(',')[0],
          display: r.display_name || r.name,
          latitude: parseFloat(r.lat), longitude: parseFloat(r.lon),
          geojson: r.geojson || null
        };
      }).filter(function (r) { return !isNaN(r.latitude) && !isNaN(r.longitude); });
    });
  }

  // Set by whichever map booted: draws (or clears, when null) the boundary of
  // the selected area on the map.
  var activeDrawBoundary = null;

  function forecast(lat, lon) {
    var url = FORECAST + '?latitude=' + lat + '&longitude=' + lon +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=auto&forecast_days=7';
    return fetch(url).then(function (r) { return r.json(); });
  }

  /* ── Detail popup (floats over the full-page map) ────────────────────── */
  function openPopup() {
    var pop = document.getElementById('wxPopup');
    if (pop) pop.hidden = false;
  }
  function renderPanelLoading(title) {
    var p = document.getElementById('wxPanel'); if (!p) return;
    openPopup();
    p.innerHTML = '<div class="wxp-empty">กำลังโหลดพยากรณ์ ' + esc(title) + '…</div>';
  }
  function renderPanel(title, sub, factory, data) {
    var p = document.getElementById('wxPanel'); if (!p) return;
    openPopup();
    if (!data || !data.daily || !data.daily.time) { p.innerHTML = '<div class="wxp-empty">ดึงพยากรณ์ไม่สำเร็จ</div>'; return; }
    var d = data.daily;
    var sum = zoneSummary(d);
    var t0 = wx(d.weather_code[0]);
    var days = d.time.map(function (t, i) {
      var w = wx(d.weather_code[i]);
      var pr = d.precipitation_sum[i] || 0;
      var prob = d.precipitation_probability_max ? (d.precipitation_probability_max[i] || 0) : 0;
      var adv = dayAdvisory(pr, prob, d.temperature_2m_max[i]);
      return '<div class="wxp-day lv-' + adv.lv + '" title="' + esc(adv.txt) + '">' +
        '<div class="wxp-dow">' + thWeekday(t) + ' ' + thDate(t) + '</div>' +
        '<div class="wxp-emoji">' + w.e + '</div>' +
        '<div class="wxp-temp">' + fmt(d.temperature_2m_max[i], 0) + '° / ' + fmt(d.temperature_2m_min[i], 0) + '°</div>' +
        '<div class="wxp-rain">💧 ' + fmt(pr, 1) + '</div>' +
        '<div class="wxp-prob">' + fmt(prob, 0) + '%</div>' +
      '</div>';
    }).join('');
    p.innerHTML =
      '<div class="wxp-head">' +
        '<div class="wxp-title">' + (factory ? '🏭 ' : '📍 ') + esc(title) + '</div>' +
        '<div class="wxp-sub">' + esc(sub) + '</div>' +
      '</div>' +
      '<div class="wxp-now">' +
        '<div class="wxp-now-emoji">' + t0.e + '</div>' +
        '<div><div class="wxp-now-temp">' + fmt(d.temperature_2m_max[0], 0) + '°<span>/ ' + fmt(d.temperature_2m_min[0], 0) + '°</span></div>' +
          '<div class="wxp-now-desc">' + esc(t0.t) + ' · ฝน ' + fmt(d.precipitation_sum[0], 1) + ' มม. (' + fmt((d.precipitation_probability_max || [])[0] || 0, 0) + '%)</div></div>' +
      '</div>' +
      '<div class="wxp-alert lv-' + sum.lv + '"><b>' + esc(sum.txt) + '</b></div>' +
      '<div class="wxp-days">' + days + '</div>' +
      '<div class="wxp-note">💧 = ฝน (มม.) · % = โอกาสฝน · สีการ์ด/หมุด = ระดับผลกระทบต่อการเก็บเกี่ยว · ข้อมูล Open-Meteo</div>';
  }

  /* ── Map page — 3D (MapTiler) when a key is set, else 2D (Leaflet) ────── */
  function bootMap() {
    var mapEl = document.getElementById('wxMap');
    if (!mapEl) return false;
    if (MAPTILER_KEY && window.maplibregl) return boot3D(mapEl);
    if (window.L) return boot2D(mapEl);
    mapEl.innerHTML = '<div class="wx-fallback">แผนที่โหลดไม่สำเร็จ — ต้องต่ออินเทอร์เน็ต</div>';
    return true;
  }

  // 3D terrain + satellite via MapLibre GL + MapTiler (CORS-enabled tiles, so
  // it renders where the free ESRI/DEM tiles did not).
  function boot3D(mapEl) {
    mapEl.innerHTML = '';
    var map, loaded = false;
    // If 3D can't get going (WebGL/tiles), fall back to the reliable 2D map so
    // there's always a working map.
    var fallback = setTimeout(function () {
      if (loaded) return;
      try { map.remove(); } catch (e) {}
      mapEl.innerHTML = '';
      if (window.L) boot2D(mapEl);
      else mapEl.innerHTML = '<div class="wx-fallback">แผนที่โหลดไม่สำเร็จ</div>';
    }, 8000);

    map = new maplibregl.Map({
      container: 'wxMap',
      style: 'https://api.maptiler.com/maps/hybrid/style.json?key=' + MAPTILER_KEY,
      center: [105.05, 16.85], zoom: 7.0, pitch: 60, bearing: -15, maxPitch: 80, attributionControl: true
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    activeGoTo = function (lat, lon) { map.flyTo({ center: [lon, lat], zoom: 11, pitch: 64, duration: 900 }); };
    // Area boundary overlay (source + fill/line layers, data replaced per pick).
    activeDrawBoundary = function (geojson) {
      var empty = { type: 'FeatureCollection', features: [] };
      var data = geojson ? { type: 'Feature', geometry: geojson, properties: {} } : empty;
      var src = map.getSource('wx-boundary');
      if (src) { src.setData(data); return; }
      if (!map.isStyleLoaded()) { map.once('load', function () { activeDrawBoundary(geojson); }); return; }
      map.addSource('wx-boundary', { type: 'geojson', data: data });
      map.addLayer({ id: 'wx-boundary-fill', type: 'fill', source: 'wx-boundary',
        paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.14 } });
      map.addLayer({ id: 'wx-boundary-line', type: 'line', source: 'wx-boundary',
        paint: { 'line-color': '#60a5fa', 'line-width': 2.5, 'line-opacity': 0.95 } });
    };

    function selectZone(z) {
      map.flyTo({ center: [z.lon, z.lat], zoom: Math.max(map.getZoom(), 9.5), pitch: 64, duration: 900 });
      if (z._data) renderPanel(z.name, z.prov, z.factory, z._data);
      else {
        renderPanelLoading(z.name);
        forecast(z.lat, z.lon).then(function (d) { z._data = d; renderPanel(z.name, z.prov, z.factory, d); })
          .catch(function () { renderPanel(z.name, z.prov, z.factory, null); });
      }
    }

    map.on('load', function () {
      loaded = true; clearTimeout(fallback);
      try {
        map.addSource('terrain', { type: 'raster-dem', url: 'https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=' + MAPTILER_KEY });
        map.setTerrain({ source: 'terrain', exaggeration: 1.5 });
      } catch (e) {}
      ZONES.forEach(function (z) {
        var el = document.createElement('div');
        el.className = 'wx-pin' + (z.factory ? ' factory' : '');
        el.title = (z.factory ? '🏭 ' : '') + z.name + ' · ' + z.prov;
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([z.lon, z.lat]).addTo(map);
        z._el = el;
        el.addEventListener('click', function (ev) { ev.stopPropagation(); selectZone(z); });
        forecast(z.lat, z.lon).then(function (d) {
          z._data = d;
          if (d && d.daily) el.style.background = riskColor(d.daily.precipitation_sum[0] || 0);
        }).catch(function () {});
      });
      selectZone(ZONES[0]);
    });

    map.on('click', function (e) {
      renderPanelLoading('จุดที่เลือก');
      forecast(e.lngLat.lat, e.lngLat.lng)
        .then(function (d) { renderPanel('จุดที่เลือกบนแผนที่', fmt(e.lngLat.lat, 3) + ', ' + fmt(e.lngLat.lng, 3), false, d); })
        .catch(function () { renderPanel('จุดที่เลือก', '', false, null); });
    });
    return true;
  }

  function boot2D(mapEl) {
    var map = L.map('wxMap', { scrollWheelZoom: true, zoomControl: true })
      .fitBounds([[15.4, 104.3], [18.0, 106.4]]);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '© OpenStreetMap'
    }).addTo(map);
    activeGoTo = function (lat, lon) { map.setView([lat, lon], 12, { animate: true }); };
    var boundaryLayer = null;
    activeDrawBoundary = function (geojson) {
      if (boundaryLayer) { try { map.removeLayer(boundaryLayer); } catch (e) {} boundaryLayer = null; }
      if (!geojson) return;
      boundaryLayer = L.geoJSON({ type: 'Feature', geometry: geojson, properties: {} }, {
        style: { color: '#60a5fa', weight: 2.5, opacity: 0.95, fillColor: '#3b82f6', fillOpacity: 0.14 }
      }).addTo(map);
    };

    ZONES.forEach(function (z) {
      var m = L.circleMarker([z.lat, z.lon], {
        radius: z.factory ? 11 : 8, color: '#ffffff', weight: 2.5,
        fillColor: '#64748b', fillOpacity: 1
      }).addTo(map);
      m.bindTooltip((z.factory ? '🏭 ' : '') + z.name + ' · ' + z.prov, { direction: 'top' });
      m.on('click', function () { selectZone(z); });
      z._m = m;
      forecast(z.lat, z.lon).then(function (d) {
        z._data = d;
        if (d && d.daily) m.setStyle({ fillColor: riskColor(d.daily.precipitation_sum[0] || 0) });
      }).catch(function () {});
    });

    map.on('click', function (e) {
      renderPanelLoading('จุดที่เลือก');
      forecast(e.latlng.lat, e.latlng.lng)
        .then(function (d) { renderPanel('จุดที่เลือกบนแผนที่', fmt(e.latlng.lat, 3) + ', ' + fmt(e.latlng.lng, 3), false, d); })
        .catch(function () { renderPanel('จุดที่เลือก', '', false, null); });
    });

    function selectZone(z) {
      map.setView([z.lat, z.lon], Math.max(map.getZoom(), 9), { animate: true });
      if (z._data) renderPanel(z.name, z.prov, z.factory, z._data);
      else {
        renderPanelLoading(z.name);
        forecast(z.lat, z.lon).then(function (d) { z._data = d; renderPanel(z.name, z.prov, z.factory, d); })
          .catch(function () { renderPanel(z.name, z.prov, z.factory, null); });
      }
    }

    selectZone(ZONES[0]);   // factory by default
    // Leaflet needs a resize nudge once its container has its final size.
    setTimeout(function () { map.invalidateSize(); }, 200);
    return true;
  }

  /* ── Home preview card (#homeWx) ─────────────────────────────────────── */
  function bootHome() {
    var el = document.getElementById('homeWx');
    if (!el) return false;
    var z = ZONES[0];
    forecast(z.lat, z.lon).then(function (data) {
      if (!data || !data.daily) { el.querySelector('[data-wxbody]').textContent = 'ดึงพยากรณ์ไม่สำเร็จ'; return; }
      var d = data.daily, sum = zoneSummary(d);
      var mini = d.time.slice(0, 4).map(function (t, i) {
        var w = wx(d.weather_code[i]);
        return '<div class="hw-day"><div class="hw-dow">' + thWeekday(t) + '</div>' +
          '<div class="hw-emoji">' + w.e + '</div>' +
          '<div class="hw-t">' + fmt(d.temperature_2m_max[i], 0) + '°</div>' +
          '<div class="hw-r">💧' + fmt(d.precipitation_sum[i], 0) + '</div></div>';
      }).join('');
      el.querySelector('[data-wxbody]').innerHTML =
        '<div class="hw-alert lv-' + sum.lv + '">' + esc(sum.txt) + '</div>' +
        '<div class="hw-days">' + mini + '</div>';
    }).catch(function () { el.querySelector('[data-wxbody]').textContent = 'ดึงพยากรณ์ไม่สำเร็จ'; });
    return true;
  }

  /* ── Village-level search (any place name → forecast, recentre the map) ── */
  function wireSearch() {
    var inp = document.getElementById('wxSearchInput');
    var btn = document.getElementById('wxSearchBtn');
    var res = document.getElementById('wxSearchResults');
    if (!inp || !btn) return;
    function go() {
      var q = inp.value.trim();
      if (!q) return;
      res.innerHTML = '<div class="wx-sr-load">กำลังค้นหา…</div>';
      geocode(q).then(function (list) {
        if (!list.length) { res.innerHTML = '<div class="wx-sr-load">ไม่พบ "' + esc(q) + '" — ลองพิมพ์เป็นอังกฤษ หรือคลิกจุดบนแผนที่</div>'; return; }
        res.innerHTML = list.map(function (r, i) {
          return '<button class="wx-sr" data-i="' + i + '">' + esc(r.display) + '</button>';
        }).join('');
        [].forEach.call(res.querySelectorAll('.wx-sr'), function (b) {
          b.addEventListener('click', function () {
            var r = list[+b.getAttribute('data-i')];
            res.innerHTML = '';
            inp.value = r.name;
            if (activeGoTo) activeGoTo(r.latitude, r.longitude);
            // Draw the area's real boundary when OSM has one (districts usually
            // do; small villages may only be a point — then no outline).
            if (activeDrawBoundary) {
              var g = r.geojson && /Polygon/i.test(r.geojson.type) ? r.geojson : null;
              activeDrawBoundary(g);
            }
            renderPanelLoading(r.name);
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

  function boot() {
    if (bootMap()) {
      wireSearch();
      var closeBtn = document.getElementById('wxPopupClose');
      if (closeBtn) closeBtn.addEventListener('click', function () {
        var pop = document.getElementById('wxPopup');
        if (pop) pop.hidden = true;
        if (activeDrawBoundary) activeDrawBoundary(null);
      });
      return;
    }
    bootHome();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
