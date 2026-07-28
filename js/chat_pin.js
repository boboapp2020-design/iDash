/* iDash — PIN gate for the AI Chatbot.
 *
 * Scope note: this runs entirely in the browser, so it is an access *gate*,
 * not a security boundary — a determined visitor can bypass it from DevTools.
 * It exists to keep the chatbot from being used by whoever happens to open the
 * page. Anything that needs real protection has to be enforced server-side.
 *
 * The PIN is compared as a salted SHA-256 digest so the digits are not sitting
 * in plain sight in the page source. Unlocking is remembered for the browser
 * tab session only (sessionStorage), so closing the tab re-locks it.
 *
 * Usage:  window.iDashChatPin.require(onUnlock, onCancel)
 */
(function () {
  'use strict';

  var SALT      = 'idash-chat:';
  var PIN_SHA256 = '9335f8b7c50d104010316a351a73aa99672ad97875e7ea5793b62f273db86b32';
  var KEY        = 'idash.chatUnlocked';
  var LEN        = 4;

  function isUnlocked() {
    try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function markUnlocked() {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  }

  function toHex(buf) {
    var out = '', v = new Uint8Array(buf);
    for (var i = 0; i < v.length; i++) out += ('0' + v[i].toString(16)).slice(-2);
    return out;
  }

  // SubtleCrypto needs a secure context (https or localhost). If it is missing
  // we fail closed rather than silently accepting anything.
  function verify(pin) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle || !window.TextEncoder) return Promise.resolve(false);
    var data = new TextEncoder().encode(SALT + pin);
    return subtle.digest('SHA-256', data).then(function (buf) {
      return toHex(buf) === PIN_SHA256;
    }).catch(function () { return false; });
  }

  function injectStyles() {
    if (document.getElementById('idashPinStyles')) return;
    var css = document.createElement('style');
    css.id = 'idashPinStyles';
    css.textContent = [
      '.idash-pin-back{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;',
      '  background:rgba(15,23,42,.55);backdrop-filter:blur(3px);',
      '  font-family:"Inter","Noto Sans Thai",system-ui,sans-serif;}',
      '.idash-pin-card{width:min(340px,calc(100vw - 32px));background:#fff;border:2px solid #dde3ec;border-radius:16px;',
      '  padding:26px 24px 20px;text-align:center;box-shadow:0 8px 16px rgba(16,24,40,.09),0 24px 48px rgba(16,24,40,.18);}',
      '.idash-pin-lock{width:44px;height:44px;margin:0 auto 12px;border-radius:50%;background:#eef4ff;',
      '  display:flex;align-items:center;justify-content:center;color:#2563eb;}',
      '.idash-pin-lock svg{width:21px;height:21px;}',
      '.idash-pin-title{font-size:15.5px;font-weight:800;color:#14161c;}',
      '.idash-pin-sub{font-size:12.5px;color:#858b9c;margin-top:5px;line-height:1.65;}',
      '.idash-pin-boxes{display:flex;gap:10px;justify-content:center;margin:18px 0 4px;}',
      '.idash-pin-boxes input{width:48px;height:56px;text-align:center;font-size:22px;font-weight:800;color:#14161c;',
      '  border:2px solid #dde3ec;border-radius:11px;background:#f8fafc;outline:none;',
      '  transition:border-color .15s,background .15s;-moz-appearance:textfield;}',
      '.idash-pin-boxes input::-webkit-outer-spin-button,.idash-pin-boxes input::-webkit-inner-spin-button{',
      '  -webkit-appearance:none;margin:0;}',
      '.idash-pin-boxes input:focus{border-color:#2563eb;background:#fff;}',
      '.idash-pin-back.err .idash-pin-boxes input{border-color:#dc2626;background:#fef2f2;}',
      '.idash-pin-back.err .idash-pin-card{animation:idashPinShake .32s;}',
      '@keyframes idashPinShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}',
      '.idash-pin-msg{min-height:17px;font-size:12px;font-weight:600;color:#dc2626;margin-top:9px;}',
      '.idash-pin-actions{display:flex;gap:9px;margin-top:14px;}',
      '.idash-pin-actions button{flex:1;padding:10px 0;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;',
      '  border:2px solid #dde3ec;background:#fff;color:#64748b;transition:background .15s,border-color .15s;}',
      '.idash-pin-actions button:hover{background:#f1f5f9;}',
      '.idash-pin-actions button.primary{border-color:#2563eb;background:#2563eb;color:#fff;}',
      '.idash-pin-actions button.primary:hover{background:#1d4ed8;}',
      '@media (prefers-color-scheme:dark){',
      '  .idash-pin-card{background:#151922;border-color:#2b3242;}',
      '  .idash-pin-title{color:#f1f5f9;}',
      '  .idash-pin-boxes input{background:#1c212c;border-color:#2b3242;color:#f1f5f9;}',
      '  .idash-pin-actions button{background:#1c212c;border-color:#2b3242;color:#94a3b8;}',
      '}'
    ].join('');
    document.head.appendChild(css);
  }

  function open(onUnlock, onCancel) {
    injectStyles();

    var back = document.createElement('div');
    back.className = 'idash-pin-back';
    back.innerHTML =
      '<div class="idash-pin-card" role="dialog" aria-modal="true" aria-label="ใส่รหัส PIN">' +
        '<div class="idash-pin-lock">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' +
        '</div>' +
        '<div class="idash-pin-title">ใส่รหัส PIN เพื่อเข้าใช้ AI Chatbot</div>' +
        '<div class="idash-pin-sub">กรอกรหัส 4 หลัก</div>' +
        '<div class="idash-pin-boxes">' +
          '<input type="tel" inputmode="numeric" maxlength="1" aria-label="หลักที่ 1">' +
          '<input type="tel" inputmode="numeric" maxlength="1" aria-label="หลักที่ 2">' +
          '<input type="tel" inputmode="numeric" maxlength="1" aria-label="หลักที่ 3">' +
          '<input type="tel" inputmode="numeric" maxlength="1" aria-label="หลักที่ 4">' +
        '</div>' +
        '<div class="idash-pin-msg"></div>' +
        '<div class="idash-pin-actions">' +
          '<button type="button" data-act="cancel">ยกเลิก</button>' +
          '<button type="button" class="primary" data-act="ok">ยืนยัน</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(back);

    var boxes = [].slice.call(back.querySelectorAll('.idash-pin-boxes input'));
    var msg   = back.querySelector('.idash-pin-msg');
    var okBtn = back.querySelector('[data-act="ok"]');
    var busy  = false;

    function clearErr() { back.classList.remove('err'); msg.textContent = ''; }
    function value() { return boxes.map(function (b) { return b.value; }).join(''); }

    function fail(text) {
      back.classList.add('err');
      msg.textContent = text;
      boxes.forEach(function (b) { b.value = ''; });
      boxes[0].focus();
    }

    function submit() {
      if (busy) return;
      var pin = value();
      if (pin.length < LEN) { fail('กรอกให้ครบ 4 หลัก'); return; }
      busy = true;
      okBtn.disabled = true;
      verify(pin).then(function (ok) {
        busy = false;
        okBtn.disabled = false;
        if (!ok) { fail('รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง'); return; }
        markUnlocked();
        back.remove();
        if (onUnlock) onUnlock();
      });
    }

    boxes.forEach(function (box, i) {
      box.addEventListener('input', function () {
        clearErr();
        box.value = box.value.replace(/\D/g, '').slice(0, 1);
        if (box.value && i < LEN - 1) boxes[i + 1].focus();
        if (value().length === LEN) submit();
      });
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !box.value && i > 0) { boxes[i - 1].focus(); e.preventDefault(); }
        else if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
        else if (e.key === 'ArrowRight' && i < LEN - 1) boxes[i + 1].focus();
        else if (e.key === 'Enter') submit();
      });
      // Pasting the whole PIN into any box should fill the row.
      box.addEventListener('paste', function (e) {
        var text = (e.clipboardData || window.clipboardData).getData('text') || '';
        var digits = text.replace(/\D/g, '').slice(0, LEN);
        if (!digits) return;
        e.preventDefault();
        clearErr();
        boxes.forEach(function (b, k) { b.value = digits[k] || ''; });
        boxes[Math.min(digits.length, LEN - 1)].focus();
        if (digits.length === LEN) submit();
      });
    });

    okBtn.addEventListener('click', submit);
    back.querySelector('[data-act="cancel"]').addEventListener('click', function () {
      back.remove();
      if (onCancel) onCancel();
    });
    back.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { back.remove(); if (onCancel) onCancel(); }
    });

    boxes[0].focus();
  }

  window.iDashChatPin = {
    isUnlocked: isUnlocked,
    /* Runs onUnlock immediately when this tab session is already unlocked,
       otherwise prompts first. onCancel fires when the user backs out. */
    require: function (onUnlock, onCancel) {
      if (isUnlocked()) { if (onUnlock) onUnlock(); return; }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { open(onUnlock, onCancel); });
      } else {
        open(onUnlock, onCancel);
      }
    }
  };
})();
