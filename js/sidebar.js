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

    // "จัดการคำขอสมัคร" is injected here rather than into every page's markup,
    // so one change reaches all pages. Only for the owner (built-in login sets
    // no idash.account) or an account whose sheet role is admin — a plain
    // "user" account must not even see the admin door.
    var acct = null;
    try { acct = JSON.parse(localStorage.getItem('idash.account') || 'null'); } catch (e) {}
    var isAdmin = !acct || acct.role === 'admin';
    if (isAdmin && !menu.querySelector('[data-action="admin"]')) {
      const divider = menu.querySelector('.sidebar-user-menu-divider');
      const adminBtn = document.createElement('button');
      adminBtn.type = 'button';
      adminBtn.dataset.action = 'admin';
      adminBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>จัดการคำขอสมัคร';
      if (divider) menu.insertBefore(adminBtn, divider);
      else menu.appendChild(adminBtn);
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
        } else if (action === 'admin') {
          window.location.href = 'admin.html';
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
    // The signed-in sheet account outranks the device-local profile: a user
    // who logged in with their own approved account must see THEIR name and
    // role, not whatever profile (e.g. "Bobo / Admin") was saved on this
    // machine earlier. The built-in owner login doesn't set idash.account,
    // so the owner's local profile still applies for them.
    var acct = null;
    try { acct = JSON.parse(localStorage.getItem('idash.account') || 'null'); } catch (e) {}
    if (acct && acct.username) {
      p = p || {};
      p.name = acct.username;
      p.role = acct.role === 'admin' ? 'Admin' : 'User';
      // The stored photo belongs to whoever customised this device's profile,
      // not necessarily this account — drop it so identity stays truthful.
      p.photo = '';
    }
    if (!p) return;
    document.querySelectorAll('.sidebar-user').forEach(function (el) {
      var nameEl = el.querySelector('.user-name');
      var roleEl = el.querySelector('.user-role');
      var avEl = el.querySelector('.user-avatar');
      if (p.name && nameEl) nameEl.textContent = p.name;
      if (p.role && roleEl) roleEl.textContent = p.role;
      if (avEl) {
        if (p.photo) {
          // The saved avatar is a small data URL; painted as background so the
          // circle needs no <img> and the initial simply stops being visible.
          avEl.textContent = '';
          avEl.style.backgroundImage = 'url(' + p.photo + ')';
          avEl.style.backgroundSize = 'cover';
          avEl.style.backgroundPosition = 'center';
        } else if (p.name) {
          avEl.textContent = p.name.charAt(0).toUpperCase();
          avEl.style.backgroundImage = '';
        }
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyProfile);
  else applyProfile();
  window.iDashSidebarProfile = { refresh: applyProfile };
})();
