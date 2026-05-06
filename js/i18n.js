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
  'nav-gallery': { pt: 'Galeria', en: 'Gallery' },
    'nav-changelog': { pt: 'Changelog', en: 'Changelog' },
    'nav-caddo': { pt: 'Caddo911 Monitor', en: 'Caddo911 Monitor' },
    'nav-archive': { pt: 'archive.vincentlarkin.com', en: 'archive.vincentlarkin.com' }
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
    'monthly-caption': { pt: 'Abril de 2026', en: 'April 2026' },
    'links-label': { pt: 'Links Rápidos', en: 'Quick Links' },
    'link-about': { pt: 'Sobre', en: 'About' },
    'link-gallery': { pt: 'Galeria', en: 'Gallery' },
    'recent-notes-label': { pt: 'Notas Recentes', en: 'Recent Notes' },
    'recent-notes-loading': { pt: 'Carregando commits recentes...', en: 'Loading recent commits...' },
    'recent-notes-empty': { pt: 'Nenhum commit recente encontrado.', en: 'No recent commits found.' },
    'recent-notes-error': { pt: 'Não foi possível carregar commits recentes.', en: 'Could not load recent commits.' },
    'view-changelog': { pt: 'Ver Changelog', en: 'View Changelog' },
    'quick-about-description': { pt: 'Saiba mais sobre mim', en: 'Learn more about me' },
    'quick-news-description': { pt: 'Leituras', en: 'Reading' },
    'quick-gallery-description': { pt: 'Fotos mensais em destaque do arquivo', en: 'Historical monthly featured photos' },
    'quick-changelog-description': { pt: 'Atualizações e histórico do site', en: 'Site updates and history' },
    'quick-caddo-description': { pt: 'Monitor de incidentes 911. Agora inclui 1 paróquia e 2 cidades.', en: '911 Incident Tracker. Now includes 1 parish and 2 cities.' },
    'quick-archive-description': { pt: 'The Royal Archive Project', en: 'The Royal Archive Project' },
    'contact-status-label': { pt: 'Contato e Status', en: 'Contact & Status' },
    'view-profile': { pt: 'Ver Perfil Completo', en: 'View Full Profile' },
    'status-operational': { pt: 'Todos os sistemas operacionais.', en: 'All systems operational.' }
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
    'gallery-title': { pt: 'Galeria', en: 'Gallery' },
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
    'paintings-archive-prefix': {
      pt: 'Movido para',
      en: 'Moved to'
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
  holiday: {
    'title': { pt: 'Feriado de hoje', en: "Today's holiday" },
    'label-us': { pt: 'Estados Unidos', en: 'United States' },
    'label-pt': { pt: 'Portugal', en: 'Portugal' },
    'name-new-years-day': { pt: 'Ano Novo', en: "New Year's Day" },
    'message-new-years-day': { pt: 'Feliz Ano Novo', en: 'Happy New Year' },
    'name-presidents-day': { pt: 'Dia dos Presidentes', en: "Presidents' Day" },
    'message-presidents-day': { pt: 'Dia dos Presidentes', en: "Presidents' Day" },
    'name-easter': { pt: 'P\u00E1scoa', en: 'Easter' },
    'message-easter': { pt: 'Feliz P\u00E1scoa', en: 'Happy Easter' },
    'name-memorial-day': { pt: 'Dia da Mem\u00F3ria', en: 'Memorial Day' },
    'message-memorial-day': { pt: 'Dia da Mem\u00F3ria', en: 'Memorial Day' },
    'name-independence-day': { pt: 'Dia da Independ\u00EAncia', en: 'Independence Day' },
    'message-independence-day': { pt: 'Feliz Dia da Independ\u00EAncia', en: 'Happy Independence Day' },
    'name-labor-day': { pt: 'Dia do Trabalho', en: 'Labor Day' },
    'message-labor-day': { pt: 'Dia do Trabalho', en: 'Labor Day' },
    'name-columbus-day': { pt: 'Dia de Colombo', en: 'Columbus Day' },
    'message-columbus-day': { pt: 'Dia de Colombo', en: 'Columbus Day' },
    'name-veterans-day': { pt: 'Dia dos Veteranos', en: 'Veterans Day' },
    'message-veterans-day': { pt: 'Dia dos Veteranos', en: 'Veterans Day' },
    'name-thanksgiving': { pt: 'A\u00E7\u00E3o de Gra\u00E7as', en: 'Thanksgiving' },
    'message-thanksgiving': { pt: 'Feliz Dia de A\u00E7\u00E3o de Gra\u00E7as', en: 'Happy Thanksgiving' },
    'name-christmas': { pt: 'Natal', en: 'Christmas' },
    'message-christmas': { pt: 'Feliz Natal', en: 'Merry Christmas' },
    'name-portugal-day': { pt: 'Dia de Portugal', en: 'Portugal Day' },
    'message-portugal-day': { pt: 'Dia de Portugal', en: 'Portugal Day' },
    'name-restoration-day': { pt: 'Restaura\u00E7\u00E3o da Independ\u00EAncia', en: 'Restoration of Independence' },
    'message-restoration-day': { pt: 'Restaura\u00E7\u00E3o da Independ\u00EAncia', en: 'Restoration of Independence' }
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

function getTranslationEntry(page, key) {
  if (translations[page] && translations[page][key]) {
    return translations[page][key];
  }
  return null;
}

// Get translation for a key
function t(page, key) {
  const text = getTranslationEntry(page, key);
  return text ? (text[currentLang] || '') : '';
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

  function applyTranslatedContent(el, content) {
    if (el.tagName === 'A' && el.querySelector('span')) {
      el.querySelector('span').textContent = content;
    } else {
      el.textContent = content;
    }
  }

  for (const [id, text] of Object.entries(pageTexts)) {
    const el = document.getElementById(id);
    if (el) {
      const content = text[currentLang] || '';
      applyTranslatedContent(el, content);
    }
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const sourcePage = el.dataset.i18nPage || page;
    const text = sourcePage === page ? pageTexts[key] : getTranslationEntry(sourcePage, key);
    if (text) {
      const content = text[currentLang] || '';
      applyTranslatedContent(el, content);
    }
  });
}

// Update language button appearance
function updateLangButton() {
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    if (langBtn.tagName === 'SELECT') {
      langBtn.value = currentLang;
    } else {
      langBtn.textContent = currentLang.toUpperCase();
    }
    langBtn.classList.add('ctrl-btn');
    langBtn.classList.remove('lang-en', 'lang-pt');
    langBtn.classList.add('lang-' + currentLang);
  }

  const langFlag = document.getElementById('lang-flag');
  if (langFlag) {
    langFlag.textContent = '';
  }

  const langSelector = document.querySelector('.lang-selector');
  if (langSelector) {
    langSelector.classList.toggle('is-pt', currentLang === 'pt');
    langSelector.classList.toggle('is-en', currentLang !== 'pt');
  }
}

function setLanguage(lang) {
  currentLang = normalizeLang(lang);
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

// Switch language
function switchLanguage() {
  setLanguage(currentLang === 'en' ? 'pt' : 'en');
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
    langBtn.addEventListener(langBtn.tagName === 'SELECT' ? 'change' : 'click', () => {
      if (langBtn.tagName === 'SELECT') {
        setLanguage(langBtn.value);
      } else {
        switchLanguage();
      }
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
  setLanguage,
  switchLanguage,
  applyPageTranslations,
  applyNavTranslations
};
