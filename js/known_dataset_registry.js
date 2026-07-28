/**
 * iDash Known-Dataset Matcher — pairs an uploaded file with a curated
 * dashboard blueprint from app/kb/known_datasets/registry.js (loaded first;
 * that file defines window.iDashKnownDatasetEntries).
 *
 * Matching is deterministic column-fingerprint coverage: for each registry
 * entry, coverage = |fingerprint ∩ uploaded columns| / |fingerprint|. The
 * best entry at or above its own requiredCoverage wins; ties break to the
 * larger (more specific) fingerprint. No LLM, no network — P4-deterministic.
 *
 * validateBlueprint() is the refusal-safety layer: a partial match (e.g. 85%)
 * means some blueprint bindings may reference columns the upload doesn't
 * actually have — those widgets/KPIs are DROPPED, never rendered broken.
 */
(function () {
  'use strict';

  // trim → lower → collapse all whitespace runs (incl. \r\n inside Excel
  // headers) to single spaces. Thai text passes through unchanged.
  function normalizeCol(name) {
    return String(name == null ? '' : name).replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function colNames(datasetColumns) {
    return (datasetColumns || []).map(function (c) {
      return normalizeCol(typeof c === 'string' ? c : (c && c.name));
    });
  }

  /**
   * @param {Array} datasetColumns — dataset.columns (strings or {name})
   * @returns {{entry: Object, score: number}|null}
   */
  function match(datasetColumns) {
    var entries = window.iDashKnownDatasetEntries || [];
    if (entries.length === 0) return null;
    var uploaded = {};
    colNames(datasetColumns).forEach(function (n) { if (n) uploaded[n] = true; });

    var best = null;
    entries.forEach(function (entry) {
      var fp = entry.fingerprint || {};
      var cols = (fp.columns || []).map(normalizeCol);
      if (cols.length === 0) return;
      var hit = 0;
      cols.forEach(function (c) { if (uploaded[c]) hit++; });
      var coverage = hit / cols.length;
      var threshold = typeof fp.requiredCoverage === 'number' ? fp.requiredCoverage : 0.85;
      if (coverage < threshold) return;
      if (!best || coverage > best.score ||
          (coverage === best.score && cols.length > (best.entry.fingerprint.columns || []).length)) {
        best = { entry: entry, score: coverage };
      }
    });
    return best;
  }

  /**
   * Returns a copy of the blueprint with every KPI / chart entry that
   * references a column missing from the actual upload removed. A chart
   * survives only if ALL its bound columns exist (timeCol, textCol, numCol
   * when non-null, every member of numCols).
   */
  function validateBlueprint(blueprint, datasetColumns) {
    var have = {};
    colNames(datasetColumns).forEach(function (n) { if (n) have[n] = true; });
    function ok(col) { return col == null || have[normalizeCol(col)] === true; }

    var kpis = (blueprint.kpis || []).filter(function (k) { return ok(k.col) && k.col != null; });
    var chartPlan = (blueprint.chartPlan || []).filter(function (p) {
      if (!ok(p.timeCol) || !ok(p.textCol) || !ok(p.numCol)) return false;
      var nc = p.numCols || [];
      for (var i = 0; i < nc.length; i++) { if (!ok(nc[i])) return false; }
      return true;
    });
    return { kpis: kpis, chartPlan: chartPlan, kpiMax: blueprint.kpiMax || (kpis.length || 4) };
  }

  window.iDashKnownDatasets = {
    normalizeCol: normalizeCol,
    match: match,
    validateBlueprint: validateBlueprint
  };
})();
