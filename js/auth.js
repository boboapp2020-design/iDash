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

  // SubtleCrypto needs a secure context (https or localhost). Missing → fail
  // closed rather than letting anything through.
  function verify(username, password) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle || !window.TextEncoder) return Promise.resolve(false);
    var data = new TextEncoder().encode(SALT + username + ':' + password);
    return subtle.digest('SHA-256', data)
      .then(function (buf) { return toHex(buf) === CREDENTIAL_SHA256; })
      .catch(function () { return false; });
  }

  function signIn(username, password) {
    return verify(String(username || '').trim(), String(password || '')).then(function (ok) {
      if (ok) { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
      return ok;
    });
  }

  /**
   * Bounce to the sign-in page unless this tab is already signed in.
   * Call at the TOP of every app page, before it renders anything.
   */
  function requireSignIn() {
    if (isSignedIn()) return true;
    var here = window.location.pathname.split('/').pop() || 'index.html';
    window.location.replace(LOGIN_PAGE + '?next=' + encodeURIComponent(here));
    return false;
  }

  window.iDashAuth = {
    isSignedIn: isSignedIn,
    signIn: signIn,
    signOut: signOut,
    requireSignIn: requireSignIn,
    LOGIN_PAGE: LOGIN_PAGE
  };
})();
