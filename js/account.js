/**
 * iDash — Profile & Settings pages
 *
 * One script for both pages; each block no-ops when its elements are absent.
 * The profile lives in localStorage ('idash.profile') because there is no
 * account backend yet — sidebar.js reads the same key on every page, so a
 * name saved here follows the user across the whole app immediately.
 */
(function () {
  'use strict';

  var PROFILE_KEY = 'idash.profile';

  function loadProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }

  /* ── Profile page ─────────────────────────────────────────────────────── */
  var pfForm = document.getElementById('pfForm');
  if (pfForm) {
    var nameEl = document.getElementById('pfName');
    var roleEl = document.getElementById('pfRole');
    var emailEl = document.getElementById('pfEmail');
    var msg = document.getElementById('pfMsg');

    function fill() {
      var p = loadProfile();
      nameEl.value = p.name || 'Bobo';
      roleEl.value = p.role || 'Admin';
      emailEl.value = p.email || '';
      preview();
    }
    function preview() {
      var n = nameEl.value.trim() || 'Bobo';
      document.getElementById('pfNamePreview').textContent = n;
      document.getElementById('pfRolePreview').textContent = roleEl.value.trim() || 'Admin';
      document.getElementById('pfAvatar').textContent = n.charAt(0).toUpperCase();
    }
    nameEl.addEventListener('input', preview);
    roleEl.addEventListener('input', preview);

    pfForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = emailEl.value.trim();
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) {
        msg.className = 'acct-msg err';
        msg.textContent = 'รูปแบบอีเมลไม่ถูกต้อง';
        return;
      }
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({
          name: nameEl.value.trim(), role: roleEl.value.trim(), email: em
        }));
        msg.className = 'acct-msg ok';
        msg.textContent = 'บันทึกแล้ว — มีผลกับทุกหน้าทันที';
        if (window.iDashSidebarProfile) window.iDashSidebarProfile.refresh();
      } catch (e2) {
        msg.className = 'acct-msg err';
        msg.textContent = 'บันทึกไม่สำเร็จ — พื้นที่เก็บข้อมูลของเบราว์เซอร์เต็ม';
      }
    });

    document.getElementById('pfReset').addEventListener('click', function () {
      fill();
      msg.className = 'acct-msg';
      msg.textContent = '';
    });
    document.getElementById('pfSignOut').addEventListener('click', function () {
      if (window.iDashAuth) window.iDashAuth.signOut();
    });
    fill();
  }

  /* ── Settings page — AI connection ────────────────────────────────────── */
  var provSel = document.getElementById('stProvider');
  if (provSel && window.iDashAIProviders) {
    var api = window.iDashAIProviders;
    var CUSTOM = '__custom__';
    var keyEl = document.getElementById('stKey');
    var epField = document.getElementById('stEndpointField');
    var epEl = document.getElementById('stEndpoint');
    var modelSel = document.getElementById('stModel');
    var modelCustomField = document.getElementById('stModelCustomField');
    var modelCustomEl = document.getElementById('stModelCustom');
    var pinField = document.getElementById('stPinField');
    var pinEl = document.getElementById('stPin');
    var stMsg = document.getElementById('stMsg');

    Object.keys(api.PROVIDERS).forEach(function (id) {
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = api.PROVIDERS[id].label;
      provSel.appendChild(opt);
    });

    function syncFields() {
      var id = provSel.value;
      var def = api.PROVIDERS[id];
      var saved = (api.loadSettings().byProvider || {})[id] || {};
      var model = saved.model || def.defaultModel || '';

      modelSel.innerHTML = '';
      (def.models || []).forEach(function (m) {
        var opt = document.createElement('option');
        opt.value = m.id; opt.textContent = m.label;
        modelSel.appendChild(opt);
      });
      var cOpt = document.createElement('option');
      cOpt.value = CUSTOM; cOpt.textContent = 'อื่นๆ (พิมพ์ชื่อโมเดลเอง)';
      modelSel.appendChild(cOpt);
      var known = (def.models || []).some(function (m) { return m.id === model; });
      modelSel.value = known ? model : CUSTOM;
      modelCustomEl.value = known ? '' : model;
      modelCustomField.hidden = modelSel.value !== CUSTOM;

      keyEl.value = saved.apiKey || '';
      document.getElementById('stKeyHint').textContent = def.keyHint || '';
      epField.hidden = !def.needsEndpoint;
      epEl.value = saved.endpoint || def.endpoint || '';
      epEl.placeholder = def.endpointHint || '';
      pinField.hidden = def.shape !== 'supabase';
      pinEl.value = saved.pin || '';
      stMsg.className = 'acct-msg'; stMsg.textContent = '';
    }
    provSel.addEventListener('change', syncFields);
    modelSel.addEventListener('change', function () {
      modelCustomField.hidden = modelSel.value !== CUSTOM;
    });

    function commit() {
      api.setProviderConfig(provSel.value, {
        model: modelSel.value === CUSTOM ? modelCustomEl.value.trim() : modelSel.value,
        apiKey: keyEl.value.trim(),
        endpoint: epEl.value.trim(),
        pin: pinEl.value.trim()
      });
    }

    document.getElementById('stSave').addEventListener('click', function () {
      commit();
      var problem = api.configProblem();
      stMsg.className = problem ? 'acct-msg err' : 'acct-msg ok';
      stMsg.textContent = problem || 'บันทึกแล้ว — ใช้ได้กับ AI Autopilot ทันที';
    });

    document.getElementById('stTest').addEventListener('click', function () {
      commit();
      var btn = document.getElementById('stTest');
      btn.disabled = true;
      stMsg.className = 'acct-msg';
      stMsg.textContent = 'กำลังติดต่อผู้ให้บริการ…';
      api.testConnection().then(function (res) {
        stMsg.className = res.ok ? 'acct-msg ok' : 'acct-msg err';
        stMsg.textContent = res.ok
          ? '✅ เชื่อมต่อสำเร็จ — ' + res.label + ' · ' + res.model + (res.note ? ' (' + res.note + ')' : '')
          : '❌ ' + res.reason;
      }).finally(function () { btn.disabled = false; });
    });

    provSel.value = api.loadSettings().providerId || 'anthropic';
    syncFields();
  }

  /* ── Settings page — local data ───────────────────────────────────────── */
  var clearMsg = document.getElementById('clearMsg');
  if (clearMsg) {
    var CLEAR_SETS = {
      dashboards: { keys: ['idash.customDashboards', 'idash.customAutosave'], label: 'แดชบอร์ดที่บันทึกไว้' },
      ai: { keys: ['idash.ai.providerId', 'idash.aiProvider'], label: 'การตั้งค่า AI' },
      profile: { keys: [PROFILE_KEY], label: 'โปรไฟล์ในเครื่อง' }
    };
    document.querySelectorAll('[data-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var set = CLEAR_SETS[btn.dataset.clear];
        if (!set) return;
        if (!confirm('ลบ' + set.label + '? ลบแล้วกู้คืนไม่ได้')) return;
        set.keys.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
        // AI settings live under keys that include per-provider stores — sweep
        // any idash.ai* key so nothing half-configured survives.
        if (btn.dataset.clear === 'ai') {
          Object.keys(localStorage).forEach(function (k) {
            if (/^idash\.ai/i.test(k)) { try { localStorage.removeItem(k); } catch (e) {} }
          });
        }
        clearMsg.className = 'acct-msg ok';
        clearMsg.textContent = 'ลบ' + set.label + 'แล้ว';
        if (btn.dataset.clear === 'profile' && window.iDashSidebarProfile) window.iDashSidebarProfile.refresh();
      });
    });
  }

  /* ── Settings page — build version ────────────────────────────────────── */
  var buildEl = document.getElementById('aboutBuild');
  if (buildEl) {
    fetch('version.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (v) { buildEl.textContent = (v && v.build) || 'ไม่ทราบ'; })
      .catch(function () { buildEl.textContent = 'ไม่ทราบ'; });
  }
})();
