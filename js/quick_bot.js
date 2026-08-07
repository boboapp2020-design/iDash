/**
 * iDash — Quick Ask bot (no-AI, grounded)
 * ---------------------------------------------------------------------------
 * An inline panel (mounted at #qbMount, beside the AI Chatbot on Home) that
 * answers factory performance from the platform's REAL numbers only — it
 * matches the question to a KPI and prints the figures already reported. There
 * is NO language model in this path, so it cannot invent a number: every value
 * is read verbatim from the live feed.
 *
 * Data: the same "Dashboard ML" Apps Script feed the Home KPI row uses. That
 * feed's daily[] rows carry ~200 fields covering BOTH the Production and the
 * Quality dashboards (ML_Dashboard2026_2027) — so the bot reads the raw feed
 * directly and exposes a curated catalog of both, not just the 5 headline
 * figures the row paints.
 *
 * Sources (chips): Production + Quality are live from that feed; Sale / Store /
 * BOI / QM are declared and await their own data API.
 */
(function () {
  'use strict';

  /* ── helpers ──────────────────────────────────────────────────────────── */
  function fmt(v, dec) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    return Number(v).toLocaleString('en-US', {
      minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0
    });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    var n = parseFloat(String(v).replace(/[, ]/g, ''));
    return isNaN(n) ? null : n;
  }

  /* ── Live feed (raw daily rows, same endpoint as home_kpi_live) ─────────── */
  var FEED_URL_DEFAULT = 'https://script.google.com/macros/s/AKfycbx2KmyntEHLOMW5MfWtxmNlntB8I7_mJ_mQdxdadzLaI88AXDHuD3EmVUyP7nv2sNnl/exec';
  var FEED_CACHE_KEY = 'idash.qbFeed';
  var feedMem = null;

  function feedUrl() {
    try { var o = localStorage.getItem('idash.kpiApiUrl'); if (o) return o; } catch (e) {}
    return window.IDASH_KPI_API_URL || FEED_URL_DEFAULT;
  }
  function readFeedCache() {
    if (feedMem) return feedMem;
    try { var c = JSON.parse(localStorage.getItem(FEED_CACHE_KEY) || 'null'); if (c && c.daily) { feedMem = c; return c; } } catch (e) {}
    return null;
  }
  var feedInFlight = null;
  function loadFeed() {
    if (feedInFlight) return feedInFlight;
    feedInFlight = fetch(feedUrl(), { method: 'GET' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var daily = Array.isArray(j.daily) ? j.daily.filter(function (r) { return r && r.date; }) : [];
        feedMem = { at: Date.now(), daily: daily };
        try { localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(feedMem)); } catch (e) {}
        feedInFlight = null;
        return feedMem;
      })
      .catch(function (e) { feedInFlight = null; throw e; });
    return feedInFlight;
  }

  /* ── KPI catalog ──────────────────────────────────────────────────────────
   * tag: 'p' = Production, 'q' = Quality. t/c/g = today/cumulative/target field
   * names in the feed. low = lower is better. head = shown in "สรุป". */
  var CATALOG = [
    // ── Production ──
    { tag:'p', head:1, t:'cane_today', c:'cane_todate', g:'cane_target', nameTH:'จำนวนอ้อยเข้าหีบ', unit:'ตัน', dec:0, syn:['อ้อย','เข้าหีบ','หีบ','cane','crush','ตันอ้อย','อ้อยเข้า'] },
    { tag:'p', head:1, t:'tcph_today', c:'tcph_todate', g:'tcph_target', nameTH:'อัตราการหีบ (ตัน/ชม.)', unit:'', dec:1, syn:['อัตราหีบ','tcph','tch','ตันต่อชั่วโมง','อัตราการหีบ'] },
    { tag:'p', head:1, t:'ccs_today', c:'ccs_todate', g:'ccs_target', nameTH:'CCS of Factory', unit:'', dec:2, syn:['ccs','ความหวาน','ซีซีเอส'] },
    { tag:'p', t:'pol_today', c:'pol_todate', g:'pol_target', nameTH:'% Pol in Cane', unit:'%', dec:2, syn:['pol cane','โพลอ้อย','pol อ้อย','โพลในอ้อย'] },
    { tag:'p', t:'fiber_today', c:'fiber_todate', nameTH:'% Fiber in Cane', unit:'%', dec:2, syn:['fiber','ไฟเบอร์','เยื่อใย','ไฟเบอร์อ้อย'] },
    { tag:'p', head:1, t:'burnt_today', c:'burnt_todate', low:1, nameTH:'% อ้อยไฟไหม้', unit:'%', dec:2, syn:['ไฟไหม้','อ้อยไฟ','burnt','เผา','ไหม้'] },
    { tag:'p', t:'trash_today', c:'trash_todate', low:1, nameTH:'% สิ่งปลอมปน (Trash)', unit:'%', dec:2, syn:['trash','สิ่งปลอมปน','ปลอมปน','ทราช','ขยะ'] },
    { tag:'p', t:'soil_today', c:'soil_todate', low:1, nameTH:'% ดินติดอ้อย', unit:'%', dec:2, syn:['ดิน','soil','ดินติดอ้อย'] },
    { tag:'p', t:'pcttelq_today', c:'pcttelq_todate', g:'pcttelq_target', nameTH:'% Cane as TELQ', unit:'%', dec:2, syn:['telq','อ้อยสด','สด','เทลคิว','เทล'] },
    { tag:'p', head:1, t:'recov_today', c:'recov_todate', g:'recov_target', nameTH:'% Overall Recovery', unit:'%', dec:2, syn:['recovery','recov','รีคัฟ','รีโคฟ','รีคัฟเวอรี'] },
    { tag:'p', t:'bhr_today', c:'bhr_todate', g:'bhr_target', nameTH:'BHR (Boiling House Recovery)', unit:'%', dec:2, syn:['bhr','boiling house'] },
    { tag:'p', t:'extpol_today', c:'extpol_todate', g:'extpol_target', nameTH:'% Extraction (Pol)', unit:'%', dec:2, syn:['extraction','สกัด','extpol','การสกัด'] },
    { tag:'p', t:'prepidx_today', c:'prepidx_todate', g:'prepidx_target', nameTH:'Preparation Index (PI)', unit:'', dec:1, syn:['preparation','prep','pi','เตรียมอ้อย','prepidx'] },
    { tag:'p', t:'polbag_today', c:'polbag_todate', g:'polbag_target', low:1, nameTH:'% Pol in Bagasse', unit:'%', dec:2, syn:['pol bagasse','โพลชานอ้อย','polbag','ชานอ้อย pol'] },
    { tag:'p', t:'loss_today', c:'loss_todate', g:'loss_target', low:1, nameTH:'% การสูญเสียรวม', unit:'%', dec:3, syn:['loss','สูญเสีย','ลอส','สูญเสียรวม'] },
    { tag:'p', t:'loss_bag_today', c:'loss_bag_todate', g:'loss_bag_target', low:1, nameTH:'สูญเสียในชานอ้อย', unit:'%', dec:3, syn:['สูญเสียชาน','loss bagasse','ชานอ้อย'] },
    { tag:'p', t:'loss_fc_today', c:'loss_fc_todate', g:'loss_fc_target', low:1, nameTH:'สูญเสียในกากตะกอน', unit:'%', dec:3, syn:['สูญเสียกาก','loss filter','กากตะกอน','filter cake loss'] },
    { tag:'p', t:'loss_fm_today', c:'loss_fm_todate', g:'loss_fm_target', low:1, nameTH:'สูญเสียในโมลาส', unit:'%', dec:3, syn:['สูญเสียโมลาส','loss molasses','โมลาสสูญเสีย'] },
    { tag:'p', t:'loss_undet_today', c:'loss_undet_todate', g:'loss_undet_target', low:1, nameTH:'สูญเสียหาสาเหตุไม่ได้', unit:'%', dec:3, syn:['undetermined','undet','หาสาเหตุไม่ได้','สูญเสียหาสาเหตุ'] },
    { tag:'p', t:'me_today', c:'me_todate', g:'me_target', nameTH:'% Mechanical Efficiency', unit:'%', dec:2, syn:['mechanical','efficiency','ประสิทธิภาพ','me','โอทีอี','ote'] },
    { tag:'p', head:1, t:'avgsteam_today', c:'avgsteam_todate', g:'avgsteam_target', low:1, nameTH:'ไอน้ำต่อตันอ้อย', unit:'', dec:2, syn:['steam','ไอน้ำ','สตีม','ไอน้ำต่อตัน'] },
    { tag:'p', t:'kwhtc_today', c:'kwhtc_todate', g:'kwhtc_target', low:1, nameTH:'หน่วยไฟต่อตันอ้อย', unit:'', dec:1, syn:['kwh ต่อตัน','หน่วยไฟต่อตัน','ไฟต่อตัน','kwhtc'] },
    { tag:'p', head:1, t:'edl_today', c:'edl_todate', g:'edl_target', nameTH:'ขายไฟ (EDL)', unit:'kWh', dec:0, syn:['ขายไฟ','edl','ไฟ','พลังงาน'] },
    { tag:'p', t:'netkwh_today', c:'netkwh_todate', g:'netkwh_target', nameTH:'ไฟฟ้าสุทธิ', unit:'kWh', dec:0, syn:['ไฟสุทธิ','netkwh','net kwh','ไฟฟ้าสุทธิ'] },

    // ── Quality ──
    { tag:'q', head:1, t:'vhp_today', c:'vhp_todate', g:'vhp_target', nameTH:'น้ำตาล VHP (ผลิต)', unit:'ตัน', dec:0, syn:['vhp','น้ำตาลvhp','น้ำตาล vhp','ผลิตน้ำตาล'] },
    { tag:'q', t:'totsugar_today', c:'totsugar_todate', g:'totsugar_target', nameTH:'น้ำตาลรวม', unit:'ตัน', dec:0, syn:['น้ำตาลรวม','total sugar','totsugar','น้ำตาลทั้งหมด'] },
    { tag:'q', head:1, t:'vhp_pol_today', c:'vhp_pol_todate', nameTH:'Pol น้ำตาล VHP', unit:'%', dec:2, syn:['pol น้ำตาล','vhp pol','โพลน้ำตาล','pol sugar'] },
    { tag:'q', head:1, t:'vhp_moist_today', c:'vhp_moist_todate', low:1, nameTH:'ความชื้นน้ำตาล VHP', unit:'%', dec:2, syn:['ความชื้น','moisture','ชื้น','ความชื้นน้ำตาล'] },
    { tag:'q', head:1, t:'vhp_colour_today', c:'vhp_colour_todate', low:1, nameTH:'สีน้ำตาล VHP (ICUMSA)', unit:'IU', dec:0, syn:['สี','color','colour','icumsa','สีน้ำตาล','ไอยู'] },
    { tag:'q', head:1, t:'purity_today', c:'purity_todate', g:'purity_target', nameTH:'% Purity รวม', unit:'%', dec:2, syn:['purity','ความบริสุทธิ์','เพียวริตี้','บริสุทธิ์'] },
    { tag:'q', head:1, t:'fm_purity_today', c:'fm_purity_todate', g:'fm_purity_target', low:1, nameTH:'ความบริสุทธิ์ Final Molasses', unit:'%', dec:1, syn:['molasses purity','โมลาส purity','ความบริสุทธิ์โมลาส','purity molasses','fm purity'] },
    { tag:'q', t:'fm_brix_today', c:'fm_brix_todate', g:'fm_brix_target', nameTH:'Brix Final Molasses', unit:'', dec:1, syn:['brix molasses','บริกซ์โมลาส','fm brix','brix โมลาส'] },
    { tag:'q', t:'fm_rs_today', c:'fm_rs_todate', low:1, nameTH:'Reducing Sugar โมลาส', unit:'%', dec:2, syn:['reducing sugar','rs','รีดิวซ์','น้ำตาลรีดิวซ์'] },
    { tag:'q', t:'fm_ash_today', c:'fm_ash_todate', low:1, nameTH:'Ash โมลาส (เถ้า)', unit:'%', dec:2, syn:['ash','เถ้า','เถ้าโมลาส'] },
    { tag:'q', t:'fej_purity', nameTH:'Purity FEJ (น้ำอ้อยแรก)', unit:'%', dec:1, syn:['fej','first juice','น้ำอ้อยแรก','fej purity'] },
    { tag:'q', t:'mj_purity', nameTH:'Purity Mixed Juice', unit:'%', dec:1, syn:['mixed juice','mj','น้ำอ้อยรวม','mj purity'] },
    { tag:'q', t:'cj_purity', nameTH:'Purity Clarified Juice', unit:'%', dec:1, syn:['clarified','cj','น้ำใส','cj purity'] },
    { tag:'q', t:'fc_pol_today', c:'fc_pol_todate', g:'fc_pol_target', low:1, nameTH:'Pol กากตะกอน (Filter Cake)', unit:'%', dec:2, syn:['pol กาก','filter cake pol','fc pol','โพลกาก'] },
    { tag:'q', t:'fc_moist_today', c:'fc_moist_todate', g:'fc_moist_target', nameTH:'ความชื้นกากตะกอน', unit:'%', dec:2, syn:['ความชื้นกาก','filter cake moisture','fc moist'] }
  ];

  function buildOne(k, last, prev) {
    var today = num(last[k.t]);
    if (today === null) return null;
    var before = prev ? num(prev[k.t]) : null;
    var delta = (before !== null && before !== 0) ? ((today - before) / Math.abs(before)) * 100 : null;
    var direction = delta === null ? null : ((k.low ? delta < 0 : delta > 0) ? 'up' : 'down');
    return {
      nameTH: k.nameTH, unit: k.unit, decimals: k.dec, head: !!k.head,
      today: today, delta: delta, direction: direction,
      todate: k.c ? num(last[k.c]) : null,
      target: k.g ? num(last[k.g]) : null,
      syn: k.syn || []
    };
  }

  function kpisFor(tag) {
    var f = readFeedCache();
    if (!f || !f.daily.length) return null;
    var rows = f.daily;
    var last = rows[rows.length - 1], prev = rows.length > 1 ? rows[rows.length - 2] : null;
    var kpis = CATALOG.filter(function (k) { return k.tag === tag; })
      .map(function (k) { return buildOne(k, last, prev); })
      .filter(Boolean);
    return kpis.length ? { latestDate: last.date, kpis: kpis } : null;
  }

  var SOURCES = [
    { id: 'production', tag: 'p', label: 'Production', ready: true, getKpis: function () { return kpisFor('p'); }, refresh: loadFeed },
    { id: 'quality',    tag: 'q', label: 'Quality',    ready: true, getKpis: function () { return kpisFor('q'); }, refresh: loadFeed },
    { id: 'sale',  label: 'Sale',  ready: false },
    { id: 'store', label: 'Store', ready: false },
    { id: 'boi',   label: 'BOI',   ready: false },
    { id: 'qm',    label: 'QM',    ready: false }
  ];
  function byId(id) { return SOURCES.filter(function (s) { return s.id === id; })[0]; }

  var SUGG = {
    production: ['อ้อยเข้าหีบ', 'CCS', 'Recovery', 'อัตราหีบ', 'ขายไฟ', 'สรุป'],
    quality:    ['สรุป Quality วันนี้', 'สีน้ำตาลเป็นยังไง', 'แนวโน้ม CCS 7 วัน', 'ความบริสุทธิ์โมลาส', 'เทียบเมื่อวานกับวันนี้']
  };

  var OVERVIEW = ['สรุป', 'ทั้งหมด', 'รวม', 'overview', 'all', 'ภาพรวม', 'ทุกตัว'];
  var activeSourceId = 'production';
  var qualityNoted = false;

  /* ── Matching (pure keyword, no AI) ───────────────────────────────────── */
  function nq(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }
  function matchKpis(query, data) {
    var q = nq(query);
    if (!q) return [];
    if (OVERVIEW.some(function (w) { return q.indexOf(nq(w)) > -1; })) {
      var h = data.kpis.filter(function (k) { return k.head; });
      return h.length ? h : data.kpis;
    }
    return data.kpis.filter(function (k) {
      if (nq(k.nameTH).indexOf(q) > -1 || q.indexOf(nq(k.nameTH)) > -1) return true;
      return (k.syn || []).some(function (s) { return q.indexOf(nq(s)) > -1; });
    });
  }

  function kpiBlock(k) {
    var val = fmt(k.today, k.decimals) + (k.unit ? ' ' + k.unit : '');
    var parts = [];
    if (k.delta !== null && k.delta !== undefined) {
      var arrow = k.delta >= 0 ? '↑' : '↓';
      var cls = (k.direction === 'down') ? 'qb-bad' : 'qb-good';
      parts.push('<span class="' + cls + '">' + arrow + ' ' + Math.abs(k.delta).toFixed(1) + '% จากวันก่อน</span>');
    }
    if (k.todate !== null && k.todate !== undefined) parts.push('สะสม ' + fmt(k.todate, k.decimals) + (k.unit ? ' ' + k.unit : ''));
    if (k.target !== null && k.target !== undefined) parts.push('เป้า ' + fmt(k.target, k.decimals) + (k.unit ? ' ' + k.unit : ''));
    return '<div class="qb-ans">' +
      '<div class="qb-ans-name">' + esc(k.nameTH) + '</div>' +
      '<div class="qb-ans-val">' + esc(val) + '</div>' +
      (parts.length ? '<div class="qb-ans-sub">' + parts.join(' • ') + '</div>' : '') +
    '</div>';
  }

  function greeting() {
    pushMsg('สวัสดีครับ 👋 ผมคือ iDash Copilot — ถามได้เฉพาะข้อมูลจากแดชบอร์ดใน iDash (<b>Production</b> และ <b>Quality</b>) ' +
      'พิมพ์เป็นประโยคได้เลย เช่น "คุณภาพเมื่อวานเป็นยังไง", "Recovery 7 วันล่าสุด", "อ้อยเข้าหีบวันนี้เทียบเมื่อวาน" ' +
      '— ตอบจากตัวเลขจริงในแดชบอร์ดเท่านั้น', 'bot');
  }
  function clearChat() {
    var log = document.getElementById('qbLog');
    if (log) log.innerHTML = '';
    qualityNoted = false;
    greeting();
  }

  function pushMsg(html, who) {
    var log = document.getElementById('qbLog');
    if (!log) return;
    var row = document.createElement('div');
    row.className = 'qb-msg ' + (who || 'bot');
    row.innerHTML = html;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function renderHits(hits, data, srcLabel, note) {
    var head = '<div class="qb-date">ข้อมูลจริงล่าสุด ' + esc(data.latestDate || '') + ' · ' + esc(srcLabel) + (note ? ' · ' + esc(note) : '') + '</div>';
    pushMsg(head + hits.map(kpiBlock).join(''), 'bot');
  }

  function answer(query) {
    pushMsg(esc(query), 'me');
    var src = byId(activeSourceId);

    if (!src.ready) {
      pushMsg('ยังไม่ได้เชื่อมข้อมูลของ <b>' + esc(src.label) + '</b> — ตอนนี้ตอบได้ <b>Production</b> และ <b>Quality</b> ' +
        'เมื่อเชื่อม data API ของ ' + esc(src.label) + ' แล้วจะถามได้ทันที', 'bot');
      return;
    }

    // Production & Quality both answer with grounded AI (free, scoped to the
    // dashboard's real fields — which cover both). Shared mode (one server-side
    // key for everyone) is preferred; a per-user key is the fallback; only if
    // no AI is available at all does it fall through to keyword lookup.
    if (src.id === 'production' || src.id === 'quality') {
      if (COPILOT_ANON) { askViaGateway(query); return; }
      if (copilotKey()) { askGemini(query); return; }
    }

    var data = src.getKpis();
    if (!data) {
      pushMsg('กำลังโหลดข้อมูล… ลองอีกครั้งในอีกสักครู่', 'bot');
      loadFeed().catch(function () {});
      return;
    }

    var hits = matchKpis(query, data);
    if (hits.length) { renderHits(hits, data, src.label); return; }

    // Forgiving: look in the OTHER ready source too (Production ⇄ Quality).
    var others = SOURCES.filter(function (s) { return s.ready && s.id !== activeSourceId; });
    for (var i = 0; i < others.length; i++) {
      var od = others[i].getKpis();
      if (!od) continue;
      var oh = matchKpis(query, od);
      if (oh.length) { renderHits(oh, od, others[i].label, 'พบในแท็บ ' + others[i].label); return; }
    }
    pushMsg('ไม่พบตัวชี้วัดที่ตรงกับคำถาม ลองพิมพ์ชื่อ KPI เช่น <b>Recovery · สีน้ำตาล · ความบริสุทธิ์ · การสูญเสีย</b> หรือกด <b>สรุป</b>', 'bot');
  }

  /* ── Grounded AI (Quality only, scoped to the dashboard) ────────────────── */
  function aiConfig() {
    try {
      var c = window.iDashAIProviders && window.iDashAIProviders.currentConfig && window.iDashAIProviders.currentConfig();
      if (c && c.shape === 'supabase' && c.endpoint && c.apiKey) return c;
    } catch (e) {}
    return null;
  }

  var QA_SYSTEM = [
    'คุณคือผู้ช่วยตอบคำถามเกี่ยวกับข้อมูลแดชบอร์ดการผลิตและคุณภาพ (Production & Quality) ของโรงงานน้ำตาลมิตรลาวเท่านั้น',
    'กติกาเด็ดขาด (ห้ามฝ่าฝืน):',
    '1) ใช้ได้เฉพาะตัวเลขที่อยู่ใน JSON facts ที่ให้มาเท่านั้น ห้ามสร้าง/เดา/ประมาณตัวเลขที่ไม่มีใน facts',
    '2) ถ้าคำถามไม่เกี่ยวกับข้อมูลโรงงานนี้ หรือ facts ไม่มีข้อมูลที่ถาม ให้บอกตรง ๆ ว่า "ไม่มีข้อมูลนี้ในแดชบอร์ด" และย้ำว่าตอบได้เฉพาะเรื่องในแดชบอร์ดโรงงานน้ำตาลนี้',
    '3) ตอบภาษาไทย กระชับ อ้างอิงตัวเลขจริงพร้อมหน่วยและวันที่เสมอ',
    '4) ข้อมูลมี dates[] (วันที่ เก่า→ใหม่) และแต่ละตัวชี้วัดมี values[] ที่ตรงตำแหน่งกับ dates[] (ค่าล่าสุด = ตัวสุดท้าย, null = ไม่มีข้อมูลวันนั้น) ใช้ดูแนวโน้ม/เทียบย้อนหลัง/หาสูงสุด-ต่ำสุดได้',
    '5) ห้ามพูดหรือแนะนำเรื่องนอกเหนือข้อมูลในแดชบอร์ดนี้'
  ].join('\n');

  // The FULL Quality Dashboard field set sent to the AI (every section). t =
  // "today" field in the feed, g = target field (optional), label + unit for
  // the model. Kept < 60 entries so the gateway's raw-rows guard never trips.
  var Q_FIELDS = [
    // อ้อย
    { t:'cane_today', g:'cane_target', label:'อ้อยเข้าหีบ', unit:'ตัน' },
    { t:'fiber_today', label:'% Fiber in Cane', unit:'%' },
    { t:'pol_today', g:'pol_target', label:'% Pol in Cane', unit:'%' },
    { t:'ccs_today', g:'ccs_target', label:'CCS of Factory', unit:'' },
    { t:'burnt_today', label:'% อ้อยไฟไหม้', unit:'%' },
    { t:'trash_today', label:'% Trash (สิ่งปลอมปน)', unit:'%' },
    { t:'soil_today', label:'% ดินติดอ้อย', unit:'%' },
    { t:'pcttelq_today', g:'pcttelq_target', label:'% Cane as TELQ', unit:'%' },
    // หีบ & สกัด
    { t:'tcph_today', g:'tcph_target', label:'อัตราการหีบ TCH', unit:'ตัน/ชม.' },
    { t:'prepidx_today', g:'prepidx_target', label:'Preparation Index (PI)', unit:'' },
    { t:'extpol_today', g:'extpol_target', label:'% Extraction (Pol)', unit:'%' },
    { t:'polbag_today', label:'% Pol in Bagasse', unit:'%' },
    { t:'moistbag_today', label:'% Moisture in Bagasse', unit:'%' },
    { t:'mjcane_today', label:'Mixed Juice % Cane', unit:'%' },
    { t:'bagcane_today', label:'Bagasse % Cane', unit:'%' },
    // น้ำอ้อย (ค่าเดี่ยว)
    { t:'fej_brix', label:'FEJ Brix', unit:'' },
    { t:'fej_pol', label:'FEJ Pol', unit:'' },
    { t:'fej_purity', label:'FEJ Purity', unit:'%' },
    { t:'mj_brix', label:'Mixed Juice Brix', unit:'' },
    { t:'mj_pol', label:'Mixed Juice Pol', unit:'' },
    { t:'mj_purity', label:'Mixed Juice Purity', unit:'%' },
    { t:'cj_brix', label:'Clarified Juice Brix', unit:'' },
    { t:'cj_purity', label:'Clarified Juice Purity', unit:'%' },
    { t:'rs_brix', label:'Syrup Brix', unit:'' },
    { t:'rs_purity', label:'Syrup Purity', unit:'%' },
    // Recovery & การสูญเสีย
    { t:'recov_today', g:'recov_target', label:'% Overall Recovery', unit:'%' },
    { t:'bhr_today', g:'bhr_target', label:'BHR (Boiling House Recovery)', unit:'%' },
    { t:'loss_today', g:'loss_target', label:'% การสูญเสียรวม', unit:'%' },
    { t:'loss_bag_today', label:'สูญเสียในชานอ้อย', unit:'%' },
    { t:'loss_fc_today', label:'สูญเสียในกากตะกอน', unit:'%' },
    { t:'loss_fm_today', label:'สูญเสียในโมลาส', unit:'%' },
    { t:'loss_undet_today', label:'สูญเสียหาสาเหตุไม่ได้', unit:'%' },
    // Final Molasses
    { t:'fm_today', label:'Final Molasses (โมลาส)', unit:'ตัน' },
    { t:'fm_pctcane_today', label:'Final Molasses % Cane', unit:'%' },
    { t:'fm_brix_today', g:'fm_brix_target', label:'FM Brix', unit:'' },
    { t:'fm_purity_today', g:'fm_purity_target', label:'FM Purity (ความบริสุทธิ์โมลาส)', unit:'%' },
    { t:'fm_rs_today', label:'FM Reducing Sugar', unit:'%' },
    { t:'fm_ash_today', label:'FM Ash (เถ้า)', unit:'%' },
    // Filter Cake
    { t:'fc_today', label:'Filter Cake (กากตะกอน)', unit:'ตัน' },
    { t:'fc_moist_today', g:'fc_moist_target', label:'FC Moisture (ความชื้นกาก)', unit:'%' },
    { t:'fc_pol_today', g:'fc_pol_target', label:'FC Pol (Pol กากตะกอน)', unit:'%' },
    // คุณภาพน้ำตาล
    { t:'vhp_today', g:'vhp_target', label:'น้ำตาล VHP (ผลิต)', unit:'ตัน' },
    { t:'totsugar_today', g:'totsugar_target', label:'น้ำตาลรวม', unit:'ตัน' },
    { t:'vhp_pol_today', label:'Pol น้ำตาล VHP', unit:'%' },
    { t:'vhp_moist_today', label:'ความชื้นน้ำตาล VHP', unit:'%' },
    { t:'vhp_colour_today', label:'สีน้ำตาล VHP (ICUMSA)', unit:'IU' },
    { t:'purity_today', g:'purity_target', label:'% Purity รวม', unit:'%' },
    { t:'me_today', g:'me_target', label:'% Mechanical Efficiency', unit:'%' },
    // พลังงาน & น้ำ
    { t:'avgsteam_today', g:'avgsteam_target', label:'ไอน้ำต่อตันอ้อย', unit:'' },
    { t:'kwhtc_today', g:'kwhtc_target', label:'หน่วยไฟต่อตันอ้อย', unit:'' },
    { t:'kwhsugar_today', g:'kwhsugar_target', label:'หน่วยไฟต่อตันน้ำตาล', unit:'' },
    { t:'edl_today', g:'edl_target', label:'ขายไฟ (EDL)', unit:'kWh' },
    { t:'netkwh_today', g:'netkwh_target', label:'ไฟฟ้าสุทธิ', unit:'kWh' },
    { t:'waterused_today', label:'น้ำที่ใช้', unit:'' },
    { t:'wastewater_today', label:'น้ำเสีย', unit:'' }
  ];

  // Compact facts: a shared dates[] plus each KPI's values[] aligned to it —
  // far fewer tokens than repeating the date on every point. Per the owner we
  // send the WHOLE season (every day in the feed) so any date can be asked; the
  // compact shape keeps even a full season inside the model's context.
  function qualityFacts() {
    var f = readFeedCache();
    if (!f || !f.daily.length) return null;
    var rows = f.daily;
    var latest = rows[rows.length - 1];
    var dates = rows.map(function (r) { return r.date; });
    function r3(v) { return v === null ? null : Math.round(v * 1000) / 1000; }
    var kpis = Q_FIELDS.map(function (k) {
      var vals = rows.map(function (row) { return r3(num(row[k.t])); });
      if (vals.every(function (v) { return v === null; })) return null;
      var o = { name: k.label, unit: k.unit || '', values: vals };
      if (k.g) { var t = num(latest[k.g]); if (t !== null) o.target = r3(t); }
      return o;
    }).filter(Boolean);
    return kpis.length ? { latestDate: latest.date, dates: dates, kpis: kpis } : null;
  }

  function buildAiPrompt(facts, question) {
    return 'ข้อมูลแดชบอร์ดโรงงานน้ำตาล Production & Quality (ล่าสุด ' + facts.latestDate + ')\n' +
      'dates (วันที่ เก่า→ใหม่): ' + JSON.stringify(facts.dates) + '\n' +
      'ตัวชี้วัด (values[] ตรงตำแหน่งกับ dates[]): ' + JSON.stringify(facts.kpis) + '\n\n' +
      'คำถามผู้ใช้: ' + question + '\n\nตอบเป็นภาษาไทยตามกติกา:';
  }

  var thinkSeq = 0;
  function pushThinking() {
    var log = document.getElementById('qbLog'); if (!log) return null;
    var id = 'qbThink' + (++thinkSeq);
    var row = document.createElement('div');
    row.className = 'qb-msg bot qb-think'; row.id = id;
    row.innerHTML = '<span class="qb-dot"></span><span class="qb-dot"></span><span class="qb-dot"></span>';
    log.appendChild(row); log.scrollTop = log.scrollHeight;
    return id;
  }
  function removeThinking(id) { if (!id) return; var el = document.getElementById(id); if (el) el.remove(); }

  // Soft check: flag only egregious fabrication — an answer that cites two or
  // more numbers of which NONE appear in the real facts. Dates and rounding
  // are tolerated so genuine answers are not nagged.
  function verifyNumbers(answerText, facts) {
    var nums = String(answerText).replace(/,/g, '').match(/\d+(?:\.\d+)?/g) || [];
    if (nums.length < 2) return true;
    var real = [];
    facts.kpis.forEach(function (k) {
      (k.values || []).forEach(function (v) { if (v != null) real.push(v); });
      if (k.target != null) real.push(k.target);
    });
    var hit = nums.some(function (n) {
      var f = parseFloat(n);
      return real.some(function (rv) { return Math.abs(rv - f) < 0.05 || (rv !== 0 && Math.abs((rv - f) / rv) < 0.01); });
    });
    return hit;
  }

  function askAI(question) {
    var cfg = aiConfig();
    var facts = qualityFacts();
    if (!facts) {
      pushMsg('กำลังโหลดข้อมูล Quality… ลองอีกครั้งในอีกสักครู่', 'bot');
      loadFeed().catch(function () {});
      return;
    }
    var tid = pushThinking();
    var prompt = 'ข้อมูล Quality Dashboard (ล่าสุด ' + facts.latestDate + ') เป็น JSON:\n' +
      JSON.stringify(facts.kpis) + '\n\nคำถามผู้ใช้: ' + question + '\n\nตอบเป็นภาษาไทยตามกติกา:';
    fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey, 'apikey': cfg.apiKey },
      body: JSON.stringify({
        action: 'quick-ask',
        payload: { model: 'claude-sonnet-5', system: QA_SYSTEM, prompt: prompt, facts: facts, maxTokens: 900, pin: cfg.pin }
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        removeThinking(tid);
        if (d && d.result && d.result.text) {
          var ans = d.result.text.trim();
          var ok = verifyNumbers(ans, facts);
          pushMsg(esc(ans).replace(/\n/g, '<br>') +
            '<div class="qb-aicred">🤖 AI · ตอบจากข้อมูล Quality จริง' +
            (ok ? '' : ' · <span class="qb-warn">⚠ โปรดตรวจตัวเลขอีกครั้ง</span>') + '</div>', 'bot');
        } else {
          var msg = (d && d.error && d.error.message) || 'ตอบไม่สำเร็จ';
          pushMsg('ขออภัย ตอบไม่สำเร็จ: ' + esc(msg), 'bot');
        }
      })
      .catch(function () {
        removeThinking(tid);
        pushMsg('เชื่อมต่อ AI ไม่สำเร็จ — ตรวจการตั้งค่า AI ในหน้า Home (โหมด Supabase gateway) หรือ PIN', 'bot');
      });
  }

  /* ── Shared gateway (one key for everyone, kept server-side) ─────────────
   * The Copilot reaches Gemini through the iDash gateway, which holds the
   * Gemini key as a secret. The anon key below is public by Supabase design
   * (it ships in every client) — the real key never leaves the server, so
   * every user's Copilot works with no per-device setup and Google can't
   * auto-revoke a leaked key. Fill COPILOT_ANON to turn shared mode on. */
  var COPILOT_GATEWAY = 'https://hcckwaukoaioxpsfpipk.supabase.co/functions/v1/swift-action';
  // Supabase publishable key — public by design (safe in the page). The Groq
  // key it fronts stays a server-side secret in the gateway.
  var COPILOT_ANON = 'sb_publishable_BZEZ_UVLqNLg2pQsXtNUjQ_cp2ZPY5h';

  function askViaGateway(question) {
    var facts = qualityFacts();
    if (!facts) {
      pushMsg('กำลังโหลดข้อมูล Quality… ลองอีกครั้งในอีกสักครู่', 'bot');
      loadFeed().catch(function () {});
      return;
    }
    var tid = pushThinking();
    var prompt = buildAiPrompt(facts, question);
    fetch(COPILOT_GATEWAY, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + COPILOT_ANON, 'apikey': COPILOT_ANON },
      body: JSON.stringify({
        action: 'quick-ask',
        payload: { provider: 'groq', model: copilotModel(), system: QA_SYSTEM, prompt: prompt, facts: facts, maxTokens: 900 }
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        removeThinking(tid);
        if (d && d.result && d.result.text) {
          var ans = d.result.text.trim();
          var ok = verifyNumbers(ans, facts);
          pushMsg(esc(ans).replace(/\n/g, '<br>') +
            '<div class="qb-aicred">🤖 AI · ตอบจากข้อมูลโรงงานจริง' +
            (ok ? '' : ' · <span class="qb-warn">⚠ โปรดตรวจตัวเลขอีกครั้ง</span>') + '</div>', 'bot');
        } else {
          pushMsg('ขออภัย ตอบไม่สำเร็จ: ' + esc((d && d.error && d.error.message) || 'ไม่ทราบสาเหตุ'), 'bot');
        }
      })
      .catch(function () {
        removeThinking(tid);
        pushMsg('เชื่อมต่อ AI ไม่สำเร็จ — ลองใหม่อีกครั้ง', 'bot');
      });
  }

  /* ── Google Gemini (per-user key, direct) — fallback when no shared key ──── */
  function copilotKey() {
    try { return (localStorage.getItem('idash.copilotKey') || '').trim(); } catch (e) { return ''; }
  }
  function setCopilotKey(k) {
    try { localStorage.setItem('idash.copilotKey', String(k || '').trim()); } catch (e) {}
  }
  function copilotModel() {
    try { return (localStorage.getItem('idash.copilotModel') || 'llama-3.3-70b-versatile').trim(); } catch (e) { return 'llama-3.3-70b-versatile'; }
  }
  function setCopilotModel(m) {
    try { localStorage.setItem('idash.copilotModel', String(m || '').trim()); } catch (e) {}
  }

  function askGemini(question) {
    var key = copilotKey();
    var facts = qualityFacts();
    if (!facts) {
      pushMsg('กำลังโหลดข้อมูล Quality… ลองอีกครั้งในอีกสักครู่', 'bot');
      loadFeed().catch(function () {});
      return;
    }
    var tid = pushThinking();
    var prompt = buildAiPrompt(facts, question);
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + copilotModel() +
      ':generateContent?key=' + encodeURIComponent(key);
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: QA_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 900, temperature: 0.2 }
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        removeThinking(tid);
        var text = d && d.candidates && d.candidates[0] && d.candidates[0].content &&
          d.candidates[0].content.parts &&
          d.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('').trim();
        if (text) {
          var ok = verifyNumbers(text, facts);
          pushMsg(esc(text).replace(/\n/g, '<br>') +
            '<div class="qb-aicred">🤖 AI (Gemini · ฟรี) · ตอบจากข้อมูล Quality จริง' +
            (ok ? '' : ' · <span class="qb-warn">⚠ โปรดตรวจตัวเลขอีกครั้ง</span>') + '</div>', 'bot');
        } else {
          var err = (d && d.error && d.error.message) || 'ตอบไม่สำเร็จ — ตรวจ API key ว่าถูกต้อง';
          pushMsg('ขออภัย ตอบไม่สำเร็จ: ' + esc(err), 'bot');
        }
      })
      .catch(function () {
        removeThinking(tid);
        pushMsg('เชื่อมต่อ Gemini ไม่สำเร็จ — ตรวจอินเทอร์เน็ต หรือ API key (กดรูปเฟือง ⚙ เพื่อแก้)', 'bot');
      });
  }

  /* ── Inline panel (teal identity — distinct from the blue AI Chatbot) ──── */
  function injectStyles() {
    if (document.getElementById('qbStyles')) return;
    var css = document.createElement('style');
    css.id = 'qbStyles';
    css.textContent =
      '.home-quickbot{display:flex;flex-direction:column;background:linear-gradient(180deg,#f0fdfa 0%,#ffffff 46%)!important;border-color:#c9ede6!important}' +
      '.home-quickbot:hover{border-color:#8fddce!important}' +
      '.qb-hero{display:flex;align-items:center;gap:14px;padding:2px 2px 13px;margin-bottom:2px;border-bottom:1px solid #e4f3ef}' +
      '.qb-hero-ava{width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;' +
        'background:radial-gradient(circle at 50% 30%,#ffffff,#eef2ff);box-shadow:0 8px 18px -7px rgba(79,70,229,.4),inset 0 1px 0 #fff,0 0 0 1px #e4e8fb}' +
      '.qb-hero-ava svg{width:38px;height:38px}' +
      '.qb-hero-txt{flex:1;min-width:0}' +
      '.qb-hero-title{font-size:20px;font-weight:800;letter-spacing:-.01em;line-height:1.1;' +
        'background:linear-gradient(100deg,#0f2a28 38%,#0d9488 96%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}' +
      '.qb-spark{-webkit-text-fill-color:initial;font-size:16px}' +
      '.qb-hero-sub{font-size:12.5px;color:#64748b;margin-top:3px;font-weight:500}' +
      '.qb-hero-right{display:flex;align-items:center;gap:7px;align-self:flex-start}' +
      '.qb-hero-badge{font-size:10px;font-weight:700;color:#0e7a4e;background:#e2f5ec;border-radius:20px;padding:3px 9px;white-space:nowrap}' +
      '.qb-gear{border:none;background:none;padding:2px;cursor:pointer;color:#94a3b8;display:flex;border-radius:6px;transition:color .15s,background .15s}' +
      '.qb-gear:hover{color:#0d9488;background:#ecfdf9}.qb-gear svg{width:16px;height:16px}' +
      '.qb-set{background:#f0fdfa;border:1px solid #cbe7e1;border-radius:10px;padding:10px 12px;margin-bottom:10px}' +
      '.qb-set[hidden]{display:none}' +
      '.qb-set-label{font-size:11px;font-weight:700;color:#0f2a28;margin-bottom:6px}' +
      '.qb-set-row{display:flex;gap:7px}' +
      '.qb-set-row input{flex:1;min-width:0;border:1px solid #cfe9e3;border-radius:8px;padding:7px 10px;font:inherit;font-size:12px;outline:none}' +
      '.qb-set-row input:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.12)}' +
      '.qb-set-row button{border:none;background:linear-gradient(180deg,#14b8a6,#0d9488);color:#fff;border-radius:8px;padding:0 14px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}' +
      '.qb-set-model{width:100%;margin-top:5px;border:1px solid #cfe9e3;border-radius:8px;padding:7px 10px;font:inherit;font-size:12px;color:#0f2a28;background:#fff;outline:none}' +
      '.qb-set-model:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.12)}' +
      '.qb-set-hint{font-size:10.5px;color:#5b8a82;margin-top:6px;line-height:1.5}' +
      '.qb-src{display:flex;gap:6px;margin:10px 0 8px;flex-wrap:wrap}' +
      '.qb-chip{border:1px solid #cbe7e1;background:#fff;border-radius:20px;padding:4px 12px;font:inherit;font-size:11.5px;font-weight:700;color:#475569;cursor:pointer;transition:background .15s,border-color .15s}' +
      '.qb-chip.on{background:#0d9488;color:#fff;border-color:#0d9488}' +
      '.qb-chip.lock{opacity:.55;cursor:pointer}.qb-chip.lock::after{content:" 🔒";font-size:9px}' +
      '.qb-log{height:300px;overflow-y:auto;background:linear-gradient(180deg,#f7fefc,#fbfffe);border:1px solid #e4f3ef;border-radius:10px;padding:13px;display:flex;flex-direction:column;gap:9px;margin-bottom:9px}' +
      '.qb-msg{max-width:90%;font-size:12.5px;line-height:1.6}' +
      '.qb-msg.me{align-self:flex-end;background:linear-gradient(180deg,#14b8a6,#0d9488);color:#fff;padding:8px 12px;border-radius:12px 12px 4px 12px}' +
      '.qb-msg.bot{align-self:flex-start;background:#fff;border:1px solid #e3ecfa;color:#374151;padding:10px 12px;border-radius:3px 12px 12px 12px;box-shadow:var(--shadow-sm)}' +
      '.qb-date{font-size:10.5px;color:#94a3b8;margin-bottom:6px;font-weight:600}' +
      '.qb-ans{padding:7px 0;border-top:1px dashed #eef2f8}.qb-ans:first-of-type{border-top:none;padding-top:0}' +
      '.qb-ans-name{font-size:11.5px;color:#64748b;font-weight:700}' +
      '.qb-ans-val{font-size:18px;font-weight:800;color:#0f2a28;margin:1px 0 2px}' +
      '.qb-ans-sub{font-size:11px;color:#64748b}.qb-good{color:#0e9f6e;font-weight:700}.qb-bad{color:#e11d48;font-weight:700}' +
      '.qb-think{display:flex!important;gap:5px;align-items:center;padding:12px 14px!important}' +
      '.qb-dot{width:7px;height:7px;border-radius:50%;background:#0d9488;opacity:.4;animation:qbBlink 1s infinite}' +
      '.qb-dot:nth-child(2){animation-delay:.2s}.qb-dot:nth-child(3){animation-delay:.4s}' +
      '@keyframes qbBlink{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}' +
      '.qb-aicred{font-size:10px;color:#94a3b8;margin-top:7px;border-top:1px dashed #eef2f8;padding-top:5px}' +
      '.qb-warn{color:#b45309;font-weight:700}' +
      '.qb-sugg{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 10px}' +
      '.qb-sugg button{border:1px solid #bfeee5;background:#fff;border-radius:999px;padding:5px 11px;font:inherit;font-size:11.5px;color:#0d9488;font-weight:700;cursor:pointer;transition:background .15s,transform .15s}' +
      '.qb-sugg button:hover{background:#ecfdf9;transform:translateY(-1px)}' +
      '.qb-input{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #cfe9e3;border-radius:10px;padding:5px 5px 5px 14px}' +
      '.qb-input:focus-within{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.14)}' +
      '.qb-input input{flex:1;min-width:0;border:none;outline:none;background:none;font-family:var(--font);font-size:13px;color:var(--text)}' +
      '.qb-input button{width:30px;height:30px;border-radius:8px;border:none;flex-shrink:0;cursor:pointer;background:linear-gradient(180deg,#14b8a6,#0d9488);display:flex;align-items:center;justify-content:center}' +
      '.qb-input button svg{width:16px;height:16px;color:#fff}';
    document.head.appendChild(css);
  }

  function renderSugg(mount) {
    var el = mount.querySelector('#qbSugg');
    if (!el) return;
    el.innerHTML = '';
    var list = SUGG[activeSourceId] || [];
    list.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.addEventListener('click', function () { answer(t); });
      el.appendChild(b);
    });
  }

  function build(mount) {
    mount.classList.add('home-quickbot');
    mount.innerHTML =
      '<div class="qb-hero">' +
        '<div class="qb-hero-ava">' +
          '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<defs><linearGradient id="qbCop" x1="7" y1="7" x2="41" y2="41" gradientUnits="userSpaceOnUse">' +
              '<stop stop-color="#22d3ee"/><stop offset=".5" stop-color="#3b82f6"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>' +
            '<path d="M10 26 a14 14 0 0 1 28 0" fill="none" stroke="url(#qbCop)" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="5.5" y="23" width="7" height="12.5" rx="3.5" fill="url(#qbCop)"/>' +
            '<rect x="35.5" y="23" width="7" height="12.5" rx="3.5" fill="url(#qbCop)"/>' +
            '<rect x="12" y="16" width="24" height="24" rx="9" fill="url(#qbCop)"/>' +
            '<rect x="16" y="21" width="16" height="14" rx="7" fill="#eef4ff"/>' +
            '<circle cx="21" cy="27.5" r="2" fill="#3730a3"/>' +
            '<circle cx="27" cy="27.5" r="2" fill="#3730a3"/>' +
            '<path d="M21 31.2 q3 2.6 6 0" stroke="#3730a3" stroke-width="1.7" fill="none" stroke-linecap="round"/>' +
            '<path d="M12.5 30 v3.5 a3 3 0 0 0 3 3 H19" fill="none" stroke="url(#qbCop)" stroke-width="2" stroke-linecap="round"/>' +
            '<circle cx="20.2" cy="36.5" r="1.7" fill="#7c3aed"/>' +
          '</svg>' +
        '</div>' +
        '<div class="qb-hero-txt">' +
          '<div class="qb-hero-title">iDash Copilot <span class="qb-spark">✨</span></div>' +
          '<div class="qb-hero-sub">ค้นหาข้อมูลโรงงานได้ทันที</div>' +
        '</div>' +
        '<div class="qb-hero-right">' +
          '<span class="qb-hero-badge">ตัวเลขจริง 100%</span>' +
          '<button type="button" class="qb-gear" id="qbClear" title="ล้างการสนทนา" aria-label="ล้างการสนทนา">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
          '</button>' +
          '<button type="button" class="qb-gear" id="qbGear" title="ตั้งค่าโมเดล AI (ฟรี)" aria-label="ตั้งค่า">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="qb-set" id="qbSet" hidden>' +
        '<div class="qb-set-label">โมเดล AI (Groq · ฟรี)</div>' +
        '<select id="qbSetModel" class="qb-set-model">' +
          '<option value="llama-3.3-70b-versatile">llama-3.3-70b (ฉลาดสุด)</option>' +
          '<option value="llama-3.1-8b-instant">llama-3.1-8b (เร็วสุด)</option>' +
          '<option value="gemma2-9b-it">gemma2-9b</option>' +
        '</select>' +
        '<div class="qb-set-row" style="margin-top:8px">' +
          '<button type="button" id="qbSetSave">บันทึก</button>' +
        '</div>' +
        '<div class="qb-set-hint">Copilot ใช้ AI ฟรีร่วมกันทั้งองค์กร (Groq) — ทุกคนถามได้เลย ไม่ต้องตั้งค่า key เอง</div>' +
        '<input id="qbSetInput" type="hidden">' +
      '</div>' +
      '<div class="qb-src" id="qbSrc"></div>' +
      '<div class="qb-log" id="qbLog"></div>' +
      '<div class="qb-sugg" id="qbSugg"></div>' +
      '<form class="qb-input" id="qbForm">' +
        '<input id="qbInput" placeholder="พิมพ์คำถาม เช่น Recovery หรือ สีน้ำตาล" autocomplete="off">' +
        '<button type="submit" aria-label="ถาม"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
      '</form>';

    var srcEl = mount.querySelector('#qbSrc');
    SOURCES.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'qb-chip' + (s.id === activeSourceId ? ' on' : '') + (s.ready ? '' : ' lock');
      b.textContent = s.label;
      b.addEventListener('click', function () {
        activeSourceId = s.id;
        [].forEach.call(srcEl.children, function (c) { c.classList.remove('on'); });
        b.classList.add('on');
        renderSugg(mount);
        if (!s.ready) {
          pushMsg('ยังไม่ได้เชื่อมข้อมูลของ <b>' + esc(s.label) + '</b> — เมื่อมี data API แล้วจะถามได้ทันที', 'bot');
        } else if (s.id === 'quality' && !qualityNoted) {
          qualityNoted = true;
          pushMsg((COPILOT_ANON || copilotKey())
            ? '💬 แท็บ <b>Quality</b> ตอบด้วย <b>AI (Gemini · ฟรี)</b> เฉพาะข้อมูลในแดชบอร์ดนี้ — ถามเป็นประโยคได้เลย เช่น "แนวโน้มสีน้ำตาล 7 วัน" หรือ "เทียบความบริสุทธิ์เมื่อวานกับวันนี้"'
            : '🔑 แท็บ <b>Quality</b> ใช้ <b>AI ฟรี (Gemini)</b> — กดรูปเฟือง ⚙ มุมขวาบนเพื่อใส่ API key ฟรีก่อน (ตอนนี้ยังค้นแบบ keyword ได้)', 'bot');
        }
      });
      srcEl.appendChild(b);
    });

    renderSugg(mount);

    greeting();

    mount.querySelector('#qbForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = mount.querySelector('#qbInput');
      var q = inp.value.trim();
      if (!q) return;
      inp.value = '';
      answer(q);
    });

    // Gemini key settings (gear → strip). The key stays in this browser only.
    var setBox = mount.querySelector('#qbSet');
    var setInput = mount.querySelector('#qbSetInput');
    var setModel = mount.querySelector('#qbSetModel');
    setInput.value = copilotKey();
    setModel.value = copilotModel();
    mount.querySelector('#qbClear').addEventListener('click', clearChat);
    mount.querySelector('#qbGear').addEventListener('click', function () {
      setBox.hidden = !setBox.hidden;
      if (!setBox.hidden) setInput.focus();
    });
    mount.querySelector('#qbSetSave').addEventListener('click', function () {
      setCopilotModel(setModel.value);
      setBox.hidden = true;
      pushMsg('✅ บันทึกแล้ว — ใช้โมเดล <b>' + esc(copilotModel()) + '</b> (Groq · ฟรี) ถามแท็บ Quality เป็นประโยค/วิเคราะห์ย้อนหลังได้เลย', 'bot');
    });

    // Warm the feed so answers are instant.
    if (!readFeedCache()) loadFeed().catch(function () {});
    else loadFeed().catch(function () {});   // refresh in background too
  }

  function boot() {
    var mount = document.getElementById('qbMount');
    if (!mount) return;
    injectStyles();
    build(mount);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
