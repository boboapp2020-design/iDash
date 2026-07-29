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
   * @param {Array} [sheetNames] — dataset.sheetNames, for workbooks whose
   *   identity lives in their tab names rather than one sheet's headers
   * @returns {{entry: Object, score: number, by: 'columns'|'sheets'}|null}
   *
   * A fingerprint may list `columns`, `sheets`, or both. Sheet matching exists
   * because some curated dashboards read the whole workbook: which sheet the
   * profiler happened to pick says nothing about the file, but a tab list like
   * ["รายงานสรุป RE-PACKING", "บรรจุ ย่อย", …] identifies it unambiguously.
   */
  function match(datasetColumns, sheetNames) {
    var entries = window.iDashKnownDatasetEntries || [];
    if (entries.length === 0) return null;

    var uploaded = {};
    colNames(datasetColumns).forEach(function (n) { if (n) uploaded[n] = true; });
    var tabs = {};
    (sheetNames || []).forEach(function (s) {
      var n = normalizeCol(s); if (n) tabs[n] = true;
    });

    function coverageOf(want, haveMap) {
      if (!want || want.length === 0) return null;
      var hit = 0;
      want.forEach(function (w) { if (haveMap[normalizeCol(w)]) hit++; });
      return hit / want.length;
    }

    var best = null;
    entries.forEach(function (entry) {
      var fp = entry.fingerprint || {};
      var threshold = typeof fp.requiredCoverage === 'number' ? fp.requiredCoverage : 0.85;

      var byCols = coverageOf(fp.columns, uploaded);
      var bySheets = coverageOf(fp.sheets, tabs);

      // Take whichever signal is stronger; either alone can qualify.
      var score = null, by = null;
      if (bySheets !== null && (byCols === null || bySheets >= byCols)) { score = bySheets; by = 'sheets'; }
      else if (byCols !== null) { score = byCols; by = 'columns'; }
      if (score === null || score < threshold) return;

      var size = ((fp.columns || []).length + (fp.sheets || []).length);
      var bestSize = best
        ? (((best.entry.fingerprint.columns || []).length) + ((best.entry.fingerprint.sheets || []).length))
        : -1;
      if (!best || score > best.score || (score === best.score && size > bestSize)) {
        best = { entry: entry, score: score, by: by };
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
    // Map normalized name → the dataset's ACTUAL header. Existence was already
    // checked case-insensitively; the aggregators downstream look the column up
    // by exact key, so a blueprint written as 'ccs' against a 'CCS' header used
    // to pass validation and then silently compute 0. Resolving to the real
    // header here removes that whole class of mistake for future entries.
    var actual = {};
    (datasetColumns || []).forEach(function (c) {
      var raw = typeof c === 'string' ? c : (c && c.name);
      var n = normalizeCol(raw);
      if (n && actual[n] === undefined) actual[n] = raw;
    });
    function resolve(col) { return col == null ? col : actual[normalizeCol(col)]; }
    function ok(col) { return col == null || actual[normalizeCol(col)] !== undefined; }

    var kpis = (blueprint.kpis || [])
      .filter(function (k) { return k.col != null && ok(k.col); })
      .map(function (k) {
        var out = {}; for (var p in k) if (Object.prototype.hasOwnProperty.call(k, p)) out[p] = k[p];
        out.col = resolve(k.col);
        return out;
      });

    var chartPlan = (blueprint.chartPlan || []).filter(function (p) {
      if (!ok(p.timeCol) || !ok(p.textCol) || !ok(p.numCol)) return false;
      var nc = p.numCols || [];
      for (var i = 0; i < nc.length; i++) { if (!ok(nc[i])) return false; }
      return true;
    }).map(function (p) {
      var out = {}; for (var q in p) if (Object.prototype.hasOwnProperty.call(p, q)) out[q] = p[q];
      if (p.timeCol != null) out.timeCol = resolve(p.timeCol);
      if (p.textCol != null) out.textCol = resolve(p.textCol);
      if (p.numCol != null) out.numCol = resolve(p.numCol);
      if (p.numCols) out.numCols = p.numCols.map(resolve);
      return out;
    });

    return { kpis: kpis, chartPlan: chartPlan, kpiMax: blueprint.kpiMax || (kpis.length || 4) };
  }

  window.iDashKnownDatasets = {
    normalizeCol: normalizeCol,
    match: match,
    validateBlueprint: validateBlueprint
  };
})();
