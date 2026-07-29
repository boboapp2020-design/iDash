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
  },

  // ── นิติกรรม — ทะเบียนพื้นที่เช่า ─────────────────────────────────────
  // Paired sample: Sample/Lawyer/พื้นที่เช่าลวมเข้าละบบ.xlsx
  //                (sheet "พื้นที่เช่า", 791 rows).
  //
  // The dashboard reads the workbook itself and takes columns POSITIONALLY
  // (ลำดับ, ชื่อ, เลขแปลง, พื้นที่, จำนวนปี, ตัวหนังสือ, ราคา/ไร่, ค่าเช่า/ปี,
  // ค่าเช่ารวม, ปีเริ่ม, ปีสิ้นสุด), so there is nothing to map — it just needs
  // the file.
  {
    id: 'land_lease_register',
    nameTH: 'นิติกรรม — ทะเบียนพื้นที่เช่า',
    fingerprint: {
      columns: [
        'ລໍາດັບ', 'ຊື່ນາມສະກຸນ', 'ເລກແປງ', 'ພື້ນທີ່(ໄຮ່)', 'ຈໍານວນປີ',
        'ຕົວໜັງສື', 'ລາຄາຕໍ່ໄຮ່', 'ລາຄາເຊົ່າຕໍ່ປີ', 'ຄ່າເຊົ່າທັ້ງໝົດ',
        'ປີເລິ່ມ', 'ປີສິ້ນສຸດ'
      ],
      sheets: ['พื้นที่เช่า'],
      requiredCoverage: 0.7
    },
    themeId: 'forest',
    templateFile: 'land_lease_register.html',
    // The header's own "อัปโหลดข้อมูล" button re-opens its file picker for a
    // manual re-upload — redundant here since the file is injected automatically,
    // and confusing since the panel it would open is hidden.
    inject: { mode: 'file', entryFn: 'handleFile', hide: ['#headerUploadBtn'] }
  },

  // ── BOI — แผนนำเข้าเทียบจริง ──────────────────────────────────────────
  // Paired sample: Sample/BOI/BOI ແຜນບໍລິສັດມິດລາວ ML.xlsx
  //                (sheets "ແຜນ" 1,706 rows + "ແຜນເພີ່ມ" 198 rows).
  //
  // Both plan sheets share one shape (ລຳດັບແຜນ / ລະຫັດ / ສິນຄ້າ / ຫົວໜ່ວຍ /
  // ແຜນອານຸມັດ / ນຳເຂົ້າຕົວຈິງ / ຍອດເຫລືອ); the dashboard picks up what it
  // needs from the workbook, so it is handed the file rather than one sheet.
  {
    id: 'boi_import_plan',
    nameTH: 'BOI — แผนนำเข้าเทียบจริง',
    fingerprint: {
      columns: [
        'ລຳດັບແຜນ', 'ລະຫັດ', 'ສິນຄ້າ', 'ຫົວໜ່ວຍ',
        'ແຜນອານຸມັດ', 'ນຳເຂົ້າຕົວຈິງ', 'ຍອດເຫລືອ'
      ],
      sheets: ['ແຜນ', 'ແຜນເພີ່ມ'],
      requiredCoverage: 0.7
    },
    themeId: 'sapphire',
    templateFile: 'boi_import_plan.html',
    inject: { mode: 'file', entryFn: 'handleFile' }
  },

  // ── บรรจุ — รายงานบรรจุน้ำตาล ─────────────────────────────────────────
  // Paired sample: Sample/บรรจุ/รายงานบรรจุน้ำตาล ปี 25-26.xlsx (16 sheets).
  //
  // Matched on TAB NAMES, not columns: the dashboard scans every sheet, finds
  // each header row itself and keeps the ones carrying a Strike plus a pack-size
  // column. Which single sheet our profiler picked is irrelevant — and varies —
  // so a column fingerprint would be unreliable here.
  {
    id: 'sugar_packing_report',
    nameTH: 'บรรจุ — รายงานบรรจุน้ำตาล',
    fingerprint: {
      sheets: [
        'รายงานสรุป RE-PACKING', 'บรรจุ ย่อย', 'Total ยอดน้ำตาล-บรรจุ',
        '1000Kg VHP', '1000Kg DCR', '50kg DCR', 'แผนขาย'
      ],
      requiredCoverage: 0.7
    },
    themeId: 'amber',
    templateFile: 'sugar_packing.html',
    inject: { mode: 'file', entryFn: 'readFile' }
  }

];
