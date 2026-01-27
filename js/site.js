// js/site.js - Shared site functionality

// Theme initialization (run immediately)
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'theme-light') {
    document.body.className = 'theme-light';
  } else {
    document.body.className = 'theme-dark';
  }
})();

// Initialize theme toggle
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      const isDark = document.body.classList.contains('theme-dark');
      document.body.className = isDark ? 'theme-light' : 'theme-dark';
      localStorage.setItem('theme', document.body.className);
      themeBtn.textContent = isDark ? '◑' : '◐';
    });
    themeBtn.textContent = document.body.classList.contains('theme-dark') ? '◐' : '◑';
  }
}

// Initialize footer
function initFooter() {
  const yearSpan = document.getElementById('copyright-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

// Mark active nav link
function setActiveNav(navId) {
  document.querySelectorAll('.nav a').forEach(link => {
    if (link.id === navId || (navId === 'home' && link.getAttribute('href') === '/')) {
      link.classList.add('active');
    }
  });
}

// Load header and footer, then initialize language system
function loadHeaderFooter(activeNavId, page, langCallback) {
  Promise.all([
    fetch('/header.html').then(r => r.text()),
    fetch('/footer.html').then(r => r.text())
  ]).then(([headerHtml, footerHtml]) => {
    document.getElementById('site-header').innerHTML = headerHtml;
    document.getElementById('site-footer').innerHTML = footerHtml;
    
    if (page) {
      document.body.dataset.page = page;
    }
    
    // Immediately set language button class
    const storedLang = localStorage.getItem('lang');
    const lang = storedLang === 'pt' || storedLang === 'en' ? storedLang : 'en';
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.textContent = lang.toUpperCase();
      langBtn.className = 'ctrl-btn lang-' + lang;
    }
    
    if (activeNavId) setActiveNav(activeNavId);
    initThemeToggle();
    initFooter();
    
    // Initialize language system after header is loaded
    if (window.langSystem) {
      window.langSystem.init(page, langCallback);
    }
  });
}

// Export for use
window.siteUtils = {
  loadHeaderFooter,
  setActiveNav,
  getCurrentLang: () => {
    if (window.langSystem) return window.langSystem.getCurrentLang();
    const storedLang = localStorage.getItem('lang');
    return storedLang === 'pt' || storedLang === 'en' ? storedLang : 'en';
  }
};
