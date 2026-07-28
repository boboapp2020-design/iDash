/**
 * iDash Decision Spec — module ⑤ (doc 02 §3)
 * Merges a stubbed BusinessFrame (domain-pack defaults — LLM ③ is stubbed
 * until D9/M3, per the P4 fallback law) with KPIBindings into a ranked
 * list of business decisions + page clusters. Unanswerable questions
 * (library KPIs that failed to bind) are surfaced as honest gaps (P2).
 *
 * Browser-compatible, no build step. Attaches window.iDashDecisionEngine.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // 1. Audience assignment — match a KPI name against pack personas
  // ---------------------------------------------------------------------

  function assignAudience(kpi, personas) {
    if (!personas || personas.length === 0) return { type: 'executive', cadence: '' };
    var nameLC = (kpi.nameTH + ' ' + kpi.nameEN).toLowerCase();
    for (var i = 0; i < personas.length; i++) {
      var cares = personas[i].cares || [];
      for (var c = 0; c < cares.length; c++) {
        if (nameLC.indexOf(String(cares[c]).toLowerCase()) !== -1) return personas[i];
      }
    }
    return personas[0];
  }

  var AUDIENCE_WEIGHT = { executive: 1.0, operational: 0.85, quality_lab: 0.8, maintenance: 0.75, agricultural: 0.75, analyst: 0.7 };

  // ---------------------------------------------------------------------
  // 2. Widget intent hint — feeds module ⑦⑧ (Composer / Viz rules)
  // ---------------------------------------------------------------------

  function widgetIntent(kpi) {
    if (kpi.target && kpi.target.policy && kpi.target.policy !== 'none' && kpi.target.benchmark && kpi.target.benchmark.good != null) {
      return 'target-attainment + trend';
    }
    if (kpi.derived) return 'kpi-card';
    return 'kpi-card + trend';
  }

  // ---------------------------------------------------------------------
  // 3. Business questions from bound KPIs (stubbed BusinessFrame source)
  // ---------------------------------------------------------------------

  var THAI_RE = /[฀-๿]/;

  /**
   * The KPI Library's `answers[]` (doc 05 §2) has no `th`/`en` split and is
   * English-only in the current seed content — synthesize a Thai question
   * from the KPI's own name/direction instead of leaking English into the
   * Thai-first UI (doc 01 north-star scenario is entirely Thai).
   */
  function synthesizeThaiQuestion(kpi) {
    if (kpi.direction === 'higher-better') return kpi.nameTH + 'เป็นไปตามเป้าหมายหรือไม่';
    if (kpi.direction === 'lower-better') return kpi.nameTH + 'อยู่ในระดับที่ควบคุมได้หรือไม่';
    return 'ภาพรวมของ' + kpi.nameTH + 'เป็นอย่างไร';
  }

  function questionsForBoundKpi(kpi, kpiDefById, personas) {
    var def = kpiDefById[kpi.kpiId];
    var hasThaiAnswers = def && def.answers && def.answers.some(function (a) { return THAI_RE.test(a); });
    var answers = hasThaiAnswers ? def.answers : [synthesizeThaiQuestion(kpi)];
    var audience = assignAudience(kpi, personas);
    // library-bound KPIs carry more business weight than structural fallbacks;
    // record_count is meta-information (always available, never the actual
    // business measure) and must never outrank a real derived measure.
    var impact = kpi.kpiId === 'derived.record_count' ? 0.3 : (kpi.derived ? 0.6 : 1.0);
    return answers.map(function (q) {
      return {
        question: q,
        answerable: true,
        evidence: ['kpi:' + kpi.kpiId],
        audience: audience.type,
        widgetIntent: widgetIntent(kpi),
        kpiId: kpi.kpiId,
        impact: impact,
        audienceWeight: AUDIENCE_WEIGHT[audience.type] || 0.6
      };
    });
  }

  // ---------------------------------------------------------------------
  // 4. Gaps — library KPIs that exist for this domain but didn't bind
  // ---------------------------------------------------------------------

  function findGaps(kpiDefs, boundKpiIds) {
    var gaps = [];
    for (var i = 0; i < (kpiDefs || []).length; i++) {
      var def = kpiDefs[i];
      if (boundKpiIds[def.id]) continue;
      var inputKeys = Object.keys(def.inputs || {});
      var hints = inputKeys.map(function (k) {
        var syn = def.inputs[k].synonyms || {};
        return (syn.th && syn.th[0]) || (syn.en && syn.en[0]) || k;
      });
      var defHasThaiAnswer = def.answers && def.answers.some(function (a) { return THAI_RE.test(a); });
      gaps.push({
        question: defHasThaiAnswer ? def.answers[0] : ('ภาพรวมของ' + def.name.th),
        kpiId: def.id,
        kpiName: def.name.th,
        missing: 'ไม่พบคอลัมน์: ' + hints.join(', ')
      });
    }
    return gaps;
  }

  // ---------------------------------------------------------------------
  // 5. Public entry point
  // ---------------------------------------------------------------------

  /**
   * @param {Array} kpiBindings — output of iDashKpiEngine.discoverKpis()
   * @param {Array} kpiDefs     — the full library considered for binding (doc 05 §8 scope)
   * @param {Object} winnerPack — the winning domain pack (for business.personas)
   * @returns {{decisions:Array, gaps:Array, pageClusters:Array}}
   */
  function buildDecisionSpec(kpiBindings, kpiDefs, winnerPack) {
    var personas = (winnerPack.business && winnerPack.business.personas) || [];
    var kpiDefById = {};
    (kpiDefs || []).forEach(function (d) { kpiDefById[d.id] = d; });

    var boundKpiIds = {};
    kpiBindings.forEach(function (b) { boundKpiIds[b.kpiId] = true; });

    var decisions = [];
    kpiBindings.forEach(function (kpi) {
      questionsForBoundKpi(kpi, kpiDefById, personas).forEach(function (q) { decisions.push(q); });
    });

    decisions.forEach(function (d) { d.score = d.impact * d.audienceWeight; });
    decisions.sort(function (a, b) { return b.score - a.score; });
    decisions.forEach(function (d, i) { d.rank = i + 1; });

    var gaps = findGaps(kpiDefs, boundKpiIds);

    var pageClusters = [
      { name: 'Monitor', decisions: decisions.slice(0, 4).map(function (d) { return d.question; }) }
    ];
    if (decisions.length > 4) {
      pageClusters.push({ name: 'Diagnose', decisions: decisions.slice(4).map(function (d) { return d.question; }) });
    }

    return { decisions: decisions, gaps: gaps, pageClusters: pageClusters };
  }

  window.iDashDecisionEngine = {
    buildDecisionSpec: buildDecisionSpec
  };
})();
