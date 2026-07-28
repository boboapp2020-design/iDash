// Auto-generated KB bundle for file:// offline mode
// Contains all domain packs and KPI defs
(function(){
'use strict';

window.__KB_DOMAIN_PACKS = {};
window.__KB_DOMAIN_PACKS['ecommerce_retail'] = {
  "id": "ecommerce_retail",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "อีคอมเมิร์ซและค้าปลีก",
    "nameEN": "E-commerce & Retail",
    "nameLO": "ອີຄອມເມີສ ແລະ ຄ້າປີກ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "คำสั่งซื้อ", "หมายเลขคำสั่งซื้อ", "ตะกร้า", "ชำระเงิน",
          "ค่าจัดส่ง", "ค่าส่ง", "ที่อยู่จัดส่ง", "วิธีชำระ",
          "สินค้า", "รหัสสินค้า", "ชื่อสินค้า", "หมวดสินค้า",
          "ราคา", "ราคาขาย", "ส่วนลด", "คูปอง", "โปรโมชั่น",
          "จำนวนสั่ง", "ยอดรวม", "ยอดสุทธิ",
          "ลูกค้า", "สมาชิก", "ลูกค้าใหม่", "ลูกค้าเก่า",
          "คืนสินค้า", "เปลี่ยนสินค้า", "คืนเงิน",
          "แพลตฟอร์ม", "Shopee", "Lazada", "LINE", "เว็บไซต์",
          "รีวิว", "ให้คะแนน", "ดาว", "ความพึงพอใจ",
          "สถานะคำสั่งซื้อ", "รอชำระ", "กำลังจัดส่ง", "ส่งแล้ว",
          "หน้าร้าน", "สาขา", "POS", "ใบเสร็จ"
        ],
        "en": [
          "order", "order id", "order number", "order date",
          "cart", "add to cart", "checkout", "basket",
          "product", "product id", "product name", "product category",
          "sku", "variant", "size", "color",
          "price", "unit price", "sale price", "discount", "coupon",
          "quantity", "subtotal", "total", "net amount",
          "shipping fee", "shipping cost", "delivery fee",
          "payment method", "credit card", "bank transfer", "cod",
          "customer", "customer id", "member", "new customer", "returning",
          "return", "refund", "exchange", "return rate",
          "platform", "shopee", "lazada", "amazon", "website", "marketplace",
          "review", "rating", "stars",
          "order status", "pending", "shipped", "delivered", "cancelled",
          "browse", "view", "wishlist", "favorite",
          "store", "branch", "pos", "receipt",
          "gmv", "gross merchandise value", "aov",
          "repeat purchase", "purchase frequency", "customer lifetime value",
          "conversion rate", "cart abandonment", "bounce rate"
        ],
        "lo": [
          "ຄຳສັ່ງຊື້", "ສິນຄ້າ", "ລາຄາ", "ລູກຄ້າ",
          "ຊຳລະ", "ຈັດສົ່ງ", "ຄ່າສົ່ງ", "ສ່ວນລົດ",
          "ຮ້ານ", "ສາຂາ"
        ]
      },
      "sheets": [
        "orders", "คำสั่งซื้อ", "รายการขาย", "sales",
        "products", "สินค้า", "customers", "ลูกค้า",
        "returns", "คืนสินค้า", "inventory", "POS",
        "shopee", "lazada", "marketplace"
      ],
      "weightPerHit": 1.5
    },
    "valueShapes": [
      {
        "columnLike": "cart.abandonment|อัตราทิ้งตะกร้า",
        "type": "percentage",
        "range": [30, 90],
        "weight": 3.5,
        "note": "Cart abandonment rate; definitive ecommerce metric"
      },
      {
        "columnLike": "return.rate|อัตราคืนสินค้า|refund.rate",
        "type": "percentage",
        "range": [0, 30],
        "weight": 3.0,
        "note": "Product return/refund rate"
      },
      {
        "columnLike": "aov|average.order.value|มูลค่าเฉลี่ยต่อคำสั่ง",
        "type": "number",
        "range": [50, 50000],
        "weight": 2.5,
        "note": "Average order value"
      },
      {
        "columnLike": "gmv|gross.merchandise|ยอดขายรวม",
        "type": "number",
        "range": [1000, 1000000000],
        "weight": 2.5,
        "note": "Gross Merchandise Value"
      },
      {
        "columnLike": "conversion.rate|cvr|อัตราคอนเวอร์ชั่น",
        "type": "percentage",
        "range": [0.5, 15],
        "weight": 2.5,
        "note": "Site/app conversion rate"
      },
      {
        "columnLike": "shipping.fee|ค่าจัดส่ง|ค่าส่ง|delivery.fee",
        "type": "number",
        "range": [0, 500],
        "weight": 2.0,
        "note": "Per-order shipping fee"
      }
    ],
    "unitPatterns": [
      "บาท", "THB", "ชิ้น", "รายการ", "ออเดอร์",
      "ดาว", "stars", "คะแนน", "คำสั่ง"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis", "โรค"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse", "อ้อย"], "weight": -2.0 },
      { "lexicon": ["oee", "defect rate", "cycle time", "mtbf"], "weight": -2.0 },
      { "lexicon": ["salary", "เงินเดือน", "payroll", "turnover rate"], "weight": -2.0 },
      { "lexicon": ["gl", "general ledger", "debit", "credit", "trial balance"], "weight": -2.0 },
      { "lexicon": ["student", "enrollment", "gpa", "semester", "curriculum"], "weight": -3.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type"], "weight": -2.5 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading"], "weight": -2.0 },
      { "lexicon": ["impression", "ctr", "cpc", "roas", "campaign_id", "ad_group"], "weight": -1.5 },
      { "lexicon": ["pipeline", "deal", "opportunity", "quota", "salesperson"], "weight": -2.0 },
      { "lexicon": ["subscriber", "dau", "mau", "activation", "mrr", "arr", "churn_rate", "arpu", "expansion_mrr", "net_new_mrr"], "weight": -3.0 },
      { "lexicon": ["protocol", "chain", "apy", "staking", "defi", "wallet", "token", "ticker", "open", "high", "low", "close", "market_cap"], "weight": -3.0 },
      { "lexicon": ["goals", "assists", "tackles", "player", "league", "match", "games_played", "pass_accuracy"], "weight": -3.0 },
      { "lexicon": ["property", "bedrooms", "rent", "tenant", "mortgage", "gross_yield", "net_yield"], "weight": -2.5 },
      { "lexicon": ["menu", "recipe", "prep_time", "ingredient", "food_cost", "restaurant"], "weight": -2.5 },
      { "lexicon": ["sprint", "story_points", "epic", "assignee", "task_id"], "weight": -2.0 },
      { "lexicon": ["requisition", "procurement", "tender", "จัดซื้อ", "ผู้ขาย", "purchase requisition", "purchasing group"], "weight": -3.0 },
      { "lexicon": ["asset_class", "unrealized_pnl", "dividend_yield", "portfolio"], "weight": -2.5 },
      { "lexicon": ["doctors", "nurses", "patients_mtd", "infection_rate", "avg_wait_min"], "weight": -3.0 },
      { "lexicon": ["feature", "adoption_rate", "active_30d", "total_users", "avg_usage_per_day", "support_tickets"], "weight": -2.5 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "purchase_flow",
        "stages": ["เลือกสินค้า", "หยิบใส่ตะกร้า", "ชำระเงิน", "ยืนยันคำสั่งซื้อ", "จัดเตรียม", "จัดส่ง", "รับสินค้า"]
      },
      {
        "id": "returns_management",
        "stages": ["แจ้งคืน/เปลี่ยน", "อนุมัติ", "รับสินค้าคืน", "ตรวจสอบ", "คืนเงิน/เปลี่ยน"]
      },
      {
        "id": "merchandising",
        "stages": ["เลือกสินค้า", "กำหนดราคา", "จัดโปรโมชั่น", "จัดหน้าร้าน/เว็บ", "ติดตามยอด", "ปรับปรุง"]
      }
    ],
    "goals": [
      "grow GMV and revenue",
      "increase conversion rate and reduce cart abandonment",
      "increase average order value",
      "reduce return/refund rate",
      "grow customer base and repeat purchase rate",
      "optimize product assortment and pricing",
      "expand marketplace channel presence",
      "improve customer satisfaction and review scores"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["GMV trend", "customer growth", "platform performance", "margin"],
        "cadence": "weekly"
      },
      {
        "type": "ecommerce_manager",
        "cares": ["conversion funnel", "top products", "return rate", "promotion effectiveness"],
        "cadence": "daily"
      },
      {
        "type": "merchandiser",
        "cares": ["product performance", "stock vs demand", "pricing", "category mix"],
        "cadence": "daily"
      }
    ],
    "decisionCatalog": [
      "optimize-pricing",
      "manage-assortment",
      "explain-variance",
      "reduce-returns",
      "plan-promotion",
      "plan-forecast",
      "expand-channel",
      "improve-conversion"
    ],
    "seasonality": "Mega-sale events (11.11, 12.12, 9.9, Black Friday). Holiday gifting seasons. Payday spikes (25th-1st monthly). Back-to-school, Songkran, year-end."
  },

  "kpiRefs": [
    "kpi.ecom.gmv",
    "kpi.ecom.order_count",
    "kpi.ecom.aov",
    "kpi.ecom.conversion_rate",
    "kpi.ecom.cart_abandonment",
    "kpi.ecom.return_rate",
    "kpi.ecom.repeat_purchase_rate",
    "kpi.ecom.customer_count",
    "kpi.ecom.revenue_per_customer",
    "kpi.ecom.avg_rating"
  ],

  "genomeRefs": [
    "genome.ecom_sales_overview_v1",
    "genome.ecom_product_performance_v1",
    "genome.ecom_customer_analysis_v1"
  ],

  "vizOverrides": [
    { "rule": "line chart for GMV/order count trend over time", "cites": "doc 06 §3" },
    { "rule": "bar chart for revenue by product category or platform", "cites": "doc 06 §3" },
    { "rule": "funnel for purchase funnel (view → cart → checkout → purchase)", "cites": "doc 06 §5" },
    { "rule": "donut for revenue by platform/channel mix", "cites": "doc 06 §2" }
  ],

  "fixtures": []
}
;

window.__KB_DOMAIN_PACKS['education'] = {
  "id": "education",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "การศึกษา",
    "nameEN": "Education",
    "nameLO": "ການສຶກສາ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "นักเรียน", "นักศึกษา", "รหัสนักเรียน", "รหัสนักศึกษา",
          "ชั้น", "ห้อง", "ระดับชั้น", "สาย", "แผนก",
          "วิชา", "รายวิชา", "รหัสวิชา", "หน่วยกิต",
          "คะแนน", "เกรด", "GPA", "ผลการเรียน", "ผลสอบ",
          "ภาคเรียน", "ปีการศึกษา", "เทอม",
          "อาจารย์", "ครู", "ผู้สอน", "อาจารย์ที่ปรึกษา",
          "ลงทะเบียน", "สมัครเรียน", "จำนวนผู้เรียน",
          "ขาดเรียน", "มาเรียน", "ลา", "สาย",
          "สอบ", "สอบกลางภาค", "สอบปลายภาค", "คะแนนสอบ",
          "หลักสูตร", "โปรแกรม", "คณะ", "สาขา",
          "ทุน", "ทุนการศึกษา", "ค่าเทอม", "ค่าลงทะเบียน",
          "จบการศึกษา", "สำเร็จการศึกษา", "ออกกลางคัน",
          "กิจกรรม", "ชมรม", "โครงการ",
          "ห้องเรียน", "ตารางเรียน", "ตารางสอน", "คาบเรียน"
        ],
        "en": [
          "student", "student id", "student name", "student number",
          "grade", "class", "section", "level", "year",
          "course", "course code", "course name", "subject",
          "credit", "credits", "credit hours",
          "score", "mark", "marks", "gpa", "cgpa", "grade point",
          "semester", "term", "academic year",
          "teacher", "instructor", "professor", "faculty",
          "enrollment", "enrolled", "registration",
          "attendance", "absent", "present", "tardy",
          "exam", "midterm", "final exam", "quiz", "test",
          "curriculum", "program", "major", "minor", "department",
          "scholarship", "tuition", "fee", "tuition fee",
          "graduation", "graduated", "dropout", "withdrawn",
          "assignment", "homework", "project", "thesis",
          "activity", "club", "extracurricular",
          "classroom", "schedule", "timetable", "period",
          "completion rate", "pass rate", "fail rate",
          "avg grade", "class average", "percentile", "rank"
        ],
        "lo": [
          "ນັກຮຽນ", "ນັກສຶກສາ", "ຫ້ອງ", "ຊັ້ນ",
          "ວິຊາ", "ຄະແນນ", "ເກຣດ", "ພາກຮຽນ",
          "ອາຈານ", "ຄູ", "ລົງທະບຽນ", "ຫຼັກສູດ",
          "ທຶນ", "ສອບ", "ຈົບ"
        ]
      },
      "sheets": [
        "student", "นักเรียน", "นักศึกษา", "ผลการเรียน",
        "grade", "เกรด", "enrollment", "ลงทะเบียน",
        "attendance", "การมาเรียน", "course", "วิชา", "รายวิชา",
        "exam", "สอบ", "transcript", "schedule", "ตารางเรียน"
      ],
      "weightPerHit": 1.8
    },
    "valueShapes": [
      {
        "columnLike": "gpa|cgpa|เกรดเฉลี่ย|grade.point",
        "type": "number",
        "range": [0, 4],
        "weight": 3.5,
        "note": "GPA on 4.0 scale; definitive education metric"
      },
      {
        "columnLike": "credits|หน่วยกิต|credit.hours",
        "type": "number",
        "range": [1, 24],
        "weight": 2.5,
        "note": "Credit hours per course or semester"
      },
      {
        "columnLike": "completion.rate|อัตราจบ|pass.rate|อัตราผ่าน",
        "type": "percentage",
        "range": [30, 100],
        "weight": 3.0,
        "note": "Course or program completion/pass rate"
      },
      {
        "columnLike": "attendance.rate|อัตราเข้าเรียน",
        "type": "percentage",
        "range": [50, 100],
        "weight": 2.5,
        "note": "Student attendance rate"
      },
      {
        "columnLike": "dropout|ออกกลางคัน|withdrawn",
        "type": "percentage",
        "range": [0, 30],
        "weight": 2.5,
        "note": "Dropout/withdrawal rate"
      },
      {
        "columnLike": "exam.score|คะแนนสอบ|test.score|avg.grade",
        "type": "number",
        "range": [0, 100],
        "weight": 2.0,
        "note": "Exam or test score (0-100)"
      }
    ],
    "unitPatterns": [
      "คน", "หน่วยกิต", "credits", "คะแนน", "points",
      "คาบ", "periods", "ชั่วโมง", "บาท/เทอม"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis", "โรค"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse", "อ้อย"], "weight": -2.0 },
      { "lexicon": ["oee", "defect rate", "cycle time", "mtbf"], "weight": -2.0 },
      { "lexicon": ["salary", "เงินเดือน", "payroll"], "weight": -2.0 },
      { "lexicon": ["gl", "general ledger", "debit", "credit", "trial balance"], "weight": -2.0 },
      { "lexicon": ["pipeline", "deal", "opportunity", "win rate", "quota", "salesperson"], "weight": -2.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type", "guest"], "weight": -2.5 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading"], "weight": -2.0 },
      { "lexicon": ["impression", "ctr", "cpc", "roas", "campaign_id"], "weight": -2.0 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "shipping_fee", "marketplace"], "weight": -2.0 },
      { "lexicon": ["stock", "inventory", "reorder", "warehouse", "bin"], "weight": -2.0 },
      { "lexicon": ["employee", "headcount", "hire date", "resignation", "provident fund"], "weight": -2.0 },
      { "lexicon": ["sprint", "story_points", "epic", "assignee", "task_id", "labels", "project_health", "velocity"], "weight": -4.0 },
      { "lexicon": ["goals", "assists", "tackles", "player", "league", "match", "games_played", "pass_accuracy", "player_id", "market_value_m"], "weight": -4.0 },
      { "lexicon": ["subscriber", "dau", "mau", "mrr", "arr", "arpu"], "weight": -2.5 },
      { "lexicon": ["protocol", "chain", "apy", "staking", "defi", "token"], "weight": -2.5 },
      { "lexicon": ["doctors", "nurses", "patients_mtd", "infection_rate"], "weight": -3.0 },
      { "lexicon": ["property", "bedrooms", "monthly_rent", "tenant", "mortgage"], "weight": -2.5 },
      { "lexicon": ["tasks_total", "tasks_done", "tasks_blocked", "tasks_in_progress", "budget_spent", "budget_remaining", "risk_level", "progress_pct"], "weight": -4.0 },
      { "lexicon": ["tickets_resolved", "avg_resolution_hr", "first_contact_resolution", "csat_score", "reopen_rate", "handle_time", "quality_score", "agent"], "weight": -4.0 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "academic_cycle",
        "stages": ["ลงทะเบียน", "เรียน", "สอบกลางภาค", "สอบปลายภาค", "ตัดเกรด", "ประกาศผล"]
      },
      {
        "id": "student_lifecycle",
        "stages": ["สมัครเข้า", "คัดเลือก", "รับเข้า", "เรียน", "ฝึกงาน", "จบการศึกษา"]
      },
      {
        "id": "curriculum_management",
        "stages": ["ออกแบบหลักสูตร", "อนุมัติ", "จัดตารางสอน", "ดำเนินการสอน", "ประเมินหลักสูตร", "ปรับปรุง"]
      }
    ],
    "goals": [
      "improve student academic performance and GPA",
      "increase graduation rate and reduce dropout",
      "maintain high attendance rates",
      "ensure curriculum quality and relevance",
      "manage enrollment and class sizes effectively",
      "optimize faculty workload and teaching quality",
      "provide scholarship support where needed",
      "track and improve student satisfaction"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["enrollment trends", "graduation rate", "dropout rate", "institutional ranking"],
        "cadence": "semester"
      },
      {
        "type": "academic_admin",
        "cares": ["class schedules", "faculty assignments", "enrollment numbers", "grade distribution"],
        "cadence": "weekly"
      },
      {
        "type": "teacher",
        "cares": ["my class performance", "attendance", "at-risk students", "grade distribution"],
        "cadence": "weekly"
      }
    ],
    "decisionCatalog": [
      "identify-at-risk-students",
      "plan-curriculum",
      "explain-variance",
      "allocate-resources",
      "improve-teaching",
      "manage-enrollment",
      "award-scholarship",
      "plan-forecast"
    ],
    "seasonality": "Academic calendar: semesters (May-Sep, Nov-Mar in Thailand, varies globally). Enrollment peaks at semester start. Exam periods mid-term and end-of-term. Graduation season."
  },

  "kpiRefs": [
    "kpi.edu.enrollment_count",
    "kpi.edu.avg_gpa",
    "kpi.edu.pass_rate",
    "kpi.edu.dropout_rate",
    "kpi.edu.graduation_rate",
    "kpi.edu.attendance_rate",
    "kpi.edu.student_teacher_ratio",
    "kpi.edu.avg_exam_score",
    "kpi.edu.scholarship_count",
    "kpi.edu.course_completion_rate"
  ],

  "genomeRefs": [
    "genome.edu_academic_performance_v1",
    "genome.edu_enrollment_overview_v1",
    "genome.edu_attendance_tracker_v1"
  ],

  "vizOverrides": [
    { "rule": "bar chart for GPA distribution or grade distribution by course", "cites": "doc 06 §3" },
    { "rule": "line chart for enrollment/graduation trend over academic years", "cites": "doc 06 §3" },
    { "rule": "donut for student distribution by program/faculty", "cites": "doc 06 §2" },
    { "rule": "heatmap for attendance pattern by day-of-week × week", "cites": "doc 06 §5" }
  ],

  "fixtures": []
}
;

window.__KB_DOMAIN_PACKS['finance_accounting'] = {
  "id": "finance_accounting",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "การเงินและบัญชี",
    "nameEN": "Finance & Accounting",
    "nameLO": "ການເງິນ ແລະ ບັນຊີ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "บัญชี", "งบ", "รายรับ", "รายจ่าย", "กำไร", "ขาดทุน",
          "เดบิต", "เครดิต", "งบกำไรขาดทุน", "งบดุล", "งบแสดงฐานะ",
          "รายได้", "ต้นทุน", "ค่าใช้จ่าย", "กำไรขั้นต้น", "กำไรสุทธิ",
          "งบประมาณ", "ผังบัญชี", "รหัสบัญชี", "หมวดบัญชี",
          "ลูกหนี้", "เจ้าหนี้", "ใบแจ้งหนี้", "ใบเสร็จ",
          "ภาษี", "VAT", "หัก ณ ที่จ่าย", "ภาษีมูลค่าเพิ่ม",
          "เงินสด", "กระแสเงินสด", "เงินฝาก", "ดอกเบี้ย",
          "สินทรัพย์", "หนี้สิน", "ส่วนของเจ้าของ", "ทุน",
          "ค่าเสื่อมราคา", "ค่าตัดจำหน่าย", "งบลงทุน",
          "ศูนย์ต้นทุน", "หน่วยงาน", "แผนก", "โสหุ้ย",
          "ต้นทุนผันแปร", "ต้นทุนคงที่", "อัตรากำไร",
          "มูลค่าหนี้", "คงค้าง", "อายุหนี้", "วงเงินเครดิต",
          "ใบสำคัญจ่าย", "เงินสดต้นวัน", "เงินสดปลายวัน",
          "มูลค่าใบแจ้งหนี้", "สถานะการชำระ", "วันครบกำหนด"
        ],
        "en": [
          "gl", "general ledger", "account", "debit", "credit",
          "revenue", "expense", "profit", "loss", "income",
          "balance sheet", "income statement", "p&l", "pnl",
          "budget", "actual", "variance", "forecast",
          "cost center", "chart of accounts", "account code",
          "accounts receivable", "accounts payable", "ar", "ap",
          "invoice", "receipt", "payment", "aging",
          "tax", "vat", "withholding tax",
          "cash flow", "cash", "bank", "interest",
          "asset", "liability", "equity", "capital",
          "depreciation", "amortization", "capex", "opex",
          "gross margin", "net margin", "ebitda", "ebit",
          "journal entry", "trial balance", "closing",
          "fiscal year", "fy", "ytd", "mtd",
          "cost element", "overhead", "fixed cost", "variable cost"
        ],
        "lo": [
          "ບັນຊີ", "ລາຍຮັບ", "ລາຍຈ່າຍ", "ກຳໄລ", "ຂາດທຶນ",
          "ງົບປະມານ", "ເງິນສົດ", "ໜີ້ສິນ", "ຊັບສິນ",
          "ທຶນ", "ພາສີ", "ເງິນເດືອນ", "ຄ່າໃຊ້ຈ່າຍ",
          "ກະແສເງິນສົດ", "ເຈົ້າໜີ້", "ລູກໜີ້"
        ]
      },
      "sheets": [
        "GL", "general ledger", "บัญชี", "ผังบัญชี", "งบกำไรขาดทุน",
        "P&L", "balance sheet", "งบดุล", "budget", "งบประมาณ",
        "cash flow", "กระแสเงินสด", "AR", "AP", "ลูกหนี้", "เจ้าหนี้",
        "journal", "trial balance", "cost center", "ศูนย์ต้นทุน"
      ],
      "weightPerHit": 1.8
    },
    "valueShapes": [
      {
        "columnLike": "อัตรากำไรขั้นต้น|gross margin|GM%",
        "type": "percentage",
        "range": [0, 80],
        "weight": 3.0,
        "note": "Gross margin percentage; strong finance signal"
      },
      {
        "columnLike": "อัตรากำไรสุทธิ|net margin",
        "type": "percentage",
        "range": [-20, 50],
        "weight": 2.5,
        "note": "Net profit margin; can be negative"
      },
      {
        "columnLike": "budget variance|ส่วนต่างงบ",
        "type": "percentage",
        "range": [-50, 50],
        "weight": 2.5,
        "note": "Budget vs actual variance percentage"
      },
      {
        "columnLike": "aging|อายุหนี้",
        "type": "category",
        "range": null,
        "weight": 3.0,
        "note": "AR/AP aging buckets (current, 30, 60, 90, 120+ days)"
      },
      {
        "columnLike": "debit|เดบิต|credit|เครดิต",
        "type": "number",
        "range": null,
        "weight": 2.0,
        "note": "Debit/credit amounts; definitive GL signal"
      }
    ],
    "unitPatterns": [
      "บาท", "กีบ", "LAK", "THB", "USD", "฿",
      "ล้านบาท", "พันบาท", "ล้านกีบ"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis", "clinical", "dosage"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse", "อ้อย"], "weight": -2.0 },
      { "lexicon": ["defect rate", "oee", "cycle time"], "weight": -1.5 },
      { "lexicon": ["sprint", "backlog", "story_point", "velocity", "scrum", "tasks_blocked"], "weight": -3.0 },
      { "lexicon": ["sensor", "device_id", "telemetry", "firmware", "temperature_c", "humidity"], "weight": -3.0 },
      { "lexicon": ["impression", "ctr", "cpc", "cpa", "roas", "clicks", "campaign_id", "open_rate", "click_rate", "unsubscribe_rate", "bounce_rate", "conversions", "sessions", "campaign_name"], "weight": -3.0 },
      { "lexicon": ["emission", "carbon", "pollutant", "air_quality", "renewable", "pm25"], "weight": -2.0 },
      { "lexicon": ["student", "enrollment", "gpa", "credits", "semester", "exam_average"], "weight": -3.0 },
      { "lexicon": ["occupancy", "check_in", "room_type", "guest", "reservation"], "weight": -2.0 },
      { "lexicon": ["player", "goals_for", "assists", "tackles", "league"], "weight": -2.0 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading", "cost_per_delivery"], "weight": -1.5 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "shipping_fee", "marketplace", "shopee", "lazada"], "weight": -2.0 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "accounting_cycle",
        "stages": ["บันทึกรายการ", "ผ่านรายการ", "ปรับปรุง", "ปิดบัญชี", "จัดทำงบ", "ตรวจสอบ"]
      },
      {
        "id": "budget_management",
        "stages": ["จัดทำงบประมาณ", "อนุมัติ", "จัดสรร", "ติดตามใช้จ่าย", "ทบทวน", "ปรับแผน"]
      },
      {
        "id": "receivables_management",
        "stages": ["ออกใบแจ้งหนี้", "ติดตามชำระ", "รับชำระ", "ตัดหนี้สูญ"]
      },
      {
        "id": "payables_management",
        "stages": ["รับใบแจ้งหนี้", "ตรวจสอบ", "อนุมัติจ่าย", "ชำระเงิน", "บันทึกบัญชี"]
      }
    ],
    "goals": [
      "close books accurately and on time",
      "optimize cost structure and reduce expense ratio",
      "maintain healthy cash flow and liquidity",
      "minimize AR aging and bad debt",
      "achieve budget compliance across departments",
      "maximize gross margin and EBITDA",
      "ensure tax compliance and optimize tax position",
      "provide timely and accurate financial reporting"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["revenue trend", "profit margin", "cash position", "budget variance"],
        "cadence": "monthly"
      },
      {
        "type": "finance_manager",
        "cares": ["cash flow", "AR aging", "AP scheduling", "budget utilization"],
        "cadence": "weekly"
      },
      {
        "type": "accountant",
        "cares": ["journal accuracy", "reconciliation", "closing checklist", "GL balance"],
        "cadence": "daily"
      }
    ],
    "decisionCatalog": [
      "explain-variance",
      "optimize-cost",
      "plan-forecast",
      "allocate-budget",
      "approve-expenditure",
      "collect-receivable",
      "schedule-payment",
      "close-period"
    ],
    "seasonality": "Fiscal year cycles (annual closing, quarterly reporting). Budget season typically Q4. Tax filing deadlines. Month-end close pressure."
  },

  "kpiRefs": [
    "kpi.fin.revenue",
    "kpi.fin.gross_margin_pct",
    "kpi.fin.net_margin_pct",
    "kpi.fin.ebitda",
    "kpi.fin.expense_ratio",
    "kpi.fin.budget_variance",
    "kpi.fin.ar_aging_avg_days",
    "kpi.fin.ap_aging_avg_days",
    "kpi.fin.cash_flow_net",
    "kpi.fin.current_ratio",
    "kpi.fin.cost_per_unit",
    "kpi.fin.opex_vs_budget"
  ],

  "genomeRefs": [
    "genome.fin_pnl_monthly_v1",
    "genome.fin_budget_tracking_v1",
    "genome.fin_cash_flow_v1",
    "genome.fin_ar_ap_aging_v1"
  ],

  "vizOverrides": [
    { "rule": "waterfall chart for P&L breakdown (revenue → COGS → gross profit → opex → EBIT)", "cites": "doc 06 §4" },
    { "rule": "variance bar chart for budget vs actual by cost center", "cites": "doc 06 §3" },
    { "rule": "stacked horizontal bar for AR/AP aging buckets", "cites": "doc 06 §3" },
    { "rule": "line+area for cash flow trend with forecast band", "cites": "doc 06 §3" }
  ],

  "fixtures": [
    "ตัวอย่าง Data/Mock_Dashboard_Data/02_การเงินและบัญชี/*.json"
  ]
}
;

window.__KB_DOMAIN_PACKS['generic_business'] = {
  "id": "generic_business",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "ธุรกิจทั่วไป",
    "nameEN": "Generic Business",
    "nameLO": "ທຸລະກິດທົ່ວໄປ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "วันที่", "เดือน", "ปี", "จำนวน", "ยอดรวม",
          "มูลค่า", "หมวดหมู่", "ประเภท", "ชื่อ", "รหัส",
          "สถานะ", "หมายเหตุ", "รายการ", "ลำดับ",
          "กลุ่ม", "แผนก", "หน่วยงาน", "ผู้รับผิดชอบ",
          "เป้าหมาย", "ผลงาน", "อัตรา", "สัดส่วน",
          "เพิ่มขึ้น", "ลดลง", "เปรียบเทียบ", "แนวโน้ม"
        ],
        "en": [
          "date", "month", "year", "amount", "total",
          "value", "category", "type", "name", "code",
          "status", "remarks", "item", "sequence",
          "group", "department", "unit", "responsible",
          "target", "actual", "rate", "ratio",
          "increase", "decrease", "compare", "trend",
          "id", "description", "title", "label",
          "count", "score", "level", "result",
          "average", "percent", "pct",
          "city", "region", "country", "location",
          "notes", "created", "updated",
          "timestamp", "start_date", "end_date",
          "price", "cost", "quantity",
          "duration", "time", "hours", "days",
          "min", "max", "change", "size"
        ],
        "lo": [
          "ວັນທີ", "ເດືອນ", "ປີ", "ຈຳນວນ", "ຍອດລວມ",
          "ມູນຄ່າ", "ໝວດໝູ່", "ປະເພດ", "ຊື່", "ລະຫັດ",
          "ສະຖານະ", "ລາຍການ"
        ]
      },
      "sheets": [],
      "weightPerHit": 0.5
    },
    "valueShapes": [],
    "unitPatterns": [
      "บาท", "กีบ", "THB", "LAK", "USD",
      "ชิ้น", "รายการ", "ครั้ง", "คน", "วัน", "%"
    ],
    "negative": []
  },

  "business": {
    "processes": [
      {
        "id": "generic_workflow",
        "stages": ["วางแผน", "ดำเนินการ", "ติดตาม", "ประเมินผล", "ปรับปรุง"]
      }
    ],
    "goals": [
      "monitor key measures over time",
      "identify trends and outliers in the data",
      "compare performance across categories or dimensions",
      "understand concentration and distribution",
      "provide clear data summary for decision-making"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["top-line trends", "key metric changes", "distribution across categories"],
        "cadence": "weekly"
      },
      {
        "type": "analyst",
        "cares": ["patterns", "outliers", "correlations", "period-over-period changes"],
        "cadence": "ad-hoc"
      }
    ],
    "decisionCatalog": [
      "monitor",
      "explain-variance",
      "plan-forecast"
    ],
    "seasonality": "No assumed seasonality. If the profiler detects a date/time column, the system will surface temporal patterns automatically."
  },

  "kpiRefs": [
    "kpi.generic.top_measure_total",
    "kpi.generic.top_measure_trend",
    "kpi.generic.category_concentration",
    "kpi.generic.period_over_period_change",
    "kpi.generic.record_count",
    "kpi.generic.distinct_category_count"
  ],

  "genomeRefs": [
    "genome.generic_summary_v1"
  ],

  "vizOverrides": [
    { "rule": "bar chart for top-N categories by primary measure (fallback)", "cites": "doc 06 §3" },
    { "rule": "line chart when a date dimension and numeric measure are detected", "cites": "doc 06 §3" },
    { "rule": "KPI card for the single most important aggregate", "cites": "doc 06 §3" },
    { "rule": "table as safe fallback when no clear chart rule fires", "cites": "doc 06 §3" }
  ],

  "fixtures": []
}
;

window.__KB_DOMAIN_PACKS['hotel_hospitality'] = {
  "id": "hotel_hospitality",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "โรงแรมและบริการ",
    "nameEN": "Hotel & Hospitality",
    "nameLO": "ໂຮງແຮມ ແລະ ການບໍລິການ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "ห้องพัก", "ประเภทห้อง", "จำนวนห้อง", "ห้องว่าง", "ห้องที่จอง",
          "เช็คอิน", "เช็คเอาท์", "คืนที่พัก", "วันเข้าพัก", "วันออก",
          "อัตราเข้าพัก", "ราคาห้อง", "ราคาห้องเฉลี่ย", "รายได้ต่อห้อง",
          "ผู้เข้าพัก", "ชื่อลูกค้า", "สัญชาติ", "ช่องทางจอง",
          "จองตรง", "จองผ่านเอเจนซี่", "OTA", "walk in",
          "อาหารเช้า", "มินิบาร์", "สปา", "ซักรีด", "รูมเซอร์วิส",
          "ข้อร้องเรียน", "ความพึงพอใจ", "รีวิว", "คะแนนรีวิว",
          "ฤดูกาล", "ไฮซีซั่น", "โลว์ซีซั่น", "โปรโมชั่น",
          "กรุ๊ปทัวร์", "FIT", "สัมมนา", "จัดเลี้ยง", "ห้องประชุม",
          "ยอดจอง", "ยกเลิกจอง", "no show"
        ],
        "en": [
          "room", "room type", "room number", "room category",
          "check in", "check out", "check_in", "check_out",
          "nights", "length of stay", "los",
          "occupancy", "occupancy rate", "occ", "occupied rooms",
          "adr", "average daily rate", "room rate", "rate",
          "revpar", "revenue per available room",
          "guest", "guest name", "nationality", "guest count",
          "booking", "reservation", "booking channel", "booking source",
          "direct booking", "ota", "travel agent", "walk in",
          "no show", "no_show", "cancellation", "cancel rate",
          "housekeeping", "room status", "clean", "dirty", "inspected",
          "f&b", "food and beverage", "minibar", "spa", "laundry",
          "banquet", "conference", "meeting room", "event",
          "guest satisfaction", "review score", "rating",
          "high season", "low season", "peak", "shoulder",
          "group", "fit", "corporate", "leisure",
          "available rooms", "total rooms", "out of order"
        ],
        "lo": [
          "ຫ້ອງພັກ", "ແຂກ", "ຈອງ", "ເຂົ້າພັກ", "ອອກ",
          "ລາຄາຫ້ອງ", "ຄືນ", "ປະເພດຫ້ອງ", "ບໍລິການ"
        ]
      },
      "sheets": [
        "booking", "reservation", "การจอง", "ยอดจอง",
        "occupancy", "อัตราเข้าพัก", "room", "ห้องพัก",
        "guest", "ผู้เข้าพัก", "revenue", "รายได้",
        "housekeeping", "F&B", "banquet", "จัดเลี้ยง"
      ],
      "weightPerHit": 1.8
    },
    "valueShapes": [
      {
        "columnLike": "occupancy|อัตราเข้าพัก|occ.rate",
        "type": "percentage",
        "range": [10, 100],
        "weight": 3.5,
        "note": "Room occupancy rate; definitive hotel metric"
      },
      {
        "columnLike": "adr|average.daily.rate|ราคาห้องเฉลี่ย",
        "type": "number",
        "range": [500, 50000],
        "weight": 3.5,
        "note": "Average Daily Rate in local currency"
      },
      {
        "columnLike": "revpar|revenue.per.available|รายได้ต่อห้อง",
        "type": "number",
        "range": [200, 30000],
        "weight": 3.5,
        "note": "Revenue Per Available Room"
      },
      {
        "columnLike": "no.show|no_show",
        "type": "percentage",
        "range": [0, 30],
        "weight": 2.5,
        "note": "No-show rate"
      },
      {
        "columnLike": "length.of.stay|los|คืนที่พัก",
        "type": "number",
        "range": [1, 30],
        "weight": 2.0,
        "note": "Average length of stay in nights"
      },
      {
        "columnLike": "review.score|คะแนนรีวิว|guest.satisfaction",
        "type": "number",
        "range": [1, 10],
        "weight": 2.0,
        "note": "Guest review/satisfaction score"
      }
    ],
    "unitPatterns": [
      "คืน", "nights", "ห้อง", "rooms", "ท่าน", "pax",
      "บาท/คืน", "THB/night", "USD/night"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis", "โรค"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse", "อ้อย"], "weight": -2.0 },
      { "lexicon": ["oee", "defect rate", "cycle time", "mtbf"], "weight": -2.0 },
      { "lexicon": ["salary", "เงินเดือน", "payroll", "leave", "turnover rate"], "weight": -2.0 },
      { "lexicon": ["gl", "general ledger", "debit", "credit", "trial balance"], "weight": -2.0 },
      { "lexicon": ["pipeline", "deal", "opportunity", "win rate", "quota"], "weight": -2.0 },
      { "lexicon": ["student", "enrollment", "gpa", "semester", "curriculum"], "weight": -3.0 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading"], "weight": -2.0 },
      { "lexicon": ["impression", "ctr", "cpc", "roas", "campaign_id"], "weight": -2.0 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "browse", "wishlist", "sku"], "weight": -2.0 },
      { "lexicon": ["stock", "inventory", "reorder", "warehouse", "bin"], "weight": -2.0 },
      { "lexicon": ["doctors", "nurses", "patients_mtd", "infection_rate", "avg_wait_min", "avg_consult_min"], "weight": -4.0 },
      { "lexicon": ["property", "bedrooms", "monthly_rent", "annual_rent", "tenant", "mortgage", "purchase_price", "gross_yield", "net_yield"], "weight": -3.5 },
      { "lexicon": ["goals", "assists", "tackles", "player", "league", "match", "games_played", "pass_accuracy", "player_id"], "weight": -4.0 },
      { "lexicon": ["menu", "recipe", "prep_time", "ingredient", "food_cost", "popularity_rank"], "weight": -3.0 },
      { "lexicon": ["subscriber", "dau", "mau", "mrr", "arr", "arpu"], "weight": -2.5 },
      { "lexicon": ["protocol", "chain", "apy", "staking", "defi", "token"], "weight": -2.5 },
      { "lexicon": ["sprint", "story_points", "epic", "assignee", "task_id"], "weight": -2.0 },
      { "lexicon": ["table_id", "party_size", "wait_time", "special_requests", "reservation_id"], "weight": -3.5 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "guest_journey",
        "stages": ["จอง", "เช็คอิน", "เข้าพัก", "ใช้บริการ", "เช็คเอาท์", "ชำระเงิน", "รีวิว"]
      },
      {
        "id": "revenue_management",
        "stages": ["พยากรณ์ demand", "กำหนดราคา", "จัดโปรโมชั่น", "จัดสรรห้อง", "ติดตาม RevPAR"]
      },
      {
        "id": "housekeeping",
        "stages": ["ตรวจสอบสถานะห้อง", "ทำความสะอาด", "ตรวจรับ", "อัปเดตสถานะ"]
      }
    ],
    "goals": [
      "maximize occupancy rate",
      "increase ADR and RevPAR",
      "reduce no-show and cancellation rates",
      "improve guest satisfaction and review scores",
      "optimize channel mix (direct vs OTA)",
      "grow F&B and ancillary revenue",
      "manage seasonal demand effectively",
      "reduce operational cost per occupied room"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["RevPAR trend", "occupancy vs budget", "guest satisfaction", "channel performance"],
        "cadence": "weekly"
      },
      {
        "type": "revenue_manager",
        "cares": ["ADR", "booking pace", "forecast accuracy", "rate parity"],
        "cadence": "daily"
      },
      {
        "type": "front_office",
        "cares": ["today arrivals/departures", "room status", "no-shows", "guest requests"],
        "cadence": "per-shift"
      }
    ],
    "decisionCatalog": [
      "adjust-pricing",
      "manage-inventory",
      "optimize-channel",
      "explain-variance",
      "plan-forecast",
      "improve-service",
      "allocate-rooms",
      "investigate-complaint"
    ],
    "seasonality": "Strong seasonality: high season (Nov-Feb for tropical destinations, summer for temperate), low season discounts, holiday peaks (New Year, Songkran, Chinese New Year). Conference/event seasons."
  },

  "kpiRefs": [
    "kpi.htl.occupancy_rate",
    "kpi.htl.adr",
    "kpi.htl.revpar",
    "kpi.htl.total_room_revenue",
    "kpi.htl.no_show_rate",
    "kpi.htl.cancel_rate",
    "kpi.htl.avg_los",
    "kpi.htl.guest_satisfaction",
    "kpi.htl.direct_booking_pct",
    "kpi.htl.fb_revenue"
  ],

  "genomeRefs": [
    "genome.htl_occupancy_dashboard_v1",
    "genome.htl_revenue_management_v1",
    "genome.htl_guest_analysis_v1"
  ],

  "vizOverrides": [
    { "rule": "line chart for occupancy rate trend with ADR overlay on secondary context (use dual KPI cards, not dual axes)", "cites": "doc 06 §3" },
    { "rule": "bar chart for revenue by booking channel with direct-booking target line", "cites": "doc 06 §3" },
    { "rule": "donut for room type mix or nationality mix (limit 6 segments)", "cites": "doc 06 §2" },
    { "rule": "heatmap for occupancy by day-of-week × month", "cites": "doc 06 §5" }
  ],

  "fixtures": []
}
;

window.__KB_DOMAIN_PACKS['hr_people'] = {
  "id": "hr_people",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "ทรัพยากรบุคคล",
    "nameEN": "HR & People",
    "nameLO": "ຊັບພະຍາກອນບຸກຄົນ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "พนักงาน", "เงินเดือน", "ตำแหน่ง", "ลาออก", "เลิกจ้าง",
          "รหัสพนักงาน", "ชื่อ-สกุล", "แผนก", "หน่วยงาน", "ฝ่าย",
          "วันที่เริ่มงาน", "อายุงาน", "ประเภทการจ้าง",
          "พนักงานประจำ", "พนักงานรายวัน", "พนักงานสัญญาจ้าง",
          "จำนวนพนักงาน", "อัตรากำลัง", "อัตราการลาออก",
          "สวัสดิการ", "ค่าล่วงเวลา", "โอที", "เบี้ยเลี้ยง",
          "ลาป่วย", "ลากิจ", "ลาพักร้อน", "วันลา", "สิทธิ์ลา",
          "ประเมินผล", "คะแนนประเมิน", "KPI พนักงาน",
          "อบรม", "พัฒนา", "ชั่วโมงอบรม", "หลักสูตร",
          "สมัครงาน", "สัมภาษณ์", "บรรจุ", "ทดลองงาน",
          "ค่าจ้าง", "ค่าตอบแทน", "โบนัส", "ค่าครองชีพ",
          "ประกันสังคม", "กองทุนสำรองเลี้ยงชีพ",
          "เกษียณ", "ปลดเกษียณ", "โครงสร้างองค์กร",
          "ระดับ", "ชั้น", "ขั้น", "กลุ่มงาน"
        ],
        "en": [
          "employee", "staff", "headcount", "personnel",
          "salary", "wage", "compensation", "payroll", "pay",
          "position", "title", "role", "department", "division",
          "hire date", "start date", "tenure", "seniority",
          "turnover", "attrition", "resignation", "termination",
          "retention", "voluntary", "involuntary",
          "full time", "part time", "contract", "temporary",
          "leave", "absence", "sick leave", "vacation", "pto",
          "overtime", "ot", "allowance", "benefit",
          "performance review", "performance appraisal", "kpi",
          "training", "development", "learning hours",
          "recruitment", "hiring", "onboarding", "probation",
          "bonus", "incentive", "cost of living",
          "social security", "provident fund",
          "retirement", "org chart", "span of control",
          "grade", "level", "band", "job family",
          "comp ratio", "compa ratio", "market rate"
        ],
        "lo": [
          "ພະນັກງານ", "ເງິນເດືອນ", "ຕຳແໜ່ງ", "ລາອອກ",
          "ແຜນກ", "ຫົວໜ່ວຍ", "ຝ່າຍ", "ສະຫວັດດີການ",
          "ປະກັນສັງຄົມ", "ອົບຮົມ", "ຄ່າຈ້າງ", "ໂບນັດ",
          "ລາພັກ", "ລາປ່ວຍ", "ການຈ້າງ"
        ]
      },
      "sheets": [
        "employee", "พนักงาน", "ทรัพยากรบุคคล", "HR",
        "headcount", "อัตรากำลัง", "salary", "เงินเดือน",
        "payroll", "leave", "วันลา", "training", "อบรม",
        "performance review", "ประเมินผล", "recruitment", "สมัครงาน",
        "turnover", "การลาออก", "org chart"
      ],
      "weightPerHit": 1.5
    },
    "valueShapes": [
      {
        "columnLike": "อัตราการลาออก|turnover rate|attrition rate|attrition %",
        "type": "percentage",
        "range": [0, 50],
        "weight": 3.5,
        "note": "Annual turnover/attrition rate; definitive HR metric"
      },
      {
        "columnLike": "comp ratio|compa ratio|อัตราค่าตอบแทนเทียบตลาด",
        "type": "percentage",
        "range": [70, 150],
        "weight": 3.0,
        "note": "Compensation ratio vs market midpoint"
      },
      {
        "columnLike": "อายุงาน|tenure|seniority",
        "type": "number",
        "range": [0, 40],
        "weight": 2.0,
        "note": "Years of service"
      },
      {
        "columnLike": "training hours|ชั่วโมงอบรม|learning hours",
        "type": "number",
        "range": [0, 200],
        "weight": 2.0,
        "note": "Training hours per employee per year"
      },
      {
        "columnLike": "performance rating|คะแนนประเมิน|appraisal score",
        "type": "number",
        "range": [1, 5],
        "weight": 2.5,
        "note": "Performance rating on typical 1-5 scale"
      },
      {
        "columnLike": "absence rate|อัตราการขาดงาน|sick rate",
        "type": "percentage",
        "range": [0, 20],
        "weight": 2.5,
        "note": "Absence/sick leave rate"
      }
    ],
    "unitPatterns": [
      "คน", "อัตรา", "ตำแหน่ง", "บาท/เดือน", "กีบ/เดือน",
      "ชั่วโมง/คน", "วัน/คน", "headcount", "FTE"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis", "โรค"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse", "อ้อย"], "weight": -2.0 },
      { "lexicon": ["stock", "inventory", "sku", "reorder", "product_id", "units_sold"], "weight": -1.5 },
      { "lexicon": ["pipeline", "deal", "opportunity", "win rate"], "weight": -1.5 },
      { "lexicon": ["player", "goals_for", "assists", "tackles", "league", "standings", "match_result", "scored"], "weight": -3.0 },
      { "lexicon": ["student", "enrollment", "gpa", "credits", "semester", "curriculum", "instructor", "completion_rate", "avg_grade", "dropout", "enrolled"], "weight": -3.0 },
      { "lexicon": ["followers", "likes", "shares", "impressions", "reach", "hashtag", "post_id"], "weight": -3.0 },
      { "lexicon": ["incident_id", "severity", "deployment", "uptime", "firmware", "sensor"], "weight": -2.0 },
      { "lexicon": ["guest", "booking", "occupancy", "check_in", "room_type"], "weight": -2.0 },
      { "lexicon": ["pageviews", "bounce_rate", "sessions", "page_path", "core_web_vital"], "weight": -2.0 },
      { "lexicon": ["supplier", "requisition", "purchase_order", "ผู้ขาย", "จัดซื้อ"], "weight": -2.0 },
      { "lexicon": ["protocol", "chain", "apy", "defi", "staking", "wallet", "token", "pool"], "weight": -3.0 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading", "cost_per_delivery"], "weight": -2.0 },
      { "lexicon": ["impression", "ctr", "cpc", "roas", "campaign_id", "ad_group"], "weight": -2.0 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "shipping_fee", "marketplace", "shopee", "lazada"], "weight": -2.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type", "no_shows"], "weight": -2.0 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "hire_to_retire",
        "stages": ["วางแผนอัตรากำลัง", "สรรหา", "สัมภาษณ์/คัดเลือก", "บรรจุ/ทดลองงาน", "พัฒนา", "ประเมินผล", "เกษียณ/ลาออก"]
      },
      {
        "id": "payroll_cycle",
        "stages": ["บันทึกเวลา", "คำนวณค่าจ้าง/OT", "หักภาษี/ประกันสังคม", "อนุมัติ", "จ่ายเงินเดือน"]
      },
      {
        "id": "performance_management",
        "stages": ["ตั้งเป้าหมาย", "ติดตามผลงาน", "ประเมินกลางปี", "ประเมินปลายปี", "จ่ายโบนัส/ปรับเงินเดือน"]
      },
      {
        "id": "training_development",
        "stages": ["สำรวจความต้องการ", "จัดทำแผนอบรม", "ดำเนินการ", "ประเมินผลอบรม", "ติดตามการนำไปใช้"]
      }
    ],
    "goals": [
      "attract and retain quality talent",
      "reduce turnover rate especially in critical roles",
      "develop employee capabilities and career paths",
      "ensure competitive compensation and benefits",
      "maintain optimal headcount and staffing ratios",
      "improve employee engagement and satisfaction",
      "ensure labor law compliance",
      "optimize HR cost as percentage of revenue"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["headcount vs budget", "turnover trend", "HR cost ratio", "engagement score"],
        "cadence": "monthly"
      },
      {
        "type": "hr_manager",
        "cares": ["vacancies", "attrition hotspots", "training compliance", "payroll accuracy"],
        "cadence": "weekly"
      },
      {
        "type": "department_head",
        "cares": ["my team headcount", "leave patterns", "performance ratings", "overtime cost"],
        "cadence": "monthly"
      }
    ],
    "decisionCatalog": [
      "manage-people",
      "allocate-headcount",
      "plan-forecast",
      "explain-variance",
      "investigate-turnover",
      "approve-compensation",
      "develop-talent",
      "optimize-workforce"
    ],
    "seasonality": "Annual performance review cycle (typically Q4 or fiscal year-end). Bonus/salary adjustment season. New graduate hiring season (Mar-Jun). Seasonal labor for crushing season (Nov-Apr) in sugar factories."
  },

  "kpiRefs": [
    "kpi.hr.headcount",
    "kpi.hr.turnover_rate",
    "kpi.hr.voluntary_turnover",
    "kpi.hr.time_to_fill",
    "kpi.hr.comp_ratio",
    "kpi.hr.training_hours_per_employee",
    "kpi.hr.absence_rate",
    "kpi.hr.overtime_rate",
    "kpi.hr.tenure_avg",
    "kpi.hr.hr_cost_ratio",
    "kpi.hr.engagement_score",
    "kpi.hr.vacancy_rate"
  ],

  "genomeRefs": [
    "genome.hr_headcount_overview_v1",
    "genome.hr_turnover_analysis_v1",
    "genome.hr_compensation_review_v1"
  ],

  "vizOverrides": [
    { "rule": "treemap or sunburst for org structure / headcount by department", "cites": "doc 06 §5" },
    { "rule": "bar chart for turnover rate by department with company-average reference line", "cites": "doc 06 §3" },
    { "rule": "histogram for tenure distribution", "cites": "doc 06 §5" },
    { "rule": "heatmap for leave patterns by month and department", "cites": "doc 06 §5" }
  ],

  "fixtures": [
    "ตัวอย่าง Data/Mock_Dashboard_Data/09_ทรัพยากรบุคคล/*.json"
  ]
}
;

window.__KB_DOMAIN_PACKS['inventory_warehouse'] = {
  "id": "inventory_warehouse",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "คลังสินค้าและสินค้าคงคลัง",
    "nameEN": "Inventory & Warehouse",
    "nameLO": "ສາງສິນຄ້າ ແລະ ສິນຄ້າຄົງຄັງ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "สต็อก", "คลัง", "รับ", "จ่าย", "สินค้า", "คงเหลือ",
          "คลังสินค้า", "คลังพัสดุ", "สินค้าคงคลัง", "พัสดุ",
          "อะไหล่", "วัสดุ", "รับเข้า", "เบิกใช้", "โอนย้าย",
          "จุดสั่งซื้อ", "จุดสั่งซื้อขั้นต่ำ", "สต็อกขั้นต่ำ",
          "ยอดคงเหลือ", "จำนวนคงเหลือ", "มูลค่าคงคลัง",
          "เลขที่เอกสาร", "ใบรับ", "ใบเบิก", "ใบโอน",
          "หมวดหมู่", "รหัสพัสดุ", "ชื่อพัสดุ", "คลังจัดเก็บ",
          "สินค้าสำเร็จรูป", "น้ำหนักคงเหลือ", "หน่วยบรรจุ",
          "เกรดคุณภาพ", "ประเภทการเคลื่อนไหว",
          "สินค้าค้างสต็อก", "สินค้าหมดอายุ", "สินค้าเสื่อมสภาพ",
          "รหัสสินค้า", "บาร์โค้ด", "SKU", "ตำแหน่งจัดเก็บ",
          "ชั้นวาง", "โซน", "ล็อค", "สต็อกการ์ด"
        ],
        "en": [
          "stock", "inventory", "warehouse", "sku", "barcode",
          "receive", "issue", "transfer", "on hand", "quantity",
          "reorder point", "min stock", "max stock", "safety stock",
          "stock level", "bin", "location", "zone", "rack",
          "finished goods", "raw material", "spare parts",
          "stock movement", "goods receipt", "goods issue",
          "stock card", "stock count", "physical count",
          "dead stock", "slow moving", "obsolete",
          "fifo", "lifo", "weighted average",
          "stock value", "inventory value", "carrying cost",
          "stock turn", "turnover", "days on hand", "doh",
          "fill rate", "service level", "stockout",
          "pick", "pack", "ship", "put away",
          "inbound", "outbound", "dispatch"
        ],
        "lo": [
          "ສາງ", "ສິນຄ້າ", "ຄົງຄັງ", "ຮັບ", "ຈ່າຍ",
          "ຄົງເຫຼືອ", "ພັສດຸ", "ອະໄຫຼ່", "ວັດສະດຸ",
          "ເຄື່ອນໄຫວ", "ໂອນ", "ເບີກ", "ຈຳນວນ"
        ]
      },
      "sheets": [
        "stock", "inventory", "สต็อก", "คลัง", "คลังสินค้า",
        "คลังพัสดุ", "สินค้าคงคลัง", "stock movement",
        "goods receipt", "รับเข้า", "เบิก", "stock card",
        "warehouse", "bin card"
      ],
      "weightPerHit": 1.5
    },
    "valueShapes": [
      {
        "columnLike": "จำนวนคงเหลือ|on hand|stock level|ยอดคงเหลือ",
        "type": "number",
        "range": [0, 1000000],
        "weight": 2.0,
        "note": "Current stock quantity; universal inventory signal"
      },
      {
        "columnLike": "จุดสั่งซื้อ|reorder point|min stock|สต็อกขั้นต่ำ",
        "type": "number",
        "range": [0, 100000],
        "weight": 3.0,
        "note": "Reorder/min stock level; strong inventory management signal"
      },
      {
        "columnLike": "มูลค่าคงคลัง|stock value|inventory value",
        "type": "number",
        "range": [0, null],
        "weight": 2.0,
        "note": "Monetary value of stock on hand"
      },
      {
        "columnLike": "turnover|stock turn|อัตราหมุนเวียน",
        "type": "number",
        "range": [0.5, 365],
        "weight": 3.0,
        "note": "Inventory turnover ratio or turns per year"
      },
      {
        "columnLike": "days on hand|doh|วันคงคลัง",
        "type": "number",
        "range": [1, 365],
        "weight": 2.5,
        "note": "Days of inventory on hand"
      }
    ],
    "unitPatterns": [
      "ชิ้น", "กล่อง", "ถุง", "ตัน", "กก.", "kg",
      "หน่วยบรรจุ", "pallet", "carton", "ea", "pcs",
      "ม้วน", "แกลลอน", "ลิตร", "เมตร"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse"], "weight": -2.0 },
      { "lexicon": ["pipeline", "win rate", "lead"], "weight": -1.5 },
      { "lexicon": ["salary", "เงินเดือน", "turnover rate", "attrition"], "weight": -1.5 },
      { "lexicon": ["blockchain", "token", "wallet", "mining", "staking", "crypto"], "weight": -3.0 },
      { "lexicon": ["property", "rental", "tenant", "sqft", "lease", "bedrooms"], "weight": -3.0 },
      { "lexicon": ["player", "match", "goals", "assists", "league"], "weight": -2.0 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading", "cost_per_delivery"], "weight": -1.5 },
      { "lexicon": ["impression", "ctr", "cpc", "roas", "campaign_id", "ad_group"], "weight": -2.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type", "no_shows"], "weight": -2.0 },
      { "lexicon": ["student", "enrollment", "gpa", "semester", "curriculum", "tuition"], "weight": -3.0 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "goods_receipt",
        "stages": ["สั่งซื้อ/ผลิต", "รับสินค้า", "ตรวจสอบ", "บันทึกรับเข้า", "จัดเก็บ"]
      },
      {
        "id": "goods_issue",
        "stages": ["รับคำขอเบิก", "ตรวจสต็อก", "จัดเตรียม", "เบิกจ่าย", "บันทึกตัดสต็อก"]
      },
      {
        "id": "stock_management",
        "stages": ["ติดตามยอด", "ตรวจนับ", "ปรับปรุงยอด", "จัดการสินค้าค้าง", "สั่งเติม"]
      },
      {
        "id": "shipping",
        "stages": ["รับใบสั่ง", "หยิบสินค้า", "ตรวจนับ", "บรรจุ", "จัดส่ง"]
      }
    ],
    "goals": [
      "maintain optimal stock levels (minimize stockout and overstock)",
      "maximize inventory turnover",
      "minimize dead stock and obsolete inventory",
      "achieve high fill rate and service level",
      "reduce carrying cost and warehouse operating cost",
      "ensure stock accuracy (physical vs system)",
      "optimize warehouse space utilization",
      "streamline receiving and shipping processes"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["inventory value", "turnover trend", "dead stock exposure", "service level"],
        "cadence": "monthly"
      },
      {
        "type": "warehouse_manager",
        "cares": ["stock levels vs reorder", "stockout alerts", "space utilization", "receiving backlog"],
        "cadence": "daily"
      },
      {
        "type": "store_keeper",
        "cares": ["items to receive", "items to issue", "physical count", "bin accuracy"],
        "cadence": "per-shift"
      }
    ],
    "decisionCatalog": [
      "manage-inventory",
      "allocate-stock",
      "plan-forecast",
      "investigate-discrepancy",
      "reorder-decision",
      "dispose-obsolete",
      "optimize-layout",
      "explain-variance"
    ],
    "seasonality": "Depends on business: year-end physical counts, seasonal demand peaks, production season buildup. Sugar factory: finished goods peak during/after crushing season (Nov-Apr)."
  },

  "kpiRefs": [
    "kpi.inv.stock_on_hand",
    "kpi.inv.turnover_ratio",
    "kpi.inv.days_on_hand",
    "kpi.inv.fill_rate",
    "kpi.inv.stockout_count",
    "kpi.inv.dead_stock_pct",
    "kpi.inv.stock_accuracy",
    "kpi.inv.carrying_cost",
    "kpi.inv.stock_value",
    "kpi.inv.items_below_reorder",
    "kpi.inv.space_utilization"
  ],

  "genomeRefs": [
    "genome.inv_stock_status_v1",
    "genome.inv_movement_analysis_v1",
    "genome.inv_aging_report_v1"
  ],

  "vizOverrides": [
    { "rule": "scatter plot for ABC analysis (value vs volume) with quadrant labels", "cites": "doc 06 §5" },
    { "rule": "bar chart with reorder-point reference line for stock level by item", "cites": "doc 06 §3" },
    { "rule": "stacked bar for stock aging buckets (current, 30, 60, 90+ days)", "cites": "doc 06 §3" },
    { "rule": "treemap for inventory value distribution by category/warehouse", "cites": "doc 06 §5" }
  ],

  "fixtures": [
    "ตัวอย่าง Data/Mock_Dashboard_Data/04_คลังพัสดุและคลังสินค้า/*.json"
  ]
}
;

window.__KB_DOMAIN_PACKS['logistics_transport'] = {
  "id": "logistics_transport",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "โลจิสติกส์และขนส่ง",
    "nameEN": "Logistics & Transportation",
    "nameLO": "ການຂົນສົ່ງ ແລະ ໂລຈິສຕິກ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "การจัดส่ง", "ขนส่ง", "เที่ยวรถ", "ทะเบียนรถ", "พนักงานขับ",
          "ต้นทาง", "ปลายทาง", "ระยะทาง", "น้ำหนักบรรทุก", "ค่าขนส่ง",
          "เวลาจัดส่ง", "เวลารับสินค้า", "สถานะจัดส่ง", "ใบส่งของ",
          "เลขที่ใบขนส่ง", "เส้นทาง", "รอบการจัดส่ง", "จุดรับ", "จุดส่ง",
          "ค่าน้ำมัน", "ค่าทางด่วน", "ค่าเบี้ยเลี้ยง", "ค่าซ่อมรถ",
          "ตู้คอนเทนเนอร์", "หมายเลขซีล", "ใบตราส่ง", "ใบกำกับขนส่ง",
          "ตารางเดินรถ", "แผนการจัดส่ง", "ศูนย์กระจายสินค้า",
          "จำนวนเที่ยว", "เที่ยวว่าง", "ความจุ", "บรรทุก",
          "ส่งตรงเวลา", "ส่งล่าช้า", "สินค้าเสียหาย", "สินค้าสูญหาย",
          "ใบรับสินค้า", "ใบนำส่ง", "รายงานเดินทาง"
        ],
        "en": [
          "shipment", "shipping", "delivery", "carrier", "freight",
          "tracking", "tracking number", "waybill", "bill of lading",
          "origin", "destination", "route", "distance", "mileage",
          "vehicle", "truck", "fleet", "driver", "license plate",
          "load", "cargo", "weight", "volume", "cbm",
          "transit time", "lead time", "eta", "etd",
          "on time", "delayed", "late delivery", "delivery rate",
          "shipping cost", "freight cost", "cost per km", "cost per delivery",
          "fuel", "fuel cost", "toll", "maintenance cost",
          "container", "seal number", "consignment",
          "dispatch", "pickup", "drop off", "hub", "depot",
          "distribution center", "last mile", "first mile",
          "empty trip", "utilization", "capacity",
          "damaged", "lost", "claim", "pod", "proof of delivery",
          "total deliveries", "avg delivery days", "delay days",
          "shipment id", "tracking events", "delivery status"
        ],
        "lo": [
          "ການຂົນສົ່ງ", "ຂົນສົ່ງ", "ລົດຂົນສົ່ງ", "ຄົນຂັບ",
          "ຕົ້ນທາງ", "ປາຍທາງ", "ເສັ້ນທາງ", "ນ້ຳໜັກ",
          "ຄ່າຂົນສົ່ງ", "ສົ່ງສິນຄ້າ", "ສະຖານະ"
        ]
      },
      "sheets": [
        "shipment", "การจัดส่ง", "ขนส่ง", "delivery", "การขนส่ง",
        "fleet", "เที่ยวรถ", "freight", "ค่าขนส่ง", "tracking",
        "dispatch", "route", "เส้นทาง", "distribution"
      ],
      "weightPerHit": 1.5
    },
    "valueShapes": [
      {
        "columnLike": "on.time.*delivery|อัตราส่งตรงเวลา|otd|on_time_pct",
        "type": "percentage",
        "range": [50, 100],
        "weight": 3.5,
        "note": "On-time delivery rate; definitive logistics metric"
      },
      {
        "columnLike": "cost.per.(?:km|delivery|trip)|ค่าขนส่งต่อเที่ยว",
        "type": "number",
        "range": [1, 100000],
        "weight": 2.5,
        "note": "Unit cost metrics for transportation"
      },
      {
        "columnLike": "transit.time|lead.time|avg.delivery.days|ระยะเวลาจัดส่ง",
        "type": "number",
        "range": [0.1, 30],
        "weight": 2.5,
        "note": "Transit or delivery time in days"
      },
      {
        "columnLike": "vehicle.utilization|อัตราการใช้รถ|fleet.utilization",
        "type": "percentage",
        "range": [30, 100],
        "weight": 2.5,
        "note": "Fleet/vehicle utilization percentage"
      },
      {
        "columnLike": "damage.rate|อัตราเสียหาย|claim.rate",
        "type": "percentage",
        "range": [0, 10],
        "weight": 2.0,
        "note": "Cargo damage/claim rate"
      },
      {
        "columnLike": "distance|ระยะทาง|mileage|km",
        "type": "number",
        "range": [1, 5000],
        "weight": 1.5,
        "note": "Trip distance in km"
      }
    ],
    "unitPatterns": [
      "กม.", "km", "ไมล์", "ตัน", "CBM", "คิว",
      "เที่ยว", "เที่ยว/วัน", "trips/day", "บาท/กม.",
      "ลิตร", "liters", "คัน", "ตู้"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis", "โรค"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse", "อ้อย"], "weight": -2.0 },
      { "lexicon": ["oee", "defect rate", "cycle time", "mtbf", "mttr"], "weight": -2.0 },
      { "lexicon": ["salary", "เงินเดือน", "payroll", "leave", "turnover rate"], "weight": -2.0 },
      { "lexicon": ["gl", "general ledger", "debit", "credit", "trial balance"], "weight": -2.0 },
      { "lexicon": ["pipeline", "deal", "opportunity", "win rate", "quota"], "weight": -2.0 },
      { "lexicon": ["student", "enrollment", "gpa", "semester", "curriculum"], "weight": -3.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type", "guest"], "weight": -2.5 },
      { "lexicon": ["impression", "ctr", "cpc", "roas", "campaign_id"], "weight": -2.0 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "browse", "wishlist"], "weight": -2.0 },
      { "lexicon": ["protocol", "chain", "apy", "staking", "defi", "wallet", "token", "ticker", "open", "high", "low", "close", "market_cap", "symbol"], "weight": -4.0 },
      { "lexicon": ["goals", "assists", "tackles", "player", "league", "match", "games_played"], "weight": -3.0 },
      { "lexicon": ["subscriber", "dau", "mau", "mrr", "arr", "arpu"], "weight": -2.5 },
      { "lexicon": ["doctors", "nurses", "patients_mtd", "infection_rate"], "weight": -3.0 },
      { "lexicon": ["property", "bedrooms", "monthly_rent", "tenant", "mortgage"], "weight": -2.5 },
      { "lexicon": ["sprint", "story_points", "epic", "assignee", "task_id"], "weight": -2.0 },
      { "lexicon": ["menu", "recipe", "prep_time", "ingredient", "food_cost"], "weight": -2.5 },
      { "lexicon": ["tickets_resolved", "avg_resolution_hr", "first_contact_resolution", "csat_score", "reopen_rate", "handle_time", "quality_score", "agent"], "weight": -3.5 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "order_to_delivery",
        "stages": ["รับคำสั่ง", "จัดเตรียม", "บรรทุก", "ขนส่ง", "จัดส่งถึงปลายทาง", "ยืนยันรับสินค้า"]
      },
      {
        "id": "fleet_management",
        "stages": ["วางแผนเที่ยวรถ", "จัดรถ/คนขับ", "ออกเดินทาง", "ติดตาม GPS", "รายงานสถานะ"]
      },
      {
        "id": "reverse_logistics",
        "stages": ["แจ้งส่งคืน", "รับสินค้าคืน", "ตรวจสอบ", "คืนเข้าคลัง/ทำลาย"]
      }
    ],
    "goals": [
      "maximize on-time delivery rate",
      "minimize transportation cost per unit/km",
      "optimize fleet utilization and reduce empty trips",
      "minimize cargo damage and loss rate",
      "reduce average transit time",
      "ensure driver safety and compliance",
      "optimize route planning and load consolidation",
      "maintain vehicle uptime through preventive maintenance"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["cost per delivery", "OTD rate", "fleet utilization", "total volume"],
        "cadence": "weekly"
      },
      {
        "type": "logistics_manager",
        "cares": ["route efficiency", "vehicle assignments", "delay reasons", "damage claims"],
        "cadence": "daily"
      },
      {
        "type": "dispatcher",
        "cares": ["today's trips", "driver availability", "vehicle status", "urgent deliveries"],
        "cadence": "per-shift"
      }
    ],
    "decisionCatalog": [
      "optimize-route",
      "allocate-fleet",
      "investigate-delay",
      "plan-forecast",
      "explain-variance",
      "reduce-cost",
      "improve-service-level",
      "schedule-maintenance"
    ],
    "seasonality": "Peak shipping seasons (holiday, year-end). Agricultural harvest seasons drive bulk transport. Monsoon season affects road conditions in Southeast Asia."
  },

  "kpiRefs": [
    "kpi.log.otd_rate",
    "kpi.log.cost_per_delivery",
    "kpi.log.cost_per_km",
    "kpi.log.fleet_utilization",
    "kpi.log.avg_transit_days",
    "kpi.log.damage_rate",
    "kpi.log.total_deliveries",
    "kpi.log.empty_trip_pct",
    "kpi.log.fuel_cost_per_km",
    "kpi.log.volume_delivered"
  ],

  "genomeRefs": [
    "genome.log_delivery_performance_v1",
    "genome.log_fleet_overview_v1",
    "genome.log_cost_analysis_v1"
  ],

  "vizOverrides": [
    { "rule": "bar chart for OTD rate by route/carrier with target line", "cites": "doc 06 §3" },
    { "rule": "line chart for delivery volume and cost trend over time", "cites": "doc 06 §3" },
    { "rule": "donut for cost breakdown (fuel, toll, labor, maintenance)", "cites": "doc 06 §2" },
    { "rule": "bar chart for delay reasons (Pareto-style)", "cites": "doc 06 §5" }
  ],

  "fixtures": []
}
;

window.__KB_DOMAIN_PACKS['manufacturing'] = {
  "id": "manufacturing",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "การผลิต",
    "nameEN": "Manufacturing",
    "nameLO": "ການຜະລິດ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "ผลิต", "ของเสีย", "เครื่องจักร", "กะ", "กำลังการผลิต",
          "ปริมาณผลิต", "อัตราการผลิต", "เวลาหยุด", "เวลาเดินเครื่อง",
          "ประสิทธิภาพ", "คุณภาพ", "ของดี", "ชิ้นงาน", "ล็อต",
          "แผนการผลิต", "ยอดผลิต", "หน่วยผลิต", "สายการผลิต",
          "วัตถุดิบ", "ผลผลิต", "ผลิตภัณฑ์", "เครื่องสับ",
          "เครื่องบด", "เครื่องอบ", "เครื่องบรรจุ", "เครื่องตรวจ",
          "หยุดซ่อม", "หยุดเครื่อง", "ซ่อมบำรุง", "ซ่อมแซม",
          "อะไหล่", "แม่พิมพ์", "ชั่วโมงเดินเครื่อง", "ชั่วโมงหยุด",
          "ตารางการผลิต", "ใบสั่งผลิต", "BOM", "สูตรการผลิต",
          "อัตราของเสีย", "เปอร์เซ็นต์ของเสีย", "สาเหตุการหยุด",
          "ผลกระทบต่อการผลิต", "ตันสูญเสีย",
          "ซ่อม", "ใบสั่งงานซ่อม", "บำรุงรักษา", "อุปกรณ์",
          "สาเหตุการเสีย", "ค่าซ่อม", "แจ้งซ่อม",
          "เครื่อง", "เดินเครื่อง", "หยุดเครื่อง"
        ],
        "en": [
          "oee", "availability", "performance", "quality rate",
          "downtime", "uptime", "defect", "reject", "scrap",
          "production", "output", "yield", "throughput", "capacity",
          "shift", "batch", "lot", "work order", "bom",
          "cycle time", "takt time", "lead time", "changeover",
          "machine", "equipment", "line", "cell", "station",
          "mtbf", "mttr", "planned maintenance", "unplanned downtime",
          "first pass yield", "rework", "waste", "efficiency",
          "utilization", "bottleneck", "wip", "work in progress",
          "raw material", "finished goods", "semi-finished",
          "inspection", "quality control", "non-conformance", "ncr",
          "production plan", "actual vs plan", "variance"
        ],
        "lo": [
          "ການຜະລິດ", "ເຄື່ອງຈັກ", "ຂອງເສຍ", "ຄຸນນະພາບ",
          "ກະ", "ປະສິດທິພາບ", "ວັດຖຸດິບ", "ຜະລິດຕະພັນ",
          "ສາຍການຜະລິດ", "ແຜນຜະລິດ"
        ]
      },
      "sheets": [
        "production", "การผลิต", "downtime", "quality control", "คุณภาพการผลิต",
        "OEE", "shift report", "รายงานกะ", "defect", "ของเสีย",
        "machine log", "output summary", "สรุปผลผลิต"
      ],
      "weightPerHit": 1.5
    },
    "valueShapes": [
      {
        "columnLike": "oee|OEE|ประสิทธิภาพโดยรวม",
        "type": "percentage",
        "range": [30, 100],
        "weight": 3.5,
        "note": "Overall Equipment Effectiveness; definitive manufacturing metric"
      },
      {
        "columnLike": "availability|อัตราการเดินเครื่อง",
        "type": "percentage",
        "range": [50, 100],
        "weight": 2.5,
        "note": "Machine availability component of OEE"
      },
      {
        "columnLike": "performance rate|อัตราสมรรถนะ",
        "type": "percentage",
        "range": [50, 100],
        "weight": 2.5,
        "note": "Performance rate component of OEE"
      },
      {
        "columnLike": "quality rate|อัตราคุณภาพ|first pass yield",
        "type": "percentage",
        "range": [80, 100],
        "weight": 2.5,
        "note": "Quality rate / first pass yield component of OEE"
      },
      {
        "columnLike": "defect rate|อัตราของเสีย|reject rate|เปอร์เซ็นต์ของเสีย",
        "type": "percentage",
        "range": [0, 15],
        "weight": 3.0,
        "note": "Defect/reject rate; typically low single digits in good operations"
      },
      {
        "columnLike": "cycle time|เวลารอบ",
        "type": "number",
        "range": [0.1, 3600],
        "weight": 2.0,
        "note": "Cycle time in seconds or minutes per unit"
      },
      {
        "columnLike": "mtbf|MTBF",
        "type": "number",
        "range": [1, 10000],
        "weight": 3.0,
        "note": "Mean Time Between Failures in hours; strong manufacturing signal"
      },
      {
        "columnLike": "mttr|MTTR",
        "type": "number",
        "range": [0.1, 100],
        "weight": 3.0,
        "note": "Mean Time To Repair in hours"
      },
      {
        "columnLike": "downtime|เวลาหยุด|ชั่วโมงหยุด",
        "type": "number",
        "range": [0, 24],
        "weight": 2.0,
        "note": "Downtime hours per shift or per day"
      }
    ],
    "unitPatterns": [
      "ชิ้น/ชม.", "pcs/hr", "units/hr", "ตัน/วัน", "tons/day",
      "kg/hr", "กก./ชม.", "ชิ้น", "ล็อต", "batch"
    ],
    "negative": [
      { "lexicon": ["diagnosis", "patient", "ผู้ป่วย", "โรค"], "weight": -3.0 },
      { "lexicon": ["student", "นักเรียน", "grade", "GPA"], "weight": -2.0 },
      { "lexicon": ["portfolio", "dividend", "หุ้น", "กองทุน"], "weight": -2.0 },
      { "lexicon": ["hotel", "booking", "reservation"], "weight": -1.5 },
      { "lexicon": ["aqi", "pm25", "pm10", "o3_ppb", "no2_ppb", "so2_ppb", "co_ppm", "pollutant", "dominant_pollutant", "health_concern"], "weight": -3.0 },
      { "lexicon": ["csat", "first_contact_resolution", "reopen_rate", "tickets_resolved", "handle_time"], "weight": -3.0 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading", "cost_per_delivery"], "weight": -1.5 },
      { "lexicon": ["impression", "ctr", "cpc", "roas", "campaign_id", "ad_group"], "weight": -2.0 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "shipping_fee", "marketplace", "shopee", "lazada"], "weight": -2.0 },
      { "lexicon": ["student", "enrollment", "gpa", "semester", "curriculum", "tuition"], "weight": -3.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type", "no_shows"], "weight": -2.0 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "production_flow",
        "stages": ["วางแผนผลิต", "เตรียมวัตถุดิบ", "ผลิต", "ตรวจสอบคุณภาพ", "บรรจุ", "จัดเก็บ"]
      },
      {
        "id": "quality_control",
        "stages": ["ตรวจรับวัตถุดิบ", "ตรวจระหว่างผลิต", "ตรวจสุดท้าย", "ปล่อยผ่าน/กักกัน"]
      },
      {
        "id": "maintenance",
        "stages": ["วางแผนบำรุงรักษา", "PM ตามรอบ", "แจ้งซ่อม", "ดำเนินการซ่อม", "ทดสอบ", "คืนเครื่อง"]
      }
    ],
    "goals": [
      "maximize OEE (availability x performance x quality)",
      "minimize defect rate and rework",
      "maximize throughput and capacity utilization",
      "minimize unplanned downtime",
      "reduce cycle time and lead time",
      "optimize raw material consumption and yield",
      "meet production plan targets",
      "reduce maintenance cost through preventive programs"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["output vs plan", "cost per unit", "OEE trend", "quality incidents"],
        "cadence": "daily-morning"
      },
      {
        "type": "operational",
        "cares": ["shift output", "downtime events", "defect count", "machine status"],
        "cadence": "per-shift"
      },
      {
        "type": "maintenance",
        "cares": ["MTBF", "MTTR", "PM schedule compliance", "spare parts availability"],
        "cadence": "daily"
      },
      {
        "type": "quality",
        "cares": ["defect rate", "NCR count", "first pass yield", "inspection results"],
        "cadence": "per-shift"
      }
    ],
    "decisionCatalog": [
      "intervene-in-operations",
      "explain-variance",
      "allocate-maintenance",
      "plan-forecast",
      "adjust-production-schedule",
      "investigate-quality-issue",
      "rebalance-line",
      "approve-rework-or-scrap"
    ],
    "seasonality": "Varies by sub-industry. General manufacturing may have demand seasonality (holiday peaks, fiscal year-end). Some plants run continuous 3-shift operations year-round."
  },

  "kpiRefs": [
    "kpi.mfg.oee",
    "kpi.mfg.availability",
    "kpi.mfg.performance_rate",
    "kpi.mfg.quality_rate",
    "kpi.mfg.defect_rate",
    "kpi.mfg.throughput",
    "kpi.mfg.yield",
    "kpi.mfg.downtime_hr",
    "kpi.mfg.mtbf",
    "kpi.mfg.mttr",
    "kpi.mfg.cycle_time",
    "kpi.mfg.plan_attainment",
    "kpi.mfg.capacity_utilization",
    "kpi.mfg.cost_per_unit"
  ],

  "genomeRefs": [
    "genome.mfg_shift_report_v1",
    "genome.mfg_oee_dashboard_v1",
    "genome.mfg_quality_tracker_v1"
  ],

  "vizOverrides": [
    { "rule": "OEE waterfall showing availability x performance x quality breakdown", "cites": "doc 06 §4" },
    { "rule": "Pareto chart for downtime causes and defect categories", "cites": "doc 06 §5" },
    { "rule": "control-chart for process parameter stability monitoring", "cites": "doc 06 §5" },
    { "rule": "stacked bar for shift-over-shift output comparison", "cites": "doc 06 §3" }
  ],

  "fixtures": [
    "ตัวอย่าง Data/Mock_Dashboard_Data/06_การผลิต/*.json",
    "ตัวอย่าง Data/Mock_Dashboard_Data/10_ซ่อมบำรุง/*.json"
  ]
}
;

window.__KB_DOMAIN_PACKS['marketing_digital'] = {
  "id": "marketing_digital",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "การตลาดและดิจิทัล",
    "nameEN": "Marketing & Digital",
    "nameLO": "ການຕະຫຼາດ ແລະ ດິຈິທັລ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "แคมเปญ", "โฆษณา", "งบโฆษณา", "ค่าโฆษณา",
          "การเข้าชม", "ผู้เข้าชม", "เปิดอ่าน", "คลิก",
          "อัตราการคลิก", "อัตราเปิดอ่าน", "อัตราการยกเลิก",
          "ช่องทาง", "สื่อ", "แพลตฟอร์ม", "Facebook", "Google",
          "Line", "Instagram", "TikTok", "YouTube",
          "กลุ่มเป้าหมาย", "เซ็กเมนต์", "Audience",
          "คอนเวอร์ชั่น", "ลูกค้าใหม่จากโฆษณา", "ต้นทุนต่อลูกค้า",
          "ยอดขายจากโฆษณา", "ผลตอบแทนโฆษณา",
          "โพสต์", "เนื้อหา", "ไลค์", "แชร์", "คอมเมนต์",
          "ผู้ติดตาม", "reach", "engagement",
          "อีเมล", "รายชื่อ", "ส่งอีเมล", "bounce",
          "landing page", "หน้าแลนดิ้ง", "A/B test"
        ],
        "en": [
          "campaign", "campaign name", "campaign id", "ad", "ad group",
          "impression", "impressions", "reach", "frequency",
          "click", "clicks", "ctr", "click through rate",
          "cpc", "cost per click", "cpm", "cost per mille",
          "cpa", "cost per acquisition", "cpl", "cost per lead",
          "roas", "return on ad spend", "roi",
          "conversion", "conversions", "conversion rate", "cvr",
          "spend", "ad spend", "budget", "cost",
          "channel", "medium", "source", "platform",
          "facebook", "google ads", "instagram", "tiktok", "youtube",
          "email", "open rate", "click rate", "bounce rate",
          "unsubscribe", "unsubscribe rate", "subscriber",
          "landing page", "page view", "session", "sessions",
          "engagement", "engagement rate", "like", "share", "comment",
          "follower", "followers", "post", "content",
          "lead", "leads", "mql", "sql",
          "a/b test", "variant", "control",
          "utm source", "utm medium", "utm campaign",
          "organic", "paid", "referral", "social",
          "seo", "sem", "ppc", "display"
        ],
        "lo": [
          "ແຄມເປນ", "ໂຄສະນາ", "ຄລິກ", "ການເຂົ້າຊົມ",
          "ຜູ້ຕິດຕາມ", "ໂພສ", "ແຊ", "ໄລ"
        ]
      },
      "sheets": [
        "campaign", "แคมเปญ", "ads", "โฆษณา",
        "performance", "social media", "email",
        "analytics", "traffic", "conversion",
        "marketing", "การตลาด", "digital", "media spend"
      ],
      "weightPerHit": 1.8
    },
    "valueShapes": [
      {
        "columnLike": "ctr|click.through.rate|อัตราการคลิก",
        "type": "percentage",
        "range": [0.1, 30],
        "weight": 3.5,
        "note": "Click-through rate; definitive digital marketing metric"
      },
      {
        "columnLike": "roas|return.on.ad.spend|ผลตอบแทนโฆษณา",
        "type": "number",
        "range": [0, 50],
        "weight": 3.5,
        "note": "Return on Ad Spend (multiplier)"
      },
      {
        "columnLike": "cpc|cost.per.click|ค่าต่อคลิก",
        "type": "number",
        "range": [0.01, 500],
        "weight": 3.0,
        "note": "Cost per click"
      },
      {
        "columnLike": "conversion.rate|cvr|อัตราคอนเวอร์ชั่น",
        "type": "percentage",
        "range": [0.1, 30],
        "weight": 3.0,
        "note": "Conversion rate"
      },
      {
        "columnLike": "open.rate|อัตราเปิดอ่าน",
        "type": "percentage",
        "range": [5, 80],
        "weight": 2.5,
        "note": "Email open rate"
      },
      {
        "columnLike": "engagement.rate|อัตรา engagement",
        "type": "percentage",
        "range": [0.5, 20],
        "weight": 2.5,
        "note": "Social media engagement rate"
      },
      {
        "columnLike": "impression|impressions",
        "type": "number",
        "range": [100, 100000000],
        "weight": 2.0,
        "note": "Ad or content impressions"
      }
    ],
    "unitPatterns": [
      "บาท/คลิก", "THB/click", "USD/click",
      "ครั้ง", "view", "views", "session",
      "%CTR", "%CVR", "x ROAS"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis", "โรค"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse", "อ้อย"], "weight": -2.0 },
      { "lexicon": ["oee", "defect rate", "cycle time", "mtbf"], "weight": -2.0 },
      { "lexicon": ["salary", "เงินเดือน", "payroll", "turnover rate"], "weight": -2.0 },
      { "lexicon": ["gl", "general ledger", "debit", "credit", "trial balance"], "weight": -2.0 },
      { "lexicon": ["student", "enrollment", "gpa", "semester", "curriculum"], "weight": -3.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type", "guest"], "weight": -2.5 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading"], "weight": -2.0 },
      { "lexicon": ["stock", "inventory", "reorder", "warehouse", "bin", "sku"], "weight": -2.0 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "product_id", "shipping_fee"], "weight": -1.5 },
      { "lexicon": ["pipeline", "deal", "opportunity", "quota", "salesperson"], "weight": -1.5 },
      { "lexicon": ["subscriber", "dau", "mau", "activation", "mrr", "arr", "churn_rate", "arpu", "expansion_mrr", "net_new_mrr"], "weight": -3.5 },
      { "lexicon": ["tickets_resolved", "avg_resolution_hr", "first_contact_resolution", "csat_score", "reopen_rate", "handle_time", "quality_score"], "weight": -3.5 },
      { "lexicon": ["goals", "assists", "tackles", "player", "league", "match", "games_played"], "weight": -3.0 },
      { "lexicon": ["protocol", "chain", "apy", "staking", "defi", "token"], "weight": -2.5 },
      { "lexicon": ["doctors", "nurses", "patients_mtd", "infection_rate"], "weight": -3.0 },
      { "lexicon": ["property", "bedrooms", "rent", "tenant", "mortgage"], "weight": -2.5 },
      { "lexicon": ["sprint", "story_points", "epic", "assignee", "task_id"], "weight": -2.0 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "campaign_lifecycle",
        "stages": ["วางแผน", "สร้างเนื้อหา", "ตั้งค่าแคมเปญ", "เผยแพร่", "ติดตามผล", "ปรับปรุง", "สรุปผล"]
      },
      {
        "id": "lead_generation",
        "stages": ["กำหนดเป้าหมาย", "สร้าง landing page", "ยิงโฆษณา", "รวบรวม lead", "ส่งต่อทีมขาย", "วัดผล"]
      },
      {
        "id": "content_marketing",
        "stages": ["วางแผนเนื้อหา", "ผลิต", "เผยแพร่", "โปรโมต", "วัด engagement", "ทบทวน"]
      }
    ],
    "goals": [
      "maximize ROAS and marketing ROI",
      "increase conversion rate across channels",
      "reduce cost per acquisition (CPA/CPL)",
      "grow organic reach and engagement",
      "optimize channel mix and budget allocation",
      "increase email subscriber list and open rates",
      "improve brand awareness and reach",
      "generate quality leads for sales team"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["marketing ROI", "total spend vs revenue", "brand metrics", "channel performance"],
        "cadence": "monthly"
      },
      {
        "type": "marketing_manager",
        "cares": ["campaign performance", "budget utilization", "conversion funnel", "A/B test results"],
        "cadence": "weekly"
      },
      {
        "type": "digital_specialist",
        "cares": ["CTR", "CPC", "ad creative performance", "audience segments", "daily spend"],
        "cadence": "daily"
      }
    ],
    "decisionCatalog": [
      "allocate-budget",
      "optimize-campaign",
      "explain-variance",
      "select-channel",
      "test-creative",
      "plan-forecast",
      "target-audience",
      "adjust-bidding"
    ],
    "seasonality": "Campaign peaks: holiday seasons (year-end, Songkran, Chinese New Year), 11.11/12.12 for ecommerce tie-ins, back-to-school. Budget cycles typically quarterly with annual planning."
  },

  "kpiRefs": [
    "kpi.mkt.roas",
    "kpi.mkt.cpa",
    "kpi.mkt.ctr",
    "kpi.mkt.conversion_rate",
    "kpi.mkt.total_spend",
    "kpi.mkt.impressions",
    "kpi.mkt.reach",
    "kpi.mkt.engagement_rate",
    "kpi.mkt.open_rate",
    "kpi.mkt.leads_generated",
    "kpi.mkt.cost_per_lead"
  ],

  "genomeRefs": [
    "genome.mkt_campaign_performance_v1",
    "genome.mkt_channel_analysis_v1",
    "genome.mkt_social_media_v1"
  ],

  "vizOverrides": [
    { "rule": "bar chart for campaign performance (spend vs conversions) by campaign", "cites": "doc 06 §3" },
    { "rule": "donut for budget allocation by channel", "cites": "doc 06 §2" },
    { "rule": "line chart for CTR/CPC trend over time", "cites": "doc 06 §3" },
    { "rule": "funnel chart for marketing funnel (impressions → clicks → leads → conversions)", "cites": "doc 06 §5" }
  ],

  "fixtures": []
}
;

window.__KB_DOMAIN_PACKS['sales_crm'] = {
  "id": "sales_crm",
  "version": "1.0.0",
  "parent": null,

  "identity": {
    "nameTH": "การขายและลูกค้าสัมพันธ์",
    "nameEN": "Sales & CRM",
    "nameLO": "ການຂາຍ ແລະ ລູກຄ້າສຳພັນ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "ลูกค้า", "ยอดขาย", "ใบสั่งขาย", "ใบเสนอราคา", "ช่องทาง",
          "รหัสลูกค้า", "ชื่อลูกค้า", "ประเภทลูกค้า", "กลุ่มลูกค้า",
          "มูลค่าขาย", "ปริมาณขาย", "ราคาต่อหน่วย", "ส่วนลด",
          "ยอดขายสะสม", "เป้าขาย", "ผลงานขาย", "สัดส่วนขาย",
          "ใบสั่งซื้อ", "คำสั่งซื้อ", "สถานะคำสั่งซื้อ", "วันที่สั่งขาย",
          "การจัดส่ง", "ใบส่งของ", "สถานะการจัดส่ง", "ปลายทาง",
          "วงเงินเครดิต", "เงื่อนไขชำระ", "ยอดค้างชำระ",
          "พนักงานขาย", "ทีมขาย", "เขตขาย", "ภาค",
          "ขายในประเทศ", "ส่งออก", "ตลาดต่างประเทศ",
          "ชื่อสินค้า", "กลุ่มสินค้า", "รายการสินค้า",
          "ใบแจ้งหนี้", "ใบกำกับภาษี", "มูลค่ารวม",
          "ลูกค้าใหม่", "ลูกค้าเก่า", "ลูกค้าที่สูญเสีย",
          "ความพึงพอใจ", "ข้อร้องเรียน", "บริการหลังการขาย"
        ],
        "en": [
          "customer", "client", "account", "sales", "revenue",
          "sales order", "quotation", "quote", "proposal",
          "pipeline", "opportunity", "deal", "lead", "prospect",
          "win rate", "conversion", "close rate", "funnel",
          "channel", "segment", "territory", "region",
          "aov", "average order value", "basket size",
          "churn", "retention", "lifetime value", "ltv", "clv",
          "crm", "contact", "activity", "follow up",
          "target", "quota", "attainment", "commission",
          "product", "sku", "unit price", "discount",
          "shipment", "delivery", "dispatch", "invoice",
          "domestic", "export", "international",
          "salesperson", "sales rep", "sales team",
          "customer satisfaction", "nps", "complaint",
          "upsell", "cross-sell", "repeat purchase"
        ],
        "lo": [
          "ລູກຄ້າ", "ການຂາຍ", "ຍອດຂາຍ", "ສິນຄ້າ", "ລາຄາ",
          "ສ່ວນລົດ", "ຊ່ອງທາງ", "ພະນັກງານຂາຍ", "ເປົ້າໝາຍ",
          "ຄຳສັ່ງຊື້", "ການຈັດສົ່ງ", "ໃບແຈ້ງໜີ້"
        ]
      },
      "sheets": [
        "sales", "ยอดขาย", "การขาย", "customer", "ลูกค้า",
        "orders", "คำสั่งซื้อ", "ใบสั่งขาย", "pipeline",
        "CRM", "shipment", "การจัดส่ง",
        "sales by product", "ยอดขายตามสินค้า", "revenue"
      ],
      "weightPerHit": 1.5
    },
    "valueShapes": [
      {
        "columnLike": "win rate|conversion rate|อัตราปิดการขาย",
        "type": "percentage",
        "range": [5, 80],
        "weight": 3.5,
        "note": "Deal win/conversion rate; definitive sales funnel metric"
      },
      {
        "columnLike": "aov|average order value|มูลค่าเฉลี่ยต่อคำสั่ง",
        "type": "number",
        "range": [100, 10000000],
        "weight": 2.5,
        "note": "Average order value; scale varies by industry"
      },
      {
        "columnLike": "churn|retention|อัตราการรักษาลูกค้า",
        "type": "percentage",
        "range": [0, 100],
        "weight": 3.0,
        "note": "Customer churn or retention rate"
      },
      {
        "columnLike": "nps|Net Promoter Score|ความพึงพอใจ",
        "type": "number",
        "range": [-100, 100],
        "weight": 2.5,
        "note": "NPS ranges -100 to 100"
      },
      {
        "columnLike": "สัดส่วนขายส่งออก|export ratio|สัดส่วนส่งออก",
        "type": "percentage",
        "range": [0, 100],
        "weight": 2.0,
        "note": "Export vs domestic sales ratio"
      },
      {
        "columnLike": "quota attainment|ผลงานเทียบเป้า",
        "type": "percentage",
        "range": [0, 200],
        "weight": 2.5,
        "note": "Sales quota attainment percentage"
      }
    ],
    "unitPatterns": [
      "บาท", "กีบ", "THB", "LAK", "USD", "฿",
      "หน่วยบรรจุ", "ตัน", "กล่อง", "ชิ้น", "ราย"
    ],
    "negative": [
      { "lexicon": ["patient", "ผู้ป่วย", "diagnosis", "โรค"], "weight": -3.0 },
      { "lexicon": ["ccs", "pol", "brix", "bagasse", "อ้อย"], "weight": -2.0 },
      { "lexicon": ["oee", "defect rate", "cycle time", "mtbf"], "weight": -1.5 },
      { "lexicon": ["salary", "เงินเดือน", "payroll", "leave"], "weight": -1.5 },
      { "lexicon": ["subscriber", "dau", "mau", "activation", "mrr", "arr", "churn_rate", "arpu", "expansion_mrr", "net_new_mrr"], "weight": -2.5 },
      { "lexicon": ["carrier", "freight", "tracking_events", "shipment_id", "delay_days"], "weight": -2.0 },
      { "lexicon": ["enrollment", "semester", "course", "curriculum", "gpa", "student", "tuition", "enrolled"], "weight": -3.0 },
      { "lexicon": ["open_rate", "unsubscribe", "bounce_rate", "ctr", "impression"], "weight": -2.0 },
      { "lexicon": ["requisition", "procurement", "tender", "จัดซื้อ", "ผู้ขาย", "purchase order", "purchasing group"], "weight": -2.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type", "no_shows"], "weight": -2.5 },
      { "lexicon": ["on_time", "damaged", "cost_per_delivery", "avg_delivery_days", "total_deliveries"], "weight": -4.0 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "shipping_fee", "marketplace", "shopee", "lazada", "gmv"], "weight": -2.0 },
      { "lexicon": ["roas", "campaign_id", "ad_group", "cpc", "engagement_rate", "ad_spend"], "weight": -2.0 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "order_to_cash",
        "stages": ["รับคำสั่งซื้อ", "ยืนยันสั่ง", "จัดเตรียม", "จัดส่ง", "ออกใบแจ้งหนี้", "รับชำระ"]
      },
      {
        "id": "sales_pipeline",
        "stages": ["ค้นหาลูกค้า", "นำเสนอ", "เสนอราคา", "เจรจา", "ปิดการขาย", "ส่งมอบ"]
      },
      {
        "id": "customer_management",
        "stages": ["ลงทะเบียนลูกค้า", "จัดกลุ่ม", "ดูแลความสัมพันธ์", "ขายเพิ่ม", "รักษาลูกค้า"]
      }
    ],
    "goals": [
      "maximize revenue and revenue growth rate",
      "increase win rate and pipeline coverage",
      "grow average order value",
      "reduce customer churn and increase retention",
      "achieve sales quota across teams and territories",
      "optimize channel mix (domestic vs export, online vs offline)",
      "improve customer satisfaction and NPS",
      "shorten sales cycle time"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["revenue vs target", "growth rate", "top customers", "channel performance"],
        "cadence": "weekly"
      },
      {
        "type": "sales_manager",
        "cares": ["team quota attainment", "pipeline health", "win rate", "lost deals"],
        "cadence": "daily"
      },
      {
        "type": "salesperson",
        "cares": ["my pipeline", "pending orders", "delivery status", "commission"],
        "cadence": "daily"
      },
      {
        "type": "customer_service",
        "cares": ["complaints", "delivery issues", "satisfaction scores", "escalations"],
        "cadence": "daily"
      }
    ],
    "decisionCatalog": [
      "find-opportunity",
      "monitor-performance",
      "explain-variance",
      "plan-forecast",
      "allocate-territory",
      "prioritize-pipeline",
      "investigate-churn",
      "optimize-channel"
    ],
    "seasonality": "Seasonal demand peaks vary by product (festive seasons, year-end). Sugar sales peak during/after crushing season. Export contracts may follow global commodity cycles."
  },

  "kpiRefs": [
    "kpi.sales.revenue",
    "kpi.sales.revenue_growth",
    "kpi.sales.order_count",
    "kpi.sales.aov",
    "kpi.sales.win_rate",
    "kpi.sales.pipeline_value",
    "kpi.sales.quota_attainment",
    "kpi.sales.churn_rate",
    "kpi.sales.retention_rate",
    "kpi.sales.customer_count",
    "kpi.sales.new_customers",
    "kpi.sales.revenue_per_customer",
    "kpi.sales.channel_mix",
    "kpi.sales.nps"
  ],

  "genomeRefs": [
    "genome.sales_performance_v1",
    "genome.sales_pipeline_v1",
    "genome.sales_product_mix_v1",
    "genome.sales_customer_analysis_v1"
  ],

  "vizOverrides": [
    { "rule": "funnel chart for sales pipeline stages", "cites": "doc 06 §5" },
    { "rule": "bar chart with target line for revenue vs quota by salesperson/team", "cites": "doc 06 §3" },
    { "rule": "pie/donut for revenue by channel or product mix (limit to top-5 + other)", "cites": "doc 06 §3" },
    { "rule": "line chart for revenue trend with YoY comparison", "cites": "doc 06 §3" },
    { "rule": "scatter for customer value vs order frequency (RFM-style)", "cites": "doc 06 §5" }
  ],

  "fixtures": [
    "ตัวอย่าง Data/Mock_Dashboard_Data/07_ลูกค้าและการขาย/*.json"
  ]
}
;

window.__KB_DOMAIN_PACKS['sugar_factory'] = {
  "id": "sugar_factory",
  "version": "1.0.0",
  "parent": "manufacturing",

  "identity": {
    "nameTH": "โรงงานน้ำตาล",
    "nameEN": "Sugar Factory",
    "nameLO": "ໂຮງງານນ້ຳຕານ"
  },

  "signatures": {
    "lexicon": {
      "columns": {
        "th": [
          "ซีซีเอส", "พอล", "บริกซ์", "อ้อยเข้าหีบ", "กากอ้อย", "โมลาส",
          "น้ำเชื่อม", "หม้อเคี่ยว", "ค่าความหวาน", "อัตราการสกัด",
          "น้ำตาลทราย", "ตันอ้อย", "กะการผลิต", "ฤดูหีบ", "ชานอ้อย",
          "น้ำอ้อย", "ตะกอน", "ปูนขาว", "ทำใส", "เคี่ยว", "ปั่น",
          "ค่า CCS", "อ้อยไฟไหม้", "อ้อยสด", "อ้อยยอดยาว",
          "อัตราการหีบ", "สูญเสียน้ำตาล", "กากน้ำตาล", "ค่าความบริสุทธิ์",
          "น้ำตาลที่ผลิตได้", "ปริมาณอ้อย", "ค่า Pol", "ค่า Brix",
          "ตั๋วชั่ง", "ชาวไร่", "พันธุ์อ้อย", "ไร่อ้อย",
          "สูญเสียที่ไม่ทราบสาเหตุ", "หม้อต้ม", "เครื่องสับอ้อย",
          "ลูกหีบ", "เครื่องแยก", "ไอน้ำ", "เชื้อเพลิงชีวมวล",
          "ผลผลิตต่อไร่", "โควตาอ้อย", "แขวง", "เมือง",
          "ปุ๋ย", "ยาฆ่าแมลง", "สารเคมีเกษตร", "แปลง",
          "ดิน", "ฟอสฟอรัส", "ไนโตรเจน", "โพแทสเซียม",
          "อินทรียวัตถุ", "ความอุดมสมบูรณ์", "เก็บตัวอย่าง"
        ],
        "en": [
          "ccs", "pol", "brix", "purity", "bagasse", "molasses",
          "massecuite", "imbibition", "bhr", "recovery", "extraction",
          "sugar", "cane", "crushing", "boiling", "centrifugal",
          "syrup", "clarification", "evaporation", "crystallization",
          "ton cane", "tcd", "tchr", "sugar loss", "undetermined loss",
          "juice", "mixed juice", "clear juice", "raw sugar",
          "refined sugar", "white sugar", "icumsa", "supersaturation",
          "false grain", "pan boiling", "vacuum pan", "strike",
          "magma", "affination", "filter cake", "mud",
          "fiber", "trash", "dextran", "reducing sugar",
          "retention time", "steam economy", "bpe", "vapor bleeding",
          "cane quality", "burnt cane", "fresh cane", "weighbridge",
          "farmer", "variety", "ratoon", "plant cane",
          "first expressed juice", "last mill", "overall recovery",
          "extraction rate", "pol in cane", "pol in bagasse"
        ],
        "lo": [
          "ອ້ອຍ", "ນ້ຳຕານ", "ໂຮງງານ", "ຫີບ", "ກາກ",
          "ໂມລາດ", "ນ້ຳອ້ອຍ", "ຊາວໄຮ່", "ໄຮ່ອ້ອຍ",
          "ຕັນອ້ອຍ", "ການຜະລິດ", "ຄຸນນະພາບ", "ນ້ຳຕານຊາຍ",
          "ເຂດ", "ແຂວງ", "ບ້ານ", "ແປງ", "ພັນ"
        ]
      },
      "sheets": [
        "หีบอ้อย", "crushing", "boiling house", "การผลิต",
        "daily production", "lab analysis", "cane receiving",
        "สรุปผลผลิต", "ตั๋วชั่ง", "quality lab", "utility",
        "ผลวิเคราะห์", "downtime",
        "fertilizer", "pesticide", "ปุ๋ย", "ยาฆ่าแมลง",
        "water usage", "การใช้น้ำ", "สารเคมีเกษตร", "ไร่อ้อย"
      ],
      "weightPerHit": 2.0
    },
    "valueShapes": [
      {
        "columnLike": "pol|พอล|Pol \\(%\\)",
        "type": "percentage",
        "range": [5, 20],
        "weight": 4.0,
        "note": "Pol % cane physically lives here; near-proof signal"
      },
      {
        "columnLike": "brix|บริกซ์|Brix",
        "type": "percentage",
        "range": [10, 25],
        "weight": 3.0,
        "note": "Brix % in juice or cane; strong sugar-industry signal"
      },
      {
        "columnLike": "ccs|ซีซีเอส|CCS",
        "type": "number",
        "range": [8, 16],
        "weight": 4.0,
        "note": "Commercial Cane Sugar; definitive if within physics range"
      },
      {
        "columnLike": "recovery|Overall Recovery|อัตราการสกัด",
        "type": "percentage",
        "range": [70, 98],
        "weight": 3.0,
        "note": "Overall recovery % in boiling house; high-confidence signal"
      },
      {
        "columnLike": "bhr|boiling house recovery",
        "type": "percentage",
        "range": [75, 98],
        "weight": 3.5,
        "note": "Boiling House Recovery; specific to sugar processing"
      },
      {
        "columnLike": "purity|ความบริสุทธิ์|Purity",
        "type": "percentage",
        "range": [60, 100],
        "weight": 2.5,
        "note": "Juice or sugar purity; strong but also appears in other labs"
      },
      {
        "columnLike": "icumsa|ICUMSA|สี ICUMSA",
        "type": "number",
        "range": [20, 5000],
        "weight": 3.5,
        "note": "ICUMSA color units; definitive sugar quality metric"
      },
      {
        "columnLike": "อ้อยเข้าหีบ|cane crushed|ตันอ้อย|ton cane",
        "type": "number",
        "range": [100, 50000],
        "weight": 2.5,
        "note": "Daily cane throughput in tons; confirms scale"
      },
      {
        "columnLike": "fiber|เส้นใย|ไฟเบอร์",
        "type": "percentage",
        "range": [10, 18],
        "weight": 2.0,
        "note": "Fiber % in cane; ancillary sugar signal"
      },
      {
        "columnLike": "imbibition|น้ำท่วม",
        "type": "percentage",
        "range": [150, 350],
        "weight": 3.0,
        "note": "Imbibition % on fiber; unique to sugar milling"
      }
    ],
    "unitPatterns": [
      "ตันอ้อย", "ton cane", "tcd", "tchr", "ตัน/วัน",
      "IU", "ICUMSA", "กก./ตันอ้อย", "kg/tc"
    ],
    "negative": [
      { "lexicon": ["diagnosis", "patient", "ผู้ป่วย", "โรค"], "weight": -3.0 },
      { "lexicon": ["student", "นักเรียน", "grade", "เกรด", "GPA"], "weight": -2.0 },
      { "lexicon": ["portfolio", "stock price", "หุ้น", "กองทุน"], "weight": -2.0 },
      { "lexicon": ["hotel", "booking", "reservation", "check-in"], "weight": -1.5 },
      { "lexicon": ["pollutant", "air_quality", "emission", "carbon", "pm25", "pm10", "no2", "so2", "co_ppm"], "weight": -3.0 },
      { "lexicon": ["shipment_id", "carrier", "freight", "tracking_events", "bill of lading", "cost_per_delivery"], "weight": -2.0 },
      { "lexicon": ["impression", "ctr", "cpc", "roas", "campaign_id", "ad_group", "engagement_rate"], "weight": -2.0 },
      { "lexicon": ["cart", "add_to_cart", "checkout", "shipping_fee", "marketplace", "shopee", "lazada"], "weight": -2.0 },
      { "lexicon": ["occupancy", "adr", "revpar", "check_in", "room_type", "no_shows"], "weight": -2.0 }
    ]
  },

  "business": {
    "processes": [
      {
        "id": "cane_supply",
        "stages": ["ส่งเสริมชาวไร่", "ปลูกอ้อย", "เก็บเกี่ยว", "ขนส่ง", "ชั่งน้ำหนัก", "ตรวจคุณภาพ"]
      },
      {
        "id": "crushing",
        "stages": ["รับอ้อย", "สับ/ย่อย", "หีบ (ลูกหีบ 1-5)", "น้ำอ้อยรวม", "กากอ้อย→เชื้อเพลิง"]
      },
      {
        "id": "clarification",
        "stages": ["ชั่ง/วัดน้ำอ้อย", "ให้ความร้อน", "เติมปูนขาว", "ตกตะกอน", "กรอง", "น้ำอ้อยใส"]
      },
      {
        "id": "evaporation",
        "stages": ["น้ำอ้อยใส", "ระเหยหลายชั้น", "น้ำเชื่อม (60-65 Brix)"]
      },
      {
        "id": "boiling_crystallization",
        "stages": ["เคี่ยว (หม้อเคี่ยว)", "ตกผลึก", "แมสคิวท์ A/B/C", "โมลาส"]
      },
      {
        "id": "centrifugal_drying",
        "stages": ["ปั่นแยก", "ล้างผลึก", "อบแห้ง", "ร่อนคัดขนาด", "บรรจุ"]
      }
    ],
    "goals": [
      "maximize extraction rate and overall recovery",
      "minimize sugar loss (undetermined loss < 2%)",
      "maximize CCS-based revenue per ton cane",
      "minimize downtime and maximize crushing capacity (TCD)",
      "optimize cane quality (fresh cane ratio, reduce burnt cane)",
      "maximize steam economy and cogeneration efficiency",
      "meet ICUMSA color spec for premium grade sugar",
      "ensure cane supply continuity throughout crushing season"
    ],
    "personas": [
      {
        "type": "executive",
        "cares": ["revenue", "recovery", "vs-plan", "cane supply forecast", "season projection"],
        "cadence": "daily-morning"
      },
      {
        "type": "operational",
        "cares": ["downtime", "shift performance", "loss points", "CCS trend", "extraction rate"],
        "cadence": "per-shift"
      },
      {
        "type": "quality_lab",
        "cares": ["Pol", "Brix", "Purity", "ICUMSA", "process control limits"],
        "cadence": "per-shift"
      },
      {
        "type": "agricultural",
        "cares": ["cane supply volume", "farmer delivery", "cane freshness", "variety performance"],
        "cadence": "daily"
      }
    ],
    "decisionCatalog": [
      "intervene-in-operations",
      "explain-variance",
      "allocate-maintenance",
      "plan-forecast",
      "adjust-process-parameters",
      "route-cane-supply",
      "schedule-pan-boiling",
      "investigate-loss"
    ],
    "seasonality": "crushing season (Nov–Apr); off-season dashboards shift to maintenance planning, cane development tracking, and equipment overhaul framing. Peak crushing Dec–Feb."
  },

  "kpiRefs": [
    "kpi.sugar.ccs",
    "kpi.sugar.extraction_pct",
    "kpi.sugar.bhr",
    "kpi.sugar.overall_recovery",
    "kpi.sugar.undetermined_loss",
    "kpi.sugar.downtime_hr",
    "kpi.sugar.cane_crushed",
    "kpi.sugar.pol_in_cane",
    "kpi.sugar.pol_in_bagasse",
    "kpi.sugar.fiber_pct",
    "kpi.sugar.imbibition_pct",
    "kpi.sugar.sugar_produced",
    "kpi.sugar.icumsa_color",
    "kpi.sugar.steam_consumption",
    "kpi.sugar.cane_freshness_ratio",
    "kpi.sugar.tcd",
    "kpi.mfg.oee"
  ],

  "genomeRefs": [
    "genome.sugar_daily_production_v3",
    "genome.sugar_udl_analysis_v1",
    "genome.sugar_quality_lab_v1",
    "genome.sugar_cane_supply_v1"
  ],

  "vizOverrides": [
    { "rule": "control-chart preferred for Pol/Brix stability monitoring", "cites": "doc 06 §5" },
    { "rule": "time-series with target band for CCS and recovery trends", "cites": "doc 06 §3" },
    { "rule": "waterfall chart for sugar loss breakdown (extraction→clarification→evaporation→boiling→centrifugal)", "cites": "doc 06 §4" },
    { "rule": "gauge/bullet for shift KPIs vs target (TCD, recovery)", "cites": "doc 06 §3" },
    { "rule": "heatmap for hourly crushing rate by day-of-season", "cites": "doc 06 §5" }
  ],

  "fixtures": [
    "ตัวอย่าง Data/Mock_Dashboard_Data/01_เกษตรและไร่อ้อย/*.json",
    "ตัวอย่าง Data/Mock_Dashboard_Data/06_การผลิต/*.json"
  ]
}
;

window.__KB_KPI_DEFS = {};
window.__KB_KPI_DEFS['ecommerce_retail'] = [
  {
    "id": "kpi.ecom.gmv",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "ยอดขายรวม", "en": "Gross Merchandise Value (GMV)" },
    "formula": "sum(order_value)",
    "inputs": {
      "order_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ยอดขาย", "มูลค่าขาย", "ยอดรวม", "ยอดสุทธิ"], "en": ["gmv", "gross merchandise value", "revenue", "sales", "order value", "total"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the total gross merchandise value?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["GMV includes returns and cancellations before deduction"]
  },
  {
    "id": "kpi.ecom.order_count",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "จำนวนคำสั่งซื้อ", "en": "Order Count" },
    "formula": "count(orders)",
    "inputs": {
      "orders": { "role": "measure", "unit": "count", "synonyms": { "th": ["คำสั่งซื้อ", "ออเดอร์", "รายการ"], "en": ["orders", "transactions", "order count"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How many orders were placed?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": []
  },
  {
    "id": "kpi.ecom.aov",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "มูลค่าเฉลี่ยต่อคำสั่ง", "en": "Average Order Value (AOV)" },
    "formula": "sum(order_value) / count(orders)",
    "inputs": {
      "order_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ยอดรวม", "มูลค่า"], "en": ["order value", "total", "subtotal"] } },
      "orders": { "role": "measure", "unit": "count", "synonyms": { "th": ["คำสั่งซื้อ"], "en": ["orders", "transactions"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the average order value?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": []
  },
  {
    "id": "kpi.ecom.conversion_rate",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "อัตราคอนเวอร์ชั่น", "en": "Conversion Rate" },
    "formula": "100 * count(orders) / count(sessions)",
    "inputs": {
      "orders": { "role": "measure", "unit": "count", "synonyms": { "th": ["คำสั่งซื้อ"], "en": ["orders", "purchases"] } },
      "sessions": { "role": "measure", "unit": "count", "synonyms": { "th": ["การเข้าชม", "เซสชั่น"], "en": ["sessions", "visits", "visitors"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What percentage of visitors make a purchase?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Varies by traffic source"]
  },
  {
    "id": "kpi.ecom.cart_abandonment",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "อัตราทิ้งตะกร้า", "en": "Cart Abandonment Rate" },
    "formula": "100 * (1 - count(completed) / count(carts_created))",
    "inputs": {
      "completed": { "role": "measure", "unit": "count", "synonyms": { "th": ["ชำระเงินสำเร็จ"], "en": ["completed", "purchased", "checkout completed"] } },
      "carts_created": { "role": "measure", "unit": "count", "synonyms": { "th": ["สร้างตะกร้า", "หยิบใส่ตะกร้า"], "en": ["carts created", "add to cart", "cart sessions"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 60, "warn": 80 } },
    "grain": ["weekly", "monthly"],
    "answers": ["What percentage of shopping carts are abandoned?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Industry average is typically 65-75%"]
  },
  {
    "id": "kpi.ecom.return_rate",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "อัตราคืนสินค้า", "en": "Return Rate" },
    "formula": "100 * count(returns) / count(orders)",
    "inputs": {
      "returns": { "role": "measure", "unit": "count", "synonyms": { "th": ["คืนสินค้า", "เปลี่ยนสินค้า", "คืน"], "en": ["returns", "refunds", "exchanges"] } },
      "orders": { "role": "measure", "unit": "count", "synonyms": { "th": ["คำสั่งซื้อ"], "en": ["orders", "total orders"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 5, "warn": 15 } },
    "grain": ["weekly", "monthly"],
    "answers": ["What percentage of orders are returned?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Fashion/apparel typically has higher return rates"]
  },
  {
    "id": "kpi.ecom.repeat_purchase_rate",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "อัตราซื้อซ้ำ", "en": "Repeat Purchase Rate" },
    "formula": "100 * count(repeat_customers) / count(total_customers)",
    "inputs": {
      "repeat_customers": { "role": "measure", "unit": "count", "synonyms": { "th": ["ลูกค้าซื้อซ้ำ", "ลูกค้าเก่า"], "en": ["repeat customers", "returning customers", "repeat buyers"] } },
      "total_customers": { "role": "measure", "unit": "count", "synonyms": { "th": ["ลูกค้าทั้งหมด"], "en": ["total customers", "customers", "unique customers"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly"],
    "answers": ["What percentage of customers buy again?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Depends on product type and purchase cycle"]
  },
  {
    "id": "kpi.ecom.customer_count",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "จำนวนลูกค้า", "en": "Customer Count" },
    "formula": "count_distinct(customer_id)",
    "inputs": {
      "customer_id": { "role": "dimension", "unit": "id", "synonyms": { "th": ["ลูกค้า", "รหัสลูกค้า"], "en": ["customer", "customer id", "buyer"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["weekly", "monthly"],
    "answers": ["How many unique customers placed orders?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": []
  },
  {
    "id": "kpi.ecom.revenue_per_customer",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "รายได้ต่อลูกค้า", "en": "Revenue per Customer" },
    "formula": "sum(order_value) / count_distinct(customer_id)",
    "inputs": {
      "order_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ยอดขาย"], "en": ["revenue", "order value", "sales"] } },
      "customer_id": { "role": "dimension", "unit": "id", "synonyms": { "th": ["ลูกค้า"], "en": ["customer", "customer id"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly"],
    "answers": ["How much does each customer spend on average?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": []
  },
  {
    "id": "kpi.ecom.avg_rating",
    "version": "1.0.0",
    "domain": "ecommerce_retail",
    "name": { "th": "คะแนนรีวิวเฉลี่ย", "en": "Average Product Rating" },
    "formula": "avg(rating)",
    "inputs": {
      "rating": { "role": "measure", "unit": "score", "synonyms": { "th": ["คะแนน", "ดาว", "รีวิว"], "en": ["rating", "stars", "review score", "product rating"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 4.5, "warn": 3.5 } },
    "grain": ["weekly", "monthly"],
    "answers": ["What is the average product rating?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Weight by review count for fair cross-product comparison"]
  }
]
;

window.__KB_KPI_DEFS['education'] = [
  {
    "id": "kpi.edu.enrollment_count",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "จำนวนนักเรียน/นักศึกษา", "en": "Enrollment Count" },
    "formula": "count(students)",
    "inputs": {
      "students": { "role": "measure", "unit": "count", "synonyms": { "th": ["นักเรียน", "นักศึกษา", "จำนวนผู้เรียน", "จำนวนนักเรียน"], "en": ["students", "enrolled", "enrollment", "headcount", "learners"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["semester", "yearly"],
    "answers": ["How many students are enrolled?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Distinguish active vs total enrollment"]
  },
  {
    "id": "kpi.edu.avg_gpa",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "เกรดเฉลี่ยรวม", "en": "Average GPA" },
    "formula": "avg(gpa)",
    "inputs": {
      "gpa": { "role": "measure", "unit": "gpa", "synonyms": { "th": ["เกรดเฉลี่ย", "GPA", "เกรด", "ผลการเรียน"], "en": ["gpa", "cgpa", "grade point average", "cumulative gpa"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 2 },
    "target": { "policy": "fixed", "benchmark": { "good": 3.0, "warn": 2.0 } },
    "grain": ["semester", "yearly"],
    "answers": ["What is the average GPA?", "How is academic performance trending?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["GPA scale varies (4.0 vs 5.0); ensure consistency"]
  },
  {
    "id": "kpi.edu.pass_rate",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "อัตราผ่าน", "en": "Pass Rate" },
    "formula": "100 * count(passed) / count(total)",
    "inputs": {
      "passed": { "role": "measure", "unit": "count", "synonyms": { "th": ["ผ่าน", "สอบผ่าน"], "en": ["passed", "pass", "completed"] } },
      "total": { "role": "measure", "unit": "count", "synonyms": { "th": ["ทั้งหมด", "จำนวนทั้งหมด"], "en": ["total", "enrolled", "students"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 85, "warn": 70 } },
    "grain": ["per-course", "semester"],
    "answers": ["What percentage of students pass?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Segment by course difficulty level"]
  },
  {
    "id": "kpi.edu.dropout_rate",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "อัตราออกกลางคัน", "en": "Dropout Rate" },
    "formula": "100 * count(dropouts) / count(enrolled)",
    "inputs": {
      "dropouts": { "role": "measure", "unit": "count", "synonyms": { "th": ["ออกกลางคัน", "ลาออก", "ถอน"], "en": ["dropout", "withdrawn", "left", "dropped out"] } },
      "enrolled": { "role": "measure", "unit": "count", "synonyms": { "th": ["ลงทะเบียน", "นักเรียนทั้งหมด"], "en": ["enrolled", "total students", "registered"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 3, "warn": 10 } },
    "grain": ["semester", "yearly"],
    "answers": ["What percentage of students drop out?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Track by cohort for meaningful trend analysis"]
  },
  {
    "id": "kpi.edu.graduation_rate",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "อัตราจบการศึกษา", "en": "Graduation Rate" },
    "formula": "100 * count(graduated) / count(cohort)",
    "inputs": {
      "graduated": { "role": "measure", "unit": "count", "synonyms": { "th": ["จบการศึกษา", "สำเร็จการศึกษา"], "en": ["graduated", "completed program", "degree awarded"] } },
      "cohort": { "role": "measure", "unit": "count", "synonyms": { "th": ["รุ่น", "ผู้เข้าเรียน"], "en": ["cohort", "admitted", "entering class"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 90, "warn": 75 } },
    "grain": ["yearly"],
    "answers": ["What percentage of students graduate on time?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Graduation within standard timeframe vs total eventual graduation"]
  },
  {
    "id": "kpi.edu.attendance_rate",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "อัตราเข้าเรียน", "en": "Attendance Rate" },
    "formula": "100 * count(present) / count(expected)",
    "inputs": {
      "present": { "role": "measure", "unit": "count", "synonyms": { "th": ["มาเรียน", "เข้าเรียน"], "en": ["present", "attended", "attendance"] } },
      "expected": { "role": "measure", "unit": "count", "synonyms": { "th": ["ควรมา", "ทั้งหมด"], "en": ["expected", "total days", "scheduled"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 90, "warn": 80 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the attendance rate?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Distinguish excused vs unexcused absences"]
  },
  {
    "id": "kpi.edu.student_teacher_ratio",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "อัตราส่วนนักเรียนต่อครู", "en": "Student-Teacher Ratio" },
    "formula": "count(students) / count(teachers)",
    "inputs": {
      "students": { "role": "measure", "unit": "count", "synonyms": { "th": ["นักเรียน"], "en": ["students", "enrolled"] } },
      "teachers": { "role": "measure", "unit": "count", "synonyms": { "th": ["ครู", "อาจารย์", "ผู้สอน"], "en": ["teachers", "instructors", "faculty"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "fixed", "benchmark": { "good": 20, "warn": 35 } },
    "grain": ["semester", "yearly"],
    "answers": ["How many students per teacher?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Include only FTE teaching staff"]
  },
  {
    "id": "kpi.edu.avg_exam_score",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "คะแนนสอบเฉลี่ย", "en": "Average Exam Score" },
    "formula": "avg(exam_score)",
    "inputs": {
      "exam_score": { "role": "measure", "unit": "score", "synonyms": { "th": ["คะแนนสอบ", "คะแนน", "ผลสอบ"], "en": ["exam score", "test score", "score", "marks", "grade"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["per-exam", "semester"],
    "answers": ["What is the average exam score?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Normalize if different exams use different scales"]
  },
  {
    "id": "kpi.edu.scholarship_count",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "จำนวนผู้รับทุน", "en": "Scholarship Recipients" },
    "formula": "count(scholarship_students)",
    "inputs": {
      "scholarship_students": { "role": "measure", "unit": "count", "synonyms": { "th": ["ผู้รับทุน", "ทุนการศึกษา"], "en": ["scholarship", "scholarship recipients", "funded students"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["semester", "yearly"],
    "answers": ["How many students receive scholarships?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": []
  },
  {
    "id": "kpi.edu.course_completion_rate",
    "version": "1.0.0",
    "domain": "education",
    "name": { "th": "อัตราเรียนจบรายวิชา", "en": "Course Completion Rate" },
    "formula": "100 * count(completed) / count(registered)",
    "inputs": {
      "completed": { "role": "measure", "unit": "count", "synonyms": { "th": ["เรียนจบ", "สำเร็จ"], "en": ["completed", "finished", "passed"] } },
      "registered": { "role": "measure", "unit": "count", "synonyms": { "th": ["ลงทะเบียน", "สมัครเรียน"], "en": ["registered", "enrolled", "started"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 90, "warn": 75 } },
    "grain": ["per-course", "semester"],
    "answers": ["What percentage of registered students complete the course?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Online courses typically have lower completion rates"]
  }
]
;

window.__KB_KPI_DEFS['finance_accounting'] = [
  {
    "id": "kpi.finance.revenue",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "รายได้", "en": "Revenue" },
    "formula": "sum(revenue)",
    "inputs": {
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้", "ยอมขาย", "ยอดขาย", "รายรับ"], "en": ["revenue", "sales", "income", "total sales", "net revenue"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly", "quarterly", "yearly"],
    "answers": ["What is total revenue for the period?", "Is revenue on track against budget?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Ensure gross vs net revenue consistency", "Currency must be uniform or converted"]
  },
  {
    "id": "kpi.finance.cogs",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "ต้นทุนขาย", "en": "Cost of Goods Sold (COGS)" },
    "formula": "sum(cogs)",
    "inputs": {
      "cogs": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ต้นทุนขาย", "ต้นทุนสินค้า", "ต้นทุนสินค้าขาย", "COGS"], "en": ["COGS", "cost of goods sold", "cost of sales", "direct cost"] } }
    },
    "aggNature": "extensive",
    "direction": "lower-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["What is the direct cost of products sold?", "Is cost of goods sold trending up?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Must align with revenue recognition period"]
  },
  {
    "id": "kpi.finance.gross_margin_pct",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "อัตรากำไรขั้นต้น", "en": "Gross Margin %" },
    "formula": "100 * (sum(revenue) - sum(cogs)) / sum(revenue)",
    "inputs": {
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้", "ยอดขาย"], "en": ["revenue", "sales", "net revenue"] } },
      "cogs": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ต้นทุนขาย", "ต้นทุนสินค้า"], "en": ["COGS", "cost of goods sold", "cost of sales"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 40.0, "warn": 25.0 } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["What proportion of revenue remains after direct costs?", "Is gross profitability improving?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Benchmark varies enormously by industry — sugar ~15-25%, SaaS ~70-85%"]
  },
  {
    "id": "kpi.finance.opex_ratio",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "สัดส่วนค่าใช้จ่ายดำเนินงาน", "en": "Operating Expense Ratio" },
    "formula": "100 * sum(opex) / sum(revenue)",
    "inputs": {
      "opex": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ค่าใช้จ่ายดำเนินงาน", "ค่าใช้จ่ายในการขายและบริหาร", "SGA"], "en": ["operating expenses", "opex", "SGA", "SG&A", "overhead"] } },
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้", "ยอดขาย"], "en": ["revenue", "sales", "net revenue"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 20.0, "warn": 35.0 } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["How much of revenue is consumed by operating expenses?", "Is cost control effective?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Benchmark is highly industry-dependent"]
  },
  {
    "id": "kpi.finance.budget_variance",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "ผลต่างงบประมาณ", "en": "Budget Variance %" },
    "formula": "100 * (sum(actual_amount) - sum(budget_amount)) / sum(budget_amount)",
    "inputs": {
      "actual_amount": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ยอมจริง", "จ่ายจริง", "ค่าใช้จ่ายจริง", "ผลจริง"], "en": ["actual amount", "actual spend", "actual cost", "actuals"] } },
      "budget_amount": { "role": "measure", "unit": "currency", "synonyms": { "th": ["งบประมาณ", "เป้า", "แผน", "งบ"], "en": ["budget", "budgeted amount", "plan", "target amount"] } }
    },
    "aggNature": "intensive",
    "direction": "target-band",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "column", "benchmark": { "good": 0.0, "warn": 10.0 } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["Are we spending within budget?", "Which categories are over or under budget?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Positive variance can mean overspend (expense) or overperformance (revenue) — context matters"]
  },
  {
    "id": "kpi.finance.ar_aging",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "อายุลูกหนี้การค้า", "en": "Accounts Receivable Aging (Days)" },
    "formula": "wavg(ar_days_outstanding, ar_balance)",
    "inputs": {
      "ar_days_outstanding": { "role": "measure", "unit": "day", "synonyms": { "th": ["อายุลูกหนี้", "วันค้างชำระ", "จำนวนวันลูกหนี้"], "en": ["AR days outstanding", "days receivable", "DSO", "receivable aging"] } },
      "ar_balance": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ยอมลูกหนี้", "ลูกหนี้คงค้าง", "ยอดลูกหนี้"], "en": ["AR balance", "accounts receivable", "receivable balance", "outstanding receivables"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 30, "warn": 60 } },
    "grain": ["monthly", "quarterly"],
    "answers": ["How quickly are customers paying?", "Is receivable collection deteriorating?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Industry payment terms vary widely; compare against own credit policy"]
  },
  {
    "id": "kpi.finance.ap_aging",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "อายุเจ้าหนี้การค้า", "en": "Accounts Payable Aging (Days)" },
    "formula": "wavg(ap_days_outstanding, ap_balance)",
    "inputs": {
      "ap_days_outstanding": { "role": "measure", "unit": "day", "synonyms": { "th": ["อายุเจ้าหนี้", "วันค้างจ่าย", "จำนวนวันเจ้าหนี้"], "en": ["AP days outstanding", "days payable", "DPO", "payable aging"] } },
      "ap_balance": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ยอดเจ้าหนี้", "เจ้าหนี้คงค้าง"], "en": ["AP balance", "accounts payable", "payable balance", "outstanding payables"] } }
    },
    "aggNature": "intensive",
    "direction": "target-band",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 45, "warn": 90 } },
    "grain": ["monthly", "quarterly"],
    "answers": ["How long are we taking to pay suppliers?", "Are we at risk of late payment penalties?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Stretching payables improves cash flow but may damage supplier relationships"]
  },
  {
    "id": "kpi.finance.cash_conversion_cycle",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "วงจรเงินสด", "en": "Cash Conversion Cycle (Days)" },
    "formula": "avg(dso) + avg(dio) - avg(dpo)",
    "inputs": {
      "dso": { "role": "measure", "unit": "day", "synonyms": { "th": ["วันลูกหนี้", "DSO"], "en": ["DSO", "days sales outstanding", "receivable days"] } },
      "dio": { "role": "measure", "unit": "day", "synonyms": { "th": ["วันสินค้าคงคลัง", "DIO"], "en": ["DIO", "days inventory outstanding", "inventory days"] } },
      "dpo": { "role": "measure", "unit": "day", "synonyms": { "th": ["วันเจ้าหนี้", "DPO"], "en": ["DPO", "days payable outstanding", "payable days"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly"],
    "answers": ["How long does it take to convert resource investments into cash?", "Is working capital management improving?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Negative CCC (common in retail) means suppliers finance operations — not always sustainable"]
  },
  {
    "id": "kpi.finance.expense_per_unit",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "ต้นทุนต่อหน่วย", "en": "Expense per Unit" },
    "formula": "sum(total_cost) / sum(units_produced)",
    "inputs": {
      "total_cost": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ต้นทุนรวม", "ค่าใช้จ่ายรวม", "ต้นทุนทั้งหมด"], "en": ["total cost", "total expense", "total expenditure"] } },
      "units_produced": { "role": "measure", "unit": "unit", "synonyms": { "th": ["จำนวนผลิต", "หน่วยผลิต", "ชิ้นงาน"], "en": ["units produced", "output units", "production volume"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "currency", "decimals": 2 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["What does it cost to produce one unit?", "Is unit cost trending up or down?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Must define unit consistently — weight, piece, lot"]
  },
  {
    "id": "kpi.finance.net_profit_margin",
    "version": "1.0.0",
    "domain": "finance_accounting",
    "name": { "th": "อัตรากำไรสุทธิ", "en": "Net Profit Margin %" },
    "formula": "100 * sum(net_profit) / sum(revenue)",
    "inputs": {
      "net_profit": { "role": "measure", "unit": "currency", "synonyms": { "th": ["กำไรสุทธิ", "กำไรหลังภาษี", "ผลกำไร"], "en": ["net profit", "net income", "bottom line", "profit after tax"] } },
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้", "ยอดขาย"], "en": ["revenue", "sales", "net revenue"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 15.0, "warn": 5.0 } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["What proportion of revenue becomes profit?", "Is overall profitability healthy?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Benchmark varies enormously by industry and business model"]
  }
]
;

window.__KB_KPI_DEFS['hotel_hospitality'] = [
  {
    "id": "kpi.htl.occupancy_rate",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "อัตราเข้าพัก", "en": "Occupancy Rate" },
    "formula": "100 * count(occupied_rooms) / count(available_rooms)",
    "inputs": {
      "occupied_rooms": { "role": "measure", "unit": "count", "synonyms": { "th": ["ห้องที่จอง", "ห้องที่เข้าพัก", "ห้องขาย"], "en": ["occupied rooms", "rooms sold", "occupied"] } },
      "available_rooms": { "role": "measure", "unit": "count", "synonyms": { "th": ["ห้องว่าง", "ห้องทั้งหมด", "จำนวนห้อง"], "en": ["available rooms", "total rooms", "rooms available"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 75, "warn": 50 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the hotel occupancy rate?", "How full is the hotel?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Exclude out-of-order rooms from available count"]
  },
  {
    "id": "kpi.htl.adr",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "ราคาห้องเฉลี่ย", "en": "Average Daily Rate (ADR)" },
    "formula": "sum(room_revenue) / count(rooms_sold)",
    "inputs": {
      "room_revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้ห้องพัก", "รายได้จากห้อง"], "en": ["room revenue", "room income"] } },
      "rooms_sold": { "role": "measure", "unit": "count", "synonyms": { "th": ["ห้องที่ขาย", "ห้องที่เข้าพัก"], "en": ["rooms sold", "occupied rooms"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the average room rate?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["ADR excludes complimentary rooms and staff use"]
  },
  {
    "id": "kpi.htl.revpar",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "รายได้ต่อห้องว่าง", "en": "Revenue per Available Room (RevPAR)" },
    "formula": "sum(room_revenue) / count(available_rooms)",
    "inputs": {
      "room_revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้ห้องพัก"], "en": ["room revenue"] } },
      "available_rooms": { "role": "measure", "unit": "count", "synonyms": { "th": ["ห้องทั้งหมด"], "en": ["available rooms", "total rooms"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is RevPAR?", "How well is the hotel monetizing its capacity?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["RevPAR = ADR × Occupancy Rate"]
  },
  {
    "id": "kpi.htl.total_room_revenue",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "รายได้ห้องพักรวม", "en": "Total Room Revenue" },
    "formula": "sum(room_revenue)",
    "inputs": {
      "room_revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้ห้องพัก", "รายได้"], "en": ["room revenue", "revenue", "room income"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is total room revenue?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": []
  },
  {
    "id": "kpi.htl.no_show_rate",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "อัตรา No-Show", "en": "No-Show Rate" },
    "formula": "100 * count(no_shows) / count(bookings)",
    "inputs": {
      "no_shows": { "role": "measure", "unit": "count", "synonyms": { "th": ["no show", "ไม่มาเข้าพัก"], "en": ["no show", "no_show", "no-show"] } },
      "bookings": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนจอง", "ยอดจอง"], "en": ["bookings", "reservations"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 3, "warn": 8 } },
    "grain": ["weekly", "monthly"],
    "answers": ["What percentage of bookings result in no-shows?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Distinguish guaranteed vs non-guaranteed reservations"]
  },
  {
    "id": "kpi.htl.cancel_rate",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "อัตรายกเลิก", "en": "Cancellation Rate" },
    "formula": "100 * count(cancellations) / count(bookings)",
    "inputs": {
      "cancellations": { "role": "measure", "unit": "count", "synonyms": { "th": ["ยกเลิกจอง", "ยกเลิก"], "en": ["cancellation", "cancelled", "cancel"] } },
      "bookings": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนจอง"], "en": ["bookings", "reservations"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 10, "warn": 25 } },
    "grain": ["weekly", "monthly"],
    "answers": ["What percentage of bookings are cancelled?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": []
  },
  {
    "id": "kpi.htl.avg_los",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "ระยะเวลาเข้าพักเฉลี่ย", "en": "Average Length of Stay" },
    "formula": "avg(nights)",
    "inputs": {
      "nights": { "role": "measure", "unit": "nights", "synonyms": { "th": ["คืน", "คืนที่พัก", "จำนวนคืน"], "en": ["nights", "length of stay", "los", "stay duration"] } }
    },
    "aggNature": "intensive",
    "direction": "neutral",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["weekly", "monthly"],
    "answers": ["How long do guests stay on average?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Segment by guest type (business vs leisure)"]
  },
  {
    "id": "kpi.htl.guest_satisfaction",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "คะแนนความพึงพอใจ", "en": "Guest Satisfaction Score" },
    "formula": "avg(satisfaction_score)",
    "inputs": {
      "satisfaction_score": { "role": "measure", "unit": "score", "synonyms": { "th": ["คะแนนรีวิว", "ความพึงพอใจ", "คะแนน"], "en": ["review score", "rating", "satisfaction", "guest satisfaction"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 8.5, "warn": 7 } },
    "grain": ["weekly", "monthly"],
    "answers": ["How satisfied are guests?", "What is the average review score?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Normalize scores if aggregating across platforms with different scales"]
  },
  {
    "id": "kpi.htl.direct_booking_pct",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "สัดส่วนจองตรง", "en": "Direct Booking Percentage" },
    "formula": "100 * count(direct_bookings) / count(total_bookings)",
    "inputs": {
      "direct_bookings": { "role": "measure", "unit": "count", "synonyms": { "th": ["จองตรง", "จองผ่านเว็บ"], "en": ["direct booking", "direct", "website booking"] } },
      "total_bookings": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนจอง", "ยอดจองทั้งหมด"], "en": ["total bookings", "bookings", "reservations"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 40, "warn": 20 } },
    "grain": ["monthly"],
    "answers": ["What percentage of bookings come through direct channels?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Direct bookings have lower commission cost than OTA"]
  },
  {
    "id": "kpi.htl.fb_revenue",
    "version": "1.0.0",
    "domain": "hotel_hospitality",
    "name": { "th": "รายได้อาหารและเครื่องดื่ม", "en": "F&B Revenue" },
    "formula": "sum(fb_revenue)",
    "inputs": {
      "fb_revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้อาหาร", "รายได้ F&B", "ยอดอาหาร"], "en": ["f&b revenue", "food and beverage", "restaurant revenue", "fb income"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is total F&B revenue?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Include restaurant, room service, minibar, banquet"]
  }
]
;

window.__KB_KPI_DEFS['hr_people'] = [
  {
    "id": "kpi.hr.headcount",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "จำนวนพนักงาน", "en": "Headcount" },
    "formula": "count_distinct(employee_id)",
    "inputs": {
      "employee_id": { "role": "dimension", "unit": "id", "synonyms": { "th": ["รหัสพนักงาน", "พนักงาน", "รหัสประจำตัว", "ลูกจ้าง"], "en": ["employee ID", "employee", "staff", "worker", "headcount", "personnel"] } }
    },
    "aggNature": "extensive",
    "direction": "target-band",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["How many employees do we have?", "Is headcount aligned with budget?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Distinguish FTE vs head count; include/exclude contractors consistently"]
  },
  {
    "id": "kpi.hr.attrition_pct",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "อัตราการลาออก", "en": "Attrition Rate %" },
    "formula": "100 * count(exits) / avg(headcount)",
    "inputs": {
      "exits": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนลาออก", "พนักงานออก", "ลาออก", "พ้นสภาพ"], "en": ["exits", "terminations", "separations", "leavers", "turnover count"] } },
      "headcount": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนพนักงาน", "อัตรากำลัง"], "en": ["headcount", "total employees", "workforce size"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 8.0, "warn": 15.0 } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["What is the employee turnover rate?", "Is attrition increasing?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Separate voluntary from involuntary for actionability", "Annualize monthly rates for comparison"]
  },
  {
    "id": "kpi.hr.new_hires",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "จำนวนพนักงานใหม่", "en": "New Hires" },
    "formula": "count(new_hires)",
    "inputs": {
      "new_hires": { "role": "measure", "unit": "count", "synonyms": { "th": ["พนักงานใหม่", "เข้าใหม่", "จ้างใหม่", "รับเข้า"], "en": ["new hires", "hires", "joiners", "new employees", "onboarded"] } }
    },
    "aggNature": "extensive",
    "direction": "target-band",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["How many new employees joined this period?", "Is hiring keeping pace with attrition?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Compare against open positions to assess hiring velocity"]
  },
  {
    "id": "kpi.hr.exits",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "จำนวนพนักงานออก", "en": "Exits" },
    "formula": "count(exits)",
    "inputs": {
      "exits": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนลาออก", "พนักงานออก", "ลาออก", "เกษียณ", "พ้นสภาพ"], "en": ["exits", "terminations", "separations", "leavers", "departures"] } }
    },
    "aggNature": "extensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["How many employees left this period?", "Is the departure rate stable?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Distinguish voluntary, involuntary, and retirement for actionability"]
  },
  {
    "id": "kpi.hr.tenure_mix",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "สัดส่วนอายุงาน", "en": "Tenure Mix" },
    "formula": "avg(tenure_years)",
    "inputs": {
      "tenure_years": { "role": "measure", "unit": "year", "synonyms": { "th": ["อายุงาน", "ระยะเวลาทำงาน", "ปีทำงาน"], "en": ["tenure", "years of service", "service years", "length of service", "seniority"] } }
    },
    "aggNature": "intensive",
    "direction": "target-band",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["quarterly", "yearly"],
    "answers": ["What is the experience profile of the workforce?", "Is institutional knowledge at risk from tenure concentration?"],
    "variance": false,
    "forecastCandidate": false,
    "caveats": ["Average hides distribution — present as histogram/bands for actionability"]
  },
  {
    "id": "kpi.hr.comp_ratio",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "อัตราส่วนค่าตอบแทน", "en": "Comp Ratio" },
    "formula": "avg(actual_salary) / avg(midpoint_salary)",
    "inputs": {
      "actual_salary": { "role": "measure", "unit": "currency", "synonyms": { "th": ["เงินเดือนจริง", "ค่าตอบแทนจริง", "เงินเดือน"], "en": ["actual salary", "current salary", "base pay", "compensation"] } },
      "midpoint_salary": { "role": "measure", "unit": "currency", "synonyms": { "th": ["เงินเดือนกลาง", "ค่ากลางเงินเดือน", "เงินเดือนมาตรฐาน"], "en": ["midpoint salary", "salary midpoint", "market rate", "pay grade midpoint"] } }
    },
    "aggNature": "intensive",
    "direction": "target-band",
    "format": { "kind": "number", "decimals": 2 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 1.0, "warn": 0.85 } },
    "grain": ["quarterly", "yearly"],
    "answers": ["Are employees paid at, above, or below market/grade midpoint?", "Is compensation equitable?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Requires pay grade structure to be meaningful", "Aggregate comp ratio hides pay equity issues within groups"]
  },
  {
    "id": "kpi.hr.absence_rate",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "อัตราการขาดงาน", "en": "Absence Rate %" },
    "formula": "100 * sum(absent_days) / sum(available_days)",
    "inputs": {
      "absent_days": { "role": "measure", "unit": "day", "synonyms": { "th": ["วันขาดงาน", "วันลา", "วันหยุดป่วย", "ขาดงาน"], "en": ["absent days", "absence days", "sick days", "leave days", "days off"] } },
      "available_days": { "role": "measure", "unit": "day", "synonyms": { "th": ["วันทำงาน", "วันทำการ", "วันที่ควรมา"], "en": ["available days", "working days", "scheduled days", "workdays"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 2.0, "warn": 5.0 } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["What proportion of working days are lost to absence?", "Is absenteeism worsening?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Distinguish planned leave from unplanned absence for root cause analysis"]
  },
  {
    "id": "kpi.hr.ot_hours",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "ชั่วโมงทำงานล่วงเวลา", "en": "Overtime Hours" },
    "formula": "sum(ot_hours)",
    "inputs": {
      "ot_hours": { "role": "measure", "unit": "hour", "synonyms": { "th": ["ชั่วโมง OT", "ทำงานล่วงเวลา", "โอที", "ชม.ล่วงเวลา"], "en": ["overtime hours", "OT hours", "overtime", "extra hours"] } }
    },
    "aggNature": "extensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["weekly", "monthly", "quarterly"],
    "answers": ["How many overtime hours were worked?", "Is overtime indicating understaffing?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["High OT may indicate understaffing, seasonal peaks, or poor planning — context is essential"]
  },
  {
    "id": "kpi.hr.span_of_control",
    "version": "1.0.0",
    "domain": "hr_people",
    "name": { "th": "สัดส่วนผู้ใต้บังคับบัญชา", "en": "Span of Control" },
    "formula": "count(employees) / count(managers)",
    "inputs": {
      "employees": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนพนักงาน", "ลูกน้อง", "ผู้ใต้บังคับบัญชา"], "en": ["employees", "direct reports", "subordinates", "team members"] } },
      "managers": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนหัวหน้า", "ผู้จัดการ", "ผู้บังคับบัญชา", "หัวหน้างาน"], "en": ["managers", "supervisors", "leaders", "management headcount"] } }
    },
    "aggNature": "intensive",
    "direction": "target-band",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 7.0, "warn": 3.0 } },
    "grain": ["quarterly", "yearly"],
    "answers": ["How many direct reports does each manager have on average?", "Is the management structure efficient?"],
    "variance": false,
    "forecastCandidate": false,
    "caveats": ["Optimal span varies by function — operational roles tolerate wider spans than knowledge work"]
  }
]
;

window.__KB_KPI_DEFS['inventory_warehouse'] = [
  {
    "id": "kpi.inventory.stock_on_hand",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "มูลค่าสินค้าคงคลัง", "en": "Stock on Hand (Value)" },
    "formula": "sum(stock_value)",
    "inputs": {
      "stock_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าสต็อก", "มูลค่าคงคลัง", "มูลค่าสินค้าคงเหลือ", "ยอดคงคลัง"], "en": ["stock value", "inventory value", "stock on hand", "on-hand value", "inventory balance"] } }
    },
    "aggNature": "extensive",
    "direction": "target-band",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the total value of inventory on hand?", "Is inventory investment within acceptable limits?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Point-in-time snapshot — use period-end or average for trend analysis", "Valuation method (FIFO/LIFO/WAC) affects comparability"]
  },
  {
    "id": "kpi.inventory.turnover",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "อัตราหมุนเวียนสินค้าคงคลัง", "en": "Inventory Turnover" },
    "formula": "sum(cogs) / avg(stock_value)",
    "inputs": {
      "cogs": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ต้นทุนขาย", "ต้นทุนสินค้าขาย"], "en": ["COGS", "cost of goods sold", "cost of sales"] } },
      "stock_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าสต็อก", "มูลค่าคงคลัง", "มูลค่าสินค้าคงเหลือ"], "en": ["stock value", "inventory value", "average inventory"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 8.0, "warn": 4.0 } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["How many times does inventory cycle through in a period?", "Is inventory moving efficiently?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Benchmark varies by industry — perishables turn faster than durable goods"]
  },
  {
    "id": "kpi.inventory.days_on_hand",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "จำนวนวันสินค้าคงคลัง", "en": "Days on Hand (DOH)" },
    "formula": "avg(stock_value) / (sum(cogs) / 365)",
    "inputs": {
      "stock_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าสต็อก", "มูลค่าคงคลัง"], "en": ["stock value", "inventory value", "average inventory"] } },
      "cogs": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ต้นทุนขาย", "ต้นทุนสินค้าขาย"], "en": ["COGS", "cost of goods sold", "cost of sales"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 30, "warn": 60 } },
    "grain": ["monthly", "quarterly"],
    "answers": ["How many days of inventory do we hold?", "Is inventory being held too long?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Inverse of turnover — use whichever is more intuitive for the audience"]
  },
  {
    "id": "kpi.inventory.fill_rate",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "อัตราการเติมเต็มคำสั่งซื้อ", "en": "Fill Rate %" },
    "formula": "100 * sum(fulfilled_lines) / sum(total_order_lines)",
    "inputs": {
      "fulfilled_lines": { "role": "measure", "unit": "count", "synonyms": { "th": ["รายการที่จัดส่งได้", "รายการครบ", "ออเดอร์ที่สำเร็จ"], "en": ["fulfilled lines", "filled orders", "complete lines", "shipped lines"] } },
      "total_order_lines": { "role": "measure", "unit": "count", "synonyms": { "th": ["รายการสั่งซื้อทั้งหมด", "รายการทั้งหมด", "จำนวนออเดอร์"], "en": ["total order lines", "total orders", "order lines", "demand lines"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 98.0, "warn": 95.0 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What proportion of orders can we fulfill from stock?", "Is service level meeting targets?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Line fill rate vs order fill rate vs unit fill rate — define clearly"]
  },
  {
    "id": "kpi.inventory.stockout_count",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "จำนวนครั้งสินค้าขาด", "en": "Stockout Count" },
    "formula": "count(stockout_events)",
    "inputs": {
      "stockout_events": { "role": "measure", "unit": "count", "synonyms": { "th": ["ครั้งสินค้าขาด", "สินค้าหมด", "สต็อกเอาท์", "ครั้งของขาด"], "en": ["stockout events", "stockouts", "out-of-stock", "OOS events", "zero stock events"] } }
    },
    "aggNature": "extensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How often are we running out of stock?", "Which SKUs are most frequently out of stock?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Count alone does not capture revenue impact — pair with lost-sales estimate if available"]
  },
  {
    "id": "kpi.inventory.dead_stock_pct",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "สัดส่วนสินค้าไม่เคลื่อนไหว", "en": "Dead Stock %" },
    "formula": "100 * sum(dead_stock_value) / sum(stock_value)",
    "inputs": {
      "dead_stock_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าสินค้าค้างคลัง", "สินค้าไม่เคลื่อนไหว", "สต็อกตาย"], "en": ["dead stock value", "obsolete stock", "non-moving stock", "slow-moving value"] } },
      "stock_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าสต็อก", "มูลค่าคงคลัง"], "en": ["stock value", "inventory value", "total stock value"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 3.0, "warn": 10.0 } },
    "grain": ["monthly", "quarterly"],
    "answers": ["How much capital is tied up in non-moving inventory?", "Is dead stock increasing?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Definition of 'dead' varies — typically no movement in 6-12 months"]
  },
  {
    "id": "kpi.inventory.receipt_volume",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "ปริมาณรับเข้า", "en": "Receipt Volume" },
    "formula": "sum(receipt_qty)",
    "inputs": {
      "receipt_qty": { "role": "measure", "unit": "unit", "synonyms": { "th": ["จำนวนรับเข้า", "ปริมาณรับ", "ยอดรับ", "ของเข้า"], "en": ["receipt quantity", "goods received", "inbound quantity", "receipts", "GRN quantity"] } }
    },
    "aggNature": "extensive",
    "direction": "target-band",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How much inventory was received this period?", "Is inbound flow matching expectations?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Spike in receipts without corresponding demand may indicate overstocking"]
  },
  {
    "id": "kpi.inventory.issue_volume",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "ปริมาณจ่ายออก", "en": "Issue Volume" },
    "formula": "sum(issue_qty)",
    "inputs": {
      "issue_qty": { "role": "measure", "unit": "unit", "synonyms": { "th": ["จำนวนจ่ายออก", "ปริมาณจ่าย", "ยอดจ่าย", "ของออก", "เบิกจ่าย"], "en": ["issue quantity", "goods issued", "outbound quantity", "issues", "picks", "dispatched quantity"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How much inventory was issued this period?", "Is outbound flow matching demand?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Should correlate with sales/production — divergence signals process issues"]
  },
  {
    "id": "kpi.inventory.accuracy",
    "version": "1.0.0",
    "domain": "inventory_warehouse",
    "name": { "th": "ความถูกต้องของสินค้าคงคลัง", "en": "Inventory Accuracy %" },
    "formula": "100 * sum(matching_lines) / sum(counted_lines)",
    "inputs": {
      "matching_lines": { "role": "measure", "unit": "count", "synonyms": { "th": ["รายการตรง", "รายการถูกต้อง", "จำนวนตรง"], "en": ["matching lines", "accurate counts", "correct items"] } },
      "counted_lines": { "role": "measure", "unit": "count", "synonyms": { "th": ["รายการนับ", "รายการตรวจ", "จำนวนนับ"], "en": ["counted lines", "total counts", "counted items", "cycle count lines"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 99.0, "warn": 95.0 } },
    "grain": ["weekly", "monthly", "quarterly"],
    "answers": ["How accurately does the system reflect actual stock?", "Is inventory record accuracy acceptable?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Requires cycle count or physical count data to compute"]
  }
]
;

window.__KB_KPI_DEFS['logistics_transport'] = [
  {
    "id": "kpi.log.otd_rate",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "อัตราส่งตรงเวลา", "en": "On-Time Delivery Rate" },
    "formula": "100 * count(on_time) / count(deliveries)",
    "inputs": {
      "on_time": { "role": "measure", "unit": "count", "synonyms": { "th": ["ส่งตรงเวลา", "ตรงเวลา"], "en": ["on time", "on_time", "otd"] } },
      "deliveries": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนเที่ยว", "จำนวนจัดส่ง", "เที่ยว"], "en": ["deliveries", "shipments", "trips", "total deliveries"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 95, "warn": 90 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What percentage of deliveries arrive on time?", "Is delivery performance improving?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Define 'on time' window consistently (e.g. ±1 hour, same day)"]
  },
  {
    "id": "kpi.log.cost_per_delivery",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "ต้นทุนต่อเที่ยว", "en": "Cost per Delivery" },
    "formula": "sum(transport_cost) / count(deliveries)",
    "inputs": {
      "transport_cost": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ค่าขนส่ง", "ค่าจัดส่ง", "ต้นทุนขนส่ง"], "en": ["shipping cost", "transport cost", "freight cost", "delivery cost"] } },
      "deliveries": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนเที่ยว", "เที่ยว"], "en": ["deliveries", "shipments", "trips"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How much does each delivery cost on average?", "Are transport costs trending up or down?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Include fuel, toll, labor, and vehicle depreciation for true cost"]
  },
  {
    "id": "kpi.log.cost_per_km",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "ต้นทุนต่อกม.", "en": "Cost per Kilometer" },
    "formula": "sum(transport_cost) / sum(distance)",
    "inputs": {
      "transport_cost": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ค่าขนส่ง"], "en": ["transport cost", "shipping cost"] } },
      "distance": { "role": "measure", "unit": "km", "synonyms": { "th": ["ระยะทาง", "กม."], "en": ["distance", "km", "mileage", "kilometers"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "currency", "decimals": 2 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["weekly", "monthly"],
    "answers": ["What is the unit cost per kilometer?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Varies significantly by vehicle type and load factor"]
  },
  {
    "id": "kpi.log.fleet_utilization",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "อัตราใช้งานรถ", "en": "Fleet Utilization" },
    "formula": "100 * count(active_vehicles) / count(total_vehicles)",
    "inputs": {
      "active_vehicles": { "role": "measure", "unit": "count", "synonyms": { "th": ["รถที่ใช้งาน", "เที่ยวรถ"], "en": ["active vehicles", "utilized", "trips"] } },
      "total_vehicles": { "role": "measure", "unit": "count", "synonyms": { "th": ["รถทั้งหมด", "จำนวนรถ"], "en": ["total vehicles", "fleet size", "vehicles"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 85, "warn": 70 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What percentage of the fleet is actively used?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Exclude vehicles in scheduled maintenance"]
  },
  {
    "id": "kpi.log.avg_transit_days",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "ระยะเวลาจัดส่งเฉลี่ย", "en": "Average Transit Time (Days)" },
    "formula": "avg(transit_days)",
    "inputs": {
      "transit_days": { "role": "measure", "unit": "days", "synonyms": { "th": ["ระยะเวลาจัดส่ง", "วันจัดส่ง", "เวลาขนส่ง"], "en": ["transit time", "delivery days", "transit days", "lead time", "avg delivery days"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["weekly", "monthly"],
    "answers": ["How many days does delivery take on average?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Segment by route/destination for meaningful comparison"]
  },
  {
    "id": "kpi.log.damage_rate",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "อัตราสินค้าเสียหาย", "en": "Damage Rate" },
    "formula": "100 * count(damaged) / count(deliveries)",
    "inputs": {
      "damaged": { "role": "measure", "unit": "count", "synonyms": { "th": ["เสียหาย", "สินค้าเสียหาย", "ชำรุด"], "en": ["damaged", "damage", "claim", "loss"] } },
      "deliveries": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนเที่ยว"], "en": ["deliveries", "shipments"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "fixed", "benchmark": { "good": 0.5, "warn": 2 } },
    "grain": ["weekly", "monthly"],
    "answers": ["What percentage of shipments arrive damaged?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Include both full loss and partial damage"]
  },
  {
    "id": "kpi.log.total_deliveries",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "จำนวนเที่ยวจัดส่ง", "en": "Total Deliveries" },
    "formula": "count(deliveries)",
    "inputs": {
      "deliveries": { "role": "measure", "unit": "count", "synonyms": { "th": ["เที่ยว", "จำนวนเที่ยว", "จำนวนจัดส่ง"], "en": ["deliveries", "shipments", "trips", "total deliveries"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How many deliveries were completed?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": []
  },
  {
    "id": "kpi.log.empty_trip_pct",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "อัตราเที่ยวว่าง", "en": "Empty Trip Percentage" },
    "formula": "100 * count(empty_trips) / count(total_trips)",
    "inputs": {
      "empty_trips": { "role": "measure", "unit": "count", "synonyms": { "th": ["เที่ยวว่าง", "เที่ยวเปล่า"], "en": ["empty trip", "empty run", "deadhead"] } },
      "total_trips": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนเที่ยว", "เที่ยวทั้งหมด"], "en": ["total trips", "trips", "runs"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 10, "warn": 25 } },
    "grain": ["weekly", "monthly"],
    "answers": ["What percentage of trips run empty (no cargo)?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["High empty-trip % indicates poor backhaul planning"]
  },
  {
    "id": "kpi.log.fuel_cost_per_km",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "ค่าน้ำมันต่อกม.", "en": "Fuel Cost per Km" },
    "formula": "sum(fuel_cost) / sum(distance)",
    "inputs": {
      "fuel_cost": { "role": "measure", "unit": "currency", "synonyms": { "th": ["ค่าน้ำมัน", "ค่าเชื้อเพลิง"], "en": ["fuel cost", "fuel expense", "diesel cost"] } },
      "distance": { "role": "measure", "unit": "km", "synonyms": { "th": ["ระยะทาง"], "en": ["distance", "km", "mileage"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "currency", "decimals": 2 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["weekly", "monthly"],
    "answers": ["How much does fuel cost per kilometer?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Affected by fuel price fluctuations and vehicle efficiency"]
  },
  {
    "id": "kpi.log.volume_delivered",
    "version": "1.0.0",
    "domain": "logistics_transport",
    "name": { "th": "ปริมาณขนส่ง", "en": "Volume Delivered" },
    "formula": "sum(volume)",
    "inputs": {
      "volume": { "role": "measure", "unit": "tons", "synonyms": { "th": ["ปริมาณ", "น้ำหนัก", "ตัน", "น้ำหนักบรรทุก"], "en": ["volume", "weight", "tons", "cargo weight", "load"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the total volume delivered?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Unit depends on industry: tons, CBM, pallets, etc."]
  }
]
;

window.__KB_KPI_DEFS['manufacturing'] = [
  {
    "id": "kpi.manufacturing.oee",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "ประสิทธิผลโดยรวมของเครื่องจักร (OEE)", "en": "Overall Equipment Effectiveness (OEE)" },
    "formula": "(sum(run_time) / sum(planned_production_time)) * (sum(total_units) / (sum(run_time) * avg(ideal_rate))) * (sum(good_units) / sum(total_units)) * 100",
    "inputs": {
      "run_time": { "role": "measure", "unit": "hour", "synonyms": { "th": ["เวลาเดินเครื่อง", "เวลาทำงานจริง"], "en": ["run time", "operating time", "uptime"] } },
      "planned_production_time": { "role": "measure", "unit": "hour", "synonyms": { "th": ["เวลาผลิตตามแผน", "เวลาทำการ"], "en": ["planned production time", "scheduled time", "available time"] } },
      "total_units": { "role": "measure", "unit": "unit", "synonyms": { "th": ["จำนวนผลิตทั้งหมด", "ชิ้นงานทั้งหมด"], "en": ["total units", "total output", "total pieces"] } },
      "ideal_rate": { "role": "measure", "unit": "unit/hour", "synonyms": { "th": ["อัตราผลิตมาตรฐาน", "อัตราอุดมคติ"], "en": ["ideal rate", "standard rate", "nameplate rate"] } },
      "good_units": { "role": "measure", "unit": "unit", "synonyms": { "th": ["ชิ้นงานดี", "ผลผลิตดี", "จำนวนชิ้นดี"], "en": ["good units", "good output", "conforming units"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 85.0, "warn": 65.0 } },
    "grain": ["shift", "daily", "weekly", "monthly"],
    "answers": ["How effectively is the equipment being used?", "What is the combined impact of availability, performance, and quality losses?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["World-class OEE is 85%; interpret in context of industry", "Requires accurate ideal rate definition"]
  },
  {
    "id": "kpi.manufacturing.availability",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "อัตราความพร้อมเครื่องจักร", "en": "Availability Rate" },
    "formula": "100 * sum(run_time) / sum(planned_production_time)",
    "inputs": {
      "run_time": { "role": "measure", "unit": "hour", "synonyms": { "th": ["เวลาเดินเครื่อง", "เวลาทำงานจริง"], "en": ["run time", "operating time", "uptime"] } },
      "planned_production_time": { "role": "measure", "unit": "hour", "synonyms": { "th": ["เวลาผลิตตามแผน", "เวลาทำการ"], "en": ["planned production time", "scheduled time", "available time"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 90.0, "warn": 80.0 } },
    "grain": ["shift", "daily", "weekly", "monthly"],
    "answers": ["How much scheduled time is the equipment actually running?", "What proportion of time is lost to downtime?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["OEE sub-component — interpret alongside Performance and Quality"]
  },
  {
    "id": "kpi.manufacturing.performance_rate",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "อัตราสมรรถนะ", "en": "Performance Rate" },
    "formula": "100 * sum(total_units) / (sum(run_time) * avg(ideal_rate))",
    "inputs": {
      "total_units": { "role": "measure", "unit": "unit", "synonyms": { "th": ["จำนวนผลิตทั้งหมด", "ชิ้นงานทั้งหมด"], "en": ["total units", "total output", "total pieces"] } },
      "run_time": { "role": "measure", "unit": "hour", "synonyms": { "th": ["เวลาเดินเครื่อง", "เวลาทำงานจริง"], "en": ["run time", "operating time"] } },
      "ideal_rate": { "role": "measure", "unit": "unit/hour", "synonyms": { "th": ["อัตราผลิตมาตรฐาน", "อัตราอุดมคติ"], "en": ["ideal rate", "standard rate", "nameplate rate"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 95.0, "warn": 85.0 } },
    "grain": ["shift", "daily", "weekly", "monthly"],
    "answers": ["Is the equipment running at its rated speed?", "How much speed loss is occurring?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["OEE sub-component — interpret alongside Availability and Quality"]
  },
  {
    "id": "kpi.manufacturing.quality_rate",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "อัตราคุณภาพ", "en": "Quality Rate" },
    "formula": "100 * sum(good_units) / sum(total_units)",
    "inputs": {
      "good_units": { "role": "measure", "unit": "unit", "synonyms": { "th": ["ชิ้นงานดี", "ผลผลิตดี"], "en": ["good units", "good output", "conforming units", "first-pass yield"] } },
      "total_units": { "role": "measure", "unit": "unit", "synonyms": { "th": ["จำนวนผลิตทั้งหมด", "ชิ้นงานทั้งหมด"], "en": ["total units", "total output", "total pieces"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 99.0, "warn": 95.0 } },
    "grain": ["shift", "daily", "weekly", "monthly"],
    "answers": ["What proportion of output meets quality standards?", "How much production is lost to defects?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["OEE sub-component — interpret alongside Availability and Performance"]
  },
  {
    "id": "kpi.manufacturing.throughput",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "ปริมาณผลผลิต", "en": "Throughput" },
    "formula": "sum(total_units)",
    "inputs": {
      "total_units": { "role": "measure", "unit": "unit", "synonyms": { "th": ["จำนวนผลิต", "ชิ้นงาน", "ผลผลิต", "หน่วยผลิต"], "en": ["total units", "output", "production volume", "units produced", "throughput"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["shift", "daily", "weekly", "monthly"],
    "answers": ["How much was produced?", "Is production volume on target?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Must normalize by product type for meaningful cross-line comparison"]
  },
  {
    "id": "kpi.manufacturing.defect_rate",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "อัตราของเสีย", "en": "Defect Rate" },
    "formula": "100 * sum(defect_units) / sum(total_units)",
    "inputs": {
      "defect_units": { "role": "measure", "unit": "unit", "synonyms": { "th": ["ของเสีย", "ชิ้นงานเสีย", "NG", "จำนวนเสีย"], "en": ["defect units", "defects", "rejects", "non-conforming", "NG count"] } },
      "total_units": { "role": "measure", "unit": "unit", "synonyms": { "th": ["จำนวนผลิตทั้งหมด", "ชิ้นงานทั้งหมด"], "en": ["total units", "total output", "total pieces"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 0.5, "warn": 2.0 } },
    "grain": ["shift", "daily", "weekly", "monthly"],
    "answers": ["What percentage of output is defective?", "Is quality deteriorating?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Interpret alongside defect type Pareto for root cause"]
  },
  {
    "id": "kpi.manufacturing.scrap_pct",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "อัตราเศษซาก", "en": "Scrap %" },
    "formula": "100 * sum(scrap_value) / sum(material_value)",
    "inputs": {
      "scrap_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าเศษซาก", "ค่าสูญเสียวัสดุ", "เศษเหลือ"], "en": ["scrap value", "scrap cost", "waste cost"] } },
      "material_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าวัตถุดิบ", "ต้นทุนวัสดุ"], "en": ["material value", "material cost", "raw material cost"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 1.0, "warn": 3.0 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How much material is being wasted?", "Is material utilization efficient?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["May be measured in weight or value — ensure consistency"]
  },
  {
    "id": "kpi.manufacturing.downtime",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "เวลาหยุดเครื่อง", "en": "Downtime Hours" },
    "formula": "sum(downtime_hours)",
    "inputs": {
      "downtime_hours": { "role": "measure", "unit": "hour", "synonyms": { "th": ["ชั่วโมงหยุด", "เวลาหยุดเครื่อง", "ชม.หยุด"], "en": ["downtime hours", "downtime", "stop time", "unplanned downtime"] } }
    },
    "aggNature": "extensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["shift", "daily", "weekly", "monthly"],
    "answers": ["How much production time is being lost?", "Is downtime trending up or down?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Distinguish planned maintenance from unplanned breakdowns for actionability"]
  },
  {
    "id": "kpi.manufacturing.mtbf",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "ระยะเวลาเฉลี่ยระหว่างการขัดข้อง (MTBF)", "en": "Mean Time Between Failures (MTBF)" },
    "formula": "sum(operating_time) / count(failure_events)",
    "inputs": {
      "operating_time": { "role": "measure", "unit": "hour", "synonyms": { "th": ["เวลาเดินเครื่อง", "เวลาทำงาน"], "en": ["operating time", "run time", "uptime hours"] } },
      "failure_events": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนครั้งเสีย", "ครั้งที่ขัดข้อง", "จำนวนเหตุขัดข้อง"], "en": ["failure events", "failures", "breakdowns", "fault count"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 200, "warn": 50 } },
    "grain": ["weekly", "monthly"],
    "answers": ["How reliable is the equipment?", "Is equipment reliability improving?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Meaningful only with consistent failure recording", "Should be tracked per machine or line"]
  },
  {
    "id": "kpi.manufacturing.mttr",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "ระยะเวลาเฉลี่ยในการซ่อม (MTTR)", "en": "Mean Time To Repair (MTTR)" },
    "formula": "sum(repair_time) / count(failure_events)",
    "inputs": {
      "repair_time": { "role": "measure", "unit": "hour", "synonyms": { "th": ["เวลาซ่อม", "เวลาแก้ไข", "ชม.ซ่อม"], "en": ["repair time", "time to repair", "fix time", "restoration time"] } },
      "failure_events": { "role": "measure", "unit": "count", "synonyms": { "th": ["จำนวนครั้งเสีย", "ครั้งที่ขัดข้อง"], "en": ["failure events", "failures", "breakdowns"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 1.0, "warn": 4.0 } },
    "grain": ["weekly", "monthly"],
    "answers": ["How quickly are failures being resolved?", "Is maintenance response time acceptable?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Includes diagnosis time — separate if maintenance log supports it"]
  },
  {
    "id": "kpi.manufacturing.plan_attainment",
    "version": "1.0.0",
    "domain": "manufacturing",
    "name": { "th": "อัตราบรรลุแผนผลิต", "en": "Plan Attainment %" },
    "formula": "100 * sum(actual_output) / sum(planned_output)",
    "inputs": {
      "actual_output": { "role": "measure", "unit": "unit", "synonyms": { "th": ["ผลผลิตจริง", "ผลิตจริง", "จำนวนผลิตจริง"], "en": ["actual output", "actual production", "actual units"] } },
      "planned_output": { "role": "measure", "unit": "unit", "synonyms": { "th": ["แผนผลิต", "เป้าผลิต", "แผนการผลิต"], "en": ["planned output", "production plan", "target output", "scheduled output"] } }
    },
    "aggNature": "intensive",
    "direction": "target-band",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "column", "benchmark": { "good": 100.0, "warn": 90.0 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["Is production meeting the plan?", "Are we over- or under-producing relative to schedule?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Over-attainment (>105%) may indicate planning problems, not success"]
  }
]
;

window.__KB_KPI_DEFS['marketing_digital'] = [
  {
    "id": "kpi.mkt.roas",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "ผลตอบแทนค่าโฆษณา", "en": "Return on Ad Spend (ROAS)" },
    "formula": "sum(revenue_from_ads) / sum(ad_spend)",
    "inputs": {
      "revenue_from_ads": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้จากโฆษณา", "ยอดขายจากโฆษณา"], "en": ["revenue from ads", "ad revenue", "attributed revenue"] } },
      "ad_spend": { "role": "measure", "unit": "currency", "synonyms": { "th": ["งบโฆษณา", "ค่าโฆษณา", "ค่าใช้จ่ายโฆษณา"], "en": ["ad spend", "spend", "cost", "advertising cost"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 2 },
    "target": { "policy": "fixed", "benchmark": { "good": 4, "warn": 2 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the return on ad spend?", "Are ad campaigns profitable?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Attribution model affects ROAS significantly"]
  },
  {
    "id": "kpi.mkt.cpa",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "ต้นทุนต่อการได้ลูกค้า", "en": "Cost per Acquisition (CPA)" },
    "formula": "sum(ad_spend) / count(conversions)",
    "inputs": {
      "ad_spend": { "role": "measure", "unit": "currency", "synonyms": { "th": ["งบโฆษณา", "ค่าโฆษณา"], "en": ["ad spend", "spend", "cost"] } },
      "conversions": { "role": "measure", "unit": "count", "synonyms": { "th": ["คอนเวอร์ชั่น", "ลูกค้าใหม่"], "en": ["conversions", "acquisitions", "purchases"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How much does it cost to acquire a customer?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["CPA varies greatly by channel and product"]
  },
  {
    "id": "kpi.mkt.ctr",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "อัตราการคลิก", "en": "Click-Through Rate (CTR)" },
    "formula": "100 * count(clicks) / count(impressions)",
    "inputs": {
      "clicks": { "role": "measure", "unit": "count", "synonyms": { "th": ["คลิก", "การคลิก"], "en": ["clicks", "click"] } },
      "impressions": { "role": "measure", "unit": "count", "synonyms": { "th": ["การแสดงผล", "impression"], "en": ["impressions", "views", "shows"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What is the click-through rate?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["CTR benchmarks vary significantly by platform and ad format"]
  },
  {
    "id": "kpi.mkt.conversion_rate",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "อัตราคอนเวอร์ชั่น", "en": "Conversion Rate" },
    "formula": "100 * count(conversions) / count(clicks)",
    "inputs": {
      "conversions": { "role": "measure", "unit": "count", "synonyms": { "th": ["คอนเวอร์ชั่น"], "en": ["conversions", "purchases", "sign ups"] } },
      "clicks": { "role": "measure", "unit": "count", "synonyms": { "th": ["คลิก"], "en": ["clicks", "visits", "sessions"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["What percentage of visitors convert?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Define conversion event consistently"]
  },
  {
    "id": "kpi.mkt.total_spend",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "งบโฆษณารวม", "en": "Total Ad Spend" },
    "formula": "sum(ad_spend)",
    "inputs": {
      "ad_spend": { "role": "measure", "unit": "currency", "synonyms": { "th": ["งบโฆษณา", "ค่าโฆษณา"], "en": ["ad spend", "spend", "budget", "cost", "advertising cost"] } }
    },
    "aggNature": "extensive",
    "direction": "neutral",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How much was spent on advertising?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": []
  },
  {
    "id": "kpi.mkt.impressions",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "จำนวนแสดงผล", "en": "Impressions" },
    "formula": "sum(impressions)",
    "inputs": {
      "impressions": { "role": "measure", "unit": "count", "synonyms": { "th": ["การแสดงผล", "impression"], "en": ["impressions", "views", "shows"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How many times were ads shown?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": []
  },
  {
    "id": "kpi.mkt.reach",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "การเข้าถึง", "en": "Reach" },
    "formula": "sum(reach)",
    "inputs": {
      "reach": { "role": "measure", "unit": "count", "synonyms": { "th": ["การเข้าถึง", "คนเข้าถึง"], "en": ["reach", "unique reach", "people reached"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How many unique people saw the content?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Reach counts unique users; impressions count total views"]
  },
  {
    "id": "kpi.mkt.engagement_rate",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "อัตรา Engagement", "en": "Engagement Rate" },
    "formula": "100 * count(engagements) / count(reach)",
    "inputs": {
      "engagements": { "role": "measure", "unit": "count", "synonyms": { "th": ["engagement", "ปฏิสัมพันธ์"], "en": ["engagements", "interactions", "likes", "comments", "shares"] } },
      "reach": { "role": "measure", "unit": "count", "synonyms": { "th": ["การเข้าถึง"], "en": ["reach", "impressions", "views"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How engaged is the audience with our content?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Engagement definition varies by platform"]
  },
  {
    "id": "kpi.mkt.open_rate",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "อัตราเปิดอ่าน", "en": "Email Open Rate" },
    "formula": "100 * count(opens) / count(delivered)",
    "inputs": {
      "opens": { "role": "measure", "unit": "count", "synonyms": { "th": ["เปิดอ่าน"], "en": ["opens", "opened"] } },
      "delivered": { "role": "measure", "unit": "count", "synonyms": { "th": ["ส่งสำเร็จ"], "en": ["delivered", "sent", "emails sent"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "fixed", "benchmark": { "good": 25, "warn": 15 } },
    "grain": ["per-campaign", "weekly", "monthly"],
    "answers": ["What percentage of emails are opened?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Apple Mail Privacy Protection inflates open rates"]
  },
  {
    "id": "kpi.mkt.leads_generated",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "จำนวน Lead", "en": "Leads Generated" },
    "formula": "count(leads)",
    "inputs": {
      "leads": { "role": "measure", "unit": "count", "synonyms": { "th": ["lead", "ลูกค้าสนใจ"], "en": ["leads", "lead", "mql", "sql", "inquiries"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["How many leads did marketing generate?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Qualify leads (MQL vs SQL) for meaningful comparison"]
  },
  {
    "id": "kpi.mkt.cost_per_lead",
    "version": "1.0.0",
    "domain": "marketing_digital",
    "name": { "th": "ต้นทุนต่อ Lead", "en": "Cost per Lead (CPL)" },
    "formula": "sum(ad_spend) / count(leads)",
    "inputs": {
      "ad_spend": { "role": "measure", "unit": "currency", "synonyms": { "th": ["งบโฆษณา"], "en": ["ad spend", "spend"] } },
      "leads": { "role": "measure", "unit": "count", "synonyms": { "th": ["lead"], "en": ["leads", "lead"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["weekly", "monthly"],
    "answers": ["How much does each lead cost?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["CPL varies significantly by channel and industry"]
  }
]
;

window.__KB_KPI_DEFS['sales_crm'] = [
  {
    "id": "kpi.sales.revenue",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "รายได้จากการขาย", "en": "Sales Revenue" },
    "formula": "sum(revenue)",
    "inputs": {
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้", "ยอดขาย", "ยอมขาย", "มูลค่าขาย"], "en": ["revenue", "sales", "sales revenue", "bookings", "net sales"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly", "quarterly", "yearly"],
    "answers": ["What is total sales revenue?", "Are we on track to hit the sales target?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Distinguish booked vs recognized revenue"]
  },
  {
    "id": "kpi.sales.revenue_growth_pct",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "อัตราเติบโตรายได้", "en": "Revenue Growth %" },
    "formula": "100 * pct_change(sum(revenue))",
    "inputs": {
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้", "ยอดขาย"], "en": ["revenue", "sales", "sales revenue"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["Is revenue growing or shrinking?", "What is the growth rate compared to previous period?"],
    "variance": false,
    "forecastCandidate": true,
    "caveats": ["Requires at least two comparable periods", "Seasonal businesses need YoY not MoM comparison"]
  },
  {
    "id": "kpi.sales.aov",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "มูลค่าเฉลี่ยต่อคำสั่งซื้อ", "en": "Average Order Value (AOV)" },
    "formula": "sum(revenue) / count(orders)",
    "inputs": {
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้", "ยอดขาย", "มูลค่าขาย"], "en": ["revenue", "sales", "order value", "sales amount"] } },
      "orders": { "role": "measure", "unit": "count", "synonyms": { "th": ["คำสั่งซื้อ", "ออเดอร์", "รายการขาย", "ใบสั่งซื้อ"], "en": ["orders", "transactions", "order count", "number of orders"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "currency", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly", "quarterly"],
    "answers": ["How much does the average customer spend per order?", "Is order size increasing or decreasing?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Outlier large orders can skew — check median alongside mean"]
  },
  {
    "id": "kpi.sales.win_rate",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "อัตราปิดการขาย", "en": "Win Rate %" },
    "formula": "100 * count(won_deals) / count(total_deals)",
    "inputs": {
      "won_deals": { "role": "measure", "unit": "count", "synonyms": { "th": ["ดีลที่ปิดได้", "ขายสำเร็จ", "ชนะ"], "en": ["won deals", "closed won", "wins", "successful deals"] } },
      "total_deals": { "role": "measure", "unit": "count", "synonyms": { "th": ["ดีลทั้งหมด", "โอกาสทั้งหมด", "ดีลรวม"], "en": ["total deals", "total opportunities", "all deals", "qualified opportunities"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 30.0, "warn": 15.0 } },
    "grain": ["monthly", "quarterly"],
    "answers": ["What proportion of opportunities are we closing?", "Is the sales team effective at converting leads?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Denominator definition matters — include only qualified opportunities for meaningful rate"]
  },
  {
    "id": "kpi.sales.pipeline_coverage",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "สัดส่วนไปป์ไลน์ต่อเป้า", "en": "Pipeline Coverage Ratio" },
    "formula": "sum(pipeline_value) / sum(quota)",
    "inputs": {
      "pipeline_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าไปป์ไลน์", "มูลค่าโอกาส", "ยอดไปป์ไลน์"], "en": ["pipeline value", "pipeline", "opportunity value", "weighted pipeline"] } },
      "quota": { "role": "measure", "unit": "currency", "synonyms": { "th": ["เป้าขาย", "โควต้า", "เป้ายอดขาย", "เป้าหมาย"], "en": ["quota", "sales target", "sales goal", "booking target"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 3.0, "warn": 1.5 } },
    "grain": ["monthly", "quarterly"],
    "answers": ["Do we have enough pipeline to hit quota?", "Is pipeline healthy relative to targets?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Coverage needs depend on win rate — higher win rate needs less coverage", "Use weighted pipeline for accuracy"]
  },
  {
    "id": "kpi.sales.conversion_by_stage",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "อัตราแปลงตามขั้นตอน", "en": "Stage Conversion Rate %" },
    "formula": "100 * count(deals_advanced) / count(deals_entered)",
    "inputs": {
      "deals_advanced": { "role": "measure", "unit": "count", "synonyms": { "th": ["ดีลที่ผ่านขั้นตอน", "ดีลเลื่อนขั้น"], "en": ["deals advanced", "advanced to next stage", "progressed deals"] } },
      "deals_entered": { "role": "measure", "unit": "count", "synonyms": { "th": ["ดีลเข้าขั้นตอน", "ดีลในขั้นตอน"], "en": ["deals entered", "deals in stage", "stage entries"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly"],
    "answers": ["Where in the sales funnel are deals dropping off?", "Which stage has the worst conversion?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Stage definitions must be consistent; compare like-for-like stages only"]
  },
  {
    "id": "kpi.sales.top_customer_concentration",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "สัดส่วนรายได้ลูกค้ารายใหญ่", "en": "Top Customer Concentration %" },
    "formula": "100 * sum(top_customer_revenue) / sum(revenue)",
    "inputs": {
      "top_customer_revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้ลูกค้ารายใหญ่", "ยอดขายลูกค้าท็อป", "ยอดลูกค้าหลัก"], "en": ["top customer revenue", "top-N revenue", "key account revenue", "major customer sales"] } },
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้รวม", "ยอดขายรวม"], "en": ["revenue", "total revenue", "total sales"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 20.0, "warn": 50.0 } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["How dependent are we on a few large customers?", "Is revenue concentration risk increasing?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Define 'top' consistently — top 5, top 10, or top 20%"]
  },
  {
    "id": "kpi.sales.channel_mix",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "สัดส่วนช่องทางขาย", "en": "Channel Mix %" },
    "formula": "100 * sum(channel_revenue) / sum(revenue)",
    "inputs": {
      "channel_revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้ตามช่องทาง", "ยอดขายช่องทาง"], "en": ["channel revenue", "channel sales", "sales by channel"] } },
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้รวม", "ยอดขายรวม"], "en": ["revenue", "total revenue", "total sales"] } }
    },
    "aggNature": "intensive",
    "direction": "target-band",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["How is revenue distributed across channels?", "Is channel diversification improving?"],
    "variance": false,
    "forecastCandidate": false,
    "caveats": ["Must be computed per channel — result is a distribution, not a single number"]
  },
  {
    "id": "kpi.sales.return_rate",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "อัตราคืนสินค้า", "en": "Return Rate %" },
    "formula": "100 * sum(returned_value) / sum(revenue)",
    "inputs": {
      "returned_value": { "role": "measure", "unit": "currency", "synonyms": { "th": ["มูลค่าคืนสินค้า", "ยอดคืน", "สินค้าตีกลับ"], "en": ["returned value", "returns", "return amount", "refund amount"] } },
      "revenue": { "role": "measure", "unit": "currency", "synonyms": { "th": ["รายได้", "ยอดขาย"], "en": ["revenue", "sales", "gross sales"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 2.0, "warn": 8.0 } },
    "grain": ["weekly", "monthly", "quarterly"],
    "answers": ["What proportion of sales is being returned?", "Are returns increasing?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["E-commerce typically has higher return rates than brick-and-mortar"]
  },
  {
    "id": "kpi.sales.customer_count",
    "version": "1.0.0",
    "domain": "sales_crm",
    "name": { "th": "จำนวนลูกค้า", "en": "Active Customer Count" },
    "formula": "count_distinct(customer_id)",
    "inputs": {
      "customer_id": { "role": "dimension", "unit": "id", "synonyms": { "th": ["รหัสลูกค้า", "ลูกค้า", "ชื่อลูกค้า", "ผู้ซื้อ"], "en": ["customer ID", "customer", "account", "buyer", "client", "customer name"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "period-median", "benchmark": { "good": null, "warn": null } },
    "grain": ["monthly", "quarterly", "yearly"],
    "answers": ["How many active customers do we have?", "Is the customer base growing?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Define 'active' clearly — purchase in last 12 months is common"]
  }
]
;

window.__KB_KPI_DEFS['sugar_factory'] = [
  {
    "id": "kpi.sugar.ccs",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "ค่าความหวาน (CCS)", "en": "Commercial Cane Sugar (CCS)" },
    "formula": "100 * (sum(pol_pct_cane) - 0.5 * sum(brix_pct_cane) - sum(pol_pct_cane)) / 100 + sum(pol_pct_cane) * (1 - 0.01 * sum(fibre_pct_cane))",
    "inputs": {
      "pol_pct_cane": { "role": "measure", "unit": "%", "synonyms": { "th": ["พอล%อ้อย", "พอลเปอร์เซ็นต์อ้อย", "โพล%อ้อย"], "en": ["pol % cane", "pol pct cane", "pol percent cane"] } },
      "brix_pct_cane": { "role": "measure", "unit": "%", "synonyms": { "th": ["บริกซ์%อ้อย", "บริกซ์เปอร์เซ็นต์อ้อย"], "en": ["brix % cane", "brix pct cane", "brix percent cane"] } },
      "fibre_pct_cane": { "role": "measure", "unit": "%", "synonyms": { "th": ["เส้นใย%อ้อย", "ไฟเบอร์%อ้อย"], "en": ["fibre % cane", "fiber % cane", "fibre pct cane"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 2 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 12.5, "warn": 11.0 } },
    "grain": ["daily", "weekly", "monthly", "season"],
    "answers": ["What is the recoverable sugar content of the cane?", "Is cane quality on target?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Meaningless off-season", "Formula variant differs by country (Australian vs South African CCS)"]
  },
  {
    "id": "kpi.sugar.extraction_pct",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "ประสิทธิภาพการหีบสกัด", "en": "Extraction %" },
    "formula": "100 * sum(pol_extracted) / sum(pol_in_cane)",
    "inputs": {
      "pol_extracted": { "role": "measure", "unit": "ton", "synonyms": { "th": ["พอลที่สกัดได้", "พอลในน้ำอ้อยรวม"], "en": ["pol extracted", "pol in mixed juice"] } },
      "pol_in_cane": { "role": "measure", "unit": "ton", "synonyms": { "th": ["พอลในอ้อย", "พอลอ้อย"], "en": ["pol in cane", "cane pol"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 96.5, "warn": 95.0 } },
    "grain": ["daily", "shift"],
    "answers": ["Is extraction on plan?", "How efficiently is the milling tandem recovering pol from cane?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Meaningless off-season"]
  },
  {
    "id": "kpi.sugar.bhr",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "ค่า BHR (Boiling House Recovery)", "en": "Boiling House Recovery (BHR)" },
    "formula": "100 * sum(sugar_pol) / sum(mixed_juice_pol)",
    "inputs": {
      "sugar_pol": { "role": "measure", "unit": "ton", "synonyms": { "th": ["พอลในน้ำตาล", "พอลน้ำตาลผลิตได้"], "en": ["sugar pol", "pol in sugar produced"] } },
      "mixed_juice_pol": { "role": "measure", "unit": "ton", "synonyms": { "th": ["พอลน้ำอ้อยรวม", "พอลในน้ำอ้อยรวม"], "en": ["mixed juice pol", "pol in mixed juice"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 88.0, "warn": 85.0 } },
    "grain": ["daily", "weekly", "monthly", "season"],
    "answers": ["How efficiently does the boiling house recover sugar from juice?", "Is process house performance acceptable?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["BHR alone does not indicate overall recovery — must combine with extraction"]
  },
  {
    "id": "kpi.sugar.pol_pct_cane",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "โพล % อ้อย", "en": "Pol % Cane" },
    "formula": "avg(pol_pct_cane)",
    "inputs": {
      "pol_pct_cane": { "role": "measure", "unit": "%", "synonyms": { "th": ["พอล%อ้อย", "โพล%อ้อย", "พอลเปอร์เซ็นต์อ้อย"], "en": ["pol % cane", "pol pct cane", "pol percent cane", "cane pol percent"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 13.0, "warn": 11.5 } },
    "grain": ["daily", "weekly", "monthly", "season"],
    "answers": ["What is the sucrose content of the incoming cane?", "Is cane quality improving or declining?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Heavily affected by cane variety, age, and harvesting method"]
  },
  {
    "id": "kpi.sugar.undetermined_loss",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "การสูญเสียที่ไม่ทราบสาเหตุ", "en": "Undetermined Loss %" },
    "formula": "100 - (100 * sum(pol_in_sugar) / sum(pol_in_cane)) - sum(known_loss_pct)",
    "inputs": {
      "pol_in_sugar": { "role": "measure", "unit": "ton", "synonyms": { "th": ["พอลในน้ำตาล", "พอลผลิตภัณฑ์"], "en": ["pol in sugar", "pol in product"] } },
      "pol_in_cane": { "role": "measure", "unit": "ton", "synonyms": { "th": ["พอลในอ้อย", "พอลอ้อย"], "en": ["pol in cane", "cane pol"] } },
      "known_loss_pct": { "role": "measure", "unit": "%", "synonyms": { "th": ["การสูญเสียที่ทราบสาเหตุ", "สูญเสียระบุได้"], "en": ["known loss", "determined loss", "identified loss"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 2 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 1.5, "warn": 2.5 } },
    "grain": ["daily", "weekly", "monthly", "season"],
    "answers": ["How much pol is being lost through unidentified causes?", "Are there hidden process inefficiencies?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["High values often indicate measurement errors rather than true process loss", "Requires accurate pol balances across all stations"]
  },
  {
    "id": "kpi.sugar.mill_downtime",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "เวลาหยุดหีบ", "en": "Mill Downtime %" },
    "formula": "100 * sum(downtime_hours) / sum(available_hours)",
    "inputs": {
      "downtime_hours": { "role": "measure", "unit": "hour", "synonyms": { "th": ["ชั่วโมงหยุด", "เวลาหยุด", "ชม.หยุดหีบ"], "en": ["downtime hours", "stop hours", "mill stop time"] } },
      "available_hours": { "role": "measure", "unit": "hour", "synonyms": { "th": ["ชั่วโมงทำงาน", "เวลาทั้งหมด", "ชม.ทำการ"], "en": ["available hours", "scheduled hours", "total hours"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 5.0, "warn": 10.0 } },
    "grain": ["daily", "shift", "weekly", "monthly"],
    "answers": ["How much production time is lost to stoppages?", "Is mill reliability acceptable?"],
    "variance": true,
    "forecastCandidate": false,
    "caveats": ["Must distinguish planned maintenance from unplanned stoppages for actionability"]
  },
  {
    "id": "kpi.sugar.cane_crushed_per_day",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "ปริมาณอ้อยหีบต่อวัน", "en": "Cane Crushed per Day" },
    "formula": "sum(cane_crushed)",
    "inputs": {
      "cane_crushed": { "role": "measure", "unit": "ton", "synonyms": { "th": ["อ้อยหีบ", "ปริมาณอ้อย", "อ้อยเข้าหีบ", "ตันอ้อย"], "en": ["cane crushed", "cane processed", "tons cane", "cane weight"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "shift"],
    "answers": ["How much cane was processed today?", "Is the factory meeting its crushing capacity?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Seasonal — zero during off-season", "Affected by cane supply logistics, not just factory capacity"]
  },
  {
    "id": "kpi.sugar.tcd_utilization",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "อัตราใช้กำลังการผลิต (TCD)", "en": "TCD Utilization %" },
    "formula": "100 * sum(cane_crushed) / sum(tcd_capacity)",
    "inputs": {
      "cane_crushed": { "role": "measure", "unit": "ton", "synonyms": { "th": ["อ้อยหีบ", "ปริมาณอ้อย", "อ้อยเข้าหีบ"], "en": ["cane crushed", "cane processed", "tons cane"] } },
      "tcd_capacity": { "role": "measure", "unit": "ton", "synonyms": { "th": ["กำลังการผลิต", "ความสามารถหีบ", "TCD"], "en": ["TCD capacity", "crushing capacity", "rated capacity"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 95.0, "warn": 85.0 } },
    "grain": ["daily", "weekly", "monthly"],
    "answers": ["Is the factory running at rated capacity?", "How much headroom remains in crushing capacity?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Capacity may vary with cane fibre content and condition"]
  },
  {
    "id": "kpi.sugar.molasses_purity",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "ความบริสุทธิ์กากน้ำตาล", "en": "Molasses Purity" },
    "formula": "avg(molasses_purity)",
    "inputs": {
      "molasses_purity": { "role": "measure", "unit": "%", "synonyms": { "th": ["ความบริสุทธิ์กากน้ำตาล", "เพียวริตี้โมลาส", "พิวริตี้กากน้ำตาล"], "en": ["molasses purity", "final molasses purity", "C-mol purity"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 32.0, "warn": 36.0 } },
    "grain": ["daily", "weekly", "monthly", "season"],
    "answers": ["Is the factory exhausting molasses efficiently?", "Is sucrose being lost to molasses?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Target purity depends on non-sucrose composition and is variety-dependent"]
  },
  {
    "id": "kpi.sugar.steam_pct_cane",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "ไอน้ำ % อ้อย", "en": "Steam % Cane" },
    "formula": "100 * sum(steam_produced) / sum(cane_crushed)",
    "inputs": {
      "steam_produced": { "role": "measure", "unit": "ton", "synonyms": { "th": ["ไอน้ำผลิต", "ปริมาณไอน้ำ", "ไอน้ำ"], "en": ["steam produced", "steam generation", "total steam"] } },
      "cane_crushed": { "role": "measure", "unit": "ton", "synonyms": { "th": ["อ้อยหีบ", "ปริมาณอ้อย", "อ้อยเข้าหีบ"], "en": ["cane crushed", "cane processed", "tons cane"] } }
    },
    "aggNature": "intensive",
    "direction": "lower-better",
    "format": { "kind": "percentage", "decimals": 1 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 45.0, "warn": 55.0 } },
    "grain": ["daily", "weekly", "monthly", "season"],
    "answers": ["How energy-efficient is the factory?", "Is steam consumption within acceptable limits?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Includes process steam and power generation steam", "Modern cogen plants may have different optimal ranges"]
  },
  {
    "id": "kpi.sugar.sugar_produced",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "น้ำตาลผลิตได้", "en": "Sugar Produced" },
    "formula": "sum(sugar_produced)",
    "inputs": {
      "sugar_produced": { "role": "measure", "unit": "ton", "synonyms": { "th": ["น้ำตาลผลิต", "ผลผลิตน้ำตาล", "น้ำตาลทราย", "ตันน้ำตาล"], "en": ["sugar produced", "sugar production", "sugar output", "tons sugar"] } }
    },
    "aggNature": "extensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 0 },
    "target": { "policy": "column", "benchmark": { "good": null, "warn": null } },
    "grain": ["daily", "weekly", "monthly", "season"],
    "answers": ["How much sugar has been produced?", "Is production on track for seasonal targets?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Must specify sugar grade (raw, refined, white) for meaningful comparison"]
  },
  {
    "id": "kpi.sugar.yield_per_ton_cane",
    "version": "1.0.0",
    "domain": "sugar_factory",
    "name": { "th": "ผลผลิตน้ำตาลต่อตันอ้อย", "en": "Sugar Yield per Ton Cane" },
    "formula": "sum(sugar_produced) / sum(cane_crushed)",
    "inputs": {
      "sugar_produced": { "role": "measure", "unit": "ton", "synonyms": { "th": ["น้ำตาลผลิต", "ผลผลิตน้ำตาล", "ตันน้ำตาล"], "en": ["sugar produced", "sugar production", "sugar output"] } },
      "cane_crushed": { "role": "measure", "unit": "ton", "synonyms": { "th": ["อ้อยหีบ", "ปริมาณอ้อย", "อ้อยเข้าหีบ", "ตันอ้อย"], "en": ["cane crushed", "cane processed", "tons cane"] } }
    },
    "aggNature": "intensive",
    "direction": "higher-better",
    "format": { "kind": "number", "decimals": 3 },
    "target": { "policy": "domain-benchmark", "benchmark": { "good": 0.110, "warn": 0.095 } },
    "grain": ["daily", "weekly", "monthly", "season"],
    "answers": ["How much sugar is recovered per ton of cane?", "Is overall factory recovery satisfactory?"],
    "variance": true,
    "forecastCandidate": true,
    "caveats": ["Combines cane quality and factory efficiency — decompose with CCS and BHR for root cause"]
  }
]
;

window.__KB_TEMPLATES = {};

})();
