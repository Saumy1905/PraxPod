// assets/js/main.js
(function() {
  const root = document.documentElement;
  const body = document.body;
  const THEME_KEY = 'praxpod-theme';
  const toggleBtn = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');

  // Apply saved theme
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') body.classList.add('dark-theme');

  // Toggle theme
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      body.classList.toggle('dark-theme');
      localStorage.setItem(THEME_KEY, body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
  }

  // Menu toggle
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }
})();
