/**
 * iDash Dataset Understanding — module ① (lite)
 * Parses an uploaded file (xlsx/xls/csv/json) into a normalized dataset
 * { columns: string[], data: object[], sheetNames: string[], filename: string }
 * ready for window.iDashClassifier.profileDataset().
 *
 * Robustness features:
 *   - Header-row auto-detection (skips logo/title rows)
 *   - Multi-sheet: parses all sheets, picks the one with most data
 *   - Duplicate column names get unique suffixes
 *   - Cross-tab / matrix detection flag
 *   - Merged cell safe (SheetJS fills top-left only)
 *   - Handles wide files (50-200+ columns) gracefully
 *
 * Browser-compatible, no build step.
 */
(function () {
  'use strict';

  function isNumericCell(c) {
    return typeof c === 'number' || (String(c).trim() !== '' && !isNaN(Number(c)));
  }

  /**
   * Find the header row inside a raw 2D array: the first sufficiently-filled
   * row that is NOT numeric-dominant. Skips blank title rows above the real
   * header, AND skips a row of summary totals placed above a header (seen in
   * some Lao/Thai government exports — a merged-cell total row sitting above
   * a 2-level header would otherwise get read as the column names).
   */
  function findHeaderRowIndex(rows) {
    var candidates = [];
    for (var i = 0; i < Math.min(rows.length, 10); i++) {
      var row = rows[i] || [];
      var filled = row.filter(function (c) { return c !== undefined && c !== null && String(c).trim() !== ''; });
      if (filled.length < Math.max(2, Math.ceil(row.length * 0.5))) continue;
      var numericCount = filled.filter(isNumericCell).length;
      candidates.push({ idx: i, numericRatio: numericCount / filled.length });
    }
    if (candidates.length === 0) return 0;
    for (var k = 0; k < candidates.length; k++) {
      if (candidates[k].numericRatio < 0.5) return candidates[k].idx;
    }
    return candidates[0].idx;
  }

  /**
   * Detect and flatten a 2-level merged header: a group-label row (e.g.
   * "แผนอนุมัติ" spanning 2 columns) directly above the real header row
   * (e.g. "จำนวน" / "มูลค่า"). SheetJS only keeps a merged cell's value in
   * its top-left cell — the rest of the span reads back blank — so group
   * labels are forward-filled across their span before being joined with
   * the sub-header as "GroupLabel_SubLabel". Returns null when the row
   * above doesn't look like a group-label row (e.g. it's another data row,
   * or there's no row above).
   */
  function buildMergedHeaderNames(rows, headerIdx) {
    if (headerIdx === 0) return null;
    var headerRow = rows[headerIdx] || [];
    var aboveRow = rows[headerIdx - 1] || [];
    var aboveFilled = aboveRow.filter(function (c) { return c !== undefined && c !== null && String(c).trim() !== ''; });
    if (aboveFilled.length < 2) return null;
    var numericCount = aboveFilled.filter(isNumericCell).length;
    if (numericCount / aboveFilled.length > 0.3) return null;

    var width = Math.max(aboveRow.length, headerRow.length);
    var filledAbove = [];
    var last = '';
    for (var i = 0; i < width; i++) {
      var v = aboveRow[i];
      if (v !== undefined && v !== null && String(v).trim() !== '') last = String(v).trim();
      filledAbove.push(last);
    }

    return headerRow.map(function (c, i) {
      var sub = (c === undefined || c === null || String(c).trim() === '') ? '' : String(c).trim();
      var grp = filledAbove[i] || '';
      if (grp && sub) return grp + '_' + sub;
      return sub || grp;
    });
  }

  /**
   * De-duplicate column names: "Amount", "Amount" → "Amount", "Amount_2"
   */
  function deduplicateColumns(columns) {
    var seen = {};
    var result = [];
    for (var i = 0; i < columns.length; i++) {
      var name = columns[i];
      if (seen[name]) {
        seen[name]++;
        result.push(name + '_' + seen[name]);
      } else {
        seen[name] = 1;
        result.push(name);
      }
    }
    return result;
  }

  /**
   * Detect cross-tab / matrix format:
   * Column A = category labels, columns B-N = time periods or numeric measures.
   * Heuristic: first column is mostly text, remaining columns are >70% numeric,
   * AND at least 3 of those column headers look like dates/months/years.
   */
  function detectCrossTab(columns, data) {
    if (columns.length < 3 || data.length < 2) return false;

    var sampleSize = Math.min(data.length, 20);

    var firstColTextCount = 0;
    for (var r = 0; r < sampleSize; r++) {
      var val = data[r][columns[0]];
      if (val !== null && val !== undefined && isNaN(Number(val))) {
        firstColTextCount++;
      }
    }
    if (firstColTextCount < sampleSize * 0.6) return false;

    var numericColCount = 0;
    var dateHeaderCount = 0;
    var datePattern = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|ม\.?ค|ก\.?พ|มี\.?ค|เม\.?ย|พ\.?ค|มิ\.?ย|ก\.?ค|ส\.?ค|ก\.?ย|ต\.?ค|พ\.?ย|ธ\.?ค|20\d{2}|25\d{2}|\d{1,2}\/\d{2,4})/i;

    for (var c = 1; c < columns.length; c++) {
      var numCount = 0;
      for (var r = 0; r < sampleSize; r++) {
        var val = data[r][columns[c]];
        if (val !== null && val !== undefined && !isNaN(Number(val))) {
          numCount++;
        }
      }
      if (numCount >= sampleSize * 0.7) numericColCount++;
      if (datePattern.test(String(columns[c]).trim())) dateHeaderCount++;
    }

    var remainingCols = columns.length - 1;
    return numericColCount >= remainingCols * 0.7 && dateHeaderCount >= 3;
  }

  function rowsToDataset(rows) {
    if (!rows || rows.length === 0) return { columns: [], data: [] };
    var headerIdx = findHeaderRowIndex(rows);
    var headerRow = rows[headerIdx] || [];
    var mergedNames = buildMergedHeaderNames(rows, headerIdx);
    var columns = (mergedNames || headerRow).map(function (c, i) {
      var name = (c === undefined || c === null || String(c).trim() === '') ? ('column_' + (i + 1)) : String(c).trim();
      return name;
    });

    columns = deduplicateColumns(columns);

    var data = [];
    for (var r = headerIdx + 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row || row.every(function (c) { return c === undefined || c === null || String(c).trim() === ''; })) continue;
      var obj = {};
      for (var c = 0; c < columns.length; c++) {
        obj[columns[c]] = row[c] !== undefined ? row[c] : null;
      }
      data.push(obj);
    }
    return { columns: columns, data: data };
  }

  /**
   * Score a sheet by data volume: rows × filled-columns.
   * Higher = more data = better candidate for classification.
   */
  function sheetScore(dataset) {
    return dataset.data.length * dataset.columns.length;
  }

  function parseWorkbookFile(data, readType, password) {
    var opts = { type: readType || 'array', cellDates: true };
    if (password) opts.password = password;
    var workbook = XLSX.read(data, opts);
    var sheetNames = workbook.SheetNames || [];
    var sheetMeta = (workbook.Workbook && workbook.Workbook.Sheets) || [];

    var allSheets = [];
    var bestSheet = null;
    var bestScore = -1;

    for (var s = 0; s < sheetNames.length; s++) {
      // Skip hidden/very-hidden sheets (Hidden: 1 or 2) — a workbook can carry
      // lookup/reference tabs the user never sees in Excel's tab bar, and
      // surfacing those in the sheet picker misrepresents "how many sheets"
      // the file has from the user's point of view.
      var meta = sheetMeta[s];
      if (meta && (meta.Hidden === 1 || meta.Hidden === 2)) continue;
      var sheet = workbook.Sheets[sheetNames[s]];
      if (!sheet) continue;
      var rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });
      var dataset = rowsToDataset(rows);
      dataset.sheetName = sheetNames[s];

      if (dataset.data.length === 0 && dataset.columns.length === 0) continue;

      // Each entry carries its own columns/data so the sheet-picker UI can
      // build a final dataset from whichever sheet(s) the user selects,
      // without re-reading the file. Not a shared reference with bestSheet
      // (a plain object per sheet), so no circular-JSON risk downstream —
      // bestSheet.allSheets is a sibling list, not self-containing.
      allSheets.push({ sheetName: dataset.sheetName, columns: dataset.columns, data: dataset.data, rowCount: dataset.data.length });

      var sc = sheetScore(dataset);
      if (sc > bestScore) {
        bestScore = sc;
        bestSheet = dataset;
      }
    }

    if (!bestSheet) {
      bestSheet = { columns: [], data: [] };
    }

    var isCrossTab = detectCrossTab(bestSheet.columns, bestSheet.data);

    bestSheet.sheetNames = sheetNames;
    bestSheet.allSheets = allSheets;
    bestSheet.isCrossTab = isCrossTab;
    bestSheet.multiSheet = allSheets.length > 1;
    bestSheet.selectedSheet = bestSheet.sheetName || sheetNames[0] || '';
    return bestSheet;
  }

  function extractDatasetName(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    var name = parsed.dataset_name || parsed.datasetName || parsed.name || parsed.title;
    return (typeof name === 'string' && name.trim()) ? name.trim() : null;
  }

  function parseJsonText(text) {
    var parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      var columns = parsed.length > 0 ? Object.keys(parsed[0]) : [];
      return { columns: columns, data: parsed, sheetNames: [] };
    }
    if (parsed && Array.isArray(parsed.columns) && Array.isArray(parsed.data)) {
      var cols = parsed.columns.map(function (c) { return typeof c === 'string' ? c : (c && c.name ? c.name : String(c)); });
      return { columns: cols, data: parsed.data, sheetNames: [], datasetName: extractDatasetName(parsed) };
    }
    if (parsed && Array.isArray(parsed.data)) {
      var columns2 = parsed.data.length > 0 ? Object.keys(parsed.data[0]) : [];
      return { columns: columns2, data: parsed.data, sheetNames: [], datasetName: extractDatasetName(parsed) };
    }
    throw new Error('Unrecognized JSON dataset shape');
  }

  /**
   * @param {File} file
   * @returns {Promise<{columns:string[], data:object[], sheetNames:string[], filename:string, isCrossTab:boolean, multiSheet:boolean, allSheets:Array}>}
   */
  function isPasswordError(err) {
    var msg = (err && err.message || '').toLowerCase();
    return msg.indexOf('password') !== -1 || msg.indexOf('encrypt') !== -1
        || msg.indexOf('cfb') !== -1 || msg.indexOf('ole') !== -1;
  }

  function parseFile(file, password) {
    var ext = file.name.split('.').pop().toLowerCase();
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('File read failed')); };
      reader.onload = function () {
        try {
          var result;
          if (ext === 'json') {
            result = parseJsonText(reader.result);
          } else if (ext === 'csv' || ext === 'txt') {
            result = parseWorkbookFile(reader.result, 'string');
          } else {
            result = parseWorkbookFile(reader.result, 'array', password);
          }
          result.filename = file.name;
          resolve(result);
        } catch (err) {
          if (!password && isPasswordError(err)) {
            var pwErr = new Error('PASSWORD_REQUIRED');
            pwErr.code = 'PASSWORD_REQUIRED';
            reject(pwErr);
            return;
          }
          if (password && isPasswordError(err)) {
            var wrongErr = new Error('PASSWORD_WRONG');
            wrongErr.code = 'PASSWORD_WRONG';
            reject(wrongErr);
            return;
          }
          reject(err);
        }
      };
      if (ext === 'json' || ext === 'csv' || ext === 'txt') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  /**
   * Build one dataset from a user-picked subset of sheets (from
   * result.allSheets). Single sheet: used as-is. Multiple sheets: row-stacked
   * under the union of their columns (missing cells become null) — this
   * covers the common real case of same-schema sheets (e.g. one per month)
   * without pretending to solve arbitrary schema reconciliation.
   * @param {Array<{sheetName,columns,data}>} allSheets
   * @param {string[]} selectedNames
   * @returns {{columns:string[], data:object[], sourceSheets:string[]}}
   */
  function mergeSheets(allSheets, selectedNames) {
    var picked = allSheets.filter(function (s) { return selectedNames.indexOf(s.sheetName) !== -1; });
    if (picked.length === 0) picked = allSheets.slice();
    if (picked.length === 1) {
      return { columns: picked[0].columns, data: picked[0].data, sourceSheets: [picked[0].sheetName] };
    }
    var columnSet = [];
    var seen = {};
    picked.forEach(function (s) {
      s.columns.forEach(function (c) { if (!seen[c]) { seen[c] = true; columnSet.push(c); } });
    });
    var mergedRows = [];
    picked.forEach(function (s) {
      s.data.forEach(function (row) {
        var out = {};
        columnSet.forEach(function (c) { out[c] = row.hasOwnProperty(c) ? row[c] : null; });
        mergedRows.push(out);
      });
    });
    return { columns: columnSet, data: mergedRows, sourceSheets: picked.map(function (s) { return s.sheetName; }) };
  }

  /**
   * Serialise a parsed dataset to CSV text (RFC 4180 quoting).
   * Dates become ISO yyyy-mm-dd so they survive a round trip through Excel
   * instead of turning into locale-dependent text.
   * @param {{columns:string[], data:object[]}} dataset
   * @returns {string} CSV body WITHOUT a byte-order mark
   */
  function toCsv(dataset) {
    var cols = (dataset && dataset.columns) || [];
    var rows = (dataset && dataset.data) || [];

    function cell(v) {
      if (v === null || v === undefined) return '';
      if (v instanceof Date) {
        return isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10);
      }
      var s = String(v);
      // Quote when the value contains a delimiter, quote or newline.
      if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }

    var out = [cols.map(cell).join(',')];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var line = [];
      for (var c = 0; c < cols.length; c++) line.push(cell(row[cols[c]]));
      out.push(line.join(','));
    }
    return out.join('\r\n');
  }

  window.iDashProfiler = {
    parseFile: parseFile,
    mergeSheets: mergeSheets,
    toCsv: toCsv
  };
})();
