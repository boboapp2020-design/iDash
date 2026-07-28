/**
 * iDash Business Frame — module ③ (doc 02 §3)
 * AI Business Analyst: understands the dataset in business context.
 *
 * When the LLM Gateway is available, sends DataProfile + Domain Pack to
 * claude-sonnet-5 to produce a rich BusinessFrame (goals, audiences,
 * business questions, assumptions).
 *
 * When the gateway is unavailable (M3 blocked, offline, error), falls back
 * to deterministic domain-pack defaults — the stub that already powers
 * the M2 pipeline. The LLM upgrades quality; it is never load-bearing (P4).
 *
 * P6: only profiles, stats, and ≤ 12 categorical labels are sent.
 * D18: this counts as 1 of ≤ 3 LLM calls per run.
 *
 * Browser-compatible, no build step. Attaches window.iDashBusinessFrame.
 */
(function () {
  'use strict';

  // -------------------------------------------------------------------
  // 1. Gateway client
  // -------------------------------------------------------------------

  var GATEWAY_URL = null; // set via configure()
  var ANON_KEY = null;

  function configure(opts) {
    if (opts && opts.gatewayUrl) GATEWAY_URL = opts.gatewayUrl;
    if (opts && opts.anonKey) ANON_KEY = opts.anonKey;
  }

  /**
   * Call the LLM Gateway.
   * @returns {Promise<Object|null>} parsed result or null on failure
   */
  function callGateway(action, payload, runId) {
    if (!GATEWAY_URL) return Promise.resolve(null);

    return fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ANON_KEY,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({ action: action, payload: payload, runId: runId })
    })
    .then(function (resp) {
      if (!resp.ok) return null;
      return resp.json();
    })
    .then(function (data) {
      return data && data.result ? data.result : null;
    })
    .catch(function () {
      return null;
    });
  }

  // -------------------------------------------------------------------
  // 2. Profile summarizer — builds LLM-safe payload from dataset (P6)
  // -------------------------------------------------------------------

  function summarizeProfile(dataset) {
    var columns = dataset.columns || [];
    var data = dataset.data || [];
    var rowCount = data.length;

    var columnProfiles = columns.map(function (col) {
      var values = data.map(function (r) { return r[col]; }).filter(function (v) { return v != null; });
      var numericValues = values.filter(function (v) { return !isNaN(Number(v)); }).map(Number);
      var textValues = values.filter(function (v) { return isNaN(Number(v)); });
      var isNumeric = numericValues.length > values.length * 0.6;

      var profile = {
        name: col,
        type: isNumeric ? 'numeric' : 'text',
        nonNull: values.length,
        missing: rowCount - values.length
      };

      if (isNumeric && numericValues.length > 0) {
        numericValues.sort(function (a, b) { return a - b; });
        profile.min = numericValues[0];
        profile.max = numericValues[numericValues.length - 1];
        profile.mean = Math.round(numericValues.reduce(function (s, v) { return s + v; }, 0) / numericValues.length * 100) / 100;
        profile.median = numericValues[Math.floor(numericValues.length / 2)];
      } else if (textValues.length > 0) {
        // P6: ≤ 12 categorical labels only
        var unique = {};
        var uniqueList = [];
        for (var i = 0; i < textValues.length && uniqueList.length <= 12; i++) {
          var v = String(textValues[i]).trim();
          if (!unique[v] && v.length > 0) {
            unique[v] = true;
            uniqueList.push(v);
          }
        }
        profile.cardinality = Object.keys(unique).length;
        profile.sampleLabels = uniqueList.slice(0, 12);
      }

      return profile;
    });

    return {
      rowCount: rowCount,
      columnCount: columns.length,
      columns: columnProfiles,
      filename: dataset.filename || '',
      sheetNames: dataset.sheetNames || [],
      isCrossTab: dataset.isCrossTab || false,
      multiSheet: dataset.multiSheet || false
    };
  }

  // -------------------------------------------------------------------
  // 3. Domain pack summarizer — extract business context for LLM
  // -------------------------------------------------------------------

  function summarizeDomainPack(pack) {
    if (!pack) return {};
    return {
      id: pack.id,
      nameTH: pack.identity ? pack.identity.nameTH : '',
      nameEN: pack.identity ? pack.identity.nameEN : '',
      processes: (pack.business && pack.business.processes) || [],
      goals: (pack.business && pack.business.goals) || [],
      personas: (pack.business && pack.business.personas) || [],
      decisionCatalog: (pack.business && pack.business.decisionCatalog) || [],
      seasonality: (pack.business && pack.business.seasonality) || ''
    };
  }

  // -------------------------------------------------------------------
  // 4. DET fallback — stub BusinessFrame from domain-pack defaults
  // -------------------------------------------------------------------

  function buildFallbackFrame(dataset, winnerPack, classResult) {
    var pack = winnerPack || {};
    var biz = pack.business || {};
    var personas = biz.personas || [];
    var goals = biz.goals || [];
    var domainId = pack.id || 'generic_business';

    var audiences = personas.map(function (p) {
      return { type: p.type, confidence: 0.7 };
    });
    if (audiences.length === 0) {
      audiences = [{ type: 'executive', confidence: 0.5 }];
    }

    var businessGoals = goals.map(function (g) {
      return { goal: g, because: ['kb:domain.' + domainId + '.goal'] };
    });
    if (businessGoals.length === 0) {
      businessGoals = [{ goal: 'understand key metrics and trends', because: ['ev:profile.generic'] }];
    }

    var decisionCatalog = biz.decisionCatalog || [];
    var businessQuestions = [];
    for (var i = 0; i < Math.min(decisionCatalog.length, 5); i++) {
      businessQuestions.push({
        id: 'Q' + (i + 1),
        text: decisionCatalog[i],
        decision: decisionCatalog[i],
        audience: audiences[0].type,
        evidenceNeeded: []
      });
    }

    var processNarrative = '';
    if (biz.processes && biz.processes.length > 0) {
      var proc = biz.processes[0];
      processNarrative = (pack.identity ? pack.identity.nameTH : domainId) +
        ' — ' + (proc.stages || []).join(' → ');
    }

    return {
      domain: domainId,
      processNarrative: processNarrative,
      businessGoals: businessGoals,
      audiences: audiences,
      businessQuestions: businessQuestions,
      assumptions: ['ใช้ค่าเริ่มต้นจาก Domain Pack (LLM ยังไม่พร้อม)'],
      confidence: 0.6,
      source: 'det-fallback'
    };
  }

  // -------------------------------------------------------------------
  // 5. Validate LLM response shape
  // -------------------------------------------------------------------

  function validateBusinessFrame(frame) {
    if (!frame || typeof frame !== 'object') return false;
    if (!frame.domain || typeof frame.domain !== 'string') return false;
    if (!Array.isArray(frame.businessGoals)) return false;
    if (!Array.isArray(frame.audiences)) return false;
    if (!Array.isArray(frame.businessQuestions)) return false;
    // Check at least one goal has because[]
    var hasCitation = frame.businessGoals.some(function (g) {
      return Array.isArray(g.because) && g.because.length > 0;
    });
    if (!hasCitation) return false;
    return true;
  }

  // -------------------------------------------------------------------
  // 6. Public entry point
  // -------------------------------------------------------------------

  /**
   * Build a BusinessFrame — tries LLM first, falls back to DET stub.
   *
   * @param {Object} dataset       — parsed dataset from profiler
   * @param {Object} winnerPack    — winning domain pack from classifier
   * @param {Object} classResult   — classifier result (winner, scores, evidence)
   * @param {Object} [opts]        — { runId: string }
   * @returns {Promise<Object>}    — BusinessFrame
   */
  function buildBusinessFrame(dataset, winnerPack, classResult, opts) {
    opts = opts || {};
    var runId = opts.runId || null;

    // Always compute the fallback first (guaranteed result)
    var fallback = buildFallbackFrame(dataset, winnerPack, classResult);

    if (!GATEWAY_URL) {
      return Promise.resolve(fallback);
    }

    // Build P6-safe payload
    var payload = {
      dataProfile: summarizeProfile(dataset),
      domainPack: summarizeDomainPack(winnerPack),
      classifierEvidence: classResult ? {
        winner: classResult.winner,
        topScores: (classResult.scores || []).slice(0, 5)
      } : {}
    };

    return callGateway('business-frame', payload, runId)
      .then(function (llmFrame) {
        if (llmFrame && validateBusinessFrame(llmFrame)) {
          llmFrame.source = 'llm';
          return llmFrame;
        }
        return fallback;
      })
      .catch(function () {
        return fallback;
      });
  }

  // -------------------------------------------------------------------
  // Exports
  // -------------------------------------------------------------------

  window.iDashBusinessFrame = {
    configure: configure,
    buildBusinessFrame: buildBusinessFrame,
    summarizeProfile: summarizeProfile,
    // Exposed for testing
    _buildFallbackFrame: buildFallbackFrame,
    _validateBusinessFrame: validateBusinessFrame
  };
})();
