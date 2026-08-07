// Request Dashboard — collects the form, base64s the attachments, and posts to
// the Apps Script mailer which emails ADMIN_EMAIL.
//
// Script source of truth: app/data/integrations/dashboard_request_mailer.gs
// Deploy it as its OWN Web App deployment, then paste the /exec URL below.
(function () {
  'use strict';

  // ── Apps Script Web App /exec URL ─────────────────────────────────────────
  // Consolidated into the account service (signup_log.gs) so there is one
  // Apps Script to deploy, not two — dashboard requests POST here with
  // action:'dashreq', and the "ทำเสร็จ" button links back to this same
  // deployment's doGet. Same URL as auth.js accountApiUrl.
  var REQUEST_API_URL = 'https://script.google.com/macros/s/AKfycbwGAHWfHN-u6WW1uPLWo12vMRdj2aLNJIdi458UNm6vza1yDT1PH_1EcU0qNbNSY7NW9w/exec';
  // ──────────────────────────────────────────────────────────────────────────
  // Or set it without editing this file, from the browser console:
  //   iDashRequest.setUrl('https://script.google.com/macros/s/.../exec')
  function apiUrl() {
    return REQUEST_API_URL ||
      window.IDASH_REQUEST_API_URL ||
      localStorage.getItem('idash.requestApiUrl') ||
      '';
  }

  var ADMIN_EMAIL = 'Surasakna@mitrphol.com';
  var MAX_FILES = 8;
  var MAX_TOTAL_BYTES = 15 * 1024 * 1024;
  var DRAFT_KEY = 'idash.requestDraft';

  // The example-dashboard picker only makes sense for a brand-new dashboard.
  var EXAMPLE_SUBJECT = 'ขอสร้าง Dashboard ใหม่';

  var picked = [];   // File objects staged for upload

  var el = {};
  function $(id) { return document.getElementById(id); }

  // ── helpers ───────────────────────────────────────────────────────────────
  function fmtSize(n) {
    if (n >= 1048576) return (n / 1048576).toFixed(1) + ' MB';
    return Math.max(1, Math.round(n / 1024)) + ' KB';
  }
  function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim()); }
  /** The signed-in sheet account's username, or '' for the built-in owner. */
  function loggedInUsername() {
    try { return (JSON.parse(localStorage.getItem('idash.account') || 'null') || {}).username || ''; }
    catch (e) { return ''; }
  }
  function totalBytes() {
    return picked.reduce(function (s, f) { return s + f.size; }, 0);
  }

  function status(kind, message) {
    var icons = {
      ok:   '<polyline points="20 6 9 17 4 12"/>',
      err:  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/>',
      info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/>'
    };
    el.status.innerHTML =
      '<div class="req-status ' + kind + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
        'stroke-linecap="round" stroke-linejoin="round">' + icons[kind] + '</svg>' +
        '<div>' + message + '</div>' +
      '</div>';
  }
  function clearStatus() { el.status.innerHTML = ''; }

  function markError(node, on) {
    if (node) node.classList.toggle('req-err-field', !!on);
  }

  // ── attachments ───────────────────────────────────────────────────────────
  function renderFiles() {
    el.fileList.innerHTML = '';
    picked.forEach(function (f, i) {
      var li = document.createElement('li');
      li.className = 'req-file';
      li.innerHTML =
        '<svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>' +
        '<polyline points="14 2 14 8 20 8"/></svg>' +
        '<span class="req-file-name"></span>' +
        '<span class="req-file-size">' + fmtSize(f.size) + '</span>' +
        '<button class="req-file-x" type="button" title="เอาออก">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
        'stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>';
      // File names are user data — set as text, never as HTML.
      li.querySelector('.req-file-name').textContent = f.name;
      li.querySelector('.req-file-x').addEventListener('click', function () {
        picked.splice(i, 1);
        renderFiles();
      });
      el.fileList.appendChild(li);
    });
  }

  function addFiles(list) {
    clearStatus();
    var incoming = Array.prototype.slice.call(list);
    for (var i = 0; i < incoming.length; i++) {
      var f = incoming[i];
      if (picked.length >= MAX_FILES) {
        status('err', 'แนบไฟล์ได้สูงสุด ' + MAX_FILES + ' ไฟล์');
        break;
      }
      if (totalBytes() + f.size > MAX_TOTAL_BYTES) {
        status('err', 'ไฟล์แนบรวมเกิน 15 MB — เอาบางไฟล์ออก หรือบีบอัดก่อนส่ง');
        break;
      }
      picked.push(f);
    }
    renderFiles();
  }

  // Strip the "data:...;base64," prefix — the mailer wants raw base64.
  function readAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        var s = String(fr.result);
        var comma = s.indexOf(',');
        resolve({
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          data: comma > -1 ? s.slice(comma + 1) : s
        });
      };
      fr.onerror = function () { reject(new Error('อ่านไฟล์ไม่สำเร็จ: ' + file.name)); };
      fr.readAsDataURL(file);
    });
  }

  // ── example-dashboard picker ──────────────────────────────────────────────
  function selectedExamples() {
    return [].slice.call(el.picker.querySelectorAll('.req-pick.on'))
      .map(function (b) { return b.getAttribute('data-name'); });
  }

  // Append the 45-template gallery after the 4 in-house designs. Built only on
  // first reveal so a hidden form never downloads 45 preview images.
  var galleryBuilt = false;
  function buildGallery() {
    if (galleryBuilt) return;
    galleryBuilt = true;
    var ref = window.iDashReferenceTemplates;
    if (!ref || !ref.INDEX) return;   // library missing — the 4 static cards still work
    var catTH = ref.CATEGORY_LABEL_TH || {};
    ref.INDEX.forEach(function (t) {
      var name = '#' + String(t.id).padStart(2, '0') + ' ' + t.title;
      var btn = document.createElement('button');
      btn.className = 'req-pick';
      btn.type = 'button';
      btn.setAttribute('data-name', name);
      btn.innerHTML =
        '<span class="req-pick-thumb"><img loading="lazy" alt=""></span>' +
        '<span class="req-pick-name"></span>' +
        '<span class="req-pick-tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
      var img = btn.querySelector('img');
      img.src = 'assets/img/gallery/' + t.id + '.png';
      img.alt = name;
      var label = btn.querySelector('.req-pick-name');
      label.textContent = 'แบบที่ ' + String(t.id).padStart(2, '0');
      var cat = document.createElement('span');
      cat.className = 'req-pick-cat';
      cat.textContent = catTH[t.category] || t.category || '';
      label.appendChild(cat);
      el.picker.appendChild(btn);
    });
  }

  // Downscale each selected preview to a small JPEG so the email shows the
  // pictures without ballooning past Gmail's size limits.
  //
  // A gallery card can be selected while its lazy thumbnail hasn't loaded yet —
  // decode() on such an image can hang, so load a fresh eager copy instead,
  // with a timeout: sending must never stall on one picture (the name still
  // travels in the example text either way).
  function loadEager(src) {
    return new Promise(function (resolve) {
      var im = new Image();
      var settled = false;
      function done(ok) { if (!settled) { settled = true; resolve(ok ? im : null); } }
      im.onload = function () { done(true); };
      im.onerror = function () { done(false); };
      setTimeout(function () { done(im.complete && im.naturalWidth > 0); }, 4000);
      im.src = src;
    });
  }

  function captureExampleImages() {
    var picks = [].slice.call(el.picker.querySelectorAll('.req-pick.on'));
    return Promise.all(picks.map(function (btn) {
      var img = btn.querySelector('.req-pick-thumb img');
      var name = btn.getAttribute('data-name');
      if (!img) return null;
      var source = (img.complete && img.naturalWidth > 0)
        ? Promise.resolve(img)
        : loadEager(img.src);
      return source.then(function (im) {
        if (!im || !im.naturalWidth) return null;   // never send a broken image
        var W = Math.min(720, im.naturalWidth);
        var H = Math.round(im.naturalHeight * (W / im.naturalWidth));
        var c = document.createElement('canvas');
        c.width = W; c.height = H;
        c.getContext('2d').drawImage(im, 0, 0, W, H);
        var dataUrl = c.toDataURL('image/jpeg', 0.82);
        return { name: name, type: 'image/jpeg', data: dataUrl.slice(dataUrl.indexOf(',') + 1) };
      }).catch(function () { return null; });
    })).then(function (list) {
      return list.filter(function (x) { return x; });
    });
  }

  function updatePickCount() {
    if (!el.pickCount) return;   // picker retired — nothing to count
    var names = selectedExamples();
    el.pickCount.textContent = names.length
      ? 'เลือกแล้ว: ' + names[0]
      : 'ยังไม่ได้เลือก';
  }

  // Show the field only for the "new dashboard" subject. Hiding it also clears
  // the picks, so a request of another type never carries stale examples.
  function syncExampleField() {
    var show = el.subject.value === EXAMPLE_SUBJECT;
    el.exampleField.hidden = !show;
    if (show) buildGallery();
    if (!show) {
      el.picker.querySelectorAll('.req-pick.on').forEach(function (b) { b.classList.remove('on'); });
      el.example.value = '';
      updatePickCount();
    }
  }

  // What the Admin actually receives for this field.
  /** Profile saved on this device — name/email for prefill and the mail body. */
  function loadProfile() {
    try { return JSON.parse(localStorage.getItem('idash.profile') || '{}') || {}; }
    catch (e) { return {}; }
  }

  /** "ชื่อผู้ส่ง: X (ตำแหน่ง)" line for the top of the admin email. */
  function senderNameLine() {
    var p = loadProfile();
    if (!p.name) return '';
    return 'ชื่อผู้ส่ง: ' + p.name + (p.role ? ' (' + p.role + ')' : '') + '\n\n';
  }

  function buildExampleText() {
    if (el.exampleField.hidden) return '';
    var names = selectedExamples();
    var note = el.example.value.trim();
    var out = [];
    if (names.length) out.push('เลือกแบบ: ' + names.join(', '));
    if (note) out.push(names.length ? 'เพิ่มเติม: ' + note : note);
    return out.join('\n');
  }

  // ── draft (so a mistyped email or a refresh doesn't lose the writing) ──────
  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        from: el.from.value, subject: el.subject.value,
        details: el.details.value, example: el.example.value,
        picks: selectedExamples()
      }));
    } catch (e) { /* quota — drafts are best-effort */ }
  }
  function restoreDraft() {
    try {
      var d = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
      if (d.from) el.from.value = d.from;
      if (d.subject) el.subject.value = d.subject;
      if (d.details) el.details.value = d.details;
      syncExampleField();                 // reveal before restoring picks
      if (d.example) el.example.value = d.example;
      // Match by comparing attributes — gallery names contain characters that
      // would break a naive querySelector string.
      var picks = d.picks || [];
      [].forEach.call(el.picker.querySelectorAll('.req-pick'), function (btn) {
        if (picks.indexOf(btn.getAttribute('data-name')) > -1) btn.classList.add('on');
      });
      updatePickCount();
    } catch (e) { /* ignore malformed draft */ }
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }

  // ── submit ────────────────────────────────────────────────────────────────
  function validate() {
    markError(el.from, false); markError(el.subject, false); markError(el.details, false);

    if (!isEmail(el.from.value)) {
      markError(el.from, true); el.from.focus();
      return 'กรุณากรอกอีเมลผู้ส่งให้ถูกต้อง';
    }
    if (!el.subject.value) {
      markError(el.subject, true); el.subject.focus();
      return 'กรุณาเลือกชื่อเรื่อง';
    }
    if (!el.details.value.trim()) {
      markError(el.details, true); el.details.focus();
      return 'กรุณากรอกรายละเอียดที่ต้องการ';
    }
    return null;
  }

  function setSending(on) {
    el.send.disabled = on;
    el.sendLabel.textContent = on ? 'กำลังส่ง…' : 'ส่งคำขอ';
  }

  // Success popup, then back to the Home page.
  function showSentPopup(fileCount) {
    var overlay = document.createElement('div');
    overlay.className = 'req-done-overlay';
    overlay.innerHTML =
      '<div class="req-done-card">' +
        '<div class="req-done-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" ' +
          'stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
        '</div>' +
        '<div class="req-done-title">ส่งคำขอเรียบร้อยแล้ว</div>' +
        '<div class="req-done-desc">ส่งถึง <b>' + ADMIN_EMAIL + '</b>' +
          (fileCount ? ' (แนบ ' + fileCount + ' ไฟล์)' : '') +
          '<br>Admin จะติดต่อกลับทางอีเมลที่คุณระบุ</div>' +
        '<div class="req-done-note">กำลังกลับสู่หน้า Home…</div>' +
      '</div>';
    document.body.appendChild(overlay);
    setTimeout(function () { window.location.href = 'index.html'; }, 2600);
  }

  function submit(ev) {
    ev.preventDefault();
    clearStatus();

    var problem = validate();
    if (problem) { status('err', problem); return; }

    var url = apiUrl();
    if (!url) {
      status('err', 'ยังไม่ได้เชื่อมต่อระบบส่งอีเมล — แจ้ง Admin ให้ตั้งค่า Apps Script URL ก่อน');
      return;
    }

    setSending(true);
    status('info', 'กำลังส่งคำขอและไฟล์แนบ…');

    Promise.all([Promise.all(picked.map(readAsBase64)), captureExampleImages()])
      .then(function (parts) {
        var files = parts[0];
        // The pictures of the chosen designs ride along so the Admin sees
        // them inline instead of matching names against the gallery.
        var exampleImages = el.exampleField.hidden ? [] : parts[1];
        return fetch(url, {
          method: 'POST',
          // text/plain keeps this a "simple request" — no CORS preflight, which
          // Apps Script Web Apps do not answer.
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'dashreq',
            fromEmail: el.from.value.trim(),
            // The signed-in account username, so this request shows up in that
            // user's in-app inbox even if they typed a different contact email.
            username: loggedInUsername(),
            subject: el.subject.value,
            // The sender's name rides inside details, so it reaches the admin
            // through the ALREADY-DEPLOYED mailer — a separate fromName field
            // would sit unread until the Apps Script is redeployed.
            details: senderNameLine() + el.details.value.trim(),
            example: buildExampleText(),
            exampleImages: exampleImages,
            files: files
          })
        });
      })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (out) {
        if (!out.ok) throw new Error(out.error || 'ส่งไม่สำเร็จ');
        clearDraft();
        el.form.reset();
        picked = [];
        renderFiles();
        syncExampleField();   // form.reset() clears the subject — re-hide the picker
        showSentPopup(out.files);
      })
      .catch(function (err) {
        // The draft is kept on purpose so nothing typed is lost.
        status('err',
          'ส่งไม่สำเร็จ: ' + err.message +
          '<br><span style="font-weight:500">ข้อความที่พิมพ์ไว้ยังอยู่ ลองส่งใหม่อีกครั้ง ' +
          'หรือส่งตรงไปที่ ' + ADMIN_EMAIL + '</span>');
      })
      .then(function () { setSending(false); });
  }

  // ── wiring ────────────────────────────────────────────────────────────────
  function init() {
    el.form = $('reqForm');
    if (!el.form) return;

    el.from = $('reqFrom');
    el.subject = $('reqSubject');
    el.details = $('reqDetails');
    el.example = $('reqExample');
    el.exampleField = $('reqExampleField');
    el.picker = $('reqPicker');
    el.pickCount = $('reqPickCount');
    el.drop = $('reqDrop');
    el.input = $('reqFiles');
    el.fileList = $('reqFileList');
    el.status = $('reqStatus');
    el.send = $('reqSend');
    el.sendLabel = $('reqSendLabel');

    $('reqTo').textContent = ADMIN_EMAIL;
    $('reqFootTo').textContent = ADMIN_EMAIL;

    restoreDraft();
    // The profile page saves a contact email exactly so it never has to be
    // typed again — an empty field starts from it. A draft or the user's own
    // typing always wins; this only fills silence.
    if (!el.from.value) {
      var prof = loadProfile();
      if (prof.email) el.from.value = prof.email;
    }
    [el.from, el.subject, el.details, el.example].forEach(function (n) {
      n.addEventListener('input', saveDraft);
      n.addEventListener('change', saveDraft);
    });
    el.subject.addEventListener('change', syncExampleField);

    // Single choice: picking a card releases any previous pick; clicking the
    // selected card again clears the choice.
    el.picker.addEventListener('click', function (e) {
      var btn = e.target.closest('.req-pick');
      if (!btn) return;
      var wasOn = btn.classList.contains('on');
      el.picker.querySelectorAll('.req-pick.on').forEach(function (b) { b.classList.remove('on'); });
      if (!wasOn) btn.classList.add('on');
      updatePickCount();
      saveDraft();
    });

    // Arrow buttons page the strip by three cards at a time (only present
    // while the visual picker is in the page).
    var prev = $('reqPickPrev'), next = $('reqPickNext');
    if (prev && next) {
      var STEP = 3 * 200;   // card 190px + 10px gap
      prev.addEventListener('click', function () { el.picker.scrollBy({ left: -STEP, behavior: 'smooth' }); });
      next.addEventListener('click', function () { el.picker.scrollBy({ left: STEP, behavior: 'smooth' }); });
    }

    el.drop.addEventListener('click', function () { el.input.click(); });
    el.drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.input.click(); }
    });
    el.input.addEventListener('change', function () {
      addFiles(el.input.files);
      el.input.value = '';   // allow re-picking the same file after removing it
    });

    ['dragenter', 'dragover'].forEach(function (t) {
      el.drop.addEventListener(t, function (e) {
        e.preventDefault(); el.drop.classList.add('drag');
      });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      el.drop.addEventListener(t, function (e) {
        e.preventDefault(); el.drop.classList.remove('drag');
      });
    });
    el.drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });

    el.form.addEventListener('submit', submit);
  }

  window.iDashRequest = {
    setUrl: function (url) {
      localStorage.setItem('idash.requestApiUrl', url);
      return url;
    },
    adminEmail: ADMIN_EMAIL
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
