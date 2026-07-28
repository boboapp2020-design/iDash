/**
 * iDash Insight Engine — module ⑨ (doc 02 §3)
 * Two halves:
 *   DET: computes fact base from KPI bindings + dataset (top/bottom, share,
 *        trend, concentration, contribution analysis, target variance).
 *   LLM: narrates over the fact base with citation enforcement (D17).
 *
 * When the LLM Gateway is unavailable, produces DET template narration
 * (the current M2 quality level). The LLM upgrades prose fluency and
 * domain-aware recommendations — it is never load-bearing (P4 fallback).
 *
 * P6: only computed facts reach the LLM, never raw rows.
 * D17: every narrative sentence must cite fact IDs.
 * D18: this counts as 1 of ≤ 3 LLM calls per run.
 *
 * Browser-compatible, no build step. Attaches window.iDashInsightEngine.
 */
(function () {
  'use strict';

  var GATEWAY_URL = null;
  var ANON_KEY = null;

  function configure(opts) {
    if (opts && opts.gatewayUrl) GATEWAY_URL = opts.gatewayUrl;
    if (opts && opts.anonKey) ANON_KEY = opts.anonKey;
  }

  // -------------------------------------------------------------------
  // 1. DET Fact Computation
  // -------------------------------------------------------------------

  var factCounter = 0;
  function nextFactId() { return 'F' + (++factCounter); }
  function resetFactCounter() { factCounter = 0; }

  /**
   * Compute the full fact base from KPI bindings and dataset.
   * Each fact has: { id, type, kpiId?, text, value, meta }
   */
  function computeFactBase(kpiBindings, dataset, kpiDefById) {
    resetFactCounter();
    var facts = [];
    var data = dataset.data || [];
    var rowCount = data.length;

    if (rowCount === 0) return facts;

    // -- Dataset-level facts --
    facts.push({
      id: nextFactId(),
      type: 'dataset_size',
      text: 'ชุดข้อมูลมี ' + rowCount + ' แถว ' + (dataset.columns || []).length + ' คอลัมน์',
      value: rowCount,
      meta: { columns: (dataset.columns || []).length }
    });

    // -- Per-KPI facts --
    for (var i = 0; i < kpiBindings.length; i++) {
      var kpi = kpiBindings[i];
      var def = kpiDefById ? kpiDefById[kpi.kpiId] : null;
      // Prefer the binding's display name (always Thai-readable) over the raw
      // kpiId — derived KPIs have no def and their ids are sanitized junk.
      var kpiName = kpi.nameTH || (def && def.name && def.name.th) || kpi.kpiId;

      // Fact: current value
      if (kpi.value != null) {
        facts.push({
          id: nextFactId(),
          type: 'kpi_value',
          kpiId: kpi.kpiId,
          text: kpiName + ' = ' + formatValue(kpi.value, def),
          value: kpi.value,
          meta: { format: def ? def.format : null }
        });
      }

      // Fact: target variance — target on a binding is either a plain number
      // or {benchmark:{good,warn}}; only emit the fact when a real numeric
      // benchmark exists and the math is finite (never narrate NaN%).
      var targetNum = typeof kpi.target === 'number' ? kpi.target :
        (kpi.target && kpi.target.benchmark && typeof kpi.target.benchmark.good === 'number'
          ? kpi.target.benchmark.good : null);
      if (targetNum != null && targetNum !== 0 && kpi.value != null) {
        var variance = kpi.value - targetNum;
        var variancePct = Math.round(variance / targetNum * 100);
        if (isFinite(variancePct)) {
          var direction = (kpi.direction || (def && def.direction)) === 'lower-better' ? -1 : 1;
          var status = (variance * direction >= 0) ? 'on_target' : 'below_target';
          facts.push({
            id: nextFactId(),
            type: 'target_variance',
            kpiId: kpi.kpiId,
            text: kpiName + ' ' + (status === 'on_target' ? 'เป็นไปตามเป้า' : 'ต่ำกว่าเป้า') +
                  ' (' + (variancePct >= 0 ? '+' : '') + variancePct + '%)',
            value: variancePct,
            meta: { status: status, actual: kpi.value, target: targetNum, kpiName: kpiName }
          });
        }
      }

      // Fact: trend (from kpi_engine trend computation)
      if (kpi.trend) {
        var trendText = kpi.trend.direction === 'up' ? 'มีแนวโน้มเพิ่มขึ้น' :
                        kpi.trend.direction === 'down' ? 'มีแนวโน้มลดลง' : 'ทรงตัว';
        facts.push({
          id: nextFactId(),
          type: 'trend',
          kpiId: kpi.kpiId,
          text: kpiName + ' ' + trendText +
                (kpi.trend.changePct != null ? ' (' + (kpi.trend.changePct >= 0 ? '+' : '') +
                 Math.round(kpi.trend.changePct) + '%)' : ''),
          value: kpi.trend.direction,
          meta: { changePct: kpi.trend.changePct, periods: kpi.trend.periods }
        });
      }

      // Fact: top contributors (breakdown by dimension)
      if (kpi.breakdown && kpi.breakdown.length > 0) {
        var top3 = kpi.breakdown.slice(0, 3);
        var totalBreakdown = kpi.breakdown.reduce(function (s, b) { return s + (b.value || 0); }, 0);
        facts.push({
          id: nextFactId(),
          type: 'top_contributors',
          kpiId: kpi.kpiId,
          text: kpiName + ' — สูงสุด: ' + top3.map(function (b) {
            var share = totalBreakdown > 0 ? Math.round(b.value / totalBreakdown * 100) : 0;
            return b.label + ' (' + share + '%)';
          }).join(', '),
          value: top3,
          meta: { total: totalBreakdown }
        });
      }

      // Fact: concentration (top-N share > 80% = concentrated)
      if (kpi.breakdown && kpi.breakdown.length >= 3) {
        var total = kpi.breakdown.reduce(function (s, b) { return s + (b.value || 0); }, 0);
        if (total > 0) {
          var cumulative = 0;
          var countFor80 = 0;
          for (var j = 0; j < kpi.breakdown.length; j++) {
            cumulative += kpi.breakdown[j].value || 0;
            countFor80++;
            if (cumulative / total >= 0.8) break;
          }
          if (countFor80 <= Math.ceil(kpi.breakdown.length * 0.3)) {
            facts.push({
              id: nextFactId(),
              type: 'concentration',
              kpiId: kpi.kpiId,
              text: kpiName + ' กระจุกตัว: ' + countFor80 + ' รายการจาก ' +
                    kpi.breakdown.length + ' รายการ คิดเป็น 80%+ ของทั้งหมด',
              value: { countFor80: countFor80, total: kpi.breakdown.length },
              meta: {}
            });
          }
        }
      }
    }

    // -- Cross-KPI correlation facts --
    var numericKpis = kpiBindings.filter(function (k) { return typeof k.value === 'number'; });
    if (numericKpis.length >= 2) {
      for (var a = 0; a < Math.min(numericKpis.length, 5); a++) {
        for (var b = a + 1; b < Math.min(numericKpis.length, 5); b++) {
          var corr = computeCorrelation(numericKpis[a], numericKpis[b], data);
          if (corr !== null && Math.abs(corr) > 0.7) {
            var aName = (kpiDefById && kpiDefById[numericKpis[a].kpiId]) ?
                        kpiDefById[numericKpis[a].kpiId].name.th : numericKpis[a].kpiId;
            var bName = (kpiDefById && kpiDefById[numericKpis[b].kpiId]) ?
                        kpiDefById[numericKpis[b].kpiId].name.th : numericKpis[b].kpiId;
            facts.push({
              id: nextFactId(),
              type: 'correlation',
              text: aName + ' และ ' + bName + ' มีความสัมพันธ์' +
                    (corr > 0 ? 'เชิงบวก' : 'เชิงลบ') +
                    ' (r=' + corr.toFixed(2) + ', ไม่ได้หมายถึงสาเหตุ)',
              value: corr,
              meta: { kpiA: numericKpis[a].kpiId, kpiB: numericKpis[b].kpiId }
            });
          }
        }
      }
    }

    return facts;
  }

  // -------------------------------------------------------------------
  // 2. Helper: Pearson correlation between two KPIs' bound columns
  // -------------------------------------------------------------------

  function computeCorrelation(kpiA, kpiB, data) {
    if (!kpiA.boundColumn || !kpiB.boundColumn) return null;
    var colA = kpiA.boundColumn;
    var colB = kpiB.boundColumn;

    var pairs = [];
    for (var i = 0; i < data.length; i++) {
      var va = Number(data[i][colA]);
      var vb = Number(data[i][colB]);
      if (!isNaN(va) && !isNaN(vb)) pairs.push([va, vb]);
    }
    if (pairs.length < 5) return null;

    var n = pairs.length;
    var sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
    for (var i = 0; i < n; i++) {
      sumA += pairs[i][0]; sumB += pairs[i][1];
      sumAB += pairs[i][0] * pairs[i][1];
      sumA2 += pairs[i][0] * pairs[i][0];
      sumB2 += pairs[i][1] * pairs[i][1];
    }
    var denom = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
    if (denom === 0) return null;
    return Math.round((n * sumAB - sumA * sumB) / denom * 100) / 100;
  }

  // -------------------------------------------------------------------
  // 3. Helper: format value for display
  // -------------------------------------------------------------------

  function formatValue(value, def) {
    if (value == null) return '-';
    if (def && def.format) {
      if (def.format.style === 'percent') return (value * 100).toFixed(1) + '%';
      if (def.format.style === 'currency') return value.toLocaleString() + ' ' + (def.format.unit || 'บาท');
      if (def.format.decimals != null) return value.toFixed(def.format.decimals);
    }
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
      if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K';
      return value % 1 === 0 ? String(value) : value.toFixed(2);
    }
    return String(value);
  }

  // -------------------------------------------------------------------
  // 4. DET template narration (fallback when LLM unavailable)
  // -------------------------------------------------------------------

  function buildTemplateNarration(facts, kpiBindings, domainNameTH) {
    var summary = [];
    var insights = [];
    var recommendations = [];
    var risks = [];

    // Executive summary from top facts
    var valueFacts = facts.filter(function (f) { return f.type === 'kpi_value'; });
    var trendFacts = facts.filter(function (f) { return f.type === 'trend'; });
    var varianceFacts = facts.filter(function (f) { return f.type === 'target_variance'; });

    if (valueFacts.length > 0) {
      summary.push('ข้อมูล' + domainNameTH + 'ประกอบด้วย KPI หลัก ' +
                   valueFacts.length + ' ตัว (' + valueFacts[0].id + ')');
    }

    // Top insights from trends and variances
    trendFacts.forEach(function (f) {
      if (f.value === 'up' || f.value === 'down') {
        insights.push({
          insight: f.text + ' (' + f.id + ')',
          severity: f.value === 'down' ? 'medium' : 'low',
          facts: [f.id]
        });
      }
    });

    varianceFacts.forEach(function (f) {
      if (f.meta && f.meta.status === 'below_target') {
        insights.push({
          insight: f.text + ' (' + f.id + ')',
          severity: 'high',
          facts: [f.id]
        });
      }
    });

    // Concentration insights
    var concFacts = facts.filter(function (f) { return f.type === 'concentration'; });
    concFacts.forEach(function (f) {
      insights.push({
        insight: f.text + ' (' + f.id + ')',
        severity: 'medium',
        facts: [f.id]
      });
    });

    // Recommendations from variances
    varianceFacts.forEach(function (f) {
      if (f.meta && f.meta.status === 'below_target') {
        recommendations.push({
          action: 'ตรวจสอบสาเหตุที่ ' + ((f.meta && f.meta.kpiName) || f.kpiId || 'KPI') + ' ต่ำกว่าเป้า',
          why: f.text + ' (' + f.id + ')',
          priority: 'high',
          facts: [f.id]
        });
      }
    });

    // Risks from negative trends
    trendFacts.forEach(function (f) {
      if (f.value === 'down') {
        risks.push({
          risk: f.text + ' อาจส่งผลต่อเป้าหมาย (' + f.id + ')',
          direction: 'down',
          facts: [f.id]
        });
      }
    });

    return {
      executiveSummary: summary.join(' ') || ('ภาพรวม' + domainNameTH + ' (' + (facts[0] ? facts[0].id : 'F1') + ')'),
      topInsights: insights.slice(0, 5),
      rootCauses: [],
      recommendations: recommendations.slice(0, 3),
      risks: risks.slice(0, 3),
      nextActions: recommendations.slice(0, 2).map(function (r) { return r.action + ' (' + r.facts[0] + ')'; }),
      source: 'det-template'
    };
  }

  // -------------------------------------------------------------------
  // 5. LLM narration (calls gateway when available)
  // -------------------------------------------------------------------

  function buildLLMNarration(facts, kpiBindings, domainContext, dashboardSpec, runId) {
    if (!GATEWAY_URL) return Promise.resolve(null);

    var payload = {
      factBase: facts.map(function (f) {
        return { id: f.id, type: f.type, text: f.text, value: f.value, kpiId: f.kpiId || null };
      }),
      domainContext: domainContext,
      kpiBindings: kpiBindings.map(function (k) {
        return { kpiId: k.kpiId, value: k.value, trend: k.trend || null };
      }),
      dashboardSpec: dashboardSpec ? { pageCount: (dashboardSpec.pages || []).length } : {}
    };

    return fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ANON_KEY,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({ action: 'insight-narration', payload: payload, runId: runId })
    })
    .then(function (resp) {
      if (!resp.ok) return null;
      return resp.json();
    })
    .then(function (data) {
      if (data && data.result) {
        data.result.source = 'llm';
        return data.result;
      }
      return null;
    })
    .catch(function () {
      return null;
    });
  }

  // -------------------------------------------------------------------
  // 6. Public entry points
  // -------------------------------------------------------------------

  /**
   * Compute the fact base (always DET, no LLM needed).
   * @param {Array} kpiBindings
   * @param {Object} dataset
   * @param {Object} kpiDefById
   * @returns {Array} facts with IDs
   */
  function computeFacts(kpiBindings, dataset, kpiDefById) {
    return computeFactBase(kpiBindings, dataset, kpiDefById || {});
  }

  /**
   * Generate the full insight story — facts + narration.
   * Tries LLM narration first, falls back to DET template.
   *
   * @param {Array} kpiBindings
   * @param {Object} dataset
   * @param {Object} kpiDefById
   * @param {Object} domainContext — { id, nameTH }
   * @param {Object} [dashboardSpec]
   * @param {Object} [opts] — { runId }
   * @returns {Promise<{facts: Array, narration: Object}>}
   */
  function generateInsights(kpiBindings, dataset, kpiDefById, domainContext, dashboardSpec, opts) {
    opts = opts || {};
    var facts = computeFactBase(kpiBindings, dataset, kpiDefById);
    var domainNameTH = domainContext ? domainContext.nameTH : 'ธุรกิจ';

    var templateNarration = buildTemplateNarration(facts, kpiBindings, domainNameTH);

    if (!GATEWAY_URL) {
      return Promise.resolve({ facts: facts, narration: templateNarration });
    }

    return buildLLMNarration(facts, kpiBindings, domainContext, dashboardSpec, opts.runId)
      .then(function (llmNarration) {
        return {
          facts: facts,
          narration: llmNarration || templateNarration
        };
      })
      .catch(function () {
        return { facts: facts, narration: templateNarration };
      });
  }

  window.iDashInsightEngine = {
    configure: configure,
    computeFacts: computeFacts,
    generateInsights: generateInsights,
    // Exposed for testing
    _buildTemplateNarration: buildTemplateNarration,
    _computeCorrelation: computeCorrelation
  };
})();
