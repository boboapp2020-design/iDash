/**
 * iDash Known-Dataset Registry — DATA ONLY (no logic; the matcher lives in
 * app/js/known_dataset_registry.js).
 *
 * Each entry pairs a dataset "fingerprint" (the normalized column names of a
 * known file) with a hand-curated dashboard blueprint: explicit column→widget
 * bindings + the aggregation that actually makes business sense for that
 * data (e.g. PR/PO document numbers are COUNTED, never summed).
 *
 * Growing this library is the product's learning loop: an unknown upload
 * offers a "เรียนรู้ข้อมูลชุดนี้" export; the owner hands that packet to
 * Claude, which appends a new entry here. No backend, no API.
 *
 * Entry format:
 *   id, nameTH
 *   fingerprint: { columns: [normalized names], requiredCoverage: 0..1 }
 *   themeId: id from theme_palette.js
 *   blueprint:
 *     kpis: [{ col, label, agg: 'sum'|'avg'|'count'|'countDistinct', suffix? }]
 *     chartPlan: [ same entry shape buildChartPlan emits; agg:'count'
 *                  supported on line/donut/bar for record counting ]
 */
window.iDashKnownDatasetEntries = [

  // ── 1. งบประมาณรายปีตามหน่วยงาน (Annual budget by department) ────────
  // Paired sample: app/data/samples/annual_budget_by_department.json (160 rows).
  {
    id: 'annual_budget_by_department',
    nameTH: 'งบประมาณ — ค่าใช้จ่ายรายหน่วยงาน',
    fingerprint: {
      columns: [
        'code a', 'รหัสหน่วยงาน/cct', 'ชื่อหน่วยงาน', 'รหัสบัญชี /gl', 'ชื่อบัญชี',
        'รวมทั้งปี', 'เดือน 1', 'เดือน 2', 'เดือน 3', 'เดือน 4', 'เดือน 5', 'เดือน 6',
        'เดือน 7', 'เดือน 8', 'เดือน 9', 'เดือน 10', 'เดือน 11', 'เดือน 12'
      ],
      requiredCoverage: 0.8
    },
    themeId: 'forest',
    blueprint: {
      kpis: [
        { col: 'รวมทั้งปี', label: 'งบประมาณรวมทั้งปี', agg: 'sum' },
        { col: 'ชื่อหน่วยงาน', label: 'จำนวนหน่วยงาน', agg: 'countDistinct' },
        { col: 'ชื่อบัญชี', label: 'จำนวนรายการบัญชี', agg: 'countDistinct' }
      ],
      chartPlan: [
        { role: 'breakdown', type: 'bar', textCol: 'ชื่อหน่วยงาน', numCol: 'รวมทั้งปี', title: 'งบประมาณตามหน่วยงาน', fullWidth: true },
        { role: 'composition', type: 'donut', textCol: 'ชื่อหน่วยงาน', numCol: 'รวมทั้งปี', title: 'สัดส่วนงบประมาณตามหน่วยงาน' },
        { role: 'breakdown', type: 'bar', textCol: 'ชื่อบัญชี', numCol: 'รวมทั้งปี', title: 'งบประมาณตามบัญชี (Top 15)' }
      ]
    }
  },

  // ── 3. CRM Sales Pipeline ─────────────────────────────────────────────
  // Paired sample: app/data/samples/crm_sales_pipeline.json (80 rows).
  {
    id: 'crm_sales_pipeline',
    nameTH: 'ฝ่ายขาย — CRM Pipeline',
    fingerprint: {
      columns: [
        'deal_id', 'company', 'contact', 'source', 'industry', 'stage',
        'deal_value', 'probability', 'weighted_value', 'owner',
        'created_date', 'expected_close', 'last_activity_days'
      ],
      requiredCoverage: 0.8
    },
    themeId: 'dark_midnight',
    blueprint: {
      kpis: [
        { col: 'deal_value', label: 'มูลค่าดีลรวม', agg: 'sum' },
        { col: 'weighted_value', label: 'มูลค่าถ่วงน้ำหนัก', agg: 'sum' },
        { col: 'deal_id', label: 'จำนวนดีล', agg: 'countDistinct' },
        { col: 'probability', label: 'ความน่าจะเป็นเฉลี่ย', agg: 'avg' }
      ],
      chartPlan: [
        { role: 'breakdown', type: 'bar', textCol: 'stage', numCol: 'deal_value', title: 'มูลค่าดีลตามขั้นตอน (Pipeline)', fullWidth: true },
        { role: 'composition', type: 'donut', textCol: 'source', numCol: 'deal_value', title: 'สัดส่วนมูลค่าดีลตามแหล่งที่มา' },
        { role: 'breakdown', type: 'bar', textCol: 'owner', numCol: 'deal_value', title: 'มูลค่าดีลตามเจ้าของดีล' },
        { role: 'trend', type: 'line', timeCol: 'created_date', numCols: ['deal_value'], title: 'มูลค่าดีลใหม่ตามช่วงเวลา' }
      ]
    }
  }

];
