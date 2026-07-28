/**
 * iDash Dashboard Composer — modules ⑦⑧ (doc 03 §6, doc 07 layout law)
 * Assembles a DashboardSpec (pages → sections → widgets) from the
 * chromosome/gene KB, constrained by the Decision Spec + KPI Bindings.
 *
 * Template-aware layout: templates control VISUAL STRUCTURE — hero pairing
 * (full/split_with_donut/split_with_breakdown), inline composition/breakdown
 * on Monitor page, 2-col vs 3-col analysis rows, summary strips.
 *
 * Honesty law (doc 07 emptyStates.noTimeAxis): never fabricate a trend —
 * omit trend sections entirely when no time axis is detected.
 *
 * Browser-compatible, no build step. Attaches window.iDashComposer.
 */
(function () {
  'use strict';

  var MIN_TREND_POINTS = 3;
  var MAX_GAP_CARDS = 2;

  function hasQualifyingTarget(kpi) {
    return !!(kpi.target && kpi.target.policy && kpi.target.policy !== 'none' &&
      kpi.target.benchmark && kpi.target.benchmark.good != null);
  }

  function findMultiLineGroup(decisions, bindingById, seriesByKpiId) {
    var withSeries = decisions.filter(function (d) { return seriesByKpiId[d.kpiId]; });
    for (var i = 0; i < withSeries.length; i++) {
      var base = bindingById[withSeries[i].kpiId];
      var baseKind = base.format && base.format.kind;
      var group = [withSeries[i]];
      for (var j = i + 1; j < withSeries.length && group.length < 4; j++) {
        var other = bindingById[withSeries[j].kpiId];
        if ((other.format && other.format.kind) !== baseKind) continue;
        var ratio = Math.abs(base.value) > 0 && Math.abs(other.value) > 0
          ? Math.max(Math.abs(base.value), Math.abs(other.value)) / Math.min(Math.abs(base.value), Math.abs(other.value))
          : Infinity;
        if (ratio > 20) continue;
        group.push(withSeries[j]);
      }
      if (group.length >= 2) return group;
    }
    return null;
  }

  function pearson(rows, colA, colB) {
    var xs = [], ys = [];
    for (var r = 0; r < rows.length; r++) {
      var a = window.iDashKpiEngine.toNumber(rows[r][colA]);
      var b = window.iDashKpiEngine.toNumber(rows[r][colB]);
      if (isNaN(a) || isNaN(b)) continue;
      xs.push(a); ys.push(b);
    }
    var n = xs.length;
    if (n < 20) return null;
    var mx = xs.reduce(function (s, v) { return s + v; }, 0) / n;
    var my = ys.reduce(function (s, v) { return s + v; }, 0) / n;
    var num = 0, dx = 0, dy = 0;
    for (var k = 0; k < n; k++) {
      num += (xs[k] - mx) * (ys[k] - my);
      dx += (xs[k] - mx) * (xs[k] - mx);
      dy += (ys[k] - my) * (ys[k] - my);
    }
    if (dx === 0 || dy === 0) return null;
    return { r: num / Math.sqrt(dx * dy), n: n };
  }

  function scatterPoints(rows, colA, colB, cap) {
    var pts = [];
    var step = Math.max(1, Math.floor(rows.length / cap));
    for (var r = 0; r < rows.length && pts.length < cap; r += step) {
      var a = window.iDashKpiEngine.toNumber(rows[r][colA]);
      var b = window.iDashKpiEngine.toNumber(rows[r][colB]);
      if (isNaN(a) || isNaN(b)) continue;
      pts.push([Math.round(a * 100) / 100, Math.round(b * 100) / 100]);
    }
    return pts;
  }

  function partsOverTime(binding, kpiDef, dataset, dimCol, timeCol, grain, maxParts) {
    var partRows = {};
    for (var r = 0; r < dataset.data.length; r++) {
      var raw = dataset.data[r][dimCol];
      if (raw === null || raw === undefined || raw === '') continue;
      var key = String(raw).trim();
      (partRows[key] = partRows[key] || []).push(dataset.data[r]);
    }
    var totals = Object.keys(partRows).map(function (key) {
      return { key: key, total: window.iDashKpiEngine.evaluateForRows(binding, kpiDef, partRows[key]) || 0 };
    }).sort(function (a, b) { return b.total - a.total; }).slice(0, maxParts);

    var periodSet = {};
    var parts = totals.map(function (t) {
      var series = window.iDashKpiEngine.computeTrendSeries(
        binding, kpiDef, { columns: dataset.columns, data: partRows[t.key] }, timeCol, grain);
      series.forEach(function (p) { periodSet[p.period] = true; });
      return { name: t.key, series: series };
    });
    var periods = Object.keys(periodSet).sort();
    var partsAligned = parts.map(function (p) {
      var byPeriod = {};
      p.series.forEach(function (pt) { byPeriod[pt.period] = pt.value; });
      return { name: p.name, values: periods.map(function (per) { return byPeriod[per] != null ? byPeriod[per] : 0; }) };
    });
    return { periods: periods, parts: partsAligned };
  }

  function computeKpiStatus(binding, series) {
    if (binding.target && binding.target.benchmark && binding.target.benchmark.good != null) {
      var good = binding.target.benchmark.good;
      var warn = binding.target.benchmark.warn;
      var higherBetter = binding.direction === 'higher-better';
      var met = higherBetter ? binding.value >= good : binding.value <= good;
      if (met) return { label: 'ดีเยี่ยม', severity: 'good', basis: 'target' };
      var nearWarn = warn != null && (higherBetter ? binding.value >= warn : binding.value <= warn);
      return { label: nearWarn ? 'เฝ้าระวัง' : 'ต่ำกว่าเป้า', severity: nearWarn ? 'warn' : 'bad', basis: 'target' };
    }
    if (series && series.length >= 4) {
      var values = series.map(function (p) { return p.value; }).filter(function (v) { return typeof v === 'number' && isFinite(v); });
      if (values.length >= 4) {
        var mid = Math.floor(values.length / 2);
        var firstAvg = values.slice(0, mid).reduce(function (s, v) { return s + v; }, 0) / mid;
        var secondAvg = values.slice(mid).reduce(function (s, v) { return s + v; }, 0) / (values.length - mid);
        if (firstAvg !== 0) {
          var pct = ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100;
          var rising = pct >= 0;
          var goodDir = binding.direction === 'lower-better' ? !rising : rising;
          if (Math.abs(pct) < 3) return { label: 'คงที่', severity: 'neutral', basis: 'trend', pct: pct };
          return { label: goodDir ? 'ดีขึ้น' : 'แย่ลง', severity: goodDir ? 'good' : 'bad', basis: 'trend', pct: pct };
        }
      }
    }
    return { label: 'ปกติ', severity: 'neutral', basis: 'none' };
  }

  function formatThaiNumber(value, format) {
    var decimals = (format && format.decimals != null) ? format.decimals : 2;
    return Number(value).toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function ledgerFor(kpi, extra) {
    var because = (kpi.because || []).slice();
    if (extra) because.push(extra);
    return because;
  }

  /**
   * @param {Array} decisions   — DecisionSpec.decisions
   * @param {Array} gaps        — DecisionSpec.gaps
   * @param {Array} bindings    — KPIBindings from iDashKpiEngine.discoverKpis()
   * @param {Object} kpiDefById — map kpiId -> library KPI def
   * @param {Object} dataset    — { columns, data }
   * @param {Object} [template] — layout recipe from dashboard_templates.js
   * @returns {Object} DashboardSpec
   */
  function buildDashboardSpec(decisions, gaps, bindings, kpiDefById, dataset, template) {
    var bindingById = {};
    bindings.forEach(function (b) { bindingById[b.kpiId] = b; });

    var timeCol = window.iDashKpiEngine.detectTimeColumn(dataset);
    var grain = timeCol ? window.iDashKpiEngine.chooseGrain(dataset, timeCol) : null;
    var hasTimeAxis = !!(timeCol && grain);

    var seriesByKpiId = {};
    if (hasTimeAxis) {
      decisions.forEach(function (d) {
        var binding = bindingById[d.kpiId];
        if (!binding || seriesByKpiId[d.kpiId]) return;
        var def = kpiDefById[d.kpiId] || null;
        var series = window.iDashKpiEngine.computeTrendSeries(binding, def, dataset, timeCol, grain);
        if (series.length >= MIN_TREND_POINTS) seriesByKpiId[d.kpiId] = series;
      });
    }

    // Template layout parameters (all degrade gracefully to defaults)
    var kpiRowSize = (template && template.kpiRowSize) || 5;
    var heroPreference = template ? template.heroPreference : null;
    var heroLayout = (template && template.heroLayout) || 'full';
    var inlineComposition = !!(template && template.inlineComposition);
    var inlineBreakdown = !!(template && template.inlineBreakdown);
    var analysisLayout = (template && template.analysisLayout) || 'two_col';
    var showSummaryStrip = !!(template && template.showSummaryStrip);
    var pageCount = (template && template.pageCount) || 3;

    // ── Pre-compute composition + breakdown widgets ────────────────────
    // Built once, then placed on Monitor or Diagnose based on template.
    var compositionWidgets = [];
    var breakdownSections = [];

    // Composition (donut) — doc 06 §2
    var MAX_COMPOSITION = 2;
    for (var cd = 0; cd < decisions.length && compositionWidgets.length < MAX_COMPOSITION; cd++) {
      var compDecision = decisions[cd];
      var compBinding = bindingById[compDecision.kpiId];
      if (!compBinding || compBinding.aggNature !== 'extensive') continue;
      var compDef = kpiDefById[compDecision.kpiId] || null;
      var compExclude = Object.keys(compBinding.boundColumns || {}).map(function (k) { return compBinding.boundColumns[k]; });
      if (timeCol) compExclude.push(timeCol);
      var compDimCandidates = window.iDashKpiEngine.detectDimensionColumns(dataset, compExclude);
      var compDimCol = compDimCandidates[0];
      if (!compDimCol) continue;
      var compBreakdown = window.iDashKpiEngine.computeDimensionBreakdown(compBinding, compDef, dataset, compDimCol, 6);
      var compRealGroups = compBreakdown.filter(function (g) { return !g.isOthers; });
      if (compRealGroups.length < 2 || compRealGroups.length > 6) continue;
      compositionWidgets.push({
        geneId: 'gene.donut',
        component: 'donut',
        chart: 'donut',
        gridSpan: 6,
        kpiId: compDecision.kpiId,
        nameTH: compBinding.nameTH,
        dimensionColumn: compDimCol,
        format: compBinding.format,
        groups: compBreakdown,
        question: compBinding.nameTH + ' ประกอบด้วยสัดส่วนอะไรบ้าง',
        because: ledgerFor(compBinding, 'ev:composition."' + compDimCol + '"~parts(' + compRealGroups.length + '),doc06:donut≤6')
      });
    }

    // Diagnostic breakdown (bar/ranked list) — multi-KPI
    var MAX_BREAKDOWN_KPIS = 2;
    var usedBreakdownKpis = {};
    for (var bd = 0; bd < decisions.length && breakdownSections.length < MAX_BREAKDOWN_KPIS; bd++) {
      var bdDecision = decisions[bd];
      if (usedBreakdownKpis[bdDecision.kpiId]) continue;
      var bdBinding = bindingById[bdDecision.kpiId];
      if (!bdBinding) continue;
      var bdDef = kpiDefById[bdDecision.kpiId] || null;
      var bdExclude = Object.keys(bdBinding.boundColumns || {}).map(function (k) { return bdBinding.boundColumns[k]; });
      if (timeCol) bdExclude.push(timeCol);
      var bdDimCandidates = window.iDashKpiEngine.detectDimensionColumns(dataset, bdExclude);
      var bdDimCol = bdDimCandidates[0];
      if (!bdDimCol) continue;
      var bdBreakdown = window.iDashKpiEngine.computeDimensionBreakdown(bdBinding, bdDef, dataset, bdDimCol, 6);
      var bdRealGroups = bdBreakdown.filter(function (g) { return !g.isOthers; });
      if (bdRealGroups.length < 3) continue;
      var bdIsExtensive = bdBinding.aggNature === 'extensive';
      var paretoLocked = template && (template.domainId === 'manufacturing' || template.domainId === 'sugar_factory');
      var breakdownPref = (template && template.breakdownPreference) || 'bar_chart';
      var preferRankedList = breakdownPref === 'ranked_list' && !paretoLocked;
      var bdGene = bdIsExtensive ? (preferRankedList ? 'gene.ranking_hbar' : 'gene.pareto_bar') : 'gene.ranking_hbar';
      var bdWidget = {
        geneId: bdGene,
        component: 'bar',
        gridSpan: 6,
        kpiId: bdDecision.kpiId,
        nameTH: bdBinding.nameTH,
        dimensionColumn: bdDimCol,
        format: bdBinding.format,
        showShare: bdIsExtensive,
        groups: bdBreakdown,
        question: 'อะไรคือปัจจัยหลักที่ขับเคลื่อน ' + bdBinding.nameTH,
        because: ledgerFor(bdBinding, 'ev:dimension."' + bdDimCol + '"~groups(' + bdRealGroups.length + ')')
      };
      if (bdGene === 'gene.pareto_bar') bdWidget.chart = 'bar';
      breakdownSections.push({
        chromosomeId: 'chromo.diagnostic_breakdown',
        intent: 'สาเหตุที่ ' + bdBinding.nameTH + ' เป็นแบบนี้ — แยกตาม ' + bdDimCol,
        layoutHint: 'two-col-diagnostic',
        widgets: [bdWidget]
      });
      usedBreakdownKpis[bdDecision.kpiId] = true;
    }

    // ────────────────────────────────────────────────────────────────────
    //  BUILD MONITOR PAGE
    // ────────────────────────────────────────────────────────────────────
    var pages = [];
    var monitorSections = [];

    // ── chromo.executive_summary ──────────────────────────────────────
    var headlineDecisions = decisions.slice(0, kpiRowSize);
    var heroKpiIds = {};
    if (headlineDecisions.length >= 3 || (headlineDecisions.length > 0 && decisions.length <= 5)) {
      var kpiCardStyle = (template && template.cardStyle) || 'sparkline';
      var headlineWidgets = headlineDecisions.map(function (d) {
        var binding = bindingById[d.kpiId];
        var series = seriesByKpiId[d.kpiId];
        var geneId = series ? 'gene.kpi_card_trend' : 'gene.kpi_card_static';
        return {
          geneId: geneId,
          component: series ? 'kpi-card' : 'kpi-card-static',
          gridSpan: 3,
          kpiId: d.kpiId,
          nameTH: binding.nameTH,
          value: binding.value,
          format: binding.format,
          direction: binding.direction,
          target: binding.target,
          series: series || null,
          cardStyle: kpiCardStyle,
          question: d.question,
          because: ledgerFor(binding, 'ev:decision.rank.' + d.rank)
        };
      });

      // Hero chart
      var heroWidget = null;
      var seriesDecisions = decisions.filter(function (d) { return seriesByKpiId[d.kpiId]; });
      var tryMultiLineHero = !heroPreference || heroPreference === 'multi_line';
      var heroMlGroup = tryMultiLineHero ? findMultiLineGroup(seriesDecisions, bindingById, seriesByKpiId) : null;

      // Determine hero gridSpan based on template layout
      var heroSpan = 12;
      var heroCompanion = null;
      if (heroLayout === 'split_with_donut' && compositionWidgets.length > 0) {
        heroSpan = 8;
        heroCompanion = JSON.parse(JSON.stringify(compositionWidgets[0]));
        heroCompanion.gridSpan = 4;
        heroCompanion._usedAsCompanion = true;
      } else if (heroLayout === 'split_with_breakdown' && breakdownSections.length > 0) {
        heroSpan = 8;
        heroCompanion = JSON.parse(JSON.stringify(breakdownSections[0].widgets[0]));
        heroCompanion.gridSpan = 4;
        heroCompanion._usedAsCompanion = true;
      }

      if (heroPreference === 'bullet_grid' || heroPreference === 'none') {
        // No hero chart
      } else if (heroMlGroup && heroMlGroup.length >= 2) {
        var hmPeriodSet = {};
        heroMlGroup.forEach(function (d) {
          seriesByKpiId[d.kpiId].forEach(function (p) { hmPeriodSet[p.period] = true; });
          heroKpiIds[d.kpiId] = true;
        });
        var hmPeriods = Object.keys(hmPeriodSet).sort();
        var hmParts = heroMlGroup.map(function (d) {
          var byPeriod = {};
          seriesByKpiId[d.kpiId].forEach(function (p) { byPeriod[p.period] = p.value; });
          return {
            name: bindingById[d.kpiId].nameTH,
            values: hmPeriods.map(function (per) { return byPeriod[per] != null ? byPeriod[per] : null; })
          };
        });
        heroWidget = {
          geneId: 'gene.multi_line',
          component: 'multi-line',
          chart: 'multiline',
          gridSpan: heroSpan,
          nameTH: 'เปรียบเทียบแนวโน้ม — ' + hmParts.map(function (p) { return p.name; }).join(' / '),
          format: bindingById[heroMlGroup[0].kpiId].format,
          periods: hmPeriods,
          parts: hmParts,
          question: 'ตัวชี้วัดหน่วยเดียวกันเหล่านี้เคลื่อนไหวไปด้วยกันหรือสวนทางกัน',
          because: ['ev:multiline.same-unit(' + hmParts.length + '),magnitude≤20x', 'doc06:multi-line']
        };
      } else {
        var heroDecision = headlineDecisions.filter(function (d) { return seriesByKpiId[d.kpiId]; })[0];
        if (heroDecision) {
          var heroBinding = bindingById[heroDecision.kpiId];
          var heroGene = (heroPreference !== 'trend_line' && hasQualifyingTarget(heroBinding)) ? 'gene.trend_target_band' : 'gene.trend_line';
          heroKpiIds[heroDecision.kpiId] = true;
          heroWidget = {
            geneId: heroGene,
            component: heroGene === 'gene.trend_target_band' ? 'trend-target-band' : 'trend-line',
            gridSpan: heroSpan,
            chart: 'line',
            kpiId: heroDecision.kpiId,
            nameTH: heroBinding.nameTH,
            format: heroBinding.format,
            direction: heroBinding.direction,
            target: heroBinding.target,
            series: seriesByKpiId[heroDecision.kpiId],
            question: heroDecision.question,
            because: ledgerFor(heroBinding, 'ev:decision.rank.' + heroDecision.rank + (hasQualifyingTarget(heroBinding) ? ', kb:target.benchmark' : ''))
          };
        }
      }

      var topBinding = bindingById[decisions[0].kpiId];
      var narrativeWidget = {
        geneId: 'gene.insight_strip',
        component: 'insight-strip',
        gridSpan: 12,
        text: (topBinding.nameTH + ' อยู่ที่ ' + formatThaiNumber(topBinding.value, topBinding.format) +
          (topBinding.format && topBinding.format.kind === 'percentage' ? '%' : '') +
          ' — เรียงตามลำดับความสำคัญของคำถามธุรกิจที่ AI ตรวจพบ'),
        because: ['kpi:' + decisions[0].kpiId, 'ev:decision.rank.1']
      };

      // Assemble the executive summary section with hero companion
      var summaryWidgets = [].concat(headlineWidgets);
      if (heroWidget) {
        summaryWidgets.push(heroWidget);
        if (heroCompanion && heroWidget.gridSpan < 12) {
          summaryWidgets.push(heroCompanion);
        }
      }
      summaryWidgets.push(narrativeWidget);

      monitorSections.push({
        chromosomeId: 'chromo.executive_summary',
        intent: 'คำตอบด่วนของคำถามธุรกิจอันดับต้น ๆ',
        layoutHint: 'kpi-row-then-hero',
        widgets: summaryWidgets
      });
    }

    // ── chromo.trend_context ──────────────────────────────────────────
    var trendContextSection = null;
    if (hasTimeAxis) {
      var heroUsed = heroKpiIds;
      var secondaryDecisions = decisions.filter(function (d) {
        return seriesByKpiId[d.kpiId] && !heroUsed[d.kpiId];
      }).slice(0, 4);

      var mlGroup = findMultiLineGroup(secondaryDecisions, bindingById, seriesByKpiId);
      if (mlGroup && mlGroup.length >= 2) {
        var mlPeriodSet = {};
        mlGroup.forEach(function (d) {
          seriesByKpiId[d.kpiId].forEach(function (p) { mlPeriodSet[p.period] = true; });
        });
        var mlPeriods = Object.keys(mlPeriodSet).sort();
        var mlParts = mlGroup.map(function (d) {
          var byPeriod = {};
          seriesByKpiId[d.kpiId].forEach(function (p) { byPeriod[p.period] = p.value; });
          return {
            name: bindingById[d.kpiId].nameTH,
            values: mlPeriods.map(function (per) { return byPeriod[per] != null ? byPeriod[per] : null; })
          };
        });
        var mlBinding = bindingById[mlGroup[0].kpiId];
        trendContextSection = {
          chromosomeId: 'chromo.trend_context',
          intent: 'เปรียบเทียบแนวโน้มตัวชี้วัดหน่วยเดียวกัน',
          layoutHint: 'full-width',
          widgets: [{
            geneId: 'gene.multi_line',
            component: 'multi-line',
            chart: 'multiline',
            gridSpan: 12,
            nameTH: 'เปรียบเทียบแนวโน้ม — ' + mlParts.map(function (p) { return p.name; }).join(' / '),
            format: mlBinding.format,
            periods: mlPeriods,
            parts: mlParts,
            question: 'ตัวชี้วัดเหล่านี้เคลื่อนไหวไปด้วยกันหรือสวนทางกัน',
            because: ['ev:multiline.same-unit(' + mlParts.length + '),magnitude≤20x', 'doc06:multi-line']
          }]
        };
      } else if (secondaryDecisions.length > 0) {
        var secondaryWidgets = secondaryDecisions.slice(0, 2).map(function (d) {
          var binding = bindingById[d.kpiId];
          return {
            geneId: 'gene.trend_line',
            component: 'trend-line',
            gridSpan: 6,
            chart: 'line',
            kpiId: d.kpiId,
            nameTH: binding.nameTH,
            format: binding.format,
            direction: binding.direction,
            series: seriesByKpiId[d.kpiId],
            question: d.question,
            because: ledgerFor(binding, 'ev:decision.rank.' + d.rank)
          };
        });
        trendContextSection = {
          chromosomeId: 'chromo.trend_context',
          intent: 'แนวโน้มของตัวชี้วัดสำคัญตามช่วงเวลา',
          layoutHint: 'side-by-side',
          widgets: secondaryWidgets
        };
      }
    }

    // ── chromo.target_attainment (bullet) ─────────────────────────────
    var bulletSection = null;
    var bulletDecisions = decisions.filter(function (d) {
      return hasQualifyingTarget(bindingById[d.kpiId] || {});
    }).slice(0, 3);
    if (bulletDecisions.length > 0) {
      var bulletWidgets = bulletDecisions.map(function (d) {
        var b = bindingById[d.kpiId];
        return {
          geneId: 'gene.bullet_target',
          component: 'bullet',
          chart: 'bullet',
          gridSpan: 4,
          kpiId: d.kpiId,
          nameTH: b.nameTH,
          value: b.value,
          format: b.format,
          direction: b.direction,
          target: b.target,
          question: b.nameTH + ' เทียบเป้าหมายเป็นอย่างไร',
          because: ledgerFor(b, 'kb:target.benchmark, doc06:bullet-target')
        };
      });
      bulletSection = {
        chromosomeId: 'chromo.target_attainment',
        intent: 'ผลจริงเทียบเป้าหมาย',
        layoutHint: 'bullet-row',
        widgets: bulletWidgets
      };
    }

    // ── chromo.kpi_status_table ───────────────────────────────────────
    var statusTableSection = null;
    if (headlineDecisions.length >= 3 && (!template || template.showStatusTable !== false)) {
      var statusRows = headlineDecisions.map(function (d) {
        var b = bindingById[d.kpiId];
        var series = seriesByKpiId[d.kpiId];
        var status = computeKpiStatus(b, series);
        return {
          nameTH: b.nameTH,
          question: d.question,
          value: b.value,
          format: b.format,
          status: status.label,
          severity: status.severity,
          deltaPct: status.pct != null ? status.pct : null
        };
      });
      statusTableSection = {
        chromosomeId: 'chromo.kpi_status_table',
        intent: 'สรุปสถานะตัวชี้วัดหลักทั้งหมด',
        layoutHint: 'full-width',
        widgets: [{
          geneId: 'gene.kpi_status_table',
          component: 'status-table',
          gridSpan: 12,
          rows: statusRows,
          question: 'ตัวชี้วัดไหนอยู่ในเกณฑ์ดี ตัวไหนต้องเฝ้าระวัง',
          because: ['ev:status-summary(' + statusRows.length + ')']
        }]
      };
    }

    // ── chromo.alert_feed ─────────────────────────────────────────────
    var alertFeedSection = null;
    var alertItems = [];
    decisions.forEach(function (d) {
      var b = bindingById[d.kpiId];
      if (!b || !b.target || !b.target.benchmark || b.target.benchmark.good == null) return;
      var higherBetter = b.direction === 'higher-better';
      var good = b.target.benchmark.good;
      var met = higherBetter ? b.value >= good : b.value <= good;
      if (met) return;
      var unit = (b.format && b.format.kind === 'percentage') ? '%' : '';
      alertItems.push({
        severity: 'high',
        type: 'target-breach',
        message: b.nameTH + ' อยู่ที่ ' + formatThaiNumber(b.value, b.format) + unit +
          ' ต่ำกว่าเป้าหมาย ' + formatThaiNumber(good, b.format) + unit,
        because: ledgerFor(b, 'kb:target.benchmark')
      });
    });
    decisions.forEach(function (d) {
      var series = seriesByKpiId[d.kpiId];
      if (!series || series.length < 4) return;
      var b = bindingById[d.kpiId];
      var status = computeKpiStatus(b, series);
      if (status.basis === 'trend' && status.severity === 'bad' && Math.abs(status.pct) >= 15) {
        alertItems.push({
          severity: 'medium',
          type: 'trend-swing',
          message: b.nameTH + (status.pct < 0 ? 'ลดลง ' : 'เพิ่มขึ้น ') + Math.abs(status.pct).toFixed(1) +
            '% เทียบครึ่งแรกกับครึ่งหลังของช่วงข้อมูล',
          because: ledgerFor(b, 'ev:trend-delta.' + status.pct.toFixed(1))
        });
      }
    });
    (gaps || []).slice(0, 2).forEach(function (g) {
      alertItems.push({
        severity: 'info',
        type: 'data-gap',
        message: 'ยังไม่มีข้อมูลตอบคำถาม: ' + g.question,
        because: ['gap:' + g.kpiId]
      });
    });
    var SEVERITY_ORDER = { high: 0, medium: 1, info: 2 };
    alertItems.sort(function (a, b) { return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]; });
    alertItems = alertItems.slice(0, 6);

    if (alertItems.length > 0 && (!template || template.showAlerts !== false)) {
      alertFeedSection = {
        chromosomeId: 'chromo.alert_feed',
        intent: 'สิ่งที่ควรจับตาในข้อมูลชุดนี้',
        layoutHint: 'half-width',
        widgets: [{
          geneId: 'gene.alert_feed',
          component: 'alert-feed',
          gridSpan: 6,
          items: alertItems,
          question: 'มีสัญญาณเตือนอะไรบ้างในข้อมูลนี้',
          because: ['ev:alerts(' + alertItems.length + ')']
        }]
      };
    }

    // ── Inline composition on Monitor page ───────────────────────────
    // When inlineComposition, the first composition donut (if not already
    // used as heroCompanion) becomes a Monitor section. This makes the
    // Monitor page visually richer — matching reference images where
    // donut + trend appear side-by-side on the same page.
    var inlineCompSection = null;
    var firstCompUsed = heroCompanion && heroCompanion._usedAsCompanion && heroLayout === 'split_with_donut';
    if (inlineComposition && compositionWidgets.length > (firstCompUsed ? 1 : 0)) {
      var compIdx = firstCompUsed ? 1 : 0;
      var inlineDonut = JSON.parse(JSON.stringify(compositionWidgets[compIdx]));
      inlineDonut.gridSpan = analysisLayout === 'three_col' ? 4 : 6;
      inlineCompSection = {
        chromosomeId: 'chromo.composition_inline',
        intent: 'สัดส่วนของ ' + inlineDonut.nameTH,
        layoutHint: analysisLayout === 'three_col' ? 'third-width' : 'half-width',
        widgets: [inlineDonut]
      };
    }

    // ── Inline breakdown on Monitor page ─────────────────────────────
    var inlineBdSection = null;
    var firstBdUsed = heroCompanion && heroCompanion._usedAsCompanion && heroLayout === 'split_with_breakdown';
    if (inlineBreakdown && breakdownSections.length > (firstBdUsed ? 1 : 0)) {
      var bdIdx = firstBdUsed ? 1 : 0;
      var inlineBd = JSON.parse(JSON.stringify(breakdownSections[bdIdx]));
      inlineBd.widgets[0].gridSpan = analysisLayout === 'three_col' ? 4 : 6;
      inlineBdSection = inlineBd;
    }

    // ── 3-column analysis row ────────────────────────────────────────
    // When analysisLayout === 'three_col' AND we have both inline comp
    // and inline breakdown, merge them into a single 3-col section with
    // a status table, alerts, or trend widget as the third column.
    if (analysisLayout === 'three_col' && inlineCompSection && inlineBdSection) {
      var thirdWidget = null;
      if (statusTableSection) {
        thirdWidget = JSON.parse(JSON.stringify(statusTableSection.widgets[0]));
        thirdWidget.gridSpan = 4;
        statusTableSection = null; // consumed
      } else if (alertFeedSection) {
        thirdWidget = JSON.parse(JSON.stringify(alertFeedSection.widgets[0]));
        thirdWidget.gridSpan = 4;
        alertFeedSection = null; // consumed
      }

      var threeColWidgets = [inlineBdSection.widgets[0], inlineCompSection.widgets[0]];
      if (thirdWidget) threeColWidgets.push(thirdWidget);

      var analysisSection = {
        chromosomeId: 'chromo.analysis_row',
        intent: 'วิเคราะห์องค์ประกอบและปัจจัยขับเคลื่อน',
        layoutHint: 'three-col',
        widgets: threeColWidgets
      };
      inlineCompSection = null;
      inlineBdSection = null;

      // Insert analysis section into monitor sections
      monitorSections.push(analysisSection);
    }

    // ── Assemble remaining Monitor sections ──────────────────────────
    var optionalMonitorSections = {
      trend_secondary: trendContextSection,
      bullet: bulletSection,
      status_table: statusTableSection,
      alerts: alertFeedSection
    };

    // Add inline sections that weren't merged into analysis row
    if (inlineCompSection) {
      optionalMonitorSections.inline_composition = inlineCompSection;
    }
    if (inlineBdSection) {
      optionalMonitorSections.inline_breakdown = inlineBdSection;
    }

    var sectionOrder = (template && template.sectionOrder) || ['trend_secondary', 'bullet', 'status_table', 'alerts'];
    // Extend section order to include inline sections
    if (sectionOrder.indexOf('inline_composition') === -1) sectionOrder.push('inline_composition');
    if (sectionOrder.indexOf('inline_breakdown') === -1) sectionOrder.push('inline_breakdown');

    sectionOrder.forEach(function (key) {
      if (optionalMonitorSections[key]) {
        monitorSections.push(optionalMonitorSections[key]);
        optionalMonitorSections[key] = null;
      }
    });
    Object.keys(optionalMonitorSections).forEach(function (key) {
      if (optionalMonitorSections[key]) monitorSections.push(optionalMonitorSections[key]);
    });

    // ── Summary strip (bottom highlight KPI cards) ───────────────────
    if (showSummaryStrip && decisions.length >= 3) {
      var stripDecisions = decisions.slice(0, Math.min(4, decisions.length));
      var stripWidgets = stripDecisions.map(function (d) {
        var b = bindingById[d.kpiId];
        var series = seriesByKpiId[d.kpiId];
        var status = computeKpiStatus(b, series);
        return {
          geneId: 'gene.highlight_card',
          component: 'highlight-card',
          gridSpan: 3,
          kpiId: d.kpiId,
          nameTH: b.nameTH,
          value: b.value,
          format: b.format,
          direction: b.direction,
          status: status,
          deltaPct: status.pct != null ? status.pct : null,
          question: d.question,
          because: ledgerFor(b, 'ev:summary-strip')
        };
      });
      monitorSections.push({
        chromosomeId: 'chromo.summary_strip',
        intent: 'ไฮไลท์สำคัญ',
        layoutHint: 'highlight-row',
        widgets: stripWidgets
      });
    }

    if (monitorSections.length > 0) {
      var monitorName = (template && template.pageNames && template.pageNames.monitor) || 'Monitor';
      pages.push({ id: 'page.monitor', name: monitorName, purpose: 'What is happening now', sections: monitorSections });
    }

    // ────────────────────────────────────────────────────────────────────
    //  BUILD DIAGNOSE PAGE
    // ────────────────────────────────────────────────────────────────────
    var diagnoseSections = [];

    // Remaining breakdowns (not inlined to Monitor, not used as companion)
    breakdownSections.forEach(function (bdSec, idx) {
      var skip = false;
      if (firstBdUsed && idx === 0) skip = true;
      if (inlineBreakdown && idx <= (firstBdUsed ? 1 : 0)) skip = true;
      if (!skip) {
        bdSec.widgets[0].gridSpan = idx === 0 ? 12 : 6;
        diagnoseSections.push(bdSec);
      }
    });

    // Remaining compositions (not inlined, not used as companion)
    compositionWidgets.forEach(function (cw, idx) {
      var skip = false;
      if (firstCompUsed && idx === 0) skip = true;
      if (inlineComposition && idx <= (firstCompUsed ? 1 : 0)) skip = true;
      if (!skip) {
        diagnoseSections.push({
          chromosomeId: 'chromo.composition',
          intent: 'สัดส่วนของ ' + cw.nameTH + ' แยกตาม ' + cw.dimensionColumn,
          layoutHint: 'composition',
          widgets: [cw]
        });
      }
    });

    // ── chromo.composition_over_time / chromo.matrix_density ──────────
    if (hasTimeAxis) {
      var stackedDone = false;
      for (var st = 0; st < decisions.length && !stackedDone; st++) {
        var stDecision = decisions[st];
        var stBinding = bindingById[stDecision.kpiId];
        if (!stBinding || stBinding.aggNature !== 'extensive') continue;
        var stDef = kpiDefById[stDecision.kpiId] || null;
        var stExclude = Object.keys(stBinding.boundColumns || {}).map(function (k) { return stBinding.boundColumns[k]; });
        stExclude.push(timeCol);
        var stDims = window.iDashKpiEngine.detectDimensionColumns(dataset, stExclude);
        var stDim = stDims[0];
        if (!stDim) continue;

        var probe = window.iDashKpiEngine.computeDimensionBreakdown(stBinding, stDef, dataset, stDim, 8);
        var probeReal = probe.filter(function (g) { return !g.isOthers; });

        if (probeReal.length >= 2 && probeReal.length <= 5) {
          var stMatrix = partsOverTime(stBinding, stDef, dataset, stDim, timeCol, grain, 5);
          if (stMatrix.periods.length >= MIN_TREND_POINTS) {
            diagnoseSections.push({
              chromosomeId: 'chromo.composition_over_time',
              intent: 'องค์ประกอบของ ' + stBinding.nameTH + ' ตามช่วงเวลา แยกตาม ' + stDim,
              layoutHint: 'full-width',
              widgets: [{
                geneId: 'gene.stacked_time',
                component: 'stacked-time',
                chart: 'stackedbar',
                gridSpan: 12,
                kpiId: stDecision.kpiId,
                nameTH: stBinding.nameTH + ' แยกตาม ' + stDim,
                dimensionColumn: stDim,
                format: stBinding.format,
                periods: stMatrix.periods,
                parts: stMatrix.parts,
                question: 'ส่วนไหนของ ' + stDim + ' ขับเคลื่อน ' + stBinding.nameTH + ' ในแต่ละช่วง',
                because: ledgerFor(stBinding, 'ev:parts(' + probeReal.length + ')×time(' + stMatrix.periods.length + '), doc06:stacked≤5')
              }]
            });
            stackedDone = true;
          }
        } else if (probeReal.length >= 4 && probeReal.length <= 8) {
          var hmMatrix = partsOverTime(stBinding, stDef, dataset, stDim, timeCol, grain, 8);
          if (hmMatrix.periods.length >= 4) {
            var cells = [];
            hmMatrix.parts.forEach(function (p, yi) {
              p.values.forEach(function (v, xi) {
                if (v !== null && v !== 0) cells.push([xi, yi, Math.round(v * 100) / 100]);
              });
            });
            diagnoseSections.push({
              chromosomeId: 'chromo.matrix_density',
              intent: 'ความหนาแน่นของ ' + stBinding.nameTH + ' — ' + stDim + ' × ช่วงเวลา',
              layoutHint: 'full-width',
              widgets: [{
                geneId: 'gene.heatmap_matrix',
                component: 'heatmap',
                chart: 'heatmap',
                gridSpan: 12,
                kpiId: stDecision.kpiId,
                nameTH: stBinding.nameTH + ' — ' + stDim + ' × เวลา',
                dimensionColumn: stDim,
                format: stBinding.format,
                xLabels: hmMatrix.periods,
                yLabels: hmMatrix.parts.map(function (p) { return p.name; }),
                cells: cells,
                question: 'ช่วงเวลาไหน กลุ่มไหน ที่ ' + stBinding.nameTH + ' หนาแน่นผิดปกติ',
                because: ledgerFor(stBinding, 'ev:matrix(' + hmMatrix.parts.length + '×' + hmMatrix.periods.length + '), doc06:heatmap-sequential')
              }]
            });
            stackedDone = true;
          }
        }
      }
    }

    // ── chromo.composition_treemap (doc 06: composition 7+ parts) ─────
    var treemapDone = false;
    for (var tm = 0; tm < decisions.length && !treemapDone; tm++) {
      var tmDecision = decisions[tm];
      var tmBinding = bindingById[tmDecision.kpiId];
      if (!tmBinding || tmBinding.aggNature !== 'extensive') continue;
      var tmDef = kpiDefById[tmDecision.kpiId] || null;
      var tmExclude = Object.keys(tmBinding.boundColumns || {}).map(function (k) { return tmBinding.boundColumns[k]; });
      if (timeCol) tmExclude.push(timeCol);
      var tmDims = window.iDashKpiEngine.detectDimensionColumns(dataset, tmExclude);
      for (var td = 0; td < tmDims.length && !treemapDone; td++) {
        var tmBreakdown = window.iDashKpiEngine.computeDimensionBreakdown(tmBinding, tmDef, dataset, tmDims[td], 15);
        var tmReal = tmBreakdown.filter(function (g) { return !g.isOthers && g.value > 0; });
        if (tmReal.length < 7 || tmReal.length > 15) continue;
        diagnoseSections.push({
          chromosomeId: 'chromo.composition_treemap',
          intent: 'สัดส่วนของ ' + tmBinding.nameTH + ' แยกตาม ' + tmDims[td] + ' (' + tmReal.length + ' กลุ่ม)',
          layoutHint: 'half-width',
          widgets: [{
            geneId: 'gene.treemap',
            component: 'treemap',
            chart: 'treemap',
            gridSpan: 6,
            kpiId: tmDecision.kpiId,
            nameTH: tmBinding.nameTH + ' แยกตาม ' + tmDims[td],
            dimensionColumn: tmDims[td],
            format: tmBinding.format,
            groups: tmReal,
            question: 'กลุ่มไหนกินสัดส่วน ' + tmBinding.nameTH + ' มากที่สุด',
            because: ledgerFor(tmBinding, 'ev:composition.parts(' + tmReal.length + '), doc06:treemap7+')
          }]
        });
        treemapDone = true;
      }
    }

    // ── chromo.relationship_distribution (scatter + histogram) ────────
    var analyticWidgets = [];
    var measureCols = [];
    var measureSeen = {};
    bindings.forEach(function (b) {
      Object.keys(b.boundColumns || {}).forEach(function (k) {
        var col = b.boundColumns[k];
        if (col && !measureSeen[col]) { measureSeen[col] = b; measureCols.push(col); }
      });
    });

    var scatterDone = false;
    for (var sa = 0; sa < measureCols.length && !scatterDone; sa++) {
      for (var sb = sa + 1; sb < measureCols.length && !scatterDone; sb++) {
        var corr = pearson(dataset.data, measureCols[sa], measureCols[sb]);
        if (!corr || Math.abs(corr.r) < 0.45) continue;
        var rRounded = Math.round(corr.r * 100) / 100;
        analyticWidgets.push({
          geneId: 'gene.scatter_relation',
          component: 'scatter',
          chart: 'scatter',
          gridSpan: 6,
          nameTH: measureCols[sa] + ' เทียบกับ ' + measureCols[sb] + ' (r = ' + rRounded + ')',
          xName: measureCols[sa],
          yName: measureCols[sb],
          points: scatterPoints(dataset.data, measureCols[sa], measureCols[sb], 300),
          r: rRounded,
          n: corr.n,
          question: 'สองตัวแปรนี้สัมพันธ์กันจริงหรือไม่ (สหสัมพันธ์ไม่ใช่เหตุ-ผลเสมอไป)',
          because: ['ev:pearson.r=' + rRounded + ',n=' + corr.n, 'doc06:scatter-r-cited']
        });
        scatterDone = true;
      }
    }

    if (dataset.data.length >= 30) {
      var histBinding = bindings.filter(function (b) {
        return b.boundColumns && b.boundColumns.measure && b.aggNature === 'intensive';
      })[0] || bindings.filter(function (b) { return b.boundColumns && b.boundColumns.measure; })[0];
      if (histBinding) {
        var histCol = histBinding.boundColumns.measure;
        var histVals = [];
        for (var hv = 0; hv < dataset.data.length; hv++) {
          var hn = window.iDashKpiEngine.toNumber(dataset.data[hv][histCol]);
          if (!isNaN(hn)) histVals.push(hn);
        }
        if (histVals.length >= 30) {
          var hMin = Math.min.apply(null, histVals), hMax = Math.max.apply(null, histVals);
          var binCount = 8;
          var binWidth = (hMax - hMin) / binCount || 1;
          var histBins = [];
          for (var hb = 0; hb < binCount; hb++) histBins.push(0);
          histVals.forEach(function (v) {
            var idx = Math.min(binCount - 1, Math.floor((v - hMin) / binWidth));
            histBins[idx]++;
          });
          analyticWidgets.push({
            geneId: 'gene.histogram',
            component: 'histogram',
            chart: 'histogram',
            gridSpan: 6,
            nameTH: 'การกระจายของ ' + histCol,
            measureName: histCol,
            bins: histBins.map(function (count, i) {
              return { from: hMin + i * binWidth, to: hMin + (i + 1) * binWidth, count: count };
            }),
            question: 'ค่า ' + histCol + ' กระจุกตัวอยู่ช่วงไหน มีค่าผิดปกติหรือไม่',
            because: ['ev:distribution.n=' + histVals.length, 'doc06:histogram-n≥30']
          });
        }
      }
    }

    if (analyticWidgets.length > 0) {
      diagnoseSections.push({
        chromosomeId: 'chromo.relationship_distribution',
        intent: 'ความสัมพันธ์และการกระจายของข้อมูล',
        layoutHint: 'side-by-side',
        widgets: analyticWidgets
      });
    }

    // ── Gaps ──────────────────────────────────────────────────────────
    if (gaps && gaps.length > 0) {
      var gapWidgets = gaps.slice(0, MAX_GAP_CARDS).map(function (g) {
        return {
          geneId: 'gene.gap_card',
          component: 'gap-card',
          gridSpan: 6,
          question: g.question,
          kpiName: g.kpiName,
          missing: g.missing,
          because: ['gap:' + g.kpiId]
        };
      });
      diagnoseSections.push({ chromosomeId: 'gaps', intent: 'คำถามที่ข้อมูลชุดนี้ยังตอบไม่ได้', layoutHint: 'side-by-side', widgets: gapWidgets });
    }

    // ── Page assembly — respect template pageCount ─────────────────
    if (pageCount === 1) {
      // Single page: merge all diagnose sections into monitor
      diagnoseSections.forEach(function (sec) { monitorSections.push(sec); });
      diagnoseSections = [];
    }

    if (diagnoseSections.length > 0) {
      var diagnoseName = (template && template.pageNames && template.pageNames.diagnose) || 'Diagnose';
      pages.push({ id: 'page.diagnose', name: diagnoseName, purpose: 'Why is it happening', sections: diagnoseSections });
    }

    // ── chromo.detail_table ──────────────────────────────────────────
    if (pageCount >= 3) {
      var detailColumns = dataset.columns.slice(0, 12);
      var detailRows = dataset.data.slice(0, 50);
      if (detailColumns.length > 0 && detailRows.length > 0) {
        var detailName = (template && template.pageNames && template.pageNames.detail) || 'Detail';
        pages.push({
          id: 'page.detail',
          name: detailName,
          purpose: 'Raw data lookup',
          sections: [{
            chromosomeId: 'chromo.detail_table',
            intent: 'ตารางข้อมูลดิบ — ' + dataset.data.length + ' แถว × ' + dataset.columns.length + ' คอลัมน์',
            layoutHint: 'full-width',
            widgets: [{
              geneId: 'gene.data_table',
              component: 'data-table',
              gridSpan: 12,
              columns: detailColumns,
              rows: detailRows,
              totalRows: dataset.data.length,
              totalColumns: dataset.columns.length,
              question: 'ข้อมูลดิบมีหน้าตาอย่างไร',
              because: ['ev:detail-lookup,doc07:detail-always-last']
            }]
          }]
        });
      }
    }

    return {
      pages: pages,
      meta: {
        hasTimeAxis: hasTimeAxis,
        timeColumn: hasTimeAxis ? timeCol : null,
        grain: grain,
        generatedAt: new Date().toISOString()
      }
    };
  }

  window.iDashComposer = {
    buildDashboardSpec: buildDashboardSpec
  };
})();
