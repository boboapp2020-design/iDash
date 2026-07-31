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
  },

  // ══════════════════════════════════════════════════════════════════════
  //  Daily operations pack — paired from Sample/ (2026-07-31)
  //
  //  The first three are formatted mill reports: a title block, merged cells
  //  and the real labels sitting in an ITEM column rather than a header row.
  //  Our profiler cannot produce a stable column list from that shape, and a
  //  column fingerprint built on whatever it happened to pick would break the
  //  first time a report's layout shifted a row. Each workbook does have one
  //  distinctive sheet name, so that is what they match on — the same reason
  //  the packing entry above matches on tabs.
  //
  //  All four dashboards read the workbook themselves and swap their own
  //  upload screen for the dashboard once loaded, so iDash only has to put the
  //  file into their file input and fire change.
  // ══════════════════════════════════════════════════════════════════════

  // ── Breakdown — เวลาหยุดเครื่อง ───────────────────────────────────────
  // Paired sample: Sample/Breakdown Report/Stoptime 251214.xlsx
  {
    id: 'mill_stoptime_report',
    nameTH: 'ผลิต — รายงานเวลาหยุดเครื่อง (Stop Time)',
    fingerprint: { sheets: ['Stop (Gen.)'], requiredCoverage: 1 },
    themeId: 'crimson',
    templateFile: 'stoptime_report.html',
    inject: { mode: 'file', input: '#file' }
  },

  // ── Daily — รายงานการผลิตประจำวัน ─────────────────────────────────────
  // Paired sample: Sample/Daily Report/Daily Report 260325.xlsx
  {
    id: 'mill_daily_processing_report',
    nameTH: 'ผลิต — รายงานการผลิตประจำวัน (Daily Processing)',
    fingerprint: { sheets: ['Daily (General)'], requiredCoverage: 1 },
    themeId: 'ocean_blue',
    templateFile: 'daily_processing_report.html',
    inject: { mode: 'file', input: '#file' }
  },

  // ── Water — ระบบไอน้ำและน้ำ ───────────────────────────────────────────
  // Paired sample: Sample/Water Report/Water 251219.xlsx
  {
    id: 'mill_water_steam_report',
    nameTH: 'ผลิต — รายงานระบบไอน้ำและน้ำ',
    fingerprint: { sheets: ['ระบบน้ำ'], requiredCoverage: 1 },
    themeId: 'teal',
    templateFile: 'water_steam_report.html',
    inject: { mode: 'file', input: '#file' }
  },

  // ── เกษตร — คุณภาพดิน ─────────────────────────────────────────────────
  // Paired sample: Sample/คุณภาพดิน/ผลการวิเคราะห์ดิน_ค่าแนะนำ.xlsx
  //
  // This one is a genuine table, so it gets a column fingerprint as well as
  // the sheet list — the soil chemistry columns (pH / EC / OM / P / K with
  // their level bands) are what the dashboard actually charts, and no other
  // registered file carries them. Its file input is #fileInput, not #file.
  {
    id: 'agri_soil_quality',
    nameTH: 'เกษตร — ผลวิเคราะห์คุณภาพดิน',
    fingerprint: {
      columns: [
        'pH', 'pH level', 'EC', 'Percent_OM', 'OM level',
        'Available P', 'P level', 'Extractable K', 'K level',
        'CROP_YEAR', 'RAI', 'ZONE_ID'
      ],
      sheets: ['วิเคราะห์ดิน', 'ค่าเฉลี่ยรายเขต', 'ข้อมูลผลการวิเคราะห์รวม'],
      requiredCoverage: 0.7
    },
    themeId: 'forest',
    templateFile: 'soil_quality.html',
    // This dashboard adds a `hidden` class to #uploadOverlay after loading,
    // but its own `.upload-overlay{display:flex}` rule is declared later and
    // wins, so the upload screen stays on top of the finished dashboard. The
    // data is all there underneath — verified 188 rows and 12 charts — the
    // user just lands on an upload prompt. An ID selector with !important
    // settles it without editing the template's CSS.
    inject: { mode: 'file', input: '#fileInput', hide: ['#uploadOverlay'] }
  },

  // ══════════════════════════════════════════════════════════════════════
  //  Sugar factory pack — 38 blank dashboards, each bound to one workbook
  //  (source: sugar-data/, paired 1:1 by filename).
  //
  //  These share one generator, so they share one recipe: the dashboard reads
  //  the workbook itself and matches columns by header name, and its own
  //  applyData() hides the upload screen once loaded. All iDash does is put
  //  the file into its #file input and fire change — the same listener a
  //  manual pick would hit — then hide #reload, which would otherwise offer a
  //  way back to an upload screen that has no purpose here.
  //
  //  Fingerprints are the column lists the dashboards themselves declare, so
  //  they cannot drift from what each one actually expects. Checked pairwise:
  //  no two overlap by more than 75%, so none can match another's file.
  // ══════════════════════════════════════════════════════════════════════
  // 01_Executive · 01_ผลงานรายเดือน_แยกแผนก.xlsx — sheet "Data", 8 cols / 120 rows
  {
    id: 'sugar_exec_01',
    nameTH: 'ผู้บริหาร — ผลงานรายเดือน แยกแผนก',
    fingerprint: { columns: ['เดือน', 'แผนก', 'รายได้_ล้านบาท', 'ต้นทุน_ล้านบาท', 'กำไร_ล้านบาท', 'งบประมาณ_ล้านบาท', 'ส่วนต่างงบ_ล้านบาท', 'จำนวนพนักงาน'], requiredCoverage: 0.7 },
    themeId: 'sapphire',
    templateFile: 'sugar/exec_01.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 01_Executive · 02_KPI_Scorecard.xlsx — sheet "Data", 7 cols / 64 rows
  {
    id: 'sugar_exec_02',
    nameTH: 'ผู้บริหาร — KPI Scorecard',
    fingerprint: { columns: ['ไตรมาส', 'KPI', 'หน่วย', 'เป้าหมาย', 'ผลงานจริง', 'Achievement_%', 'สถานะ'], requiredCoverage: 0.7 },
    themeId: 'sapphire',
    templateFile: 'sugar/exec_02.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 01_Executive · 03_เปรียบเทียบรายปี_5ปี.xlsx — sheet "Data", 11 cols / 6 rows
  {
    id: 'sugar_exec_03',
    nameTH: 'ผู้บริหาร — เปรียบเทียบรายปี 5ปี',
    fingerprint: { columns: ['ปี', 'รายได้รวม_ล้านบาท', 'ต้นทุนรวม_ล้านบาท', 'กำไรสุทธิ_ล้านบาท', 'ตันอ้อยหีบ', 'ตันน้ำตาลผลิต', 'Recovery_%', 'CCS_เฉลี่ย', 'พนักงานรวม', 'อุบัติเหตุ_ครั้ง', 'ไฟฟ้าส่งออก_MWh'], requiredCoverage: 0.7 },
    themeId: 'sapphire',
    templateFile: 'sugar/exec_03.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 02_Manufacturing · 04_รายงานหีบอ้อยรายวัน.xlsx — sheet "Data", 14 cols / 136 rows
  {
    id: 'sugar_mfg_04',
    nameTH: 'ผลิต — รายงานหีบอ้อยรายวัน',
    fingerprint: { columns: ['วันที่', 'ตันอ้อยหีบ', 'ชั่วโมงหีบ', 'ชั่วโมงหยุด', 'อัตราหีบ_ตันต่อชม', 'CCS', 'Brix_น้ำอ้อยรวม', 'Pol_น้ำอ้อยรวม', 'Purity_น้ำอ้อยรวม', 'Fiber_%', 'อ้อยสด_%', 'อ้อยไฟไหม้_%', 'Trash_%', 'Moisture_%อ้อย'], requiredCoverage: 0.7 },
    themeId: 'ocean_blue',
    templateFile: 'sugar/mfg_04.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 02_Manufacturing · 05_ประสิทธิภาพลูกหีบ.xlsx — sheet "Data", 15 cols / 136 rows
  {
    id: 'sugar_mfg_05',
    nameTH: 'ผลิต — ประสิทธิภาพลูกหีบ',
    fingerprint: { columns: ['วันที่', 'Milling_Extraction_%', 'Reduced_Extraction_%', 'Imbibition_%fiber', 'Pol_Bagasse', 'Moisture_Bagasse_%', 'Fiber_Bagasse_%', 'Bagasse_ตัน', 'Pol_น้ำอ้อยรวม', 'Brix_น้ำอ้อยรวม', 'Mill_1_RPM', 'Mill_2_RPM', 'Mill_3_RPM', 'Mill_4_RPM', 'Hydraulic_Pressure_psi'], requiredCoverage: 0.7 },
    themeId: 'ocean_blue',
    templateFile: 'sugar/mfg_05.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 02_Manufacturing · 06_กระบวนการBoilingHouse.xlsx — sheet "Data", 22 cols / 136 rows
  {
    id: 'sugar_mfg_06',
    nameTH: 'ผลิต — กระบวนการBoilingHouse',
    fingerprint: { columns: ['วันที่', 'Clarified_Juice_Purity', 'pH_Clarified_Juice', 'Turbidity_NTU', 'Mud_Pol', 'Filter_Cake_%cane', 'Syrup_Brix', 'Syrup_Purity', 'Evaporator_Brix_Out', 'A_Massecuite_Brix', 'A_Massecuite_Purity', 'A_Sugar_Pol', 'A_Molasses_Purity', 'B_Massecuite_Purity', 'B_Molasses_Purity', 'C_Massecuite_Purity', 'Final_Molasses_Purity', 'Final_Molasses_Brix', 'BHR_%', 'Overall_Recovery_%', 'Sugar_Produced_tons', 'Molasses_tons'], requiredCoverage: 0.7 },
    themeId: 'ocean_blue',
    templateFile: 'sugar/mfg_06.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 02_Manufacturing · 07_ผลวิเคราะห์คุณภาพน้ำตาล.xlsx — sheet "Data", 11 cols / 408 rows
  {
    id: 'sugar_mfg_07',
    nameTH: 'ผลิต — ผลวิเคราะห์คุณภาพน้ำตาล',
    fingerprint: { columns: ['วันที่', 'เกรด', 'Pol', 'Moisture_%', 'ICUMSA', 'Grain_Size_mm', 'Ash_%', 'Dextran_ppm', 'Starch_ppm', 'SO2_ppm', 'ผลตรวจ'], requiredCoverage: 0.7 },
    themeId: 'ocean_blue',
    templateFile: 'sugar/mfg_07.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 02_Manufacturing · 08_OEE_และ_Downtime.xlsx — sheet "Data", 10 cols / 731 rows
  {
    id: 'sugar_mfg_08',
    nameTH: 'ผลิต — OEE และ Downtime',
    fingerprint: { columns: ['วันที่', 'เครื่องจักร', 'สถานะ', 'ชั่วโมงหยุด', 'สาเหตุ', 'ผู้รายงาน', 'Availability_%', 'Performance_%', 'Quality_%', 'OEE_%'], requiredCoverage: 0.7 },
    themeId: 'ocean_blue',
    templateFile: 'sugar/mfg_08.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 02_Manufacturing · 09_งบประมาณซ่อมบำรุง.xlsx — sheet "Data", 7 cols / 180 rows
  {
    id: 'sugar_mfg_09',
    nameTH: 'ผลิต — งบประมาณซ่อมบำรุง',
    fingerprint: { columns: ['เดือน', 'หมวดซ่อม', 'งบประมาณ_บาท', 'ค่าใช้จ่ายจริง_บาท', 'ส่วนต่าง_บาท', 'ประเภท', 'สถานะ'], requiredCoverage: 0.7 },
    themeId: 'ocean_blue',
    templateFile: 'sugar/mfg_09.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 02_Manufacturing · 10_โรงไฟฟ้าชานอ้อย.xlsx — sheet "Data", 15 cols / 136 rows
  {
    id: 'sugar_mfg_10',
    nameTH: 'ผลิต — โรงไฟฟ้าชานอ้อย',
    fingerprint: { columns: ['วันที่', 'Steam_Produced_tons', 'Steam_%cane', 'Boiler#1_Efficiency_%', 'Boiler#2_Efficiency_%', 'Bagasse_Consumed_tons', 'Bagasse_Moisture_%', 'Turbine#1_MW', 'Turbine#2_MW', 'Total_Power_Generated_MWh', 'Factory_Consumption_MWh', 'Power_Exported_MWh', 'Revenue_Power_บาท', 'Exhaust_Temp_C', 'Stack_Emission_mgNm3'], requiredCoverage: 0.7 },
    themeId: 'ocean_blue',
    templateFile: 'sugar/mfg_10.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 02_Manufacturing · 11_สมดุลไอน้ำและน้ำ.xlsx — sheet "Data", 14 cols / 136 rows
  {
    id: 'sugar_mfg_11',
    nameTH: 'ผลิต — สมดุลไอน้ำและน้ำ',
    fingerprint: { columns: ['วันที่', 'Steam_HP_tons', 'Steam_LP_tons', 'Steam_Exhaust_tons', 'Condensate_Return_%', 'Process_Water_m3', 'Imbibition_Water_m3', 'Cooling_Water_m3', 'Boiler_Feed_Water_m3', 'Effluent_Discharge_m3', 'BOD_mg_L', 'COD_mg_L', 'pH_effluent', 'TSS_mg_L'], requiredCoverage: 0.7 },
    themeId: 'ocean_blue',
    templateFile: 'sugar/mfg_11.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 03_Finance · 12_งบประมาณvsจริง.xlsx — sheet "Data", 6 cols / 228 rows
  {
    id: 'sugar_fin_12',
    nameTH: 'การเงิน — งบประมาณvsจริง',
    fingerprint: { columns: ['เดือน', 'รายการ', 'งบประมาณ_บาท', 'จ่ายจริง_บาท', 'ส่วนต่าง_บาท', 'สถานะ'], requiredCoverage: 0.7 },
    themeId: 'forest',
    templateFile: 'sugar/fin_12.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 03_Finance · 13_ต้นทุนอ้อย.xlsx — sheet "Data", 10 cols / 136 rows
  {
    id: 'sugar_fin_13',
    nameTH: 'การเงิน — ต้นทุนอ้อย',
    fingerprint: { columns: ['วันที่', 'ตันอ้อยรับซื้อ', 'CCS', 'ราคาอ้อย_บาทต่อตัน', 'มูลค่ารวม_บาท', 'ค่าขนส่ง_บาท', 'ค่าตัด_บาท', 'ต้นทุนอ้อยรวม_บาทต่อตัน', 'ประเภท_อ้อย', 'โซน'], requiredCoverage: 0.7 },
    themeId: 'forest',
    templateFile: 'sugar/fin_13.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 03_Finance · 14_ต้นทุนผลิตน้ำตาล.xlsx — sheet "Data", 10 cols / 12 rows
  {
    id: 'sugar_fin_14',
    nameTH: 'การเงิน — ต้นทุนผลิตน้ำตาล',
    fingerprint: { columns: ['เดือน', 'น้ำตาลผลิต_ตัน', 'ต้นทุนวัตถุดิบ_บาท', 'ค่าแรงงานผลิต_บาท', 'ค่าเคมี_บาท', 'ค่าพลังงาน_บาท', 'ค่าซ่อมบำรุง_บาท', 'ค่าเสื่อมราคา_บาท', 'ค่าโสหุ้ย_บาท', 'ต้นทุนรวม_บาทต่อตัน'], requiredCoverage: 0.7 },
    themeId: 'forest',
    templateFile: 'sugar/fin_14.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 03_Finance · 15_รายงานภาษี.xlsx — sheet "Data", 12 cols / 12 rows
  {
    id: 'sugar_fin_15',
    nameTH: 'การเงิน — รายงานภาษี',
    fingerprint: { columns: ['เดือน', 'รายได้_ล้านบาท', 'ต้นทุนขาย_ล้านบาท', 'กำไรขั้นต้น_ล้านบาท', 'ค่าใช้จ่ายดำเนินงาน_ล้านบาท', 'กำไรก่อนภาษี_ล้านบาท', 'ภาษีเงินได้_ล้านบาท', 'กำไรสุทธิ_ล้านบาท', 'VAT_ขาย_ล้านบาท', 'VAT_ซื้อ_ล้านบาท', 'VAT_ชำระ_ล้านบาท', 'ภาษีหัก_ณ_ที่จ่าย_ล้านบาท'], requiredCoverage: 0.7 },
    themeId: 'forest',
    templateFile: 'sugar/fin_15.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 03_Finance · 16_งบดุล.xlsx — sheet "Data", 4 cols / 60 rows
  {
    id: 'sugar_fin_16',
    nameTH: 'การเงิน — งบดุล',
    fingerprint: { columns: ['ปี', 'หมวด', 'รายการ', 'จำนวน_ล้านบาท'], requiredCoverage: 0.7 },
    themeId: 'forest',
    templateFile: 'sugar/fin_16.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 04_Inventory · 17_คลังเคมีภัณฑ์.xlsx — sheet "Data", 11 cols / 180 rows
  {
    id: 'sugar_inv_17',
    nameTH: 'คลัง — คลังเคมีภัณฑ์',
    fingerprint: { columns: ['เดือน', 'รายการ', 'หน่วย', 'ยกมา', 'รับเข้า', 'เบิกใช้', 'คงเหลือ', 'จุดสั่งซื้อ', 'สถานะ', 'ราคาต่อหน่วย_บาท', 'มูลค่าคงเหลือ_บาท'], requiredCoverage: 0.7 },
    themeId: 'amber',
    templateFile: 'sugar/inv_17.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 04_Inventory · 18_คลังน้ำตาล.xlsx — sheet "Data", 9 cols / 408 rows
  {
    id: 'sugar_inv_18',
    nameTH: 'คลัง — คลังน้ำตาล',
    fingerprint: { columns: ['วันที่', 'เกรด', 'ยกมา_ตัน', 'ผลิตเข้า_ตัน', 'ส่งออก_ตัน', 'คงเหลือ_ตัน', 'ไซโล', 'ICUMSA_เฉลี่ย', 'อายุสต็อก_วัน'], requiredCoverage: 0.7 },
    themeId: 'amber',
    templateFile: 'sugar/inv_18.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 04_Inventory · 19_คลังอะไหล่.xlsx — sheet "Data", 12 cols / 20 rows
  {
    id: 'sugar_inv_19',
    nameTH: 'คลัง — คลังอะไหล่',
    fingerprint: { columns: ['รหัสอะไหล่', 'ชื่อ', 'หมวด', 'จำนวนคงเหลือ', 'หน่วย', 'ขั้นต่ำ', 'ราคาต่อหน่วย_บาท', 'มูลค่า_บาท', 'ตำแหน่งจัดเก็บ', 'วันที่รับล่าสุด', 'สถานะ', 'Supplier'], requiredCoverage: 0.7 },
    themeId: 'amber',
    templateFile: 'sugar/inv_19.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 04_Inventory · 20_วัสดุสิ้นเปลือง.xlsx — sheet "Data", 7 cols / 240 rows
  {
    id: 'sugar_inv_20',
    nameTH: 'คลัง — วัสดุสิ้นเปลือง',
    fingerprint: { columns: ['เดือน', 'รายการ', 'หน่วย', 'จำนวนเบิก', 'ราคาต่อหน่วย_บาท', 'มูลค่า_บาท', 'แผนกที่เบิก'], requiredCoverage: 0.7 },
    themeId: 'amber',
    templateFile: 'sugar/inv_20.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 05_HR · 21_ทะเบียนพนักงาน.xlsx — sheet "Data", 14 cols / 380 rows
  {
    id: 'sugar_hr_21',
    nameTH: 'บุคคล — ทะเบียนพนักงาน',
    fingerprint: { columns: ['รหัสพนักงาน', 'ชื่อ', 'นามสกุล', 'เพศ', 'วันเกิด', 'วันเริ่มงาน', 'แผนก', 'ตำแหน่ง', 'ระดับ', 'เงินเดือน_บาท', 'ประเภท', 'สถานะ', 'สัญชาติ', 'วุฒิการศึกษา'], requiredCoverage: 0.7 },
    themeId: 'violet',
    templateFile: 'sugar/hr_21.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 05_HR · 22_บันทึกเข้างาน.xlsx — sheet "Data", 7 cols / 8000 rows
  {
    id: 'sugar_hr_22',
    nameTH: 'บุคคล — บันทึกเข้างาน',
    fingerprint: { columns: ['วันที่', 'รหัสพนักงาน', 'เข้างาน', 'ออกงาน', 'ชั่วโมงทำงาน', 'OT_ชั่วโมง', 'สถานะ'], requiredCoverage: 0.7 },
    themeId: 'violet',
    templateFile: 'sugar/hr_22.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 05_HR · 23_สวัสดิการพนักงาน.xlsx — sheet "Data", 5 cols / 144 rows
  {
    id: 'sugar_hr_23',
    nameTH: 'บุคคล — สวัสดิการพนักงาน',
    fingerprint: { columns: ['เดือน', 'รายการสวัสดิการ', 'จำนวนผู้ใช้สิทธิ์', 'ค่าใช้จ่าย_บาท', 'งบประมาณ_บาท'], requiredCoverage: 0.7 },
    themeId: 'violet',
    templateFile: 'sugar/hr_23.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 05_HR · 24_บันทึกการอบรม.xlsx — sheet "Data", 7 cols / 455 rows
  {
    id: 'sugar_hr_24',
    nameTH: 'บุคคล — บันทึกการอบรม',
    fingerprint: { columns: ['หลักสูตร', 'วันที่อบรม', 'รหัสพนักงาน', 'ชั่วโมงอบรม', 'ผลสอบ', 'ผู้จัด', 'ค่าใช้จ่าย_บาท'], requiredCoverage: 0.7 },
    themeId: 'violet',
    templateFile: 'sugar/hr_24.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 06_Sales · 25_ทะเบียนลูกค้า.xlsx — sheet "Data", 9 cols / 20 rows
  {
    id: 'sugar_sales_25',
    nameTH: 'ขาย — ทะเบียนลูกค้า',
    fingerprint: { columns: ['รหัสลูกค้า', 'ชื่อลูกค้า', 'ประเภท', 'ที่อยู่', 'เบอร์โทร', 'Credit_Days', 'วงเงินเครดิต_บาท', 'สถานะ', 'วันที่เริ่มค้าขาย'], requiredCoverage: 0.7 },
    themeId: 'coral',
    templateFile: 'sugar/sales_25.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 06_Sales · 26_ใบสั่งซื้อ.xlsx — sheet "Data", 10 cols / 500 rows
  {
    id: 'sugar_sales_26',
    nameTH: 'ขาย — ใบสั่งซื้อ',
    fingerprint: { columns: ['เลขที่ใบสั่งซื้อ', 'วันที่', 'ลูกค้า', 'สินค้า', 'จำนวน_ตัน', 'ราคาต่อตัน_บาท', 'มูลค่า_บาท', 'สถานะ', 'วิธีชำระ', 'วิธีขนส่ง'], requiredCoverage: 0.7 },
    themeId: 'coral',
    templateFile: 'sugar/sales_26.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 06_Sales · 27_ความต้องการลูกค้า.xlsx — sheet "Data", 9 cols / 42 rows
  {
    id: 'sugar_sales_27',
    nameTH: 'ขาย — ความต้องการลูกค้า',
    fingerprint: { columns: ['ลูกค้า', 'สินค้า', 'ICUMSA_สูงสุด', 'Pol_ขั้นต่ำ', 'Moisture_สูงสุด_%', 'Grain_Size_mm', 'บรรจุภัณฑ์', 'ปริมาณต้องการ_ตันต่อเดือน', 'หมายเหตุ'], requiredCoverage: 0.7 },
    themeId: 'coral',
    templateFile: 'sugar/sales_27.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 07_SupplyChain · 28_จัดซื้อ_PR_PO.xlsx — sheet "Data", 13 cols / 400 rows
  {
    id: 'sugar_scm_28',
    nameTH: 'ซัพพลายเชน — จัดซื้อ PR PO',
    fingerprint: { columns: ['เลขที่PR', 'วันที่PR', 'รายการ', 'จำนวน', 'มูลค่า_บาท', 'ผู้ขอซื้อ', 'แผนก', 'กลุ่มจัดซื้อ', 'เลขที่PO', 'วันที่PO', 'Supplier', 'สถานะ', 'ผู้จัดซื้อ'], requiredCoverage: 0.7 },
    themeId: 'teal',
    templateFile: 'sugar/scm_28.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 07_SupplyChain · 29_ผลวิเคราะห์ห้องปฏิบัติการ.xlsx — sheet "Data", 10 cols / 1632 rows
  {
    id: 'sugar_scm_29',
    nameTH: 'ซัพพลายเชน — ผลวิเคราะห์ห้องปฏิบัติการ',
    fingerprint: { columns: ['วันที่', 'ตัวอย่าง', 'Brix', 'Pol', 'Purity', 'pH', 'Moisture_%', 'Ash_%', 'ผู้วิเคราะห์', 'สถานะ'], requiredCoverage: 0.7 },
    themeId: 'teal',
    templateFile: 'sugar/scm_29.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 07_SupplyChain · 30_สิทธิ์BOI.xlsx — sheet "Data", 9 cols / 150 rows
  {
    id: 'sugar_scm_30',
    nameTH: 'ซัพพลายเชน — สิทธิ์BOI',
    fingerprint: { columns: ['เลขที่สั่งปล่อย', 'วันที่', 'รายการ', 'มูลค่า_บาท', 'อากรขาเข้า_ปกติ_%', 'สิทธิ์ยกเว้น_%', 'ประหยัดอากร_บาท', 'บัตรส่งเสริม', 'สถานะ'], requiredCoverage: 0.7 },
    themeId: 'teal',
    templateFile: 'sugar/scm_30.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 07_SupplyChain · 31_ควบคุมเอกสาร_ISO.xlsx — sheet "Data", 10 cols / 200 rows
  {
    id: 'sugar_scm_31',
    nameTH: 'ซัพพลายเชน — ควบคุมเอกสาร ISO',
    fingerprint: { columns: ['รหัสเอกสาร', 'ชื่อเอกสาร', 'ประเภท', 'แผนก', 'Revision', 'วันที่ออก', 'วันที่ทบทวน', 'ผู้รับผิดชอบ', 'สถานะ', 'มาตรฐาน'], requiredCoverage: 0.7 },
    themeId: 'teal',
    templateFile: 'sugar/scm_31.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 07_SupplyChain · 32_สิ่งแวดล้อมและความปลอดภัย.xlsx — sheet "Data", 14 cols / 12 rows
  {
    id: 'sugar_scm_32',
    nameTH: 'ซัพพลายเชน — สิ่งแวดล้อมและความปลอดภัย',
    fingerprint: { columns: ['เดือน', 'อุบัติเหตุ_ครั้ง', 'วันหยุดงานจากอุบัติเหตุ', 'Near_Miss_ครั้ง', 'BOD_เฉลี่ย_mg_L', 'COD_เฉลี่ย_mg_L', 'TSS_เฉลี่ย_mg_L', 'pH_เฉลี่ย', 'ฝุ่น_PM10_ugm3', 'เสียง_dBA', 'ปริมาณขยะ_ตัน', 'การฝึกซ้อมดับเพลิง', 'ตรวจสุขภาพ_คน', 'ค่าใช้จ่ายสิ่งแวดล้อม_บาท'], requiredCoverage: 0.7 },
    themeId: 'teal',
    templateFile: 'sugar/scm_32.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 07_SupplyChain · 33_งานธุรการทั่วไป.xlsx — sheet "Data", 5 cols / 180 rows
  {
    id: 'sugar_scm_33',
    nameTH: 'ซัพพลายเชน — งานธุรการทั่วไป',
    fingerprint: { columns: ['เดือน', 'รายการ', 'จำนวนเงิน_บาท', 'แผนก', 'หมายเหตุ'], requiredCoverage: 0.7 },
    themeId: 'teal',
    templateFile: 'sugar/scm_33.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 08_Agriculture · 34_ทะเบียนแปลงปลูก.xlsx — sheet "Data", 16 cols / 200 rows
  {
    id: 'sugar_agri_34',
    nameTH: 'ไร่อ้อย — ทะเบียนแปลงปลูก',
    fingerprint: { columns: ['รหัสแปลง', 'ชื่อแปลง', 'พื้นที่_ไร่', 'พันธุ์อ้อย', 'ประเภท', 'วันปลูก', 'อายุอ้อย_เดือน', 'ประเภทดิน', 'pH_ดิน', 'อินทรียวัตถุ_%', 'N_ppm', 'P_ppm', 'K_ppm', 'ระบบน้ำ', 'โซน', 'ชาวไร่'], requiredCoverage: 0.7 },
    themeId: 'lime',
    templateFile: 'sugar/agri_34.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 08_Agriculture · 35_การใส่ปุ๋ยและสารเคมี.xlsx — sheet "Data", 10 cols / 600 rows
  {
    id: 'sugar_agri_35',
    nameTH: 'ไร่อ้อย — การใส่ปุ๋ยและสารเคมี',
    fingerprint: { columns: ['วันที่', 'รหัสแปลง', 'ชนิด', 'ปริมาณ_กก_ต่อไร่', 'พื้นที่_ไร่', 'ปริมาณรวม_กก', 'ค่าใช้จ่าย_บาท', 'ผู้ดำเนินการ', 'วิธีใส่', 'หมายเหตุ'], requiredCoverage: 0.7 },
    themeId: 'lime',
    templateFile: 'sugar/agri_35.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 08_Agriculture · 36_น้ำฝนและชลประทาน.xlsx — sheet "Data", 7 cols / 1825 rows
  {
    id: 'sugar_agri_36',
    nameTH: 'ไร่อ้อย — น้ำฝนและชลประทาน',
    fingerprint: { columns: ['วันที่', 'โซน', 'ปริมาณฝน_มม', 'ปริมาณน้ำชลประทาน_ม3', 'อุณหภูมิสูงสุด_C', 'อุณหภูมิต่ำสุด_C', 'ความชื้น_%'], requiredCoverage: 0.7 },
    themeId: 'lime',
    templateFile: 'sugar/agri_36.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 08_Agriculture · 37_ทะเบียนชาวไร่.xlsx — sheet "Data", 11 cols / 80 rows
  {
    id: 'sugar_agri_37',
    nameTH: 'ไร่อ้อย — ทะเบียนชาวไร่',
    fingerprint: { columns: ['รหัสชาวไร่', 'ชื่อ', 'โทรศัพท์', 'ที่อยู่', 'พื้นที่รวม_ไร่', 'โควตาอ้อย_ตัน', 'จำนวนแปลง', 'ปีที่เริ่มส่ง', 'เงื่อนไข', 'ค้างชำระ_บาท', 'ระดับ'], requiredCoverage: 0.7 },
    themeId: 'lime',
    templateFile: 'sugar/agri_37.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  },

  // 08_Agriculture · 38_ข้อมูลส่งอ้อยเข้าหีบ.xlsx — sheet "Data", 17 cols / 6000 rows
  {
    id: 'sugar_agri_38',
    nameTH: 'ไร่อ้อย — ข้อมูลส่งอ้อยเข้าหีบ',
    fingerprint: { columns: ['วันที่', 'เลขที่ใบชั่ง', 'ทะเบียนรถ', 'ชาวไร่', 'รหัสแปลง', 'น้ำหนักรวม_กก', 'น้ำหนักรถเปล่า_กก', 'น้ำหนักสุทธิ_กก', 'CCS', 'ราคาอ้อย_บาทตัน', 'มูลค่า_บาท', 'ประเภทการตัด', 'เวลาชั่งเข้า', 'Brix', 'Pol', 'Fiber_%', 'Trash_%'], requiredCoverage: 0.7 },
    themeId: 'lime',
    templateFile: 'sugar/agri_38.html',
    inject: { mode: 'file', input: '#file', hide: ['#reload'] }
  }

];
