/**
 * iDash Interactive Dashboard Generator v2
 *
 * Produces a complete self-contained HTML file from dashboardSpec + theme + dataset.
 * ALL charts are data-driven from the raw dataset. Filters re-compute everything
 * (KPIs, charts, table, totals). 50+ themes. Theme picker popup. Excel-like table filters.
 */
(function () {
  'use strict';

  var ECHARTS_CDN = 'vendor/echarts.min.js';
  var FONT_CDN = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap';

  function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function colName(col) {
    if (typeof col === 'string') return col;
    if (col && col.name) return col.name;
    return String(col);
  }

  function getColNames(dataset) {
    if (!dataset || !dataset.columns) return [];
    return dataset.columns.map(colName);
  }

  // Date values are numeric under Number() (a Date's valueOf() is its epoch
  // timestamp), which would otherwise let date columns slip into numCols and
  // get summed into a meaningless KPI — excluded here so date columns are
  // always treated as non-numeric (text/filter), never a summable measure.
  function isDateLikeVal(v) {
    if (v instanceof Date) return true;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}([T ]|$)/.test(v)) return true;
    return false;
  }

  function isNumericVal(v) {
    if (v == null || v === '') return false;
    if (isDateLikeVal(v)) return false;
    return !isNaN(Number(v));
  }

  function classifyColumns(dataset) {
    var names = getColNames(dataset);
    var data = dataset.data || [];
    var sample = data.slice(0, 80);
    var textCols = [];
    var numCols = [];
    names.forEach(function (name) {
      var numCount = 0, dateCount = 0, total = 0;
      sample.forEach(function (row) {
        var v = row[name];
        if (v != null && v !== '') {
          total++;
          if (isDateLikeVal(v)) dateCount++;
          else if (isNumericVal(v)) numCount++;
        }
      });
      // A column that's mostly dates never counts as numeric, even if a few
      // stray numeric-looking values slip through.
      if (total > 0 && dateCount / total >= 0.3) { textCols.push(name); return; }
      if (total > 0 && numCount / total >= 0.7) numCols.push(name);
      else textCols.push(name);
    });
    return { textCols: textCols, numCols: numCols };
  }

  function resolveTitle(meta) {
    if (meta.datasetTitle) return meta.datasetTitle;
    if (meta.filename) return meta.filename.replace(/\.(xlsx?|csv|json)$/i, '').replace(/[_\-]+/g, ' ');
    return meta.domainNameTH || 'Dashboard';
  }

  // ─── 216 THEMES (from shared palette) ───
  function buildThemeLibrary() {
    if (window.iDashThemes && window.iDashThemes.length > 0) return window.iDashThemes;
    return [
      { id:'ocean_blue', name:'Ocean Blue', accent:'#2563eb', chart:['#2563eb','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16'], bg:'#f8fafc', cardBg:'#ffffff', border:'#e2e8f0', textPrimary:'#0f172a', textSecondary:'#64748b', textMuted:'#94a3b8', dark:false },
      { id:'dark_navy', name:'Dark Navy', accent:'#3b82f6', chart:['#3b82f6','#10b981','#f59e0b','#a855f7','#f43f5e','#06b6d4','#84cc16'], bg:'#0f172a', cardBg:'#1e293b', border:'#334155', textPrimary:'#f1f5f9', textSecondary:'#94a3b8', textMuted:'#64748b', dark:true }
    ];
  }

  // ─── CSS ───
  function generateCss() {
    return [
      ':root{--accent:#2563eb;--bg:#f8fafc;--card-bg:#fff;--border:#e2e8f0;--text-primary:#0f172a;--text-secondary:#64748b;--text-muted:#94a3b8;--positive:#10b981;--negative:#ef4444;--shadow:0 1px 2px rgba(15,23,42,.05)}',
      '*{box-sizing:border-box;margin:0;padding:0}',
      'body{font-family:"IBM Plex Sans Thai","Inter",system-ui,sans-serif;background:var(--bg);color:var(--text-primary);line-height:1.5}',
      // Numbers everywhere use tabular figures — the single cheapest "designed
      // by a human" signal (skill: number formatting is part of design).
      '.kpi-value,.kpi-delta,.dt-table td.num,.dt-table tfoot td{font-variant-numeric:tabular-nums}',
      // ─── App-style top navigation bar (references all have one) ───
      '.topbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:14px;padding:0 24px;height:60px;background:var(--card-bg);border-bottom:1px solid var(--border)}',
      '.topbar-brand{width:34px;height:34px;border-radius:9px;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
      '.topbar-brand svg{width:18px;height:18px;color:#fff}',
      '.topbar-titles{min-width:0}',
      '.topbar h1{font-size:16px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.topbar-sub{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-secondary);white-space:nowrap;overflow:hidden}',
      '.topbar-chip{background:color-mix(in srgb,var(--accent) 10%,transparent);color:var(--accent);padding:1px 8px;border-radius:999px;font-weight:600}',
      '.topbar-right{margin-left:auto;display:flex;align-items:center;gap:8px}',
      '.topbar-pill{font-size:11px;color:var(--text-secondary);background:var(--bg);border:1px solid var(--border);padding:5px 12px;border-radius:999px;white-space:nowrap}',
      '.topbar-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:var(--card-bg);color:var(--text-primary);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}',
      '.topbar-btn:hover{border-color:var(--accent);color:var(--accent)}',
      '.topbar-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}',
      '.topbar-btn.primary:hover{opacity:.9;color:#fff}',
      '.dash-container{max-width:1440px;margin:0 auto;padding:20px 24px 32px}',
      '.editable-title{cursor:text;border-radius:4px;padding:2px 4px;margin:-2px -4px;outline:none;transition:background .15s}',
      '.editable-title:hover{background:var(--border)}',
      '.editable-title:focus{background:var(--border);box-shadow:0 0 0 2px var(--accent)}',
      '.editable-title:empty:before{content:attr(data-placeholder);color:var(--text-secondary)}',
      '.filter-bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:12px 16px;background:var(--card-bg);border:1px solid var(--border);border-radius:10px;margin-bottom:20px}',
      '.filter-bar label{font-size:12px;font-weight:500;color:var(--text-secondary)}',
      '.filter-bar select,.filter-bar input{padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text-primary);font-size:12px;outline:none}',
      '.filter-bar select:focus,.filter-bar input:focus{border-color:var(--accent)}',
      '.filter-bar .btn-theme{padding:6px 14px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;cursor:pointer;font-weight:500;display:flex;align-items:center;gap:4px}',
      '.filter-bar .row-count{margin-left:auto;font-size:11px;color:var(--text-muted);background:var(--bg);padding:4px 10px;border-radius:12px}',
      // ─── KPI strip: skill's card anatomy — muted 12px label, 30px semibold
      // tabular numeral, delta chip naming its direction, mini sparkline.
      '.kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(196px,1fr));gap:14px;margin-bottom:20px}',
      '.kpi-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:16px 18px;box-shadow:var(--shadow)}',
      '.kpi-card-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
      '.kpi-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
      '.kpi-icon svg{width:17px;height:17px}',
      '.kpi-label{font-size:12px;font-weight:500;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.kpi-value{font-size:30px;font-weight:700;letter-spacing:-.02em;color:var(--text-primary);line-height:1.1}',
      '.kpi-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px}',
      '.kpi-spark{width:74px;height:26px;flex-shrink:0;color:var(--text-muted);opacity:.9}',
      '.kpi-delta{font-size:11px;font-weight:700;white-space:nowrap;padding:2px 8px;border-radius:999px}',
      '.kpi-delta.up{color:var(--positive);background:color-mix(in srgb,var(--positive) 10%,transparent)}',
      '.kpi-delta.down{color:var(--negative);background:color-mix(in srgb,var(--negative) 10%,transparent)}',
      '.kpi-delta-wrap{display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0}',
      '.kpi-baseline{font-size:9px;color:var(--text-secondary);opacity:.75;white-space:nowrap}',
      // ─── Chart zone: 12-col grid — hero 2/3 + side 1/3 first row (the
      // asymmetric split every reference screenshot uses), then 6/6 pairs.
      '.chart-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-bottom:20px}',
      '.chart-card{grid-column:span 6;background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);min-width:0}',
      '.chart-card.hero{grid-column:span 8}',
      '.chart-card.side{grid-column:span 4}',
      '.chart-card.full-width{grid-column:span 12}',
      '.chart-card-title{font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:14px}',
      '.insight-line{font-size:13px;line-height:1.7;color:var(--text-secondary);padding:4px 0}',
      '.chart-container{width:100%;height:300px}',
      // ─── Stat strip (replaces the unreadable overlapping-gauge widget):
      // one row per rate metric — avg value + a range bar whose scale is the
      // data's own min→max, never a fabricated 0-100.
      '.stat-strip{display:flex;flex-direction:column;justify-content:center;gap:18px;height:100%;padding:4px 2px}',
      '.stat-row-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:7px}',
      '.stat-name{font-size:12.5px;font-weight:600;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.stat-avg{font-size:21px;font-weight:700;letter-spacing:-.01em;color:var(--text-primary);font-variant-numeric:tabular-nums}',
      '.stat-avg small{font-size:11px;font-weight:500;color:var(--text-muted);margin-left:4px}',
      '.stat-bar{height:8px;border-radius:999px;background:color-mix(in srgb,var(--text-muted) 14%,transparent);overflow:hidden}',
      '.stat-bar-fill{height:100%;border-radius:999px;transition:width .3s}',
      '.stat-range{display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-muted);margin-top:5px;font-variant-numeric:tabular-nums}',
      '@media(max-width:1024px){.chart-card,.chart-card.hero,.chart-card.side{grid-column:span 12}}',
      '.data-table-section{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:24px;box-shadow:var(--shadow)}',
      '.data-table-section h3{font-size:14px;font-weight:600;margin-bottom:12px}',
      '.dt-controls{display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap}',
      '.dt-search{padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text-primary);font-size:12px;min-width:200px;outline:none}',
      '.dt-search:focus{border-color:var(--accent)}',
      '.dt-info{margin-left:auto;font-size:11px;color:var(--text-muted)}',
      '.dt-wrap{overflow-x:auto}',
      '.dt-table{width:100%;border-collapse:collapse;font-size:12px}',
      '.dt-table th{text-align:left;padding:9px 12px;border-bottom:1px solid var(--border);font-weight:600;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--text-muted);cursor:pointer;user-select:none;white-space:nowrap;background:color-mix(in srgb,var(--text-muted) 5%,transparent)}',
      '.dt-table th:hover{color:var(--accent)}',
      '.dt-table th .sort-icon{margin-left:4px;opacity:.4}',
      '.dt-table th.sorted .sort-icon{opacity:1;color:var(--accent)}',
      '.dt-table td{padding:8px 12px;border-bottom:1px solid color-mix(in srgb,var(--border) 55%,transparent)}',
      '.dt-table td.num{text-align:right}',
      '.dt-table th.num{text-align:right}',
      '.dt-table tbody tr:nth-child(even) td{background:color-mix(in srgb,var(--text-muted) 3%,transparent)}',
      '.dt-table tr:hover td{background:color-mix(in srgb,var(--accent) 5%,transparent)}',
      '.dt-table tfoot td{font-weight:700;border-top:2px solid var(--border);background:color-mix(in srgb,var(--accent) 6%,transparent)}',
      '.dt-col-filter{padding-top:4px}',
      '.dt-col-filter select{font-size:10px;padding:2px 4px;border:1px solid var(--border);border-radius:3px;background:var(--bg);color:var(--text-primary);width:100%;max-width:160px}',
      '.dt-pagination{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px}',
      '.dt-pagination button{padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text-secondary);font-size:12px;cursor:pointer}',
      '.dt-pagination button.active{background:var(--accent);color:#fff;border-color:var(--accent)}',
      '.dt-pagination button:disabled{opacity:.4;cursor:default}',
      // Theme picker modal
      '.theme-modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:9999;display:none;align-items:center;justify-content:center}',
      '.theme-modal-overlay.open{display:flex}',
      '.theme-modal{background:var(--card-bg);border-radius:16px;padding:24px;max-width:640px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)}',
      '.theme-modal{position:relative}',
      '.tm-close{position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;padding:0}',
      '.tm-close:hover{background:var(--accent);color:#fff;border-color:var(--accent)}',
      '.theme-modal h2{font-size:18px;font-weight:700;margin-bottom:4px}',
      '.theme-modal .sub{font-size:12px;color:var(--text-secondary);margin-bottom:16px}',
      '.theme-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:10px}',
      '.theme-swatch{border-radius:10px;cursor:pointer;border:3px solid transparent;overflow:hidden;transition:all .15s;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}',
      '.theme-swatch:hover{transform:scale(1.05)}',
      '.theme-swatch.selected{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent)}',
      '.theme-swatch .dot{width:50%;height:50%;border-radius:50%}',
      '.theme-swatch .sname{position:absolute;bottom:3px;font-size:8px;font-weight:500;text-align:center;width:100%}',
      '.theme-modal .tm-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}',
      '.theme-modal .tm-btn{padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none}',
      '.tm-btn-cancel{background:var(--bg);color:var(--text-secondary);border:1px solid var(--border)!important}',
      '.tm-btn-apply{background:var(--accent);color:#fff}',
      '.theme-tabs{display:flex;gap:8px;margin-bottom:12px}',
      '.theme-tab{padding:4px 12px;border-radius:6px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary)}',
      '.theme-tab.active{background:var(--accent);color:#fff;border-color:var(--accent)}',
      '@media(max-width:768px){.dash-container{padding:16px}.kpi-row{grid-template-columns:1fr 1fr}.chart-grid{grid-template-columns:1fr}.kpi-value{font-size:22px}}',
      '@media print{.filter-bar,.dt-controls,.dt-pagination,.theme-modal-overlay,.topbar-right{display:none!important}.topbar{position:static}.chart-card,.kpi-card,.data-table-section{break-inside:avoid;box-shadow:none;border:1px solid #e2e8f0}}'
    ].join('\n');
  }

  function generateKpiIcon(name) {
    var n = (name || '').toLowerCase();
    if (/revenue|รายได้|ยอดขาย|sales|มูลค่า/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>';
    if (/cost|ต้นทุน|ค่าใช้จ่าย|expense|งบ/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17l10-10 4 4L22 5"/><path d="M15 5h7v7"/></svg>';
    if (/profit|กำไร|margin/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
    if (/oee|efficiency|ประสิทธิภาพ|extraction|recovery/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
    if (/rate|อัตรา|%|percent|ccs|brix|pol|purity/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><line x1="4" y1="20" x2="20" y2="4"/></svg>';
    if (/ton|ตัน|อ้อย|น้ำตาล|bagasse|ผลผลิต|ผลิต/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>';
    if (/power|mw|ไฟฟ้า|พลังงาน|steam|ไอน้ำ/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    if (/temp|อุณหภูมิ|°|celsius/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>';
    if (/hour|ชั่วโมง|time|เวลา|downtime/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    if (/count|จำนวน|quantity|total|ผลรวม|รวม|พนักงาน|คน/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
    if (/area|พื้นที่|ไร่|rai/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l4-4 3 3 5-5 6 6"/></svg>';
    if (/water|น้ำ|ฝน|ชลประทาน|moisture/.test(n)) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>';
  }

  function fmtNum(v) {
    if (v == null || isNaN(v)) return '-';
    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    if (v % 1 !== 0) return v.toFixed(2);
    return v.toLocaleString();
  }

  /**
   * Statistical identifier screen (dashboard-architect rule: ตัวเลขที่ไม่มี
   * ความหมายแย่กว่าไม่มี dashboard). The name-regex screens miss columns like
   * "F_ID" and "farmmer_id" — underscore is a word character, so \bid\b never
   * fires inside them — and summing those produced KPI garbage like
   * "F_ID 20.18B", which is why unmatched files used to be refused outright.
   * This screen doesn't trust the name at all: a numeric column whose values
   * are (a) almost all integers and (b) almost all distinct is a label for
   * rows, not a measure of anything, whatever it is called.
   */
  // Document series named in full carry no id-word for the name pattern to
  // catch — "Purchase Requisition", "Purchase order", "ເລກແປງ" (plot number).
  // Adding distribution and relationship charts made this urgent: before, an
  // undetected identifier was merely summed into a wrong total; now it can be
  // handed a histogram or a scatter axis, which states a relationship between
  // two filing systems as though it were a finding.
  var DOC_NAME_RE = /requisition|purchase\s*order|\bpo\b|\bpr\b|invoice|receipt|voucher|ໃບ|ເລກ|ໝາຍເລກ|ใบสั่ง|ใบขอ|ใบแจ้ง|ใบเสร็จ|เลขที่|หมายเลข/i;

  function detectIdLikeCols(dataset, numCols) {
    var data = dataset.data || [];
    var sample = data.length > 800 ? data.slice(0, 800) : data;
    var out = [];
    numCols.forEach(function (col) {
      if (DOC_NAME_RE.test(String(col))) { out.push(col); return; }
      var seen = {}, vals = [], ints = 0, n = 0;
      sample.forEach(function (row) {
        var v = Number(row[col]);
        if (isNaN(v)) return;
        n++;
        if (v === Math.floor(v)) ints++;
        var k = String(v);
        if (!seen[k]) { seen[k] = 1; vals.push(v); }
      });
      if (n < 8 || ints / n < 0.98) return;
      // A whole issuing series sits in a narrow band at a huge magnitude,
      // where a real measure spans orders of magnitude. This catches document
      // numbers that repeat across line items, so the near-unique test below
      // never fires on them.
      if (vals.length >= 8) {
        var sortedAll = vals.slice().sort(function (a, b) { return a - b; });
        var med = sortedAll[Math.floor(sortedAll.length / 2)];
        if (med >= 100000 &&
            (sortedAll[sortedAll.length - 1] - sortedAll[0]) / med < 0.05) {
          out.push(col); return;
        }
      }
      if (vals.length / n < 0.85) return;
      // Near-unique integers alone is NOT enough — kpi_engine learned that the
      // hard way (random-valued budget columns are near-unique too). The extra
      // tell of a real identifier is that its distinct values sit in a dense
      // run: sorted, the median gap between neighbours is tiny. Measures with
      // near-unique values scatter across a wide range instead.
      vals.sort(function (a, b) { return a - b; });
      var gaps = [];
      for (var i = 1; i < vals.length; i++) gaps.push(vals[i] - vals[i - 1]);
      if (!gaps.length) return;
      gaps.sort(function (a, b) { return a - b; });
      var medianGap = gaps[Math.floor(gaps.length / 2)];
      if (medianGap <= 2) out.push(col);
    });
    return out;
  }

  function generate(spec, meta, theme, dataset, opts) {
    var maxRows = (opts && opts.maxRows) || 5000;
    var title = resolveTitle(meta);
    var columns = getColNames(dataset);
    var classified = classifyColumns(dataset);
    // Strip identifier-shaped columns from the numeric set before ANY use —
    // chart plan, KPI cards, and the table footer sums all read numCols, and
    // an ID is meaningless in every one of those places (comma-formatting an
    // ID number in the table is wrong too, so text treatment suits it better).
    var idLikeCols = detectIdLikeCols(dataset, classified.numCols);
    if (idLikeCols.length) {
      classified.numCols = classified.numCols.filter(function (c) { return idLikeCols.indexOf(c) < 0; });
      classified.textCols = classified.textCols.concat(idLikeCols);
    }
    var themes = buildThemeLibrary();
    // opts.lightOnly: files the registry has never seen ship light-only (user
    // directive 2026-08-03). Filtering the library here — not just the initial
    // pick — is what makes "light only" true of the page rather than of its
    // first paint: the in-page theme picker cannot offer a dark skin either.
    // Curated dashboards are unaffected; their chosen theme, dark included, is
    // a design decision someone made for that specific dashboard.
    if (opts && opts.lightOnly) {
      var lightThemes = themes.filter(function (t) { return !t.dark; });
      if (lightThemes.length) themes = lightThemes;
    }

    // Match by id — accent hex is reused across many themes with different
    // backgrounds (e.g. ocean_blue / bg_royal_blue / dark_navy all use blue),
    // so matching by accent silently picks the wrong theme.
    var activeTheme = (theme && theme.id && themes.find(function(t) { return t.id === theme.id; })) || theme || themes[0];

    // ─── Curated blueprint (known-dataset registry hit): the blueprint IS
    // the layout — explicit column→widget bindings with the aggregation
    // that makes business sense for that specific file (count PR documents,
    // don't sum their numbers). Skips inference AND blank-shape routing.
    var blueprint = (opts && opts.blueprint) || null;

    var chartPlan, blankTemplate = null, kpiMax;
    if (blueprint) {
      chartPlan = (blueprint.chartPlan || []).slice(0, 8);
      kpiMax = blueprint.kpiMax || (blueprint.kpis || []).length || 4;
    } else {
      // Build the chart plan from real data
      chartPlan = buildChartPlan(classified, dataset);

      // The shape-based blank-template routing was removed with the old
      // template set; the chart plan now stands on the evidence alone until
      // the new template library lands.
      kpiMax = 6;
    }

    // Build filter options (text columns with 2-20 unique values)
    var filterCols = [];
    classified.textCols.forEach(function(tc) {
      if (/^(code|รหัส|id$)/i.test(tc)) return;
      var uniques = [];
      var seen = {};
      var dateVals = 0, checkedVals = 0;
      (dataset.data || []).forEach(function(row) {
        var v = row[tc];
        if (v == null || v === '') return;
        checkedVals++;
        if (isDateLikeVal(v)) dateVals++;
        if (!seen[v]) { seen[v] = true; uniques.push(String(v)); }
      });
      // Date-valued columns make useless slicers (exact-datetime equality
      // almost never matches anything the user means) — and their option
      // strings (Date .toString()) don't equal the ISO strings the rows
      // serialize to in ALL_DATA, so every pick returned 0 rows. Skip them.
      if (checkedVals > 0 && dateVals / checkedVals > 0.7) return;
      if (uniques.length >= 2 && uniques.length <= 30) {
        filterCols.push({ name: tc, values: uniques.sort() });
      }
    });

    // ─── Period + as-of chips (dashboard-architect §9.2: every page needs a
    // period label and a "ข้อมูล ณ" timestamp — a number without a time
    // context is a number that gets read in the wrong era). The period comes
    // from the data itself (min-max of the detected time column); the as-of
    // stamp is the generation moment, which for an upload-and-render flow is
    // exactly when the numbers were last true. Gregorian year on purpose —
    // th-TH locale would print 2569 and disagree with the data's own dates.
    var TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    function fmtThDate(d) { return d.getDate() + ' ' + TH_M[d.getMonth()] + ' ' + d.getFullYear(); }
    var periodChip = '';
    var timeColForPeriod = detectTimeCol(classified, dataset);
    if (timeColForPeriod) {
      var tMin = null, tMax = null;
      (dataset.data || []).forEach(function (row) {
        var d = new Date(row[timeColForPeriod]);
        if (isNaN(d.getTime())) return;
        if (!tMin || d < tMin) tMin = d;
        if (!tMax || d > tMax) tMax = d;
      });
      if (tMin && tMax) {
        periodChip = ' <span class="topbar-chip">ช่วงข้อมูล ' + fmtThDate(tMin) + ' – ' + fmtThDate(tMax) + '</span>';
      }
    }
    var asOfChip = ' <span class="topbar-chip">ข้อมูล ณ ' + fmtThDate(new Date()) + '</span>';
    // Honesty badge: an inferred layout must not pass itself off as a curated
    // one — the reader should know these bindings came from column-shape
    // analysis, not from a human who understood the file.
    var inferredChip = (!blueprint && !blankTemplate)
      ? ' <span class="topbar-chip">วิเคราะห์อัตโนมัติจากโครงสร้างข้อมูล</span>' : '';

    var html = [
      '<!DOCTYPE html>',
      '<html lang="th">',
      '<head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1.0">',
      '<title>' + escHtml(title) + ' — iDash</title>',
      // Offline build: no Google Fonts link — font-family stacks fall back to
      // system Thai/Latin fonts (Leelawadee UI / Segoe UI on Windows).
      '<style>' + generateCss() + '</style>',
      '</head>',
      '<body>',
      // App-style top navigation — brand mark, title, context chips, actions
      '<div class="topbar">',
      '<div class="topbar-brand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 20V12M12 20V4M19 20v-6"/></svg></div>',
      '<div class="topbar-titles">',
      '<h1 class="editable-title" contenteditable="true" spellcheck="false" data-placeholder="ชื่อ Dashboard">' + escHtml(title) + '</h1>',
      '<div class="topbar-sub">' + escHtml(meta.domainNameTH || '') + (blankTemplate ? ' <span class="topbar-chip">' + escHtml(blankTemplate.nameTH) + '</span>' : '') + ' <span>' + escHtml(meta.filename || '') + '</span>' + periodChip + asOfChip + inferredChip + '</div>',
      '</div>',
      '<div class="topbar-right">',
      '<span class="topbar-pill"><span id="totalRows">' + (dataset.data || []).length + '</span> แถว</span>',
      '<button class="topbar-btn" onclick="openThemeModal()">&#x1F3A8; ธีม</button>',
      '<button class="topbar-btn primary" onclick="window.print()">&#x1F5A8; พิมพ์</button>',
      '</div>',
      '</div>',
      '<div class="dash-container">',
      // Filter bar (slicers only — hidden entirely when no slicer columns)
      generateFilterBar(filterCols),
      // AI Autopilot exclusive: real narration panel (empty string when no
      // insightStory was computed — e.g. the free 8-module path never passes one)
      renderInsightPanel(meta.insightStory, activeTheme),
      // KPI row placeholder
      '<div class="kpi-row" id="kpiRow"></div>',
      // Chart grid placeholder
      '<div class="chart-grid" id="chartGrid"></div>',
      // Data table section
      '<div class="data-table-section"><h3 class="editable-title" contenteditable="true" spellcheck="false" data-placeholder="ชื่อตาราง">ข้อมูลรายละเอียด</h3>',
      '<div class="dt-controls"><input type="text" class="dt-search" id="tableSearch" placeholder="ค้นหา..." oninput="applyAllFilters()"><span class="dt-info" id="tableInfo"></span></div>',
      '<div class="dt-wrap"><table class="dt-table" id="dataTable">',
      '<thead><tr id="thRow"></tr><tr id="thFilterRow"></tr></thead>',
      '<tbody id="tableBody"></tbody>',
      '<tfoot><tr id="tableFoot"></tr></tfoot>',
      '</table></div>',
      '<div class="dt-pagination" id="tablePagination"></div>',
      '</div>',
      // Theme picker modal
      generateThemeModal(themes),
      '</div>',
      // Inline the locally-bundled ECharts when app.js has pre-fetched it
      // (window.__iDashEchartsSource) so the output is fully offline-capable;
      // fall back to the CDN tag only when the vendor file wasn't available.
      (typeof window !== 'undefined' && window.__iDashEchartsSource)
        ? '<script>\n' + window.__iDashEchartsSource.replace(/<\/script/gi, '<\\/script') + '\n</scr' + 'ipt>'
        : '<script src="' + ECHARTS_CDN + '"></' + 'script>',
      '<script>',
      generateMainScript(columns, classified, dataset.data || [], chartPlan, filterCols, activeTheme, themes, maxRows, kpiMax, blueprint),
      '</' + 'script>',
      '</body>',
      '</html>'
    ].join('\n');

    return {
      html: html,
      title: title,
      blankTemplateId: blankTemplate ? blankTemplate.id : null,
      blankTemplateName: blankTemplate ? blankTemplate.nameTH : null
    };
  }

  function generateFilterBar(filterCols) {
    if (filterCols.length === 0) {
      // Theme button moved to the topbar — an empty filter bar is just noise.
      // rowCount stays in the DOM (hidden) because applyAllFilters writes it.
      return '<span id="rowCount" hidden></span>';
    }
    var html = '<div class="filter-bar" id="filterBar">';
    filterCols.slice(0, 4).forEach(function(col) {
      html += '<label>' + escHtml(col.name) + '</label>';
      html += '<select class="global-filter" data-col="' + escHtml(col.name) + '" onchange="applyAllFilters()">';
      html += '<option value="">ทั้งหมด</option>';
      col.values.forEach(function(v) {
        html += '<option value="' + escHtml(v) + '">' + escHtml(v) + '</option>';
      });
      html += '</select>';
    });
    html += '<span class="row-count" id="rowCount"></span>';
    html += '</div>';
    return html;
  }

  // Consumes the insight engine's real shape:
  // { facts, narration: {executiveSummary, topInsights, recommendations, risks, source} }
  // Static, server-rendered at generation time — narration text is fixed, same
  // as the legacy infographic_renderer.js panel this mirrors.
  function renderInsightPanel(insightStory, activeTheme) {
    var n = insightStory && insightStory.narration;
    if (!n) return '';
    var textPrimary = activeTheme.textPrimary;
    var upColor = '#10b981';
    var downColor = '#ef4444';
    var midColor = '#f59e0b';
    var html = '';
    if (n.executiveSummary) {
      html += '<div class="insight-line" style="font-weight:600;color:' + textPrimary + '">' + escHtml(n.executiveSummary) + '</div>';
    }
    (n.topInsights || []).slice(0, 5).forEach(function (it) {
      var sevColor = it.severity === 'high' ? downColor : (it.severity === 'medium' ? midColor : activeTheme.accent);
      html += '<div class="insight-line"><span style="color:' + sevColor + ';margin-right:6px">●</span>' + escHtml(it.insight || '') + '</div>';
    });
    (n.recommendations || []).slice(0, 3).forEach(function (r) {
      html += '<div class="insight-line"><span style="color:' + upColor + ';margin-right:6px">▶</span><strong>' + escHtml(r.action || '') + '</strong>' + (r.why ? ' — ' + escHtml(r.why) : '') + '</div>';
    });
    (n.risks || []).slice(0, 2).forEach(function (r) {
      html += '<div class="insight-line"><span style="color:' + downColor + ';margin-right:6px">⚠</span>' + escHtml(r.risk || '') + '</div>';
    });
    if (!html) return '';
    var badge = n.source === 'llm' ? 'AI Narration ✓' : 'คำนวณจากข้อมูลจริง 100%';
    var badgeBg = n.source === 'llm' ? 'rgba(37,99,235,.12)' : 'rgba(16,185,129,.12)';
    var badgeColor = n.source === 'llm' ? activeTheme.accent : upColor;
    return '<div class="chart-card full-width" style="margin-bottom:20px">' +
      '<div class="chart-card-title" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<span>ข้อค้นพบและข้อเสนอแนะจากข้อมูล</span>' +
      '<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:' + badgeBg + ';color:' + badgeColor + '">' + badge + '</span>' +
      '</div>' + html + '</div>';
  }

  function generateThemeModal(themes) {
    var html = '<div class="theme-modal-overlay" id="themeModalOverlay" onclick="if(event.target===this)closeThemeModal()">';
    html += '<div class="theme-modal">';
    html += '<button class="tm-close" onclick="closeThemeModal()" title="ปิด">&times;</button>';
    html += '<h2>เลือกธีม Dashboard</h2>';
    html += '<p class="sub">เลือกธีมที่ต้องการ — กราฟ ตาราง และพื้นหลังจะเปลี่ยนทันที · ดับเบิ้ลคลิกเพื่อใช้ทันที</p>';
    html += '<div class="theme-tabs">';
    html += '<div class="theme-tab active" onclick="filterThemes(\'all\',this)">ทั้งหมด (' + themes.length + ')</div>';
    var lightCount = themes.filter(function(t){return !t.dark}).length;
    var darkCount = themes.filter(function(t){return t.dark}).length;
    html += '<div class="theme-tab" onclick="filterThemes(\'light\',this)">Light (' + lightCount + ')</div>';
    // A "Dark (0)" tab that filters to an empty grid reads as a broken filter
    // rather than a deliberate restriction, so it is omitted entirely when the
    // page ships light-only.
    if (darkCount > 0) {
      html += '<div class="theme-tab" onclick="filterThemes(\'dark\',this)">Dark (' + darkCount + ')</div>';
    }
    html += '</div>';
    html += '<div class="theme-grid" id="themeGrid">';
    themes.forEach(function(t) {
      html += '<div class="theme-swatch" data-theme-id="' + t.id + '" data-dark="' + (t.dark ? '1' : '0') + '" onclick="selectTheme(\'' + t.id + '\')" ondblclick="selectTheme(\'' + t.id + '\');applySelectedTheme()" style="background:' + t.bg + '">';
      html += '<div class="dot" style="background:' + t.accent + '"></div>';
      html += '<span class="sname" style="color:' + t.textSecondary + '">' + escHtml(t.name.length > 10 ? t.name.substring(0, 9) + '…' : t.name) + '</span>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="tm-footer">';
    html += '<button class="tm-btn tm-btn-cancel" onclick="closeThemeModal()">ยกเลิก</button>';
    html += '<button class="tm-btn tm-btn-apply" onclick="applySelectedTheme()">ใช้ธีมนี้</button>';
    html += '</div></div></div>';
    return html;
  }

  function isRateCol(name) {
    return /_%|เฉลี่ย|average|rate|ratio|percent|efficiency|oee|ccs|brix|pol|purity|rpm|recovery|อุณหภูมิ|temperature|\btemp\b|pressure|ความดัน|\bph\b|_ph|ph_|\bbod\b|\bcod\b|\btss\b|\bppm\b|mg_l|mg\/l/i.test(name);
  }
  function isPercentCol(name) {
    return /_%|percent|เปอร์เซ็นต์/i.test(name);
  }

  function isBudgetCol(name) {
    return /งบ|budget/i.test(name);
  }
  function isActualCol(name) {
    return /จริง|actual|จ่ายจริง|ค่าใช้จ่ายจริง/i.test(name);
  }
  // A column that states what a paired measure is SUPPOSED to be. Finding one
  // is what lets a bullet chart exist at all: dashboard-architect §3.21 —
  // without a target there is nothing to compare against, and inventing one
  // would be fabricating a business decision we were never given.
  function isTargetCol(name) {
    return /เป้า|target|goal|แผน\b|plan\b|มาตรฐาน|spec|เกณฑ์|kpi_target/i.test(name);
  }

  /* ── Statistics behind the chart gates ─────────────────────────────────
   * Every chart type below has to earn its place on real evidence — a
   * distribution needs enough rows to have a shape, a scatter needs a
   * correlation worth showing, a heatmap needs a grid that is actually dense.
   * Charts that cannot pass their gate are simply never planned, which is why
   * two different files produce two different dashboards.
   */

  function numericValues(data, col) {
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var v = Number(data[i][col]);
      if (!isNaN(v) && data[i][col] !== null && data[i][col] !== '') out.push(v);
    }
    return out;
  }

  /** Pearson r over paired rows. Null when there is nothing to correlate. */
  function correlation(data, a, b) {
    var xs = [], ys = [];
    for (var i = 0; i < data.length; i++) {
      var x = Number(data[i][a]), y = Number(data[i][b]);
      if (isNaN(x) || isNaN(y) || data[i][a] === '' || data[i][b] === '') continue;
      if (data[i][a] === null || data[i][b] === null) continue;
      xs.push(x); ys.push(y);
    }
    var n = xs.length;
    if (n < 15) return null;
    var sx = 0, sy = 0;
    for (var j = 0; j < n; j++) { sx += xs[j]; sy += ys[j]; }
    var mx = sx / n, my = sy / n, num = 0, dx = 0, dy = 0;
    for (var k = 0; k < n; k++) {
      var a1 = xs[k] - mx, b1 = ys[k] - my;
      num += a1 * b1; dx += a1 * a1; dy += b1 * b1;
    }
    if (dx === 0 || dy === 0) return null;
    return { r: num / Math.sqrt(dx * dy), n: n };
  }

  /** Distinct non-empty values of a column, capped so a scan can't run long. */
  function distinctValues(data, col, cap) {
    var seen = {}, out = [];
    for (var i = 0; i < data.length && out.length <= (cap || 60); i++) {
      var v = data[i][col];
      if (v === null || v === undefined || v === '') continue;
      v = String(v);
      if (!seen[v]) { seen[v] = true; out.push(v); }
    }
    return out;
  }

  /**
   * Does this measure vary enough to be worth a distribution chart? A column
   * where every row is the same number has no shape to show — the histogram
   * would be one tall bar, which says less than a KPI card already does.
   */
  function hasSpread(vals) {
    if (vals.length < 30) return false;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (max === min) return false;
    var uniq = {}, n = 0;
    for (var i = 0; i < vals.length && n <= 12; i++) {
      if (!uniq[vals[i]]) { uniq[vals[i]] = 1; n++; }
    }
    return n >= 8; // fewer distinct values than bins = it is a category, not a measure
  }

  /** Share of the total held by the top few — the case Pareto is built for. */
  function concentration(data, catCol, numCol) {
    var sums = {}, order = [];
    for (var i = 0; i < data.length; i++) {
      var label = data[i][catCol];
      if (label === null || label === undefined || label === '') continue;
      label = String(label);
      var v = numCol ? Number(data[i][numCol]) : 1;
      if (isNaN(v)) v = 0;
      if (sums[label] === undefined) { sums[label] = 0; order.push(label); }
      sums[label] += v;
    }
    if (order.length < 4) return null;
    var vals = order.map(function (l) { return sums[l]; }).sort(function (a, b) { return b - a; });
    var total = vals.reduce(function (s, v) { return s + v; }, 0);
    if (total <= 0) return null;
    var topN = Math.max(1, Math.ceil(vals.length * 0.2));
    var top = vals.slice(0, topN).reduce(function (s, v) { return s + v; }, 0);
    return { share: top / total, groups: order.length, hasNegative: vals[vals.length - 1] < 0 };
  }

  function detectTimeCol(classified, dataset) {
    var data = dataset.data || [];
    if (data.length < 5) return null;
    var candidates = classified.textCols.concat(classified.numCols);
    for (var i = 0; i < candidates.length; i++) {
      var col = candidates[i];
      if (/วันที่|date|เดือน|month|ไตรมาส|quarter|ปี|year/i.test(col)) {
        var vals = data.slice(0, 20).map(function(r) { return r[col]; }).filter(function(v) { return v != null && v !== ''; });
        if (vals.length >= 5) return col;
      }
    }
    return null;
  }

  function buildChartPlan(classified, dataset) {
    var plan = [];
    // _id\b / \bid_ cover snake_case names (F_ID, farmmer_id) that \bid\b
    // misses because underscore is a word character.
    var idPattern = /รหัส|code|\bid\b|_id\b|\bid_|cct|gl$|เลขที่|ทะเบียน|revision|รุ่น|version/i;
    var goodNums = classified.numCols.filter(function(c) { return !idPattern.test(c); });
    if (goodNums.length === 0) return plan;

    var data = dataset.data || [];
    var timeCol = detectTimeCol(classified, dataset);
    var primaryNum = goodNums[0];

    // Exclude the time column from numeric cols (Excel serial dates shouldn't be summed/charted)
    if (timeCol && goodNums.indexOf(timeCol) >= 0) {
      goodNums = goodNums.filter(function(c) { return c !== timeCol; });
      if (goodNums.length === 0) return plan;
      primaryNum = goodNums[0];
    }

    // Separate rate cols from summable cols
    var rateCols = goodNums.filter(isRateCol);
    var sumCols = goodNums.filter(function(c) { return !isRateCol(c); });

    // ─── 1. TIME-SERIES TREND (line chart) ───
    if (timeCol && sumCols.length > 0 && data.length >= 6) {
      var trendCols = sumCols.slice(0, 3);
      plan.push({ role: 'trend', type: 'line', timeCol: timeCol, numCols: trendCols, title: 'แนวโน้ม — ' + trendCols.join(', '), fullWidth: trendCols.length > 1 });
    }

    // ─── 2. BUDGET VS ACTUAL (grouped bar) ───
    var budgetCol = goodNums.find(isBudgetCol);
    var actualCol = goodNums.find(isActualCol);
    if (budgetCol && actualCol && timeCol) {
      plan.push({ role: 'budget', type: 'groupedBar', timeCol: timeCol, numCols: [budgetCol, actualCol], title: 'งบประมาณ vs จริง' });
    }

    // ─── 3. GAUGE for key rate/efficiency metrics ───
    if (rateCols.length > 0) {
      var gaugeCols = rateCols.slice(0, 3);
      plan.push({ role: 'gauges', type: 'gauge', numCols: gaugeCols, title: 'ประสิทธิภาพ (ค่าเฉลี่ย · ช่วงต่ำสุด–สูงสุด)' });
    }

    // ─── 4. COMPOSITION (donut) for first text column with 2-8 categories ───
    var usedTextCols = {};
    classified.textCols.forEach(function(textCol) {
      if (plan.length >= 16) return;
      if (idPattern.test(textCol)) return;
      if (textCol === timeCol) return;
      var uniques = {};
      var order = [];
      data.forEach(function(row) {
        var label = row[textCol];
        if (label == null || label === '') return;
        label = String(label);
        if (!uniques[label]) { uniques[label] = true; order.push(label); }
      });
      if (order.length < 2 || order.length > 20) return;
      if (usedTextCols[textCol]) return;
      usedTextCols[textCol] = true;

      var numForChart = sumCols.length > 0 ? sumCols[0] : goodNums[0];
      // Donut only for 2-3 parts (dashboard-architect §9.8: part-to-whole with
      // ≥4 categories reads better as a ranked bar — humans can't compare 4+
      // arc sizes, and the bar branch already sorts descending with อื่นๆ).
      if (!plan.some(function(p) { return p.type === 'donut'; }) && order.length <= 3) {
        plan.push({ role: 'composition', type: 'donut', textCol: textCol, numCol: numForChart, title: 'สัดส่วน — ' + textCol });
      } else {
        plan.push({ role: 'breakdown', type: 'bar', textCol: textCol, numCol: numForChart, title: 'อันดับ — ' + textCol + ' (เรียงมากไปน้อย)' });
      }
    });

    // ─── 5. ADDITIONAL BAR using second numeric column ───
    if (sumCols.length > 1 && plan.length < 16) {
      var secondNum = sumCols[1];
      classified.textCols.forEach(function(tc) {
        if (plan.length >= 16) return;
        if (idPattern.test(tc) || tc === timeCol) return;
        var exists = plan.some(function(p) { return p.textCol === tc && p.numCol === secondNum; });
        if (exists) return;
        var uniques = {};
        var cnt = 0;
        data.forEach(function(row) {
          var v = row[tc];
          if (v != null && !uniques[v]) { uniques[v] = true; cnt++; }
        });
        if (cnt >= 2 && cnt <= 15) {
          plan.push({ role: 'breakdown', type: 'bar', textCol: tc, numCol: secondNum, title: 'เปรียบเทียบ — ' + secondNum + ' ตาม ' + tc });
        }
      });
    }

    // ─── 6. RATE TREND (secondary line for % over time) ───
    if (timeCol && rateCols.length > 0 && plan.length < 16) {
      var rateTrend = rateCols.slice(0, 2);
      plan.push({ role: 'rateTrend', type: 'line', timeCol: timeCol, numCols: rateTrend, title: 'แนวโน้มอัตรา — ' + rateTrend.join(', '), agg: 'avg' });
    }

    /* ─── 7-14. The analytical questions the old plan could not ask ────────
     * Everything above answers only "how much" and "how did it change".
     * dashboard-architect's chart matrix lists six more question types, and
     * its audit of 45 real dashboards found NONE of them used even where the
     * data called for it — distribution, relationship, and 2-D density were
     * 0/45. Each block below adds one of those questions, and each is gated on
     * evidence the data must actually contain, so a file that cannot support
     * a chart never gets it. This is where the variety between two different
     * uploads comes from.
     */

    // Categories for the analytical charts below. Date columns are classified
    // as text (they are not summable), but a date is an axis, not a category —
    // a Pareto of "Changed On" ranks calendar days as if they were causes. Only
    // the chosen time column was excluded before, so a file with a second date
    // column leaked it in here.
    var cats = classified.textCols.filter(function (c) {
      if (idPattern.test(c) || c === timeCol) return false;
      var checked = 0, dateish = 0;
      for (var i = 0; i < data.length && checked < 60; i++) {
        var v = data[i][c];
        if (v === null || v === undefined || v === '') continue;
        checked++;
        if (isDateLikeVal(v)) dateish++;
      }
      return !(checked >= 5 && dateish / checked > 0.6);
    });

    // 7. BULLET — actual vs target. The only honest way to show a target is to
    //    find one in the file (§3.21); we never invent the number.
    if (plan.length < 16) {
      var targetCol = goodNums.find(isTargetCol);
      if (targetCol) {
        var actualForTarget = goodNums.find(function (c) {
          return c !== targetCol && !isTargetCol(c) && (isRateCol(c) === isRateCol(targetCol));
        }) || goodNums.find(function (c) { return c !== targetCol && !isTargetCol(c); });
        if (actualForTarget && cats.length) {
          plan.push({
            role: 'target', type: 'bullet', textCol: cats[0],
            numCol: actualForTarget, targetCol: targetCol,
            title: 'เทียบเป้า — ' + actualForTarget + ' vs ' + targetCol
          });
        }
      }
    }

    // 8. PARETO — "which few things cause most of it". Only when the data is
    //    genuinely concentrated; on an even spread the cumulative line is a
    //    straight diagonal that tells the reader nothing.
    if (plan.length < 16 && cats.length && sumCols.length) {
      for (var ci = 0; ci < cats.length; ci++) {
        var conc = concentration(data, cats[ci], sumCols[0]);
        if (conc && !conc.hasNegative && conc.share >= 0.6 && conc.groups >= 5) {
          plan.push({
            role: 'pareto', type: 'pareto', textCol: cats[ci], numCol: sumCols[0],
            title: 'Pareto — ' + cats[ci] + ' (ไม่กี่รายการคิดเป็นส่วนใหญ่)'
          });
          break;
        }
      }
    }

    // 9. HISTOGRAM — the single biggest documented gap (§3.18, 0/45 dashboards
    //    showed a distribution). A mean hides every outlier behind it.
    if (plan.length < 16) {
      for (var hi = 0; hi < goodNums.length; hi++) {
        var hv = numericValues(data, goodNums[hi]);
        if (hasSpread(hv)) {
          plan.push({
            role: 'distribution', type: 'histogram', numCol: goodNums[hi],
            title: 'การกระจายตัว — ' + goodNums[hi] + ' (n=' + hv.length + ')'
          });
          break;
        }
      }
    }

    // 10. SCATTER — relationship between two measures, with r reported so the
    //     reader can judge it (§3.9 bans dual-axis lines used for this).
    if (plan.length < 16 && goodNums.length >= 2) {
      var bestPair = null;
      for (var a = 0; a < goodNums.length && !bestPair; a++) {
        for (var b = a + 1; b < goodNums.length; b++) {
          var cr = correlation(data, goodNums[a], goodNums[b]);
          if (cr && Math.abs(cr.r) >= 0.45 && Math.abs(cr.r) < 0.999) {
            bestPair = { x: goodNums[a], y: goodNums[b], r: cr.r, n: cr.n };
            break;
          }
        }
      }
      if (bestPair) {
        plan.push({
          role: 'relationship', type: 'scatter', xCol: bestPair.x, yCol: bestPair.y,
          r: Math.round(bestPair.r * 100) / 100, n: bestPair.n,
          title: 'ความสัมพันธ์ — ' + bestPair.x + ' กับ ' + bestPair.y +
                 ' (r=' + (Math.round(bestPair.r * 100) / 100) + ', n=' + bestPair.n + ')'
        });
      }
    }

    // 11. BOX PLOT — is one group merely lower, or also less stable? A bar of
    //     group averages cannot answer that (§3.19).
    if (plan.length < 16 && sumCols.length && cats.length) {
      for (var bi = 0; bi < cats.length; bi++) {
        var groups = distinctValues(data, cats[bi], 13);
        if (groups.length >= 3 && groups.length <= 8 && data.length >= 40) {
          plan.push({
            role: 'spread', type: 'boxplot', textCol: cats[bi], numCol: sumCols[0],
            title: 'ความสม่ำเสมอ — ' + sumCols[0] + ' แยกตาม ' + cats[bi]
          });
          break;
        }
      }
    }

    // 12. STACKED BAR — composition over time, capped at 4 layers (§3.4).
    if (plan.length < 16 && timeCol && sumCols.length && cats.length) {
      for (var si = 0; si < cats.length; si++) {
        var parts = distinctValues(data, cats[si], 6);
        if (parts.length >= 2 && parts.length <= 4) {
          // A donut on the same category is NOT a duplicate: it shows today's
          // split, this shows whether that split is moving. Only another
          // time-composition chart would be saying the same thing twice.
          var already = plan.some(function (p) { return p.type === 'stackedBar'; });
          if (!already) {
            plan.push({
              role: 'compositionTime', type: 'stackedBar', timeCol: timeCol,
              textCol: cats[si], numCol: sumCols[0], parts: parts,
              title: 'องค์ประกอบตามเวลา — ' + sumCols[0] + ' แยกตาม ' + cats[si]
            });
            break;
          }
        }
      }
    }

    // 13. HEATMAP — where two dimensions intersect; a grouped bar of the same
    //     grid would be dozens of bars nobody can read (§3.11).
    if (plan.length < 16 && cats.length >= 2 && sumCols.length) {
      var rowsCat = null, colsCat = null;
      for (var r1 = 0; r1 < cats.length && !rowsCat; r1++) {
        var rv = distinctValues(data, cats[r1], 26);
        if (rv.length < 3 || rv.length > 20) continue;
        for (var c1 = 0; c1 < cats.length; c1++) {
          if (cats[c1] === cats[r1]) continue;
          var cv = distinctValues(data, cats[c1], 16);
          if (cv.length >= 3 && cv.length <= 12) { rowsCat = cats[r1]; colsCat = cats[c1]; break; }
        }
      }
      if (rowsCat && colsCat) {
        plan.push({
          role: 'density', type: 'heatmap', rowCol: rowsCat, colCol: colsCat,
          numCol: sumCols[0], title: 'ความหนาแน่น — ' + rowsCat + ' × ' + colsCat
        });
      }
    }

    // 14. TREEMAP — part-to-whole with too many parts for any other form
    //     (§3.12). Below 13 parts the ranked bar above already reads better.
    if (plan.length < 16 && cats.length && sumCols.length) {
      for (var ti = 0; ti < cats.length; ti++) {
        var tv = distinctValues(data, cats[ti], 60);
        if (tv.length > 12 && tv.length <= 60) {
          var conc2 = concentration(data, cats[ti], sumCols[0]);
          if (conc2 && !conc2.hasNegative) {
            plan.push({
              role: 'manyParts', type: 'treemap', textCol: cats[ti], numCol: sumCols[0],
              title: 'สัดส่วนทั้งหมด — ' + cats[ti] + ' (' + tv.length + ' รายการ)'
            });
            break;
          }
        }
      }
    }

    return diversifyPlan(plan);
  }

  /**
   * Pick the final 8 cards by QUESTION TYPE rather than by discovery order.
   *
   * The rules above are greedy: the breakdown rule alone will happily emit a
   * ranked bar for every category × every measure. On a file with 3 categories
   * and 2 measures that filled the whole page with near-identical bars, and
   * every analytical chart behind it — distribution, relationship, density —
   * was crowded out before it could be considered. The page was full and said
   * one thing.
   *
   * dashboard-architect §12: "ใส่ KPI ให้ครบทุกตัวที่วัดได้ → เมื่อทุกอย่าง
   * สำคัญ = ไม่มีอะไรสำคัญ". Variety on the page is variety of QUESTION, not
   * more answers to the question already asked. So each role gets a quota, and
   * the order below is the reading order the layout expects: the hero
   * time-series first, then composition, then the diagnostic charts.
   */
  var ROLE_ORDER = [
    'trend', 'budget', 'composition', 'breakdown', 'gauges', 'target',
    'pareto', 'compositionTime', 'relationship', 'distribution', 'spread',
    'density', 'manyParts', 'rateTrend'
  ];
  // Two ranked bars can genuinely earn their place (different measures); a
  // third is repetition. Everything else says its piece once.
  var ROLE_QUOTA = { breakdown: 2 };

  function diversifyPlan(candidates) {
    var picked = [], used = {};
    for (var i = 0; i < ROLE_ORDER.length && picked.length < 8; i++) {
      var role = ROLE_ORDER[i];
      var quota = ROLE_QUOTA[role] || 1;
      for (var j = 0; j < candidates.length && picked.length < 8; j++) {
        if (candidates[j].role !== role) continue;
        if ((used[role] || 0) >= quota) break;
        used[role] = (used[role] || 0) + 1;
        picked.push(candidates[j]);
      }
    }
    // A role the order above doesn't know about would silently vanish, so
    // anything unlisted still gets whatever room is left.
    for (var k = 0; k < candidates.length && picked.length < 8; k++) {
      if (picked.indexOf(candidates[k]) < 0 && ROLE_ORDER.indexOf(candidates[k].role) < 0) {
        picked.push(candidates[k]);
      }
    }
    return picked;
  }

  function generateMainScript(columns, classified, allData, chartPlan, filterCols, activeTheme, themes, maxRows, kpiMax, blueprint) {
    var lines = [];
    lines.push('var KPI_MAX = ' + (kpiMax || 6) + ';');
    lines.push('var COLUMNS = ' + JSON.stringify(columns) + ';');
    lines.push('var TEXT_COLS = ' + JSON.stringify(classified.textCols) + ';');
    lines.push('var NUM_COLS = ' + JSON.stringify(classified.numCols) + ';');
    // KPI sums/counts computed from the FULL dataset before the 5000-row
    // embed cap below, so totals stay correct even when the raw table has
    // to be truncated for HTML size (e.g. 8000-row attendance logs).
    var fullKpiStats = {};
    classified.numCols.forEach(function(col) {
      var sum = 0, cnt = 0;
      allData.forEach(function(row) {
        var v = Number(row[col]);
        if (!isNaN(v)) { sum += v; cnt++; }
      });
      fullKpiStats[col] = { sum: sum, cnt: cnt };
    });
    lines.push('var FULL_KPI_STATS = ' + JSON.stringify(fullKpiStats) + ';');
    // Curated KPI definitions from a known-dataset blueprint (null = infer).
    lines.push('var BLUEPRINT_KPIS = ' + JSON.stringify(blueprint && blueprint.kpis && blueprint.kpis.length ? blueprint.kpis : null) + ';');
    lines.push('var ALL_DATA = ' + JSON.stringify(allData.slice(0, maxRows)) + ';');
    lines.push('var CHART_PLAN = ' + JSON.stringify(chartPlan) + ';');
    lines.push('var THEMES = ' + JSON.stringify(themes) + ';');
    lines.push('var currentTheme = ' + JSON.stringify(activeTheme) + ';');
    lines.push('var pendingThemeId = currentTheme.id;');
    lines.push('var filteredData = ALL_DATA.slice();');
    lines.push('var PAGE_SIZE = 25;');
    lines.push('var currentPage = 0;');
    lines.push('var sortCol = -1;');
    lines.push('var sortAsc = true;');
    lines.push('var colFilters = {};');
    lines.push('var chartInstances = [];');
    lines.push('var CHART_TITLE_OVERRIDES = {};');
    lines.push('function escHtmlClient(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }');
    lines.push('');

    // Apply theme CSS vars
    lines.push('function applyThemeVars(t) {');
    lines.push('  var r = document.documentElement.style;');
    lines.push('  r.setProperty("--accent", t.accent);');
    lines.push('  r.setProperty("--bg", t.bg);');
    lines.push('  r.setProperty("--card-bg", t.cardBg);');
    lines.push('  r.setProperty("--border", t.border);');
    lines.push('  r.setProperty("--text-primary", t.textPrimary);');
    lines.push('  r.setProperty("--text-secondary", t.textSecondary);');
    lines.push('  r.setProperty("--text-muted", t.textMuted);');
    lines.push('  r.setProperty("--shadow", t.dark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 1px 8px rgba(0,0,0,0.06)");');
    lines.push('}');
    lines.push('');

    // Format number
    lines.push('function fmt(v) {');
    lines.push('  if (v==null||isNaN(v)) return "-";');
    lines.push('  if (Math.abs(v)>=1e9) return (v/1e9).toFixed(2)+"B";');
    lines.push('  if (Math.abs(v)>=1e6) return (v/1e6).toFixed(2)+"M";');
    lines.push('  if (Math.abs(v)>=1e3) return (v/1e3).toFixed(1)+"K";');
    lines.push('  if (v%1!==0) return v.toFixed(2);');
    lines.push('  return v.toLocaleString();');
    lines.push('}');
    lines.push('function fmtFull(v) { if(v==null||isNaN(v)) return "-"; return Number(v).toLocaleString(); }');
    // Human-readable date for table cells: raw ISO strings like
    // "2026-06-01T16:59:56.000Z" read as noise to a non-technical user —
    // show "1 มิ.ย. 2026" instead. Time-of-day is dropped: these values are
    // almost always a parsed date at local midnight (UTC offset artifact),
    // never a meaningful clock time in this app\'s datasets.
    lines.push('var TH_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];');
    lines.push('function fmtDateDisplay(v) {');
    lines.push('  if (v==null||v==="") return v;');
    lines.push('  var s = String(v);');
    lines.push('  var m = /^(\\d{4})-(\\d{2})-(\\d{2})(?:[T ]\\d{2}:\\d{2}:\\d{2})?/.exec(s);');
    lines.push('  if (!m) return v;');
    lines.push('  var yy = Number(m[1]), mo = Number(m[2]), dd = Number(m[3]);');
    lines.push('  if (mo < 1 || mo > 12) return v;');
    lines.push('  return dd + " " + TH_MONTHS_SHORT[mo-1] + " " + yy;');
    lines.push('}');
    lines.push('function fmtDate(v) {');
    lines.push('  if (v==null||v==="") return "";');
    lines.push('  var s = String(v);');
    lines.push('  if (/^\\d{4}-\\d{2}/.test(s)) return s.substring(0,10);');
    lines.push('  if (/^Q[1-4]$/.test(s)) return s;');
    lines.push('  var n = Number(v);');
    lines.push('  if (!isNaN(n) && n > 25000 && n < 60000) {');
    lines.push('    var d = new Date((n - 25569) * 86400000);');
    lines.push('    var mm = String(d.getUTCMonth()+1).padStart(2,"0");');
    lines.push('    var dd = String(d.getUTCDate()).padStart(2,"0");');
    lines.push('    return d.getUTCFullYear()+"-"+mm+"-"+dd;');
    lines.push('  }');
    lines.push('  return s;');
    lines.push('}');
    lines.push('');

    // Multi-hue KPI icon badge — keyword-matched category (TH+EN, incl.
    // sugar-factory domain terms), deterministic hash-of-name fallback for
    // unmatched names (P5: unique by evidence, not Math.random — same name
    // always gets the same color/icon, different names still differentiate
    // visually instead of collapsing onto one theme hue). Mirrors the
    // reference dashboards' per-KPI colored icon badges.
    lines.push('var KPI_ICON_PATHS = {');
    lines.push('  dollar: \'<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M9 9.2c0-1.3 1.2-2.3 3-2.3s3 .9 3 2.1c0 3-6 1.5-6 4.5 0 1.2 1.3 2.1 3 2.1s3-1 3-2.3"/>\',');
    lines.push('  trend: \'<polyline points="3 17 9 11 13 14 21 6"/><polyline points="15 6 21 6 21 12"/>\',');
    lines.push('  wallet: \'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18"/><circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none"/>\',');
    lines.push('  shield: \'<path d="M12 2.5l7.5 3.5v5.2c0 4.7-3.2 7.9-7.5 9.3-4.3-1.4-7.5-4.6-7.5-9.3V6z"/>\',');
    lines.push('  users: \'<circle cx="9" cy="8" r="3"/><path d="M2.5 20c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6"/><circle cx="17.5" cy="9" r="2.3"/><path d="M16.3 14.3c2.3.5 4 2.3 4.5 5.7"/>\',');
    lines.push('  clock: \'<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>\',');
    lines.push('  package: \'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>\',');
    lines.push('  box: \'<rect x="4" y="4" width="16" height="16" rx="2.5"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="10" y1="10" x2="10" y2="20"/>\',');
    lines.push('  chart: \'<path d="M4 20V11M11 20V5M18 20v-6M2 20h20"/>\',');
    lines.push('  bolt: \'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>\',');
    lines.push('  droplet: \'<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>\'');
    lines.push('};');
    lines.push('var KPI_STYLE_RULES = [');
    lines.push('  { re: /กำไร|profit|margin/i, hue: "#16a34a", icon: "trend" },');
    lines.push('  { re: /รายได้|ยอดขาย|revenue|sales|income|มูลค่า|turnover/i, hue: "#2563eb", icon: "dollar" },');
    lines.push('  { re: /ต้นทุน|ค่าใช้จ่าย|cost|expense|budget|งบประมาณ/i, hue: "#ea580c", icon: "wallet" },');
    lines.push('  { re: /oee|efficiency|ประสิทธิภาพ|extraction|recovery|อัตรา|rate|ratio|_%|เปอร์เซ็นต์|percentage|เกรด/i, hue: "#7c3aed", icon: "shield" },');
    lines.push('  { re: /ลูกค้า|customer|พนักงาน|employee|headcount|staff|ผู้รายงาน/i, hue: "#db2777", icon: "users" },');
    lines.push('  { re: /เวลา|time|downtime|delay|duration|shift|กะ|hour|ชั่วโมง/i, hue: "#d97706", icon: "clock" },');
    lines.push('  { re: /คลัง|สต็อก|inventory|stock|warehouse|shipment|ตัน|อ้อย|น้ำตาล|bagasse|ผลผลิต|ผลิต/i, hue: "#0891b2", icon: "package" },');
    lines.push('  { re: /จำนวน|count|รายการ|quantity|ชิ้น|units?\\b|total|ผลรวม|รวม|คน/i, hue: "#0ea5e9", icon: "box" },');
    lines.push('  { re: /power|mw|ไฟฟ้า|พลังงาน|steam|ไอน้ำ/i, hue: "#eab308", icon: "bolt" },');
    lines.push('  { re: /water|น้ำ|ฝน|ชลประทาน|moisture/i, hue: "#0284c7", icon: "droplet" }');
    lines.push('];');
    lines.push('var KPI_FALLBACK_PALETTE = [');
    lines.push('  { hue: "#2563eb", icon: "box" }, { hue: "#16a34a", icon: "trend" }, { hue: "#7c3aed", icon: "chart" },');
    lines.push('  { hue: "#ea580c", icon: "package" }, { hue: "#0891b2", icon: "box" }, { hue: "#db2777", icon: "users" },');
    lines.push('  { hue: "#d97706", icon: "clock" }, { hue: "#0ea5e9", icon: "chart" }');
    lines.push('];');
    lines.push('function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }');
    lines.push('function kpiVisualStyle(name) {');
    lines.push('  for (var i = 0; i < KPI_STYLE_RULES.length; i++) { if (KPI_STYLE_RULES[i].re.test(name)) return { hue: KPI_STYLE_RULES[i].hue, path: KPI_ICON_PATHS[KPI_STYLE_RULES[i].icon] }; }');
    lines.push('  var pick = KPI_FALLBACK_PALETTE[hashStr(name.trim() || "kpi") % KPI_FALLBACK_PALETTE.length];');
    lines.push('  return { hue: pick.hue, path: KPI_ICON_PATHS[pick.icon] };');
    lines.push('}');
    lines.push('function kpiIconBadge(name) {');
    lines.push('  var s = kpiVisualStyle(name);');
    lines.push('  return \'<div class="kpi-icon" style="background:color-mix(in srgb,\'+s.hue+\' 16%,transparent);color:\'+s.hue+\'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\'+s.path+\'</svg></div>\';');
    lines.push('}');
    lines.push('');
    lines.push('// Direction inferred from the KPI name (evidence-based, not a KB lookup —');
    lines.push('// this generator has no KPI-library binding). Cost/downtime/defect-shaped');
    lines.push('// names are "lower is better"; everything else defaults higher-is-better.');
    lines.push('var LOWER_BETTER_PATTERN = /cost|ต้นทุน|ค่าใช้จ่าย|downtime|หยุด|scrap|ของเสีย|reject|error|ผิดพลาด|delay|ล่าช้า|complaint|ร้องเรียน|ปัญหา|defect/i;');
    lines.push('function kpiTrendExtras(col, values) {');
    lines.push('  if (values.length < 4) return { delta: "", spark: "" };');
    lines.push('  var mid = Math.floor(values.length / 2);');
    lines.push('  var firstAvg = values.slice(0, mid).reduce(function(s,v){return s+v},0) / mid;');
    lines.push('  var secondAvg = values.slice(mid).reduce(function(s,v){return s+v},0) / (values.length - mid);');
    lines.push('  var delta = "";');
    lines.push('  if (firstAvg !== 0) {');
    lines.push('    var pct = ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100;');
    lines.push('    var rising = pct >= 0;');
    lines.push('    var goodDirection = LOWER_BETTER_PATTERN.test(col) ? !rising : rising;');
    lines.push('    var cls = goodDirection ? "up" : "down";');
    lines.push('    var arrow = rising ? "\\u2191" : "\\u2193";');
    // Baseline printed visibly, not tucked in a tooltip — a delta that
    // doesn't say what it's compared against reads as noise (§9.3).
    lines.push('    delta = \'<span class="kpi-delta-wrap"><span class="kpi-delta \'+cls+\'" title="เทียบค่าเฉลี่ยครึ่งหลังกับครึ่งแรกของข้อมูล">\'+arrow+\' \'+Math.abs(pct).toFixed(1)+\'%</span><span class="kpi-baseline">ครึ่งหลัง vs ครึ่งแรก</span></span>\';');
    lines.push('  }');
    lines.push('  var min = Math.min.apply(null, values), max = Math.max.apply(null, values);');
    lines.push('  var range = (max - min) || 1;');
    lines.push('  var pts = values.map(function(v,i){ var x=(i/(values.length-1))*100; var y=18-((v-min)/range)*16; return x.toFixed(1)+","+y.toFixed(1); }).join(" ");');
    lines.push('  var spark = \'<svg class="kpi-spark" viewBox="0 0 100 20" preserveAspectRatio="none"><polyline points="\'+pts+\'" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>\';');
    lines.push('  return { delta: delta, spark: spark };');
    lines.push('}');
    lines.push('');

    // ─── FILTER LOGIC ───
    lines.push('function applyAllFilters() {');
    lines.push('  var gfs = document.querySelectorAll(".global-filter");');
    lines.push('  var globalF = {};');
    lines.push('  gfs.forEach(function(s){ if(s.value) globalF[s.dataset.col] = s.value; });');
    lines.push('  var q = (document.getElementById("tableSearch").value||"").toLowerCase();');
    lines.push('  filteredData = ALL_DATA.filter(function(row) {');
    lines.push('    for (var col in globalF) { if (String(row[col]||"") !== globalF[col]) return false; }');
    lines.push('    for (var c in colFilters) { if (colFilters[c] && String(row[c]||"") !== colFilters[c]) return false; }');
    lines.push('    if (q) { var found = false; COLUMNS.forEach(function(cn){ if(String(row[cn]||"").toLowerCase().indexOf(q)>=0) found=true; }); if(!found) return false; }');
    lines.push('    return true;');
    lines.push('  });');
    lines.push('  currentPage = 0;');
    lines.push('  document.getElementById("totalRows").textContent = filteredData.length;');
    lines.push('  document.getElementById("rowCount").textContent = filteredData.length.toLocaleString() + " แถว";');
    lines.push('  renderKpis();');
    lines.push('  renderCharts();');
    lines.push('  renderTable();');
    lines.push('}');
    lines.push('');

    // ─── KPI RENDER (from filtered data) ───
    lines.push('var RATE_PATTERN = /_%|เฉลี่ย|average|rate|ratio|percent|efficiency|oee|ccs|brix|pol|purity|rpm|recovery|อุณหภูมิ|temperature|\\btemp\\b|pressure|ความดัน|\\bph\\b|_ph|ph_|\\bbod\\b|\\bcod\\b|\\btss\\b|\\bppm\\b|mg_l|mg\\/l/i;');
    lines.push('var PERCENT_PATTERN = /_%|percent|เปอร์เซ็นต์/i;');
    lines.push('function renderKpis() {');
    lines.push('  var el = document.getElementById("kpiRow");');
    // Blueprint branch: explicit curated KPIs with meaningful aggregation
    // (count/countDistinct for document-number columns, sum/avg for real
    // measures). Recomputes live from filteredData so slicers stay correct.
    lines.push('  if (BLUEPRINT_KPIS) {');
    lines.push('    var bkpis = BLUEPRINT_KPIS.map(function(bk) {');
    lines.push('      var vals = filteredData.map(function(r){ return r[bk.col]; }).filter(function(v){ return v!=null && v!==""; });');
    lines.push('      var value, series = [];');
    lines.push('      if (bk.agg === "countDistinct") { var seen={}, n=0; vals.forEach(function(v){ var k=String(v); if(!seen[k]){seen[k]=1;n++;} }); value = n; }');
    lines.push('      else if (bk.agg === "count") { value = vals.length; }');
    lines.push('      else {');
    lines.push('        var sum=0, cnt=0, nums=[];');
    lines.push('        vals.forEach(function(v){ var x=Number(v); if(!isNaN(x)){sum+=x;cnt++;nums.push(x);} });');
    lines.push('        value = bk.agg === "avg" && cnt>0 ? Math.round(sum/cnt*100)/100 : sum;');
    lines.push('        series = nums.length > 60 ? nums.filter(function(_,i){ return i % Math.ceil(nums.length/60) === 0; }) : nums;');
    lines.push('      }');
    lines.push('      return { name: bk.label || bk.col, value: value, suffix: bk.suffix || "", series: series };');
    lines.push('    });');
    lines.push('    el.innerHTML = bkpis.map(function(k) {');
    lines.push('      var display = k.suffix ? k.value.toFixed(1) + k.suffix : fmt(k.value);');
    lines.push('      var extras = kpiTrendExtras(k.name, k.series);');
    lines.push('      var footer = (extras.spark || extras.delta) ? \'<div class="kpi-footer">\'+extras.spark+extras.delta+\'</div>\' : "";');
    lines.push('      return \'<div class="kpi-card"><div class="kpi-card-header">\'+kpiIconBadge(k.name)+\'<span class="kpi-label">\'+escHtmlClient(k.name)+\'</span></div><div class="kpi-value">\'+display+\'</div>\'+footer+\'</div>\';');
    lines.push('    }).join("");');
    lines.push('    return;');
    lines.push('  }');
    lines.push('  if (NUM_COLS.length === 0) { el.innerHTML = ""; return; }');
    lines.push('  var idPattern = /รหัส|code|\\bid\\b|_id\\b|\\bid_|cct|gl$|^id$|เลขที่|ทะเบียน|วันที่|date|เดือน|month|ปี$|^year$|revision|รุ่น|version/i;');
    lines.push('  var kpiCols = NUM_COLS.filter(function(c){ return !idPattern.test(c); }).slice(0, KPI_MAX);');
    // Budget-style files name their real measures "เดือน 1..12" / "รวมทั้งปี",
    // which the date-ish exclusions above wipe out entirely — leaving an
    // empty KPI row. When the strict filter removes EVERYTHING, relax to
    // excluding only true identifier columns so the row always has content.
    lines.push('  if (kpiCols.length === 0) {');
    lines.push('    var hardIdPattern = /รหัส|code|\\bid\\b|_id\\b|\\bid_|cct|gl$|^id$|เลขที่|ทะเบียน|revision|รุ่น|version/i;');
    lines.push('    kpiCols = NUM_COLS.filter(function(c){ return !hardIdPattern.test(c); }).slice(0, KPI_MAX);');
    lines.push('  }');
    lines.push('  var noFilterActive = filteredData.length === ALL_DATA.length;');
    lines.push('  var kpis = kpiCols.map(function(col) {');
    lines.push('    var sum = 0, cnt = 0;');
    lines.push('    if (noFilterActive && FULL_KPI_STATS[col]) {');
    lines.push('      sum = FULL_KPI_STATS[col].sum; cnt = FULL_KPI_STATS[col].cnt;');
    lines.push('    } else {');
    lines.push('      filteredData.forEach(function(r) { var v = Number(r[col]); if(!isNaN(v)){sum += v; cnt++;} });');
    lines.push('    }');
    lines.push('    var isRate = RATE_PATTERN.test(col);');
    lines.push('    var val = isRate && cnt > 0 ? Math.round(sum/cnt*100)/100 : sum;');
    lines.push('    var suffix = isRate && PERCENT_PATTERN.test(col) ? "%" : "";');
    lines.push('    var raw = filteredData.map(function(r){ return Number(r[col]); }).filter(function(v){ return !isNaN(v); });');
    lines.push('    var sampled = raw.length > 60 ? raw.filter(function(_,i){ return i % Math.ceil(raw.length/60) === 0; }) : raw;');
    lines.push('    return { name: col, value: val, suffix: suffix, series: sampled };');
    lines.push('  });');
    lines.push('  el.innerHTML = kpis.map(function(k) {');
    lines.push('    var display = k.suffix ? k.value.toFixed(1) + k.suffix : fmt(k.value);');
    lines.push('    var extras = kpiTrendExtras(k.name, k.series);');
    lines.push('    var footer = (extras.spark || extras.delta) ? \'<div class="kpi-footer">\'+extras.spark+extras.delta+\'</div>\' : "";');
    lines.push('    return \'<div class="kpi-card"><div class="kpi-card-header">\'+kpiIconBadge(k.name)+\'<span class="kpi-label">\'+k.name+\'</span></div><div class="kpi-value">\'+display+\'</div>\'+footer+\'</div>\';');
    lines.push('  }).join("");');
    lines.push('}');
    lines.push('');

    // ─── CHART RENDER (from filtered data) ───
    lines.push('function renderCharts() {');
    lines.push('  chartInstances.forEach(function(c){ c.dispose(); });');
    lines.push('  chartInstances = [];');
    lines.push('  var grid = document.getElementById("chartGrid");');
    lines.push('  if (CHART_PLAN.length === 0) { grid.innerHTML = ""; return; }');
    // Asymmetric layout per the reference screenshots: first row = hero
    // (span 8) + side (span 4), then symmetric 6/6 pairs; a lone chart or
    // an odd trailing chart stretches full width so no gap is left.
    lines.push('  grid.innerHTML = CHART_PLAN.map(function(p, i) {');
    lines.push('    var cls = "chart-card";');
    lines.push('    if (CHART_PLAN.length === 1) cls += " full-width";');
    lines.push('    else if (i === 0) cls += " hero";');
    lines.push('    else if (i === 1) cls += " side";');
    lines.push('    else if (i === CHART_PLAN.length - 1 && (CHART_PLAN.length - 2) % 2 === 1) cls += " full-width";');
    lines.push('    var titleText = CHART_TITLE_OVERRIDES[i] !== undefined ? CHART_TITLE_OVERRIDES[i] : p.title;');
    lines.push('    return \'<div class="\'+cls+\'"><div class="chart-card-title editable-title" contenteditable="true" spellcheck="false" data-chart-idx="\'+i+\'">\'+escHtmlClient(titleText)+\'</div><div class="chart-container" id="chart_\'+i+\'"></div></div>\';');
    lines.push('  }).join("");');
    lines.push('  var isDark = currentTheme.dark;');
    lines.push('  var colors = currentTheme.chart;');
    lines.push('  var textColor = currentTheme.textSecondary;');
    lines.push('  var gridColor = isDark ? "rgba(148,163,184,.14)" : "rgba(100,116,139,.13)";');
    // Restrained series palette (skill A2 rule: accent + tints of the SAME
    // hue + one neutral — never a rainbow). Categorical donuts keep the
    // theme's multicolor palette; every series-over-time chart uses this.
    lines.push('  function tint(hex, p) {');
    lines.push('    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);');
    lines.push('    r=Math.round(r+(255-r)*p); g=Math.round(g+(255-g)*p); b=Math.round(b+(255-b)*p);');
    lines.push('    return "#"+[r,g,b].map(function(c){return c.toString(16).padStart(2,"0")}).join("");');
    lines.push('  }');
    lines.push('  var ACC = currentTheme.accent;');
    lines.push('  var SERIES = [ACC, isDark ? tint(ACC,.45) : "#94a3b8", tint(ACC, isDark ? .7 : .55)];');
    lines.push('  CHART_PLAN.forEach(function(p, i) {');
    lines.push('    var el = document.getElementById("chart_" + i);');
    lines.push('    if (!el) return;');
    lines.push('    var chart = echarts.init(el, isDark?"dark":null);');
    lines.push('    chartInstances.push(chart);');
    lines.push('');
    // LINE chart (time-series)
    lines.push('    if (p.type === "line") {');
    // Record-count trend (blueprint agg:"count") — one series counting rows
    // per time bucket; no numeric column needed (e.g. "PO issued per day").
    lines.push('      if (p.agg === "count") {');
    lines.push('        var cGroups = {}, cOrder = [];');
    lines.push('        filteredData.forEach(function(row) {');
    lines.push('          var t = row[p.timeCol]; if (t==null||t==="") return;');
    lines.push('          t = fmtDate(t);');
    lines.push('          if (cGroups[t] === undefined) { cGroups[t] = 0; cOrder.push(t); }');
    lines.push('          cGroups[t]++;');
    lines.push('        });');
    lines.push('        if (cOrder.length < 2) return;');
    lines.push('        var cDense = cOrder.length > 20;');
    lines.push('        var cName = p.seriesName || "จำนวนรายการ";');
    lines.push('        chart.setOption({tooltip:{trigger:"axis"},grid:{left:"3%",right:"4%",bottom:"3%",top:20,containLabel:true},color:SERIES,xAxis:{type:"category",boundaryGap:false,data:cOrder,axisLabel:{color:textColor,fontSize:10,rotate:cOrder.length>15?30:0},axisLine:{lineStyle:{color:gridColor}},axisTick:{show:false}},yAxis:{type:"value",splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:11,formatter:function(v){return fmt(v);}}},series:[{name:cName,type:"line",smooth:true,symbol:cDense?"none":"circle",symbolSize:4,lineStyle:{width:2.4},areaStyle:{opacity:.08},data:cOrder.map(function(t){return cGroups[t];})}]});');
    lines.push('        window.addEventListener("resize",function(){if(!chart.isDisposed())chart.resize()});');
    lines.push('        return;');
    lines.push('      }');
    lines.push('      var timeGroups = {}, timeOrder = [];');
    lines.push('      var cols = p.numCols;');
    lines.push('      var useAvg = p.agg === "avg";');
    lines.push('      filteredData.forEach(function(row) {');
    lines.push('        var t = row[p.timeCol]; if (t==null||t==="") return;');
    lines.push('        t = fmtDate(t);');
    lines.push('        if (!timeGroups[t]) { timeGroups[t] = {}; cols.forEach(function(c){timeGroups[t][c]={sum:0,cnt:0}}); timeOrder.push(t); }');
    lines.push('        cols.forEach(function(c){ var v=Number(row[c]); if(!isNaN(v)){timeGroups[t][c].sum+=v; timeGroups[t][c].cnt++;} });');
    lines.push('      });');
    lines.push('      if (timeOrder.length < 2) return;');
    lines.push('      var dense = timeOrder.length > 20;');
    lines.push('      var series = cols.map(function(c,ci){');
    lines.push('        return {name:c,type:"line",smooth:true,symbol:dense?"none":"circle",symbolSize:4,lineStyle:{width:2.4},areaStyle:ci===0?{opacity:.08}:undefined,data:timeOrder.map(function(t){var g=timeGroups[t][c]; return useAvg&&g.cnt>0?Math.round(g.sum/g.cnt*100)/100:Math.round(g.sum);})};');
    lines.push('      });');
    lines.push('      chart.setOption({tooltip:{trigger:"axis"},legend:{data:cols,textStyle:{color:textColor,fontSize:11},top:0,icon:"roundRect",itemWidth:10,itemHeight:10},grid:{left:"3%",right:"4%",bottom:"3%",top:cols.length>1?40:20,containLabel:true},color:SERIES,xAxis:{type:"category",boundaryGap:false,data:timeOrder,axisLabel:{color:textColor,fontSize:10,rotate:timeOrder.length>15?30:0},axisLine:{lineStyle:{color:gridColor}},axisTick:{show:false}},yAxis:{type:"value",splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:11,formatter:function(v){return fmt(v);}}},series:series});');
    lines.push('    }');
    lines.push('');
    // GROUPED BAR (budget vs actual)
    lines.push('    else if (p.type === "groupedBar") {');
    lines.push('      var tg = {}, to = [];');
    lines.push('      filteredData.forEach(function(row) {');
    lines.push('        var t = row[p.timeCol]; if (t==null||t==="") return;');
    lines.push('        t = fmtDate(t);');
    lines.push('        if (!tg[t]) { tg[t] = {}; p.numCols.forEach(function(c){tg[t][c]=0;}); to.push(t); }');
    lines.push('        p.numCols.forEach(function(c){ var v=Number(row[c]); if(!isNaN(v))tg[t][c]+=v; });');
    lines.push('      });');
    lines.push('      if (to.length < 2) return;');
    lines.push('      var gSeries = p.numCols.map(function(c,ci){');
    // Plan/budget = muted tint, actual = full accent — same-hue pairing per
    // the skill's chart color rule (no two-random-hues comparison).
    lines.push('        return {name:c,type:"bar",barGap:"15%",itemStyle:{borderRadius:[3,3,0,0]},data:to.map(function(t){return Math.round(tg[t][c]);})};');
    lines.push('      });');
    lines.push('      chart.setOption({tooltip:{trigger:"axis"},legend:{data:p.numCols,textStyle:{color:textColor,fontSize:11},top:0,icon:"roundRect",itemWidth:10,itemHeight:10},grid:{left:"3%",right:"4%",bottom:"3%",top:40,containLabel:true},color:[SERIES[2],ACC],xAxis:{type:"category",data:to,axisLabel:{color:textColor,fontSize:10,rotate:to.length>8?30:0},axisLine:{lineStyle:{color:gridColor}},axisTick:{show:false}},yAxis:{type:"value",splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:11,formatter:function(v){return fmt(v);}}},series:gSeries});');
    lines.push('    }');
    lines.push('');
    // STAT STRIP (efficiency metrics) — replaced the old 3-overlapping-
    // gauges widget (radius 70% of the card at 33%-spaced centers = arcs on
    // top of each other, plus a fabricated 0-100 scale for non-% values
    // like Brix/CCS). Now: avg value + a range bar on the data\'s REAL
    // min→max, one clean row per metric. Plain HTML, no ECharts needed.
    lines.push('    else if (p.type === "gauge") {');
    lines.push('      chart.dispose(); chartInstances.pop();');
    lines.push('      var statRows = p.numCols.map(function(c) {');
    lines.push('        var sum=0, cnt=0, mn=Infinity, mx=-Infinity;');
    lines.push('        filteredData.forEach(function(r){ var v=Number(r[c]); if(!isNaN(v)){sum+=v;cnt++;if(v<mn)mn=v;if(v>mx)mx=v;} });');
    lines.push('        if (cnt===0) return null;');
    lines.push('        var avg = Math.round(sum/cnt*100)/100;');
    lines.push('        var pct = mx>mn ? Math.max(4, Math.round((avg-mn)/(mx-mn)*100)) : 50;');
    lines.push('        return {name:c.replace(/_%$/,"").replace(/_/g," "), avg:avg, mn:mn, mx:mx, pct:pct};');
    lines.push('      }).filter(function(x){return x;});');
    lines.push('      if (statRows.length === 0) return;');
    lines.push('      el.innerHTML = \'<div class="stat-strip">\'+statRows.map(function(g,gi){');
    lines.push('        return \'<div class="stat-row">\'');
    lines.push('          +\'<div class="stat-row-head"><span class="stat-name">\'+escHtmlClient(g.name)+\'</span><span class="stat-avg">\'+g.avg+\'<small>เฉลี่ย</small></span></div>\'');
    lines.push('          +\'<div class="stat-bar"><div class="stat-bar-fill" style="width:\'+g.pct+\'%;background:\'+SERIES[gi%SERIES.length]+\'"></div></div>\'');
    lines.push('          +\'<div class="stat-range"><span>ต่ำสุด \'+fmt(g.mn)+\'</span><span>สูงสุด \'+fmt(g.mx)+\'</span></div>\'');
    lines.push('          +\'</div>\';');
    lines.push('      }).join("")+\'</div>\';');
    lines.push('    }');
    lines.push('');
    // DONUT
    lines.push('    else if (p.type === "donut") {');
    lines.push('      var groups = {}, order = [];');
    lines.push('      var donutCount = p.agg === "count";');
    lines.push('      filteredData.forEach(function(row) {');
    lines.push('        var label = row[p.textCol]; if (label==null||label==="") return;');
    lines.push('        label = String(label);');
    lines.push('        if (!groups[label]) { groups[label] = 0; order.push(label); }');
    lines.push('        if (donutCount) { groups[label] += 1; }');
    lines.push('        else { var nv = Number(row[p.numCol]); if(!isNaN(nv)) groups[label] += nv; }');
    lines.push('      });');
    lines.push('      if (order.length < 1) return;');
    lines.push('      order.sort(function(a,b){ return groups[b]-groups[a]; });');
    lines.push('      var data = order.slice(0, 10).map(function(l){ return {name:l, value:Math.round(groups[l])}; });');
    lines.push('      if (order.length > 10) { var rest=0; order.slice(10).forEach(function(l){rest+=groups[l]}); data.push({name:"อื่นๆ",value:Math.round(rest)}); }');
    lines.push('      var total = data.reduce(function(s,x){return s+x.value},0);');
    // Reference-style donut: center total, right legend showing name + value
    // + share — the legend carries the numbers so no labels crowd the ring.
    lines.push('      var donutByName = {}; data.forEach(function(d){ donutByName[d.name] = d.value; });');
    // Size to the actual card: the old fixed center 30% / radius 78% clipped
    // the ring and ran it under the right-side legend on narrow cards. Wide
    // card → ring left + capped-width legend right; narrow card → ring on
    // top + horizontal legend below, smaller radius.
    lines.push('      var donutWide = el.clientWidth >= 460;');
    lines.push('      var donutLegend = donutWide');
    lines.push('        ? {orient:"vertical",right:8,top:"center",itemWidth:10,itemHeight:10,icon:"circle",textStyle:{color:textColor,fontSize:11,width:Math.max(120,Math.round(el.clientWidth*0.38)),overflow:"truncate"},formatter:function(name){var v=donutByName[name]||0;var pct=total>0?Math.round(v/total*1000)/10:0;return name+"  "+fmt(v)+" ("+pct+"%)";}}');
    lines.push('        : {orient:"horizontal",left:"center",bottom:0,itemWidth:9,itemHeight:9,icon:"circle",textStyle:{color:textColor,fontSize:10.5},formatter:function(name){var v=donutByName[name]||0;var pct=total>0?Math.round(v/total*1000)/10:0;return name+" "+pct+"%";}};');
    lines.push('      chart.setOption({tooltip:{trigger:"item",formatter:"{b}: {c} ({d}%)"},legend:donutLegend,color:colors,series:[{type:"pie",radius:donutWide?["44%","64%"]:["36%","54%"],center:donutWide?["30%","50%"]:["50%","40%"],itemStyle:{borderColor:currentTheme.cardBg||"#fff",borderWidth:2},label:{show:true,position:"center",formatter:function(){return"\\n"+fmt(total)+"\\nรวม"},fontSize:14,fontWeight:700,color:currentTheme.textPrimary},emphasis:{label:{fontSize:16}},data:data}]});');
    lines.push('    }');
    lines.push('');

    /* ── The six analytical questions the old renderer could not draw ──────
     * Planned in buildChartPlan only when the data passes each gate, so these
     * appear on the files that can support them and stay absent on the files
     * that cannot.
     */

    // HISTOGRAM — Freedman-like binning capped to a readable 8-20 bins.
    lines.push('    else if (p.type === "histogram") {');
    lines.push('      var hv = [];');
    lines.push('      filteredData.forEach(function(row){ var v=Number(row[p.numCol]); if(!isNaN(v)&&row[p.numCol]!==""&&row[p.numCol]!==null) hv.push(v); });');
    lines.push('      if (hv.length < 10) return;');
    lines.push('      var hmin=Math.min.apply(null,hv), hmax=Math.max.apply(null,hv);');
    lines.push('      if (hmax===hmin) return;');
    lines.push('      var bins=Math.max(8,Math.min(20,Math.round(Math.sqrt(hv.length))));');
    lines.push('      var wdt=(hmax-hmin)/bins, counts=new Array(bins).fill(0);');
    lines.push('      hv.forEach(function(v){ var i=Math.min(bins-1,Math.floor((v-hmin)/wdt)); counts[i]++; });');
    lines.push('      var labels=counts.map(function(_,i){ return fmt(Math.round((hmin+i*wdt)*100)/100); });');
    // Mean marked on the axis: the distribution exists precisely to show how
    // much the mean is hiding, so the two belong on the same picture.
    lines.push('      var hmean=hv.reduce(function(s,v){return s+v;},0)/hv.length;');
    lines.push('      var meanIdx=Math.min(bins-1,Math.floor((hmean-hmin)/wdt));');
    lines.push('      chart.setOption({tooltip:{trigger:"axis",axisPointer:{type:"shadow"},formatter:function(ps){return "ช่วง "+ps[0].name+" ขึ้นไป<br/>จำนวน "+ps[0].value+" แถว";}},grid:{left:"3%",right:"4%",bottom:"3%",top:24,containLabel:true},xAxis:{type:"category",data:labels,axisLabel:{color:textColor,fontSize:10,rotate:bins>12?35:0},axisTick:{show:false},axisLine:{lineStyle:{color:gridColor}}},yAxis:{type:"value",name:"จำนวนแถว",nameTextStyle:{color:textColor,fontSize:10},splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:11}},color:[ACC],series:[{type:"bar",data:counts,barCategoryGap:"2%",itemStyle:{borderRadius:[3,3,0,0]},markLine:{silent:true,symbol:"none",label:{formatter:"เฉลี่ย "+fmt(Math.round(hmean*100)/100),color:textColor,fontSize:10},lineStyle:{color:currentTheme.textMuted||"#94a3b8",type:"dashed"},data:[{xAxis:meanIdx}]}}]});');
    lines.push('    }');
    lines.push('');

    // SCATTER — r is already in the title; the chart just has to be honest.
    lines.push('    else if (p.type === "scatter") {');
    lines.push('      var pts=[];');
    lines.push('      filteredData.forEach(function(row){ var x=Number(row[p.xCol]),y=Number(row[p.yCol]); if(!isNaN(x)&&!isNaN(y)&&row[p.xCol]!==""&&row[p.yCol]!=="") pts.push([x,y]); });');
    lines.push('      if (pts.length < 10) return;');
    lines.push('      chart.setOption({tooltip:{trigger:"item",formatter:function(o){return p.xCol+": "+fmt(o.value[0])+"<br/>"+p.yCol+": "+fmt(o.value[1]);}},grid:{left:"3%",right:"5%",bottom:"3%",top:24,containLabel:true},xAxis:{type:"value",name:p.xCol,nameLocation:"middle",nameGap:26,nameTextStyle:{color:textColor,fontSize:10},splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:10,formatter:function(v){return fmt(v);}}},yAxis:{type:"value",name:p.yCol,nameTextStyle:{color:textColor,fontSize:10},splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:10,formatter:function(v){return fmt(v);}}},color:[ACC],series:[{type:"scatter",symbolSize:8,itemStyle:{opacity:.7},data:pts}]});');
    lines.push('    }');
    lines.push('');

    // BOX PLOT — quartiles per group, so stability is visible next to level.
    lines.push('    else if (p.type === "boxplot") {');
    lines.push('      var gmap={},gorder=[];');
    lines.push('      filteredData.forEach(function(row){ var g=row[p.textCol]; if(g==null||g==="")return; g=String(g); var v=Number(row[p.numCol]); if(isNaN(v))return; if(!gmap[g]){gmap[g]=[];gorder.push(g);} gmap[g].push(v); });');
    lines.push('      gorder=gorder.filter(function(g){return gmap[g].length>=5;}).slice(0,8);');
    lines.push('      if (gorder.length < 2) return;');
    lines.push('      function q(arr,p2){ var s=arr.slice().sort(function(a,b){return a-b;}); var i=(s.length-1)*p2, lo=Math.floor(i), hi=Math.ceil(i); return lo===hi?s[lo]:s[lo]+(s[hi]-s[lo])*(i-lo); }');
    lines.push('      var boxes=gorder.map(function(g){ var a=gmap[g]; return [Math.min.apply(null,a),q(a,.25),q(a,.5),q(a,.75),Math.max.apply(null,a)].map(function(v){return Math.round(v*100)/100;}); });');
    lines.push('      chart.setOption({tooltip:{trigger:"item",formatter:function(o){var v=o.value;return o.name+"<br/>สูงสุด "+fmt(v[5])+"<br/>Q3 "+fmt(v[4])+"<br/>มัธยฐาน "+fmt(v[3])+"<br/>Q1 "+fmt(v[2])+"<br/>ต่ำสุด "+fmt(v[1]);}},grid:{left:"3%",right:"4%",bottom:"3%",top:24,containLabel:true},xAxis:{type:"category",data:gorder,axisLabel:{color:textColor,fontSize:10,rotate:gorder.length>5?25:0,width:90,overflow:"truncate"},axisLine:{lineStyle:{color:gridColor}}},yAxis:{type:"value",name:p.numCol,nameTextStyle:{color:textColor,fontSize:10},splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:10,formatter:function(v){return fmt(v);}}},series:[{type:"boxplot",data:boxes,itemStyle:{color:ACC+"33",borderColor:ACC,borderWidth:1.5}}]});');
    lines.push('    }');
    lines.push('');

    // STACKED BAR — composition over time, ≤4 layers by plan.
    lines.push('    else if (p.type === "stackedBar") {');
    lines.push('      var tg={},torder=[],partSet=p.parts||[];');
    lines.push('      filteredData.forEach(function(row){ var t=row[p.timeCol]; if(t==null||t==="")return; t=fmtDate(t); var g=row[p.textCol]; if(g==null||g==="")return; g=String(g); if(partSet.indexOf(g)<0)return; if(!tg[t]){tg[t]={};torder.push(t);} var v=Number(row[p.numCol]); if(isNaN(v))v=0; tg[t][g]=(tg[t][g]||0)+v; });');
    lines.push('      if (torder.length < 2) return;');
    lines.push('      var sser=partSet.map(function(g,gi){ return {name:g,type:"bar",stack:"s",emphasis:{focus:"series"},itemStyle:{color:colors[gi%colors.length]},data:torder.map(function(t){return Math.round((tg[t][g]||0)*100)/100;})}; });');
    lines.push('      chart.setOption({tooltip:{trigger:"axis",axisPointer:{type:"shadow"}},legend:{top:0,textStyle:{color:textColor,fontSize:11},itemWidth:10,itemHeight:10,icon:"circle"},grid:{left:"3%",right:"4%",bottom:"3%",top:32,containLabel:true},xAxis:{type:"category",data:torder,axisLabel:{color:textColor,fontSize:10,rotate:torder.length>12?30:0},axisLine:{lineStyle:{color:gridColor}},axisTick:{show:false}},yAxis:{type:"value",splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:11,formatter:function(v){return fmt(v);}}},series:sser});');
    lines.push('    }');
    lines.push('');

    // HEATMAP — one hue, light to dark, with the scale legend §3.11 requires.
    lines.push('    else if (p.type === "heatmap") {');
    lines.push('      var rset=[],cset=[],cell={};');
    lines.push('      filteredData.forEach(function(row){ var r1=row[p.rowCol],c1=row[p.colCol]; if(r1==null||r1===""||c1==null||c1==="")return; r1=String(r1);c1=String(c1); if(rset.indexOf(r1)<0)rset.push(r1); if(cset.indexOf(c1)<0)cset.push(c1); var v=Number(row[p.numCol]); if(isNaN(v))v=0; var k=r1+"\\u0000"+c1; cell[k]=(cell[k]||0)+v; });');
    lines.push('      rset=rset.slice(0,20); cset=cset.slice(0,12);');
    lines.push('      if (rset.length<2||cset.length<2) return;');
    lines.push('      var hdata=[],hmax2=0;');
    lines.push('      rset.forEach(function(r1,ri){ cset.forEach(function(c1,ci2){ var v=cell[r1+"\\u0000"+c1]||0; if(v>hmax2)hmax2=v; hdata.push([ci2,ri,Math.round(v*100)/100]); }); });');
    lines.push('      chart.setOption({tooltip:{position:"top",formatter:function(o){return rset[o.value[1]]+" × "+cset[o.value[0]]+"<br/>"+fmt(o.value[2]);}},grid:{left:"3%",right:"4%",bottom:"14%",top:12,containLabel:true},xAxis:{type:"category",data:cset,splitArea:{show:true},axisLabel:{color:textColor,fontSize:10,rotate:cset.length>6?25:0}},yAxis:{type:"category",data:rset,splitArea:{show:true},axisLabel:{color:textColor,fontSize:10,width:100,overflow:"truncate"}},visualMap:{min:0,max:hmax2||1,calculable:true,orient:"horizontal",left:"center",bottom:0,itemWidth:12,itemHeight:70,textStyle:{color:textColor,fontSize:10},inRange:{color:[currentTheme.cardBg||"#fff",ACC]}},series:[{type:"heatmap",data:hdata,label:{show:rset.length*cset.length<=60,fontSize:9,color:textColor,formatter:function(o){return fmt(o.value[2]);}},itemStyle:{borderColor:currentTheme.cardBg||"#fff",borderWidth:1}}]});');
    lines.push('    }');
    lines.push('');

    // TREEMAP — many parts at once, labelled only where a label fits.
    lines.push('    else if (p.type === "treemap") {');
    lines.push('      var tsum={},tord=[];');
    lines.push('      filteredData.forEach(function(row){ var g=row[p.textCol]; if(g==null||g==="")return; g=String(g); var v=Number(row[p.numCol]); if(isNaN(v))v=0; if(tsum[g]===undefined){tsum[g]=0;tord.push(g);} tsum[g]+=v; });');
    lines.push('      var tdata=tord.filter(function(g){return tsum[g]>0;}).map(function(g){return {name:g,value:Math.round(tsum[g]*100)/100};}).sort(function(a,b){return b.value-a.value;}).slice(0,50);');
    lines.push('      if (tdata.length < 4) return;');
    lines.push('      var ttotal=tdata.reduce(function(s,d){return s+d.value;},0);');
    lines.push('      chart.setOption({tooltip:{formatter:function(o){var pct=ttotal>0?Math.round(o.value/ttotal*1000)/10:0;return o.name+"<br/>"+fmt(o.value)+" ("+pct+"%)";}},series:[{type:"treemap",roam:false,nodeClick:false,breadcrumb:{show:false},itemStyle:{borderColor:currentTheme.cardBg||"#fff",borderWidth:2,gapWidth:2},label:{show:true,fontSize:11,color:"#fff",formatter:function(o){return o.value/ttotal>0.03?o.name:"";}},levels:[{color:colors,colorMappingBy:"value"}],data:tdata}]});');
    lines.push('    }');
    lines.push('');

    // PARETO — bars plus a cumulative % line on the SAME 0-100 axis, drawn as
    // a share of the total. A second y-axis is banned (D25 / §9 rule 9), and
    // it is not needed: expressing both in % of total keeps one scale honest.
    lines.push('    else if (p.type === "pareto") {');
    lines.push('      var psum={},pord=[];');
    lines.push('      filteredData.forEach(function(row){ var g=row[p.textCol]; if(g==null||g==="")return; g=String(g); var v=Number(row[p.numCol]); if(isNaN(v))v=0; if(psum[g]===undefined){psum[g]=0;pord.push(g);} psum[g]+=v; });');
    lines.push('      var pd=pord.map(function(g){return {name:g,value:psum[g]};}).filter(function(d){return d.value>0;}).sort(function(a,b){return b.value-a.value;}).slice(0,12);');
    lines.push('      if (pd.length < 4) return;');
    lines.push('      var ptotal=pd.reduce(function(s,d){return s+d.value;},0);');
    lines.push('      var pshare=pd.map(function(d){return Math.round(d.value/ptotal*1000)/10;});');
    lines.push('      var cum=[],run=0; pshare.forEach(function(v){ run+=v; cum.push(Math.round(run*10)/10); });');
    lines.push('      chart.setOption({tooltip:{trigger:"axis",axisPointer:{type:"shadow"},formatter:function(ps){var i=ps[0].dataIndex;return pd[i].name+"<br/>"+fmt(pd[i].value)+" ("+pshare[i]+"%)<br/>สะสม "+cum[i]+"%";}},legend:{top:0,data:["% ของทั้งหมด","สะสม %"],textStyle:{color:textColor,fontSize:11},itemWidth:10,itemHeight:10,icon:"circle"},grid:{left:"3%",right:"4%",bottom:"3%",top:32,containLabel:true},xAxis:{type:"category",data:pd.map(function(d){return d.name;}),axisLabel:{color:textColor,fontSize:10,rotate:pd.length>6?30:0,width:90,overflow:"truncate"},axisLine:{lineStyle:{color:gridColor}},axisTick:{show:false}},yAxis:{type:"value",max:100,name:"% ของทั้งหมด",nameTextStyle:{color:textColor,fontSize:10},splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:10,formatter:"{value}%"}},series:[{name:"% ของทั้งหมด",type:"bar",data:pshare,itemStyle:{color:ACC,borderRadius:[3,3,0,0]},label:{show:true,position:"top",color:textColor,fontSize:9,formatter:"{c}%"}},{name:"สะสม %",type:"line",data:cum,smooth:false,symbol:"circle",symbolSize:5,lineStyle:{width:2,color:currentTheme.textMuted||"#94a3b8"},itemStyle:{color:currentTheme.textMuted||"#94a3b8"}}]});');
    lines.push('    }');
    lines.push('');

    // BULLET — actual bar, target marker, % attainment. Replaces the gauge
    // wherever a real target exists (§3.21).
    lines.push('    else if (p.type === "bullet") {');
    lines.push('      var bg={},bord=[];');
    lines.push('      filteredData.forEach(function(row){ var g=row[p.textCol]; if(g==null||g==="")return; g=String(g); var a1=Number(row[p.numCol]),t1=Number(row[p.targetCol]); if(!bg[g]){bg[g]={a:0,t:0};bord.push(g);} if(!isNaN(a1))bg[g].a+=a1; if(!isNaN(t1))bg[g].t+=t1; });');
    lines.push('      bord=bord.filter(function(g){return bg[g].t>0;}).sort(function(a,b){return (bg[b].a/bg[b].t)-(bg[a].a/bg[a].t);}).slice(0,10);');
    lines.push('      if (bord.length < 1) return;');
    lines.push('      chart.dispose(); chartInstances.pop();');
    lines.push('      el.innerHTML = \'<div class="stat-strip">\'+bord.map(function(g){');
    lines.push('        var a1=bg[g].a,t1=bg[g].t,pct=t1>0?Math.round(a1/t1*1000)/10:0;');
    lines.push('        var w=Math.max(2,Math.min(100,pct));');
    lines.push('        var col=pct>=100?(currentTheme.dark?"#34d399":"#12a86a"):(pct>=90?"#f0a91c":"#e5484d");');
    lines.push('        var mark=pct>0?Math.min(100,100/Math.max(pct,100)*100):100;');
    lines.push('        return \'<div class="stat-row"><div class="stat-row-head"><span class="stat-name">\'+escHtmlClient(g)+\'</span>\'');
    lines.push('          +\'<span class="stat-avg" style="color:\'+col+\'">\'+pct+\'%<small>ของเป้า</small></span></div>\'');
    lines.push('          +\'<div class="stat-bar" style="position:relative"><div class="stat-bar-fill" style="width:\'+w+\'%;background:\'+col+\'"></div>\'');
    lines.push('          +\'<div style="position:absolute;top:-2px;bottom:-2px;left:\'+mark+\'%;width:2px;background:\'+(currentTheme.textPrimary||"#0f172a")+\'"></div></div>\'');
    lines.push('          +\'<div class="stat-range"><span>จริง \'+fmt(Math.round(a1*100)/100)+\'</span><span>เป้า \'+fmt(Math.round(t1*100)/100)+\'</span></div></div>\';');
    lines.push('      }).join("")+\'</div>\';');
    lines.push('    }');
    lines.push('');

    // BAR (default)
    lines.push('    else {');
    lines.push('      var groups = {}, order = [];');
    lines.push('      var barCount = p.agg === "count";');
    lines.push('      filteredData.forEach(function(row) {');
    lines.push('        var label = row[p.textCol]; if (label==null||label==="") return;');
    lines.push('        label = String(label);');
    lines.push('        if (!groups[label]) { groups[label] = 0; order.push(label); }');
    lines.push('        if (barCount) { groups[label] += 1; }');
    lines.push('        else { var nv = Number(row[p.numCol]); if(!isNaN(nv)) groups[label] += nv; }');
    lines.push('      });');
    lines.push('      if (order.length < 1) return;');
    lines.push('      order.sort(function(a,b){ return groups[b]-groups[a]; });');
    lines.push('      var data = order.slice(0, 15).map(function(l){ return {name:l, value:Math.round(groups[l])}; });');
    lines.push('      if (order.length > 15) { var rest=0; order.slice(15).forEach(function(l){rest+=groups[l]}); data.push({name:"อื่นๆ ("+( order.length-15)+")",value:Math.round(rest)}); }');
    lines.push('      chart.setOption({tooltip:{trigger:"axis",axisPointer:{type:"shadow"}},grid:{left:"3%",right:"10%",bottom:"3%",top:"12",containLabel:true},xAxis:{type:"value",splitLine:{lineStyle:{color:gridColor}},axisLabel:{color:textColor,fontSize:11,formatter:function(v){return fmt(v);}}},yAxis:{type:"category",data:data.map(function(x){return x.name}).reverse(),axisLine:{show:false},axisTick:{show:false},axisLabel:{color:textColor,fontSize:11,width:120,overflow:"truncate"}},color:[ACC],series:[{type:"bar",data:data.map(function(x){return x.value}).reverse(),barWidth:"55%",itemStyle:{borderRadius:[0,4,4,0]},label:{show:true,position:"right",color:textColor,fontSize:10,formatter:function(pt){return fmt(pt.value);}}}]});');
    lines.push('    }');
    lines.push('    window.addEventListener("resize",function(){if(!chart.isDisposed())chart.resize()});');
    lines.push('  });');
    lines.push('}');
    lines.push('');

    // ─── TABLE RENDER ───
    lines.push('function initTableHeaders() {');
    lines.push('  var thRow = document.getElementById("thRow");');
    lines.push('  var thFilter = document.getElementById("thFilterRow");');
    lines.push('  thRow.innerHTML = COLUMNS.map(function(c,i){');
    lines.push('    var numCls = NUM_COLS.indexOf(c)>=0 ? " class=\\"num\\"" : "";');
    lines.push('    return \'<th\'+numCls+\' onclick="sortTable(\'+i+\')">\'+ c +\' <span class="sort-icon">&#9650;</span></th>\';');
    lines.push('  }).join("");');
    // Column-level filters for text columns
    lines.push('  thFilter.innerHTML = COLUMNS.map(function(c){');
    lines.push('    if (TEXT_COLS.indexOf(c) < 0) return "<td></td>";');
    lines.push('    var vals = [], seen = {};');
    lines.push('    ALL_DATA.forEach(function(r){ var v=r[c]; if(v!=null&&v!==""&&!seen[v]){seen[v]=true;vals.push(String(v));} });');
    lines.push('    if (vals.length < 2 || vals.length > 50) return "<td></td>";');
    lines.push('    vals.sort();');
    lines.push('    var opts = "<option value=\\"\\">ทั้งหมด</option>" + vals.map(function(v){return "<option value=\\""+v.replace(/"/g,"&quot;")+"\\">"+v+"</option>";}).join("");');
    lines.push('    return \'<td class="dt-col-filter"><select onchange="setColFilter(\\\'\'+c+\'\\\',this.value)">\'+opts+\'</select></td>\';');
    lines.push('  }).join("");');
    lines.push('}');
    lines.push('');

    lines.push('function setColFilter(col, val) {');
    lines.push('  if (val) colFilters[col] = val; else delete colFilters[col];');
    lines.push('  applyAllFilters();');
    lines.push('}');
    lines.push('');

    lines.push('function sortTable(idx) {');
    lines.push('  if (sortCol===idx) sortAsc=!sortAsc; else { sortCol=idx; sortAsc=true; }');
    lines.push('  filteredData.sort(function(a,b){');
    lines.push('    var va=a[COLUMNS[idx]], vb=b[COLUMNS[idx]];');
    lines.push('    var na=parseFloat(va), nb=parseFloat(vb);');
    lines.push('    if(!isNaN(na)&&!isNaN(nb)) return sortAsc?na-nb:nb-na;');
    lines.push('    return sortAsc?String(va||"").localeCompare(String(vb||"")):String(vb||"").localeCompare(String(va||""));');
    lines.push('  });');
    lines.push('  renderTable();');
    lines.push('}');
    lines.push('');

    lines.push('function renderTable() {');
    lines.push('  var tbody = document.getElementById("tableBody");');
    lines.push('  var start = currentPage * PAGE_SIZE;');
    lines.push('  var pageRows = filteredData.slice(start, start + PAGE_SIZE);');
    lines.push('  tbody.innerHTML = pageRows.map(function(row){');
    lines.push('    return "<tr>" + COLUMNS.map(function(c){');
    lines.push('      var v = row[c]; if(v==null) v="";');
    lines.push('      var isNum = NUM_COLS.indexOf(c)>=0;');
    lines.push('      if(typeof v==="number" && isNum) v=fmt(v);');
    lines.push('      else if(typeof v==="number") v=v.toLocaleString();');
    lines.push('      else if(typeof v==="string") v=fmtDateDisplay(v);');
    lines.push('      return "<td"+(isNum?" class=\\"num\\"":"")+">"+String(v).replace(/</g,"&lt;")+"</td>";');
    lines.push('    }).join("") + "</tr>";');
    lines.push('  }).join("");');
    // Footer sums
    lines.push('  var foot = document.getElementById("tableFoot");');
    lines.push('  foot.innerHTML = COLUMNS.map(function(c){');
    lines.push('    if(NUM_COLS.indexOf(c)>=0){');
    lines.push('      var sum=0; filteredData.forEach(function(r){var v=Number(r[c]);if(!isNaN(v))sum+=v;});');
    lines.push('      return "<td class=\\"num\\"><strong>"+fmt(sum)+"</strong></td>";');
    lines.push('    }');
    lines.push('    return "<td></td>";');
    lines.push('  }).join("");');
    // Fix: prepend label to first text column in footer
    lines.push('  var firstFoot = foot.querySelector("td");');
    lines.push('  if(firstFoot && !firstFoot.querySelector("strong")) firstFoot.innerHTML = "<strong>รวมทั้งหมด (" + filteredData.length + " แถว)</strong>";');
    // Info
    lines.push('  var info = document.getElementById("tableInfo");');
    lines.push('  if(info) info.textContent = "แสดง "+(filteredData.length>0?start+1:0)+"-"+Math.min(start+PAGE_SIZE,filteredData.length)+" จาก "+filteredData.length;');
    lines.push('  renderPagination();');
    lines.push('}');
    lines.push('');

    lines.push('function renderPagination() {');
    lines.push('  var total = Math.ceil(filteredData.length / PAGE_SIZE);');
    lines.push('  var el = document.getElementById("tablePagination");');
    lines.push('  if(!el||total<=1){if(el)el.innerHTML="";return;}');
    lines.push('  var h="";');
    lines.push('  h+="<button "+(currentPage===0?"disabled":"")+\' onclick="goToPage(\'+(currentPage-1)+\')">&#9664;</button>\';');
    lines.push('  var s=Math.max(0,currentPage-2),e=Math.min(total,s+5);');
    lines.push('  for(var i=s;i<e;i++) h+="<button class=\'"+(i===currentPage?"active":"")+"\' onclick=\\"goToPage("+i+")\\">"+( i+1)+"</button>";');
    lines.push('  h+="<button "+(currentPage>=total-1?"disabled":"")+\' onclick="goToPage(\'+(currentPage+1)+\')">&#9654;</button>\';');
    lines.push('  el.innerHTML=h;');
    lines.push('}');
    lines.push('function goToPage(p){currentPage=p;renderTable();}');
    lines.push('');

    // ─── THEME MODAL ───
    lines.push('function openThemeModal() {');
    lines.push('  var o = document.getElementById("themeModalOverlay");');
    lines.push('  o.classList.add("open");');
    lines.push('  document.querySelectorAll(".theme-swatch").forEach(function(s){');
    lines.push('    s.classList.toggle("selected", s.dataset.themeId === currentTheme.id);');
    lines.push('  });');
    lines.push('  pendingThemeId = currentTheme.id;');
    lines.push('}');
    lines.push('function closeThemeModal() { document.getElementById("themeModalOverlay").classList.remove("open"); }');
    lines.push('');

    lines.push('function filterThemes(mode, tab) {');
    lines.push('  document.querySelectorAll(".theme-tab").forEach(function(t){t.classList.remove("active")});');
    lines.push('  tab.classList.add("active");');
    lines.push('  document.querySelectorAll(".theme-swatch").forEach(function(s){');
    lines.push('    if(mode==="all") s.style.display="";');
    lines.push('    else if(mode==="light") s.style.display=s.dataset.dark==="1"?"none":"";');
    lines.push('    else s.style.display=s.dataset.dark==="0"?"none":"";');
    lines.push('  });');
    lines.push('}');
    lines.push('');

    lines.push('function selectTheme(id) {');
    lines.push('  pendingThemeId = id;');
    lines.push('  document.querySelectorAll(".theme-swatch").forEach(function(s){');
    lines.push('    s.classList.toggle("selected", s.dataset.themeId === id);');
    lines.push('  });');
    lines.push('}');
    lines.push('');

    lines.push('function applySelectedTheme() {');
    lines.push('  var t = THEMES.find(function(x){return x.id===pendingThemeId});');
    lines.push('  if(!t) return;');
    lines.push('  currentTheme = t;');
    lines.push('  applyThemeVars(t);');
    lines.push('  closeThemeModal();');
    lines.push('  renderCharts();');
    lines.push('}');
    lines.push('');

    // ─── EDITABLE TITLES (chart cards re-render on filter change, so
    // edits are captured via delegation on the grid container and replayed
    // from CHART_TITLE_OVERRIDES on every renderCharts() call) ───
    lines.push('document.getElementById("chartGrid").addEventListener("focusout", function(e) {');
    lines.push('  var t = e.target;');
    lines.push('  if (!t.classList || !t.classList.contains("chart-card-title")) return;');
    lines.push('  var idx = t.getAttribute("data-chart-idx");');
    lines.push('  if (idx == null) return;');
    lines.push('  CHART_TITLE_OVERRIDES[idx] = t.textContent.trim() || CHART_PLAN[idx].title;');
    lines.push('});');
    lines.push('document.addEventListener("keydown", function(e) {');
    lines.push('  if (e.key !== "Enter") return;');
    lines.push('  var t = e.target;');
    lines.push('  if (!t.classList || !t.classList.contains("editable-title")) return;');
    lines.push('  e.preventDefault();');
    lines.push('  t.blur();');
    lines.push('});');
    lines.push('');

    // ─── INIT ───
    lines.push('applyThemeVars(currentTheme);');
    lines.push('initTableHeaders();');
    lines.push('applyAllFilters();');

    return lines.join('\n');
  }

  window.iDashInteractiveDashboard = {
    generate: generate
  };
})();
