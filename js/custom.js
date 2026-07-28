/**
 * iDash Custom Studio — free-form drag & drop dashboard builder.
 * Canvas always fits viewport (auto-zoom). Drag/resize works at any scale.
 * "Create Dashboard" opens a full-screen immersive view (like AI modules).
 */

const WIDGET_CATEGORIES = [
  { id: 'kpi', label: 'KPI และสรุป' },
  { id: 'trend', label: 'แนวโน้ม' },
  { id: 'comparison', label: 'เปรียบเทียบ' },
  { id: 'composition', label: 'สัดส่วน' },
  { id: 'performance', label: 'ประสิทธิภาพ' },
  { id: 'relationship', label: 'ความสัมพันธ์' },
  { id: 'other', label: 'ตารางและอื่นๆ' }
];

const WIDGETS = [
  { id: 'kpi_card', cat: 'kpi', label: 'KPI Card', span: 3, h: 120, icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="13" y2="9"/><line x1="7" y1="14" x2="17" y2="14"/>' },
  { id: 'metric_card', cat: 'kpi', label: 'Metric Card', span: 3, h: 120, icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><polyline points="7 15 10 11 13 13 17 8"/>' },
  { id: 'comparison_card', cat: 'kpi', label: 'Comparison', span: 3, h: 120, icon: '<rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="8" width="8" height="12" rx="1"/>' },
  { id: 'sparkline_card', cat: 'kpi', label: 'Sparkline', span: 3, h: 130, icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><polyline points="6 15 9 12 12 14 15 9 18 11"/>' },
  { id: 'line_chart', cat: 'trend', label: 'Line Chart', span: 6, h: 260, icon: '<polyline points="3 17 9 11 13 14 21 6"/>' },
  { id: 'area_chart', cat: 'trend', label: 'Area Chart', span: 6, h: 260, icon: '<path d="M3 17l6-6 4 3 8-8" fill="none"/><path d="M3 17l6-6 4 3 8-8v11H3z" opacity=".2" stroke="none" fill="currentColor"/>' },
  { id: 'spline_chart', cat: 'trend', label: 'Spline', span: 6, h: 260, icon: '<path d="M3 17c3 0 3-8 6-8s3 6 6 6 3-9 6-9" fill="none"/>' },
  { id: 'multi_line_chart', cat: 'trend', label: 'Multi-Line', span: 6, h: 280, icon: '<polyline points="3 15 9 9 14 12 21 4"/><polyline points="3 20 9 15 14 17 21 10" opacity=".45"/>' },
  { id: 'stacked_area_chart', cat: 'trend', label: 'Stacked Area', span: 6, h: 280, icon: '<path d="M3 19l6-5 5 3 7-7v9H3z" opacity=".25" fill="currentColor" stroke="none"/><path d="M3 15l6-6 5 3 7-7" fill="none"/>' },
  { id: 'bar_chart', cat: 'comparison', label: 'Bar Chart', span: 6, h: 260, icon: '<rect x="4" y="10" width="3" height="10"/><rect x="10.5" y="4" width="3" height="16"/><rect x="17" y="13" width="3" height="7"/>' },
  { id: 'grouped_bar', cat: 'comparison', label: 'Grouped Bar', span: 6, h: 280, icon: '<rect x="3" y="10" width="3" height="10"/><rect x="7" y="6" width="3" height="14"/><rect x="13" y="12" width="3" height="8"/><rect x="17" y="8" width="3" height="12"/>' },
  { id: 'stacked_bar', cat: 'comparison', label: 'Stacked Bar', span: 6, h: 280, icon: '<rect x="4" y="12" width="4" height="8"/><rect x="4" y="6" width="4" height="6" opacity=".5"/><rect x="11" y="10" width="4" height="10"/><rect x="11" y="4" width="4" height="6" opacity=".5"/><rect x="18" y="14" width="4" height="6"/><rect x="18" y="9" width="4" height="5" opacity=".5"/>' },
  { id: 'combo_chart', cat: 'comparison', label: 'Combo', span: 6, h: 280, icon: '<rect x="4" y="12" width="3" height="8"/><rect x="10" y="9" width="3" height="11"/><rect x="16" y="13" width="3" height="7"/><polyline points="3 8 11 5 21 7" fill="none"/>' },
  { id: 'pareto_chart', cat: 'comparison', label: 'Pareto', span: 6, h: 260, icon: '<rect x="3" y="8" width="3" height="12"/><rect x="8" y="12" width="3" height="8"/><rect x="13" y="15" width="3" height="5"/><rect x="18" y="17" width="3" height="3"/><polyline points="4 7 9 5 14 4 19 3.5" fill="none"/>' },
  { id: 'donut_chart', cat: 'composition', label: 'Donut', span: 3, h: 220, icon: '<circle cx="12" cy="12" r="8" fill="none"/><circle cx="12" cy="12" r="3.2" fill="none"/>' },
  { id: 'pie_chart', cat: 'composition', label: 'Pie', span: 3, h: 220, icon: '<circle cx="12" cy="12" r="8" fill="none"/><path d="M12 4v8l7 3"/>' },
  { id: 'funnel_chart', cat: 'composition', label: 'Funnel', span: 3, h: 220, icon: '<polygon points="4 4 20 4 14 12 14 20 10 20 10 12" fill="none"/>' },
  { id: 'treemap', cat: 'composition', label: 'Treemap', span: 6, h: 240, icon: '<rect x="3" y="3" width="10" height="18" rx="1"/><rect x="15" y="3" width="6" height="9" rx="1"/><rect x="15" y="14" width="6" height="7" rx="1"/>' },
  { id: 'gauge_chart', cat: 'performance', label: 'Gauge', span: 3, h: 170, icon: '<path d="M4 16a8 8 0 0116 0" fill="none"/><line x1="12" y1="16" x2="16" y2="10"/>' },
  { id: 'progress_ring', cat: 'performance', label: 'Progress Ring', span: 3, h: 110, icon: '<circle cx="12" cy="12" r="8" fill="none" stroke-dasharray="30 50"/>' },
  { id: 'scatter_plot', cat: 'relationship', label: 'Scatter', span: 6, h: 260, icon: '<circle cx="7" cy="15" r="1.6" fill="currentColor" stroke="none"/><circle cx="11" cy="9" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.6" fill="currentColor" stroke="none"/><circle cx="18" cy="6" r="1.6" fill="currentColor" stroke="none"/>' },
  { id: 'bubble_chart', cat: 'relationship', label: 'Bubble', span: 6, h: 260, icon: '<circle cx="8" cy="14" r="3.5" fill="none"/><circle cx="16" cy="8" r="2.5" fill="none"/><circle cx="17" cy="16" r="1.8" fill="none"/>' },
  { id: 'radar_chart', cat: 'relationship', label: 'Radar', span: 6, h: 260, icon: '<polygon points="12 3 20 9 17 19 7 19 4 9" fill="none"/><polygon points="12 7 16.5 10.5 15 16 9 16 7.5 10.5" fill="none" opacity=".5"/>' },
  { id: 'heatmap', cat: 'relationship', label: 'Heatmap', span: 6, h: 260, icon: '<rect x="3" y="3" width="5" height="5"/><rect x="10" y="3" width="5" height="5" opacity=".5"/><rect x="17" y="3" width="4" height="5" opacity=".2"/><rect x="3" y="10" width="5" height="5" opacity=".5"/><rect x="10" y="10" width="5" height="5"/>' },
  { id: 'histogram', cat: 'relationship', label: 'Histogram', span: 6, h: 260, icon: '<rect x="3" y="14" width="3.6" height="6"/><rect x="6.6" y="8" width="3.6" height="12"/><rect x="10.2" y="4" width="3.6" height="16"/><rect x="13.8" y="9" width="3.6" height="11"/><rect x="17.4" y="15" width="3.6" height="5"/>' },
  { id: 'table', cat: 'other', label: 'Table', span: 12, h: 300, icon: '<rect x="3" y="4" width="18" height="16" rx="1"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="4" x2="9" y2="20"/>' },
  { id: 'map', cat: 'other', label: 'Map', span: 6, h: 240, icon: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" fill="none"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>' },
  { id: 'timeline', cat: 'other', label: 'Timeline', span: 12, h: 140, icon: '<line x1="3" y1="12" x2="21" y2="12"/><circle cx="6" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="2" fill="currentColor" stroke="none"/>' }
];

// Which dataset columns feed each widget type, and what role each one
// plays. Users pick per-role in the popover instead of the system silently
// auto-cycling columns — "อยากเปลี่ยนได้ว่าจะเอาอะไรมาทำกราฟ".
const WIDGET_FIELD_SPECS = {
  kpi_card: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }],
  metric_card: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }],
  comparison_card: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }],
  sparkline_card: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }],
  progress_ring: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }],
  line_chart: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข (แกน Y)' }],
  area_chart: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข (แกน Y)' }],
  spline_chart: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข (แกน Y)' }],
  gauge_chart: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }],
  histogram: [{ role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }],
  multi_line_chart: [
    { role: 'num0', kind: 'numeric', label: 'เส้นที่ 1' },
    { role: 'num1', kind: 'numeric', label: 'เส้นที่ 2' },
    { role: 'num2', kind: 'numeric', label: 'เส้นที่ 3 (ถ้ามี)' }
  ],
  stacked_area_chart: [
    { role: 'num0', kind: 'numeric', label: 'ชั้นที่ 1' },
    { role: 'num1', kind: 'numeric', label: 'ชั้นที่ 2' },
    { role: 'num2', kind: 'numeric', label: 'ชั้นที่ 3 (ถ้ามี)' }
  ],
  bar_chart: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่' },
    { role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }
  ],
  donut_chart: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่' },
    { role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }
  ],
  pie_chart: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่' },
    { role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }
  ],
  funnel_chart: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่' },
    { role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }
  ],
  treemap: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่' },
    { role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }
  ],
  pareto_chart: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่' },
    { role: 'num0', kind: 'numeric', label: 'ค่าตัวเลข' }
  ],
  grouped_bar: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่' },
    { role: 'num0', kind: 'numeric', label: 'ค่าตัวเลขที่ 1' },
    { role: 'num1', kind: 'numeric', label: 'ค่าตัวเลขที่ 2' },
    { role: 'num2', kind: 'numeric', label: 'ค่าตัวเลขที่ 3 (ถ้ามี)' }
  ],
  stacked_bar: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่' },
    { role: 'num0', kind: 'numeric', label: 'ค่าตัวเลขที่ 1' },
    { role: 'num1', kind: 'numeric', label: 'ค่าตัวเลขที่ 2' },
    { role: 'num2', kind: 'numeric', label: 'ค่าตัวเลขที่ 3 (ถ้ามี)' }
  ],
  combo_chart: [
    { role: 'cat0', kind: 'categorical', label: 'หมวดหมู่ (ถ้าไม่มีวันที่)' },
    { role: 'num0', kind: 'numeric', label: 'แท่ง (Bar)' },
    { role: 'num1', kind: 'numeric', label: 'เส้น (Line)' }
  ],
  scatter_plot: [
    { role: 'num0', kind: 'numeric', label: 'แกน X' },
    { role: 'num1', kind: 'numeric', label: 'แกน Y' }
  ],
  bubble_chart: [
    { role: 'num0', kind: 'numeric', label: 'แกน X' },
    { role: 'num1', kind: 'numeric', label: 'แกน Y' },
    { role: 'num2', kind: 'numeric', label: 'ขนาดฟอง' }
  ]
};

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const GRID_SNAP = 10;
const QUICK_WIDTHS = { 3: 300, 6: 620, 12: 1240 };
const MIN_BLOCK_W = 160;
const MIN_BLOCK_H = 70;

const LAYOUTS = [
  { id: 'single_full', label: '1 บล็อกเต็ม', blocks: [{ x: 20, y: 20, w: 1240, h: 360 }] },
  { id: 'two_col_equal', label: '2 คอลัมน์เท่ากัน', blocks: [{ x: 20, y: 20, w: 610, h: 300 }, { x: 650, y: 20, w: 610, h: 300 }] },
  { id: 'two_col_70_30', label: '2 คอลัมน์ 70/30', blocks: [{ x: 20, y: 20, w: 860, h: 300 }, { x: 900, y: 20, w: 360, h: 300 }] },
  { id: 'two_col_30_70', label: '2 คอลัมน์ 30/70', blocks: [{ x: 20, y: 20, w: 360, h: 300 }, { x: 400, y: 20, w: 860, h: 300 }] },
  { id: 'three_col_equal', label: '3 คอลัมน์เท่ากัน', blocks: [{ x: 20, y: 20, w: 400, h: 280 }, { x: 440, y: 20, w: 400, h: 280 }, { x: 860, y: 20, w: 400, h: 280 }] },
  { id: 'grid_2x2', label: 'Grid 2x2', blocks: [{ x: 20, y: 20, w: 610, h: 220 }, { x: 650, y: 20, w: 610, h: 220 }, { x: 20, y: 260, w: 610, h: 220 }, { x: 650, y: 260, w: 610, h: 220 }] },
  { id: 'grid_2x3', label: 'Grid 2x3', blocks: [{ x: 20, y: 20, w: 610, h: 180 }, { x: 650, y: 20, w: 610, h: 180 }, { x: 20, y: 220, w: 610, h: 180 }, { x: 650, y: 220, w: 610, h: 180 }, { x: 20, y: 420, w: 610, h: 180 }, { x: 650, y: 420, w: 610, h: 180 }] },
  { id: 'grid_3x2', label: 'Grid 3x2', blocks: [{ x: 20, y: 20, w: 400, h: 220 }, { x: 440, y: 20, w: 400, h: 220 }, { x: 860, y: 20, w: 400, h: 220 }, { x: 20, y: 260, w: 400, h: 220 }, { x: 440, y: 260, w: 400, h: 220 }, { x: 860, y: 260, w: 400, h: 220 }] },
  { id: 'hero_plus_2', label: 'Hero + 2 ด้านล่าง', blocks: [{ x: 20, y: 20, w: 1240, h: 280 }, { x: 20, y: 320, w: 610, h: 220 }, { x: 650, y: 320, w: 610, h: 220 }] },
  { id: 'hero_plus_3', label: 'Hero + 3 ด้านล่าง', blocks: [{ x: 20, y: 20, w: 1240, h: 260 }, { x: 20, y: 300, w: 400, h: 220 }, { x: 440, y: 300, w: 400, h: 220 }, { x: 860, y: 300, w: 400, h: 220 }] },
  { id: 'sidebar_left', label: 'แถบข้างซ้าย + หลัก', blocks: [{ x: 20, y: 20, w: 300, h: 640 }, { x: 340, y: 20, w: 920, h: 640 }] },
  { id: 'sidebar_right', label: 'หลัก + แถบข้างขวา', blocks: [{ x: 20, y: 20, w: 920, h: 640 }, { x: 960, y: 20, w: 300, h: 640 }] },
  { id: 'kpi_row4_hero', label: 'KPI 4 ช่อง + กราฟใหญ่', blocks: [{ x: 20, y: 20, w: 295, h: 120 }, { x: 335, y: 20, w: 295, h: 120 }, { x: 650, y: 20, w: 295, h: 120 }, { x: 965, y: 20, w: 295, h: 120 }, { x: 20, y: 160, w: 1240, h: 320 }] },
  { id: 'kpi_row3_two_charts', label: 'KPI 3 ช่อง + 2 กราฟ', blocks: [{ x: 20, y: 20, w: 400, h: 120 }, { x: 440, y: 20, w: 400, h: 120 }, { x: 860, y: 20, w: 400, h: 120 }, { x: 20, y: 160, w: 610, h: 280 }, { x: 650, y: 160, w: 610, h: 280 }] },
  { id: 'banner_grid', label: 'แบนเนอร์ + Grid 2x2', blocks: [{ x: 20, y: 20, w: 1240, h: 100 }, { x: 20, y: 140, w: 610, h: 220 }, { x: 650, y: 140, w: 610, h: 220 }, { x: 20, y: 380, w: 610, h: 220 }, { x: 650, y: 380, w: 610, h: 220 }] },
  { id: 'asym_big_left', label: 'ใหญ่ซ้าย + 2 ซ้อนขวา', blocks: [{ x: 20, y: 20, w: 820, h: 460 }, { x: 860, y: 20, w: 400, h: 220 }, { x: 860, y: 260, w: 400, h: 220 }] },
  { id: 'three_rows', label: '3 แถว (เต็ม/แยก/เต็ม)', blocks: [{ x: 20, y: 20, w: 1240, h: 200 }, { x: 20, y: 240, w: 610, h: 220 }, { x: 650, y: 240, w: 610, h: 220 }, { x: 20, y: 480, w: 1240, h: 180 }] },
  { id: 'classic_dashboard', label: 'คลาสสิก: KPI + Hero + ข้าง', blocks: [{ x: 20, y: 20, w: 295, h: 110 }, { x: 335, y: 20, w: 295, h: 110 }, { x: 650, y: 20, w: 295, h: 110 }, { x: 965, y: 20, w: 295, h: 110 }, { x: 20, y: 150, w: 820, h: 300 }, { x: 860, y: 150, w: 400, h: 145 }, { x: 860, y: 305, w: 400, h: 145 }] }
];

// Starter templates were cleared with the rest of the old template set.
// The picker renders an empty state until the new library is added.
const DASHBOARD_TEMPLATES = [];

function templatePreviewHTML(tpl) {
  const maxX = Math.max(...tpl.blocks.map(b => b.x + b.w));
  const maxY = Math.max(...tpl.blocks.map(b => b.y + b.h));
  return tpl.blocks.map(b => {
    const left = (b.x / maxX * 100).toFixed(1);
    const top = (b.y / maxY * 100).toFixed(1);
    const w = (b.w / maxX * 100).toFixed(1);
    const h = (b.h / maxY * 100).toFixed(1);
    return `<span style="left:${left}%;top:${top}%;width:${w}%;height:${h}%"></span>`;
  }).join('');
}

function applyDashboardTemplate(tplId) {
  const tpl = DASHBOARD_TEMPLATES.find(t => t.id === tplId);
  if (!tpl) return;
  const grid = document.getElementById('canvasGrid');
  if (grid.children.length > 0 && !confirm('แทนที่ Dashboard ปัจจุบันด้วย Template นี้?')) return;
  destroyAllCharts(); grid.innerHTML = ''; resetBindingCounters();
  tpl.blocks.forEach(b => {
    const widget = widgetById(b.widgetId);
    if (!widget) return;
    const block = document.createElement('div');
    block.id = 'cb-' + (blockIdCounter++);
    setBlockGeometry(block, b.x, b.y, b.w, b.h);
    if (defaultLabelMode !== 'auto') block.dataset.labelMode = defaultLabelMode;
    grid.appendChild(block);
    mountWidget(block, widget);
  });
  updateCanvas(); autoGrowCanvas(); zoomToFit(); pushHistory(); saveDraft();
}

function renderTemplateList() {
  const list = document.getElementById('templateList');
  if (!list) return;
  if (!DASHBOARD_TEMPLATES.length) {
    list.innerHTML = '<div class="layout-empty">ยังไม่มี Template — ชุดใหม่กำลังจัดทำ<br>ระหว่างนี้ลากวิดเจ็ตจากแถบซ้ายมาวางเองได้</div>';
    return;
  }
  list.innerHTML = DASHBOARD_TEMPLATES.map(t => `<div class="layout-item" data-template-id="${t.id}"><div class="layout-item-preview">${templatePreviewHTML(t)}</div><div class="layout-item-name">${t.label}</div></div>`).join('');
  list.querySelectorAll('.layout-item').forEach(item => { item.addEventListener('click', () => applyDashboardTemplate(item.dataset.templateId)); });
}

function layoutPreviewHTML(layout) {
  const maxX = Math.max(...layout.blocks.map(b => b.x + b.w));
  const maxY = Math.max(...layout.blocks.map(b => b.y + b.h));
  return layout.blocks.map(b => {
    const left = (b.x / maxX * 100).toFixed(1);
    const top = (b.y / maxY * 100).toFixed(1);
    const w = (b.w / maxX * 100).toFixed(1);
    const h = (b.h / maxY * 100).toFixed(1);
    return `<span style="left:${left}%;top:${top}%;width:${w}%;height:${h}%"></span>`;
  }).join('');
}

const SWATCHES = ['#2563eb', '#10b981', '#7c3aed', '#ea580c', '#ec4899', '#0d9488', '#475569'];
const BG_SWATCHES = ['#ffffff', '#f8fafc', '#0f172a', '#1e293b', '#fef3c7', '#ecfdf5', '#eff6ff', '#fdf4ff'];

let selectedAccent = SWATCHES[0];
let blockIdCounter = 0;
const chartInstances = new Map();
let dashboardBg = { color: null, image: null };
let defaultLabelMode = 'auto';
let renderColorOverride = null;
let currentPresetThemeId = null;
function activeAccent() { return renderColorOverride || selectedAccent; }
// Multi-series charts (grouped bar, multi-line, radar…) previously always
// used a fixed hardcoded palette after the accent color — picking a preset
// theme now drives the full 7-color series palette too, not just series 1.
function activeChartPalette() {
  if (currentPresetThemeId && window.iDashThemes) {
    const t = window.iDashThemes.find(x => x.id === currentPresetThemeId);
    if (t && t.chart) return t.chart;
  }
  return [activeAccent(), '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#cbd5e1'];
}

function labelOptionFor(block) {
  const mode = block.dataset.labelMode || 'auto';
  if (mode === 'auto') return null;
  if (mode === 'none') return { show: false };
  if (mode === 'custom') {
    const text = block.dataset.labelCustom || '{b}: {c}';
    return { show: true, fontSize: 9, formatter: text };
  }
  const formatters = { value: '{c}', percent: '{d}%', name: '{b}', name_value: '{b}: {c}' };
  return { show: true, fontSize: 9, formatter: formatters[mode] || '{b}: {c}' };
}

const AUTOSAVE_KEY = 'idash.customDraftAutosave';
const bindingCounters = {};
let historyStack = [];
let historyIndex = -1;
let isRestoringHistory = false;
let suppressHistory = false;

// ─── Current canvas zoom (auto-fit or manual) ───
let canvasZoom = 1;

// ─── Fullview (view-only) mode flag — true while the "สร้าง Dashboard"
// overlay is showing. Drag/resize/select must be fully inert in this mode;
// only export buttons and "กลับไปแก้ไข" are live.
let isFullViewMode = false;

// ─── Selection state ───
let selectedBlock = null;

function selectBlock(block) {
  if (selectedBlock) selectedBlock.classList.remove('is-selected');
  selectedBlock = block;
  if (block) block.classList.add('is-selected');
}

function deselectAll() {
  if (selectedBlock) selectedBlock.classList.remove('is-selected');
  selectedBlock = null;
}

function deleteSelectedBlock() {
  if (!selectedBlock) return;
  disposeChartForBlock(selectedBlock);
  selectedBlock.remove();
  selectedBlock = null;
  updateCanvas(); pushHistory(); saveDraft();
}

function duplicateSelectedBlock() {
  if (!selectedBlock || !selectedBlock.dataset.widgetId) return;
  const widget = widgetById(selectedBlock.dataset.widgetId);
  if (!widget) return;
  const x = (parseFloat(selectedBlock.style.left) || 0) + 30;
  const y = (parseFloat(selectedBlock.style.top) || 0) + 30;
  const w = parseFloat(selectedBlock.style.width) || 300;
  const h = parseFloat(selectedBlock.style.height) || 200;
  const grid = document.getElementById('canvasGrid');
  const block = document.createElement('div');
  block.id = 'cb-' + (blockIdCounter++);
  setBlockGeometry(block, snapVal(x), snapVal(y), w, h);
  if (selectedBlock.dataset.customColor) block.dataset.customColor = selectedBlock.dataset.customColor;
  if (selectedBlock.dataset.customBg) block.dataset.customBg = selectedBlock.dataset.customBg;
  if (selectedBlock.dataset.labelMode) block.dataset.labelMode = selectedBlock.dataset.labelMode;
  if (selectedBlock.dataset.fieldOverrides) block.dataset.fieldOverrides = selectedBlock.dataset.fieldOverrides;
  grid.appendChild(block);
  mountWidget(block, widget);
  selectBlock(block);
  autoGrowCanvas(); zoomToFit();
  pushHistory(); saveDraft();
}

function nudgeSelectedBlock(dx, dy) {
  if (!selectedBlock) return;
  const x = (parseFloat(selectedBlock.style.left) || 0) + dx;
  const y = (parseFloat(selectedBlock.style.top) || 0) + dy;
  const w = parseFloat(selectedBlock.style.width) || 300;
  const h = parseFloat(selectedBlock.style.height) || 200;
  const pos = clampPos(x, y, w, h);
  selectedBlock.style.left = snapVal(pos.x) + 'px';
  selectedBlock.style.top = snapVal(pos.y) + 'px';
  autoGrowCanvas();
  pushHistory(); saveDraft();
}

// ─── Dataset binding ───
function getDataset() {
  if (getDataset._cache !== undefined) return getDataset._cache;
  const raw = sessionStorage.getItem('idash.pendingDataset');
  if (!raw) { getDataset._cache = null; return null; }
  try {
    const parsed = JSON.parse(raw);
    getDataset._cache = (parsed && Array.isArray(parsed.columns) && Array.isArray(parsed.data)) ? parsed : null;
  } catch (e) { getDataset._cache = null; }
  return getDataset._cache;
}

function classifyValue(v) {
  if (v === null || v === undefined) return 'empty';
  if (typeof v === 'number' && Number.isFinite(v)) return 'numeric';
  const s = String(v).trim();
  if (s === '') return 'empty';
  if (/^-?[\d,]+\.?\d*%?$/.test(s)) return 'numeric';
  if (/^\d{4}-\d{2}-\d{2}/.test(s) || /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s)) return 'date';
  return 'categorical';
}

function inferColumns(dataset) {
  const result = { numeric: [], date: [], categorical: [] };
  if (!dataset) return result;
  const rows = dataset.data;
  const sampleSize = Math.min(rows.length, 30);
  dataset.columns.forEach(col => {
    const counts = { numeric: 0, date: 0, categorical: 0 };
    let total = 0;
    for (let i = 0; i < sampleSize; i++) {
      const v = rows[i] ? rows[i][col] : undefined;
      const kind = classifyValue(v);
      if (kind === 'empty') continue;
      total++;
      counts[kind]++;
    }
    if (total === 0) { result.categorical.push(col); return; }
    if (counts.numeric / total >= 0.7) result.numeric.push(col);
    else if (counts.date / total >= 0.6) result.date.push(col);
    else result.categorical.push(col);
  });
  return result;
}

function toNumber(v) {
  if (typeof v === 'number') return v;
  if (v === null || v === undefined) return NaN;
  return parseFloat(String(v).replace(/[,%]/g, '').trim());
}
// Rate/percentage-like columns must be averaged, not summed (see interactive_dashboard_generator.js isRateCol).
function isRateCol(name) {
  return /_%|เฉลี่ย|average|rate|ratio|percent|efficiency|oee|ccs|brix|pol|purity|rpm|recovery|อุณหภูมิ|temperature|\btemp\b|pressure|ความดัน|\bph\b|_ph|ph_|\bbod\b|\bcod\b|\btss\b|\bppm\b|mg_l|mg\/l/i.test(name);
}
function isPercentCol(name) {
  return /_%|percent|เปอร์เซ็นต์/i.test(name);
}
function formatKpiVal(v, colName) {
  if (!Number.isFinite(v)) return '-';
  if (isRateCol(colName)) return v.toLocaleString('th-TH', { maximumFractionDigits: 1 }) + (isPercentCol(colName) ? '%' : '');
  return formatNum(v);
}
function pick(arr, index) { return arr.length ? arr[index % arr.length] : null; }

// ─── Per-widget data field overrides ───
// Stored as JSON on block.dataset.fieldOverrides: { num0: 'Revenue', cat0: 'Region', ... }
function getFieldOverrides(block) {
  if (!block || !block.dataset.fieldOverrides) return {};
  try { return JSON.parse(block.dataset.fieldOverrides); } catch (e) { return {}; }
}
function setFieldOverride(block, role, value) {
  const ov = getFieldOverrides(block);
  if (value) ov[role] = value; else delete ov[role];
  if (Object.keys(ov).length) block.dataset.fieldOverrides = JSON.stringify(ov);
  else delete block.dataset.fieldOverrides;
}
// Resolves the column for a role: user's explicit choice if still valid
// for that kind, otherwise falls back to the same auto-pick the system
// always used (pick() cycling by binding index).
function fieldFor(block, role, kind, cols, fallbackIdx) {
  const chosen = getFieldOverrides(block)[role];
  if (chosen && cols[kind] && cols[kind].includes(chosen)) return chosen;
  return pick(cols[kind], fallbackIdx);
}
function formatNum(v) {
  if (!Number.isFinite(v)) return '-';
  const abs = Math.abs(v);
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return v.toLocaleString('th-TH', { maximumFractionDigits: 1 });
}
function computeKpiValue(rows, numCol) {
  let sum = 0, count = 0;
  rows.forEach(r => { const v = toNumber(r[numCol]); if (Number.isFinite(v)) { sum += v; count++; } });
  return { sum, count, avg: count ? sum / count : 0 };
}
function aggregateByCategory(rows, catCol, numCol, topN) {
  const map = new Map();
  rows.forEach(r => {
    const cat = r[catCol]; if (cat === undefined || cat === null || cat === '') return;
    const val = toNumber(r[numCol]); if (!Number.isFinite(val)) return;
    map.set(cat, (map.get(cat) || 0) + val);
  });
  const arr = [...map.entries()].map(([name, value]) => ({ name: String(name), value })).sort((a, b) => b.value - a.value);
  if (arr.length <= topN) return arr;
  const top = arr.slice(0, topN);
  top.push({ name: 'อื่นๆ', value: arr.slice(topN).reduce((s, x) => s + x.value, 0), isOthers: true });
  return top;
}
function aggregateByDate(rows, dateCol, numCol) {
  const map = new Map();
  rows.forEach(r => {
    const d = r[dateCol]; if (d === undefined || d === null || d === '') return;
    const val = toNumber(r[numCol]); if (!Number.isFinite(val)) return;
    map.set(String(d), (map.get(String(d)) || 0) + val);
  });
  const entries = [...map.entries()];
  entries.sort((a, b) => { const ta = Date.parse(a[0]), tb = Date.parse(b[0]); return (!isNaN(ta) && !isNaN(tb)) ? ta - tb : a[0].localeCompare(b[0]); });
  return entries.map(([period, value]) => ({ period, value }));
}
function aggregateByDateAvg(rows, dateCol, numCol) {
  const sumMap = new Map(), cntMap = new Map();
  rows.forEach(r => {
    const d = r[dateCol]; if (d === undefined || d === null || d === '') return;
    const val = toNumber(r[numCol]); if (!Number.isFinite(val)) return;
    const k = String(d);
    sumMap.set(k, (sumMap.get(k) || 0) + val);
    cntMap.set(k, (cntMap.get(k) || 0) + 1);
  });
  const entries = [...sumMap.entries()].map(([period, sum]) => ({ period, value: sum / cntMap.get(period) }));
  entries.sort((a, b) => { const ta = Date.parse(a.period), tb = Date.parse(b.period); return (!isNaN(ta) && !isNaN(tb)) ? ta - tb : a.period.localeCompare(b.period); });
  return entries;
}
function nextBindingIndex(widgetId) { const idx = bindingCounters[widgetId] || 0; bindingCounters[widgetId] = idx + 1; return idx; }
function resetBindingCounters() { Object.keys(bindingCounters).forEach(k => { bindingCounters[k] = 0; }); }
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ─── Widget renderers ───
function disposeChartForBlock(block) { const inst = chartInstances.get(block.id); if (inst) { try { inst.dispose(); } catch (e) {} chartInstances.delete(block.id); } }
function destroyAllCharts() { chartInstances.forEach(inst => { try { inst.dispose(); } catch (e) {} }); chartInstances.clear(); }

function ensureChartDom(body, block) {
  body.style.height = '';
  const chartId = block.id + '-chart';
  body.innerHTML = `<div class="cb-chart-canvas" id="${chartId}"></div>`;
  return chartId;
}

function renderBlockBody(block, widget, bindingIndex) {
  const body = block.querySelector('.canvas-block-body');
  if (!body) return;
  disposeChartForBlock(block);
  const dataset = getDataset();
  const cols = dataset ? inferColumns(dataset) : { numeric: [], date: [], categorical: [] };
  const rows = dataset ? dataset.data : [];
  const hasData = !!dataset && rows.length > 0;
  renderColorOverride = block.dataset.customColor || null;
  try { renderByType(widget, body, block, rows, cols, bindingIndex, hasData, dataset); }
  finally { renderColorOverride = null; }
}

function renderByType(widget, body, block, rows, cols, idx, hasData, dataset) {
  switch (widget.id) {
    case 'kpi_card': renderKpi(body, block, rows, cols, idx, 'sum', hasData); break;
    case 'metric_card': renderKpi(body, block, rows, cols, idx, 'avg', hasData); break;
    case 'comparison_card': renderComparison(body, block, rows, cols, idx, hasData); break;
    case 'sparkline_card': renderSparkline(body, block, rows, cols, idx, hasData); break;
    case 'line_chart': renderTrend(body, block, rows, cols, idx, {}, hasData); break;
    case 'area_chart': renderTrend(body, block, rows, cols, idx, { area: true }, hasData); break;
    case 'spline_chart': renderTrend(body, block, rows, cols, idx, { smooth: true }, hasData); break;
    case 'multi_line_chart': renderMultiSeries(body, block, rows, cols, idx, false, hasData); break;
    case 'stacked_area_chart': renderMultiSeries(body, block, rows, cols, idx, true, hasData); break;
    case 'bar_chart': renderCategory(body, block, rows, cols, idx, 'bar', hasData); break;
    case 'grouped_bar': renderMultiBar(body, block, rows, cols, idx, false, hasData); break;
    case 'stacked_bar': renderMultiBar(body, block, rows, cols, idx, true, hasData); break;
    case 'combo_chart': renderCombo(body, block, rows, cols, idx, hasData); break;
    case 'pareto_chart': renderPareto(body, block, rows, cols, idx, hasData); break;
    case 'donut_chart': renderCategory(body, block, rows, cols, idx, 'donut', hasData); break;
    case 'pie_chart': renderCategory(body, block, rows, cols, idx, 'pie', hasData); break;
    case 'funnel_chart': renderCategory(body, block, rows, cols, idx, 'funnel', hasData); break;
    case 'treemap': renderTreemap(body, block, rows, cols, idx, hasData); break;
    case 'gauge_chart': renderGauge(body, block, rows, cols, idx, hasData); break;
    case 'progress_ring': renderProgressRing(body, block, rows, cols, idx, hasData); break;
    case 'scatter_plot': renderScatter(body, block, rows, cols, idx, false, hasData); break;
    case 'bubble_chart': renderScatter(body, block, rows, cols, idx, true, hasData); break;
    case 'radar_chart': renderRadar(body, block, rows, cols, idx, hasData); break;
    case 'heatmap': renderHeatmap(body, block, rows, cols, idx, hasData); break;
    case 'histogram': renderHistogram(body, block, rows, cols, idx, hasData); break;
    case 'table': renderTable(body, dataset, hasData); break;
    default: body.innerHTML = `<div class="cb-empty">${escapeHtml(widget.label)}</div>`;
  }
}

function renderKpi(body, block, rows, cols, idx, mode, hasData) {
  if (!hasData || !cols.numeric.length) { body.innerHTML = '<div class="cb-empty">อัปโหลดข้อมูล</div>'; return; }
  const c = fieldFor(block, 'num0', 'numeric', cols, idx);
  const rateCol = isRateCol(c);
  const { sum, avg, count } = computeKpiValue(rows, c);
  const val = (mode === 'sum' && !rateCol) ? sum : avg;
  let dh = '';
  if (cols.date.length) {
    const s = rateCol ? aggregateByDateAvg(rows, cols.date[0], c) : aggregateByDate(rows, cols.date[0], c);
    if (s.length >= 2) {
      const mid = Math.floor(s.length / 2);
      const h1 = s.slice(0, mid).reduce((a, x) => a + x.value, 0) / mid;
      const h2 = s.slice(mid).reduce((a, x) => a + x.value, 0) / (s.length - mid);
      if (h1) { const p = ((h2 - h1) / Math.abs(h1)) * 100; dh = `<span class="cb-kpi-delta ${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '+' : ''}${p.toFixed(1)}%</span>`; }
    }
  }
  body.innerHTML = `<div class="cb-kpi-name">${escapeHtml(c)}</div><div class="cb-kpi-value-row"><span class="cb-kpi-value">${formatKpiVal(val, c)}</span>${dh}</div><div class="cb-kpi-sub">${count.toLocaleString()} รายการ</div>`;
}

function trendFor(rows, cols, c) {
  if (cols.date.length) return (isRateCol(c) ? aggregateByDateAvg(rows, cols.date[0], c) : aggregateByDate(rows, cols.date[0], c)).slice(-24);
  return rows.slice(0, 30).map((r, i) => ({ period: '#' + (i + 1), value: toNumber(r[c]) })).filter(s => Number.isFinite(s.value));
}

function renderTrend(body, block, rows, cols, idx, opts, hasData) {
  if (!hasData || !cols.numeric.length) { body.innerHTML = '<div class="cb-empty">อัปโหลดข้อมูล</div>'; return; }
  const c = fieldFor(block, 'num0', 'numeric', cols, idx), s = trendFor(rows, cols, c);
  if (!s.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ grid: { left: 40, right: 12, top: 12, bottom: 24 }, xAxis: { type: 'category', data: s.map(x => x.period), axisLabel: { fontSize: 9 } }, yAxis: { type: 'value', axisLabel: { fontSize: 9 } }, tooltip: { trigger: 'axis' }, series: [{ type: 'line', data: s.map(x => x.value), smooth: !!opts.smooth, symbolSize: 3, lineStyle: { color: activeAccent(), width: 2 }, itemStyle: { color: activeAccent() }, areaStyle: opts.area ? { color: activeAccent() + '22' } : undefined }] });
}

function renderComparison(body, block, rows, cols, idx, hasData) {
  if (!hasData || !cols.numeric.length) { body.innerHTML = '<div class="cb-empty">อัปโหลดข้อมูล</div>'; return; }
  const c = fieldFor(block, 'num0', 'numeric', cols, idx);
  const rateCol = isRateCol(c);
  let cur, prev;
  if (cols.date.length) { const s = rateCol ? aggregateByDateAvg(rows, cols.date[0], c) : aggregateByDate(rows, cols.date[0], c); if (s.length >= 2) { cur = s[s.length - 1].value; prev = s[s.length - 2].value; } }
  if (cur === undefined) {
    const m = Math.floor(rows.length / 2);
    const sf = (p) => { const vs = p.map(r => toNumber(r[c])).filter(Number.isFinite); if (!vs.length) return 0; const s = vs.reduce((a, b) => a + b, 0); return rateCol ? s / vs.length : s; };
    cur = sf(rows.slice(m)); prev = sf(rows.slice(0, m));
  }
  let dh = ''; if (prev) { const p = ((cur - prev) / Math.abs(prev)) * 100; dh = `<span class="cb-kpi-delta ${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '+' : ''}${p.toFixed(1)}%</span>`; }
  body.innerHTML = `<div class="cb-kpi-name">${escapeHtml(c)}</div><div class="cb-kpi-value-row"><span class="cb-kpi-value">${formatKpiVal(cur, c)}</span>${dh}</div><div class="cb-kpi-sub">ก่อนหน้า ${formatKpiVal(prev, c)}</div>`;
}

function renderSparkline(body, block, rows, cols, idx, hasData) {
  if (!hasData || !cols.numeric.length) { body.innerHTML = '<div class="cb-empty">อัปโหลดข้อมูล</div>'; return; }
  const c = fieldFor(block, 'num0', 'numeric', cols, idx), s = trendFor(rows, cols, c), { sum, avg, count } = computeKpiValue(rows, c);
  const displayVal = isRateCol(c) ? avg : sum;
  let svg = '';
  if (s.length >= 2) { const vals = s.map(x => x.value), mn = Math.min(...vals), mx = Math.max(...vals), r = mx - mn || 1; const pts = vals.map((v, i) => `${(i / (vals.length - 1) * 100).toFixed(1)},${(26 - (v - mn) / r * 22).toFixed(1)}`).join(' '); svg = `<svg class="cb-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${activeAccent()}" stroke-width="1.6"/></svg>`; }
  body.innerHTML = `<div class="cb-kpi-name">${escapeHtml(c)}</div><div class="cb-kpi-value-row"><span class="cb-kpi-value">${formatKpiVal(displayVal, c)}</span></div>${svg}<div class="cb-kpi-sub">${count.toLocaleString()} รายการ</div>`;
}

function renderMultiSeries(body, block, rows, cols, idx, stacked, hasData) {
  if (!hasData || cols.numeric.length < 2) { body.innerHTML = '<div class="cb-empty">ต้องมีตัวเลข 2+ คอลัมน์</div>'; return; }
  const nc = [0, 1, 2].map(i => fieldFor(block, 'num' + i, 'numeric', cols, i)).filter((v, i, a) => v && a.indexOf(v) === i);
  const sp = nc.map(c => trendFor(rows, cols, c)), periods = sp.length ? sp[0].map(s => s.period) : [];
  if (!periods.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const pal = activeChartPalette();
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ grid: { left: 40, right: 12, top: 26, bottom: 24 }, legend: { top: 0, textStyle: { fontSize: 9 }, itemWidth: 10, itemHeight: 7 }, xAxis: { type: 'category', data: periods, axisLabel: { fontSize: 9 } }, yAxis: { type: 'value', axisLabel: { fontSize: 9 } }, tooltip: { trigger: 'axis' }, series: nc.map((c, i) => ({ name: c, type: 'line', smooth: false, symbolSize: 3, stack: stacked ? 'total' : undefined, data: sp[i].map(s => s.value), lineStyle: { color: pal[i % 3], width: 2 }, itemStyle: { color: pal[i % 3] }, areaStyle: stacked ? { color: pal[i % 3] + '33' } : undefined })) });
}

function topCatNames(rows, catCol, numCol, n) { return aggregateByCategory(rows, catCol, numCol, n).filter(d => !d.isOthers).map(d => d.name); }
function sumsByCat(rows, catCol, numCol, names) { const m = new Map(names.map(n => [n, 0])); rows.forEach(r => { const c = r[catCol] != null ? String(r[catCol]) : ''; if (!m.has(c)) return; const v = toNumber(r[numCol]); if (Number.isFinite(v)) m.set(c, m.get(c) + v); }); return names.map(n => Math.round(m.get(n) * 100) / 100); }

function renderMultiBar(body, block, rows, cols, idx, stacked, hasData) {
  if (!hasData || cols.numeric.length < 2 || !cols.categorical.length) { body.innerHTML = '<div class="cb-empty">ต้องมีหมวดหมู่ + ตัวเลข 2+</div>'; return; }
  const catCol = fieldFor(block, 'cat0', 'categorical', cols, idx);
  const nc = [0, 1, 2].map(i => fieldFor(block, 'num' + i, 'numeric', cols, i)).filter((v, i, a) => v && a.indexOf(v) === i);
  const names = topCatNames(rows, catCol, nc[0], 6);
  if (!names.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const pal = activeChartPalette();
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ grid: { left: 40, right: 12, top: 26, bottom: 24 }, legend: { top: 0, textStyle: { fontSize: 9 }, itemWidth: 10, itemHeight: 7 }, xAxis: { type: 'category', data: names, axisLabel: { fontSize: 9, width: 60, overflow: 'truncate' } }, yAxis: { type: 'value', axisLabel: { fontSize: 9 } }, tooltip: { trigger: 'axis' }, series: nc.map((c, i) => ({ name: c, type: 'bar', stack: stacked ? 'total' : undefined, barMaxWidth: 24, data: sumsByCat(rows, catCol, c, names), itemStyle: { color: pal[i % 3], borderRadius: stacked ? 0 : [3, 3, 0, 0] } })) });
}

function renderCombo(body, block, rows, cols, idx, hasData) {
  if (!hasData || cols.numeric.length < 2 || (!cols.categorical.length && !cols.date.length)) { body.innerHTML = '<div class="cb-empty">ต้องมีหมวดหมู่/วันที่ + ตัวเลข 2</div>'; return; }
  const nA = fieldFor(block, 'num0', 'numeric', cols, idx), nB = fieldFor(block, 'num1', 'numeric', cols, idx + 1);
  let labels, barD, lineD;
  if (cols.date.length) { const sa = aggregateByDate(rows, cols.date[0], nA).slice(-18); labels = sa.map(s => s.period); barD = sa.map(s => s.value); const sbm = new Map(aggregateByDate(rows, cols.date[0], nB).map(s => [s.period, s.value])); lineD = labels.map(l => sbm.get(l) || null); }
  else { const cc = fieldFor(block, 'cat0', 'categorical', cols, idx); labels = topCatNames(rows, cc, nA, 6); barD = sumsByCat(rows, cc, nA, labels); lineD = sumsByCat(rows, cc, nB, labels); }
  if (!labels.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ grid: { left: 40, right: 12, top: 26, bottom: 24 }, legend: { top: 0, textStyle: { fontSize: 9 } }, xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 9, width: 60, overflow: 'truncate' } }, yAxis: { type: 'value', axisLabel: { fontSize: 9 } }, tooltip: { trigger: 'axis' }, series: [{ name: nA, type: 'bar', data: barD, barMaxWidth: 24, itemStyle: { color: activeAccent(), borderRadius: [3, 3, 0, 0] } }, { name: nB, type: 'line', data: lineD, symbolSize: 4, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' } }] });
}

function renderPareto(body, block, rows, cols, idx, hasData) {
  if (!hasData || !cols.numeric.length || !cols.categorical.length) { body.innerHTML = '<div class="cb-empty">ต้องมีหมวดหมู่ + ตัวเลข</div>'; return; }
  const nc = fieldFor(block, 'num0', 'numeric', cols, idx), cc = fieldFor(block, 'cat0', 'categorical', cols, idx);
  const data = aggregateByCategory(rows, cc, nc, 7).filter(d => !d.isOthers);
  if (!data.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const total = data.reduce((s, d) => s + d.value, 0); let run = 0;
  const cum = data.map(d => { run += d.value; return Math.round(run / total * 100); });
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ grid: { left: 40, right: 12, top: 18, bottom: 24 }, xAxis: { type: 'category', data: data.map(d => d.name), axisLabel: { fontSize: 9, width: 50, overflow: 'truncate' } }, yAxis: { type: 'value', axisLabel: { fontSize: 9 } }, tooltip: { trigger: 'item', formatter: p => `${p.name}: ${formatNum(data[p.dataIndex].value)} · ${cum[p.dataIndex]}%` }, series: [{ type: 'bar', data: data.map(d => d.value), barMaxWidth: 28, itemStyle: { color: activeAccent(), borderRadius: [3, 3, 0, 0] }, label: labelOptionFor(block) || { show: true, position: 'top', fontSize: 8, formatter: p => cum[p.dataIndex] + '%' } }] });
}

function renderCategory(body, block, rows, cols, idx, type, hasData) {
  if (!hasData || !cols.numeric.length || !cols.categorical.length) { body.innerHTML = '<div class="cb-empty">อัปโหลดข้อมูล</div>'; return; }
  const nc = fieldFor(block, 'num0', 'numeric', cols, idx), cc = fieldFor(block, 'cat0', 'categorical', cols, idx);
  const data = aggregateByCategory(rows, cc, nc, type === 'bar' ? 6 : 5);
  if (!data.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const pal = activeChartPalette();
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  const lbl = labelOptionFor(block);
  let opt;
  if (type === 'bar') { const rev = data.slice().reverse(); opt = { grid: { left: 80, right: 24, top: 6, bottom: 6 }, xAxis: { type: 'value', axisLabel: { fontSize: 9 } }, yAxis: { type: 'category', data: rev.map(d => d.name), axisLabel: { fontSize: 9, width: 70, overflow: 'truncate' } }, tooltip: { trigger: 'item' }, series: [{ type: 'bar', data: rev.map(d => d.value), label: lbl || { show: false }, itemStyle: { color: activeAccent(), borderRadius: [0, 3, 3, 0] } }] }; }
  else if (type === 'funnel') { opt = { tooltip: { trigger: 'item' }, series: [{ type: 'funnel', left: 6, right: 6, top: 6, bottom: 6, minSize: '15%', label: lbl || { fontSize: 9 }, data: data.map((d, i) => ({ name: d.name, value: Math.round(d.value * 100) / 100, itemStyle: { color: pal[i % pal.length] } })) }] }; }
  else { opt = { tooltip: { trigger: 'item' }, series: [{ type: 'pie', radius: type === 'donut' ? ['40%', '70%'] : ['0%', '70%'], label: lbl || { fontSize: 9, formatter: '{b}\n{d}%' }, itemStyle: { borderRadius: 3, borderColor: '#fff', borderWidth: 2 }, data: data.map((d, i) => ({ name: d.name, value: Math.round(d.value * 100) / 100, itemStyle: { color: d.isOthers ? '#cbd5e1' : pal[i % (pal.length - 1)] } })) }] }; }
  ch.setOption(opt);
}

function renderTreemap(body, block, rows, cols, idx, hasData) {
  if (!hasData || !cols.numeric.length || !cols.categorical.length) { body.innerHTML = '<div class="cb-empty">ต้องมีหมวดหมู่ + ตัวเลข</div>'; return; }
  const cc0 = fieldFor(block, 'cat0', 'categorical', cols, idx), nc0 = fieldFor(block, 'num0', 'numeric', cols, idx);
  const data = aggregateByCategory(rows, cc0, nc0, 12).filter(d => !d.isOthers && d.value > 0);
  if (!data.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const pal = activeChartPalette();
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ tooltip: { formatter: p => `${p.name}: ${formatNum(p.value)}` }, series: [{ type: 'treemap', left: 4, right: 4, top: 4, bottom: 4, roam: false, nodeClick: false, breadcrumb: { show: false }, label: labelOptionFor(block) || { fontSize: 9, formatter: p => `${p.name}\n${formatNum(p.value)}` }, itemStyle: { borderColor: '#fff', borderWidth: 2 }, data: data.map((d, i) => ({ name: d.name, value: Math.round(d.value * 100) / 100, itemStyle: { color: pal[i % pal.length] } })) }] });
}

function renderGauge(body, block, rows, cols, idx, hasData) {
  if (!hasData || !cols.numeric.length) { body.innerHTML = '<div class="cb-empty">อัปโหลดข้อมูล</div>'; return; }
  const c = fieldFor(block, 'num0', 'numeric', cols, idx), vals = rows.map(r => toNumber(r[c])).filter(Number.isFinite);
  if (!vals.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const mx = Math.max(...vals), avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ series: [{ type: 'gauge', min: 0, max: Math.ceil(mx * 1.1) || 1, radius: '88%', axisLine: { lineStyle: { width: 8, color: [[1, '#e2e8f0']] } }, progress: { show: true, width: 8, itemStyle: { color: activeAccent() } }, pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, detail: { formatter: () => formatKpiVal(avg, c), fontSize: 14, color: activeAccent(), offsetCenter: [0, 4] }, title: { fontSize: 9, offsetCenter: [0, '66%'], color: '#94a3b8' }, data: [{ value: avg, name: c }] }] });
}

function renderProgressRing(body, block, rows, cols, idx, hasData) {
  if (!hasData || !cols.numeric.length) { body.innerHTML = '<div class="cb-empty">อัปโหลดข้อมูล</div>'; return; }
  const c = fieldFor(block, 'num0', 'numeric', cols, idx), vals = rows.map(r => toNumber(r[c])).filter(Number.isFinite);
  if (!vals.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const mx = Math.max(...vals, 1), avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const pct = Math.min(100, Math.round(avg / mx * 100));
  body.innerHTML = `<div class="cb-progress-ring-wrap"><svg viewBox="0 0 42 42" class="cb-progress-ring"><circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--gray-100)" stroke-width="4"/><circle cx="21" cy="21" r="15.9" fill="none" stroke="${activeAccent()}" stroke-width="4" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="25" stroke-linecap="round"/></svg><div class="cb-progress-ring-label"><span class="cb-progress-ring-pct">${pct}%</span><span class="cb-progress-ring-name">${escapeHtml(c)}</span></div></div>`;
}

function renderScatter(body, block, rows, cols, idx, bubble, hasData) {
  const need = bubble ? 3 : 2;
  if (!hasData || cols.numeric.length < need) { body.innerHTML = `<div class="cb-empty">ต้องมีตัวเลข ${need}+ คอลัมน์</div>`; return; }
  const xC = fieldFor(block, 'num0', 'numeric', cols, idx);
  const yC = fieldFor(block, 'num1', 'numeric', cols, idx + 1);
  const sC = bubble ? fieldFor(block, 'num2', 'numeric', cols, idx + 2) : null;
  const pts = [];
  for (let i = 0; i < rows.length && pts.length < 200; i++) { const x = toNumber(rows[i][xC]), y = toNumber(rows[i][yC]); if (!Number.isFinite(x) || !Number.isFinite(y)) continue; if (bubble) { const s = toNumber(rows[i][sC]); if (!Number.isFinite(s)) continue; pts.push([x, y, s]); } else pts.push([x, y]); }
  if (!pts.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  let sz = 6;
  if (bubble) { const ss = pts.map(p => p[2]), mn = Math.min(...ss), mx = Math.max(...ss), r = mx - mn || 1; sz = v => 5 + (v[2] - mn) / r * 18; }
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ grid: { left: 44, right: 12, top: 12, bottom: 28 }, xAxis: { type: 'value', name: xC, nameTextStyle: { fontSize: 8 }, axisLabel: { fontSize: 9 }, scale: true }, yAxis: { type: 'value', name: yC, nameTextStyle: { fontSize: 8 }, axisLabel: { fontSize: 9 }, scale: true }, tooltip: {}, series: [{ type: 'scatter', data: pts, symbolSize: sz, itemStyle: { color: activeAccent(), opacity: .6 } }] });
}

function renderRadar(body, block, rows, cols, idx, hasData) {
  if (!hasData || cols.numeric.length < 3) { body.innerHTML = '<div class="cb-empty">ต้องมีตัวเลข 3+ คอลัมน์</div>'; return; }
  const nc = cols.numeric.slice(0, 5), inds = [], vals = [];
  nc.forEach(c => { const vs = rows.map(r => toNumber(r[c])).filter(Number.isFinite); if (!vs.length) return; inds.push({ name: c, max: Math.max(...vs) || 1 }); vals.push(Math.round(vs.reduce((a, b) => a + b, 0) / vs.length * 100) / 100); });
  if (inds.length < 3) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูลพอ</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ tooltip: {}, radar: { indicator: inds, radius: '60%', axisName: { fontSize: 8, color: '#64748b' } }, series: [{ type: 'radar', data: [{ value: vals, areaStyle: { color: activeAccent() + '33' }, lineStyle: { color: activeAccent() }, itemStyle: { color: activeAccent() } }] }] });
}

function renderHeatmap(body, block, rows, cols, idx, hasData) {
  if (!hasData || (cols.categorical.length < 2 && !(cols.categorical.length >= 1 && cols.date.length))) { body.innerHTML = '<div class="cb-empty">ต้องมีหมวดหมู่ 2 คอลัมน์</div>'; return; }
  const yCol = cols.categorical[0], xCol = cols.categorical.length >= 2 ? cols.categorical[1] : cols.date[0];
  const numCol = cols.numeric.length ? pick(cols.numeric, idx) : null;
  const topOf = (col, n) => { const m = new Map(); rows.forEach(r => { const v = r[col]; if (v == null || v === '') return; m.set(String(v), (m.get(String(v)) || 0) + 1); }); return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]); };
  const xs = topOf(xCol, 8), ys = topOf(yCol, 6), cell = new Map();
  rows.forEach(r => { const x = r[xCol] != null ? String(r[xCol]) : '', y = r[yCol] != null ? String(r[yCol]) : ''; if (!xs.includes(x) || !ys.includes(y)) return; const v = numCol ? toNumber(r[numCol]) : 1; if (!Number.isFinite(v)) return; const k = x + '\x00' + y; cell.set(k, (cell.get(k) || 0) + v); });
  const data = []; let mxV = 0;
  xs.forEach((x, xi) => ys.forEach((y, yi) => { const v = cell.get(x + '\x00' + y); if (v != null) { data.push([xi, yi, Math.round(v * 100) / 100]); mxV = Math.max(mxV, v); } }));
  if (!data.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ grid: { left: 70, right: 10, top: 8, bottom: 36 }, xAxis: { type: 'category', data: xs, axisLabel: { fontSize: 8, width: 50, overflow: 'truncate' } }, yAxis: { type: 'category', data: ys, axisLabel: { fontSize: 8, width: 60, overflow: 'truncate' } }, visualMap: { show: false, min: 0, max: mxV || 1, inRange: { color: ['#eff6ff', activeAccent()] } }, series: [{ type: 'heatmap', data, label: labelOptionFor(block) || { show: true, fontSize: 7, formatter: p => formatNum(p.value[2]) } }] });
}

function renderHistogram(body, block, rows, cols, idx, hasData) {
  if (!hasData || !cols.numeric.length) { body.innerHTML = '<div class="cb-empty">ต้องมีตัวเลข</div>'; return; }
  const c = fieldFor(block, 'num0', 'numeric', cols, idx), vals = rows.map(r => toNumber(r[c])).filter(Number.isFinite);
  if (!vals.length) { body.innerHTML = '<div class="cb-empty">ไม่มีข้อมูล</div>'; return; }
  const mn = Math.min(...vals), mx = Math.max(...vals), bc = 8, w = (mx - mn) / bc || 1;
  const bins = new Array(bc).fill(0); vals.forEach(v => { let i = Math.floor((v - mn) / w); if (i >= bc) i = bc - 1; bins[i]++; });
  const labels = bins.map((_, i) => `${formatNum(mn + i * w)}–${formatNum(mn + (i + 1) * w)}`);
  const id = ensureChartDom(body, block); if (!window.echarts) return;
  const ch = echarts.init(document.getElementById(id)); chartInstances.set(block.id, ch);
  ch.setOption({ grid: { left: 36, right: 10, top: 12, bottom: 36 }, xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 7, rotate: 30 } }, yAxis: { type: 'value', axisLabel: { fontSize: 9 } }, series: [{ type: 'bar', data: bins, barCategoryGap: '8%', itemStyle: { color: activeAccent(), borderRadius: [2, 2, 0, 0] } }] });
}

function renderTable(body, dataset, hasData) {
  if (!hasData) { body.innerHTML = '<div class="cb-empty">อัปโหลดข้อมูล</div>'; return; }
  const cols = dataset.columns.slice(0, 6), rows = dataset.data.slice(0, 8);
  body.innerHTML = `<div class="cb-table-wrap"><table class="cb-data-table"><thead><tr>${cols.map(c => '<th>' + escapeHtml(c) + '</th>').join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + cols.map(c => '<td>' + escapeHtml(r[c] != null ? r[c] : '') + '</td>').join('') + '</tr>').join('')}</tbody></table></div><div class="cb-table-note">${rows.length} / ${dataset.data.length.toLocaleString()} แถว</div>`;
}

// ─── Block lifecycle ───
function widgetById(id) { return WIDGETS.find(w => w.id === id); }
function snapVal(v) { return Math.round(v / GRID_SNAP) * GRID_SNAP; }
function clampPos(x, y, w, h) { return { x: Math.max(0, Math.min(x, CANVAS_WIDTH - w)), y: Math.max(0, y) }; }
function setBlockGeometry(block, x, y, w, h) { block.style.left = x + 'px'; block.style.top = y + 'px'; block.style.width = w + 'px'; block.style.height = h + 'px'; }

function nextStackPosition(h) {
  const blocks = [...document.querySelectorAll('#canvasGrid .canvas-block')];
  let maxBot = 20;
  blocks.forEach(b => { maxBot = Math.max(maxBot, (parseFloat(b.style.top) || 0) + (parseFloat(b.style.height) || 0) + 20); });
  return { x: 20, y: maxBot };
}

function buildBlockShell(block, widget) {
  block.className = 'canvas-block';
  block.dataset.widgetId = widget.id;
  block.innerHTML = `
    <div class="canvas-block-toolbar">
      <button type="button" class="canvas-block-paint ${(block.dataset.customColor || block.dataset.customBg) ? 'has-custom' : ''}" title="ปรับแต่งสี">🎨</button>
      <button type="button" class="canvas-block-size" data-size="3">S</button>
      <button type="button" class="canvas-block-size" data-size="6">M</button>
      <button type="button" class="canvas-block-size" data-size="12">L</button>
      <button type="button" class="canvas-block-remove">&times;</button>
    </div>
    <div class="canvas-block-head">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${widget.icon}</svg>
      <span class="canvas-block-title">${widget.label}</span>
    </div>
    <div class="canvas-block-body"></div>
    <div class="canvas-block-resize"></div>
  `;
  block.style.background = block.dataset.customBg || '';
  wireBlockControls(block);
}

function wireBlockControls(block) {
  block.querySelector('.canvas-block-remove').addEventListener('click', () => { disposeChartForBlock(block); block.remove(); updateCanvas(); pushHistory(); saveDraft(); });
  const paintBtn = block.querySelector('.canvas-block-paint');
  if (paintBtn) paintBtn.addEventListener('click', (e) => { e.stopPropagation(); openPopover(block, paintBtn); });
  block.querySelectorAll('.canvas-block-size').forEach(btn => {
    btn.addEventListener('click', () => {
      const w = Math.min(QUICK_WIDTHS[btn.dataset.size] || 300, CANVAS_WIDTH - (parseFloat(block.style.left) || 0));
      block.style.width = w + 'px';
      requestAnimationFrame(() => { const inst = chartInstances.get(block.id); if (inst) inst.resize(); });
      pushHistory(); saveDraft();
    });
  });
  makeBlockDraggable(block);
  makeBlockResizable(block);
}

// Drag — the whole card is grabbable (PowerPoint/Canva-style), except the
// toolbar buttons and the resize handle. Scale-compensated so it works at
// any zoom level. A small movement threshold keeps plain clicks (S/M/L,
// paint, remove) from being swallowed as drags.
// Move/up listeners live on `document`, not the block itself — this avoids
// depending on setPointerCapture (which some browsers/automation contexts
// refuse for a given pointer id) and correctly keeps tracking the drag even
// when a fast mouse movement carries the cursor outside the block's bounds.
function makeBlockDraggable(block) {
  block.addEventListener('pointerdown', (e) => {
    if (isFullViewMode) return;
    if (e.button !== 0) return;
    if (e.target.closest('.canvas-block-toolbar, .canvas-block-resize')) return;
    selectBlock(block);
    const startX = e.clientX, startY = e.clientY;
    const origLeft = parseFloat(block.style.left) || 0, origTop = parseFloat(block.style.top) || 0;
    const w = block.offsetWidth, h = block.offsetHeight;
    let moved = false;

    function onMove(ev) {
      const dx = (ev.clientX - startX) / canvasZoom;
      const dy = (ev.clientY - startY) / canvasZoom;
      if (!moved) {
        if (Math.hypot(dx, dy) < 3) return;
        moved = true;
        block.classList.add('is-dragging-free');
      }
      const pos = clampPos(origLeft + dx, origTop + dy, w, h);
      block.style.left = pos.x + 'px';
      block.style.top = pos.y + 'px';
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (!moved) return;
      block.classList.remove('is-dragging-free');
      block.style.left = snapVal(parseFloat(block.style.left)) + 'px';
      block.style.top = snapVal(parseFloat(block.style.top)) + 'px';
      autoGrowCanvas();
      pushHistory(); saveDraft();
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}

// Resize — scale-compensated, same document-level listener pattern as drag
function makeBlockResizable(block) {
  const handle = block.querySelector('.canvas-block-resize');
  if (!handle) return;
  handle.addEventListener('pointerdown', (e) => {
    if (isFullViewMode) return;
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origW = block.offsetWidth, origH = block.offsetHeight;
    const left = parseFloat(block.style.left) || 0;

    function onMove(ev) {
      const dx = (ev.clientX - startX) / canvasZoom;
      const dy = (ev.clientY - startY) / canvasZoom;
      block.style.width = Math.max(MIN_BLOCK_W, Math.min(origW + dx, CANVAS_WIDTH - left)) + 'px';
      block.style.height = Math.max(MIN_BLOCK_H, origH + dy) + 'px';
      const inst = chartInstances.get(block.id); if (inst) inst.resize();
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      block.style.width = Math.max(MIN_BLOCK_W, snapVal(parseFloat(block.style.width))) + 'px';
      block.style.height = Math.max(MIN_BLOCK_H, snapVal(parseFloat(block.style.height))) + 'px';
      const inst = chartInstances.get(block.id); if (inst) inst.resize();
      autoGrowCanvas();
      pushHistory(); saveDraft();
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}

function mountWidget(block, widget, bindIdx) {
  if (!block.id) block.id = 'cb-' + (blockIdCounter++);
  buildBlockShell(block, widget);
  const bi = bindIdx != null ? bindIdx : nextBindingIndex(widget.id);
  block.dataset.bindingIndex = bi;
  renderBlockBody(block, widget, bi);
}

function addWidgetToCanvas(widgetId, posOverride) {
  const widget = widgetById(widgetId);
  if (!widget) return;
  const grid = document.getElementById('canvasGrid');

  // If there are empty placeholder slots from a layout, fill the first one
  // instead of creating a new block — the widget auto-fits the slot's size.
  if (!posOverride) {
    const placeholder = grid.querySelector('.canvas-block.is-placeholder');
    if (placeholder) {
      mountWidget(placeholder, widget);
      updateCanvas(); pushHistory(); saveDraft();
      return placeholder;
    }
  }

  const block = document.createElement('div');
  block.id = 'cb-' + (blockIdCounter++);
  const w = QUICK_WIDTHS[String(widget.span)] || 300;
  const h = widget.h || 200;
  const rawPos = posOverride || nextStackPosition(h);
  const pos = clampPos(rawPos.x, rawPos.y, w, h);
  setBlockGeometry(block, snapVal(pos.x), snapVal(pos.y), w, h);
  if (defaultLabelMode !== 'auto') block.dataset.labelMode = defaultLabelMode;
  grid.appendChild(block);
  mountWidget(block, widget);
  updateCanvas();
  autoGrowCanvas();
  zoomToFit();
  pushHistory(); saveDraft();
  return block;
}

function applyLayout(layoutId) {
  const layout = LAYOUTS.find(l => l.id === layoutId);
  if (!layout) return;
  const grid = document.getElementById('canvasGrid');
  if (grid.children.length > 0 && !confirm('แทนที่ Widget ปัจจุบันด้วย Layout นี้?')) return;
  destroyAllCharts(); grid.innerHTML = ''; resetBindingCounters();
  layout.blocks.forEach(pos => {
    const block = document.createElement('div');
    block.className = 'canvas-block is-placeholder';
    setBlockGeometry(block, pos.x, pos.y, pos.w, pos.h);
    block.innerHTML = `<button class="canvas-block-remove">&times;</button>ลาก Widget มาวาง`;
    wirePlaceholderBlock(block);
    grid.appendChild(block);
  });
  updateCanvas(); zoomToFit(); pushHistory(); saveDraft();
}

function wirePlaceholderBlock(block) {
  block.querySelector('.canvas-block-remove').addEventListener('click', () => { block.remove(); updateCanvas(); pushHistory(); saveDraft(); });
  block.addEventListener('dragover', e => e.preventDefault());
  block.addEventListener('drop', e => {
    e.preventDefault(); e.stopPropagation();
    const w = widgetById(e.dataTransfer.getData('text/plain'));
    if (!w) return;
    mountWidget(block, w);
    updateCanvas(); pushHistory(); saveDraft();
  });
}

function updateCanvas() {
  const vp = document.getElementById('canvasViewport');
  const grid = document.getElementById('canvasGrid');
  vp.classList.toggle('has-blocks', grid.children.length > 0);
}

// Auto-grow canvas height if blocks extend beyond current min-height
function autoGrowCanvas() {
  const grid = document.getElementById('canvasGrid');
  let maxBot = CANVAS_HEIGHT;
  [...grid.querySelectorAll('.canvas-block')].forEach(b => {
    maxBot = Math.max(maxBot, (parseFloat(b.style.top) || 0) + (parseFloat(b.style.height) || 0) + 40);
  });
  grid.style.minHeight = maxBot + 'px';
}

// ─── Auto zoom-to-fit: canvas always fills viewport without scrolling ───
function zoomToFit() {
  const vp = document.getElementById('canvasViewport');
  const grid = document.getElementById('canvasGrid');
  const vpW = vp.clientWidth - 20;
  const vpH = vp.clientHeight - 20;
  if (vpW <= 0 || vpH <= 0) return;

  const gridW = CANVAS_WIDTH;
  const gridH = parseInt(grid.style.minHeight) || CANVAS_HEIGHT;
  const scaleX = vpW / gridW;
  const scaleY = vpH / gridH;
  canvasZoom = Math.min(scaleX, scaleY, 1); // never zoom above 100%
  applyZoom();
}

function applyZoom() {
  const grid = document.getElementById('canvasGrid');
  const label = document.getElementById('zoomLabel');
  grid.style.transform = `scale(${canvasZoom})`;
  // Center the grid in the viewport
  const vp = document.getElementById('canvasViewport');
  const scaledW = CANVAS_WIDTH * canvasZoom;
  const scaledH = (parseInt(grid.style.minHeight) || CANVAS_HEIGHT) * canvasZoom;
  const offsetX = Math.max(0, (vp.clientWidth - scaledW) / 2);
  const offsetY = Math.max(0, (vp.clientHeight - scaledH) / 2);
  grid.style.left = offsetX + 'px';
  grid.style.top = offsetY + 'px';
  if (label) label.textContent = Math.round(canvasZoom * 100) + '%';
  requestAnimationFrame(() => chartInstances.forEach(inst => { try { inst.resize(); } catch (e) {} }));
}

// Canvas drop
function initCanvasDrop() {
  const vp = document.getElementById('canvasViewport');
  const grid = document.getElementById('canvasGrid');
  vp.addEventListener('dragover', e => { e.preventDefault(); vp.classList.add('drag-over'); });
  vp.addEventListener('dragleave', e => { if (e.target === vp) vp.classList.remove('drag-over'); });
  vp.addEventListener('drop', e => {
    vp.classList.remove('drag-over');
    e.preventDefault();
    const widgetId = e.dataTransfer.getData('text/plain');
    const widget = widgetById(widgetId);
    if (!widget) return;
    const gridRect = grid.getBoundingClientRect();
    const w = QUICK_WIDTHS[String(widget.span)] || 300;
    const h = widget.h || 200;
    const x = (e.clientX - gridRect.left) / canvasZoom - w / 2;
    const y = (e.clientY - gridRect.top) / canvasZoom - h / 2;
    addWidgetToCanvas(widgetId, { x, y });
  });
}

// ─── Undo/Redo ───
function getCanvasState() {
  return [...document.getElementById('canvasGrid').children].map(block => ({
    widgetId: block.dataset.widgetId || null,
    x: parseFloat(block.style.left) || 0, y: parseFloat(block.style.top) || 0,
    w: parseFloat(block.style.width) || 300, h: parseFloat(block.style.height) || 140,
    isPlaceholder: block.classList.contains('is-placeholder'),
    bindingIndex: block.dataset.bindingIndex ? Number(block.dataset.bindingIndex) : 0,
    customColor: block.dataset.customColor || null, customBg: block.dataset.customBg || null,
    labelMode: block.dataset.labelMode || null, labelCustom: block.dataset.labelCustom || null,
    fieldOverrides: block.dataset.fieldOverrides || null
  }));
}

function restoreCanvasState(state) {
  isRestoringHistory = true;
  destroyAllCharts();
  const grid = document.getElementById('canvasGrid');
  grid.innerHTML = '';
  state.forEach(item => {
    const block = document.createElement('div');
    setBlockGeometry(block, item.x || 0, item.y || 0, item.w || 300, item.h || 140);
    if (item.isPlaceholder || !item.widgetId) {
      block.className = 'canvas-block is-placeholder';
      block.innerHTML = `<button class="canvas-block-remove">&times;</button>ลาก Widget มาวาง`;
      wirePlaceholderBlock(block); grid.appendChild(block);
    } else {
      const widget = widgetById(item.widgetId);
      if (!widget) return;
      if (item.customColor) block.dataset.customColor = item.customColor;
      if (item.customBg) block.dataset.customBg = item.customBg;
      if (item.labelMode) block.dataset.labelMode = item.labelMode;
      if (item.labelCustom) block.dataset.labelCustom = item.labelCustom;
      if (item.fieldOverrides) block.dataset.fieldOverrides = item.fieldOverrides;
      grid.appendChild(block);
      mountWidget(block, widget, item.bindingIndex);
    }
  });
  updateCanvas(); autoGrowCanvas(); zoomToFit();
  isRestoringHistory = false;
}

function pushHistory() {
  if (isRestoringHistory || suppressHistory) return;
  const state = getCanvasState();
  historyStack = historyStack.slice(0, historyIndex + 1);
  historyStack.push(state);
  if (historyStack.length > 40) historyStack.shift();
  historyIndex = historyStack.length - 1;
  updateUndoRedo();
}
function undo() { if (historyIndex <= 0) return; historyIndex--; restoreCanvasState(historyStack[historyIndex]); updateUndoRedo(); saveDraft(); }
function redo() { if (historyIndex >= historyStack.length - 1) return; historyIndex++; restoreCanvasState(historyStack[historyIndex]); updateUndoRedo(); saveDraft(); }
function updateUndoRedo() {
  const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn');
  if (u) u.disabled = historyIndex <= 0;
  if (r) r.disabled = historyIndex >= historyStack.length - 1;
}

// ─── Autosave ───
// Identifies which uploaded file a draft was built against, so a fresh
// upload never silently resurrects a stale layout built for a different
// dataset (a dataset swap changes what widgets even mean).
function datasetFingerprint() {
  const d = getDataset();
  return d ? `${d.filename || ''}:${d.data.length}:${d.columns.length}` : null;
}

function saveDraft() {
  const draft = {
    name: document.getElementById('dashName').value,
    accent: selectedAccent, presetThemeId: currentPresetThemeId, background: dashboardBg, defaultLabelMode,
    blocks: getCanvasState(), bindingCounters: { ...bindingCounters },
    datasetFingerprint: datasetFingerprint(),
    savedAt: new Date().toISOString()
  };
  try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft)); } catch (e) {}
}

function restoreDraft() {
  let raw; try { raw = localStorage.getItem(AUTOSAVE_KEY); } catch (e) { return false; }
  if (!raw) return false;
  let d; try { d = JSON.parse(raw); } catch (e) { return false; }
  if (!d || !Array.isArray(d.blocks) || !d.blocks.length) return false;

  // Every upload is a fresh start (per user directive): a draft saved
  // against a different file — or against no file at all — never carries
  // over. Only resuming the SAME upload (e.g. an accidental page reload)
  // restores it.
  const currentFp = datasetFingerprint();
  if (d.datasetFingerprint !== currentFp) {
    try { localStorage.removeItem(AUTOSAVE_KEY); } catch (e) {}
    return false;
  }

  document.getElementById('dashName').value = d.name || '';
  if (d.presetThemeId && window.iDashThemes) {
    const t = window.iDashThemes.find(x => x.id === d.presetThemeId);
    if (t) {
      currentPresetThemeId = t.id;
      selectedAccent = t.accent;
      const root = document.querySelector('.custom-content');
      root.style.setProperty('--custom-accent', t.accent);
      root.style.setProperty('--custom-card-bg', t.cardBg || (t.dark ? '#1e293b' : '#ffffff'));
      root.style.setProperty('--custom-card-border', t.border);
      root.style.setProperty('--custom-text', t.textPrimary);
      root.style.setProperty('--custom-text-muted', t.textSecondary);
    }
  } else if (d.accent) {
    selectedAccent = d.accent;
    document.querySelector('.custom-content').style.setProperty('--custom-accent', d.accent);
  }
  if (d.background) { dashboardBg = d.background; applyDashboardBg(); }
  if (d.defaultLabelMode) { defaultLabelMode = d.defaultLabelMode; document.getElementById('labelModeDefault').value = defaultLabelMode; }
  if (d.bindingCounters) Object.assign(bindingCounters, d.bindingCounters);
  document.querySelectorAll('#swatchRow .swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === selectedAccent));
  renderBgSwatches();
  renderThemeGallery();
  restoreCanvasState(d.blocks);
  return true;
}

// ─── Flyout (Widgets / Layouts / Theme tabs) ───
function renderWidgetList() {
  const list = document.getElementById('widgetList');
  list.innerHTML = WIDGET_CATEGORIES.map(cat => {
    const items = WIDGETS.filter(w => w.cat === cat.id);
    if (!items.length) return '';
    return `<div class="widget-cat-group"><div class="widget-cat-label">${cat.label}</div><div class="widget-cat-items">${items.map(w => `<div class="widget-item" draggable="true" data-widget-id="${w.id}" data-label="${w.label.toLowerCase()}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${w.icon}</svg><span>${w.label}</span></div>`).join('')}</div></div>`;
  }).join('');
  list.querySelectorAll('.widget-item').forEach(item => {
    item.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', item.dataset.widgetId); e.dataTransfer.effectAllowed = 'copy'; });
    item.addEventListener('click', () => addWidgetToCanvas(item.dataset.widgetId));
  });
}

function renderLayoutList() {
  const list = document.getElementById('layoutList');
  list.innerHTML = LAYOUTS.map(l => `<div class="layout-item" data-layout-id="${l.id}"><div class="layout-item-preview">${layoutPreviewHTML(l)}</div><div class="layout-item-name">${l.label}</div></div>`).join('');
  list.querySelectorAll('.layout-item').forEach(item => { item.addEventListener('click', () => applyLayout(item.dataset.layoutId)); });
}

// ─── Flyout driven by 4 independent sidebar buttons (Data/Widgets/Layouts/Theme) ───
const PANEL_BUTTON_IDS = { data: 'sidebarDataBtn', widgets: 'sidebarWidgetsBtn', layouts: 'sidebarLayoutsBtn', theme: 'sidebarThemeBtn' };
let activePanel = null;

function showPanel(panel) {
  ['data', 'widgets', 'layouts', 'theme'].forEach(p => {
    document.getElementById('panel' + p[0].toUpperCase() + p.slice(1)).classList.toggle('active', p === panel);
    document.getElementById(PANEL_BUTTON_IDS[p]).classList.toggle('active', p === panel);
  });
  activePanel = panel;
}

function openFlyout(panel) {
  document.getElementById('widgetFlyout').classList.add('open');
  document.getElementById('widgetFlyoutOverlay').hidden = false;
  requestAnimationFrame(() => document.getElementById('widgetFlyoutOverlay').classList.add('open'));
  showPanel(panel);
}
function closeFlyout() {
  document.getElementById('widgetFlyout').classList.remove('open');
  document.getElementById('widgetFlyoutOverlay').classList.remove('open');
  Object.values(PANEL_BUTTON_IDS).forEach(id => document.getElementById(id).classList.remove('active'));
  activePanel = null;
  setTimeout(() => { document.getElementById('widgetFlyoutOverlay').hidden = true; }, 200);
}
function initFlyout() {
  Object.entries(PANEL_BUTTON_IDS).forEach(([panel, btnId]) => {
    document.getElementById(btnId).addEventListener('click', () => {
      const isOpen = document.getElementById('widgetFlyout').classList.contains('open');
      if (isOpen && activePanel === panel) closeFlyout();
      else openFlyout(panel);
    });
  });
  document.getElementById('widgetFlyoutOverlay').addEventListener('click', closeFlyout);
  openFlyout('widgets');
}

// ─── Data-first widget creation: tick columns → system suggests only the
// widgets whose required roles that selection can actually fill, click one
// to insert it pre-bound. Complements the existing widget-first flow
// (drag a widget, then override its columns one at a time in the popover) —
// "อยากให้เลือกได้ทั้งดาต้าคอลัมน์ไหน ไปทำ widget ไหน แบบอิสระเต็มที่".
const DATA_KIND_LABEL_TH = { numeric: 'ตัวเลข', date: 'วันที่', categorical: 'ข้อความ/หมวดหมู่' };

function columnKindMap(dataset) {
  const cols = inferColumns(dataset);
  const map = {};
  cols.numeric.forEach(c => { map[c] = 'numeric'; });
  cols.date.forEach(c => { map[c] = 'date'; });
  cols.categorical.forEach(c => { map[c] = 'categorical'; });
  return map;
}

function matchWidgetsForSelection(selectedCols, kindMap) {
  const counts = { numeric: 0, date: 0, categorical: 0 };
  selectedCols.forEach(c => { const k = kindMap[c]; if (k) counts[k]++; });
  if (counts.numeric + counts.date + counts.categorical === 0) return [];
  return Object.keys(WIDGET_FIELD_SPECS).filter(widgetId => {
    const need = { numeric: 0, date: 0, categorical: 0 };
    WIDGET_FIELD_SPECS[widgetId].forEach(r => { if (!/ถ้ามี/.test(r.label)) need[r.kind]++; });
    return need.numeric <= counts.numeric && need.date <= counts.date && need.categorical <= counts.categorical;
  });
}

function initDataPanel() {
  const listEl = document.getElementById('dataFieldList');
  const suggestEl = document.getElementById('dataWidgetSuggestions');
  const dataset = getDataset();
  if (!dataset) {
    listEl.innerHTML = '<div class="palette-panel-hint">ยังไม่มีข้อมูลเชื่อมต่อ — อัปโหลดไฟล์ก่อน</div>';
    suggestEl.innerHTML = '';
    return;
  }
  const kinds = inferColumns(dataset);
  const kindMap = columnKindMap(dataset);
  const groups = [['numeric', kinds.numeric], ['date', kinds.date], ['categorical', kinds.categorical]]
    .filter(([, cols]) => cols.length > 0);

  listEl.innerHTML = groups.map(([kind, cols]) => `
    <div class="data-field-group">
      <div class="data-field-group-label">${DATA_KIND_LABEL_TH[kind]}</div>
      ${cols.map(c => `
        <label class="data-field-check">
          <input type="checkbox" value="${c.replace(/"/g, '&quot;')}">
          <span>${c}</span>
        </label>
      `).join('')}
    </div>
  `).join('');

  function refreshSuggestions() {
    const selected = [...listEl.querySelectorAll('input[type=checkbox]:checked')].map(cb => cb.value);
    if (selected.length === 0) {
      suggestEl.innerHTML = '<div class="palette-panel-hint">ติ๊กเลือกคอลัมน์ด้านบน ระบบจะแนะนำ Widget ที่ใช้ได้</div>';
      return;
    }
    const matches = matchWidgetsForSelection(selected, kindMap);
    if (matches.length === 0) {
      suggestEl.innerHTML = '<div class="palette-panel-hint">ไม่มี Widget ที่เหมาะกับคอลัมน์ที่เลือก ลองเลือกชุดอื่น</div>';
      return;
    }
    suggestEl.innerHTML = `<div class="data-field-group-label">สร้างเป็น...</div>` + matches.map(id => {
      const w = widgetById(id);
      return `<button type="button" class="data-widget-suggest" data-widget-id="${id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${w.icon}</svg>
        ${w.label}
      </button>`;
    }).join('');
    suggestEl.querySelectorAll('.data-widget-suggest').forEach(btn => {
      btn.addEventListener('click', () => addWidgetFromSelection(btn.dataset.widgetId, selected, kindMap));
    });
  }

  listEl.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', refreshSuggestions));
  refreshSuggestions();
}

function addWidgetFromSelection(widgetId, selectedCols, kindMap) {
  const pools = { numeric: [], date: [], categorical: [] };
  selectedCols.forEach(c => { const k = kindMap[c]; if (k) pools[k].push(c); });

  const block = addWidgetToCanvas(widgetId);
  if (!block) return;
  (WIDGET_FIELD_SPECS[widgetId] || []).forEach(role => {
    const col = pools[role.kind] && pools[role.kind].shift();
    if (col) setFieldOverride(block, role.role, col);
  });
  rerenderBlock(block);
  pushHistory(); saveDraft();
}

function initWidgetSearch() {
  document.getElementById('widgetSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.widget-item').forEach(item => { item.classList.toggle('hidden-by-search', q.length > 0 && !item.dataset.label.includes(q)); });
    document.querySelectorAll('.widget-cat-group').forEach(g => { g.style.display = [...g.querySelectorAll('.widget-item')].some(i => !i.classList.contains('hidden-by-search')) ? '' : 'none'; });
  });
}

// ─── Preset theme gallery (same 216-theme library as the AI modules —
// "อยากให้มี theme ให้เลือกหลากหลายให้เท่าหรือมากกว่าโมดูลอื่นๆ") ───
const THEME_GALLERY_TABS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'colorful', label: 'Colorful' },
  { id: 'pastel', label: 'Pastel' },
  { id: 'pro', label: 'Professional' }
];
let themeGalleryTab = 'all';

function themeGalleryThemes(tab) {
  const themes = window.iDashThemes || [];
  return tab === 'all' ? themes : themes.filter(t => t.category === tab);
}

function renderThemeGallery() {
  const grid = document.getElementById('themeGalleryGrid');
  if (!grid) return;
  grid.innerHTML = themeGalleryThemes(themeGalleryTab).map(t => `
    <button type="button" class="theme-gallery-swatch ${t.id === currentPresetThemeId ? 'selected' : ''}" data-theme-id="${t.id}" title="${t.name}" style="background:${t.bg || (t.dark ? '#1e293b' : '#fff')}">
      <span class="tgs-dot" style="background:${t.accent}"></span>
    </button>
  `).join('');
  grid.querySelectorAll('.theme-gallery-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = (window.iDashThemes || []).find(x => x.id === btn.dataset.themeId);
      if (t) applyPresetTheme(t);
    });
  });
}

function initThemeGallery() {
  const tabsEl = document.getElementById('themeGalleryTabs');
  if (!tabsEl) return;
  const themes = window.iDashThemes || [];
  tabsEl.innerHTML = THEME_GALLERY_TABS.map(tab => {
    const count = tab.id === 'all' ? themes.length : themes.filter(t => t.category === tab.id).length;
    return `<button type="button" class="theme-gallery-tab ${tab.id === 'all' ? 'active' : ''}" data-tab="${tab.id}">${tab.label} <span>${count}</span></button>`;
  }).join('');
  tabsEl.querySelectorAll('.theme-gallery-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      themeGalleryTab = btn.dataset.tab;
      tabsEl.querySelectorAll('.theme-gallery-tab').forEach(b => b.classList.toggle('active', b === btn));
      renderThemeGallery();
    });
  });
  renderThemeGallery();
}

function applyPresetTheme(theme) {
  currentPresetThemeId = theme.id;
  selectedAccent = theme.accent;
  const root = document.querySelector('.custom-content');
  root.style.setProperty('--custom-accent', theme.accent);
  root.style.setProperty('--custom-card-bg', theme.cardBg || (theme.dark ? '#1e293b' : '#ffffff'));
  root.style.setProperty('--custom-card-border', theme.border);
  root.style.setProperty('--custom-text', theme.textPrimary);
  root.style.setProperty('--custom-text-muted', theme.textSecondary);
  dashboardBg = { color: theme.bg, image: null };
  applyDashboardBg();
  document.querySelectorAll('#swatchRow .swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === theme.accent));
  renderBgSwatches();
  renderThemeGallery();
  rerenderAll();
  saveDraft();
}

// ─── Theme panel (accent color + background) ───
function initSwatches() {
  const row = document.getElementById('swatchRow');
  row.innerHTML = SWATCHES.map((c, i) => `<button type="button" class="swatch ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c}"></button>`).join('') + `<button type="button" class="swatch-add" id="swatchAddBtn">+</button>`;
  row.querySelectorAll('.swatch[data-color]').forEach(btn => { btn.addEventListener('click', () => setAccent(btn.dataset.color)); });
  const addBtn = document.getElementById('swatchAddBtn');
  const ci = document.createElement('input'); ci.type = 'color'; ci.style.display = 'none'; addBtn.after(ci);
  addBtn.addEventListener('click', () => ci.click());
  ci.addEventListener('input', () => setAccent(ci.value));
}

function setAccent(color) {
  selectedAccent = color;
  currentPresetThemeId = null; // manual accent pick detaches from any preset theme
  document.querySelector('.custom-content').style.setProperty('--custom-accent', color);
  document.querySelectorAll('#swatchRow .swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === color));
  renderThemeGallery();
  rerenderAll(); saveDraft();
}

function rerenderAll() {
  document.querySelectorAll('#canvasGrid .canvas-block[data-widget-id]').forEach(block => {
    const w = widgetById(block.dataset.widgetId);
    if (w) renderBlockBody(block, w, Number(block.dataset.bindingIndex || 0));
  });
}

function applyDashboardBg() {
  // The grid physically moves between #canvasViewport (editor) and
  // #csFullviewCanvas (view-only) — style whichever one is currently
  // visible so the background survives the move in both directions.
  const target = isFullViewMode ? document.getElementById('csFullviewCanvas') : document.getElementById('canvasViewport');
  if (!target) return;
  [document.getElementById('canvasViewport'), document.getElementById('csFullviewCanvas')].forEach(el => {
    if (el) { el.style.backgroundImage = ''; el.style.backgroundColor = ''; el.classList.remove('has-custom-bg'); }
  });
  if (dashboardBg.image) { target.style.backgroundImage = `url(${dashboardBg.image})`; target.style.backgroundSize = 'cover'; target.style.backgroundPosition = 'center'; target.classList.add('has-custom-bg'); }
  else if (dashboardBg.color) { target.style.backgroundColor = dashboardBg.color; target.classList.add('has-custom-bg'); }
}

function renderBgSwatches() {
  const row = document.getElementById('bgSwatchRow');
  row.innerHTML = `<button type="button" class="swatch ${!dashboardBg.color && !dashboardBg.image ? 'selected' : ''}" data-bg="" style="background:#fff;box-shadow:inset 0 0 0 1px var(--border)" title="ค่าเริ่มต้น"></button>` +
    BG_SWATCHES.map(c => `<button type="button" class="swatch ${c === dashboardBg.color ? 'selected' : ''}" data-bg="${c}" style="background:${c}"></button>`).join('') +
    `<button type="button" class="swatch-add" id="bgSwatchAddBtn">+</button>`;
  row.querySelectorAll('.swatch[data-bg]').forEach(btn => { btn.addEventListener('click', () => { dashboardBg = { color: btn.dataset.bg || null, image: null }; applyDashboardBg(); renderBgSwatches(); saveDraft(); }); });
  const addBtn = document.getElementById('bgSwatchAddBtn');
  const ci = document.createElement('input'); ci.type = 'color'; ci.style.display = 'none'; addBtn.after(ci);
  addBtn.addEventListener('click', () => ci.click());
  ci.addEventListener('input', () => { dashboardBg = { color: ci.value, image: null }; applyDashboardBg(); renderBgSwatches(); saveDraft(); });
}

function initBgSettings() {
  renderBgSwatches();
  const fi = document.getElementById('bgImageInput');
  document.getElementById('bgImageBtn').addEventListener('click', () => fi.click());
  document.getElementById('bgImageClearBtn').addEventListener('click', () => { dashboardBg = { color: null, image: null }; applyDashboardBg(); renderBgSwatches(); document.getElementById('bgImageClearBtn').hidden = true; fi.value = ''; saveDraft(); });
  fi.addEventListener('change', () => {
    const file = fi.files && fi.files[0]; if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast('รูปใหญ่เกินไป (max 3MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => { dashboardBg = { color: null, image: reader.result }; applyDashboardBg(); renderBgSwatches(); document.getElementById('bgImageClearBtn').hidden = false; saveDraft(); };
    reader.readAsDataURL(file);
  });
  document.getElementById('labelModeDefault').addEventListener('change', e => { defaultLabelMode = e.target.value; saveDraft(); });
}

// ─── Per-widget popover ───
let activePopoverBlock = null;
function openPopover(block, anchor) {
  activePopoverBlock = block;
  const pop = document.getElementById('widgetPopover');
  renderPopoverDataFields(block);
  renderPopoverSwatches(block);
  document.getElementById('blockLabelMode').value = block.dataset.labelMode || 'auto';
  document.getElementById('blockLabelCustom').value = block.dataset.labelCustom || '';
  document.getElementById('blockLabelCustomWrap').hidden = block.dataset.labelMode !== 'custom';
  pop.hidden = false;
  const r = anchor.getBoundingClientRect();
  pop.style.left = Math.min(r.right - 250, window.innerWidth - 260) + 'px';
  pop.style.top = Math.min(r.bottom + 6, window.innerHeight - 300) + 'px';
}
function closePopover() { document.getElementById('widgetPopover').hidden = true; activePopoverBlock = null; }

// User-facing column pickers — one <select> per role the widget type uses
// (see WIDGET_FIELD_SPECS). "อัตโนมัติ" keeps the system's own pick; any
// other choice is a hard override that survives re-render, undo/redo, and
// autosave via block.dataset.fieldOverrides.
function renderPopoverDataFields(block) {
  const wrap = document.getElementById('blockDataFieldsWrap');
  const list = document.getElementById('blockDataFields');
  const widget = widgetById(block.dataset.widgetId);
  const spec = widget ? WIDGET_FIELD_SPECS[widget.id] : null;
  const dataset = getDataset();
  if (!widget || !spec || !dataset) { wrap.hidden = true; list.innerHTML = ''; return; }

  const cols = inferColumns(dataset);
  const overrides = getFieldOverrides(block);
  wrap.hidden = false;
  list.innerHTML = spec.map(f => {
    const options = (cols[f.kind] || []).map(col =>
      `<option value="${escapeHtml(col)}" ${overrides[f.role] === col ? 'selected' : ''}>${escapeHtml(col)}</option>`
    ).join('');
    return `<div class="data-field-row">
      <label class="data-field-row-label">${escapeHtml(f.label)}</label>
      <select class="form-select" data-field-role="${f.role}" data-field-kind="${f.kind}">
        <option value="">อัตโนมัติ</option>
        ${options}
      </select>
    </div>`;
  }).join('');

  list.querySelectorAll('select[data-field-role]').forEach(sel => {
    sel.addEventListener('change', () => {
      setFieldOverride(block, sel.dataset.fieldRole, sel.value);
      rerenderBlock(block);
      pushHistory(); saveDraft();
    });
  });
}

function renderPopoverSwatches(block) {
  const curC = block.dataset.customColor || '', curBg = block.dataset.customBg || '';
  const cr = document.getElementById('blockColorRow');
  cr.innerHTML = SWATCHES.map(c => `<button type="button" class="swatch ${c === curC ? 'selected' : ''}" data-color="${c}" style="background:${c}"></button>`).join('') + `<button type="button" class="swatch-add" id="blockColorAddBtn">+</button>`;
  cr.querySelectorAll('.swatch[data-color]').forEach(btn => { btn.addEventListener('click', () => setBlockColor(block, btn.dataset.color)); });
  const cAdd = document.getElementById('blockColorAddBtn');
  const ci = document.createElement('input'); ci.type = 'color'; ci.style.display = 'none'; cAdd.after(ci); cAdd.addEventListener('click', () => ci.click()); ci.addEventListener('input', () => setBlockColor(block, ci.value));

  const br = document.getElementById('blockBgRow');
  br.innerHTML = `<button type="button" class="swatch ${!curBg ? 'selected' : ''}" data-bg="" style="background:#fff;box-shadow:inset 0 0 0 1px var(--border)"></button>` + BG_SWATCHES.map(c => `<button type="button" class="swatch ${c === curBg ? 'selected' : ''}" data-bg="${c}" style="background:${c}"></button>`).join('') + `<button type="button" class="swatch-add" id="blockBgAddBtn">+</button>`;
  br.querySelectorAll('.swatch[data-bg]').forEach(btn => { btn.addEventListener('click', () => setBlockBg(block, btn.dataset.bg)); });
  const bAdd = document.getElementById('blockBgAddBtn');
  const bi = document.createElement('input'); bi.type = 'color'; bi.style.display = 'none'; bAdd.after(bi); bAdd.addEventListener('click', () => bi.click()); bi.addEventListener('input', () => setBlockBg(block, bi.value));
}

function setBlockColor(block, color) { if (color) block.dataset.customColor = color; else delete block.dataset.customColor; renderPopoverSwatches(block); rerenderBlock(block); saveDraft(); }
function setBlockBg(block, color) { if (color) { block.dataset.customBg = color; block.style.background = color; } else { delete block.dataset.customBg; block.style.background = ''; } renderPopoverSwatches(block); saveDraft(); }
function rerenderBlock(block) { const w = widgetById(block.dataset.widgetId); if (w) renderBlockBody(block, w, Number(block.dataset.bindingIndex || 0)); }

function initPopover() {
  document.getElementById('widgetPopoverClose').addEventListener('click', closePopover);
  document.getElementById('blockLabelMode').addEventListener('change', e => { if (!activePopoverBlock) return; activePopoverBlock.dataset.labelMode = e.target.value; document.getElementById('blockLabelCustomWrap').hidden = e.target.value !== 'custom'; rerenderBlock(activePopoverBlock); saveDraft(); });
  document.getElementById('blockLabelCustom').addEventListener('input', e => { if (!activePopoverBlock) return; activePopoverBlock.dataset.labelCustom = e.target.value; rerenderBlock(activePopoverBlock); saveDraft(); });
  document.addEventListener('click', e => { const pop = document.getElementById('widgetPopover'); if (pop.hidden) return; if (pop.contains(e.target) || e.target.closest('.canvas-block-paint')) return; closePopover(); });
}

// ─── Toolbar (zoom + clear) ───
function initToolbar() {
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('redoBtn').addEventListener('click', redo);
  document.getElementById('zoomInBtn').addEventListener('click', () => { canvasZoom = Math.min(1.5, canvasZoom + 0.1); applyZoom(); });
  document.getElementById('zoomOutBtn').addEventListener('click', () => { canvasZoom = Math.max(0.2, canvasZoom - 0.1); applyZoom(); });
  document.getElementById('zoomFitBtn').addEventListener('click', zoomToFit);
  document.getElementById('clearCanvasBtn').addEventListener('click', () => {
    if (!document.querySelectorAll('#canvasGrid .canvas-block').length) return;
    if (!confirm('ล้าง Widget ทั้งหมดบน Canvas?')) return;
    destroyAllCharts(); document.getElementById('canvasGrid').innerHTML = ''; resetBindingCounters();
    updateCanvas(); pushHistory(); saveDraft();
  });
  initKeyboardShortcuts();
}

// ─── Keyboard shortcuts (standard desktop app behaviour) ───
// In a design tool (Canva/PowerPoint), Ctrl+Z always undoes the canvas action
// — it is NOT the browser's text-field undo. So we intercept ALL Ctrl+Z/Y
// regardless of focus, and blur the active input so the next shortcut fires
// without having to click the canvas first.
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    const ctrl = e.ctrlKey || e.metaKey;
    const key = e.key;

    // Ctrl+Z — always canvas undo (blur input so user doesn't need to click canvas)
    if (ctrl && !e.shiftKey && key.toLowerCase() === 'z') {
      e.preventDefault();
      if (inInput) document.activeElement.blur();
      undo(); return;
    }
    // Ctrl+Y / Ctrl+Shift+Z — always canvas redo
    if (ctrl && (key.toLowerCase() === 'y' || (e.shiftKey && key.toLowerCase() === 'z'))) {
      e.preventDefault();
      if (inInput) document.activeElement.blur();
      redo(); return;
    }
    // Ctrl+D — duplicate selected widget
    if (ctrl && key.toLowerCase() === 'd') {
      e.preventDefault(); duplicateSelectedBlock(); return;
    }
    // Ctrl+A — select all (prevent browser default, select last block)
    if (ctrl && key.toLowerCase() === 'a' && !inInput) {
      e.preventDefault();
      const blocks = document.querySelectorAll('#canvasGrid .canvas-block[data-widget-id]');
      if (blocks.length) selectBlock(blocks[blocks.length - 1]);
      return;
    }
    // Ctrl+P — print to paper (matches the OS shortcut users already know)
    if (ctrl && key.toLowerCase() === 'p' && !document.getElementById('csFullview').hidden) {
      e.preventDefault(); printDashboard(); return;
    }
    // Delete / Backspace — remove selected widget
    if ((key === 'Delete' || key === 'Backspace') && !inInput) {
      e.preventDefault(); deleteSelectedBlock(); return;
    }
    // Escape — deselect / close popover / close flyout / exit fullview
    if (key === 'Escape') {
      if (!document.getElementById('csFullview').hidden) { exitFullView(); return; }
      if (!document.getElementById('widgetPopover').hidden) { closePopover(); return; }
      if (selectedBlock) { deselectAll(); return; }
      if (document.getElementById('widgetFlyout').classList.contains('open')) { closeFlyout(); return; }
    }
    // Arrow keys — nudge selected widget by 10px (grid snap)
    if (!inInput && selectedBlock && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
      const step = e.shiftKey ? 50 : GRID_SNAP;
      switch (key) {
        case 'ArrowUp':    nudgeSelectedBlock(0, -step); break;
        case 'ArrowDown':  nudgeSelectedBlock(0, step); break;
        case 'ArrowLeft':  nudgeSelectedBlock(-step, 0); break;
        case 'ArrowRight': nudgeSelectedBlock(step, 0); break;
      }
      return;
    }
  });

  // Click on canvas area → blur inputs so shortcuts work immediately
  document.getElementById('canvasViewport').addEventListener('pointerdown', e => {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    if (e.target.closest('.canvas-block')) return;
    deselectAll();
  });
}

// ─── "Create Dashboard" → full-screen immersive view ───
function enterFullView() {
  const blocks = getCanvasState().filter(b => b.widgetId);
  if (!blocks.length) { showToast('เพิ่ม Widget อย่างน้อย 1 ชิ้นก่อน'); return; }
  let name = document.getElementById('dashName').value.trim();
  if (!name) { name = 'My Dashboard'; document.getElementById('dashName').value = name; }
  saveDraft();

  // Save to localStorage list
  let list = []; try { list = JSON.parse(localStorage.getItem('idash.customDashboards') || '[]'); } catch (e) {}
  list.push({ id: 'dash-' + Date.now(), name, accent: selectedAccent, presetThemeId: currentPresetThemeId, background: dashboardBg, blocks: getCanvasState(), createdAt: new Date().toISOString() });
  try { localStorage.setItem('idash.customDashboards', JSON.stringify(list)); } catch (e) {}

  // Lock the canvas: no drag, no resize, no selection until the user goes
  // back to edit. deselectAll() also strips any lingering .is-selected
  // border so nothing looks "grabbed" in the view-only screen.
  isFullViewMode = true;
  deselectAll();

  // Show fullview overlay
  const fv = document.getElementById('csFullview');
  document.getElementById('csFullviewTitle').textContent = name;
  fv.hidden = false;

  // Move (not clone) the live grid into the fullview container — keeps the
  // already-rendered ECharts instances intact. Cloning a <canvas> drops its
  // drawn pixels, which left chart widgets blank in the fullview.
  const grid = document.getElementById('canvasGrid');
  const fvCanvas = document.getElementById('csFullviewCanvas');
  fvCanvas.appendChild(grid);
  fvCanvas.classList.add('cs-fullview-active');
  applyDashboardBg(); // canvasViewport is now empty — re-target the fullview canvas

  requestAnimationFrame(() => {
    const vpW = fvCanvas.clientWidth;
    const vpH = fvCanvas.clientHeight;
    const gridH = parseInt(grid.style.minHeight) || CANVAS_HEIGHT;
    const scale = Math.min(vpW / CANVAS_WIDTH, vpH / gridH, 1);
    grid.style.transform = `scale(${scale})`;
    grid.style.left = Math.max(0, (vpW - CANVAS_WIDTH * scale) / 2) + 'px';
    grid.style.top = Math.max(0, (vpH - gridH * scale) / 2) + 'px';
    chartInstances.forEach(inst => { try { inst.resize(); } catch (e) {} });
  });

  showToast(`"${name}" พร้อมใช้งานแล้ว`);
}

function exitFullView() {
  isFullViewMode = false;
  const grid = document.getElementById('canvasGrid');
  const vp = document.getElementById('canvasViewport');
  vp.appendChild(grid);
  document.getElementById('csFullviewCanvas').classList.remove('cs-fullview-active');
  document.getElementById('csFullview').hidden = true;
  applyDashboardBg(); // re-target the editor viewport now that it's live again
  zoomToFit();
}

// ─── Export functions (fullview) ───

// "บันทึกเป็นภาพ" — one button, format chosen from the adjacent <select>
// (PNG or JPG), mirrors the format toggle already used in Studio's export.
function exportImages(fmt) {
  const charts = [...chartInstances.entries()];
  if (!charts.length) { showToast('ไม่มีกราฟที่จะ export'); return; }
  const type = fmt === 'jpg' ? 'jpeg' : 'png';
  const ext = fmt === 'jpg' ? 'jpg' : 'png';
  charts.forEach(([blockId, inst]) => {
    try {
      const url = inst.getDataURL({ type, pixelRatio: 2, backgroundColor: '#fff' });
      const a = document.createElement('a');
      a.download = (blockId || 'chart') + '.' + ext;
      a.href = url;
      a.click();
    } catch (e) {}
  });
  showToast(`Export ${charts.length} กราฟเป็น ${ext.toUpperCase()} แล้ว`);
}

// "พิมพ์" — opens the OS print dialog for output to a physical printer
// (or the OS's own "Save as PDF" driver, if the user picks that from
// the dialog's printer dropdown — that choice belongs to the OS, not us).
function printDashboard() {
  const fv = document.getElementById('csFullview');
  const wasHidden = fv.hidden;
  if (wasHidden) fv.hidden = false;

  // The print stylesheet drops .cs-fullview's position:fixed sizing (a
  // print page has no "viewport" for flex:1 to resolve against), so the
  // canvas needs an explicit pixel size — pass the real, unscaled design
  // canvas dimensions in as CSS vars.
  const grid = document.getElementById('canvasGrid');
  const gridH = parseInt(grid.style.minHeight) || CANVAS_HEIGHT;
  document.documentElement.style.setProperty('--print-grid-w', CANVAS_WIDTH + 'px');
  document.documentElement.style.setProperty('--print-grid-h', gridH + 'px');

  fv.classList.add('cs-printing');
  const cleanup = () => {
    fv.classList.remove('cs-printing');
    document.documentElement.style.removeProperty('--print-grid-w');
    document.documentElement.style.removeProperty('--print-grid-h');
    if (wasHidden) fv.hidden = true;
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  setTimeout(() => window.print(), 100);
}

// "บันทึกเป็น PDF" — a real .pdf file, downloaded directly with no OS
// print dialog in between. Rasterizes the live dashboard DOM (html2canvas)
// so it also works for HTML-only widgets (KPI cards etc.), not just
// ECharts canvases, then embeds that single image into a jsPDF document
// sized to match — same exact colors/layout the user sees on screen.
async function savePDF() {
  if (!window.html2canvas || !window.jspdf) { showToast('โหลดไลบรารี PDF ไม่สำเร็จ ลองรีเฟรชหน้า'); return; }
  const grid = document.getElementById('canvasGrid');
  if (!grid.querySelector('.canvas-block[data-widget-id]')) { showToast('ไม่มี Widget ให้บันทึกเป็น PDF'); return; }
  showToast('กำลังสร้าง PDF...');

  const savedTransform = grid.style.transform, savedLeft = grid.style.left, savedTop = grid.style.top;
  const gridH = parseInt(grid.style.minHeight) || CANVAS_HEIGHT;
  grid.style.transform = 'none'; grid.style.left = '0'; grid.style.top = '0';

  const bgColor = dashboardBg.color || (isFullViewMode ? getComputedStyle(document.getElementById('csFullviewCanvas')).backgroundColor : '#ffffff') || '#ffffff';

  try {
    const canvas = await html2canvas(grid, { backgroundColor: bgColor, scale: 2, width: CANVAS_WIDTH, height: gridH, useCORS: true });
    const { jsPDF } = window.jspdf;
    const orientation = CANVAS_WIDTH >= gridH ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ orientation, unit: 'px', format: [CANVAS_WIDTH, gridH] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, CANVAS_WIDTH, gridH);
    const name = document.getElementById('csFullviewTitle').textContent || 'dashboard';
    pdf.save(name.replace(/[^a-zA-Z0-9ก-๙_-]/g, '_') + '.pdf');
    showToast('บันทึกเป็น PDF สำเร็จ');
  } catch (e) {
    showToast('สร้าง PDF ไม่สำเร็จ: ' + e.message);
  } finally {
    grid.style.transform = savedTransform; grid.style.left = savedLeft; grid.style.top = savedTop;
  }
}

function exportJSON() {
  const name = document.getElementById('csFullviewTitle').textContent || 'dashboard';
  const data = {
    name, accent: selectedAccent, background: dashboardBg,
    blocks: getCanvasState(),
    dataset: getDataset() ? { filename: getDataset().filename, columns: getDataset().columns, rowCount: getDataset().data.length } : null,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.download = name.replace(/[^a-zA-Z0-9ก-๙_-]/g, '_') + '.json';
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Export JSON สำเร็จ');
}

function exportExcel() {
  const dataset = getDataset();
  if (!dataset || !window.XLSX) { showToast('ต้องมีข้อมูลและ SheetJS'); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dataset.data.slice(0, 10000));
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  const name = document.getElementById('csFullviewTitle').textContent || 'dashboard';
  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9ก-๙_-]/g, '_') + '.xlsx');
  showToast('Export Excel สำเร็จ');
}

function initActions() {
  document.getElementById('newDashboardBtn').addEventListener('click', enterFullView);
  document.getElementById('csFullviewBack').addEventListener('click', exitFullView);
  document.getElementById('csFullviewEdit').addEventListener('click', exitFullView);
  document.getElementById('dashName').addEventListener('input', saveDraft);
  document.getElementById('csExportImage').addEventListener('click', () => {
    exportImages(document.getElementById('csExportImageFormat').value);
  });
  document.getElementById('csPrint').addEventListener('click', printDashboard);
  document.getElementById('csExportPdf').addEventListener('click', savePDF);
  document.getElementById('csExportJson').addEventListener('click', exportJSON);
  document.getElementById('csExportExcel').addEventListener('click', exportExcel);
}

function initDataBanner() {
  const dataset = getDataset();
  if (!dataset) return;
  document.getElementById('dataBannerFilename').textContent = dataset.filename || 'ข้อมูล';
  document.getElementById('dataBannerMeta').textContent = `(${dataset.data.length.toLocaleString()} แถว, ${dataset.columns.length} คอลัมน์)`;
  document.getElementById('dataBanner').hidden = false;
  const n = document.getElementById('dashName');
  if (!n.value && dataset.filename) n.value = dataset.filename.replace(/\.[^.]+$/, '');
}

function showToast(msg) {
  const t = document.getElementById('customToast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { t.hidden = true; }, 2500);
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  renderWidgetList();
  renderLayoutList();
  renderTemplateList();
  initFlyout();
  initWidgetSearch();
  initSwatches();
  initThemeGallery();
  initBgSettings();
  initCanvasDrop();
  initToolbar();
  initActions();
  initPopover();
  initDataBanner();
  initDataPanel();

  const restored = restoreDraft();
  if (restored) showToast('กู้คืนฉบับร่างล่าสุด');
  else updateCanvas();
  pushHistory();
  zoomToFit();

  // Re-fit on window resize
  window.addEventListener('resize', () => { zoomToFit(); });
});
