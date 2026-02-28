// Language System - Centralized translations
const supportedLangs = ['en', 'pt'];
function normalizeLang(value) {
  return supportedLangs.includes(value) ? value : 'en';
}

let currentLang = normalizeLang(localStorage.getItem('lang'));
let translations = {};
let translationsLoaded = false;
let currentPage = null;
let langCallback = null;

// Fallback month names in case translations fail to load
const fallbackMonths = {
  janeiro: { pt: 'Janeiro', en: 'January' },
  fevereiro: { pt: 'Fevereiro', en: 'February' },
  março: { pt: 'Março', en: 'March' },
  abril: { pt: 'Abril', en: 'April' },
  maio: { pt: 'Maio', en: 'May' },
  junho: { pt: 'Junho', en: 'June' },
  julho: { pt: 'Julho', en: 'July' },
  agosto: { pt: 'Agosto', en: 'August' },
  setembro: { pt: 'Setembro', en: 'September' },
  outubro: { pt: 'Outubro', en: 'October' },
  novembro: { pt: 'Novembro', en: 'November' },
  dezembro: { pt: 'Dezembro', en: 'December' }
};

const embeddedTranslations = {
  nav: {
    'nav-home': { pt: 'Início', en: 'Home' },
    'nav-about': { pt: 'Sobre', en: 'About' },
    'nav-news': { pt: 'Notícias / Livros', en: 'News / Books' },
    'nav-gallery': { pt: 'Galeria / Pinturas', en: 'Gallery / Paintings' },
    'nav-changelog': { pt: 'Changelog', en: 'Changelog' },
    'nav-caddo': { pt: 'Caddo911 Monitor', en: 'Caddo911 Monitor' }
  },
  global: {
    'footer-github': { pt: 'GitHub', en: 'GitHub' }
  },
  index: {
    'welcome-title': { pt: 'Bem-vindo', en: 'Welcome' },
    'intro-text': {
      pt: 'Olá. Este é meu site pessoal. Navegue pelo menu acima para explorar.',
      en: 'Hello. This is my personal website. Use the menu above to navigate.'
    },
    'status-text': { pt: 'site online', en: 'site online' },
    'monthly-label': { pt: 'Imagem do Mês', en: 'Image of the Month' },
    'monthly-caption': { pt: 'Março de 2026', en: 'March 2026' },
    'links-label': { pt: 'Links Rápidos', en: 'Quick Links' },
    'link-about': { pt: 'Sobre', en: 'About' },
    'link-gallery': { pt: 'Galeria', en: 'Gallery' }
  },
  about: {
    'about-title': { pt: 'Sobre', en: 'About' },
    'personal-info-title': { pt: 'Informações Pessoais', en: 'Personal Information' },
    'label-occupation': { pt: 'Ocupação', en: 'Occupation' },
    'value-occupation': { pt: 'Diretor de Operações', en: 'Director of Operations' },
    'label-employer': { pt: 'Empregador', en: 'Employer' },
    'contact-title': { pt: 'Contato', en: 'Contact' },
    'label-github': { pt: 'Github', en: 'Github' },
    'label-email': { pt: 'Email', en: 'Email' },
    'label-linkedin': { pt: 'LinkedIn', en: 'LinkedIn' }
  },
  news: {
    'news-title': { pt: 'Notícias / Livros', en: 'News / Books' },
    'news-description': {
      pt: 'Artigos interessantes da internet e minha estante de livros.',
      en: 'Interesting articles from the internet and my bookshelf.'
    },
    'news-section-society': { pt: 'Sociedade e Cultura', en: 'Society & Culture' },
    'news-section-health': { pt: 'Saúde e Medicina', en: 'Health & Medicine' },
    'news-section-politics': { pt: 'Política e Relações Internacionais', en: 'Politics & International Relations' },
    'news-section-business': { pt: 'Negócios e Tecnologia', en: 'Business & Technology' },
    'bookshelf-title': { pt: 'Estante de Livros', en: 'Bookshelf' },
    'bookshelf-subtitle': {
      pt: 'Livros que encontro interessantes ou bons para ter em mãos.',
      en: 'Books I find insightful or good to have on hand.'
    },
    'bookshelf-empty-text': { pt: 'Nenhum livro adicionado ainda.', en: 'No books added yet.' },
    'wip-badge': { pt: 'Em Progresso', en: 'Work in Progress' }
  },
  gallery: {
    'gallery-title': { pt: 'Galeria / Pinturas', en: 'Gallery / Paintings' },
    'gallery-description': {
      pt: 'Imagens mensais e minha coleção de pinturas.',
      en: 'Monthly images and my painting collection.'
    },
    'monthly-label': { pt: 'Galeria Mensal', en: 'Monthly Gallery' },
    'paintings-label': { pt: 'Pinturas', en: 'Paintings' },
    'paintings-description': {
      pt: 'Uma coleção de pinturas e imagens que gosto.',
      en: 'A collection of paintings and images I like.'
    },
    'paintings-empty': { pt: 'Nenhuma pintura ainda.', en: 'No paintings yet.' }
  },
  changelog: {
    'changelog-title': { pt: 'Changelog', en: 'Changelog' },
    'changelog-subtitle': {
      pt: 'Atualizações recentes do site',
      en: 'Recent site updates'
    },
    'changelog-source-label': { pt: 'Fonte:', en: 'Source:' },
    'changelog-source-link': { pt: 'Repositório GitHub', en: 'GitHub Repository' },
    'changelog-loading': { pt: 'Carregando commits...', en: 'Loading commits...' },
    'changelog-no-commits': { pt: 'Nenhum commit encontrado', en: 'No commits found' },
    'changelog-error': { pt: 'Não foi possível carregar commits do GitHub.', en: 'Could not load commits from GitHub.' },
    'see-more-btn': { pt: 'Ver Mais', en: 'See More' }
  },
  months: fallbackMonths
};

// Load translations from embedded object only
async function loadTranslations() {
  translations = embeddedTranslations;
  translationsLoaded = true;
  return true;
}

// Get current language
function getCurrentLang() {
  return currentLang;
}

// Get translation for a key
function t(page, key) {
  if (translations[page] && translations[page][key]) {
    return translations[page][key][currentLang] || '';
  }
  return '';
}

// Get month name (with fallback support)
function getMonthName(monthKey) {
  // Try translations first, then fallback
  if (translations.months && translations.months[monthKey]) {
    return translations.months[monthKey][currentLang] || monthKey;
  }
  if (fallbackMonths[monthKey]) {
    return fallbackMonths[monthKey][currentLang] || monthKey;
  }
  return monthKey;
}

// Apply nav translations
function applyNavTranslations() {
  const navTexts = translations.nav || {};
  for (const [id, text] of Object.entries(navTexts)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text[currentLang] || '';
    }
  }
}

// Apply global translations (shared UI outside nav/page)
function applyGlobalTranslations() {
  const globalTexts = translations.global || {};
  for (const [id, text] of Object.entries(globalTexts)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text[currentLang] || '';
    }
  }
}

// Apply page translations
function applyPageTranslations(page) {
  const pageTexts = translations[page] || {};
  for (const [id, text] of Object.entries(pageTexts)) {
    const el = document.getElementById(id);
    if (el) {
      const content = text[currentLang] || '';
      // Handle link items with nested spans
      if (el.tagName === 'A' && el.querySelector('span')) {
        el.querySelector('span').textContent = content;
      } else {
        el.textContent = content;
      }
    }
  }
}

// Update language button appearance
function updateLangButton() {
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.textContent = currentLang.toUpperCase();
    langBtn.className = 'ctrl-btn lang-' + currentLang;
  }
}

// Switch language
function switchLanguage() {
  currentLang = currentLang === 'en' ? 'pt' : 'en';
  localStorage.setItem('lang', currentLang);
  document.documentElement.lang = currentLang;
  updateLangButton();
  applyNavTranslations();
  applyGlobalTranslations();
  if (currentPage) {
    applyPageTranslations(currentPage);
  }
  
  // Dispatch event for page-specific handling
  document.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { lang: currentLang } 
  }));
}

// Initialize language system
async function initLanguageSystem(page, callback) {
  currentPage = page || document.body.dataset.page || null;
  langCallback = typeof callback === 'function' ? callback : null;
  await loadTranslations();
  
  // Apply translations
  applyNavTranslations();
  applyGlobalTranslations();
  if (currentPage) {
    applyPageTranslations(currentPage);
  }
  document.documentElement.lang = currentLang;
  updateLangButton();
  
  // Set up language button click handler
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn && !langBtn.dataset.bound) {
    langBtn.addEventListener('click', () => {
      switchLanguage();
      if (langCallback) {
        langCallback(currentLang);
      }
    });
    langBtn.dataset.bound = 'true';
  }
  
  // Run callback with initial language
  if (langCallback) {
    langCallback(currentLang);
  }
}

// Export for use
window.langSystem = {
  init: initLanguageSystem,
  getCurrentLang,
  t,
  getMonthName,
  switchLanguage,
  applyPageTranslations,
  applyNavTranslations
};
