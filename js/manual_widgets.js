/**
 * iDash Manual Widget Picker
 * ---------------------------------------------------------------------------
 * For a file the system has never seen, the user may skip auto-design and pick
 * the widgets themselves from a popup checklist. This module owns two things:
 *
 *   capabilities(dataset) — which widgets the real data can actually support,
 *                           and which are worth recommending. A widget the
 *                           data can't feed is disabled, not hidden, with the
 *                           reason shown — never offered and then faked.
 *
 *   buildBlueprint(dataset, ids) — turns the ticked widgets into the exact
 *                           { kpis, chartPlan, kpiMax } blueprint that
 *                           interactive_dashboard_generator already renders.
 *                           So the manual path reuses the same finished-
 *                           dashboard engine (charts, filters, table, export)
 *                           as every other route — no second renderer, and the
 *                           same no-fabrication guarantees.
 *
 * The catalog is deliberately the subset the generator can render faithfully
 * (line / grouped bar / gauge / donut / ranked bar / KPI cards). Offering a
 * widget we can only draw as something else would be a small lie about what
 * the user asked for.
 */
(function () {
  'use strict';

  var CATALOG = [
    { id: 'kpi', label: 'การ์ดสรุปตัวเลข (KPI)', desc: 'ผลรวม/ค่าเฉลี่ยของตัวเลขสำคัญ',
      icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="13" y2="9"/><line x1="7" y1="14" x2="17" y2="14"/>' },
    { id: 'trend', label: 'กราฟแนวโน้มตามเวลา', desc: 'เส้นแสดงการเปลี่ยนแปลงตามวันที่',
      icon: '<polyline points="3 17 9 11 13 14 21 6"/>' },
    { id: 'multiTrend', label: 'กราฟหลายเส้นเปรียบเทียบ', desc: 'เทียบหลายค่าในกราฟเส้นเดียว',
      icon: '<polyline points="3 15 9 9 14 12 21 4"/><polyline points="3 20 9 15 14 17 21 10" opacity=".45"/>' },
    { id: 'bar', label: 'กราฟแท่งจัดอันดับ', desc: 'เรียงมากไปน้อยตามหมวดหมู่',
      icon: '<rect x="4" y="10" width="3" height="10"/><rect x="10.5" y="4" width="3" height="16"/><rect x="17" y="13" width="3" height="7"/>' },
    { id: 'groupedBar', label: 'กราฟแท่งกลุ่ม', desc: 'เทียบสองค่าเคียงกันตามเวลา',
      icon: '<rect x="3" y="10" width="3" height="10"/><rect x="7" y="6" width="3" height="14"/><rect x="13" y="12" width="3" height="8"/><rect x="17" y="8" width="3" height="12"/>' },
    { id: 'donut', label: 'สัดส่วนแบบโดนัท', desc: 'ส่วนแบ่งของแต่ละหมวด (2-8 กลุ่ม)',
      icon: '<circle cx="12" cy="12" r="8" fill="none"/><circle cx="12" cy="12" r="3.2" fill="none"/>' },
    { id: 'gauge', label: 'เกจวัดประสิทธิภาพ', desc: 'ค่าอัตรา/เปอร์เซ็นต์เฉลี่ย',
      icon: '<path d="M4 16a8 8 0 0116 0" fill="none"/><line x1="12" y1="16" x2="16" y2="10"/>' }
  ];

  /* ── Column classification (self-contained, mirrors the generator) ─────── */

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
  // Same rate family the generator's KPI renderer uses — averaged, not summed.
  var RATE_RE = /_%|เฉลี่ย|average|rate|ratio|percent|efficiency|oee|ccs|brix|pol|purity|rpm|recovery|อุณหภูมิ|temperature|\btemp\b|pressure|ความดัน|\bph\b|_ph|ph_|\bbod\b|\bcod\b|\btss\b|\bppm\b|mg_l|mg\/l/i;
  var PERCENT_RE = /_%|percent|เปอร์เซ็นต์|%/i;
  // Identifier-shaped names — summing these produces impressive garbage.
  var ID_RE = /รหัส|code|\bid\b|_id\b|\bid_|cct|gl$|^id$|เลขที่|ทะเบียน|revision|รุ่น|version|barcode|sku|no\.?$|requisition|purchase\s*order|invoice|ใบสั่ง|ใบขอ|ใบแจ้ง/i;

  function colNames(dataset) {
    if (!dataset || !dataset.columns) return [];
    return dataset.columns.map(function (c) { return (c && c.name != null) ? c.name : String(c); });
  }

  /** Numeric column whose values are near-unique integers = document numbers. */
  function looksLikeIdColumn(data, name) {
    var seen = {}, nums = [], nonNull = 0;
    var limit = Math.min(data.length, 400);
    for (var i = 0; i < limit; i++) {
      var raw = data[i][name];
      if (raw == null || raw === '') continue;
      nonNull++; seen[String(raw)] = true;
      var n = Number(raw);
      if (!isNaN(n)) nums.push(n);
    }
    if (nonNull < 20 || nums.length < 20) return false;
    var distinctRatio = Object.keys(seen).length / nonNull;
    var allInt = nums.every(function (n) { return Number.isInteger(n); });
    if (!allInt) return false;
    if (distinctRatio > 0.95) {
      var sorted = nums.slice().sort(function (a, b) { return a - b; });
      var gaps = [];
      for (var g = 1; g < sorted.length; g++) gaps.push(sorted[g] - sorted[g - 1]);
      gaps.sort(function (a, b) { return a - b; });
      if (gaps[Math.floor(gaps.length / 2)] <= 2) return true;
    }
    // A whole issuing series in a tight band at huge magnitude (PR/PO numbers).
    var byVal = nums.slice().sort(function (a, b) { return a - b; });
    var median = byVal[Math.floor(byVal.length / 2)];
    if (median >= 100000 && (Math.max.apply(null, nums) - Math.min.apply(null, nums)) / median < 0.05) return true;
    return false;
  }

  function classify(dataset) {
    var names = colNames(dataset);
    var data = dataset.data || [];
    var sample = data.slice(0, 100);
    var numCols = [], dateCols = [], catCols = [];

    names.forEach(function (name) {
      var num = 0, date = 0, total = 0;
      sample.forEach(function (row) {
        var v = row[name];
        if (v == null || v === '') return;
        total++;
        if (isDateLikeVal(v)) date++;
        else if (isNumericVal(v)) num++;
      });
      if (total === 0) return;
      if (date / total > 0.6) { dateCols.push(name); return; }
      if (num / total > 0.7) {
        if (ID_RE.test(name) || looksLikeIdColumn(data, name)) return; // identifier, not a measure
        numCols.push(name);
        return;
      }
      // Text → candidate category if it has a usable number of distinct values.
      if (ID_RE.test(name)) return;
      var seen = {}, uniq = 0;
      for (var i = 0; i < data.length && uniq <= 60; i++) {
        var val = data[i][name];
        if (val == null || val === '') continue;
        if (!seen[val]) { seen[val] = true; uniq++; }
      }
      if (uniq >= 2 && uniq <= 40) catCols.push({ name: name, uniq: uniq });
    });

    var rateCols = numCols.filter(function (c) { return RATE_RE.test(c); });
    var sumCols = numCols.filter(function (c) { return !RATE_RE.test(c); });
    // Prefer the smallest-cardinality categories first (cleaner charts).
    catCols.sort(function (a, b) { return a.uniq - b.uniq; });
    return { numCols: numCols, sumCols: sumCols, rateCols: rateCols, dateCols: dateCols, catCols: catCols, rows: data.length };
  }

  /* ── What can this data actually support? ──────────────────────────────── */

  function capabilities(dataset) {
    var c = classify(dataset);
    var hasNum = c.numCols.length > 0;
    var hasDate = c.dateCols.length > 0;
    var has2Num = c.numCols.length >= 2;
    var smallCat = c.catCols.filter(function (x) { return x.uniq >= 2 && x.uniq <= 8; });
    var anyCat = c.catCols.length > 0;
    var hasRate = c.rateCols.length > 0;
    var enoughRows = c.rows >= 4;

    function cap(supported, recommended, reason) {
      return { supported: !!supported, recommended: !!(supported && recommended), reason: reason || '' };
    }

    return {
      _classified: c,
      kpi:        cap(hasNum, hasNum, hasNum ? '' : 'ต้องมีคอลัมน์ตัวเลข'),
      trend:      cap(hasDate && hasNum && enoughRows, hasDate && hasNum, (hasDate && hasNum) ? '' : 'ต้องมีคอลัมน์วันที่และตัวเลข'),
      multiTrend: cap(hasDate && has2Num && enoughRows, hasDate && has2Num, (hasDate && has2Num) ? '' : 'ต้องมีวันที่และตัวเลข ≥ 2 คอลัมน์'),
      bar:        cap(anyCat && hasNum, anyCat && hasNum, (anyCat && hasNum) ? '' : 'ต้องมีคอลัมน์หมวดหมู่และตัวเลข'),
      groupedBar: cap(hasDate && has2Num, false, (hasDate && has2Num) ? '' : 'ต้องมีวันที่และตัวเลข ≥ 2 คอลัมน์'),
      donut:      cap(smallCat.length > 0 && hasNum, smallCat.length > 0 && hasNum, (smallCat.length > 0 && hasNum) ? '' : 'ต้องมีหมวดหมู่ 2-8 กลุ่ม และตัวเลข'),
      gauge:      cap(hasRate, hasRate, hasRate ? '' : 'ต้องมีคอลัมน์อัตรา/เปอร์เซ็นต์')
    };
  }

  /* ── Ticked widgets → generator blueprint ──────────────────────────────── */

  function buildBlueprint(dataset, ids) {
    var caps = capabilities(dataset);
    var c = caps._classified;
    var want = {};
    (ids || []).forEach(function (id) { want[id] = true; });

    var firstMeasure = c.sumCols[0] || c.numCols[0] || null;
    var smallCats = c.catCols.filter(function (x) { return x.uniq >= 2 && x.uniq <= 8; });
    var anyCat = c.catCols[0] ? c.catCols[0].name : null;
    var timeCol = c.dateCols[0] || null;

    var kpis = [];
    if (want.kpi && caps.kpi.supported) {
      c.numCols.slice(0, 6).forEach(function (col) {
        var isRate = RATE_RE.test(col);
        kpis.push({
          col: col,
          agg: isRate ? 'avg' : 'sum',
          label: col,
          suffix: (isRate && PERCENT_RE.test(col)) ? '%' : ''
        });
      });
    }

    var plan = [];
    // Hero-first ordering: time series, then grouped comparison, then the rest.
    if (want.trend && caps.trend.supported && timeCol && firstMeasure) {
      plan.push({ role: 'trend', type: 'line', timeCol: timeCol, numCols: [firstMeasure],
        title: 'แนวโน้ม — ' + firstMeasure });
    }
    if (want.multiTrend && caps.multiTrend.supported && timeCol) {
      var lines = c.sumCols.length >= 2 ? c.sumCols.slice(0, 3) : c.numCols.slice(0, 3);
      plan.push({ role: 'multiTrend', type: 'line', timeCol: timeCol, numCols: lines,
        title: 'เปรียบเทียบแนวโน้ม — ' + lines.join(', '), fullWidth: true });
    }
    if (want.groupedBar && caps.groupedBar.supported && timeCol) {
      var pair = (c.sumCols.length >= 2 ? c.sumCols : c.numCols).slice(0, 2);
      plan.push({ role: 'groupedBar', type: 'groupedBar', timeCol: timeCol, numCols: pair,
        title: 'เปรียบเทียบ — ' + pair.join(' vs ') });
    }
    if (want.gauge && caps.gauge.supported && c.rateCols.length) {
      plan.push({ role: 'gauges', type: 'gauge', numCols: c.rateCols.slice(0, 3),
        title: 'ประสิทธิภาพ (ค่าเฉลี่ย · ช่วงต่ำสุด–สูงสุด)' });
    }
    if (want.donut && caps.donut.supported && smallCats.length && firstMeasure) {
      var dCat = smallCats[0].name;
      plan.push({ role: 'composition', type: 'donut', textCol: dCat, numCol: firstMeasure,
        title: 'สัดส่วน — ' + dCat });
    }
    if (want.bar && caps.bar.supported && anyCat && firstMeasure) {
      // Prefer a category not already spent on the donut, so the two charts
      // don't say the same thing twice.
      var usedCat = plan.filter(function (p) { return p.type === 'donut'; }).map(function (p) { return p.textCol; });
      var barCat = (c.catCols.find(function (x) { return usedCat.indexOf(x.name) < 0; }) || c.catCols[0]).name;
      plan.push({ role: 'breakdown', type: 'bar', textCol: barCat, numCol: firstMeasure,
        title: 'อันดับ — ' + barCat + ' (เรียงมากไปน้อย)' });
    }

    return { kpis: kpis, chartPlan: plan.slice(0, 8), kpiMax: kpis.length || 6 };
  }

  window.iDashManualWidgets = {
    CATALOG: CATALOG,
    capabilities: capabilities,
    buildBlueprint: buildBlueprint
  };
})();
