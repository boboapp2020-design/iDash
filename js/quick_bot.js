/**
 * iDash — Quick Ask bot (no-AI, grounded)
 * ---------------------------------------------------------------------------
 * An inline "ถามผลงานเร็ว" panel (mounted at #qbMount, in the Home bottom row
 * beside the AI Chatbot) that answers from the platform's REAL numbers only —
 * it matches the question to a KPI and prints the figures the dashboards
 * already computed. There is NO language model in this path, so it cannot
 * invent a number: every value shown is read verbatim from a connected source.
 *
 * Multi-source by design. A source is {id, label, ready, getKpis()}. Only ones
 * with a live data feed are `ready`; the rest are listed so the user sees
 * they're planned, and wiring one later is just adding its getKpis().
 *
 *   production — live, via window.iDashHomeKpi (Production Dashboard / DailyReport)
 *   sale / store / boi / qm — declared, awaiting their own data API.
 */
(function () {
  'use strict';

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

  /* ── Sources ──────────────────────────────────────────────────────────── */
  var PROD_SYN = {
    cane_crushed: ['อ้อย', 'เข้าหีบ', 'หีบ', 'crush', 'cane', 'ตันอ้อย', 'อ้อยเข้า'],
    ccs_factory:  ['ccs', 'ความหวาน', 'ซีซีเอส'],
    burnt_cane:   ['ไฟไหม้', 'อ้อยไฟ', 'burnt', 'เผา', 'ไหม้'],
    cane_as_telq: ['telq', 'สด', 'อ้อยสด', 'เทลคิว', 'เทล'],
    edl_export:   ['ไฟ', 'ขายไฟ', 'edl', 'kwh', 'ไฟฟ้า', 'พลังงาน', 'หน่วยไฟ']
  };

  var SOURCES = [
    {
      id: 'production', label: 'Production', ready: true,
      getKpis: function () {
        var d = (window.iDashHomeKpi && window.iDashHomeKpi.getData && window.iDashHomeKpi.getData()) || null;
        if (!d || !Array.isArray(d.kpis)) return null;
        return {
          latestDate: d.latestDate || '',
          kpis: d.kpis.map(function (k) {
            return {
              id: k.id, nameTH: k.nameTH, unit: k.unit, decimals: k.decimals,
              today: (k.today !== null && k.today !== undefined) ? k.today : k.value,
              delta: k.delta, direction: k.direction, todate: k.todate, target: k.target,
              syn: PROD_SYN[k.id] || []
            };
          })
        };
      },
      refresh: function () {
        return (window.iDashHomeKpi && window.iDashHomeKpi.refresh)
          ? window.iDashHomeKpi.refresh() : Promise.resolve(null);
      }
    },
    { id: 'sale',  label: 'Sale',  ready: false },
    { id: 'store', label: 'Store', ready: false },
    { id: 'boi',   label: 'BOI',   ready: false },
    { id: 'qm',    label: 'QM',    ready: false }
  ];

  var OVERVIEW = ['สรุป', 'ทั้งหมด', 'รวม', 'overview', 'all', 'ภาพรวม', 'ทุกตัว'];
  var activeSourceId = 'production';

  /* ── Matching (pure keyword, no AI) ───────────────────────────────────── */
  function nq(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }
  function matchKpis(query, data) {
    var q = nq(query);
    if (!q) return [];
    if (OVERVIEW.some(function (w) { return q.indexOf(nq(w)) > -1; })) return data.kpis.slice();
    return data.kpis.filter(function (k) {
      if (nq(k.nameTH).indexOf(q) > -1 || q.indexOf(nq(k.nameTH)) > -1) return true;
      return (k.syn || []).some(function (s) { return q.indexOf(nq(s)) > -1; });
    });
  }

  /* ── Answer (real figures only) ───────────────────────────────────────── */
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

  function pushMsg(html, who) {
    var log = document.getElementById('qbLog');
    if (!log) return;
    var row = document.createElement('div');
    row.className = 'qb-msg ' + (who || 'bot');
    row.innerHTML = html;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function answer(query) {
    pushMsg(esc(query), 'me');
    var src = SOURCES.filter(function (s) { return s.id === activeSourceId; })[0];
    if (!src.ready) {
      pushMsg('ยังไม่ได้เชื่อมข้อมูลของ <b>' + esc(src.label) + '</b> — ตอนนี้ตอบได้เฉพาะ <b>Production</b> ' +
        'เมื่อเชื่อม data API ของ ' + esc(src.label) + ' แล้วจะถามได้ทันที', 'bot');
      return;
    }
    var data = src.getKpis();
    if (!data || !data.kpis.length) {
      pushMsg('กำลังโหลดข้อมูล Production… ลองอีกครั้งในอีกสักครู่', 'bot');
      if (src.refresh) src.refresh().then(function () {}).catch(function () {});
      return;
    }
    var hits = matchKpis(query, data);
    if (!hits.length) {
      pushMsg('ไม่พบตัวชี้วัดที่ตรงกับคำถาม ลองพิมพ์: <b>อ้อยเข้าหีบ · CCS · Burnt Cane · TELQ · ขายไฟ · สรุป</b>', 'bot');
      return;
    }
    var head = data.latestDate ? '<div class="qb-date">ข้อมูลจริงล่าสุด ' + esc(data.latestDate) + ' · Production</div>' : '';
    pushMsg(head + hits.map(kpiBlock).join(''), 'bot');
  }

  /* ── Inline panel ─────────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('qbStyles')) return;
    var css = document.createElement('style');
    css.id = 'qbStyles';
    css.textContent =
      '.home-quickbot{display:flex;flex-direction:column}' +
      '.qb-hero{display:flex;align-items:center;gap:14px;padding:2px 2px 13px;margin-bottom:2px;border-bottom:1px solid #eef2f8}' +
      '.qb-hero-ava{width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;' +
        'background:radial-gradient(circle at 50% 32%,#f2f7ff,#dce8fb);box-shadow:0 8px 18px -7px rgba(37,99,235,.45),inset 0 1px 0 #fff,0 0 0 1px #e6eefb}' +
      '.qb-hero-ava svg{width:42px;height:42px}' +
      '.qb-hero-txt{flex:1;min-width:0}' +
      '.qb-hero-title{font-size:20px;font-weight:800;letter-spacing:-.01em;line-height:1.1;' +
        'background:linear-gradient(100deg,#0f1b3d 42%,#2563eb 96%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}' +
      '.qb-spark{-webkit-text-fill-color:initial;font-size:16px}' +
      '.qb-hero-sub{font-size:12.5px;color:#64748b;margin-top:3px;font-weight:500}' +
      '.qb-hero-badge{align-self:flex-start;font-size:10px;font-weight:700;color:#0e7a4e;background:#e2f5ec;border-radius:20px;padding:3px 9px;white-space:nowrap}' +
      '.qb-src{display:flex;gap:6px;margin:10px 0 8px;flex-wrap:wrap}' +
      '.qb-chip{border:1px solid #d3e0f7;background:#fff;border-radius:20px;padding:4px 12px;font:inherit;font-size:11.5px;font-weight:700;color:#475569;cursor:pointer;transition:background .15s,border-color .15s}' +
      '.qb-chip.on{background:#2563eb;color:#fff;border-color:#2563eb}' +
      '.qb-chip.lock{opacity:.55;cursor:pointer}.qb-chip.lock::after{content:" 🔒";font-size:9px}' +
      '.qb-log{height:300px;overflow-y:auto;background:linear-gradient(180deg,#f7faff,#fbfdff);border:1px solid #eaf1fb;border-radius:10px;padding:13px;display:flex;flex-direction:column;gap:9px;margin-bottom:9px}' +
      '.qb-msg{max-width:90%;font-size:12.5px;line-height:1.6}' +
      '.qb-msg.me{align-self:flex-end;background:#2563eb;color:#fff;padding:8px 12px;border-radius:12px 12px 4px 12px}' +
      '.qb-msg.bot{align-self:flex-start;background:#fff;border:1px solid #e3ecfa;color:#374151;padding:10px 12px;border-radius:3px 12px 12px 12px;box-shadow:var(--shadow-sm)}' +
      '.qb-date{font-size:10.5px;color:#94a3b8;margin-bottom:6px;font-weight:600}' +
      '.qb-ans{padding:7px 0;border-top:1px dashed #eef2f8}.qb-ans:first-of-type{border-top:none;padding-top:0}' +
      '.qb-ans-name{font-size:11.5px;color:#64748b;font-weight:700}' +
      '.qb-ans-val{font-size:18px;font-weight:800;color:#0f1b3d;margin:1px 0 2px}' +
      '.qb-ans-sub{font-size:11px;color:#64748b}.qb-good{color:#0e9f6e;font-weight:700}.qb-bad{color:#e11d48;font-weight:700}' +
      '.qb-sugg{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 10px}' +
      '.qb-sugg button{border:1px solid #d3e0f7;background:#fff;border-radius:999px;padding:5px 11px;font:inherit;font-size:11.5px;color:#1d4ed8;font-weight:700;cursor:pointer;transition:background .15s,transform .15s}' +
      '.qb-sugg button:hover{background:#eef4ff;transform:translateY(-1px)}' +
      '.qb-input{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #dbe5f4;border-radius:10px;padding:5px 5px 5px 14px}' +
      '.qb-input:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(37,99,235,.12)}' +
      '.qb-input input{flex:1;min-width:0;border:none;outline:none;background:none;font-family:var(--font);font-size:13px;color:var(--text)}' +
      '.qb-input button{width:30px;height:30px;border-radius:8px;border:none;flex-shrink:0;cursor:pointer;background:var(--primary);display:flex;align-items:center;justify-content:center}' +
      '.qb-input button svg{width:16px;height:16px;color:#fff}';
    document.head.appendChild(css);
  }

  function build(mount) {
    mount.classList.add('home-quickbot');
    mount.innerHTML =
      '<div class="qb-hero">' +
        '<div class="qb-hero-ava">' +
          '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<line x1="32" y1="8" x2="32" y2="15" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round"/>' +
            '<circle cx="32" cy="6.5" r="3" fill="#3b82f6"/>' +
            '<rect x="8" y="24" width="7" height="13" rx="3.5" fill="#93c5fd"/>' +
            '<rect x="49" y="24" width="7" height="13" rx="3.5" fill="#93c5fd"/>' +
            '<rect x="14" y="15" width="36" height="30" rx="11" fill="url(#qbRg)"/>' +
            '<rect x="19" y="21" width="26" height="18" rx="9" fill="#0f1b3d"/>' +
            '<circle cx="27" cy="29.5" r="3.2" fill="#5eead4"/>' +
            '<circle cx="37" cy="29.5" r="3.2" fill="#5eead4"/>' +
            '<path d="M27 35 q5 3 10 0" stroke="#5eead4" stroke-width="2" fill="none" stroke-linecap="round"/>' +
            '<defs><linearGradient id="qbRg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs>' +
          '</svg>' +
        '</div>' +
        '<div class="qb-hero-txt">' +
          '<div class="qb-hero-title">Quick AI Chatbot <span class="qb-spark">✨</span></div>' +
          '<div class="qb-hero-sub">ค้นหาข้อมูลโรงงานได้ทันที</div>' +
        '</div>' +
        '<span class="qb-hero-badge">ตัวเลขจริง 100%</span>' +
      '</div>' +
      '<div class="qb-src" id="qbSrc"></div>' +
      '<div class="qb-log" id="qbLog"></div>' +
      '<div class="qb-sugg" id="qbSugg"></div>' +
      '<form class="qb-input" id="qbForm">' +
        '<input id="qbInput" placeholder="พิมพ์คำถาม เช่น อ้อยเข้าหีบวันนี้" autocomplete="off">' +
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
        if (!s.ready) pushMsg('ยังไม่ได้เชื่อมข้อมูลของ <b>' + esc(s.label) + '</b> — เมื่อมี data API แล้วจะถามได้ทันที', 'bot');
      });
      srcEl.appendChild(b);
    });

    var suggEl = mount.querySelector('#qbSugg');
    ['อ้อยเข้าหีบ', 'CCS', 'Burnt Cane', 'TELQ', 'ขายไฟ', 'สรุปทั้งหมด'].forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.addEventListener('click', function () { answer(t); });
      suggEl.appendChild(b);
    });

    pushMsg('สวัสดีครับ 👋 ถามผลงาน Production ได้เลย เช่น "อ้อยเข้าหีบวันนี้" หรือ "สรุปทั้งหมด" — ตอบจากตัวเลขจริงในระบบเท่านั้น', 'bot');

    mount.querySelector('#qbForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = mount.querySelector('#qbInput');
      var q = inp.value.trim();
      if (!q) return;
      inp.value = '';
      answer(q);
    });

    // Warm the Production data if the cache is cold.
    var prod = SOURCES[0];
    if (prod.getKpis && !prod.getKpis() && prod.refresh) prod.refresh().catch(function () {});
  }

  function boot() {
    var mount = document.getElementById('qbMount');
    if (!mount) return;   // only renders where the page provides a slot
    injectStyles();
    build(mount);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
