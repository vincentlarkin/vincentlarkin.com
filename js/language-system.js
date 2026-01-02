// Global language system
let currentLang = localStorage.getItem('lang') || 'en';
let translations = {};

// Load language and content
async function initLanguageSystem() {
  try {
    console.log('Initializing language system...');
    const response = await fetch('/js/translations.json');
    translations = await response.json();
    console.log('Loaded translations:', translations);
    applyLanguage(currentLang);
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  
  // Dispatch custom event for language change
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  
  const currentPage = getCurrentPage();
  
  // Apply page translations
  const pageTranslations = translations[getCurrentPage()] || {};
  for (const [id, text] of Object.entries(pageTranslations)) {
    const element = document.getElementById(id);
    if (element) {
      let content = text[lang] || '';
      
      // Handle special placeholders for contact page
      if (id === 'contact-text') {
        const emailLink = '<a href="mailto:vincent@vincentlarkin.com">vincent@vincentlarkin.com</a>';
        const githubLink = '<a href="https://github.com/vincentw2">GitHub</a>';
        content = content.replace('{email}', emailLink).replace('{github}', githubLink);
        element.innerHTML = content;
      } else if (id === 'changelog-source') {
        // Handle HTML content for changelog source
        element.innerHTML = content;
      } else if (id.startsWith('label-') || id === 'about-title' || id === 'personal-info-title' || id === 'contact-title') {
        // Handle about page labels - just text content
        element.textContent = content;
      } else if (id === 'gallery-paintings-link' || id === 'paintings-gallery-link') {
        // Handle gallery navigation links
        element.textContent = content;
      } else {
        element.textContent = content;
      }
    }
  }
  
  // Apply navigation translations
  const navTranslations = translations.nav || {};
  for (const [id, text] of Object.entries(navTranslations)) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = `> ${text[lang]}`;
    }
  }
  
  // Update language button with "PT | ENG" format
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    if (lang === 'pt') {
      langBtn.innerHTML = '<span class="lang-active">PT</span> | <span class="lang-inactive">ENG</span>';
    } else {
      langBtn.innerHTML = '<span class="lang-inactive">PT</span> | <span class="lang-active">ENG</span>';
    }
  }
}

// Language toggle function
function switchLanguage() {
  const newLang = currentLang === 'pt' ? 'en' : 'pt';
  applyLanguage(newLang);
}

// Helper function to get current page name
function getCurrentPage() {
  const path = window.location.pathname;
  console.log('Current pathname:', path);
  if (path === '/' || path === '/index.html') return 'index';
  if (path.includes('about.html')) return 'about';
  if (path.includes('news.html')) return 'news';
  if (path.includes('contact.html')) return 'contact';
  if (path.includes('changelog.html')) return 'changelog';
  if (path.includes('gallery.html')) return 'gallery';
  if (path.includes('paintings.html')) return 'paintings';
  if (path.includes('/articles/')) return 'article';
  return 'index';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSystem);
} else {
  initLanguageSystem();
} 