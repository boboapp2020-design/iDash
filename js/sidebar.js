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
        if (action === 'settings' || action === 'profile') {
          showAppToast('ฟีเจอร์นี้จะเปิดใช้งานเมื่อเชื่อมต่อระบบผู้ใช้ (หลัง Supabase Auth พร้อม)');
        } else if (action === 'logout') {
          clearLocalAppState();
          window.location.href = 'index.html';
        }
      });
    });
  });
})();
