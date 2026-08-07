/**
 * iDash — sign-in gate.
 *
 * Scope note, same as the chatbot PIN: everything runs in the browser, so this
 * is an access gate, not a security boundary. A visitor who opens DevTools can
 * walk past it. It exists so the app isn't simply open to anyone who lands on
 * the URL. Real accounts need a server.
 *
 * Credentials are compared as a salted SHA-256 digest so the password isn't
 * sitting in the page source; with a short password that is obfuscation, not
 * protection. Sessions last for the browser tab (sessionStorage), so closing
 * the tab signs out.
 */
(function () {
  'use strict';

  var SALT = 'idash-auth:';
  // sha256("idash-auth:admin:1234")
  var CREDENTIAL_SHA256 = '38f022266567693255a26bf6aa98a5075abb9e989ae9e0b027a5fd34da891b83';
  var KEY = 'idash.session';
  var LOGIN_PAGE = 'landing.html';

  // The account service (signup_log.gs). Approved sheet accounts sign in
  // against this; the built-in admin credential does not need it. One URL for
  // signup, admin review, and sign-in verification — landing.html and
  // admin.js read it from here so there is a single source of truth.
  var ACCOUNT_API_URL =
    'https://script.google.com/macros/s/AKfycbwGAHWfHN-u6WW1uPLWo12vMRdj2aLNJIdi458UNm6vza1yDT1PH_1EcU0qNbNSY7NW9w/exec';
  var ACCOUNT_KEY = 'idash.account';

  function isSignedIn() {
    try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }

  function signOut() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    window.location.href = LOGIN_PAGE;
  }

  function toHex(buf) {
    var out = '', v = new Uint8Array(buf);
    for (var i = 0; i < v.length; i++) out += ('0' + v[i].toString(16)).slice(-2);
    return out;
  }

  // The Settings page can override the built-in credential with one the user
  // chose. The override is a salted hash in localStorage, so it is exactly as
  // strong (and exactly as device-local) as the built-in gate: whoever set a
  // password on THIS browser signs in with it here, other machines keep the
  // default. Clearing browser data clears the override and the default works
  // again — stated in the Settings UI so a "forgotten" password can't brick
  // the machine.
  var OVERRIDE_KEY = 'idash.cred';

  function storedOverride() {
    try { return localStorage.getItem(OVERRIDE_KEY) || ''; } catch (e) { return ''; }
  }

  function digestHex(username, password) {
    var subtle = window.crypto && window.crypto.subtle;
    // SubtleCrypto needs a secure context (https or localhost). Missing → fail
    // closed rather than letting anything through.
    if (!subtle || !window.TextEncoder) return Promise.reject(new Error('no-subtle'));
    var data = new TextEncoder().encode(SALT + username + ':' + password);
    return subtle.digest('SHA-256', data).then(toHex);
  }

  function verify(username, password) {
    return digestHex(username, password)
      .then(function (hex) {
        var override = storedOverride();
        return override ? hex === override : hex === CREDENTIAL_SHA256;
      })
      .catch(function () { return false; });
  }

  /** Replace this device's credential. Caller must have verified the current one. */
  function setLocalPassword(username, newPassword) {
    return digestHex(String(username || '').trim(), String(newPassword || ''))
      .then(function (hex) {
        try { localStorage.setItem(OVERRIDE_KEY, hex); return true; }
        catch (e) { return false; }
      })
      .catch(function () { return false; });
  }

  function clearLocalPassword() {
    try { localStorage.removeItem(OVERRIDE_KEY); } catch (e) {}
  }

  function hasLocalPassword() { return !!storedOverride(); }

  /**
   * Ask the account service whether this username + password hash is a real,
   * APPROVED account. Text/plain keeps it a simple request (no CORS preflight,
   * which Apps Script can't answer). Returns a verdict object; a network or
   * service failure is reported as its own reason rather than a bare false, so
   * "the server is down" never reads as "wrong password".
   */
  function remoteVerify(username, password) {
    return digestHex(username, password).then(function (hex) {
      return fetch(ACCOUNT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'verify', username: username, passwordHash: hex })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.valid) return { ok: true, role: d.role || 'user' };
          if (d && d.status === 'pending') return { ok: false, reason: 'บัญชีนี้ยังรอผู้ดูแลระบบอนุมัติ' };
          if (d && d.status === 'rejected') return { ok: false, reason: 'บัญชีนี้ไม่ได้รับอนุมัติให้ใช้งาน' };
          return { ok: false, reason: '' }; // unknown user or wrong password
        });
    }).catch(function () {
      return { ok: false, reason: 'ตรวจสอบบัญชีไม่สำเร็จ — ตรวจอินเทอร์เน็ตแล้วลองใหม่', network: true };
    });
  }

  /**
   * @returns Promise<{ok:true}|{ok:false, reason}>
   * Built-in / device-local credential first (works offline, admin path
   * unchanged). Only if that misses do we ask the sheet — so an approved
   * account signs in, and a pending/rejected one is told exactly why.
   */
  function signIn(username, password) {
    username = String(username || '').trim();
    password = String(password || '');
    return verify(username, password).then(function (localOk) {
      if (localOk) {
        try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
        return { ok: true };
      }
      return remoteVerify(username, password).then(function (res) {
        if (res.ok) {
          try {
            sessionStorage.setItem(KEY, '1');
            localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ username: username, role: res.role }));
          } catch (e) {}
          return { ok: true };
        }
        return { ok: false, reason: res.reason || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
      });
    });
  }

  /**
   * Bounce to the sign-in page unless this tab is already signed in.
   * Call at the TOP of every app page, before it renders anything.
   */
  function requireSignIn() {
    if (isSignedIn()) return true;
    // Carry the query string too — without it, signing in from a dashboard
    // deep link lands on the embed page with no dashboard to show.
    var here = (window.location.pathname.split('/').pop() || 'index.html') + window.location.search;
    window.location.replace(LOGIN_PAGE + '?next=' + encodeURIComponent(here));
    return false;
  }

  function signOutFull() {
    try { localStorage.removeItem(ACCOUNT_KEY); } catch (e) {}
    signOut();
  }

  window.iDashAuth = {
    isSignedIn: isSignedIn,
    signIn: signIn,
    signOut: signOutFull,
    requireSignIn: requireSignIn,
    verify: verify,
    digestHex: digestHex,
    setLocalPassword: setLocalPassword,
    clearLocalPassword: clearLocalPassword,
    hasLocalPassword: hasLocalPassword,
    accountApiUrl: ACCOUNT_API_URL,
    LOGIN_PAGE: LOGIN_PAGE
  };
})();
