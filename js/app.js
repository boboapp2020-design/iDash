document.addEventListener('DOMContentLoaded', () => {
  initModuleSelector();
  initLightbox();
  initUploadZone();
  initModuleUploadModal();
  initAiProgressModal();
  initBuildModeModal();
  initAiSetupModal();
});

function initModuleSelector() {
  const cards = document.querySelectorAll('.module-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      openModuleUploadModal(card);
    });
  });
}

let pendingModuleFile = null;

const MODULE_DOMAIN_TH = {
  executive: 'ผู้บริหารภาพรวมองค์กร',
  manufacturing: 'การผลิตและโรงงาน',
  finance: 'การเงินและบัญชี',
  inventory: 'คลังสินค้าและทรัพย์สิน',
  hr: 'ทรัพยากรบุคคล',
  sales: 'การขายและการตลาด',
  supply_chain: 'จัดซื้อและโซ่อุปทาน',
  agriculture: 'เกษตรกรรมและไร่อ้อย'
};

function openModuleUploadModal(card) {
  const modal = document.getElementById('moduleUploadModal');
  const icon = document.getElementById('moduleUploadIcon');
  const nameEl = document.getElementById('moduleUploadName');
  const descEl = document.getElementById('moduleUploadDesc');
  const confirmBtn = document.getElementById('moduleUploadConfirm');
  if (!modal) return;

  pendingModuleFile = null;
  const moduleName = (card.querySelector('.module-name')?.textContent || '').replace(/^\d+\.\s*/, '');
  const iconSrc = card.querySelector('.module-icon img')?.src || '';
  const moduleId = card.dataset.module || '';
  const domainTH = MODULE_DOMAIN_TH[moduleId] || 'ธุรกิจของคุณ';

  nameEl.textContent = moduleName;
  icon.innerHTML = iconSrc ? `<img src="${iconSrc}" alt="${moduleName}">` : '';
  descEl.textContent = `AI จะวิเคราะห์ข้อมูลของคุณและสร้าง Dashboard ที่เหมาะกับธุรกิจ${domainTH}โดยอัตโนมัติ ภายในไม่กี่นาที`;
  modal.dataset.moduleId = moduleId;
  modal.dataset.moduleName = moduleName;
  modal.dataset.destination = 'pipeline';

  resetModuleUploadFile();
  document.getElementById('moduleUploadError').hidden = true;
  confirmBtn.disabled = true;

  modal.hidden = false;
}

function openCustomStudioUploadModal() {
  const modal = document.getElementById('moduleUploadModal');
  const icon = document.getElementById('moduleUploadIcon');
  const nameEl = document.getElementById('moduleUploadName');
  const descEl = document.getElementById('moduleUploadDesc');
  const confirmBtn = document.getElementById('moduleUploadConfirm');
  if (!modal) return;

  pendingModuleFile = null;
  nameEl.textContent = 'Custom Studio';
  icon.innerHTML = '<img src="assets/icons/custom_studio.png" alt="Custom Studio">';
  descEl.textContent = 'อัปโหลดข้อมูลของคุณก่อน แล้วออกแบบ Dashboard เองได้อย่างอิสระใน Custom Studio';
  modal.dataset.moduleId = 'custom_studio';
  modal.dataset.moduleName = 'Custom Studio';
  modal.dataset.destination = 'custom.html';

  resetModuleUploadFile();
  document.getElementById('moduleUploadError').hidden = true;
  confirmBtn.disabled = true;

  modal.hidden = false;
}

function resetModuleUploadFile() {
  pendingModuleFile = null;
  document.getElementById('moduleUploadPicked').hidden = true;
  document.getElementById('moduleUploadDropzone').hidden = false;
  document.getElementById('moduleUploadConfirm').disabled = true;
}

function closeModuleUploadModal() {
  const modal = document.getElementById('moduleUploadModal');
  if (modal) modal.hidden = true;
  pendingModuleFile = null;
}

const FILE_ICON_BY_EXT = {
  xlsx: { label: 'X', bg: '#16a34a' },
  xls: { label: 'X', bg: '#16a34a' },
  csv: { label: 'C', bg: '#2563eb' },
  json: { label: '{ }', bg: '#7c3aed' }
};

function initModuleUploadModal() {
  const modal = document.getElementById('moduleUploadModal');
  if (!modal) return;
  const dropzone = document.getElementById('moduleUploadDropzone');
  const pickedEl = document.getElementById('moduleUploadPicked');
  const filenameEl = document.getElementById('moduleUploadFilename');
  const filesizeEl = document.getElementById('moduleUploadFilesize');
  const fileIconEl = document.getElementById('moduleUploadFileIcon');
  const removeBtn = document.getElementById('moduleUploadRemove');
  const errorEl = document.getElementById('moduleUploadError');
  const confirmBtn = document.getElementById('moduleUploadConfirm');
  const cancelBtn = document.getElementById('moduleUploadCancel');
  const closeBtn = document.getElementById('moduleUploadClose');
  const validExt = ['xlsx', 'xls', 'csv', 'json'];

  function pickFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    errorEl.hidden = true;
    if (!validExt.includes(ext)) {
      errorEl.textContent = 'ไฟล์ไม่รองรับ กรุณาเลือกไฟล์ Excel, CSV หรือ JSON';
      errorEl.hidden = false;
      confirmBtn.disabled = true;
      return;
    }
    pendingModuleFile = file;
    const iconInfo = FILE_ICON_BY_EXT[ext] || { label: '?', bg: '#64748b' };
    fileIconEl.textContent = iconInfo.label;
    fileIconEl.style.background = iconInfo.bg;
    filenameEl.textContent = file.name;
    filesizeEl.textContent = formatSize(file.size);
    dropzone.hidden = true;
    pickedEl.hidden = false;
    confirmBtn.disabled = false;
  }

  removeBtn.addEventListener('click', () => resetModuleUploadFile());

  dropzone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv,.json';
    input.addEventListener('change', e => { if (e.target.files.length) pickFile(e.target.files[0]); });
    input.click();
  });
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) pickFile(e.dataTransfer.files[0]);
  });

  cancelBtn.addEventListener('click', closeModuleUploadModal);
  closeBtn.addEventListener('click', closeModuleUploadModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModuleUploadModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModuleUploadModal(); });

  confirmBtn.addEventListener('click', async () => {
    if (!pendingModuleFile || !window.iDashProfiler) return;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'กำลังโหลด...';
    try {
      const moduleId = modal.dataset.moduleId;
      const destination = modal.dataset.destination;
      const file = pendingModuleFile;
      if (destination === 'custom.html') {
        let dataset;
        try {
          dataset = await resolveDatasetForPipeline(file);
        } catch (err) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'สร้าง Dashboard';
          return;
        }
        sessionStorage.setItem('idash.pendingDataset', JSON.stringify(dataset));
        window.location.href = 'custom.html';
        return;
      }
      // Module flow: resolve dataset first, then show theme picker
      let dataset;
      try {
        dataset = await resolveDatasetForPipeline(file);
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'สร้าง Dashboard';
        return;
      }
      closeModuleUploadModal();
      openThemePicker(dataset, moduleId);
    } catch (err) {
      errorEl.textContent = `อ่านไฟล์ไม่สำเร็จ: ${err.message}`;
      errorEl.hidden = false;
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'สร้าง Dashboard';
    }
  });
}

function initUploadZone() {
  const cards = document.querySelectorAll('.mode-card[data-mode]');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.mode === 'custom') {
        openCustomStudioUploadModal();
        return;
      }
      // Clicking asks WHO builds the dashboard first — the route changes what
      // happens to the file (offline match vs. a call out to an AI provider),
      // so it is fairer to settle that before the file is handed over.
      openBuildModeModal(null);
    });

    card.addEventListener('dragover', (e) => { e.preventDefault(); card.style.borderColor = '#2563eb'; card.style.background = '#eff6ff'; });
    card.addEventListener('dragleave', () => { card.style.borderColor = ''; card.style.background = ''; });
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.style.borderColor = ''; card.style.background = '';
      if (card.dataset.mode === 'custom') {
        openCustomStudioUploadModal();
        return;
      }
      if (e.dataTransfer.files.length) startAutopilot(e.dataTransfer.files[0]);
    });
  });
}

/**
 * Upload entry point. Resolve the file to a dataset (handling the multi-sheet
 * picker first if needed), then let the user pick who draws the dashboard:
 *
 *   template → the offline path: known-dataset registry match → curated
 *              blueprint, or stock shape-routed generation. No network.
 *   ai       → the deterministic pipeline still computes every number; the
 *              aggregated facts then go to the user's chosen AI provider,
 *              which writes the page itself.
 */
async function startAutopilot(file) {
  let dataset;
  try {
    dataset = await resolveDatasetForPipeline(file);
  } catch (err) {
    return; // user cancelled the sheet picker — quietly back out
  }
  // Keep the original file alongside the parsed rows. Several curated
  // dashboards parse the workbook themselves — one of them reads all 16 sheets
  // and finds its own header rows — so handing them the file beats handing them
  // whatever single sheet our profiler happened to pick.
  if (file instanceof File) dataset.sourceFile = file;
  openBuildModeModal(dataset);
}

/**
 * Second half of the click path: the route is already chosen, so ask for the
 * file and run straight into that route. Cancelling the file dialog leaves the
 * page exactly as it was — nothing is remembered.
 */
function pickFileThenRun(mode) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.csv,.json';
  input.addEventListener('change', async (e) => {
    if (!e.target.files.length) return;
    const file = e.target.files[0];
    let dataset;
    try {
      dataset = await resolveDatasetForPipeline(file);
    } catch (err) {
      return; // user cancelled the sheet picker — quietly back out
    }
    if (file instanceof File) dataset.sourceFile = file;
    runAutopilotPipeline(dataset, null, { mode: mode });
  });
  input.click();
}

/* ── Build-mode chooser ─────────────────────────────────────────────────── */

let pendingDataset = null;

/**
 * Opens the route chooser. `dataset` is null on the normal click path — the
 * route is picked first and the file is asked for afterwards. It is only
 * non-null when a file was dropped onto the zone, in which case re-asking for
 * the same file would be rude.
 */
function openBuildModeModal(dataset) {
  const modal = document.getElementById('buildModeModal');
  if (!modal) { pickFileThenRun('template'); return; }
  pendingDataset = dataset;
  document.getElementById('bmFileName').textContent =
    dataset ? (dataset.filename || 'ไฟล์ที่อัปโหลด') : 'เลือกช่องทางก่อน แล้วจึงอัปโหลดไฟล์';

  // Tell the user up front whether the AI route is ready to go.
  const tag = document.getElementById('bmAiTag');
  if (tag && window.iDashAIProviders) {
    const problem = window.iDashAIProviders.configProblem();
    if (problem) {
      tag.textContent = 'ต้องตั้งค่า API key ก่อน';
      tag.className = 'bm-opt-tag';
    } else {
      const cfg = window.iDashAIProviders.currentConfig();
      tag.textContent = 'พร้อมใช้ · ' + cfg.label;
      tag.className = 'bm-opt-tag ready';
    }
  }
  modal.hidden = false;
}

function closeBuildModeModal() {
  const modal = document.getElementById('buildModeModal');
  if (modal) modal.hidden = true;
}

function initBuildModeModal() {
  const modal = document.getElementById('buildModeModal');
  if (!modal) return;

  modal.querySelectorAll('[data-build-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.buildMode;
      const dataset = pendingDataset;
      pendingDataset = null;
      closeBuildModeModal();

      // No file yet (the usual path): settle the AI provider first if this
      // route needs one, then ask for the file.
      const start = dataset
        ? () => runAutopilotPipeline(dataset, null, { mode: mode })
        : () => pickFileThenRun(mode);

      // AI Autopilot always re-opens the setup modal, even when a provider is
      // already configured — it's the one route that sends data to a third
      // party, so which key/provider is about to be used should be a visible
      // choice each time, not something remembered silently from last time.
      if (mode === 'ai') {
        openAiSetupModal(start);
      } else {
        start();
      }
    });
  });

  document.getElementById('bmClose').addEventListener('click', () => { pendingDataset = null; closeBuildModeModal(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) { pendingDataset = null; closeBuildModeModal(); } });
}

/* ── AI provider settings ───────────────────────────────────────────────── */

let aiSetupOnSaved = null;

function openAiSetupModal(onSaved) {
  const modal = document.getElementById('aiSetupModal');
  if (!modal || !window.iDashAIProviders) return;
  aiSetupOnSaved = onSaved || null;

  // Reopen on whichever mode the saved provider belongs to, so the modal shows
  // the setup that is actually in force rather than a default.
  const savedId = window.iDashAIProviders.loadSettings().providerId;
  const mode = savedId === GATEWAY_PROVIDER ? 'gateway' : 'direct';
  const radio = modal.querySelector('input[name="aiConnMode"][value="' + mode + '"]');
  if (radio) radio.checked = true;
  syncAiConnMode(savedId);
  document.getElementById('aiSetupMsg').textContent = '';
  modal.hidden = false;
}

const AI_MODEL_CUSTOM = '__custom__';
const GATEWAY_PROVIDER = 'supabase';

/** Which connection mode the cards are on right now. */
function currentAiConnMode() {
  const picked = document.querySelector('input[name="aiConnMode"]:checked');
  return picked ? picked.value : 'direct';
}

/**
 * Show the fields that belong to the chosen mode.
 *
 * Gateway mode has exactly one provider — the user's own Edge Function — so
 * the provider dropdown is hidden rather than left as a one-item list. Direct
 * mode lists every provider except that one.
 *
 * @param {string} [preferId] provider to select if it fits the mode
 */
function syncAiConnMode(preferId) {
  const api = window.iDashAIProviders;
  const mode = currentAiConnMode();
  const sel = document.getElementById('aiProviderSelect');
  const field = document.getElementById('aiProviderField');

  if (mode === 'gateway') {
    sel.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = GATEWAY_PROVIDER;
    opt.textContent = api.PROVIDERS[GATEWAY_PROVIDER].label;
    sel.appendChild(opt);
    sel.value = GATEWAY_PROVIDER;
    field.hidden = true;
  } else {
    const ids = Object.keys(api.PROVIDERS).filter(id => id !== GATEWAY_PROVIDER);
    sel.innerHTML = '';
    // Flag the providers that have a no-cost tier, read off the model list
    // itself so the label can never drift from what the dropdown actually
    // offers. Otherwise "is there a free option?" costs a click per provider.
    ids.forEach(id => {
      const p = api.PROVIDERS[id];
      const free = (p.models || []).filter(m => m.tier === 'free').length;
      const paid = (p.models || []).filter(m => m.tier === 'paid').length;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = p.label +
        (free && paid ? '  · มีรุ่นฟรีและรุ่นเสียเงิน'
         : free       ? '  · ฟรีทุกรุ่น'
         : paid       ? '  · เสียเงิน'
         : '');
      sel.appendChild(opt);
    });
    sel.value = ids.indexOf(preferId) >= 0 ? preferId : ids[0];
    field.hidden = false;
  }
  syncAiSetupFields();
}

/** Repopulate model/key/endpoint for whichever provider is selected. */
function syncAiSetupFields() {
  const api = window.iDashAIProviders;
  const id = document.getElementById('aiProviderSelect').value;
  const def = api.PROVIDERS[id];
  const saved = (api.loadSettings().byProvider || {})[id] || {};
  const model = saved.model || def.defaultModel || '';

  // Shortlist grouped free-then-paid, plus an escape hatch so a model that
  // isn't on the list (or ships after this build) is still reachable.
  const sel = document.getElementById('aiModelSelect');
  sel.innerHTML = '';
  const list = def.models || [];
  [['ฟรี', 'free'], ['เสียเงิน', 'paid']].forEach(([groupLabel, tier]) => {
    const inTier = list.filter(m => m.tier === tier);
    if (!inTier.length) return;
    const group = document.createElement('optgroup');
    group.label = groupLabel;
    inTier.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.label;
      group.appendChild(opt);
    });
    sel.appendChild(group);
  });
  const customOpt = document.createElement('option');
  customOpt.value = AI_MODEL_CUSTOM;
  customOpt.textContent = 'อื่นๆ (พิมพ์ชื่อโมเดลเอง)';
  sel.appendChild(customOpt);

  const known = list.some(m => m.id === model);
  sel.value = known ? model : AI_MODEL_CUSTOM;
  document.getElementById('aiModelInput').value = known ? '' : model;
  syncAiModelCustomField();

  document.getElementById('aiKeyInput').value = saved.apiKey || '';
  renderAiKeyHint(def);

  // The blanket "anyone on this machine can read your key" warning is wrong for
  // Supabase — there the browser only ever holds the anon key and the real
  // provider key stays on the server.
  const warn = document.getElementById('aiKeyWarnText');
  if (warn) {
    warn.textContent = def.shape === 'supabase'
      ? 'ปลอดภัยกว่า: key ของ AI อยู่ฝั่งเซิร์ฟเวอร์ เบราว์เซอร์เก็บแค่ anon key ซึ่งออกแบบมาให้เปิดเผยได้อยู่แล้ว'
      : 'key ถูกเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น และเรียก API ตรงจากเบราว์เซอร์ — ใครเปิดเครื่องนี้ก็อาจเห็น key ได้ อย่าใช้บนเครื่องสาธารณะ';
    warn.parentElement.classList.toggle('bm-warn-ok', def.shape === 'supabase');
  }

  // Providers with a fixed public endpoint hide the URL field; Supabase and
  // "custom" point at the user's own deployment, so they must show it.
  const endpointField = document.getElementById('aiEndpointField');
  endpointField.hidden = !def.needsEndpoint;
  const endpointInput = document.getElementById('aiEndpointInput');
  endpointInput.value = saved.endpoint || def.endpoint || '';
  endpointInput.placeholder = def.endpointHint || 'https://.../chat/completions';
}

/**
 * The "ขอ key ได้ที่ …" hint is a real clickable link when keyUrl is a bare
 * domain (Anthropic/Gemini/OpenAI all are) so getting a key is one click, not
 * a copy-paste into a new tab. Supabase's keyUrl is a click-path through its
 * own dashboard ("… → Settings → API"), not a URL, so that one stays plain
 * text — linkifying it would point nowhere real.
 */
function renderAiKeyHint(def) {
  const el = document.getElementById('aiKeyHint');
  el.textContent = def.keyHint;
  if (!def.keyUrl) return;
  el.appendChild(document.createTextNode(' · ขอ key ได้ที่ '));
  const isBareUrl = /^[a-z0-9.-]+\.[a-z]{2,}(\/[^\s]*)?$/i.test(def.keyUrl);
  if (isBareUrl) {
    const a = document.createElement('a');
    a.href = 'https://' + def.keyUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = def.keyUrl;
    el.appendChild(a);
  } else {
    el.appendChild(document.createTextNode(def.keyUrl));
  }
}

function syncAiModelCustomField() {
  const isCustom = document.getElementById('aiModelSelect').value === AI_MODEL_CUSTOM;
  document.getElementById('aiModelCustomField').hidden = !isCustom;
}

/** The model id to save: the dropdown pick, or the typed one. */
function resolveAiModel() {
  const sel = document.getElementById('aiModelSelect');
  return sel.value === AI_MODEL_CUSTOM
    ? document.getElementById('aiModelInput').value.trim()
    : sel.value;
}

function initAiSetupModal() {
  const modal = document.getElementById('aiSetupModal');
  if (!modal) return;

  document.getElementById('aiProviderSelect').addEventListener('change', syncAiSetupFields);
  document.getElementById('aiModelSelect').addEventListener('change', syncAiModelCustomField);
  modal.querySelectorAll('input[name="aiConnMode"]').forEach(r => {
    // Each mode remembers its own last provider, so switching back and forth
    // does not wipe what was already set up on the other side.
    r.addEventListener('change', () => syncAiConnMode(window.iDashAIProviders.loadSettings().providerId));
  });

  function close() { modal.hidden = true; aiSetupOnSaved = null; }
  document.getElementById('aiSetupClose').addEventListener('click', close);
  document.getElementById('aiSetupCancel').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.getElementById('aiSetupSave').addEventListener('click', () => {
    const api = window.iDashAIProviders;
    const id = document.getElementById('aiProviderSelect').value;
    const msg = document.getElementById('aiSetupMsg');

    api.setProviderConfig(id, {
      model: resolveAiModel(),
      apiKey: document.getElementById('aiKeyInput').value.trim(),
      endpoint: document.getElementById('aiEndpointInput').value.trim()
    });

    const problem = api.configProblem();
    if (problem) { msg.className = 'bm-msg'; msg.textContent = problem; return; }

    const next = aiSetupOnSaved;
    close();
    if (next) next();
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

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

const DOMAIN_PACK_IDS = [
  'sugar_factory', 'manufacturing', 'finance_accounting',
  'inventory_warehouse', 'sales_crm', 'hr_people',
  'logistics_transport', 'hotel_hospitality', 'marketing_digital',
  'ecommerce_retail', 'education',
  'generic_business'
];
let domainPacksCache = null;
const kpiDefsCache = {};

function loadDomainPacks() {
  if (domainPacksCache) return domainPacksCache;
  var kb = window.__KB_DOMAIN_PACKS;
  if (kb) {
    domainPacksCache = Promise.resolve(DOMAIN_PACK_IDS.map(function (id) { return kb[id]; }).filter(Boolean));
  } else {
    domainPacksCache = Promise.all(
      DOMAIN_PACK_IDS.map(id => fetch(`kb/domain_packs/${id}.json`).then(r => r.json()))
    );
  }
  return domainPacksCache;
}

async function loadKpiDefsForPack(packId) {
  if (kpiDefsCache[packId] !== undefined) return kpiDefsCache[packId];
  var kb = window.__KB_KPI_DEFS;
  if (kb && kb[packId]) {
    kpiDefsCache[packId] = kb[packId];
    return kpiDefsCache[packId];
  }
  try {
    const resp = await fetch(`kb/kpi_defs/${packId}.json`);
    kpiDefsCache[packId] = resp.ok ? await resp.json() : [];
  } catch (e) {
    kpiDefsCache[packId] = [];
  }
  return kpiDefsCache[packId];
}

/** doc 05 §4: bind against the winning pack's KPI library plus its parent's. */
async function loadKpiDefsChain(winnerPack) {
  const own = await loadKpiDefsForPack(winnerPack.id);
  if (!winnerPack.parent) return own;
  const parentDefs = await loadKpiDefsForPack(winnerPack.parent);
  return own.concat(parentDefs);
}

const AI_PROGRESS_STEP_ORDER = ['upload', 'understand', 'analyze', 'build'];
const AI_PROGRESS_STEP_PCT = { upload: 10, understand: 40, analyze: 75, build: 100 };
const DEFAULT_AUTOPILOT_THEME = { id: 'ocean_blue', name: 'Ocean Blue', accent: '#2563eb', dark: false };

/**
 * Autopilot color is a free pick (user directive 2026-07-18) — the
 * template/structure stays evidence-based, only the accent hue is random
 * here. Falls back to the fixed default if the shared palette isn't loaded.
 */
function pickRandomTheme() {
  const palette = window.iDashThemes;
  if (!palette || palette.length === 0) return DEFAULT_AUTOPILOT_THEME;
  return palette[Math.floor(Math.random() * palette.length)];
}

function openAiProgressModal(buildMode) {
  const modal = document.getElementById('aiProgressModal');
  if (!modal) return;
  document.getElementById('aiProgressError').hidden = true;
  // Template mode names what it's actually doing (matching the upload against
  // the curated library) rather than carrying AI Autopilot's branding, so it
  // reads as a different, faster route than AI Autopilot rather than the same
  // wording at two different speeds.
  document.getElementById('aiProgressHeaderTitle').textContent =
    buildMode === 'template' ? 'กำลังหา Dashboard ที่เหมาะสมกับคุณ' : 'AI Autopilot';
  document.getElementById('aiProgressHeaderSub').textContent =
    buildMode === 'template' ? 'กำลังหา Template ที่เหมาะกับคุณ' : 'กำลังวิเคราะห์ข้อมูลของคุณ';
  document.getElementById('aiProgressDesc').textContent = 'กำลังวิเคราะห์ไฟล์และสร้างข้อมูลเชิงลึกที่เหมาะสมที่สุด...';
  setAiProgress(0);
  AI_PROGRESS_STEP_ORDER.forEach(key => setAiStepStatus(key, 'pending'));
  modal.hidden = false;
}

function closeAiProgressModal() {
  document.getElementById('aiProgressModal').hidden = true;
}

function setAiProgress(pct) {
  document.getElementById('aiProgressPct').textContent = `${pct}%`;
  document.getElementById('aiProgressBarFill').style.width = `${pct}%`;
}

function setAiStepStatus(stepKey, status) {
  const step = document.querySelector(`.ai-progress-step[data-step="${stepKey}"]`);
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
    setAiProgress(AI_PROGRESS_STEP_PCT[stepKey] - 15 > 0 ? AI_PROGRESS_STEP_PCT[stepKey] - 15 : 5);
  } else if (status === 'done') {
    setAiProgress(AI_PROGRESS_STEP_PCT[stepKey]);
  }
}

/**
 * Shows the sheet-picker modal for a multi-sheet workbook and resolves with
 * the final dataset (single sheet as-is, or multiple row-stacked via
 * profiler.mergeSheets). Resolves immediately with the parsed dataset
 * unchanged when the file only has one usable sheet.
 * @param {File} file
 * @returns {Promise<Object>} dataset ready for the pipeline
 */
async function resolveDatasetForPipeline(file) {
  let dataset;
  // Set once a password actually unlocked the workbook, so the plain CSV is
  // only handed back for files the user could not otherwise open.
  let wasLocked = false;
  try {
    dataset = await window.iDashProfiler.parseFile(file);
  } catch (err) {
    if (err && err.code === 'PASSWORD_REQUIRED') {
      let retries = 3;
      while (retries > 0) {
        const pw = await showPasswordModal(file.name, retries < 3 ? 'รหัสผ่านไม่ถูกต้อง — ลองอีกครั้ง' : null);
        if (!pw) throw new Error('ยกเลิกการใส่รหัสผ่าน');
        try {
          dataset = await window.iDashProfiler.parseFile(file, pw);
          wasLocked = true;
          break;
        } catch (e2) {
          if (e2 && (e2.code === 'PASSWORD_WRONG' || e2.code === 'PASSWORD_REQUIRED')) {
            retries--;
            if (retries === 0) throw new Error('รหัสผ่านไม่ถูกต้อง 3 ครั้ง — ยกเลิก');
            continue;
          }
          throw e2;
        }
      }
    } else {
      throw err;
    }
  }
  if (!dataset.multiSheet || !dataset.allSheets || dataset.allSheets.length < 2) {
    if (wasLocked) downloadUnlockedCsv(dataset, file.name);
    return dataset;
  }
  return new Promise((resolve, reject) => {
    openSheetPickerModal(dataset, (selectedNames) => {
      const merged = window.iDashProfiler.mergeSheets(dataset.allSheets, selectedNames);
      const resolved = Object.assign({}, dataset, merged, { allSheets: dataset.allSheets, multiSheet: true });
      if (wasLocked) downloadUnlockedCsv(resolved, file.name);
      resolve(resolved);
    }, () => reject(new Error('ยกเลิกการเลือก Sheet')));
  });
}

/**
 * Hand back an unlocked, password-free CSV of a protected workbook the moment
 * it opens, so the user ends up with a file they can reuse anywhere without
 * knowing how to strip the protection themselves.
 * Best-effort: a failure here must never block the dashboard.
 */
function downloadUnlockedCsv(dataset, originalName) {
  try {
    if (!window.iDashProfiler || !window.iDashProfiler.toCsv) return;
    if (!dataset || !dataset.data || !dataset.data.length) return;

    const csv = window.iDashProfiler.toCsv(dataset);
    // The BOM is what makes Excel read the Thai column names as UTF-8.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const base = String(originalName || 'data').replace(/\.[^.]+$/, '');
    const name = `${base}_ปลดล็อกแล้ว.csv`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (window.iDashToast) {
      window.iDashToast(`ปลดล็อกไฟล์แล้ว — บันทึก ${name} (${dataset.data.length.toLocaleString('en-US')} แถว) ไว้ให้`);
    }
  } catch (e) {
    console.warn('[iDash] unlocked CSV export skipped:', e && e.message);
  }
}

function showPasswordModal(filename, errorMsg) {
  return new Promise((resolve) => {
    let modal = document.getElementById('passwordModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'passwordModal';
      modal.innerHTML =
        '<div style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center">' +
          '<div style="background:#1e293b;border-radius:16px;padding:32px;max-width:400px;width:90%;color:#f1f5f9;box-shadow:0 25px 50px rgba(0,0,0,.4)">' +
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">' +
              '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
              '<div><div style="font-size:16px;font-weight:600">ไฟล์ถูกล็อกรหัสผ่าน</div>' +
              '<div id="pwFileName" style="font-size:13px;color:#94a3b8;margin-top:2px"></div></div>' +
            '</div>' +
            '<input id="pwInput" type="password" placeholder="กรอกรหัสผ่าน" ' +
              'style="width:100%;padding:12px 16px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#f1f5f9;font-size:15px;box-sizing:border-box;outline:none">' +
            '<div id="pwError" style="color:#f87171;font-size:13px;margin-top:8px;display:none"></div>' +
            '<div style="display:flex;gap:8px;align-items:flex-start;margin-top:14px;padding:10px 12px;border-radius:8px;background:#0f172a;border:1px solid #334155">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
              '<div style="font-size:12px;color:#94a3b8;line-height:1.6">ปลดล็อกแล้วระบบจะบันทึกไฟล์ <b style="color:#cbd5e1">CSV ที่ไม่มีรหัสผ่าน</b> ให้อัตโนมัติ นำไปเปิดที่ไหนก็ได้</div>' +
            '</div>' +
            '<div style="display:flex;gap:12px;margin-top:16px">' +
              '<button id="pwCancel" style="flex:1;padding:10px;border-radius:8px;border:1px solid #334155;background:transparent;color:#94a3b8;cursor:pointer;font-size:14px">ยกเลิก</button>' +
              '<button id="pwConfirm" style="flex:1;padding:10px;border-radius:8px;border:none;background:#6366f1;color:#fff;cursor:pointer;font-size:14px;font-weight:600">ปลดล็อก</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);
    }
    modal.style.display = '';
    document.getElementById('pwFileName').textContent = filename;
    var inp = document.getElementById('pwInput');
    var errEl = document.getElementById('pwError');
    inp.value = '';
    if (errorMsg) { errEl.textContent = errorMsg; errEl.style.display = ''; }
    else { errEl.style.display = 'none'; }
    setTimeout(function () { inp.focus(); }, 100);

    function cleanup() { modal.style.display = 'none'; }
    document.getElementById('pwCancel').onclick = function () { cleanup(); resolve(null); };
    document.getElementById('pwConfirm').onclick = function () {
      var v = inp.value;
      if (!v) { errEl.textContent = 'กรุณากรอกรหัสผ่าน'; errEl.style.display = ''; return; }
      cleanup();
      resolve(v);
    };
    inp.onkeydown = function (e) { if (e.key === 'Enter') document.getElementById('pwConfirm').click(); };
  });
}

function openSheetPickerModal(dataset, onConfirm, onCancel) {
  const modal = document.getElementById('sheetPickerModal');
  const listEl = document.getElementById('sheetPickerList');
  const allCb = document.getElementById('sheetPickerAll');
  const confirmBtn = document.getElementById('sheetPickerConfirm');
  const cancelBtn = document.getElementById('sheetPickerCancel');
  const closeBtn = document.getElementById('sheetPickerClose');
  if (!modal) { onConfirm(dataset.allSheets.map(s => s.sheetName)); return; }

  listEl.innerHTML = dataset.allSheets.map((s, i) => `
    <label style="display:flex;align-items:center;gap:8px;padding:8px 0;cursor:pointer">
      <input type="checkbox" class="sheet-picker-item" value="${s.sheetName}" ${s.sheetName === dataset.selectedSheet ? 'checked' : ''}>
      <span style="flex:1">${s.sheetName}</span>
      <span style="color:#94a3b8;font-size:12px">${s.rowCount.toLocaleString()} แถว · ${s.columns.length} คอลัมน์</span>
    </label>
  `).join('');

  function itemCheckboxes() { return Array.from(listEl.querySelectorAll('.sheet-picker-item')); }
  function updateConfirmState() {
    const checked = itemCheckboxes().filter(cb => cb.checked);
    confirmBtn.disabled = checked.length === 0;
    allCb.checked = checked.length === itemCheckboxes().length;
  }

  itemCheckboxes().forEach(cb => cb.addEventListener('change', updateConfirmState));
  allCb.onchange = () => { itemCheckboxes().forEach(cb => { cb.checked = allCb.checked; }); updateConfirmState(); };

  function cleanup() {
    modal.hidden = true;
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
    closeBtn.onclick = null;
  }

  confirmBtn.onclick = () => {
    const selected = itemCheckboxes().filter(cb => cb.checked).map(cb => cb.value);
    cleanup();
    onConfirm(selected);
  };
  cancelBtn.onclick = () => { cleanup(); onCancel(); };
  closeBtn.onclick = () => { cleanup(); onCancel(); };

  updateConfirmState();
  modal.hidden = false;
}

// ── Plan B: curated HTML template injection ──────────────────────────
// When a registry entry has `templateFile`, the dashboard is a pre-made
// HTML page (designed externally — e.g. by Claude) rather than generated
// by iDashInteractiveDashboard. iDash fetches the template, maps the
// uploaded data through `columnMapping`, injects it, and hides the
// template's own upload panel so the user sees a ready-made dashboard.

function toIsoDate(v) {
  if (v == null || v === '') return '';
  if (v instanceof Date) {
    var y = v.getFullYear(), m = String(v.getMonth() + 1).padStart(2, '0'), d = String(v.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  if (typeof v === 'number' && v > 30000 && v < 100000) {
    var ms = Math.round((v - 25569) * 86400 * 1000);
    var dt = new Date(ms);
    return dt.getUTCFullYear() + '-' + String(dt.getUTCMonth() + 1).padStart(2, '0') + '-' + String(dt.getUTCDate()).padStart(2, '0');
  }
  var s = String(v).trim();
  var match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return match[1] + '-' + match[2].padStart(2, '0') + '-' + match[3].padStart(2, '0');
  var parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.getFullYear() + '-' + String(parsed.getMonth() + 1).padStart(2, '0') + '-' + String(parsed.getDate()).padStart(2, '0');
  }
  return '';
}

// Replace each CDN <script src> in a curated template with the inlined
// contents of the matching local vendor file, so the dashboard renders and
// exports fully offline. Matched by library filename, so it works whether
// the template referenced cdnjs or jsdelivr. Unfetchable vendor files leave
// the original CDN tag in place (online fallback).
var TEMPLATE_VENDOR_LIBS = [
  { re: /<script[^>]+src="https?:\/\/[^"]*chart\.umd\.min\.js"[^>]*><\/script>/i, file: 'vendor/chart.umd.min.js' },
  { re: /<script[^>]+src="https?:\/\/[^"]*xlsx\.full\.min\.js"[^>]*><\/script>/i, file: 'vendor/xlsx.full.min.js' },
  { re: /<script[^>]+src="https?:\/\/[^"]*html2canvas\.min\.js"[^>]*><\/script>/i, file: 'vendor/html2canvas.min.js' },
  { re: /<script[^>]+src="https?:\/\/[^"]*jspdf\.umd\.min\.js"[^>]*><\/script>/i, file: 'vendor/jspdf.umd.min.js' },
  { re: /<script[^>]+src="https?:\/\/[^"]*echarts\.min\.js"[^>]*><\/script>/i, file: 'vendor/echarts.min.js' }
];

async function inlineVendorLibs(html) {
  for (var i = 0; i < TEMPLATE_VENDOR_LIBS.length; i++) {
    var lib = TEMPLATE_VENDOR_LIBS[i];
    if (!lib.re.test(html)) continue;
    try {
      var resp = await fetch(lib.file);
      if (!resp.ok) throw new Error('not ok');
      var js = (await resp.text()).replace(/<\/script/gi, '<\\/script');
      html = html.replace(lib.re, function () { return '<script>\n' + js + '\n</scr' + 'ipt>'; });
    } catch (e) {
      html = html.replace(lib.re, function () { return '<script src="' + lib.file + '"></' + 'script>'; });
    }
  }
  return html;
}

/** Load a curated template's HTML, from the offline bundle or over the wire. */
async function loadTemplateHtml(entry) {
  var kb = window.__KB_TEMPLATES;
  if (kb && kb[entry.templateFile]) return kb[entry.templateFile];
  var resp = await fetch('kb/known_datasets/templates/' + entry.templateFile);
  if (!resp.ok) throw new Error('ไม่พบไฟล์ template: ' + entry.templateFile);
  return resp.text();
}

/** ArrayBuffer → base64, chunked so a multi-MB workbook can't blow the stack. */
function bufToBase64(buf) {
  var bytes = new Uint8Array(buf), CHUNK = 0x8000, parts = [];
  for (var i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK)));
  }
  return btoa(parts.join(''));
}

/**
 * Hand the ORIGINAL workbook to a dashboard that already parses Excel itself,
 * then call its own file handler and hide its upload UI.
 *
 * This is the better integration wherever it applies: these dashboards find
 * their own header rows, match column names loosely, and — in the packing
 * report's case — read every sheet in the book. Re-deriving that here from one
 * profiler-chosen sheet would lose data and drift out of sync with the file.
 *
 * entry.inject — one of:
 *   { mode:'file', entryFn:'handleFile', hide:[…] }  call a global handler
 *   { mode:'file', input:'#file',        hide:[…] }  drive its file input
 *
 * The `input` form exists because several dashboards keep their handler inside
 * a closure — there is nothing global to call. Setting the input's files and
 * firing `change` runs the same listener a manual pick would, which is closer
 * to the real path than reaching for internals would be anyway.
 */
async function prepareTemplateFromFile(entry, dataset) {
  var file = dataset.sourceFile;
  if (!file) throw new Error('ไม่พบไฟล์ต้นฉบับสำหรับ template นี้');

  var html = await loadTemplateHtml(entry);
  var inject = entry.inject || {};
  var entryFn = inject.entryFn || 'handleFile';
  var inputSel = inject.input || null;
  var hide = (inject.hide || []).concat(['.upload-panel', '#emptyState', '#libBanner']);

  var b64 = bufToBase64(await file.arrayBuffer());
  var hideCSS = '<style>' + hide.map(function (s) { return s + '{display:none!important}'; }).join('') + '</style>';

  var deliver = inputSel
    ? ('    var el=document.querySelector(' + JSON.stringify(inputSel) + ');\n' +
       '    if(!el){console.error("[iDash] input ' + inputSel + ' not found");return;}\n' +
       '    var dt=new DataTransfer(); dt.items.add(toFile()); el.files=dt.files;\n' +
       '    el.dispatchEvent(new Event("change",{bubbles:true}));\n')
    : ('    if(typeof ' + entryFn + '!=="function"){console.error("[iDash] ' + entryFn + ' not found");return;}\n' +
       '    ' + entryFn + '(toFile());\n');

  // Rebuild a File inside the frame and feed it to the template's own handler,
  // so the exact code path a manual upload takes is the one that runs.
  var boot =
    '<scr' + 'ipt>\n' +
    '(function(){\n' +
    '  var b64=' + JSON.stringify(b64) + ';\n' +
    '  var name=' + JSON.stringify(file.name) + ';\n' +
    '  function toFile(){\n' +
    '    var bin=atob(b64), n=bin.length, a=new Uint8Array(n);\n' +
    '    for(var i=0;i<n;i++)a[i]=bin.charCodeAt(i);\n' +
    '    return new File([a],name,{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});\n' +
    '  }\n' +
    '  function go(){\n' +
    '    try{\n' +
    deliver +
    '    }catch(e){console.error("[iDash] auto-load failed:",e);}\n' +
    '  }\n' +
    '  if(document.readyState==="complete")setTimeout(go,60);\n' +
    '  else window.addEventListener("load",function(){setTimeout(go,60);});\n' +
    '})();\n' +
    '</' + 'script>';

  var headIdx = html.indexOf('</head>');
  if (headIdx >= 0) html = html.substring(0, headIdx) + hideCSS + '\n' + html.substring(headIdx);
  var bodyIdx = html.lastIndexOf('</body>');
  if (bodyIdx >= 0) html = html.substring(0, bodyIdx) + boot + '\n' + html.substring(bodyIdx);
  else html += boot;

  html = await inlineVendorLibs(html);
  return { html: html, rowCount: (dataset.data || []).length };
}

async function prepareTemplateHtml(entry, dataset) {
  var html = await loadTemplateHtml(entry);

  var mapping = entry.columnMapping;
  var today = new Date();
  var todayISO = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  var data = dataset.data || [];
  var dateFields = ['rel', 'warn', 'comp'];
  var numFields = ['qty'];

  // Resolve mapped names against the dataset's ACTUAL headers. Real Excel
  // headers carry newlines/annotations (e.g. "Delivery date Warning\r\n[ 15
  // วันหลังออก PO]"), so match on a normalized form instead of exact equality.
  var actualCols = data.length ? Object.keys(data[0]) : [];
  function normHeader(s) {
    return String(s || '').replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  var resolved = {};
  Object.keys(mapping).forEach(function (field) {
    var want = normHeader(mapping[field]);
    var hit = null;
    for (var k = 0; k < actualCols.length; k++) {
      if (normHeader(actualCols[k]) === want) { hit = actualCols[k]; break; }
    }
    if (!hit) {
      for (var k2 = 0; k2 < actualCols.length; k2++) {
        var n = normHeader(actualCols[k2]);
        if (n.indexOf(want) === 0 || want.indexOf(n) === 0) { hit = actualCols[k2]; break; }
      }
    }
    resolved[field] = hit;
  });

  var raw = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var r = {};
    var keys = Object.keys(mapping);
    for (var j = 0; j < keys.length; j++) {
      var field = keys[j];
      var colName = resolved[field];
      var val = colName ? row[colName] : '';
      if (val === undefined) val = '';
      if (dateFields.indexOf(field) >= 0) {
        r[field] = toIsoDate(val);
      } else if (numFields.indexOf(field) >= 0) {
        r[field] = Number(val) || 0;
      } else {
        r[field] = String(val != null ? val : '').trim();
      }
    }
    if (!r.pr) continue;
    // Status computation (same logic as the procurement template)
    if (!r.po) { r.st = 'no_po'; }
    else if (!r.comp || !r.warn) { r.st = 'no_po'; }
    else if (todayISO > r.comp) { r.st = 'overdue'; }
    else if (todayISO >= r.warn) { r.st = 'warning'; }
    else { r.st = 'on_track'; }
    raw.push(r);
  }

  // Inject CSS to hide upload panel + empty state, then inject data script
  var hideCSS = '<style>.upload-panel{display:none!important}#libBanner{display:none!important}#emptyState{display:none!important}</style>';
  var dataJson = JSON.stringify(raw).replace(/<\/script/gi, '<\\/script');
  var inject = '<script>\n' +
    'RAW=' + dataJson + ';\n' +
    'TODAY=' + JSON.stringify(todayISO) + ';\n' +
    'loadIntoDashboard("Data",RAW.length);\n' +
    '</' + 'script>';

  // Splice at the REAL head/body closers: use lastIndexOf for </body> because
  // inlined JS libraries can contain "</body>" as a string literal (xlsx's
  // HTML-export code does), and a naive replace() would splice mid-script.
  var headIdx = html.indexOf('</head>');
  if (headIdx >= 0) html = html.substring(0, headIdx) + hideCSS + '\n' + html.substring(headIdx);
  var bodyIdx = html.lastIndexOf('</body>');
  if (bodyIdx >= 0) html = html.substring(0, bodyIdx) + inject + '\n' + html.substring(bodyIdx);
  else html += inject;

  // Inline vendor libs LAST so their source can never receive the injections.
  html = await inlineVendorLibs(html);

  return { html: html, rowCount: raw.length };
}

// Small staged pause between pipeline steps. The DET pipeline finishes in
// tens of milliseconds, which reads as "nothing happened" — a short visible
// pacing (~2.5-4s total across the run) lets each progress step register.
// Cosmetic only: it never changes any output (P5-safe).
//
// AI Autopilot runs slower than Template mode by the same mechanism: its real
// network call can take much longer than these fixed pauses, so a bar that
// raced through the DET steps at template speed and then stalled for several
// seconds on the actual AI call would read as frozen. Stretching the pacing
// here keeps the whole bar moving at a rate consistent with what's coming next.
var AI_PACE_MULTIPLIER = 6; // ~15-26s across the run, vs ~2.5-4.4s for template
function aiPause(minMs, maxMs, buildMode) {
  var mult = buildMode === 'ai' ? AI_PACE_MULTIPLIER : 1;
  var ms = (minMs + Math.random() * (maxMs - minMs)) * mult;
  return new Promise(function (res) { setTimeout(res, ms); });
}

// Pre-fetch the local ECharts bundle so the generator can inline it into the
// output HTML (fully offline render + export). Cached after the first call.
async function ensureEchartsSource() {
  if (window.__iDashEchartsSource) return;
  try {
    var r = await fetch('vendor/echarts.min.js');
    if (r.ok) window.__iDashEchartsSource = await r.text();
  } catch (e) { /* generator falls back to the CDN tag */ }
}

async function runAutopilotPipeline(fileOrDataset, userModuleId, opts) {
  opts = opts || {};
  const buildMode = opts.mode === 'ai' ? 'ai' : 'template';
  // Resolve File → dataset (including the sheet-picker step, if needed)
  // BEFORE opening the progress modal, so the picker never has to appear
  // stacked on top of a spinning progress bar.
  let dataset;
  if (fileOrDataset instanceof File) {
    try {
      dataset = await resolveDatasetForPipeline(fileOrDataset);
    } catch (err) {
      return; // user cancelled the sheet picker — quietly back out
    }
  } else {
    dataset = fileOrDataset;
  }

  openAiProgressModal(buildMode);
  const runId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

  // Offline pivot (user directive 2026-07-22, "ไม่ต้องเชื่อม API"): no
  // gateway anywhere — business frame + insight narration both run their
  // deterministic fallbacks. LLM client code stays dormant on disk.
  if (window.iDashBusinessFrame) window.iDashBusinessFrame.configure({ gatewayUrl: null });
  if (window.iDashInsightEngine) window.iDashInsightEngine.configure({ gatewayUrl: null });

  try {
    const echartsReady = ensureEchartsSource();

    setAiStepStatus('upload', 'done');
    await aiPause(400, 700, buildMode);

    setAiStepStatus('understand', 'active');
    const packs = await loadDomainPacks();
    if (!dataset.columns || dataset.columns.length === 0) {
      throw new Error('ไม่พบข้อมูลในไฟล์ที่อัปโหลด');
    }
    const profile = window.iDashClassifier.profileDataset(dataset, { filename: dataset.filename, sheetNames: dataset.sheetNames });
    const classResult = window.iDashClassifier.classify(profile, packs);
    const packById = {};
    packs.forEach(p => { packById[p.id] = p; });
    let winnerPack = packById[classResult.winner.packId] || packById['generic_business'];
    let classificationSource = 'classifier';
    const userPackId = userModuleId && MODULE_TO_PACK[userModuleId];
    if (userPackId && packById[userPackId]) {
      winnerPack = packById[userPackId];
      classificationSource = 'user-module';
    }
    await aiPause(600, 1100, buildMode);
    setAiStepStatus('understand', 'done');

    setAiStepStatus('analyze', 'active');
    let businessFrame = null;
    if (window.iDashBusinessFrame) {
      businessFrame = await window.iDashBusinessFrame.buildBusinessFrame(dataset, winnerPack, classResult, { runId });
    }
    const kpiDefs = await loadKpiDefsChain(winnerPack);
    const bindings = window.iDashKpiEngine.discoverKpis(dataset, kpiDefs);
    const kpiDefById = {};
    kpiDefs.forEach(d => { kpiDefById[d.id] = d; });
    const decisionSpec = window.iDashDecisionEngine.buildDecisionSpec(bindings, kpiDefs, winnerPack);
    await aiPause(700, 1200, buildMode);
    setAiStepStatus('analyze', 'done');

    setAiStepStatus('build', 'active');
    // Template (structure) is still picked from real evidence — only the
    // accent color is a free pick here, per the user's explicit direction
    // for the hands-off Autopilot entry point (2026-07-18): "template ตาม
    // ข้อมูลจริง, สีสุ่มได้เลย". Every other entry point stays deterministic.
    const dashboardSpec = window.iDashComposer.buildDashboardSpec(decisionSpec.decisions, decisionSpec.gaps, bindings, kpiDefById, dataset, null);
    if (dashboardSpec.pages.length === 0) {
      throw new Error('ไม่สามารถสร้าง Dashboard จากข้อมูลนี้ได้ — ลองไฟล์อื่นหรือใช้ Custom Studio');
    }
    let insightStory = null;
    if (window.iDashInsightEngine) {
      const domainContext = { id: winnerPack.id, nameTH: winnerPack.identity.nameTH };
      insightStory = await window.iDashInsightEngine.generateInsights(bindings, dataset, kpiDefById, domainContext, dashboardSpec, { runId });
    }
    await aiPause(800, 1400, buildMode);
    setAiStepStatus('build', 'done');

    document.getElementById('aiProgressHeaderSub').textContent = 'เสร็จสิ้น';
    document.getElementById('aiProgressDesc').textContent = 'สร้าง Dashboard เรียบร้อยแล้ว กำลังเปิด...';

    const styleFamily = window.iDashStyleLibrary ? window.iDashStyleLibrary.getFamilyForDomain(winnerPack.id) : null;
    sessionStorage.removeItem('idash.renderMode');
    sessionStorage.removeItem('idash.interactiveHtml');
    sessionStorage.removeItem('idash.htmlSource');
    sessionStorage.removeItem('idash.aiDesign');

    // ── AI Autopilot: the numbers above are final; the AI only draws them ──
    // Fails closed — any API/safety problem stops here with a real message
    // rather than quietly substituting the template output, which would make
    // it look like the AI ran when it didn't.
    if (buildMode === 'ai') {
      document.getElementById('aiProgressHeaderSub').textContent = 'AI กำลังออกแบบหน้า';
      document.getElementById('aiProgressDesc').textContent =
        'ส่งตัวเลขสรุปให้ AI ออกแบบ อาจใช้เวลาสักครู่...';

      const facts = window.iDashAIComposer.buildFactsPayload(dashboardSpec, {
        filename: dataset.filename,
        datasetTitle: dataset.datasetName || null,
        domainId: winnerPack.id,
        domainNameTH: winnerPack.identity.nameTH
      });
      const out = await window.iDashAIProviders.generateDashboard(facts);
      if (!out.ok) throw new Error('AI Autopilot ไม่สำเร็จ — ' + out.reason);

      try {
        sessionStorage.setItem('idash.interactiveHtml', out.html);
        sessionStorage.setItem('idash.renderMode', 'interactive');
        // Marks the HTML as externally authored so the viewer sandboxes it.
        sessionStorage.setItem('idash.htmlSource', 'ai');
        sessionStorage.setItem('idash.aiDesign', JSON.stringify({
          label: out.label, model: out.model, numbersVerified: out.numbersVerified
        }));
      } catch (e) {
        throw new Error('หน้าที่ AI สร้างมีขนาดใหญ่เกินกว่าจะเก็บในเบราว์เซอร์ได้');
      }
    }

    // ── Known-dataset matching (single-module offline pivot, 2026-07-22):
    // if the uploaded file's columns fingerprint-match a curated registry
    // entry, its hand-tuned blueprint (explicit column→widget bindings +
    // meaningful aggregation) and theme drive the dashboard. Unknown data
    // falls through to the stock shape-routed generation, and the result
    // page offers the "เรียนรู้ข้อมูลชุดนี้" learning-packet export.
    let matched = null;
    let blueprint = null;
    let dashTheme = null;
    let templateEntry = null;
    // The AI route already produced the page; registry matching would only
    // overwrite it. Theme still gets picked below for the meta record.
    if (buildMode !== 'ai' && window.iDashKnownDatasets) {
      const hit = window.iDashKnownDatasets.match(dataset.columns, dataset.sheetNames);
      if (hit) {
        matched = { id: hit.entry.id, nameTH: hit.entry.nameTH, score: Math.round(hit.score * 100) };
        const themes = window.iDashThemes || [];
        dashTheme = themes.find(t => t.id === hit.entry.themeId) || null;

        // Plan B: curated HTML template takes priority over generated dashboard.
        // Two flavours: columnMapping (we parse and inject rows) or
        // inject.mode==='file' (the template parses the workbook itself).
        if (hit.entry.templateFile && (hit.entry.columnMapping || (hit.entry.inject && hit.entry.inject.mode === 'file'))) {
          templateEntry = hit.entry;
        } else {
          blueprint = window.iDashKnownDatasets.validateBlueprint(hit.entry.blueprint, dataset.columns);
          if (blueprint.kpis.length === 0 && blueprint.chartPlan.length === 0) {
            matched = null; blueprint = null; dashTheme = null;
          }
        }
      }
    }
    if (!dashTheme) dashTheme = pickRandomTheme();

    // ── Plan B: curated HTML template ──
    // When a registry entry has templateFile, fetch the pre-made dashboard
    // HTML, inject the user's data via columnMapping, and skip generation.
    if (buildMode === 'ai') {
      /* already rendered by the AI above */
    }
    else if (templateEntry) {
      const tpl = (templateEntry.inject && templateEntry.inject.mode === 'file')
        ? await prepareTemplateFromFile(templateEntry, dataset)
        : await prepareTemplateHtml(templateEntry, dataset);
      try {
        sessionStorage.setItem('idash.interactiveHtml', tpl.html);
        sessionStorage.setItem('idash.renderMode', 'interactive');
      } catch (e) {
        throw new Error('Template HTML มีขนาดใหญ่เกินกว่าจะเก็บในเบราว์เซอร์ได้');
      }
    }
    // ── Plan A: generated dashboard — curated blueprint, or inference ──
    // Inference for unmatched files was removed 2026-07-29 because it summed
    // identifier columns into garbage KPIs ("F_ID 20.18B"), and re-enabled
    // 2026-07-31 (user directive, dashboard-architect skill as the guide)
    // after fixing that failure at its source: the generator now runs a
    // statistical identifier screen (near-unique integer columns are labels,
    // not measures, whatever their name) on top of the name-pattern screen,
    // so the garbage class that justified the refusal can no longer render.
    // Inferred output also self-identifies with a "วิเคราะห์อัตโนมัติ" chip
    // and carries period + as-of stamps, and the "เรียนรู้ข้อมูลชุดนี้"
    // learn-packet button still appears so the file can graduate to a
    // curated template.
    else {
      await echartsReady; // inline local ECharts into the output (offline)
      const ROW_CAPS = [5000, 1500, 500, 150];
      for (let i = 0; i < ROW_CAPS.length; i++) {
        const gen = window.iDashInteractiveDashboard.generate(dashboardSpec, {
          filename: dataset.filename,
          datasetTitle: dataset.datasetName || null,
          domainId: winnerPack.id,
          domainNameTH: winnerPack.identity.nameTH,
          templateId: null,
          templateName: null,
          theme: dashTheme,
          insightStory: insightStory
        }, dashTheme, dataset, { maxRows: ROW_CAPS[i], blueprint: blueprint });
        try {
          sessionStorage.setItem('idash.interactiveHtml', gen.html);
          sessionStorage.setItem('idash.renderMode', 'interactive');
          break;
        } catch (e) {
          if (i === ROW_CAPS.length - 1) {
            throw new Error('ไฟล์มีข้อมูลมากเกินกว่าที่เบราว์เซอร์จะเก็บได้ — ลองไฟล์ที่มีจำนวนแถวน้อยลง');
          }
        }
      }
    }
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
      theme: dashTheme,
      matchedDataset: matched,          // registry hit → header chip
      unknownDataset: !matched,         // → "เรียนรู้ข้อมูลชุดนี้" button
      businessFrame,
      insightStory,
      runId,
      llmMode: 'offline'
    }));
    // Same engine context Studio needs for interactive filters (see theme.js).
    try {
      sessionStorage.setItem('idash.dashboardDataset', JSON.stringify(dataset));
      sessionStorage.setItem('idash.dashboardEngineCtx', JSON.stringify({ kpiDefs: kpiDefs, winnerPack: winnerPack, template: null }));
    } catch (e) {
      sessionStorage.removeItem('idash.dashboardDataset');
      sessionStorage.removeItem('idash.dashboardEngineCtx');
    }

    setTimeout(() => { window.location.href = 'infographic.html'; }, 500);
  } catch (err) {
    const errorEl = document.getElementById('aiProgressError');
    let msg = err.message;
    if (msg === 'Failed to fetch' || msg.includes('NetworkError')) {
      msg = 'โหลดข้อมูลไม่สำเร็จ — กรุณาตรวจสอบว่าไฟล์ข้อมูลครบถ้วน';
    }
    errorEl.textContent = `สร้าง Dashboard ไม่สำเร็จ: ${msg}`;
    errorEl.hidden = false;
    // Clear the in-progress copy, otherwise "กำลังออกแบบ…" sits above the
    // failure message and the modal reads as still working.
    const headerSub = document.getElementById('aiProgressHeaderSub');
    const desc = document.getElementById('aiProgressDesc');
    if (headerSub) headerSub.textContent = 'ไม่สำเร็จ';
    if (desc) desc.textContent = buildMode === 'ai'
      ? 'ลองตรวจสอบการตั้งค่า AI แล้วลองใหม่อีกครั้ง'
      : 'ปิดหน้าต่างนี้แล้วลองใหม่อีกครั้ง';
    document.querySelectorAll('#aiProgressModal .ai-step').forEach(el => {
      el.classList.remove('active');
    });
  }
}

// ── Theme Picker (module flow only) ──────────────────────────────────
let pendingThemeDataset = null;
let pendingThemeModuleId = null;
let selectedTheme = null;

function buildSwatchHtml(t) {
  return `<div class="theme-swatch" data-theme-id="${t.id}" data-dark="${t.dark}" style="
    width:100%;aspect-ratio:1;border-radius:10px;cursor:pointer;
    background:${t.dark ? t.bg || '#1e293b' : t.bg || '#fff'};border:3px solid transparent;
    display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;
    box-shadow:0 1px 4px rgba(0,0,0,0.08);transition:all 0.15s;position:relative;overflow:hidden
  ">
    <div style="width:48%;height:48%;border-radius:50%;background:${t.accent}"></div>
    <div style="font-size:8px;color:${t.dark ? '#94a3b8' : '#64748b'};font-weight:500;line-height:1;text-align:center;padding:0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%">${t.name}</div>
  </div>`;
}

function openThemePicker(dataset, moduleId) {
  pendingThemeDataset = dataset;
  pendingThemeModuleId = moduleId;
  selectedTheme = null;

  const modal = document.getElementById('themePickerModal');
  const grid = document.getElementById('themePickerGrid');
  const confirmBtn = document.getElementById('themePickerConfirm');
  const cancelBtn = document.getElementById('themePickerCancel');
  const closeBtn = document.getElementById('themePickerClose');
  if (!modal) { runModulePipeline(dataset, moduleId, window.iDashThemes[0]); return; }

  const themes = window.iDashThemes || [];

  function filterByTab(tab) {
    if (tab === 'all') return themes;
    if (tab === 'light') return themes.filter(t => t.category === 'light');
    if (tab === 'dark') return themes.filter(t => t.category === 'dark');
    if (tab === 'colorful') return themes.filter(t => t.category === 'colorful');
    if (tab === 'pastel') return themes.filter(t => t.category === 'pastel');
    if (tab === 'pro') return themes.filter(t => t.category === 'pro');
    return themes;
  }

  const tabEls = modal.querySelectorAll('.tp-tab');
  tabEls.forEach(tab => {
    const cnt = tab.querySelector('.tp-tab-count');
    if (cnt) cnt.textContent = '(' + filterByTab(tab.dataset.tab).length + ')';
  });

  function renderGrid(filter) {
    const list = filterByTab(filter);
    grid.innerHTML = list.map(t => buildSwatchHtml(t)).join('');
    grid.querySelectorAll('.theme-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        grid.querySelectorAll('.theme-swatch').forEach(s => {
          s.style.borderColor = 'transparent';
          s.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
        });
        swatch.style.borderColor = '#2563eb';
        swatch.style.boxShadow = '0 0 0 2px #2563eb, 0 2px 8px rgba(37,99,235,0.25)';
        selectedTheme = themes.find(t => t.id === swatch.dataset.themeId);
        confirmBtn.disabled = false;
      });
      swatch.addEventListener('dblclick', () => {
        selectedTheme = themes.find(t => t.id === swatch.dataset.themeId);
        if (selectedTheme) confirmBtn.click();
      });
    });
    if (selectedTheme) {
      const sel = grid.querySelector(`[data-theme-id="${selectedTheme.id}"]`);
      if (sel) {
        sel.style.borderColor = '#2563eb';
        sel.style.boxShadow = '0 0 0 2px #2563eb, 0 2px 8px rgba(37,99,235,0.25)';
      }
    }
  }

  renderGrid('all');

  tabEls.forEach(tab => {
    tab.onclick = () => {
      tabEls.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderGrid(tab.dataset.tab);
    };
  });

  const first = grid.querySelector('.theme-swatch');
  if (first) first.click();

  function cleanup() { modal.hidden = true; }

  confirmBtn.onclick = () => {
    if (!selectedTheme) return;
    cleanup();
    runModulePipeline(pendingThemeDataset, pendingThemeModuleId, selectedTheme);
  };
  cancelBtn.onclick = cleanup;
  closeBtn.onclick = cleanup;
  modal.addEventListener('click', e => { if (e.target === modal) cleanup(); });

  modal.hidden = false;
}

/**
 * Module pipeline — runs deterministic pipeline then generates an interactive
 * self-contained HTML dashboard. Zero AI tokens consumed.
 */
async function runModulePipeline(dataset, userModuleId, theme) {
  openAiProgressModal();

  try {
    setAiStepStatus('upload', 'done');
    setAiStepStatus('understand', 'active');

    const packs = await loadDomainPacks();
    const profile = window.iDashClassifier.profileDataset(dataset, { filename: dataset.filename, sheetNames: dataset.sheetNames });
    const classResult = window.iDashClassifier.classify(profile, packs);
    const packById = {};
    packs.forEach(p => { packById[p.id] = p; });

    let winnerPack = packById[classResult.winner.packId] || packById['generic_business'];
    const userPackId = userModuleId && MODULE_TO_PACK[userModuleId];
    if (userPackId && packById[userPackId]) {
      winnerPack = packById[userPackId];
    }
    await aiPause(600, 1100);
    setAiStepStatus('understand', 'done');

    setAiStepStatus('analyze', 'active');
    const kpiDefs = await loadKpiDefsChain(winnerPack);
    const bindings = window.iDashKpiEngine.discoverKpis(dataset, kpiDefs);
    const kpiDefById = {};
    kpiDefs.forEach(d => { kpiDefById[d.id] = d; });
    const decisionSpec = window.iDashDecisionEngine.buildDecisionSpec(bindings, kpiDefs, winnerPack);
    await aiPause(700, 1200);
    setAiStepStatus('analyze', 'done');

    setAiStepStatus('build', 'active');
    const dashboardSpec = window.iDashComposer.buildDashboardSpec(decisionSpec.decisions, decisionSpec.gaps, bindings, kpiDefById, dataset, null);

    if (dashboardSpec.pages.length === 0) {
      throw new Error('ไม่สามารถสร้าง Dashboard จากข้อมูลนี้ได้ — ลองไฟล์อื่น');
    }

    const meta = {
      filename: dataset.filename,
      datasetTitle: dataset.datasetName || null,
      domainId: winnerPack.id,
      domainNameTH: winnerPack.identity.nameTH,
      templateId: null,
      templateName: null,
      theme: theme
    };

    // Generate interactive HTML (no AI, no tokens). Large uploads (many
    // rows × columns) can produce a self-contained HTML string bigger than
    // the browser's sessionStorage quota (~5-10MB) — retry with a smaller
    // embedded-row cap instead of failing outright. KPI totals stay correct
    // at any cap since FULL_KPI_STATS is computed from the untruncated data.
    const ROW_CAP_ATTEMPTS = [5000, 1500, 500, 150];
    await ensureEchartsSource(); // inline local ECharts into the output (offline)
    let result = null;
    let storageOk = false;
    for (let i = 0; i < ROW_CAP_ATTEMPTS.length; i++) {
      result = window.iDashInteractiveDashboard.generate(dashboardSpec, meta, theme, dataset, { maxRows: ROW_CAP_ATTEMPTS[i] });
      try {
        sessionStorage.setItem('idash.interactiveHtml', result.html);
        storageOk = true;
        break;
      } catch (e) {
        if (i === ROW_CAP_ATTEMPTS.length - 1) throw new Error('ไฟล์มีข้อมูลมากเกินกว่าที่เบราว์เซอร์จะเก็บได้ — ลองไฟล์ที่มีจำนวนแถวหรือคอลัมน์น้อยลง');
      }
    }
    if (!storageOk) return; // unreachable (loop throws on last attempt) — guards against silent fallthrough
    setAiStepStatus('build', 'done');

    document.getElementById('aiProgressHeaderSub').textContent = 'เสร็จสิ้น';
    document.getElementById('aiProgressDesc').textContent = 'สร้าง Dashboard เรียบร้อยแล้ว กำลังเปิด...';

    // Store for the preview page
    sessionStorage.setItem('idash.renderMode', 'interactive');
    sessionStorage.setItem('idash.dashboardMeta', JSON.stringify(meta));
    sessionStorage.setItem('idash.dashboardSpec', JSON.stringify(dashboardSpec));
    try {
      sessionStorage.setItem('idash.dashboardDataset', JSON.stringify(dataset));
      sessionStorage.setItem('idash.dashboardEngineCtx', JSON.stringify({ kpiDefs, winnerPack, template: null }));
    } catch (e) { /* dataset too large for sessionStorage — non-critical */ }

    setTimeout(() => { window.location.href = 'infographic.html'; }, 400);
  } catch (err) {
    const errorEl = document.getElementById('aiProgressError');
    let msg = err.message;
    if (msg === 'Failed to fetch' || msg.includes('NetworkError')) {
      msg = 'โหลดข้อมูลไม่สำเร็จ — กรุณาตรวจสอบว่าไฟล์ข้อมูลครบถ้วน';
    }
    errorEl.textContent = `สร้าง Dashboard ไม่สำเร็จ: ${msg}`;
    errorEl.hidden = false;
  }
}

function initAiProgressModal() {
  const modal = document.getElementById('aiProgressModal');
  if (!modal) return;
  document.getElementById('aiProgressClose').addEventListener('click', closeAiProgressModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeAiProgressModal(); });
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lbImg = lightbox.querySelector('img');
  const lbClose = lightbox.querySelector('.lightbox-close');

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.template-card, .gallery-card');
    if (card) {
      const img = card.querySelector('img');
      if (img) {
        lbImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  lbClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox(); });
}

