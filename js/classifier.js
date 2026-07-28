/**
 * iDash Deterministic Domain Classifier
 * Implements doc 04 §3: lexicon + valueShape + unitPattern + negative scoring
 * with softmax-ish confidence, column-coverage penalty, and parent-pack fallback.
 *
 * Browser-compatible, no build step, no ES module syntax.
 * Attaches to window.iDashClassifier = { classify, profileDataset }.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Profile extraction
  // ---------------------------------------------------------------------------

  /**
   * Normalise a raw dataset object into the classifier's input format.
   *
   * Accepts two dataset shapes:
   *   Thai format:  { columns: ["col1", …], data: [{…}, …] }
   *   Global format: { columns: [{ name: "col1", type: "number" }, …], data: [{…}, …] }
   *
   * Returns { columns: string[], sampleValues: { [col]: any[] } }
   */
  function profileDataset(dataset, metadata) {
    var meta = metadata || {};
    var rows = [];
    var columns = [];

    if (dataset && dataset.columns && Array.isArray(dataset.columns)) {
      columns = dataset.columns.map(function (c) {
        return typeof c === 'string' ? c : (c && c.name ? c.name : String(c));
      });
      rows = Array.isArray(dataset.data) ? dataset.data : [];
    } else if (dataset) {
      if (Array.isArray(dataset)) {
        rows = dataset;
      } else if (dataset.data && Array.isArray(dataset.data)) {
        rows = dataset.data;
      } else if (dataset.rows && Array.isArray(dataset.rows)) {
        rows = dataset.rows;
      } else {
        var keys = Object.keys(dataset);
        for (var ki = 0; ki < keys.length; ki++) {
          var val = dataset[keys[ki]];
          if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
            rows = val;
            break;
          }
        }
      }
      if (columns.length === 0 && rows.length > 0) {
        columns = Object.keys(rows[0]);
      }
    }

    var sampleValues = {};
    var sampleSize = Math.min(rows.length, 20);
    for (var i = 0; i < columns.length; i++) {
      var col = columns[i];
      var vals = [];
      for (var r = 0; r < sampleSize; r++) {
        var row = rows[r];
        if (row && row[col] !== undefined && row[col] !== null) {
          vals.push(row[col]);
        }
      }
      sampleValues[col] = vals;
    }

    return {
      columns: columns,
      sampleValues: sampleValues,
      filename: meta.filename || (dataset && dataset.dataset_name ? dataset.dataset_name : ''),
      sheetNames: meta.sheetNames || [],
      datasetName: (dataset && dataset.dataset_name) ? dataset.dataset_name : ''
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Scoring helpers
  // ---------------------------------------------------------------------------

  /**
   * Term matching: short ASCII terms (≤4 chars) use word-boundary regex
   * to prevent "pol" matching "pollutant". Thai/Lao and longer terms
   * use substring matching.
   */
  function matchTerm(haystack, needle) {
    var nLower = needle.toLowerCase();
    if (nLower.length <= 4 && /^[a-z0-9]+$/.test(nLower)) {
      try {
        var escaped = nLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp('(?:^|[^a-z0-9_])' + escaped + '(?:$|[^a-z0-9_])', 'i').test(haystack);
      } catch (e) { return false; }
    }
    return haystack.toLowerCase().indexOf(nLower) !== -1;
  }

  /**
   * Check if a numeric value falls within [min, max].
   */
  function inRange(value, range) {
    var n = Number(value);
    if (isNaN(n)) return false;
    return n >= range[0] && n <= range[1];
  }

  /**
   * Score a single pack against a profile.
   * Returns { rawScore, normalizedScore, evidence[], hitColumns (Set) }.
   */
  function scorePack(pack, profile) {
    var sig = pack.signatures || {};
    var lexicon = sig.lexicon || {};
    var valueShapes = sig.valueShapes || [];
    var unitPatterns = sig.unitPatterns || [];
    var negatives = sig.negative || [];
    var weightPerHit = lexicon.weightPerHit || 1.0;

    var rawScore = 0;
    var evidence = [];
    var hitColumnSet = {};  // column name → true

    // --- Lexicon scoring ---
    var allTerms = [];
    var colTerms = lexicon.columns || {};
    var langs = Object.keys(colTerms);
    for (var li = 0; li < langs.length; li++) {
      var terms = colTerms[langs[li]];
      if (Array.isArray(terms)) {
        for (var ti = 0; ti < terms.length; ti++) {
          allTerms.push(terms[ti]);
        }
      }
    }

    // Count total unique lexicon terms for expectedMax
    var totalLexiconTerms = allTerms.length;

    for (var ti = 0; ti < allTerms.length; ti++) {
      var term = allTerms[ti];
      for (var ci = 0; ci < profile.columns.length; ci++) {
        var col = profile.columns[ci];
        if (matchTerm(col, term)) {
          rawScore += weightPerHit;
          hitColumnSet[col] = true;
          evidence.push({
            type: 'lexicon',
            pack: pack.id,
            term: term,
            column: col,
            weight: weightPerHit
          });
          // Count each column only once per term — break after first match
          break;
        }
      }
    }

    // --- Sheet/filename scoring ---
    var sheetTerms = lexicon.sheets || [];
    var sheetWeight = weightPerHit * 2.0;
    var filenameLC = (profile.filename || '').toLowerCase();
    var datasetNameLC = (profile.datasetName || '').toLowerCase();
    var sheetNamesLC = (profile.sheetNames || []).map(function(s) { return s.toLowerCase(); });

    for (var sti = 0; sti < sheetTerms.length; sti++) {
      var sTerm = sheetTerms[sti].toLowerCase();
      var sheetMatched = false;

      if (filenameLC && filenameLC.indexOf(sTerm) !== -1) sheetMatched = true;
      if (!sheetMatched && datasetNameLC && datasetNameLC.indexOf(sTerm) !== -1) sheetMatched = true;
      if (!sheetMatched) {
        for (var sni = 0; sni < sheetNamesLC.length; sni++) {
          if (sheetNamesLC[sni].indexOf(sTerm) !== -1) { sheetMatched = true; break; }
        }
      }

      if (sheetMatched) {
        rawScore += sheetWeight;
        evidence.push({
          type: 'sheet',
          pack: pack.id,
          term: sheetTerms[sti],
          column: '[filename/sheet]',
          weight: sheetWeight
        });
      }
    }

    // --- ValueShape scoring ---
    var totalValueShapeWeight = 0;
    for (var vi = 0; vi < valueShapes.length; vi++) {
      var vs = valueShapes[vi];
      totalValueShapeWeight += (vs.weight || 0);
      var regex;
      try {
        regex = new RegExp(vs.columnLike, 'i');
      } catch (e) {
        continue;
      }

      for (var ci = 0; ci < profile.columns.length; ci++) {
        var col = profile.columns[ci];
        if (regex.test(col)) {
          // Column name matches — check sample values
          var samples = profile.sampleValues[col] || [];
          var range = vs.range || [0, 0];
          var valueMatch = false;

          for (var si = 0; si < samples.length; si++) {
            if (inRange(samples[si], range)) {
              valueMatch = true;
              break;
            }
          }

          var appliedWeight = valueMatch ? vs.weight : vs.weight * 0.5;
          rawScore += appliedWeight;
          hitColumnSet[col] = true;
          evidence.push({
            type: 'valueShape',
            pack: pack.id,
            term: vs.columnLike,
            column: col,
            weight: appliedWeight,
            value: valueMatch ? 'range_match' : 'column_only'
          });
          // One match per valueShape rule is enough
          break;
        }
      }
    }

    // --- Unit pattern scoring ---
    for (var ui = 0; ui < unitPatterns.length; ui++) {
      var pattern = unitPatterns[ui];
      for (var ci = 0; ci < profile.columns.length; ci++) {
        var col = profile.columns[ci];
        if (matchTerm(col, pattern)) {
          rawScore += 1.0;
          hitColumnSet[col] = true;
          evidence.push({
            type: 'unit',
            pack: pack.id,
            term: pattern,
            column: col,
            weight: 1.0
          });
          break; // one column per pattern
        }
      }
    }

    // --- Negative scoring ---
    for (var ni = 0; ni < negatives.length; ni++) {
      var neg = negatives[ni];
      var negTerms = neg.lexicon || [];
      var negWeight = neg.weight || 0; // already negative

      for (var nti = 0; nti < negTerms.length; nti++) {
        var term = negTerms[nti];
        for (var ci = 0; ci < profile.columns.length; ci++) {
          var col = profile.columns[ci];
          if (matchTerm(col, term)) {
            rawScore += negWeight;
            evidence.push({
              type: 'negative',
              pack: pack.id,
              term: term,
              column: col,
              weight: negWeight
            });
            break; // one column per negative term
          }
        }
      }
    }

    // --- expectedMax (negatives don't count toward max) ---
    var expectedMax = (totalLexiconTerms * weightPerHit)
                    + (sheetTerms.length * sheetWeight)
                    + totalValueShapeWeight
                    + unitPatterns.length;
    // Guard against zero
    if (expectedMax <= 0) expectedMax = 1;

    var normalizedScore = rawScore / expectedMax;
    // Clamp to [0, 1] — negatives can drag raw below 0
    if (normalizedScore < 0) normalizedScore = 0;
    if (normalizedScore > 1) normalizedScore = 1;

    var hitColumns = Object.keys(hitColumnSet).length;

    return {
      rawScore: rawScore,
      normalizedScore: normalizedScore,
      evidence: evidence,
      hitColumns: hitColumns
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Main classify function
  // ---------------------------------------------------------------------------

  /**
   * Classify a dataset profile against an array of domain packs.
   *
   * @param {Object} profile  — { columns: string[], sampleValues: {} }
   * @param {Array}  packs    — domain pack objects (from KB JSON)
   * @returns {Object} { rankings, winner, evidence }
   */
  function classify(profile, packs) {
    if (!profile || !Array.isArray(packs) || packs.length === 0) {
      return {
        rankings: [],
        winner: { packId: 'generic_business', confidence: 0, accepted: false },
        evidence: []
      };
    }

    var totalColumns = profile.columns.length || 1;

    // Build a map packId → pack for parent lookups
    var packMap = {};
    for (var i = 0; i < packs.length; i++) {
      packMap[packs[i].id] = packs[i];
    }

    // Score each pack
    var results = [];
    var allEvidence = [];

    for (var i = 0; i < packs.length; i++) {
      var pack = packs[i];
      var result = scorePack(pack, profile);

      // Parent pack fallback: child score + parent score * 0.6
      if (pack.parent && packMap[pack.parent]) {
        var parentResult = scorePack(packMap[pack.parent], profile);
        result.rawScore += parentResult.rawScore * 0.6;
        // Recalculate normalised score with combined raw and combined expected max
        var parentSig = packMap[pack.parent].signatures || {};
        var parentLex = parentSig.lexicon || {};
        var parentTermCount = 0;
        var parentColTerms = parentLex.columns || {};
        var parentLangs = Object.keys(parentColTerms);
        for (var pl = 0; pl < parentLangs.length; pl++) {
          var arr = parentColTerms[parentLangs[pl]];
          if (Array.isArray(arr)) parentTermCount += arr.length;
        }
        var parentVSWeight = 0;
        var parentVS = parentSig.valueShapes || [];
        for (var pv = 0; pv < parentVS.length; pv++) {
          parentVSWeight += (parentVS[pv].weight || 0);
        }
        var parentUP = parentSig.unitPatterns || [];
        var parentExpMax = (parentTermCount * (parentLex.weightPerHit || 1))
                         + parentVSWeight
                         + parentUP.length;

        var sig = pack.signatures || {};
        var lex = sig.lexicon || {};
        var termCount = 0;
        var ct = lex.columns || {};
        var clangs = Object.keys(ct);
        for (var cl = 0; cl < clangs.length; cl++) {
          var a = ct[clangs[cl]];
          if (Array.isArray(a)) termCount += a.length;
        }
        var vsWeight = 0;
        var vs = sig.valueShapes || [];
        for (var v = 0; v < vs.length; v++) vsWeight += (vs[v].weight || 0);
        var up = sig.unitPatterns || [];
        var ownExpMax = (termCount * (lex.weightPerHit || 1)) + vsWeight + up.length;

        var combinedExpMax = ownExpMax + parentExpMax * 0.6;
        if (combinedExpMax <= 0) combinedExpMax = 1;
        result.normalizedScore = result.rawScore / combinedExpMax;
        if (result.normalizedScore < 0) result.normalizedScore = 0;
        if (result.normalizedScore > 1) result.normalizedScore = 1;

        // Merge parent hit columns
        for (var pe = 0; pe < parentResult.evidence.length; pe++) {
          var pev = parentResult.evidence[pe];
          if (pev.column) result.hitColumns = Math.max(result.hitColumns, result.hitColumns); // already counted
          // Tag parent evidence
          allEvidence.push({
            type: pev.type,
            pack: pack.id + ' (via parent ' + pack.parent + ')',
            term: pev.term,
            column: pev.column,
            weight: pev.weight * 0.6,
            value: pev.value
          });
        }

        // Merge parent hitColumns properly
        var parentHitCols = {};
        for (var pe = 0; pe < parentResult.evidence.length; pe++) {
          if (parentResult.evidence[pe].column) {
            parentHitCols[parentResult.evidence[pe].column] = true;
          }
        }
        var ownHitCols = {};
        for (var oe = 0; oe < result.evidence.length; oe++) {
          if (result.evidence[oe].column) {
            ownHitCols[result.evidence[oe].column] = true;
          }
        }
        // Union
        var allHitCols = {};
        var k;
        for (k in ownHitCols) allHitCols[k] = true;
        for (k in parentHitCols) allHitCols[k] = true;
        result.hitColumns = Object.keys(allHitCols).length;
      }

      // Append own evidence
      for (var e = 0; e < result.evidence.length; e++) {
        allEvidence.push(result.evidence[e]);
      }

      results.push({
        packId: pack.id,
        rawScore: result.rawScore,
        normalizedScore: result.normalizedScore,
        hitColumns: result.hitColumns,
        evidence: result.evidence
      });
    }

    // Ranking score: rawScore weighted by column coverage.
    // rawScore rewards evidence strength (via weightPerHit), coverage
    // rewards breadth (matching many columns vs just one lucky hit).
    // This prevents high-weight packs from winning on a single accidental match.
    for (var ri = 0; ri < results.length; ri++) {
      var coverage = Math.min(1, results[ri].hitColumns / totalColumns);
      results[ri].rankingScore = results[ri].rawScore * (0.3 + 0.7 * coverage);
    }

    results.sort(function (a, b) {
      if (b.rankingScore !== a.rankingScore) {
        return b.rankingScore - a.rankingScore;
      }
      return a.packId < b.packId ? -1 : (a.packId > b.packId ? 1 : 0);
    });

    // --- Confidence via softmax over top-5 raw scores ---
    var top5 = results.slice(0, 5);
    var expScores = [];
    var expSum = 0;
    for (var t = 0; t < top5.length; t++) {
      var ex = Math.exp(top5[t].rawScore);
      expScores.push(ex);
      expSum += ex;
    }

    var confidences = [];
    for (var t = 0; t < expScores.length; t++) {
      confidences.push(expSum > 0 ? expScores[t] / expSum : 0);
    }

    // Column coverage penalty: multiply confidence by min(1, hitColumns / totalColumns)
    var topResult = results[0] || { packId: 'generic_business', normalizedScore: 0, hitColumns: 0 };
    var coverageFactor = Math.min(1, topResult.hitColumns / totalColumns);
    var topConfidence = (confidences[0] || 0) * coverageFactor;

    // Acceptance thresholds: top-1 confidence >= 0.75 and gap >= 0.15
    var gap = confidences.length >= 2
      ? (confidences[0] || 0) - (confidences[1] || 0)
      : (confidences[0] || 0);

    // Apply coverage penalty to gap as well (it's derived from penalised confidence)
    var penalisedGap = gap * coverageFactor;

    var accepted = topConfidence >= 0.75 && penalisedGap >= 0.15;

    // Build rankings output
    var rankings = [];
    for (var r = 0; r < results.length; r++) {
      rankings.push({
        packId: results[r].packId,
        rawScore: Math.round(results[r].rawScore * 1000) / 1000,
        normalizedScore: Math.round(results[r].normalizedScore * 1000) / 1000,
        evidence: results[r].evidence
      });
    }

    return {
      rankings: rankings,
      winner: {
        packId: accepted ? topResult.packId : 'generic_business',
        confidence: Math.round(topConfidence * 1000) / 1000,
        accepted: accepted
      },
      evidence: allEvidence
    };
  }

  // ---------------------------------------------------------------------------
  // 4. Public API
  // ---------------------------------------------------------------------------

  window.iDashClassifier = {
    classify: classify,
    profileDataset: profileDataset
  };
})();
