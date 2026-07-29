/**
 * iDash Known-Dataset Registry — DATA ONLY (matcher lives in
 * js/known_dataset_registry.js).
 *
 * iDash only builds a dashboard for a file it has been TAUGHT. There is no
 * generic fallback: guessing from column shape produced meaningless numbers
 * (summing id columns and labelling the result a KPI), so an unmatched upload
 * now says it has no template rather than inventing one.
 *
 * Two ways to pair a dataset:
 *
 *   A. Curated HTML template  — templateFile + columnMapping
 *      The hand-built dashboard file drives everything; iDash injects the
 *      user's rows and hides the template's own upload panel. Use this when a
 *      real dashboard already exists for that data.
 *
 *   B. Blueprint              — blueprint { kpis, chartPlan }
 *      Explicit column→widget bindings with the aggregation that makes
 *      business sense (document numbers are COUNTED, quality readings are
 *      AVERAGED, never summed). iDash renders them with its own generator.
 *
 * Entry format:
 *   id, nameTH
 *   fingerprint: { columns: [normalized names], requiredCoverage: 0..1 }
 *   themeId: id from theme_palette.js
 *   then either templateFile + columnMapping, or blueprint.
 *
 * Blueprint column names are matched case-insensitively and resolved to the
 * file's real headers before aggregation (see validateBlueprint).
 */
window.iDashKnownDatasetEntries = [

  // ── จัดซื้อ — ติดตาม PR → PO ──────────────────────────────────────────
  // Paired sample: Sample/จัดซื้อ/Procurement - ติดตาม PO.xlsx
  //                (sheet "Data", 494 rows).
  //
  // Curated-template path: the hand-built tracker already knows how to age a
  // PR, flag a late delivery and drive its own filters — none of which a
  // generated chart plan reproduces.
  //
  // Header text is matched loosely by prepareTemplateHtml (bracketed notes and
  // embedded newlines are normalized away), so the annotated delivery-date
  // columns match without reproducing their suffixes exactly.
  {
    id: 'procurement_pr_po_tracking',
    nameTH: 'จัดซื้อ — ติดตาม PR → PO',
    fingerprint: {
      columns: [
        'changed on', 'purchase requisition', 'purchase order', 'release date',
        'short text', 'quantity requested', 'unit of measure', 'requisitioner',
        'purchasing group', 'purchaser', 'delivery date warning',
        'delivery date complete'
      ],
      requiredCoverage: 0.75
    },
    themeId: 'ocean_blue',
    templateFile: 'procurement_po_tracking.html',
    // template field → Excel column header
    columnMapping: {
      pr:   'Purchase Requisition',
      po:   'Purchase order',
      rel:  'Release Date',
      item: 'Short Text',
      qty:  'Quantity requested',
      uom:  'Unit of Measure',
      req:  'Requisitioner',
      grp:  'Purchasing Group',
      buy:  'Purchaser',
      warn: 'Delivery date Warning',
      comp: 'Delivery date Complete'
    }
  }

];
