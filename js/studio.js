/**
 * iDash Dashboard Studio — renderer (doc 09 §5: Studio is a pure function
 * of the spec; D34 — no design decisions here, only rendering of what
 * modules ⑤⑦⑧ already decided).
 *
 * Interactive filters (M6): when the raw dataset + engine context were
 * persisted by the generation page, the filter bar re-runs the same DET
 * engines (④⑤⑦) over the filtered rows — every number on screen is a real
 * recomputation, never a client-side approximation of one.
 */

// The spec currently on screen — filter recomputes swap this out, and the
// export menu always reads the live value.
let currentSpec = null;
let currentInfo = null;

document.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('idash.dashboardSpec');
  const meta = sessionStorage.getItem('idash.dashboardMeta');

  if (!raw) {
    document.getElementById('studioEmpty').hidden = false;
    const exportWrap = document.getElementById('studioExport');
    if (exportWrap) exportWrap.hidden = true;
    return;
  }

  const spec = JSON.parse(raw);
  const info = meta ? JSON.parse(meta) : {};
  currentSpec = spec;
  currentInfo = info;

  if (info.styleFamilyId) applyStyleFamily(info.styleFamilyId, info.theme);
  if (info.theme) applyAccentTheme(info.theme);

  document.getElementById('studioTitle').textContent = info.domainNameTH ? `Dashboard — ${info.domainNameTH}` : 'Dashboard';
  document.getElementById('studioSubtitle').textContent = info.filename
    ? `สร้างจาก ${info.filename} · ${info.confidencePct}% มั่นใจ`
      + (info.templateName ? ` · Template: ${info.templateName}` : '')
      + (info.styleFamilyName ? ` · Style: ${info.styleFamilyName}` : '')
    : '';
  renderDomainBadge(info.domainId);

  if (!spec.pages || spec.pages.length === 0) {
    document.getElementById('studioEmpty').hidden = false;
    document.getElementById('studioEmpty').querySelector('.studio-empty-desc').textContent =
      'ข้อมูลนี้มี KPI ไม่พอให้ AI ประกอบ Dashboard ได้ — ลองไฟล์ที่มีคอลัมน์ตัวชี้วัดมากขึ้น';
    return;
  }

  renderTabs(spec.pages);
  renderPages(spec.pages);
  if (spec.pages.length > 0) activatePage(spec.pages[0].id);
  initExportMenu(info);

  // Insight Story panel removed from all templates (user directive
  // 2026-07-18): the DET template narration produced junk lines like
  // "derived.record_count ต่ำกว่าเป้า (NaN%)" — target-variance phrasing on
  // KPIs that have no real target. Data stays in sessionStorage; re-enable
  // only after the narration engine refuses target claims without targets.

  // Badge reflects what actually produced the narration.
  const subtitle = document.getElementById('studioSubtitle');
  if (subtitle && info.llmMode) {
    const narrationSource = info.insightStory && info.insightStory.narration
      ? info.insightStory.narration.source : null;
    const badge = narrationSource === 'llm' ? ' · AI Narration ✓' : ' · DET Mode';
    subtitle.textContent += badge;
  }

  initFilterBar(spec, info);
});

// ─────────────────────────────────────────────────────────────────────────
// Interactive filter bar (M6) — slicers over the real dataset
// ─────────────────────────────────────────────────────────────────────────

const filterState = { dateFrom: null, dateTo: null, dims: {}, search: '' };
let filterCtx = null; // { dataset, kpiDefs, winnerPack, timeCol, dimCols }

function initFilterBar(spec, info) {
  let dataset = null, engineCtx = null;
  try {
    dataset = JSON.parse(sessionStorage.getItem('idash.dashboardDataset') || 'null');
    engineCtx = JSON.parse(sessionStorage.getItem('idash.dashboardEngineCtx') || 'null');
  } catch (e) { /* corrupt storage → no filters */ }
  if (!dataset || !engineCtx || !window.iDashKpiEngine || !window.iDashComposer || !window.iDashDecisionEngine) return;

  const bar = document.getElementById('studioFilterBar');
  if (!bar) return;

  const timeCol = spec.meta && spec.meta.timeColumn ? spec.meta.timeColumn : null;
  const dimCols = window.iDashKpiEngine.detectDimensionColumns(dataset, timeCol ? [timeCol] : []).slice(0, 3);
  if (!timeCol && dimCols.length === 0 && dataset.data.length < 2) return;

  filterCtx = { dataset, kpiDefs: engineCtx.kpiDefs || [], winnerPack: engineCtx.winnerPack, template: engineCtx.template || null, timeCol, dimCols };

  const controls = [];

  if (timeCol) {
    let minD = null, maxD = null;
    dataset.data.forEach(r => {
      const d = new Date(r[timeCol]);
      if (isNaN(d.getTime())) return;
      if (!minD || d < minD) minD = d;
      if (!maxD || d > maxD) maxD = d;
    });
    if (minD && maxD) {
      const iso = (d) => d.toISOString().slice(0, 10);
      controls.push(`
        <div class="sf-group">
          <span class="sf-label">${escapeHtml(timeCol)}</span>
          <input type="date" class="sf-date" id="sfDateFrom" value="${iso(minD)}" min="${iso(minD)}" max="${iso(maxD)}">
          <span class="sf-sep">—</span>
          <input type="date" class="sf-date" id="sfDateTo" value="${iso(maxD)}" min="${iso(minD)}" max="${iso(maxD)}">
        </div>`);
    }
  }

  dimCols.forEach((col, i) => {
    const counts = new Map();
    dataset.data.forEach(r => {
      const v = r[col];
      if (v === null || v === undefined || v === '') return;
      const k = String(v).trim();
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    const values = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => e[0]);
    controls.push(`
      <div class="sf-group">
        <span class="sf-label">${escapeHtml(col)}</span>
        <select class="sf-select" data-dim="${escapeHtml(col)}" id="sfDim${i}">
          <option value="">ทั้งหมด</option>
          ${values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('')}
        </select>
      </div>`);
  });

  controls.push(`
    <div class="sf-group sf-search-group">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" class="sf-search" id="sfSearch" placeholder="ค้นหาในข้อมูล...">
    </div>`);

  bar.innerHTML = `
    <div class="sf-title">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46"/></svg>
      ตัวกรอง
    </div>
    ${controls.join('')}
    <button type="button" class="sf-reset" id="sfReset">ล้างตัวกรอง</button>
    <span class="sf-count" id="sfCount">${dataset.data.length.toLocaleString('th-TH')} แถว</span>
  `;
  bar.hidden = false;

  const debouncedApply = debounce(applyFilters, 300);
  const dateFrom = document.getElementById('sfDateFrom');
  const dateTo = document.getElementById('sfDateTo');
  if (dateFrom) dateFrom.addEventListener('change', () => { filterState.dateFrom = dateFrom.value; debouncedApply(); });
  if (dateTo) dateTo.addEventListener('change', () => { filterState.dateTo = dateTo.value; debouncedApply(); });
  bar.querySelectorAll('.sf-select').forEach(sel => {
    sel.addEventListener('change', () => {
      filterState.dims[sel.dataset.dim] = sel.value || null;
      debouncedApply();
    });
  });
  const search = document.getElementById('sfSearch');
  if (search) search.addEventListener('input', () => { filterState.search = search.value.trim().toLowerCase(); debouncedApply(); });
  document.getElementById('sfReset').addEventListener('click', () => {
    filterState.dateFrom = null; filterState.dateTo = null; filterState.dims = {}; filterState.search = '';
    if (dateFrom) dateFrom.value = dateFrom.min;
    if (dateTo) dateTo.value = dateTo.max;
    bar.querySelectorAll('.sf-select').forEach(sel => { sel.value = ''; });
    if (search) search.value = '';
    applyFilters();
  });
}

function debounce(fn, ms) {
  let t;
  return function () { clearTimeout(t); t = setTimeout(fn, ms); };
}

function filteredRows() {
  const { dataset, timeCol } = filterCtx;
  const from = filterState.dateFrom ? new Date(filterState.dateFrom) : null;
  const to = filterState.dateTo ? new Date(filterState.dateTo + 'T23:59:59') : null;
  const dimEntries = Object.entries(filterState.dims).filter(([, v]) => v);
  const q = filterState.search;

  return dataset.data.filter(r => {
    if (timeCol && (from || to)) {
      const d = new Date(r[timeCol]);
      if (!isNaN(d.getTime())) {
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
    }
    for (const [col, val] of dimEntries) {
      const rv = r[col];
      if (rv === null || rv === undefined || String(rv).trim() !== val) return false;
    }
    if (q) {
      let hit = false;
      for (const col of dataset.columns) {
        const rv = r[col];
        if (rv !== null && rv !== undefined && String(rv).toLowerCase().includes(q)) { hit = true; break; }
      }
      if (!hit) return false;
    }
    return true;
  });
}

function disposeAllStudioCharts() {
  document.querySelectorAll('.sw-chart-canvas').forEach(el => {
    const inst = window.echarts.getInstanceByDom(el);
    if (inst) { try { inst.dispose(); } catch (e) {} }
  });
}

function applyFilters() {
  if (!filterCtx) return;
  const rows = filteredRows();
  const countEl = document.getElementById('sfCount');
  if (countEl) {
    countEl.textContent = rows.length === filterCtx.dataset.data.length
      ? `${rows.length.toLocaleString('th-TH')} แถว`
      : `${rows.length.toLocaleString('th-TH')} จาก ${filterCtx.dataset.data.length.toLocaleString('th-TH')} แถว`;
  }
  if (rows.length === 0) {
    showStudioToast('ไม่มีข้อมูลตรงตามตัวกรอง — ปรับเงื่อนไขหรือกดล้างตัวกรอง');
    return;
  }

  const fDataset = { columns: filterCtx.dataset.columns, data: rows, filename: filterCtx.dataset.filename };

  // Re-run the same DET engines on the filtered subset (④ → ⑤ → ⑦⑧).
  const bindings = window.iDashKpiEngine.discoverKpis(fDataset, filterCtx.kpiDefs);
  const kpiDefById = {};
  (filterCtx.kpiDefs || []).forEach(d => { kpiDefById[d.id] = d; });
  const decisionSpec = window.iDashDecisionEngine.buildDecisionSpec(bindings, filterCtx.kpiDefs, filterCtx.winnerPack);
  const newSpec = window.iDashComposer.buildDashboardSpec(decisionSpec.decisions, decisionSpec.gaps, bindings, kpiDefById, fDataset, filterCtx.template);

  if (!newSpec.pages || newSpec.pages.length === 0) {
    showStudioToast('ข้อมูลที่กรองแล้วไม่พอประกอบ Dashboard — ลองขยายเงื่อนไข');
    return;
  }

  const activePageEl = document.querySelector('.studio-tab.active');
  const activeId = activePageEl ? activePageEl.dataset.page : null;

  disposeAllStudioCharts();
  currentSpec = newSpec;
  renderTabs(newSpec.pages);
  renderPages(newSpec.pages);
  const target = newSpec.pages.find(p => p.id === activeId) ? activeId : newSpec.pages[0].id;
  activatePage(target);

  // Insight Story recompute removed with the panel itself (user directive
  // 2026-07-18) — see the note at the initial-render site above.
}

/**
 * doc 08 D31: semantic status colors (green/red/amber) stay fixed for
 * meaning — only the brand accent hue is theme-customizable. Applied as
 * CSS custom-property overrides so every existing --primary-* reference
 * across the Studio picks it up with no component changes.
 *
 * theme.dark switches the whole Studio to the dark token set (doc 08 §2:
 * "Light + dark are first-class") — previously the dark flag was ignored
 * and every theme rendered light, breaking the promise the theme picker
 * previews made.
 */
/**
 * Applies a Style Family (surface skin — bg/card/border/radius/shadow/font)
 * chosen deterministically per domain by dashboard_templates.js's sibling,
 * style_library.js. This is the layer that was missing before: 15 "themes"
 * were accent-color-only, so every domain rendered with identical card
 * shape/shadow/type regardless of which module the data belonged to. The
 * accent color picker (applyAccentTheme, called right after this) still
 * lets the user tint --primary, but the family now owns light/dark and the
 * rest of the surface — matching the dashboard-design-brain skill's own
 * token bundles (each named style ships bg+card+radius+shadow+font together,
 * not just a color).
 */
function applyStyleFamily(familyId, themeOverride) {
  const lib = window.iDashStyleLibrary;
  if (!lib) return;
  let family = lib.FAMILIES[familyId];
  if (!family) return;

  // When the user's theme selection (dark/light) conflicts with the style
  // family, pick an appropriate alternate family so the output matches
  // what the user saw in the theme preview card.
  if (themeOverride && themeOverride.dark !== undefined && themeOverride.dark !== !!family.dark) {
    const wantDark = themeOverride.dark;
    const altId = Object.keys(lib.FAMILIES).find(k => !!lib.FAMILIES[k].dark === wantDark);
    if (altId) family = lib.FAMILIES[altId];
  }

  const t = family.tokens;
  const root = document.documentElement.style;

  document.body.classList.toggle('theme-dark', !!family.dark);
  Array.from(document.body.classList).filter(c => c.indexOf('style-') === 0).forEach(c => document.body.classList.remove(c));
  document.body.classList.add('style-' + family.id);

  root.setProperty('--bg', t.bg);
  root.setProperty('--card-bg', t.cardBg);
  root.setProperty('--sidebar-bg', t.sidebarBg);
  root.setProperty('--text', t.text);
  root.setProperty('--text-secondary', t.textSecondary);
  root.setProperty('--text-muted', t.textMuted);
  root.setProperty('--border', t.border);
  root.setProperty('--radius', t.radius);
  root.setProperty('--radius-sm', t.radiusSm);
  root.setProperty('--radius-lg', t.radiusLg);
  root.setProperty('--shadow-sm', t.shadowSm);
  root.setProperty('--shadow', t.shadow);
  root.setProperty('--shadow-md', t.shadowMd);
  root.setProperty('--shadow-lg', t.shadowLg);
  root.setProperty('--font', t.font);

  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  steps.forEach((step, i) => {
    const pct = (i / (steps.length - 1)) * 90 + 5;
    root.setProperty(`--gray-${step}`, `color-mix(in srgb, ${t.text} ${pct}%, ${t.cardBg})`);
  });
}

function applyAccentTheme(theme) {
  const root = document.documentElement.style;
  const accent = theme.accent;
  const dark = isDarkTheme();

  root.setProperty('--primary', accent);
  root.setProperty('--primary-light', `color-mix(in srgb, ${accent} 55%, white)`);
  if (dark) {
    // Tints mix toward the active family's own card/bg surface (not a
    // hardcoded slate) so the accent reads correctly on whichever dark
    // Style Family is in effect (Ops Console, Slate Pro, ...).
    root.setProperty('--primary-lighter', `color-mix(in srgb, ${accent} 30%, var(--card-bg))`);
    root.setProperty('--primary-lightest', `color-mix(in srgb, ${accent} 14%, var(--card-bg))`);
    root.setProperty('--primary-dark', `color-mix(in srgb, ${accent} 55%, white)`);
    root.setProperty('--primary-gradient', `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 60%, var(--bg)) 100%)`);
  } else {
    root.setProperty('--primary-lighter', `color-mix(in srgb, ${accent} 18%, white)`);
    root.setProperty('--primary-lightest', `color-mix(in srgb, ${accent} 8%, white)`);
    root.setProperty('--primary-dark', `color-mix(in srgb, ${accent} 85%, black)`);
    root.setProperty('--primary-gradient', `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 85%, black) 100%)`);
  }
}

function isDarkTheme() {
  return document.body.classList.contains('theme-dark');
}

// Identity-layer chart palette (doc 08 §3): theme accent leads, fixed
// support hues follow, gray reserved for "others".
function themePalette() {
  return [currentAccentColor(), '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
}

function chartAxisTheme() {
  return isDarkTheme()
    ? { label: '#94a3b8', line: '#334155', split: '#1e293b' }
    : { label: '#6b7280', line: '#e5e7eb', split: '#f3f4f6' };
}

function chartTooltipTheme() {
  return isDarkTheme()
    ? { backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } }
    : {};
}

function chartSurfaceColor() {
  return isDarkTheme() ? '#111a2c' : '#ffffff';
}

// Domain identity badge next to the Studio title — the visual "which kind
// of business is this" signal the reference dashboards give via a custom
// sidebar logo per product. iDash stays one product (doc01 identity), so
// instead of re-branding the whole app per generation, the badge carries
// that identity locally next to the title only.
const DOMAIN_BADGE_ICONS = {
  manufacturing: '<rect x="3" y="10" width="4" height="10"/><rect x="10" y="6" width="4" height="14"/><rect x="17" y="3" width="4" height="17"/>',
  finance_accounting: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M9 9.2c0-1.3 1.2-2.3 3-2.3s3 .9 3 2.1c0 3-6 1.5-6 4.5 0 1.2 1.3 2.1 3 2.1s3-1 3-2.3"/>',
  inventory_warehouse: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  hr_people: '<circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.5.4 4.5 2.2 5 5.8"/>',
  sales_crm: '<polyline points="3 17 9 11 13 14 21 6"/><polyline points="15 6 21 6 21 12"/>',
  logistics_transport: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
  sugar_factory: '<path d="M8 3c0 2-2 3-2 6 0 2 1 3 2 3s2-1 2-3c0-3-2-4-2-6z"/><path d="M6 12v9h4v-9"/><path d="M16 3c0 2-2 3-2 6 0 2 1 3 2 3s2-1 2-3c0-3-2-4-2-6z"/><path d="M14 12v9h4v-9"/>',
  hotel_hospitality: '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/>',
  marketing_digital: '<path d="M3 11l18-7-7 18-2-8-9-3z"/>',
  ecommerce_retail: '<circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none"/><path d="M2 3h2l2.4 12.5a2 2 0 002 1.5h8.2a2 2 0 002-1.6L21 7H6"/>',
  education: '<path d="M2 9l10-5 10 5-10 5-10-5z"/><path d="M6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/>',
  generic_business: '<path d="M4 20V11M11 20V5M18 20v-6M2 20h20"/>'
};

function renderDomainBadge(domainId) {
  const badge = document.getElementById('studioDomainBadge');
  if (!badge) return;
  const path = DOMAIN_BADGE_ICONS[domainId];
  if (!path) { badge.hidden = true; return; }
  badge.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  badge.hidden = false;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderTabs(pages) {
  const tabs = document.getElementById('studioTabs');
  tabs.innerHTML = pages.map((p, i) => `
    <button class="studio-tab ${i === 0 ? 'active' : ''}" data-page="${p.id}">${escapeHtml(p.name)}</button>
  `).join('');
  tabs.querySelectorAll('.studio-tab').forEach(btn => {
    btn.addEventListener('click', () => activatePage(btn.dataset.page));
  });
}

function activatePage(pageId) {
  document.querySelectorAll('.studio-tab').forEach(t => t.classList.toggle('active', t.dataset.page === pageId));
  document.querySelectorAll('.studio-page').forEach(p => p.classList.toggle('active', p.id === 'page-' + pageId));
  // Charts render at 0-size if their container was display:none — resize once visible.
  const active = document.querySelector('.studio-page.active');
  if (active) {
    active.querySelectorAll('.sw-chart-canvas').forEach(el => {
      const inst = window.echarts.getInstanceByDom(el);
      if (inst) inst.resize();
    });
  }
}

let chartDomCounter = 0;

const ECHART_KINDS = ['line', 'bar', 'donut', 'multiline', 'stackedbar', 'heatmap', 'treemap', 'scatter', 'histogram'];

function renderPages(pages) {
  // Assign a stable DOM id to every chart widget before rendering any HTML.
  pages.forEach(page => {
    page.sections.forEach(section => {
      section.widgets.forEach(w => {
        if (ECHART_KINDS.includes(w.chart)) w.domId = 'chart-' + (chartDomCounter++);
      });
    });
  });

  const container = document.getElementById('studioPages');
  container.innerHTML = pages.map(page => `
    <div class="studio-page" id="page-${page.id}">
      ${page.sections.map(renderSection).join('')}
    </div>
  `).join('');

  // Charts must be instantiated after the DOM nodes exist.
  pages.forEach(page => {
    page.sections.forEach(section => {
      section.widgets.forEach(w => {
        if (w.chart === 'line') renderLineChart(w);
        if (w.chart === 'bar') renderBarChart(w);
        if (w.chart === 'donut') renderDonutChart(w);
        if (w.chart === 'multiline') renderMultiLineChart(w);
        if (w.chart === 'stackedbar') renderStackedTimeChart(w);
        if (w.chart === 'heatmap') renderHeatmapChart(w);
        if (w.chart === 'treemap') renderTreemapChart(w);
        if (w.chart === 'scatter') renderScatterChart(w);
        if (w.chart === 'histogram') renderHistogramChart(w);
      });
    });
  });
}

function renderSection(section) {
  return `
    <div class="studio-section">
      <div class="studio-section-title">${escapeHtml(section.intent)}</div>
      <div class="studio-grid">
        ${section.widgets.map(renderWidget).join('')}
      </div>
    </div>
  `;
}

function renderWidget(w) {
  if (w.geneId === 'gene.kpi_card_trend' || w.geneId === 'gene.kpi_card_static') return renderKpiWidget(w);
  if (w.geneId === 'gene.trend_line' || w.geneId === 'gene.trend_target_band') return renderChartWidget(w);
  if (w.geneId === 'gene.pareto_bar') return renderBarWidget(w);
  if (w.geneId === 'gene.ranking_hbar') return renderRankedListWidget(w);
  if (w.geneId === 'gene.donut') return renderDonutWidget(w);
  if (w.geneId === 'gene.multi_line' || w.geneId === 'gene.stacked_time' ||
      w.geneId === 'gene.heatmap_matrix' || w.geneId === 'gene.treemap' ||
      w.geneId === 'gene.scatter_relation' || w.geneId === 'gene.histogram') return renderChartWidget(w);
  if (w.geneId === 'gene.bullet_target') return renderBulletWidget(w);
  if (w.geneId === 'gene.kpi_status_table') return renderStatusTableWidget(w);
  if (w.geneId === 'gene.alert_feed') return renderAlertFeedWidget(w);
  if (w.geneId === 'gene.data_table') return renderTableWidget(w);
  if (w.geneId === 'gene.insight_strip') return renderInsightWidget(w);
  if (w.geneId === 'gene.gap_card') return renderGapWidget(w);
  if (w.geneId === 'gene.highlight_card') return renderHighlightCard(w);
  return '';
}

// doc 08 §1 law 3: "compact notation ≥ 10K" — large magnitudes must abbreviate
// (300,000,000 → 300M) rather than render full digit runs that overflow
// narrow KPI cards and chart axes.
const COMPACT_UNITS = [{ v: 1e12, s: 'T' }, { v: 1e9, s: 'B' }, { v: 1e6, s: 'M' }, { v: 1e3, s: 'K' }];

function formatCompact(value, decimals) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  const abs = Math.abs(num);
  if (abs < 10000) {
    return num.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  const unit = COMPACT_UNITS.find(u => abs >= u.v);
  if (!unit) return num.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (num / unit.v).toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + unit.s;
}

function formatValue(value, format) {
  const decimals = (format && format.decimals != null) ? format.decimals : 1;
  const kind = format && format.kind;
  if (kind === 'percentage') {
    const num = Number(value).toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return `${num}%`;
  }
  const compact = formatCompact(value, decimals);
  return kind === 'currency' ? `฿${compact}` : compact;
}

/**
 * Per-KPI icon + hue from the KPI's own name (evidence-driven, P5: never
 * random). Reference-grade dashboards (Stripe/Linear-style SaaS products)
 * differentiate each metric card by category — revenue is not styled like
 * headcount — instead of one theme accent repeated on every card. Falls
 * back to the theme accent + a generic chart icon when nothing matches.
 */
const KPI_ICON_PATHS = {
  dollar: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M9 9.2c0-1.3 1.2-2.3 3-2.3s3 .9 3 2.1c0 3-6 1.5-6 4.5 0 1.2 1.3 2.1 3 2.1s3-1 3-2.3"/>',
  trend: '<polyline points="3 17 9 11 13 14 21 6"/><polyline points="15 6 21 6 21 12"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18"/><circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none"/>',
  shield: '<path d="M12 2.5l7.5 3.5v5.2c0 4.7-3.2 7.9-7.5 9.3-4.3-1.4-7.5-4.6-7.5-9.3V6z"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2.5 20c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6"/><circle cx="17.5" cy="9" r="2.3"/><path d="M16.3 14.3c2.3.5 4 2.3 4.5 5.7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
  package: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  box: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="10" y1="10" x2="10" y2="20"/>',
  chart: '<path d="M4 20V11M11 20V5M18 20v-6M2 20h20"/>'
};
const KPI_STYLE_RULES = [
  { re: /กำไร|profit|margin|กำไรสุทธิ/i, hue: '#16a34a', icon: 'trend' },
  { re: /ยอดขาย|รายได้|revenue|sales|income|มูลค่า|turnover/i, hue: '#2563eb', icon: 'dollar' },
  { re: /ต้นทุน|ค่าใช้จ่าย|cost|expense|budget|งบประมาณ/i, hue: '#ea580c', icon: 'wallet' },
  { re: /อัตรา|rate|ratio|%|เปอร์เซ็นต์|percentage|เกรด/i, hue: '#7c3aed', icon: 'shield' },
  { re: /ลูกค้า|customer|พนักงาน|employee|headcount|staff/i, hue: '#db2777', icon: 'users' },
  { re: /เวลา|time|downtime|delay|duration|วันที่|shift|กะ/i, hue: '#d97706', icon: 'clock' },
  { re: /คลัง|สต็อก|inventory|stock|warehouse|shipment/i, hue: '#0891b2', icon: 'package' },
  { re: /จำนวน|count|รายการ|quantity|ชิ้น|units?\b/i, hue: '#0ea5e9', icon: 'box' }
];

// Deterministic fallback for KPI names the keyword rules don't recognize
// (arbitrary English column names like "deals_won") — a hash of the KPI's
// own name, not Math.random(), so identical names always get the identical
// color/icon (P5: unique by evidence, not randomness) while different KPIs
// still visually differentiate instead of collapsing onto one theme hue.
const KPI_FALLBACK_PALETTE = [
  { hue: '#2563eb', icon: 'box' }, { hue: '#16a34a', icon: 'trend' }, { hue: '#7c3aed', icon: 'chart' },
  { hue: '#ea580c', icon: 'package' }, { hue: '#0891b2', icon: 'box' }, { hue: '#db2777', icon: 'users' },
  { hue: '#d97706', icon: 'clock' }, { hue: '#0ea5e9', icon: 'chart' }
];

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function kpiVisualStyle(w) {
  const name = (w.nameTH || '') + ' ' + (w.nameEN || '');
  for (const rule of KPI_STYLE_RULES) {
    if (rule.re.test(name)) return { hue: rule.hue, path: KPI_ICON_PATHS[rule.icon] };
  }
  const pick = KPI_FALLBACK_PALETTE[hashString(name.trim() || 'kpi') % KPI_FALLBACK_PALETTE.length];
  return { hue: pick.hue, path: KPI_ICON_PATHS[pick.icon] };
}

function kpiIconBadge(w) {
  const style = kpiVisualStyle(w);
  return `
    <div class="sw-kpi-icon" style="background:color-mix(in srgb, ${style.hue} 16%, transparent);color:${style.hue}">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${style.path}</svg>
    </div>`;
}

function kpiBadge(w) {
  if (!w.target || !w.target.benchmark || w.target.benchmark.good == null) return '';
  const { good, warn } = w.target.benchmark;
  const higherBetter = w.direction === 'higher-better';
  let cls = '';
  if (higherBetter) cls = w.value >= good ? 'good' : (w.value >= warn ? 'warn' : '');
  else cls = w.value <= good ? 'good' : (w.value <= warn ? 'warn' : '');
  return `<span class="sw-kpi-badge ${cls}">เกณฑ์ ${formatValue(good, w.format)}</span>`;
}

function whyTooltip(because) {
  const text = escapeHtml((because || []).join('\n'));
  return `<span class="sw-why" title="${text}">?</span>`;
}

/**
 * Delta chip + sparkline from the widget's real trend series (P5: shown
 * only when a time axis exists — never fabricated). Delta compares the
 * mean of the second half of the series against the first half, matching
 * the "เทียบครึ่งหลัง/ครึ่งแรก" basis used across the platform (doc 08 §4).
 * Colors are semantic and direction-aware (D31): an increase in a
 * lower-is-better KPI is red, not green. Double-encoded with an arrow.
 */
function kpiTrendExtras(w) {
  const series = w.series || [];
  if (series.length < 4) return { delta: '', spark: '' };

  const values = series.map(p => p.value).filter(Number.isFinite);
  if (values.length < 4) return { delta: '', spark: '' };

  const mid = Math.floor(values.length / 2);
  const firstAvg = values.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
  const secondAvg = values.slice(mid).reduce((s, v) => s + v, 0) / (values.length - mid);

  let delta = '';
  if (firstAvg !== 0) {
    const pct = ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100;
    const rising = pct >= 0;
    const goodDirection = w.direction === 'lower-better' ? !rising : rising;
    const cls = goodDirection ? 'good' : 'bad';
    const arrow = rising ? '↑' : '↓';
    delta = `<span class="sw-kpi-delta ${cls}" title="เทียบค่าเฉลี่ยครึ่งหลังกับครึ่งแรกของช่วงข้อมูล">${arrow} ${Math.abs(pct).toFixed(1)}%</span>`;
  }

  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 26 - ((v - min) / range) * 22;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const spark = `
    <svg class="sw-kpi-spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`;

  return { delta, spark };
}

function renderKpiWidget(w) {
  if (w.cardStyle === 'compact') return renderKpiCardCompact(w);
  if (w.cardStyle === 'pill') return renderKpiCardPill(w);
  return renderKpiCardSparkline(w);
}

function renderKpiCardSparkline(w) {
  const extras = kpiTrendExtras(w);
  return `
    <div class="studio-widget studio-widget-kpi" data-span="${w.gridSpan}">
      <div class="sw-kpi-top-row">
        ${kpiIconBadge(w)}
        <div class="sw-kpi-name">${escapeHtml(w.nameTH)}${whyTooltip(w.because)}</div>
      </div>
      <div class="sw-kpi-value-row">
        <span class="sw-kpi-value">${formatValue(w.value, w.format)}</span>
        ${extras.delta}
        ${kpiBadge(w)}
      </div>
      ${extras.spark}
      <div class="sw-kpi-question">${escapeHtml(w.question)}</div>
    </div>
  `;
}

/**
 * Dense, chart-less card — modeled on the Healthcare Executive reference
 * (iCon/ตัวอย่างแดชบอร์ด/7.png): icon+label header, big number, delta text,
 * no sparkline. Used by dense "ops center" archetypes where screen real
 * estate favors more cards per row over trend visualization on every card.
 */
function renderKpiCardCompact(w) {
  const extras = kpiTrendExtras(w);
  return `
    <div class="studio-widget studio-widget-kpi sw-kpi-compact" data-span="${w.gridSpan}">
      <div class="sw-kpi-top-row">
        ${kpiIconBadge(w)}
        <div class="sw-kpi-name">${escapeHtml(w.nameTH)}${whyTooltip(w.because)}</div>
      </div>
      <div class="sw-kpi-value-row">
        <span class="sw-kpi-value">${formatValue(w.value, w.format)}</span>
        ${kpiBadge(w)}
      </div>
      ${extras.delta ? `<div class="sw-kpi-compact-delta">${extras.delta}</div>` : ''}
    </div>
  `;
}

/**
 * Wide horizontal pill — modeled on the Aquaculture reference bottom strip
 * (iCon/ตัวอย่างแดชบอร์ด/8.png): icon far-left, label+value+delta stacked
 * to the right, no chart. Used by target/report-style archetypes where the
 * headline row reads more like a status strip than a chart gallery.
 */
function renderKpiCardPill(w) {
  const extras = kpiTrendExtras(w);
  return `
    <div class="studio-widget studio-widget-kpi sw-kpi-pill" data-span="${w.gridSpan}">
      ${kpiIconBadge(w)}
      <div class="sw-kpi-pill-body">
        <div class="sw-kpi-name">${escapeHtml(w.nameTH)}${whyTooltip(w.because)}</div>
        <div class="sw-kpi-value-row">
          <span class="sw-kpi-value">${formatValue(w.value, w.format)}</span>
          ${extras.delta}
          ${kpiBadge(w)}
        </div>
      </div>
    </div>
  `;
}

function chartExportButton(w) {
  return `<button type="button" class="sw-chart-export" data-export-chart="${w.domId}" data-export-name="${escapeHtml(w.nameTH)}" title="ดาวน์โหลดกราฟเป็น PNG">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  </button>`;
}

function renderChartWidget(w) {
  return `
    <div class="studio-widget" data-span="${w.gridSpan}">
      <div class="sw-chart-header">
        <span class="sw-chart-title">${escapeHtml(w.nameTH)}${whyTooltip(w.because)}${chartExportButton(w)}</span>
        <span class="sw-chart-question">${escapeHtml(w.question)}</span>
      </div>
      <div class="sw-chart-canvas" id="${w.domId}"></div>
    </div>
  `;
}

function renderBarWidget(w) {
  return `
    <div class="studio-widget" data-span="${w.gridSpan}">
      <div class="sw-chart-header">
        <span class="sw-chart-title">${escapeHtml(w.nameTH)}${whyTooltip(w.because)}${chartExportButton(w)}</span>
        <span class="sw-chart-question">${escapeHtml(w.question)}</span>
      </div>
      <div class="sw-chart-canvas sw-chart-canvas-tall" id="${w.domId}"></div>
    </div>
  `;
}

const RANKED_LIST_PALETTE = ['#2563eb', '#16a34a', '#7c3aed', '#ea580c', '#0891b2', '#db2777', '#0ea5e9'];

/**
 * Numbered progress-bar ranking (doc 06 §2 hbar row, alternate HTML skin —
 * same evidence/data, richer read than an axis-and-bars chart for a
 * top-N-of-few-groups shape). Pure CSS, no ECharts instance needed.
 */
function renderRankedListWidget(w) {
  const groups = w.groups || [];
  const maxVal = Math.max(...groups.map(g => Math.abs(g.value)), 1);
  const rows = groups.map((g, i) => {
    const pct = Math.max(3, Math.round((Math.abs(g.value) / maxVal) * 100));
    const color = g.isOthers ? 'var(--gray-400)' : RANKED_LIST_PALETTE[i % RANKED_LIST_PALETTE.length];
    const valueStr = formatValue(g.value, w.format) + (g.share != null ? ` (${g.share}%)` : '');
    return `
      <div class="sw-ranked-row">
        <span class="sw-ranked-num" style="background:${color}">${i + 1}</span>
        <div class="sw-ranked-main">
          <div class="sw-ranked-label-row">
            <span class="sw-ranked-label">${escapeHtml(g.group)}</span>
            <span class="sw-ranked-value">${valueStr}</span>
          </div>
          <div class="sw-ranked-track"><div class="sw-ranked-fill" style="width:${pct}%;background:${color}"></div></div>
        </div>
      </div>`;
  }).join('');
  return `
    <div class="studio-widget" data-span="${w.gridSpan}">
      <div class="sw-chart-header">
        <span class="sw-chart-title">${escapeHtml(w.nameTH)}${whyTooltip(w.because)}</span>
        <span class="sw-chart-question">${escapeHtml(w.question)}</span>
      </div>
      <div class="sw-ranked-list">${rows}</div>
    </div>
  `;
}

function renderInsightWidget(w) {
  return `
    <div class="studio-widget" data-span="${w.gridSpan}">
      <div class="sw-insight">
        <div class="sw-insight-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M15 15l-2 5L9 9l11 4-5 2z"/></svg>
        </div>
        <div class="sw-insight-text">${escapeHtml(w.text)}${whyTooltip(w.because)}</div>
      </div>
    </div>
  `;
}

function renderGapWidget(w) {
  return `
    <div class="studio-widget sw-gap" data-span="${w.gridSpan}">
      <div class="sw-gap-question">${escapeHtml(w.question)}</div>
      <div class="sw-gap-missing">${escapeHtml(w.missing)}</div>
      <div class="sw-gap-name">KPI: ${escapeHtml(w.kpiName)}</div>
    </div>
  `;
}

function currentAccentColor() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  return v || '#2563eb';
}

function renderLineChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;

  const chart = window.echarts.init(target);
  const periods = (w.series || []).map(p => p.period);
  const values = (w.series || []).map(p => p.value);
  const accent = currentAccentColor();

  const ax = chartAxisTheme();
  const option = {
    grid: { left: 56, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category', data: periods,
      axisLabel: { fontSize: 10, color: ax.label },
      axisLine: { lineStyle: { color: ax.line } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: ax.label, formatter: (v) => formatCompact(v, 0) },
      splitLine: { lineStyle: { color: ax.split } }
    },
    tooltip: Object.assign({ trigger: 'axis', valueFormatter: (v) => Number(v).toLocaleString('th-TH') }, chartTooltipTheme()),
    series: [{
      type: 'line',
      data: values,
      smooth: false,
      symbolSize: 5,
      lineStyle: { color: accent, width: 2.5 },
      itemStyle: { color: accent },
      areaStyle: {
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent + '33' },
          { offset: 1, color: accent + '02' }
        ])
      },
      markLine: (w.geneId === 'gene.trend_target_band' && w.target && w.target.benchmark && w.target.benchmark.good != null) ? {
        symbol: 'none',
        label: { formatter: 'เป้า {c}', color: ax.label },
        lineStyle: { color: '#16a34a', type: 'dashed' },
        data: [{ yAxis: w.target.benchmark.good }]
      } : undefined
    }]
  };
  chart.setOption(option);
}

function renderDonutWidget(w) {
  return `
    <div class="studio-widget" data-span="${w.gridSpan}">
      <div class="sw-chart-header">
        <span class="sw-chart-title">${escapeHtml(w.nameTH)}${whyTooltip(w.because)}${chartExportButton(w)}</span>
        <span class="sw-chart-question">${escapeHtml(w.question)}</span>
      </div>
      <div class="sw-chart-canvas" id="${w.domId}"></div>
    </div>
  `;
}

function renderTableWidget(w) {
  const ths = w.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');
  const trs = w.rows.map(row => {
    const tds = w.columns.map(c => `<td>${escapeHtml(row[c] != null ? row[c] : '')}</td>`).join('');
    return `<tr>${tds}</tr>`;
  }).join('');
  const showing = w.rows.length;
  const note = showing < w.totalRows
    ? `<div class="sw-table-note">แสดง ${showing} แถวแรกจากทั้งหมด ${w.totalRows.toLocaleString('th-TH')} แถว · ${w.totalColumns} คอลัมน์</div>`
    : `<div class="sw-table-note">${w.totalRows.toLocaleString('th-TH')} แถว · ${w.totalColumns} คอลัมน์</div>`;
  return `
    <div class="studio-widget" data-span="${w.gridSpan}">
      <div class="sw-table-wrap">
        <table class="sw-data-table">
          <thead><tr>${ths}</tr></thead>
          <tbody>${trs}</tbody>
        </table>
      </div>
      ${note}
    </div>
  `;
}

function renderBarChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;

  const chart = window.echarts.init(target);
  const accent = currentAccentColor();
  const groups = (w.groups || []).slice().reverse(); // ECharts hbar renders bottom-up
  const labels = groups.map(g => g.group);
  const values = groups.map(g => g.value);

  const decimals = (w.format && w.format.decimals != null) ? w.format.decimals : 1;

  const ax = chartAxisTheme();
  const option = {
    grid: { left: 110, right: 60, top: 10, bottom: 10 },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: ax.label, formatter: (v) => formatCompact(v, 0) },
      splitLine: { lineStyle: { color: ax.split } }
    },
    yAxis: {
      type: 'category', data: labels,
      axisLabel: { fontSize: 10, width: 95, overflow: 'truncate', color: ax.label },
      axisLine: { lineStyle: { color: ax.line } }
    },
    tooltip: Object.assign({
      trigger: 'item',
      formatter: (p) => {
        const g = groups[p.dataIndex];
        const valStr = Number(g.value).toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        return g.share != null ? `${g.group}: ${valStr} (${g.share}%)` : `${g.group}: ${valStr}`;
      }
    }, chartTooltipTheme()),
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        color: (p) => {
          if (groups[p.dataIndex].isOthers) return isDarkTheme() ? '#334155' : '#cbd5e1';
          return new window.echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + 'b0' }
          ]);
        },
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true, position: 'right', fontSize: 10, color: ax.label,
        formatter: (p) => {
          const g = groups[p.dataIndex];
          const valStr = formatCompact(g.value, decimals);
          return w.showShare && g.share != null ? `${valStr} (${g.share}%)` : valStr;
        }
      }
    }]
  };
  chart.setOption(option);
}

// D17 made visible: after escaping, wrap "(F3)" / "(F1, F4)" citations in
// fact chips so every AI sentence visibly carries its evidence.
function factChipify(escapedText) {
  return escapedText.replace(/\((F\d+(?:,\s*F\d+)*)\)/g, (_, ids) => {
    const chips = ids.split(/,\s*/).map(id => `<span class="insight-fact-chip">${id}</span>`).join('');
    return `<span class="insight-fact-chips">${chips}</span>`;
  });
}

// ─── Phase-2 gene renderers (doc 06 matrix rows) ─────────────────────────

function renderMultiLineChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;
  const chart = window.echarts.init(target);
  const ax = chartAxisTheme();
  const palette = themePalette();
  chart.setOption({
    grid: { left: 56, right: 20, top: 34, bottom: 30 },
    legend: { top: 0, textStyle: { fontSize: 10, color: ax.label }, itemWidth: 14, itemHeight: 8 },
    xAxis: {
      type: 'category', data: w.periods,
      axisLabel: { fontSize: 10, color: ax.label },
      axisLine: { lineStyle: { color: ax.line } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: ax.label, formatter: (v) => formatCompact(v, 0) },
      splitLine: { lineStyle: { color: ax.split } }
    },
    tooltip: Object.assign({ trigger: 'axis', valueFormatter: (v) => v == null ? '-' : Number(v).toLocaleString('th-TH') }, chartTooltipTheme()),
    series: (w.parts || []).map((p, i) => ({
      name: p.name, type: 'line', data: p.values, connectNulls: true,
      symbolSize: 4, lineStyle: { color: palette[i % palette.length], width: 2.2 },
      itemStyle: { color: palette[i % palette.length] }
    }))
  });
}

function renderStackedTimeChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;
  const chart = window.echarts.init(target);
  const ax = chartAxisTheme();
  const palette = themePalette();
  chart.setOption({
    grid: { left: 56, right: 20, top: 34, bottom: 30 },
    legend: { top: 0, textStyle: { fontSize: 10, color: ax.label }, itemWidth: 14, itemHeight: 8 },
    xAxis: {
      type: 'category', data: w.periods,
      axisLabel: { fontSize: 10, color: ax.label },
      axisLine: { lineStyle: { color: ax.line } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: ax.label, formatter: (v) => formatCompact(v, 0) },
      splitLine: { lineStyle: { color: ax.split } }
    },
    tooltip: Object.assign({ trigger: 'axis', valueFormatter: (v) => v == null ? '-' : Number(v).toLocaleString('th-TH') }, chartTooltipTheme()),
    series: (w.parts || []).map((p, i) => ({
      name: p.name, type: 'bar', stack: 'total', data: p.values,
      barMaxWidth: 34,
      itemStyle: { color: palette[i % palette.length] }
    }))
  });
}

function renderHeatmapChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;
  const chart = window.echarts.init(target);
  const ax = chartAxisTheme();
  const accent = currentAccentColor();
  const maxV = (w.cells || []).reduce((m, c) => Math.max(m, c[2]), 0);
  chart.setOption({
    grid: { left: 110, right: 16, top: 10, bottom: 42 },
    xAxis: {
      type: 'category', data: w.xLabels,
      axisLabel: { fontSize: 9, color: ax.label, rotate: w.xLabels.length > 12 ? 45 : 0 },
      axisLine: { lineStyle: { color: ax.line } }
    },
    yAxis: {
      type: 'category', data: w.yLabels,
      axisLabel: { fontSize: 9, color: ax.label, width: 100, overflow: 'truncate' },
      axisLine: { lineStyle: { color: ax.line } }
    },
    tooltip: Object.assign({
      formatter: (p) => `${w.xLabels[p.value[0]]} × ${w.yLabels[p.value[1]]}: ${Number(p.value[2]).toLocaleString('th-TH')}`
    }, chartTooltipTheme()),
    // doc 06: sequential palette only for magnitude
    visualMap: { show: false, min: 0, max: maxV || 1, inRange: { color: [isDarkTheme() ? '#16213a' : '#eff6ff', accent] } },
    series: [{
      type: 'heatmap', data: w.cells,
      label: { show: w.xLabels.length * w.yLabels.length <= 60, fontSize: 8, color: ax.label, formatter: (p) => formatCompact(p.value[2], 0) },
      itemStyle: { borderColor: chartSurfaceColor(), borderWidth: 1 }
    }]
  });
}

function renderTreemapChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;
  const chart = window.echarts.init(target);
  const palette = themePalette();
  chart.setOption({
    tooltip: Object.assign({
      formatter: (p) => `${p.name}: ${Number(p.value).toLocaleString('th-TH')}${p.data.share != null ? ` (${p.data.share}%)` : ''}`
    }, chartTooltipTheme()),
    series: [{
      type: 'treemap', left: 4, right: 4, top: 4, bottom: 4,
      roam: false, nodeClick: false, breadcrumb: { show: false },
      label: { fontSize: 10, formatter: (p) => `${p.name}\n${formatCompact(p.value, 0)}` },
      itemStyle: { borderColor: chartSurfaceColor(), borderWidth: 2, gapWidth: 2 },
      data: (w.groups || []).map((g, i) => ({
        name: g.group, value: g.value, share: g.share,
        itemStyle: { color: palette[i % palette.length] }
      }))
    }]
  });
}

function renderScatterChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;
  const chart = window.echarts.init(target);
  const ax = chartAxisTheme();
  const accent = currentAccentColor();
  chart.setOption({
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'value', name: w.xName, nameLocation: 'middle', nameGap: 24,
      nameTextStyle: { fontSize: 10, color: ax.label }, scale: true,
      axisLabel: { fontSize: 9, color: ax.label, formatter: (v) => formatCompact(v, 0) },
      splitLine: { lineStyle: { color: ax.split } }
    },
    yAxis: {
      type: 'value', name: w.yName,
      nameTextStyle: { fontSize: 10, color: ax.label }, scale: true,
      axisLabel: { fontSize: 9, color: ax.label, formatter: (v) => formatCompact(v, 0) },
      splitLine: { lineStyle: { color: ax.split } }
    },
    tooltip: Object.assign({
      formatter: (p) => `${w.xName}: ${Number(p.value[0]).toLocaleString('th-TH')}<br>${w.yName}: ${Number(p.value[1]).toLocaleString('th-TH')}`
    }, chartTooltipTheme()),
    series: [{
      type: 'scatter', data: w.points, symbolSize: 7,
      itemStyle: { color: accent, opacity: 0.55 }
    }]
  });
}

function renderHistogramChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;
  const chart = window.echarts.init(target);
  const ax = chartAxisTheme();
  const accent = currentAccentColor();
  const labels = (w.bins || []).map(b => `${formatCompact(b.from, 0)}–${formatCompact(b.to, 0)}`);
  chart.setOption({
    grid: { left: 52, right: 16, top: 16, bottom: 52 },
    xAxis: {
      type: 'category', data: labels, name: w.measureName, nameLocation: 'middle', nameGap: 38,
      nameTextStyle: { fontSize: 10, color: ax.label },
      axisLabel: { fontSize: 8, color: ax.label, rotate: 30 },
      axisLine: { lineStyle: { color: ax.line } }
    },
    yAxis: {
      type: 'value', name: 'จำนวนแถว',
      nameTextStyle: { fontSize: 10, color: ax.label },
      axisLabel: { fontSize: 9, color: ax.label },
      splitLine: { lineStyle: { color: ax.split } }
    },
    tooltip: Object.assign({
      trigger: 'item',
      formatter: (p) => `${w.measureName} ${p.name}: ${p.value} แถว`
    }, chartTooltipTheme()),
    series: [{
      type: 'bar', data: (w.bins || []).map(b => b.count),
      barCategoryGap: '10%',
      itemStyle: { color: accent + 'cc', borderRadius: [3, 3, 0, 0] }
    }]
  });
}

/**
 * Bullet widget (doc 06 target-attainment) — pure HTML/CSS: a track with
 * good/warn bands, the actual-value bar, and a target tick. Direction-aware
 * status coloring (D31 double-encoded with the เกิน/ต่ำกว่า label).
 */
function renderBulletWidget(w) {
  const good = w.target && w.target.benchmark ? w.target.benchmark.good : null;
  const warn = w.target && w.target.benchmark ? w.target.benchmark.warn : null;
  if (good == null) return '';
  const higherBetter = w.direction !== 'lower-better';
  const scaleMax = Math.max(Math.abs(w.value) * 1.15, Math.abs(good) * 1.3, 1);
  const valuePct = Math.min(100, (Math.abs(w.value) / scaleMax) * 100);
  const goodPct = Math.min(100, (Math.abs(good) / scaleMax) * 100);
  const warnPct = warn != null ? Math.min(100, (Math.abs(warn) / scaleMax) * 100) : null;
  const met = higherBetter ? w.value >= good : w.value <= good;
  const statusCls = met ? 'met' : 'missed';
  const statusText = met ? 'ถึงเป้า' : (higherBetter ? 'ต่ำกว่าเป้า' : 'เกินเป้า');
  return `
    <div class="studio-widget sw-bullet" data-span="${w.gridSpan}">
      <div class="sw-kpi-name">${escapeHtml(w.nameTH)}${whyTooltip(w.because)}</div>
      <div class="sw-bullet-value-row">
        <span class="sw-bullet-value">${formatValue(w.value, w.format)}</span>
        <span class="sw-bullet-status ${statusCls}">${statusText}</span>
      </div>
      <div class="sw-bullet-track">
        ${warnPct != null ? `<div class="sw-bullet-band warn" style="width:${Math.max(warnPct, goodPct)}%"></div>` : ''}
        <div class="sw-bullet-band good" style="width:${goodPct}%"></div>
        <div class="sw-bullet-bar ${statusCls}" style="width:${valuePct}%"></div>
        <div class="sw-bullet-target" style="left:${goodPct}%" title="เป้า ${formatValue(good, w.format)}"></div>
      </div>
      <div class="sw-bullet-legend">เป้า ${formatValue(good, w.format)}${warn != null ? ` · เฝ้าระวัง ${formatValue(warn, w.format)}` : ''}</div>
    </div>
  `;
}

/**
 * KPI status summary table (doc 06 §6 refusal-safe: severity is 'neutral'
 * — never invented — when there's no target or trend to judge a row
 * against). Reuses kpiVisualStyle so the icon column matches the KPI cards.
 */
function renderStatusTableWidget(w) {
  const STATUS_PILL_LABEL = { good: 'good', bad: 'bad', warn: 'warn', neutral: 'neutral' };
  const rows = (w.rows || []).map(r => {
    const style = kpiVisualStyle(r);
    const pillClass = STATUS_PILL_LABEL[r.severity] || 'neutral';
    const deltaStr = r.deltaPct != null ? `${r.deltaPct >= 0 ? '+' : ''}${r.deltaPct.toFixed(1)}%` : '—';
    const deltaCls = r.deltaPct == null ? '' : (r.deltaPct >= 0 ? 'up' : 'down');
    return `
      <tr>
        <td>
          <div class="sw-status-kpi-cell">
            <div class="sw-kpi-icon sw-status-icon" style="background:color-mix(in srgb, ${style.hue} 16%, transparent);color:${style.hue}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${style.path}</svg>
            </div>
            <div class="sw-status-kpi-text">
              <div class="sw-status-name">${escapeHtml(r.nameTH)}</div>
              <div class="sw-status-question">${escapeHtml(r.question)}</div>
            </div>
          </div>
        </td>
        <td class="sw-status-value">${formatValue(r.value, r.format)}</td>
        <td class="sw-status-delta ${deltaCls}">${deltaStr}</td>
        <td><span class="sw-status-pill ${pillClass}">${escapeHtml(r.status)}</span></td>
      </tr>`;
  }).join('');
  return `
    <div class="studio-widget" data-span="${w.gridSpan}">
      <div class="sw-chart-header">
        <span class="sw-chart-title">สรุปสถานะตัวชี้วัดหลัก${whyTooltip(w.because)}</span>
        <span class="sw-chart-question">${escapeHtml(w.question)}</span>
      </div>
      <div class="sw-status-table-wrap">
        <table class="sw-status-table">
          <thead><tr><th>ตัวชี้วัด</th><th>ค่าปัจจุบัน</th><th>เปลี่ยนแปลง</th><th>สถานะ</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

const ALERT_ICON_PATHS = {
  'target-breach': '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>',
  'trend-swing': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  'data-gap': '<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
};

/** Alert feed — every item traces to a real target breach, trend delta, or
 * data gap (see composer.js); nothing here is invented or has a fake
 * "10m ago" timestamp we don't actually have. */
function renderAlertFeedWidget(w) {
  const items = (w.items || []).map(it => {
    const sevClass = it.severity === 'high' ? 'high' : (it.severity === 'medium' ? 'medium' : 'info');
    const icon = ALERT_ICON_PATHS[it.type] || ALERT_ICON_PATHS['data-gap'];
    return `
      <div class="sw-alert-row ${sevClass}">
        <span class="sw-alert-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
        </span>
        <span class="sw-alert-text">${escapeHtml(it.message)}</span>
      </div>`;
  }).join('');
  return `
    <div class="studio-widget" data-span="${w.gridSpan}">
      <div class="sw-chart-header">
        <span class="sw-chart-title">แจ้งเตือนที่ควรทราบ${whyTooltip(w.because)}</span>
        <span class="sw-chart-question">${escapeHtml(w.question)}</span>
      </div>
      <div class="sw-alert-feed">${items}</div>
    </div>
  `;
}

function renderHighlightCard(w) {
  const style = kpiVisualStyle(w);
  const val = formatValue(w.value, w.format);
  const statusLabel = w.status ? w.status.label : '';
  const statusSev = w.status ? w.status.severity : 'neutral';
  let deltaHtml = '';
  if (w.deltaPct != null && Math.abs(w.deltaPct) >= 0.1) {
    const rising = w.deltaPct >= 0;
    const goodDir = w.direction === 'lower-better' ? !rising : rising;
    const cls = goodDir ? 'good' : 'bad';
    const arrow = rising ? '↑' : '↓';
    deltaHtml = `<span class="sw-hl-delta ${cls}">${arrow} ${Math.abs(w.deltaPct).toFixed(1)}%</span>`;
  }
  return `
    <div class="studio-widget sw-highlight-card" data-span="${w.gridSpan}">
      <div class="sw-hl-icon" style="background:color-mix(in srgb, ${style.hue} 14%, transparent);color:${style.hue}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${style.path}</svg>
      </div>
      <div class="sw-hl-body">
        <div class="sw-hl-label">${escapeHtml(w.nameTH)}</div>
        <div class="sw-hl-value">${val} ${deltaHtml}</div>
        <div class="sw-hl-status sw-hl-status-${statusSev}">${escapeHtml(statusLabel)}</div>
      </div>
    </div>`;
}

function renderInsightStoryPanel(insightStory) {
  const narration = insightStory.narration;
  if (!narration) return;

  const container = document.getElementById('studioPages');
  if (!container) return;

  const sections = [];

  if (narration.executiveSummary) {
    sections.push(`
      <div class="insight-section">
        <div class="insight-section-title">สรุปผู้บริหาร</div>
        <p class="insight-text">${factChipify(escapeHtml(narration.executiveSummary))}</p>
      </div>
    `);
  }

  if (narration.topInsights && narration.topInsights.length > 0) {
    const items = narration.topInsights.map(i => {
      const sev = i.severity === 'high' ? 'high' : (i.severity === 'medium' ? 'medium' : 'low');
      return `
        <li class="insight-item insight-${sev}">
          <span class="insight-sev-dot" aria-hidden="true"></span>
          <span>${factChipify(escapeHtml(i.insight))}</span>
        </li>`;
    }).join('');
    sections.push(`
      <div class="insight-section">
        <div class="insight-section-title">ข้อค้นพบสำคัญ</div>
        <ul class="insight-item-list">${items}</ul>
      </div>
    `);
  }

  if (narration.recommendations && narration.recommendations.length > 0) {
    const items = narration.recommendations.map((r, i) => `
      <li class="insight-item">
        <span class="insight-rec-num">${i + 1}</span>
        <span><strong>${escapeHtml(r.action)}</strong> — ${factChipify(escapeHtml(r.why || ''))}</span>
      </li>`
    ).join('');
    sections.push(`
      <div class="insight-section">
        <div class="insight-section-title">คำแนะนำ</div>
        <ol class="insight-item-list">${items}</ol>
      </div>
    `);
  }

  if (narration.risks && narration.risks.length > 0) {
    const items = narration.risks.map(r => {
      const arrow = r.direction === 'down' ? '↓' : (r.direction === 'up' ? '↑' : '→');
      return `
        <li class="insight-item">
          <span class="insight-risk-arrow">${arrow}</span>
          <span>${factChipify(escapeHtml(r.risk))}</span>
        </li>`;
    }).join('');
    sections.push(`
      <div class="insight-section">
        <div class="insight-section-title">ความเสี่ยง</div>
        <ul class="insight-item-list">${items}</ul>
      </div>
    `);
  }

  if (sections.length === 0) return;

  const isLlm = narration.source === 'llm';
  const panelTitle = isLlm ? 'AI Insight Story' : 'สรุปข้อเท็จจริงจากข้อมูล';
  const sourceLabel = isLlm ? 'AI Narration' : 'คำนวณจากข้อมูลจริง 100%';
  const panel = document.createElement('div');
  panel.className = 'insight-story-panel';
  panel.innerHTML = `
    <div class="insight-story-header">
      <span class="insight-story-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M11 2l1.6 5L18 8.6l-5 1.6L11 15l-1.6-5L4.4 8.6l5-1.6z"/><path d="M19 3l.7 2.3L22 6l-2.3.7L19 9l-.7-2.3L16 6l2.3-.7z"/></svg>
      </span>
      <span class="insight-story-title">${panelTitle}</span>
      <span class="insight-story-badge">${sourceLabel}</span>
    </div>
    ${sections.join('')}
  `;
  container.appendChild(panel);
}

function renderDonutChart(w) {
  const target = document.getElementById(w.domId);
  if (!target) return;

  const chart = window.echarts.init(target);
  const groups = w.groups || [];
  const palette = themePalette();
  const ax = chartAxisTheme();

  const data = groups.map((g, i) => ({
    name: g.group,
    value: Math.round(g.value * 100) / 100,
    itemStyle: { color: g.isOthers ? (isDarkTheme() ? '#334155' : '#cbd5e1') : palette[i % palette.length] }
  }));

  const decimals = (w.format && w.format.decimals != null) ? w.format.decimals : 1;

  const option = {
    tooltip: Object.assign({
      trigger: 'item',
      formatter: (p) => {
        const valStr = Number(p.value).toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        return `${p.name}: ${valStr} (${p.percent}%)`;
      }
    }, chartTooltipTheme()),
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: chartSurfaceColor(), borderWidth: 2 },
      label: { show: true, fontSize: 10, color: ax.label, formatter: '{b}\n{d}%' },
      labelLine: { length: 12, length2: 8, lineStyle: { color: ax.line } },
      data: data
    }]
  };
  chart.setOption(option);
}

// ─────────────────────────────────────────────────────────────────────────
// Export (M6 — D12): PNG per chart, print-driven PDF, table data to Excel,
// full project backup to JSON. Pure output of what the composer already
// decided; no design choices happen here (keeps D34 intact).
// ─────────────────────────────────────────────────────────────────────────

function showStudioToast(message) {
  let toast = document.getElementById('studioToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'studioToast';
    toast.className = 'studio-toast';
    toast.hidden = true;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showStudioToast._t);
  showStudioToast._t = setTimeout(() => { toast.hidden = true; }, 2800);
}

function triggerDownload(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function sanitizeFilename(s) {
  return String(s || 'dashboard').replace(/[\\/:*?"<>|]/g, '_').trim() || 'dashboard';
}

function exportChartAsImage(domId, name, fmt) {
  const inst = window.echarts.getInstanceByDom(document.getElementById(domId));
  if (!inst) return;
  const type = fmt === 'jpg' ? 'jpeg' : 'png';
  const url = inst.getDataURL({ type: type, pixelRatio: 2, backgroundColor: '#fff' });
  triggerDownload(url, `${sanitizeFilename(name)}.${fmt === 'jpg' ? 'jpg' : 'png'}`);
}

function exportChartAsPNG(domId, name) {
  exportChartAsImage(domId, name, 'png');
}

function exportAllChartsImage(fmt) {
  const active = document.querySelector('.studio-page.active');
  if (!active) return;
  const buttons = active.querySelectorAll('.sw-chart-export');
  if (buttons.length === 0) { showStudioToast('หน้านี้ไม่มีกราฟให้ส่งออก'); return; }
  buttons.forEach((btn, i) => {
    setTimeout(() => exportChartAsImage(btn.dataset.exportChart, btn.dataset.exportName, fmt), i * 250);
  });
}

function exportTablesToExcel(spec) {
  if (!window.XLSX) { showStudioToast('ไม่สามารถโหลดไลบรารี Excel ได้'); return; }
  const active = document.querySelector('.studio-page.active');
  const activePageId = active ? active.id.replace('page-', '') : null;
  const page = spec.pages.find(p => p.id === activePageId) || spec.pages[0];
  if (!page) return;

  const tableWidgets = [];
  page.sections.forEach(section => {
    section.widgets.forEach(w => { if (w.geneId === 'gene.data_table') tableWidgets.push(w); });
  });

  const kpiWidgets = [];
  page.sections.forEach(section => {
    section.widgets.forEach(w => {
      if (w.geneId === 'gene.kpi_card_trend' || w.geneId === 'gene.kpi_card_static') kpiWidgets.push(w);
    });
  });

  if (tableWidgets.length === 0 && kpiWidgets.length === 0) {
    showStudioToast('หน้านี้ไม่มีข้อมูลตารางหรือ KPI ให้ส่งออก');
    return;
  }

  const wb = window.XLSX.utils.book_new();

  if (kpiWidgets.length > 0) {
    const kpiRows = kpiWidgets.map(w => ({
      'ตัวชี้วัด': w.nameTH,
      'ค่า': w.value,
      'คำถามธุรกิจ': w.question
    }));
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(kpiRows), 'KPI Summary');
  }

  tableWidgets.forEach((w, i) => {
    const sheet = window.XLSX.utils.json_to_sheet(w.rows || []);
    const sheetName = (w.nameTH || `Table ${i + 1}`).slice(0, 31).replace(/[\\/:*?"<>|[\]]/g, '_');
    window.XLSX.utils.book_append_sheet(wb, sheet, sheetName || `Table ${i + 1}`);
  });

  window.XLSX.writeFile(wb, `${sanitizeFilename(page.name || 'dashboard')}.xlsx`);
}

function exportProjectJSON(spec, info) {
  const backup = { dashboardSpec: spec, meta: info, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${sanitizeFilename(info.filename || 'dashboard')}_backup.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function initExportMenu(info) {
  const btn = document.getElementById('studioExportBtn');
  const menu = document.getElementById('studioExportMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  document.addEventListener('click', () => { menu.hidden = true; });
  menu.addEventListener('click', (e) => e.stopPropagation());

  menu.querySelectorAll('button[data-export]').forEach(item => {
    item.addEventListener('click', () => {
      menu.hidden = true;
      const kind = item.dataset.export;
      // currentSpec, not a captured snapshot — exports always reflect the
      // filtered view the user is looking at.
      if (kind === 'png') exportAllChartsImage('png');
      else if (kind === 'jpg') exportAllChartsImage('jpg');
      else if (kind === 'excel') exportTablesToExcel(currentSpec);
      else if (kind === 'pdf') window.print();
      else if (kind === 'json') exportProjectJSON(currentSpec, info);
    });
  });

  document.addEventListener('click', (e) => {
    const chartBtn = e.target.closest('.sw-chart-export');
    if (chartBtn) exportChartAsPNG(chartBtn.dataset.exportChart, chartBtn.dataset.exportName);
  });
}
