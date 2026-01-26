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

// Navigation translations
const navTranslations = {
  pt: { 
    'nav-news': 'Notícias / Livros', 
    'nav-gallery': 'Galeria / Pinturas', 
    'nav-about': 'Sobre', 
    'nav-changelog': 'Changelog' 
  },
  en: { 
    'nav-news': 'News / Books', 
    'nav-gallery': 'Gallery / Paintings', 
    'nav-about': 'About', 
    'nav-changelog': 'Changelog' 
  }
};

// Get current language
function getCurrentLang() {
  return localStorage.getItem('lang') || 'pt';
}

// Apply navigation translations
function applyNavTranslations(lang) {
  const texts = navTranslations[lang];
  Object.entries(texts).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}

// Initialize header functionality
function initHeader() {
  // Theme toggle
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
  
  // Language toggle
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    let currentLang = getCurrentLang();
    
    function applyLang(lang) {
      langBtn.textContent = lang.toUpperCase();
      langBtn.className = 'ctrl-btn lang-' + lang;
      applyNavTranslations(lang);
      
      // Dispatch event for page-specific translations
      document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
    
    langBtn.addEventListener('click', function() {
      currentLang = currentLang === 'pt' ? 'en' : 'pt';
      localStorage.setItem('lang', currentLang);
      applyLang(currentLang);
    });
    
    applyLang(currentLang);
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

// Load header and footer
function loadHeaderFooter(activeNavId) {
  // Load header
  fetch('/header.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('site-header').innerHTML = html;
      if (activeNavId) setActiveNav(activeNavId);
      initHeader();
    });
  
  // Load footer
  fetch('/footer.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('site-footer').innerHTML = html;
      initFooter();
    });
}

// Export for use
window.siteUtils = {
  getCurrentLang,
  loadHeaderFooter,
  setActiveNav,
  navTranslations
};
