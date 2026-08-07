/**
 * iDash — Admin: approve / reject signup requests
 *
 * Talks to the same account service as sign-up and sign-in
 * (window.iDashAuth.accountApiUrl → signup_log.gs). Every admin call carries
 * the Admin Token, which is stored on THIS device only and never ships in the
 * page — so a stranger who finds admin.html cannot approve anyone; the .gs
 * refuses list/decide without the token that matches its ADMIN_TOKEN secret.
 */
(function () {
  'use strict';

  var API = (window.iDashAuth && window.iDashAuth.accountApiUrl) || '';
  var TOKEN_KEY = 'idash.adminToken';

  var tokenCard = document.getElementById('tokenCard');
  var listCard = document.getElementById('listCard');
  var listEl = document.getElementById('admList');
  var admMsg = document.getElementById('admMsg');
  var filter = 'pending';
  var cache = [];

  function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }

  function post(payload) {
    payload.token = token();
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function fmtTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleString('th-TH');
  }

  var STATUS = {
    pending: { label: 'รออนุมัติ', cls: '' },
    approved: { label: 'อนุมัติแล้ว', cls: 'ok' },
    rejected: { label: 'ไม่อนุมัติ', cls: 'bad' }
  };
  function statusBadge(s) {
    var m = STATUS[s] || { label: s || '—', cls: '' };
    return '<span class="set-badge ' + m.cls + '">' + esc(m.label) + '</span>';
  }

  /* ── Token gate ───────────────────────────────────────────────────────── */

  function showTokenCard() {
    tokenCard.hidden = false;
    listCard.hidden = true;
    document.getElementById('tokenInput').value = '';
  }
  function showListCard() {
    tokenCard.hidden = true;
    listCard.hidden = false;
  }

  document.getElementById('tokenSave').addEventListener('click', function () {
    var v = document.getElementById('tokenInput').value.trim();
    var msg = document.getElementById('tokenMsg');
    if (!v) { msg.className = 'acct-msg err'; msg.textContent = 'กรุณาใส่ Admin Token'; return; }
    try { localStorage.setItem(TOKEN_KEY, v); } catch (e) {}
    msg.className = 'acct-msg'; msg.textContent = 'กำลังตรวจสอบ…';
    load().then(function (ok) {
      if (ok) { showListCard(); autoOpenFromUrl(); }
      else { msg.className = 'acct-msg err'; msg.textContent = 'Admin Token ไม่ถูกต้อง หรือเชื่อมต่อไม่ได้'; }
    });
  });

  document.getElementById('admChangeToken').addEventListener('click', function () {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    showTokenCard();
  });

  /* ── List ─────────────────────────────────────────────────────────────── */

  function load() {
    admMsg.className = 'acct-msg';
    admMsg.textContent = 'กำลังโหลด…';
    return post({ action: 'list' })
      .then(function (d) {
        if (!d || !d.ok) {
          // Only a token error means "this door is locked, enter a token".
          // Anything else is a plain failure shown in place.
          if (d && /token/i.test(d.error || '')) { showTokenCard(); return false; }
          admMsg.className = 'acct-msg err';
          admMsg.textContent = (d && d.error) || 'โหลดคำขอไม่สำเร็จ';
          return false;
        }
        cache = d.requests || [];
        admMsg.textContent = '';
        render();
        return true;
      })
      .catch(function () {
        admMsg.className = 'acct-msg err';
        admMsg.textContent = 'เชื่อมต่อปลายทางไม่ได้ — ตรวจอินเทอร์เน็ตแล้วลองใหม่';
        return false;
      });
  }

  function render() {
    var rows = filter === 'pending'
      ? cache.filter(function (r) { return r.status === 'pending'; })
      : cache;
    if (!rows.length) {
      listEl.innerHTML = '<div class="adm-empty">' +
        (filter === 'pending' ? 'ไม่มีคำขอที่รออนุมัติ' : 'ยังไม่มีคำขอสมัคร') + '</div>';
      return;
    }
    listEl.innerHTML = rows.map(function (r) {
      var pending = r.status === 'pending';
      return '<div class="adm-item" data-user="' + esc(r.username) + '">' +
        '<div class="adm-item-main">' +
          '<div class="adm-item-name">' + esc(r.username) + '</div>' +
          '<div class="adm-item-sub">' + esc(r.email) + ' · ' + esc(fmtTime(r.ts)) + '</div>' +
        '</div>' +
        statusBadge(r.status) +
        '<button type="button" class="acct-btn ' + (pending ? 'primary' : 'ghost') + ' adm-review" data-user="' +
          esc(r.username) + '">' + (pending ? 'ตรวจสอบ' : 'ดู') + '</button>' +
      '</div>';
    }).join('');
  }

  listEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.adm-review');
    if (btn) openDecide(btn.dataset.user);
  });

  document.querySelectorAll('.adm-tab').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.adm-tab').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      filter = t.dataset.filter;
      render();
    });
  });

  document.getElementById('admRefresh').addEventListener('click', load);

  /* ── Decide popup ─────────────────────────────────────────────────────── */

  var modal = document.getElementById('decideModal');
  var current = null;

  function openDecide(username) {
    var r = cache.find(function (x) { return x.username === username; });
    if (!r) return;
    current = r;
    document.getElementById('decUser').textContent = r.username;
    document.getElementById('decEmail').textContent = r.email;
    document.getElementById('decTime').textContent = fmtTime(r.ts);
    document.getElementById('decStatus').outerHTML =
      statusBadge(r.status).replace('set-badge', 'set-badge').replace('<span', '<span id="decStatus"');
    var decMsg = document.getElementById('decMsg');
    decMsg.className = 'acct-msg'; decMsg.textContent = '';
    // An already-decided request opens read-only; re-deciding is still allowed
    // but the buttons make clear it's a change, not a first decision.
    var already = r.status !== 'pending';
    document.getElementById('decApprove').textContent = already ? 'อนุมัติ (เปลี่ยนสถานะ)' : 'อนุมัติ';
    document.getElementById('decReject').textContent = already ? 'ไม่อนุมัติ (เปลี่ยนสถานะ)' : 'ไม่อนุมัติ';
    modal.hidden = false;
  }
  function closeDecide() { modal.hidden = true; current = null; }

  document.getElementById('decClose').addEventListener('click', closeDecide);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeDecide(); });

  function decide(decision) {
    if (!current) return;
    var decMsg = document.getElementById('decMsg');
    var aBtn = document.getElementById('decApprove');
    var rBtn = document.getElementById('decReject');
    aBtn.disabled = rBtn.disabled = true;
    decMsg.className = 'acct-msg';
    decMsg.textContent = 'กำลังบันทึกและส่งอีเมล…';
    post({ action: 'decide', username: current.username, decision: decision })
      .then(function (d) {
        if (d && d.ok) {
          decMsg.className = 'acct-msg ok';
          decMsg.textContent = decision === 'approve'
            ? 'อนุมัติแล้ว — แจ้งผู้สมัครทางอีเมลเรียบร้อย'
            : 'ปฏิเสธแล้ว — แจ้งผู้สมัครทางอีเมลเรียบร้อย';
          setTimeout(function () { closeDecide(); load(); }, 900);
        } else {
          decMsg.className = 'acct-msg err';
          decMsg.textContent = (d && d.error) || 'บันทึกไม่สำเร็จ';
        }
      })
      .catch(function () {
        decMsg.className = 'acct-msg err';
        decMsg.textContent = 'เชื่อมต่อปลายทางไม่ได้ — ลองใหม่อีกครั้ง';
      })
      .finally(function () { aBtn.disabled = rBtn.disabled = false; });
  }
  document.getElementById('decApprove').addEventListener('click', function () { decide('approve'); });
  document.getElementById('decReject').addEventListener('click', function () { decide('reject'); });

  /* ── Boot ─────────────────────────────────────────────────────────────── */

  // The admin email links to admin.html?u=<username> — after the list loads,
  // open that request straight away so a decision is one click from the email.
  function autoOpenFromUrl() {
    var u = new URLSearchParams(location.search).get('u');
    if (u && cache.some(function (r) { return r.username === u; })) openDecide(u);
  }

  if (!API) {
    admMsg.className = 'acct-msg err';
    admMsg.textContent = 'ยังไม่ได้ตั้งค่าปลายทางบัญชี (auth.js accountApiUrl)';
    showTokenCard();
  } else {
    // Try to load straight away. If the service is open (no ADMIN_TOKEN set)
    // this just shows the list — no token step. Only if it answers with a
    // token error does load() reveal the token card. A stored token (from a
    // locked setup) still rides along via post().
    showListCard();
    load().then(function (ok) { if (ok) autoOpenFromUrl(); });
  }
})();
