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

    // Photo pending save — starts as whatever is stored; null = deleted.
    var photoData = null;

    function fill() {
      var p = loadProfile();
      nameEl.value = p.name || 'Bobo';
      roleEl.value = p.role || 'Admin';
      emailEl.value = p.email || '';
      photoData = p.photo || null;
      preview();
    }
    function preview() {
      var n = nameEl.value.trim() || 'Bobo';
      document.getElementById('pfNamePreview').textContent = n;
      document.getElementById('pfRolePreview').textContent = roleEl.value.trim() || 'Admin';
      var av = document.getElementById('pfAvatar');
      av.textContent = n.charAt(0).toUpperCase();
      av.classList.toggle('has-photo', !!photoData);
      av.style.backgroundImage = photoData ? 'url(' + photoData + ')' : '';
      document.getElementById('pfPhotoRemove').hidden = !photoData;
      document.getElementById('pfPhotoPick').textContent = photoData ? 'เปลี่ยนรูป' : 'อัปโหลดรูป';
    }
    nameEl.addEventListener('input', preview);
    roleEl.addEventListener('input', preview);

    /* Any image, any size, becomes a 128×128 cover-cropped JPEG (~5-10KB)
     * before it goes anywhere near localStorage — a phone photo stored raw
     * would blow the ~5MB quota on its own and take every other saved thing
     * down with it. */
    function toAvatar(file) {
      return new Promise(function (resolve, reject) {
        if (!/^image\//.test(file.type)) { reject(new Error('ไฟล์นี้ไม่ใช่รูปภาพ')); return; }
        var img = new Image();
        var url = URL.createObjectURL(file);
        img.onload = function () {
          URL.revokeObjectURL(url);
          try {
            var S = 128;
            var c = document.createElement('canvas');
            c.width = S; c.height = S;
            var side = Math.min(img.naturalWidth, img.naturalHeight);
            var sx = (img.naturalWidth - side) / 2;
            var sy = (img.naturalHeight - side) / 2;
            c.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, S, S);
            resolve(c.toDataURL('image/jpeg', 0.85));
          } catch (e) { reject(new Error('อ่านรูปไม่สำเร็จ')); }
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('อ่านรูปไม่สำเร็จ')); };
        img.src = url;
      });
    }

    var fileEl = document.getElementById('pfPhotoFile');
    function pickPhoto() { fileEl.click(); }
    document.getElementById('pfPhotoPick').addEventListener('click', pickPhoto);
    document.getElementById('pfAvatarBtn').addEventListener('click', pickPhoto);
    fileEl.addEventListener('change', function () {
      var f = fileEl.files[0];
      fileEl.value = '';
      if (!f) return;
      toAvatar(f).then(function (data) {
        photoData = data;
        preview();
        msg.className = 'acct-msg';
        msg.textContent = 'กด "บันทึกโปรไฟล์" เพื่อใช้รูปนี้';
      }).catch(function (err) {
        msg.className = 'acct-msg err';
        msg.textContent = err.message;
      });
    });
    document.getElementById('pfPhotoRemove').addEventListener('click', function () {
      photoData = null;
      preview();
      msg.className = 'acct-msg';
      msg.textContent = 'กด "บันทึกโปรไฟล์" เพื่อยืนยันการลบรูป';
    });

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
          name: nameEl.value.trim(), role: roleEl.value.trim(), email: em,
          photo: photoData || undefined
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

  /* ── Settings page — section tabs ─────────────────────────────────────── */
  var setNav = document.getElementById('setNav');
  if (setNav) {
    var tabs = setNav.querySelectorAll('.set-tab');
    var sections = document.querySelectorAll('.set-section');
    function showTab(name) {
      tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.tab === name); });
      sections.forEach(function (s) { s.hidden = s.dataset.section !== name; });
      // Deep-linkable (settings.html#security), like settings pages elsewhere.
      try { history.replaceState(null, '', '#' + name); } catch (e) {}
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { showTab(t.dataset.tab); });
    });
    var initial = (location.hash || '').slice(1);
    if ([].some.call(tabs, function (t) { return t.dataset.tab === initial; })) showTab(initial);
  }

  /* ── Settings page — general ──────────────────────────────────────────── */
  var startSel = document.getElementById('gnStartPage');
  if (startSel) {
    try { startSel.value = localStorage.getItem('idash.pref.startPage') || 'index.html'; } catch (e) {}
    if (!startSel.value) startSel.value = 'index.html';
    document.getElementById('gnSave').addEventListener('click', function () {
      var msg = document.getElementById('gnMsg');
      try {
        localStorage.setItem('idash.pref.startPage', startSel.value);
        msg.className = 'acct-msg ok';
        msg.textContent = 'บันทึกแล้ว — มีผลเมื่อเข้าสู่ระบบครั้งถัดไป';
      } catch (e) {
        msg.className = 'acct-msg err';
        msg.textContent = 'บันทึกไม่สำเร็จ';
      }
    });
  }

  /* ── Settings page — security (device-local password change) ──────────── */
  var secForm = document.getElementById('secForm');
  if (secForm && window.iDashAuth) {
    var secMsg = document.getElementById('secMsg');
    function secStatus() {
      var el = document.getElementById('secStatus');
      var custom = window.iDashAuth.hasLocalPassword();
      el.textContent = custom ? 'ใช้รหัสที่ตั้งเองบนเครื่องนี้' : 'ใช้รหัสเริ่มต้นของระบบ';
      el.className = custom ? 'set-badge ok' : 'set-badge';
    }
    secStatus();

    secForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var u = document.getElementById('secUser').value.trim();
      var cur = document.getElementById('secCurrent').value;
      var n1 = document.getElementById('secNew').value;
      var n2 = document.getElementById('secNew2').value;
      secMsg.className = 'acct-msg err';
      if (!u || !cur) { secMsg.textContent = 'กรอกชื่อผู้ใช้และรหัสผ่านปัจจุบัน'; return; }
      if (n1.length < 6) { secMsg.textContent = 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร'; return; }
      if (n1 !== n2) { secMsg.textContent = 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน'; return; }
      secMsg.className = 'acct-msg';
      secMsg.textContent = 'กำลังตรวจสอบ…';
      // The current credential must verify BEFORE anything is replaced —
      // otherwise anyone at an unlocked machine could silently take over.
      window.iDashAuth.verify(u, cur).then(function (ok) {
        if (!ok) {
          secMsg.className = 'acct-msg err';
          secMsg.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านปัจจุบันไม่ถูกต้อง';
          return;
        }
        return window.iDashAuth.setLocalPassword(u, n1).then(function (saved) {
          secMsg.className = saved ? 'acct-msg ok' : 'acct-msg err';
          secMsg.textContent = saved
            ? 'เปลี่ยนรหัสผ่านแล้ว — ใช้กับการเข้าสู่ระบบครั้งถัดไปบนเครื่องนี้'
            : 'บันทึกไม่สำเร็จ';
          if (saved) { secForm.reset(); secStatus(); }
        });
      });
    });

    document.getElementById('secReset').addEventListener('click', function () {
      if (!window.iDashAuth.hasLocalPassword()) {
        secMsg.className = 'acct-msg';
        secMsg.textContent = 'เครื่องนี้ใช้รหัสเริ่มต้นอยู่แล้ว';
        return;
      }
      if (!confirm('กลับไปใช้รหัสเริ่มต้นของระบบ? รหัสที่ตั้งเองบนเครื่องนี้จะถูกลบ')) return;
      window.iDashAuth.clearLocalPassword();
      secMsg.className = 'acct-msg ok';
      secMsg.textContent = 'กลับไปใช้รหัสเริ่มต้นแล้ว';
      secStatus();
    });
  }

  /* ── Settings page — backup / restore ─────────────────────────────────── */
  var bkExport = document.getElementById('bkExport');
  if (bkExport) {
    var bkMsg = document.getElementById('bkMsg');
    bkExport.addEventListener('click', function () {
      var out = {};
      Object.keys(localStorage).forEach(function (k) {
        if (/^idash\./.test(k)) out[k] = localStorage.getItem(k);
      });
      var blob = new Blob([JSON.stringify({ app: 'iDash', exportedAt: new Date().toISOString(), data: out }, null, 2)],
        { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'idash-settings-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
      bkMsg.className = 'acct-msg ok';
      bkMsg.textContent = 'ดาวน์โหลดแล้ว — ไฟล์นี้มี API key ด้วย เก็บให้ปลอดภัย';
    });

    document.getElementById('bkImportBtn').addEventListener('click', function () {
      document.getElementById('bkImportFile').click();
    });
    document.getElementById('bkImportFile').addEventListener('change', function () {
      var f = this.files[0];
      this.value = '';
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          var data = parsed && parsed.app === 'iDash' && parsed.data;
          if (!data) throw new Error('bad');
          var n = 0;
          Object.keys(data).forEach(function (k) {
            // Only idash.* keys, so a crafted file can't plant anything else.
            if (/^idash\./.test(k) && typeof data[k] === 'string') {
              localStorage.setItem(k, data[k]); n++;
            }
          });
          bkMsg.className = 'acct-msg ok';
          bkMsg.textContent = 'กู้คืนแล้ว ' + n + ' รายการ — รีเฟรชหน้าเพื่อใช้ค่าใหม่';
          if (window.iDashSidebarProfile) window.iDashSidebarProfile.refresh();
        } catch (e) {
          bkMsg.className = 'acct-msg err';
          bkMsg.textContent = 'ไฟล์นี้ไม่ใช่ไฟล์สำรองของ iDash';
        }
      };
      reader.readAsText(f);
    });
  }

  /* ── Settings page — about ────────────────────────────────────────────── */
  var buildEl = document.getElementById('aboutBuild');
  if (buildEl) {
    fetch('version.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (v) { buildEl.textContent = (v && v.build) || 'ไม่ทราบ'; })
      .catch(function () { buildEl.textContent = 'ไม่ทราบ'; });
  }
  var aboutUpdate = document.getElementById('aboutUpdate');
  if (aboutUpdate) {
    aboutUpdate.addEventListener('click', function () {
      var msg = document.getElementById('aboutMsg');
      msg.className = 'acct-msg';
      msg.textContent = 'กำลังตรวจ…';
      // Same mechanism as build_guard: reload stamped with the server's build
      // id, which busts the GitHub Pages cache immediately.
      fetch('version.json', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (v) {
          var b = (v && v.build) || Date.now();
          window.location.href = window.location.pathname + '?b=' + encodeURIComponent(b) + window.location.hash;
        })
        .catch(function () {
          msg.className = 'acct-msg err';
          msg.textContent = 'ตรวจไม่สำเร็จ — ลองใหม่ภายหลัง';
        });
    });
  }
})();
