/**
 * iDash — stale-page guard.
 *
 * The `?v=` query strings on our CSS and JS keep those files fresh, but they
 * live *inside* index.html — and index.html itself is served by GitHub Pages
 * with `Cache-Control: max-age=600` and no version of its own. So for ten
 * minutes after a deploy a returning visitor gets the old document, which
 * still points at the old `?v=` values: none of the new markup, CSS or JS
 * reaches them, and the app looks like the change was never shipped.
 *
 * Fix: version.json is fetched with `cache: 'no-store'`, so it is always the
 * server's answer, never the browser's. When its build id differs from the one
 * this tab last saw, the page is reloaded once at a URL carrying `?b=<build>` —
 * a URL the browser has no cached copy of, so the fresh document is guaranteed.
 *
 * Loop safety: the new build id is written to sessionStorage *before* the
 * reload, so a given build can trigger at most one reload per tab. Any failure
 * (offline, file://, malformed JSON) is swallowed and the page just loads as-is.
 */
(function () {
  'use strict';

  var KEY = 'idash.build';

  fetch('version.json', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      var latest = data && data.build;
      if (!latest) return;

      var seen;
      try { seen = sessionStorage.getItem(KEY); } catch (e) { return; }

      // First load in this tab: record the build, never reload — there is
      // nothing to compare against yet and the document is as fresh as it gets.
      if (!seen) {
        try { sessionStorage.setItem(KEY, latest); } catch (e) {}
        return;
      }
      if (seen === latest) return;

      // Claim the new build first so this can never become a reload loop.
      try { sessionStorage.setItem(KEY, latest); } catch (e) { return; }

      var url = new URL(window.location.href);
      url.searchParams.set('b', latest);
      window.location.replace(url.toString());
    })
    .catch(function () { /* offline or unreachable — leave the page alone */ });
})();
