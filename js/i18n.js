// Language System - Centralized translations
let currentLang = localStorage.getItem('lang') || 'pt';
let translations = {};
let translationsLoaded = false;

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

// Load translations from JSON
async function loadTranslations() {
  try {
    const response = await fetch('/js/translations.json');
    if (!response.ok) throw new Error('Failed to fetch');
    translations = await response.json();
    translationsLoaded = true;
    return true;
  } catch (error) {
    console.warn('Failed to load translations, using fallbacks:', error);
    translations = { months: fallbackMonths };
    return false;
  }
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
  currentLang = currentLang === 'pt' ? 'en' : 'pt';
  localStorage.setItem('lang', currentLang);
  updateLangButton();
  applyNavTranslations();
  
  // Dispatch event for page-specific handling
  document.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { lang: currentLang } 
  }));
}

// Initialize language system
async function initLanguageSystem(page, callback) {
  await loadTranslations();
  
  // Apply translations
  applyNavTranslations();
  if (page) {
    applyPageTranslations(page);
  }
  updateLangButton();
  
  // Set up language button click handler
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      switchLanguage();
      if (page) {
        applyPageTranslations(page);
      }
      if (callback) {
        callback(currentLang);
      }
    });
  }
  
  // Run callback with initial language
  if (callback) {
    callback(currentLang);
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
