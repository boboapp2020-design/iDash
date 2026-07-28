/**
 * iDash Theme Selection page.
 * Reads the dataset parsed by the module-upload modal (index.html), lets
 * the user pick a visual accent theme (doc 08: brand accent is
 * customizable — semantic status colors are not, per D31), then runs the
 * M2 DET pipeline (②④⑤⑦⑧) and hands off to Dashboard Studio.
 */

// Palette lives in theme_palette.js (shared with the AI Autopilot flow).
const THEMES = window.iDashThemes;

let selectedThemeId = THEMES[0].id;

function miniDashboardSvg(theme) {
  const bg = theme.dark ? '#0f172a' : '#ffffff';
  const panel = theme.dark ? '#1e293b' : '#f1f5f9';
  const text = theme.dark ? '#64748b' : '#cbd5e1';
  const c = theme.accent;
  const c2 = theme.dark ? '#334155' : '#e2e8f0';

  return `
  <svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="220" height="120" rx="6" fill="${bg}" stroke="${theme.dark ? '#1e293b' : '#e5e7eb'}"/>
    <rect x="0" y="0" width="220" height="16" rx="6" fill="${c}"/>
    <rect x="8" y="5" width="24" height="6" rx="3" fill="rgba(255,255,255,.8)"/>
    <circle cx="205" cy="8" r="3" fill="rgba(255,255,255,.6)"/>

    <rect x="8" y="22" width="48" height="20" rx="3" fill="${panel}"/>
    <rect x="62" y="22" width="48" height="20" rx="3" fill="${panel}"/>
    <rect x="116" y="22" width="48" height="20" rx="3" fill="${panel}"/>
    <rect x="170" y="22" width="42" height="20" rx="3" fill="${panel}"/>
    <rect x="12" y="27" width="18" height="3" rx="1.5" fill="${text}"/>
    <rect x="66" y="27" width="18" height="3" rx="1.5" fill="${text}"/>
    <rect x="120" y="27" width="18" height="3" rx="1.5" fill="${text}"/>
    <rect x="174" y="27" width="16" height="3" rx="1.5" fill="${text}"/>
    <rect x="12" y="33" width="14" height="5" rx="1" fill="${c}"/>
    <rect x="66" y="33" width="14" height="5" rx="1" fill="${c}" opacity=".7"/>
    <rect x="120" y="33" width="14" height="5" rx="1" fill="${c}" opacity=".5"/>
    <rect x="174" y="33" width="14" height="5" rx="1" fill="${c}" opacity=".8"/>

    <rect x="8" y="48" width="100" height="64" rx="3" fill="${panel}"/>
    <polyline points="16,96 32,80 48,88 64,64 80,72 96,56" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

    <rect x="114" y="48" width="46" height="64" rx="3" fill="${panel}"/>
    <circle cx="137" cy="80" r="18" fill="none" stroke="${c2}" stroke-width="7"/>
    <circle cx="137" cy="80" r="18" fill="none" stroke="${c}" stroke-width="7" stroke-dasharray="65 113" stroke-linecap="round" transform="rotate(-90 137 80)"/>

    <rect x="166" y="48" width="46" height="64" rx="3" fill="${panel}"/>
    <rect x="173" y="88" width="7" height="16" rx="1.5" fill="${c}" opacity=".5"/>
    <rect x="184" y="76" width="7" height="28" rx="1.5" fill="${c}" opacity=".7"/>
    <rect x="195" y="66" width="7" height="38" rx="1.5" fill="${c}"/>
  </svg>`;
}

function renderThemeGrid() {
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = THEMES.map((t, i) => `
    <div class="theme-card ${t.id === selectedThemeId ? 'selected' : ''}" data-theme-id="${t.id}">
      <div class="theme-card-preview">
        ${miniDashboardSvg(t)}
        <div class="theme-card-check">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
      <div class="theme-card-label">
        <span class="theme-card-dot" style="background:${t.accent}"></span>
        ${i + 1}. ${t.name}
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedThemeId = card.dataset.themeId;
      grid.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('selected', c === card));
    });
  });
}

async function loadDomainPacks() {
  const ids = ['sugar_factory', 'manufacturing', 'finance_accounting', 'inventory_warehouse', 'sales_crm', 'hr_people', 'logistics_transport', 'hotel_hospitality', 'marketing_digital', 'ecommerce_retail', 'education', 'generic_business'];
  try {
    return await Promise.all(ids.map(id => fetch(`kb/domain_packs/${id}.json`).then(r => {
      if (!r.ok) throw new Error(`kb/domain_packs/${id}.json → HTTP ${r.status}`);
      return r.json();
    })));
  } catch (err) {
    throw new Error('โหลด Knowledge Base ไม่สำเร็จ (' + err.message + ') — ตรวจสอบว่าเปิดเว็บผ่าน Dev Server (http://localhost:9082) ไม่ใช่เปิดไฟล์ HTML โดยตรง');
  }
}

async function loadKpiDefsChain(winnerPack) {
  const fetchDefs = async (id) => {
    try {
      const resp = await fetch(`kb/kpi_defs/${id}.json`);
      return resp.ok ? await resp.json() : [];
    } catch (e) { return []; }
  };
  const own = await fetchDefs(winnerPack.id);
  if (!winnerPack.parent) return own;
  const parentDefs = await fetchDefs(winnerPack.parent);
  return own.concat(parentDefs);
}

// LLM Gateway URL — null = offline/fallback mode (DET only).
// Set this when Supabase Edge Functions are deployed.
const LLM_GATEWAY_URL = 'https://dzdgkmpxjzrvrmxlelzn.supabase.co/functions/v1/llm-gateway';
const LLM_GATEWAY_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZGdrbXB4anpydnJteGxlbHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTY3MDAsImV4cCI6MjA5OTgzMjcwMH0.BiY_HBuvfw1KT6y0kGrtAqAMC2m0RieAUHvnrSTeenw';

// User directive 2026-07-18: LLM narration off for now (worried about wrong
// prose) — dashboards run on the deterministic engines only, whose numbers
// are computed directly from the uploaded rows and cannot hallucinate.
// Flip to true to re-enable AI narration (M3 gateway stays deployed).
const ENABLE_LLM = false;

// User's explicit module choice maps to a domain pack. An explicit signal
// from the user outranks lexicon inference — selecting "Finance" must give
// a finance dashboard (doc 04: user picks module or lets AI auto-detect).
const MODULE_TO_PACK = {
  executive: 'generic_business',
  manufacturing: 'manufacturing',
  finance: 'finance_accounting',
  inventory: 'inventory_warehouse',
  hr: 'hr_people',
  sales: 'sales_crm',
  supply_chain: 'logistics_transport',
  agriculture: 'sugar_factory'
};

// AI generation can take 10-30s once LLM calls are live (M3) — a button
// label alone reads as "nothing happened" during that wait, so this modal
// gives the same always-visible progress feedback as the AI Autopilot flow.
const THEME_PROGRESS_STEP_ORDER = ['classify', 'frame', 'compose', 'insights'];
const THEME_PROGRESS_STEP_PCT = { classify: 15, frame: 55, compose: 75, insights: 100 };
const THEME_STAGE_TO_STEP = {
  'classify': 'classify',
  'business-frame': 'frame',
  'kpi': 'compose', 'decision': 'compose', 'compose': 'compose',
  'insights': 'insights',
  'done': 'insights'
};

function openThemeAiProgressModal() {
  const modal = document.getElementById('themeAiProgressModal');
  if (!modal) return;
  document.getElementById('themeAiProgressError').hidden = true;
  document.getElementById('themeAiProgressHeaderSub').textContent = 'กำลังวิเคราะห์ข้อมูลของคุณ';
  setThemeAiProgress(0);
  THEME_PROGRESS_STEP_ORDER.forEach(key => setThemeAiStepStatus(key, 'pending'));
  modal.hidden = false;
}

function closeThemeAiProgressModal() {
  const modal = document.getElementById('themeAiProgressModal');
  if (modal) modal.hidden = true;
}

function setThemeAiProgress(pct) {
  document.getElementById('themeAiProgressPct').textContent = `${pct}%`;
  document.getElementById('themeAiProgressBarFill').style.width = `${pct}%`;
}

function setThemeAiStepStatus(stepKey, status) {
  const step = document.querySelector(`#themeAiProgressSteps .ai-progress-step[data-step="${stepKey}"]`);
  if (!step) return;
  step.dataset.status = status;
  const iconEl = step.querySelector('.ai-step-icon');
  const statusEl = step.querySelector('.ai-step-status');
  if (status === 'done') {
    iconEl.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    statusEl.textContent = 'เสร็จสิ้น';
  } else if (status === 'active') {
    iconEl.innerHTML = '<span class="ai-step-spinner"></span>';
    statusEl.textContent = 'กำลังดำเนินการ';
  } else {
    iconEl.innerHTML = '';
    statusEl.textContent = 'รออยู่';
  }
  if (status === 'active') {
    setThemeAiProgress(Math.max(5, THEME_PROGRESS_STEP_PCT[stepKey] - 20));
  } else if (status === 'done') {
    setThemeAiProgress(THEME_PROGRESS_STEP_PCT[stepKey]);
  }
}

const THEME_PROGRESS_DESC = {
  classify: 'กำลังอ่านโครงสร้างข้อมูลและตรวจจับประเภทธุรกิจ...',
  frame: 'AI กำลังวิเคราะห์บริบทธุรกิจจากข้อมูลของคุณ...',
  compose: 'กำลังค้นหา KPI ที่เหมาะสมและประกอบ Dashboard...',
  insights: 'AI กำลังเขียนบทวิเคราะห์และข้อค้นพบเชิงลึก...'
};

function updateProgress(btn, stage) {
  const stepKey = THEME_STAGE_TO_STEP[stage] || 'classify';
  // Mark every earlier step done, this one active.
  const idx = THEME_PROGRESS_STEP_ORDER.indexOf(stepKey);
  THEME_PROGRESS_STEP_ORDER.forEach((key, i) => {
    if (i < idx) setThemeAiStepStatus(key, 'done');
  });
  if (stage === 'done') {
    setThemeAiStepStatus(stepKey, 'done');
    document.getElementById('themeAiProgressHeaderSub').textContent = 'เสร็จสิ้น';
  } else {
    setThemeAiStepStatus(stepKey, 'active');
    const desc = document.getElementById('themeAiProgressDesc');
    if (desc && THEME_PROGRESS_DESC[stepKey]) desc.textContent = THEME_PROGRESS_DESC[stepKey];
  }
}

async function runPipelineAndGoToStudio() {
  const btn = document.getElementById('createDashboardBtn');
  const raw = sessionStorage.getItem('idash.pendingDataset');

  if (!raw) {
    if (window.iDashToast) window.iDashToast('ยังไม่มีข้อมูลที่อัปโหลด — กำลังพากลับไปหน้าแรกเพื่ออัปโหลดไฟล์');
    setTimeout(() => { window.location.href = 'index.html'; }, 1600);
    return;
  }

  btn.disabled = true;
  const originalLabel = btn.innerHTML;
  const runId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  openThemeAiProgressModal();

  // Configure LLM modules (gateway may be disabled = DET-only mode)
  const gatewayUrl = ENABLE_LLM ? LLM_GATEWAY_URL : null;
  if (window.iDashBusinessFrame) window.iDashBusinessFrame.configure({ gatewayUrl: gatewayUrl, anonKey: LLM_GATEWAY_ANON_KEY });
  if (window.iDashInsightEngine) window.iDashInsightEngine.configure({ gatewayUrl: gatewayUrl, anonKey: LLM_GATEWAY_ANON_KEY });

  try {
    const dataset = JSON.parse(raw);

    // ② Classify
    updateProgress(btn, 'classify');
    const packs = await loadDomainPacks();
    const profile = window.iDashClassifier.profileDataset(dataset, { filename: dataset.filename, sheetNames: dataset.sheetNames });
    const classResult = window.iDashClassifier.classify(profile, packs);

    const packById = {};
    packs.forEach(p => { packById[p.id] = p; });

    // User's module choice overrides lexicon inference (explicit > inferred).
    let winnerPack = packById[classResult.winner.packId] || packById['generic_business'];
    let classificationSource = 'classifier';
    let pendingModule = null;
    try { pendingModule = JSON.parse(sessionStorage.getItem('idash.pendingModule') || 'null'); } catch (e) {}
    const userPackId = pendingModule && MODULE_TO_PACK[pendingModule.moduleId];
    if (userPackId && packById[userPackId] && userPackId !== winnerPack.id) {
      winnerPack = packById[userPackId];
      classificationSource = 'user-module';
    }

    // ③ Business Frame (LLM when available, DET fallback)
    updateProgress(btn, 'business-frame');
    let businessFrame = null;
    if (window.iDashBusinessFrame) {
      businessFrame = await window.iDashBusinessFrame.buildBusinessFrame(dataset, winnerPack, classResult, { runId });
    }

    // ④ KPI Discovery
    updateProgress(btn, 'kpi');
    const kpiDefs = await loadKpiDefsChain(winnerPack);
    const bindings = window.iDashKpiEngine.discoverKpis(dataset, kpiDefs);
    const kpiDefById = {};
    kpiDefs.forEach(d => { kpiDefById[d.id] = d; });

    // ⑤ Decision Spec
    updateProgress(btn, 'decision');
    const decisionSpec = window.iDashDecisionEngine.buildDecisionSpec(bindings, kpiDefs, winnerPack);

    // ⑦⑧ Compose — template picks the layout recipe (structure only,
    // deterministic from real evidence); theme (color) stays separate.
    updateProgress(btn, 'compose');
    const dashboardSpec = window.iDashComposer.buildDashboardSpec(decisionSpec.decisions, decisionSpec.gaps, bindings, kpiDefById, dataset, null);

    // ⑨ Insight Engine (LLM narration when available, DET template fallback)
    updateProgress(btn, 'insights');
    let insightStory = null;
    if (window.iDashInsightEngine) {
      const domainContext = { id: winnerPack.id, nameTH: winnerPack.identity.nameTH };
      insightStory = await window.iDashInsightEngine.generateInsights(bindings, dataset, kpiDefById, domainContext, dashboardSpec, { runId });
    }

    updateProgress(btn, 'done');
    const theme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];
    const styleFamily = window.iDashStyleLibrary ? window.iDashStyleLibrary.getFamilyForDomain(winnerPack.id) : null;

    sessionStorage.setItem('idash.dashboardSpec', JSON.stringify(dashboardSpec));
    sessionStorage.setItem('idash.dashboardMeta', JSON.stringify({
      filename: dataset.filename,
      datasetTitle: dataset.datasetName || null,
      domainId: winnerPack.id,
      domainNameTH: winnerPack.identity.nameTH,
      confidencePct: classificationSource === 'user-module' ? 95 : Math.round(classResult.winner.confidence * 100),
      classificationSource: classificationSource,
      templateId: null,
      templateName: null,
      styleFamilyId: styleFamily ? styleFamily.id : null,
      styleFamilyName: styleFamily ? styleFamily.name : null,
      theme: theme,
      businessFrame: businessFrame,
      insightStory: insightStory,
      runId: runId,
      llmMode: gatewayUrl ? 'online' : 'offline'
    }));
    // Interactive filters (slicers) need the raw dataset + the exact KPI
    // defs and pack used, so Studio can re-run ④⑤⑦ on filtered rows.
    // Quota overflow (very large files) degrades gracefully: Studio hides
    // the filter bar when this key is absent.
    try {
      sessionStorage.setItem('idash.dashboardDataset', JSON.stringify(dataset));
      sessionStorage.setItem('idash.dashboardEngineCtx', JSON.stringify({ kpiDefs: kpiDefs, winnerPack: winnerPack, template: null }));
    } catch (e) {
      sessionStorage.removeItem('idash.dashboardDataset');
      sessionStorage.removeItem('idash.dashboardEngineCtx');
    }
    sessionStorage.removeItem('idash.pendingDataset');
    sessionStorage.removeItem('idash.pendingModule');

    window.location.href = 'infographic.html';
  } catch (err) {
    const errorEl = document.getElementById('themeAiProgressError');
    if (errorEl) {
      errorEl.textContent = 'สร้าง Dashboard ไม่สำเร็จ: ' + err.message;
      errorEl.hidden = false;
    }
    if (window.iDashToast) window.iDashToast('สร้าง Dashboard ไม่สำเร็จ: ' + err.message);
    btn.disabled = false;
    btn.innerHTML = originalLabel;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderThemeGrid();
  document.getElementById('createDashboardBtn').addEventListener('click', runPipelineAndGoToStudio);
  const closeBtn = document.getElementById('themeAiProgressClose');
  if (closeBtn) closeBtn.addEventListener('click', closeThemeAiProgressModal);
});
