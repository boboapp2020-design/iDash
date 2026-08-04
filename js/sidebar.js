// Shared sidebar account menu — wired on every page (index/templates/theme/custom/studio).
(function () {
  function showAppToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'app-toast';
      toast.hidden = true;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }

  // Non-blocking toast shared by all pages (alert() freezes the page).
  window.iDashToast = showAppToast;

  function clearLocalAppState() {
    const sessionKeys = ['idash.pendingDataset', 'idash.pendingModule', 'idash.dashboardSpec', 'idash.dashboardMeta'];
    const localKeys = ['idash.customDraftAutosave'];
    sessionKeys.forEach((k) => sessionStorage.removeItem(k));
    localKeys.forEach((k) => localStorage.removeItem(k));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('sidebarUserTrigger');
    const menu = document.getElementById('sidebarUserMenu');
    if (!trigger || !menu) return;

    function closeMenu() {
      menu.hidden = true;
      trigger.classList.remove('open');
    }
    function openMenu() {
      menu.hidden = false;
      trigger.classList.add('open');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.hidden) openMenu(); else closeMenu();
    });
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !trigger.contains(e.target)) closeMenu();
    });
    menu.addEventListener('click', (e) => e.stopPropagation());

    menu.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        closeMenu();
        if (action === 'profile') {
          window.location.href = 'profile.html';
        } else if (action === 'settings') {
          window.location.href = 'settings.html';
        } else if (action === 'logout') {
          clearLocalAppState();
          // End the session too, otherwise "ออกจากระบบ" just reloaded Home
          // while the user stayed signed in.
          if (window.iDashAuth) window.iDashAuth.signOut();
          else window.location.href = 'landing.html';
        }
      });
    });
  });

  /* ── Profile display sync ────────────────────────────────────────────────
   * The name/role/avatar in the footer are static HTML on every page; the
   * Profile page saves the real values to localStorage. Applying them here
   * means one save follows the user across the whole app without touching
   * each page's markup.
   */
  function applyProfile() {
    var p = null;
    try { p = JSON.parse(localStorage.getItem('idash.profile') || 'null'); } catch (e) {}
    if (!p) return;
    document.querySelectorAll('.sidebar-user').forEach(function (el) {
      var nameEl = el.querySelector('.user-name');
      var roleEl = el.querySelector('.user-role');
      var avEl = el.querySelector('.user-avatar');
      if (p.name && nameEl) nameEl.textContent = p.name;
      if (p.role && roleEl) roleEl.textContent = p.role;
      if (p.name && avEl) avEl.textContent = p.name.charAt(0).toUpperCase();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyProfile);
  else applyProfile();
  window.iDashSidebarProfile = { refresh: applyProfile };
})();
