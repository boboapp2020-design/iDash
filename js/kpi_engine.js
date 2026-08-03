/**
 * iDash KPI Discovery Engine — module ④ (doc 02 §3, doc 05)
 * Binds domain KPI Library definitions to actual uploaded columns
 * (synonym match + role/unit sanity), evaluates the whitelisted
 * formula DSL (doc 05 §5), and validates every candidate (doc 05 §7).
 * Falls back to structural derived KPIs (doc 05 §6) when the library
 * is silent — the generic-business / zero-bind failure ladder (doc 02 §4).
 *
 * Browser-compatible, no build step. Attaches window.iDashKpiEngine.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // 1. Column name normalization + synonym matching (doc 05 §4)
  // ---------------------------------------------------------------------

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')   // strip bracketed units, e.g. "มูลค่า (บาท)"
      .replace(/[_\-.]/g, ' ')
      .replace(/[^\p{L}\p{N} ]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Match score of a column name against one synonym term: 1.0 exact, 0.7 partial, 0 none. */
  function matchScore(colName, term) {
    var a = normalize(colName);
    var b = normalize(term);
    if (!a || !b) return 0;
    if (a === b) return 1.0;
    if (a.indexOf(b) !== -1 || b.indexOf(a) !== -1) return 0.7;
    return 0;
  }

  /** Best match score of a column against an input's declared synonyms + its own key. */
  function inputMatchScore(colName, inputKey, inputDef) {
    var best = matchScore(colName, inputKey.replace(/_/g, ' '));
    var syn = (inputDef.synonyms || {});
    var langs = Object.keys(syn);
    for (var i = 0; i < langs.length; i++) {
      var terms = syn[langs[i]] || [];
      for (var t = 0; t < terms.length; t++) {
        var s = matchScore(colName, terms[t]);
        if (s > best) best = s;
      }
    }
    return best;
  }

  // ---------------------------------------------------------------------
  // 2. Formula DSL parser + evaluator (doc 05 §5, whitelisted, pure)
  // ---------------------------------------------------------------------

  var AGG_FUNCS = {
    sum: function (nums) { return nums.reduce(function (a, b) { return a + b; }, 0); },
    avg: function (nums) { return nums.length ? nums.reduce(function (a, b) { return a + b; }, 0) / nums.length : null; },
    min: function (nums) { return nums.length ? Math.min.apply(null, nums) : null; },
    max: function (nums) { return nums.length ? Math.max.apply(null, nums) : null; },
    count: function (nums) { return nums.length; },
    count_distinct: function (nums) { return new Set(nums).size; },
    median: function (nums) {
      if (!nums.length) return null;
      var s = nums.slice().sort(function (a, b) { return a - b; });
      var mid = Math.floor(s.length / 2);
      return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    }
  };

  function tokenize(formula) {
    var tokens = [];
    var re = /\s*(\d+\.?\d*|[A-Za-z_][A-Za-z0-9_]*|[()+\-*/,])\s*/g;
    var m, pos = 0;
    while (pos < formula.length && (m = re.exec(formula)) && m.index === pos) {
      tokens.push(m[1]);
      pos = re.lastIndex;
    }
    return tokens;
  }

  /** Recursive-descent parser: Expr -> Term (('+'|'-') Term)* ; Term -> Factor (('*'|'/') Factor)* */
  function parseFormula(tokens) {
    var i = 0;
    function peek() { return tokens[i]; }
    function next() { return tokens[i++]; }

    function parseExpr() {
      var node = parseTerm();
      while (peek() === '+' || peek() === '-') {
        var op = next();
        node = { op: op, left: node, right: parseTerm() };
      }
      return node;
    }
    function parseTerm() {
      var node = parseFactor();
      while (peek() === '*' || peek() === '/') {
        var op = next();
        node = { op: op, left: node, right: parseFactor() };
      }
      return node;
    }
    function parseFactor() {
      if (peek() === '-') { next(); return { op: 'neg', left: parseFactor() }; }
      if (peek() === '(') { next(); var n = parseExpr(); if (peek() === ')') next(); return n; }
      var tok = next();
      if (tok === undefined) return { op: 'num', value: 0 };
      if (/^\d/.test(tok)) return { op: 'num', value: parseFloat(tok) };
      // identifier: either a known agg function call or a bare variable reference
      if (peek() === '(') {
        next(); // consume '('
        var arg = next(); // variable name inside
        if (peek() === ')') next();
        return { op: 'call', fn: tok, arg: arg };
      }
      return { op: 'var', name: tok };
    }
    return parseExpr();
  }

  /** Evaluate a parsed AST against bound { varName: numberArray } data. null propagates (÷0 guard). */
  function evalNode(node, boundValues) {
    if (node.op === 'num') return node.value;
    if (node.op === 'neg') { var v = evalNode(node.left, boundValues); return v === null ? null : -v; }
    if (node.op === 'call') {
      var fn = AGG_FUNCS[node.fn];
      var nums = boundValues[node.arg] || [];
      if (!fn) return null;
      return fn(nums);
    }
    if (node.op === 'var') {
      var arr = boundValues[node.name] || [];
      return arr.length ? arr[0] : null;
    }
    var l = evalNode(node.left, boundValues);
    var r = evalNode(node.right, boundValues);
    if (l === null || r === null) return null;
    switch (node.op) {
      case '+': return l + r;
      case '-': return l - r;
      case '*': return l * r;
      case '/': return r === 0 ? null : l / r;
    }
    return null;
  }

  /**
   * Strict numeric coercion: the *whole* trimmed string must be numeric
   * (thousands separators + one decimal point allowed). Unlike parseFloat,
   * this rejects date-like strings such as "2025-12-01" (which parseFloat
   * happily reads as 2025) and other partial-numeric prefixes.
   */
  function toNumber(raw) {
    if (raw === null || raw === undefined || raw === '') return NaN;
    if (typeof raw === 'number') return raw;
    if (raw instanceof Date) return NaN;
    var cleaned = String(raw).replace(/,/g, '').trim().replace(/%$/, '');
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return NaN;
    return parseFloat(cleaned);
  }

  /**
   * Magnitude sanity (doc 05 §7.3): a computed value physically implausible
   * for its declared format/benchmark is a binding error, not an insight
   * (e.g. a "Pol % cane" of 98.9% — that column is finished-sugar pol, not
   * cane pol; cane cannot physically carry that much sucrose).
   */
  function magnitudeSane(value, kpiDef) {
    var format = kpiDef.format || {};
    if (format.kind === 'percentage' && (value < -0.01 || value > 100.01)) return false;

    var b = kpiDef.target && kpiDef.target.benchmark;
    if (b && b.good != null && b.warn != null) {
      var lo = Math.min(b.good, b.warn);
      var hi = Math.max(b.good, b.warn);
      var span = (hi - lo) || Math.abs(hi) * 0.5 || 1;
      var band = span * 4; // generous tolerance around the benchmark pair
      if (value < lo - band || value > hi + band) return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------
  // 3. Binding: resolve every KPI input against dataset columns
  // ---------------------------------------------------------------------

  /**
   * @param {Object} kpiDef  — one KPI definition (doc 05 §2 shape)
   * @param {Object} dataset — { columns: string[], data: object[] }
   * @returns {Object|null} KPIBinding, or null if it doesn't bind/validate
   */
  function bindKpi(kpiDef, dataset) {
    var inputs = kpiDef.inputs || {};
    var inputKeys = Object.keys(inputs);
    var boundColumns = {};
    var matchEvidence = [];
    var usedColumns = {};

    for (var k = 0; k < inputKeys.length; k++) {
      var key = inputKeys[k];
      var best = { score: 0, column: null };
      for (var c = 0; c < dataset.columns.length; c++) {
        var col = dataset.columns[c];
        if (usedColumns[col]) continue;
        var score = inputMatchScore(col, key, inputs[key]);
        if (score > best.score) best = { score: score, column: col };
      }
      if (best.score < 0.6) return null; // required input unresolved -> KPI doesn't bind
      boundColumns[key] = best.column;
      usedColumns[best.column] = true;
      matchEvidence.push({ input: key, column: best.column, score: best.score });
    }

    // Extract numeric arrays for each bound input
    var boundValues = {};
    for (var bk = 0; bk < inputKeys.length; bk++) {
      var ik = inputKeys[bk];
      var colName = boundColumns[ik];
      var nums = [];
      for (var r = 0; r < dataset.data.length; r++) {
        var n = toNumber(dataset.data[r][colName]);
        if (!isNaN(n)) nums.push(n);
      }
      boundValues[ik] = nums;
    }

    // Validation gauntlet (doc 05 §7)
    var tokens = tokenize(kpiDef.formula);
    var ast;
    var value;
    try {
      ast = parseFormula(tokens);
      value = evalNode(ast, boundValues);
    } catch (e) {
      return null; // not computable
    }
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return null;
    if (!magnitudeSane(value, kpiDef)) return null; // doc 05 §7.3 — binding error, not an insight

    var avgScore = matchEvidence.reduce(function (a, e) { return a + e.score; }, 0) / matchEvidence.length;

    return {
      kpiId: kpiDef.id,
      nameTH: kpiDef.name.th,
      nameEN: kpiDef.name.en,
      value: value,
      format: kpiDef.format,
      direction: kpiDef.direction,
      target: kpiDef.target,
      aggNature: kpiDef.aggNature,
      boundColumns: boundColumns,
      confidence: Math.round(avgScore * 1000) / 1000,
      because: matchEvidence.map(function (e) {
        return 'ev:column."' + e.column + '"~synonym."' + e.input + '"(' + e.score + ')';
      })
    };
  }

  // ---------------------------------------------------------------------
  // 4. Derived-KPI fallback (doc 05 §6) — when the library is silent
  // ---------------------------------------------------------------------

  function isNumericColumn(dataset, col) {
    var seen = 0, numeric = 0;
    for (var r = 0; r < Math.min(dataset.data.length, 30); r++) {
      var raw = dataset.data[r][col];
      if (raw === null || raw === undefined || raw === '') continue;
      seen++;
      if (!isNaN(toNumber(raw))) numeric++;
    }
    return seen > 0 && numeric / seen >= 0.8;
  }

  /** doc 02 §3.1 aggNature heuristic: intensive (avg-worthy) vs extensive (sum-worthy) by name. */
  function isIntensiveLike(col) {
    return /%|percent|pct|rate|ratio|avg|average|mean|index|score|เปอร์เซ็นต์|ร้อยละ|อัตรา|เฉลี่ย|ดัชนี|คะแนน/i.test(col);
  }

  /** Narrower than isIntensiveLike: only true % columns get a "%" suffix in display. */
  function isPercentDisplay(col) {
    return /%|percent|pct|เปอร์เซ็นต์|ร้อยละ/i.test(col);
  }

  /** Structural fallback: record count + sum/avg of each numeric column (doc 05 §6 table, lite). */
  // Columns whose numbers are identifiers, not quantities — summing them
  // produces impressive-looking garbage ("ผลรวม — Order ID = 48.5M").
  var ID_NAME_RE = /(^|[\s_.-])(id|code|no\.?|number|รหัส|เลขที่|เบอร์|phone|โทร|zip|postcode|ปี|year|barcode|sku|ref)([\s_.-]|$)/i;
  // Document series named in full ("Purchase Requisition", "Purchase order",
  // "Invoice") carry no id-word at all, so the pattern above lets them through.
  var DOC_NAME_RE = /(requisition|purchase\s*order|invoice|receipt|voucher|ใบสั่ง|ใบขอ|ใบแจ้ง|ใบเสร็จ)/i;

  /** True when a numeric column is identifier/label-like rather than a measure. */
  function isIdentifierLike(dataset, col) {
    if (ID_NAME_RE.test(col.trim()) || DOC_NAME_RE.test(col.trim())) return true;
    // Thai compounds attach with no separator ("รหัสบัญชี", "เลขที่ใบสั่งซื้อ")
    // so the word-boundary regex above misses them — a Thai id-word PREFIX
    // is decisive on its own.
    if (/^(รหัส|เลขที่|หมายเลข|เบอร์)/.test(col.trim())) return true;

    var nums = [];
    var seen = {};
    var nonNull = 0;
    var limit = Math.min(dataset.data.length, 500);
    for (var r = 0; r < limit; r++) {
      var raw = dataset.data[r][col];
      if (raw === null || raw === undefined || raw === '') continue;
      nonNull++;
      seen[String(raw)] = true;
      var n = toNumber(raw);
      if (!isNaN(n)) nums.push(n);
    }
    if (nonNull === 0 || nums.length === 0) return false;

    // Running numbers: near-unique integers whose sorted gaps are tiny
    // (1, 2, 3, …). Random-valued measures (budgets, amounts) are also
    // near-unique but their gaps are large — they must NOT be flagged.
    var distinctRatio = Object.keys(seen).length / nonNull;
    var allIntegers = nums.every(function (n) { return Number.isInteger(n); });
    if (distinctRatio > 0.95 && allIntegers && nums.length >= 20) {
      var sorted = nums.slice().sort(function (a, b) { return a - b; });
      var gaps = [];
      for (var g = 1; g < sorted.length; g++) gaps.push(sorted[g] - sorted[g - 1]);
      gaps.sort(function (a, b) { return a - b; });
      var medianGap = gaps[Math.floor(gaps.length / 2)];
      if (medianGap <= 2) return true;
    }

    var min = Math.min.apply(null, nums), max = Math.max.apply(null, nums);

    // Document numbers (PR 110250763, PO 108040332, invoice numbers) survive
    // the running-number test above because line items repeat the same number,
    // so the distinct ratio never reaches 0.95. What gives them away is shape:
    // a whole issuing series sits inside a narrow band at a huge magnitude,
    // where a real measure spans orders of magnitude. Without this, summing
    // 494 PR numbers yields "ผลรวม — Purchase Requisition = 385113.3M".
    if (allIntegers && nums.length >= 20) {
      var byValue = nums.slice().sort(function (a, b) { return a - b; });
      var median = byValue[Math.floor(byValue.length / 2)];
      if (median >= 100000 && (max - min) / median < 0.05) return true;
    }

    // Year-like values (ค.ศ. 1900-2100 / พ.ศ. 2400-2700) with tiny spread.
    var yearish = (min >= 1900 && max <= 2100) || (min >= 2400 && max <= 2700);
    if (yearish && allIntegers && (max - min) <= 100) return true;

    return false;
  }

  var CURRENCY_NAME_RE = /฿|บาท|baht|amount|มูลค่า|ราคา|price|cost|ต้นทุน|ยอด|revenue|sales|value|total|จ่าย|รับ|เงิน/i;

  function deriveStructuralKpis(dataset) {
    var results = [];
    results.push({
      kpiId: 'derived.record_count',
      nameTH: 'จำนวนรายการทั้งหมด',
      nameEN: 'Total Records',
      value: dataset.data.length,
      format: { kind: 'number', decimals: 0 },
      direction: 'neutral',
      target: { policy: 'none' },
      boundColumns: {},
      confidence: 1.0,
      because: ['ev:profile.rowCount']
    });

    var numericCols = dataset.columns.filter(function (c) {
      return isNumericColumn(dataset, c) && !isIdentifierLike(dataset, c);
    });
    for (var i = 0; i < Math.min(numericCols.length, 5); i++) {
      var col = numericCols[i];
      var nums = [];
      for (var r = 0; r < dataset.data.length; r++) {
        var n = toNumber(dataset.data[r][col]);
        if (!isNaN(n)) nums.push(n);
      }
      if (nums.length === 0) continue;
      var intensive = isIntensiveLike(col);
      var isPercent = isPercentDisplay(col);
      var isCurrency = !isPercent && CURRENCY_NAME_RE.test(col);
      var value = intensive ? AGG_FUNCS.avg(nums) : AGG_FUNCS.sum(nums);
      if (value === null || isNaN(value)) continue;
      results.push({
        kpiId: 'derived.' + normalize(col).replace(/\s+/g, '_'),
        nameTH: (intensive ? 'ค่าเฉลี่ย' : 'ผลรวม') + ' — ' + col,
        nameEN: (intensive ? 'Average of ' : 'Total ') + col,
        value: value,
        format: {
          kind: isPercent ? 'percentage' : (isCurrency ? 'currency' : 'number'),
          decimals: intensive ? (isPercent ? 1 : 2) : 0
        },
        direction: 'neutral',
        target: { policy: 'none' },
        boundColumns: { measure: col },
        confidence: 0.6,
        because: ['ev:derived.aggNature.' + (intensive ? 'intensive' : 'extensive'), 'ev:column."' + col + '"'],
        derived: true,
        aggNature: intensive ? 'intensive' : 'extensive'
      });
    }
    return results;
  }

  // ---------------------------------------------------------------------
  // 5. Trend series (doc 02 §3.1 timeAxes; feeds module ⑦ gene.requires.trend)
  // ---------------------------------------------------------------------

  var TIME_NAME_RE = /date|วันที่|เดือน|ปี|month|year|time|period|กะ/i;

  function parseDate(v) {
    if (v instanceof Date) return v;
    // Plain numbers are quantities, not dates — new Date(485000) would
    // happily produce an epoch timestamp and turn budget columns into
    // phantom time axes.
    if (typeof v === 'number') return null;
    var s = String(v).trim();
    if (/^-?[\d,.]+$/.test(s)) return null;
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  /** Best-effort detection of a single time column (doc 02 §3.1 timeAxes, lite). */
  function detectTimeColumn(dataset) {
    var best = null, bestScore = 0;
    for (var c = 0; c < dataset.columns.length; c++) {
      var col = dataset.columns[c];
      var sample = 0, parsed = 0;
      for (var r = 0; r < Math.min(dataset.data.length, 30); r++) {
        var v = dataset.data[r][col];
        if (v === null || v === undefined || v === '') continue;
        sample++;
        if (parseDate(v)) parsed++;
      }
      if (sample === 0) continue;
      var ratio = parsed / sample;
      if (ratio < 0.7) continue;
      var score = ratio + (TIME_NAME_RE.test(col) ? 0.3 : 0);
      if (score > bestScore) { bestScore = score; best = col; }
    }
    return best;
  }

  function bucketKey(value, grain) {
    var d = parseDate(value);
    if (!d) return null;
    if (grain === 'day') return d.toISOString().slice(0, 10);
    if (grain === 'month') return d.toISOString().slice(0, 7);
    return null;
  }

  /** Pick day or month grain by how many distinct buckets each yields (doc 02 §3.1). */
  function chooseGrain(dataset, timeCol) {
    var days = {}, months = {};
    for (var r = 0; r < dataset.data.length; r++) {
      var v = dataset.data[r][timeCol];
      var dk = bucketKey(v, 'day'); if (dk) days[dk] = true;
      var mk = bucketKey(v, 'month'); if (mk) months[mk] = true;
    }
    var dayCount = Object.keys(days).length;
    var monthCount = Object.keys(months).length;
    if (dayCount >= 3 && dayCount <= 120) return 'day';
    if (monthCount >= 3 && monthCount <= 36) return 'month';
    return null;
  }

  /**
   * Recompute a KPI's value over an arbitrary row subset — the same binding,
   * same formula, evaluated on `rows` instead of the whole dataset. Shared
   * by trend-series (bucket = time period) and dimension breakdown
   * (bucket = category value).
   */
  function evaluateForRows(binding, kpiDef, rows) {
    var value;
    if (kpiDef) {
      var boundValues = {};
      var inputKeys = Object.keys(kpiDef.inputs || {});
      for (var ik = 0; ik < inputKeys.length; ik++) {
        var colName = binding.boundColumns[inputKeys[ik]];
        var nums = [];
        for (var rr = 0; rr < rows.length; rr++) {
          var n = toNumber(rows[rr][colName]);
          if (!isNaN(n)) nums.push(n);
        }
        boundValues[inputKeys[ik]] = nums;
      }
      try {
        value = evalNode(parseFormula(tokenize(kpiDef.formula)), boundValues);
      } catch (e) { value = null; }
    } else {
      var measureCol = binding.boundColumns.measure;
      // Bindings without a measure column (derived.record_count) count rows —
      // summing a nonexistent column would yield a fabricated flat zero.
      if (!measureCol) return rows.length;
      var nums2 = [];
      for (var rr2 = 0; rr2 < rows.length; rr2++) {
        var n2 = toNumber(rows[rr2][measureCol]);
        if (!isNaN(n2)) nums2.push(n2);
      }
      value = binding.aggNature === 'intensive' ? AGG_FUNCS.avg(nums2) : AGG_FUNCS.sum(nums2);
    }
    return (value !== null && value !== undefined && !isNaN(value) && isFinite(value)) ? value : null;
  }

  /**
   * Recompute a KPI's value per time bucket — the same binding, same formula,
   * evaluated over each period's row subset instead of the whole dataset.
   * @param {Object} binding — a KPIBinding from discoverKpis()
   * @param {Object|null} kpiDef — the library definition (null for derived KPIs)
   * @returns {Array<{period:string, value:number}>} sorted ascending, gaps dropped
   */
  function computeTrendSeries(binding, kpiDef, dataset, timeCol, grain) {
    var buckets = {};
    for (var r = 0; r < dataset.data.length; r++) {
      var key = bucketKey(dataset.data[r][timeCol], grain);
      if (!key) continue;
      (buckets[key] = buckets[key] || []).push(dataset.data[r]);
    }
    var keys = Object.keys(buckets).sort();
    var points = [];
    for (var k = 0; k < keys.length; k++) {
      var value = evaluateForRows(binding, kpiDef, buckets[keys[k]]);
      if (value !== null) {
        points.push({ period: keys[k], value: Math.round(value * 1000) / 1000 });
      }
    }
    return points;
  }

  // ---------------------------------------------------------------------
  // 6. Dimension breakdown (doc 02 §3.1 role:dimension; feeds module ⑨
  //    "contribution analysis — which segment drove the delta")
  // ---------------------------------------------------------------------

  var ID_LIKE_RE = /^(id|รหัส|no\.?|number|เลขที่)$/i;

  /**
   * Candidate low-cardinality categorical dimensions for a Pareto/ranking
   * breakdown: 2-20 distinct non-null values, not identifier-like, and not
   * already consumed as a KPI input. Returned best-cardinality-first
   * (doc 06 Pareto guidance favors 4-12 groups — too few is a trivial split,
   * too many is unreadable).
   */
  function detectDimensionColumns(dataset, excludeCols) {
    var exclude = {};
    (excludeCols || []).forEach(function (c) { exclude[c] = true; });
    var candidates = [];

    for (var c = 0; c < dataset.columns.length; c++) {
      var col = dataset.columns[c];
      if (exclude[col] || ID_LIKE_RE.test(col.trim())) continue;

      var seen = {}, nonNull = 0, numericLike = 0;
      for (var r = 0; r < dataset.data.length; r++) {
        var v = dataset.data[r][col];
        if (v === null || v === undefined || v === '') continue;
        nonNull++;
        seen[String(v)] = true;
        if (!isNaN(toNumber(v))) numericLike++;
      }
      var distinct = Object.keys(seen).length;
      if (nonNull === 0) continue;
      // A column that's almost entirely numeric is a measure, not a dimension.
      if (numericLike / nonNull > 0.85) continue;
      if (distinct < 2 || distinct > 20) continue;

      var idealness = -Math.abs(distinct - 7); // 7 groups is a readable Pareto sweet spot
      candidates.push({ column: col, distinct: distinct, idealness: idealness });
    }

    candidates.sort(function (a, b) { return b.idealness - a.idealness; });
    return candidates.map(function (c) { return c.column; });
  }

  /**
   * Break a KPI down by a categorical dimension: value + share of total per
   * group, ranked descending (doc 06 Pareto chart input shape).
   * @returns {Array<{group:string, value:number, share:number}>} top groups first
   */
  function computeDimensionBreakdown(binding, kpiDef, dataset, dimensionCol, topN) {
    var buckets = {};
    for (var r = 0; r < dataset.data.length; r++) {
      var raw = dataset.data[r][dimensionCol];
      if (raw === null || raw === undefined || raw === '') continue;
      var key = String(raw).trim();
      (buckets[key] = buckets[key] || []).push(dataset.data[r]);
    }

    var groups = [];
    var total = 0;
    Object.keys(buckets).forEach(function (key) {
      var value = evaluateForRows(binding, kpiDef, buckets[key]);
      if (value === null) return;
      groups.push({ group: key, value: value });
      total += value;
    });

    groups.sort(function (a, b) { return b.value - a.value; });

    var n = topN || 8;
    var top = groups.slice(0, n).map(function (g) {
      return {
        group: g.group,
        value: Math.round(g.value * 1000) / 1000,
        share: total !== 0 ? Math.round((g.value / total) * 1000) / 10 : null
      };
    });

    if (groups.length > n) {
      var othersValue = groups.slice(n).reduce(function (a, g) { return a + g.value; }, 0);
      var remainingCount = groups.length - n;
      top.push({
        // Disambiguated from any raw category the source data itself might
        // label "อื่นๆ" (etc.) — this bucket is a synthesized rollup, not a
        // data value, and must never be visually confused with one.
        group: 'อื่น ๆ ที่เหลือ (' + remainingCount + ' กลุ่ม)',
        value: Math.round(othersValue * 1000) / 1000,
        share: total !== 0 ? Math.round((othersValue / total) * 1000) / 10 : null,
        isOthers: true
      });
    }

    return top;
  }

  // ---------------------------------------------------------------------
  // 7. Public entry point
  // ---------------------------------------------------------------------

  /**
   * @param {Object} dataset  — { columns, data }
   * @param {Array}  kpiDefs  — flat array of KPI definitions from the winning pack (+ parent)
   * @returns {Array} KPIBindings, library-bound first, derived-fallback appended if few/none bind
   */
  function discoverKpis(dataset, kpiDefs) {
    var bound = [];
    for (var i = 0; i < (kpiDefs || []).length; i++) {
      var b = bindKpi(kpiDefs[i], dataset);
      if (b) bound.push(b);
    }
    if (bound.length < 3) {
      var derived = deriveStructuralKpis(dataset);
      // Don't duplicate columns already used by a bound KPI
      var usedCols = {};
      bound.forEach(function (b) {
        Object.keys(b.boundColumns).forEach(function (k) { usedCols[b.boundColumns[k]] = true; });
      });
      derived.forEach(function (d) {
        var col = d.boundColumns.measure;
        if (!col || !usedCols[col]) bound.push(d);
      });
    }
    return bound;
  }

  window.iDashKpiEngine = {
    discoverKpis: discoverKpis,
    bindKpi: bindKpi,
    deriveStructuralKpis: deriveStructuralKpis,
    detectTimeColumn: detectTimeColumn,
    chooseGrain: chooseGrain,
    computeTrendSeries: computeTrendSeries,
    detectDimensionColumns: detectDimensionColumns,
    computeDimensionBreakdown: computeDimensionBreakdown,
    evaluateForRows: evaluateForRows,
    toNumber: toNumber
  };
})();
