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
    // Carry the query string too — without it, signing in from a dashboard
    // deep link lands on the embed page with no dashboard to show.
    var here = (window.location.pathname.split('/').pop() || 'index.html') + window.location.search;
    window.location.replace(LOGIN_PAGE + '?next=' + encodeURIComponent(here));
    return false;
  }

  window.iDashAuth = {
    isSignedIn: isSignedIn,
    signIn: signIn,
    signOut: signOut,
    requireSignIn: requireSignIn,
    verify: verify,
    setLocalPassword: setLocalPassword,
    clearLocalPassword: clearLocalPassword,
    hasLocalPassword: hasLocalPassword,
    LOGIN_PAGE: LOGIN_PAGE
  };
})();
