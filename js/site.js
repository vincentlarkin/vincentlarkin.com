// js/site.js - Shared site functionality

// Theme initialization
const SITE_THEMES = ['theme-light', 'theme-retro', 'theme-vin'];
const PARTIAL_VERSION = '20260803b';
const THEME_LABELS = {
  'theme-light': 'Editorial Light',
  'theme-retro': 'Retro Theme',
  'theme-vin': 'Life of a VIN'
};
const THEME_ICONS = {
  'theme-light': '\u2600',
  'theme-retro': '\u25A3',
  'theme-vin': '\u269C'
};
const SUPPORTED_LANGS = ['en', 'pt', 'ja'];
const LANG_LABELS = { en: 'EN', pt: 'PT', ja: 'JA' };
const LANG_FLAGS = {
  en: '/images/flags/us.png',
  pt: '/images/flags/pt.svg',
  ja: '/images/flags/jp.svg'
};
const LANG_LOCALES = { en: 'en-US', pt: 'pt-PT', ja: 'ja-JP' };

function getLocaleForLang(lang) {
  return LANG_LOCALES[lang] || LANG_LOCALES.en;
}

function getStoredTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'theme-dark') return 'theme-light';
  return SITE_THEMES.includes(savedTheme) ? savedTheme : 'theme-light';
}

function applySiteTheme(theme, persist = false) {
  const safeTheme = SITE_THEMES.includes(theme) ? theme : 'theme-light';
  document.documentElement.classList.remove(...SITE_THEMES);
  document.documentElement.classList.add(safeTheme);
  document.body.classList.remove(...SITE_THEMES);
  document.body.classList.add(safeTheme);

  if (safeTheme === 'theme-retro') {
    ensureRetroChrome();
    updateRetroAddress();
  }

  if (persist) {
    localStorage.setItem('theme', safeTheme);
  }

  return safeTheme;
}

function getThemeSelectLabel(theme) {
  return THEME_LABELS[theme] || THEME_LABELS['theme-light'];
}

function getThemeSelectTitle(theme) {
  return `Current theme: ${getThemeSelectLabel(theme)}`;
}

function getRetroDisplayUrl(url = window.location.href) {
  const nextUrl = new URL(url, window.location.origin);
  const path = normalizePath(nextUrl.pathname);
  return 'http://vincentlarkin.com' + path + nextUrl.search + nextUrl.hash;
}

function updateRetroAddress(url) {
  const displayUrl = getRetroDisplayUrl(url);
  document.body.dataset.retroUrl = displayUrl;

  const addressBox = document.getElementById('retro-address-box');
  if (addressBox) {
    addressBox.value = displayUrl;
  }
}

function ensureRetroChrome() {
  if (document.getElementById('retro-browser-chrome')) return;

  const chrome = document.createElement('div');
  chrome.id = 'retro-browser-chrome';
  chrome.className = 'retro-browser-chrome';
  chrome.setAttribute('aria-label', 'Retro browser toolbar');
  chrome.innerHTML = [
    '<div class="retro-titlebar">',
    '  <span class="retro-window-icon"></span>',
    '  <span class="retro-title">NCSA Mosaic for MS Windows - [vincentlarkin.com]</span>',
    '  <span class="retro-window-buttons"><span></span><span></span><span></span></span>',
    '</div>',
    '<div class="retro-menubar">File&nbsp;&nbsp;&nbsp;Edit&nbsp;&nbsp;&nbsp;Options&nbsp;&nbsp;&nbsp;Navigate&nbsp;&nbsp;&nbsp;Hotlist&nbsp;&nbsp;&nbsp;Annotate&nbsp;&nbsp;&nbsp;Help</div>',
    '<div class="retro-toolbar">',
    '  <button type="button" data-retro-action="back"><span class="retro-icon">\u2190</span><span>Back</span></button>',
    '  <button type="button" data-retro-action="forward"><span class="retro-icon">\u2192</span><span>Forward</span></button>',
    '  <button type="button" data-retro-action="home"><span class="retro-icon">\u2302</span><span>Home</span></button>',
    '  <button type="button" data-retro-action="reload"><span class="retro-icon">\u21BB</span><span>Reload</span></button>',
    '  <button type="button" data-retro-action="open"><span class="retro-icon">\u25A4</span><span>Open</span></button>',
    '  <button type="button" data-retro-action="find"><span class="retro-icon">\u2315</span><span>Find</span></button>',
    '  <button type="button" data-retro-action="stop"><span class="retro-icon">\u2297</span><span>Stop</span></button>',
    '  <span class="retro-globe" aria-hidden="true"></span>',
    '</div>',
    '<div class="retro-location-row">',
    '  <label>Document Title:<input type="text" value="vincentlarkin.com" readonly tabindex="-1"></label>',
    '  <label>Document URL:<input id="retro-address-box" type="text" readonly tabindex="-1"></label>',
    '</div>'
  ].join('');

  document.body.prepend(chrome);
  bindRetroChromeActions(chrome);
}

function flashRetroButton(button) {
  button.classList.add('is-clicked');
  window.setTimeout(() => button.classList.remove('is-clicked'), 160);
}

function bindRetroChromeActions(chrome) {
  chrome.addEventListener('click', event => {
    const button = event.target.closest('[data-retro-action]');
    if (!button) return;

    flashRetroButton(button);

    switch (button.dataset.retroAction) {
      case 'back':
        history.back();
        break;
      case 'forward':
        history.forward();
        break;
      case 'home':
        navigate('/', { push: true });
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'open':
      case 'find': {
        const addressBox = document.getElementById('retro-address-box');
        if (addressBox) {
          addressBox.focus();
          addressBox.select();
        }
        break;
      }
      default:
        updateRetroAddress();
        break;
    }
  });
}

(function() {
  applySiteTheme(getStoredTheme(), false);
})();

let spaInitialized = false;
let navInFlight = false;
let lightboxBound = false;
let languageHandlerBound = false;
let editorialNavGlobalsBound = false;
let vinRecentCommits = [];

const spaRoutes = new Set([
  '/',
  '/index.html',
  '/about.html',
  '/news.html',
  '/gallery.html',
  '/changelog.html'
]);

const navByPage = {
  index: 'nav-home',
  about: 'nav-about',
  news: 'nav-news',
  gallery: 'nav-gallery',
  changelog: 'nav-changelog'
};

// Monthly Gallery data
const monthlyImages = {
  "2026": [
    { file: "junho-julho-2026.webp", month: "junho", year: 2026, type: "image", caption: { en: "June-July 2026", pt: "Junho-Julho de 2026", ja: "2026\u5E746\u6708\u301C7\u6708" } },
    { file: "abril-2026.webp", month: "abril", year: 2026, type: "image", caption: { en: "April-May 2026", pt: "Abril-Maio de 2026", ja: "2026\u5E744\u6708\u301C5\u6708" } },
    { file: "marco-2026.webp", month: "março", year: 2026, type: "image" },
    { file: "fevereiro-2026.webp", month: "fevereiro", year: 2026, type: "image" },
    { file: "janeiro-2026.webp", month: "janeiro", year: 2026, type: "image" }
  ],
  "2025": [
    { file: "novembro-2025.webp", month: "novembro", year: 2025, type: "image" },
    { file: "outubro-2025.webp", month: "outubro", year: 2025, type: "image" },
    { file: "setembro2025.webp", month: "setembro", year: 2025, type: "image" },
    { file: "agostode2025.webp", month: "agosto", year: 2025, type: "image" }
  ]
};

// Path helpers for monthly imagery.
//   small  -> /images/mês/thumbs/<base>.webp     (~10-100 KB, gallery grid)
//   medium -> /images/mês/thumbs-md/<base>.webp  (~70-600 KB, home page card)
//   full   -> /images/mês/<file>                 (original, lightbox only)
// Thumbnails are pre-generated by hand with ffmpeg; see README. Keep the
// source filename (with original extension) for the full path so the
// lightbox loads the canonical original.
function getMonthlyImagePaths(file) {
  const dot = file.lastIndexOf('.');
  const base = dot === -1 ? file : file.slice(0, dot);
  return {
    small:  `/images/m\u00EAs/thumbs/${base}.webp`,
    medium: `/images/m\u00EAs/thumbs-md/${base}.webp`,
    full:   `/images/m\u00EAs/${file}`
  };
}

// Changelog config
const GITHUB_USERNAME = 'vincentlarkin';
const GITHUB_REPO = 'vincentlarkin.com';
const COMMITS_TO_FETCH = 30;
const INITIAL_DISPLAY = 5;
const LOAD_MORE_COUNT = 10;

const changelogState = {
  allCommits: [],
  displayedCount: 0,
  userData: null
};

let holidayRefreshTimer = null;

const holidayCatalog = [
  {
    id: 'new-years-day',
    countries: ['us', 'pt'],
    theme: 'new-year',
    icon: '\uD83C\uDF86',
    particles: ['\uD83C\uDF86', '\u2728', '\uD83C\uDF89'],
    matches(date) {
      return isSameMonthDay(date, 1, 1);
    }
  },
  {
    id: 'presidents-day',
    countries: ['us'],
    theme: 'patriot',
    icon: '\uD83C\uDDFA\uD83C\uDDF8',
    particles: ['\uD83C\uDDFA\uD83C\uDDF8', '\u2B50', '\u2728'],
    matches(date) {
      return isSameLocalDate(date, getNthWeekdayOfMonth(date.getFullYear(), 2, 1, 3));
    }
  },
  {
    id: 'easter',
    countries: ['us', 'pt'],
    theme: 'easter',
    icon: '\u271D\uFE0F',
    particles: ['\u271D\uFE0F', '\u2728', '\uD83D\uDD14'],
    matches(date) {
      return isSameLocalDate(date, getEasterSunday(date.getFullYear()));
    }
  },
  {
    id: 'memorial-day',
    countries: ['us'],
    theme: 'patriot',
    icon: '\uD83C\uDDFA\uD83C\uDDF8',
    particles: ['\uD83C\uDDFA\uD83C\uDDF8', '\u2B50', '\u2728'],
    matches(date) {
      return isSameLocalDate(date, getLastWeekdayOfMonth(date.getFullYear(), 5, 1));
    }
  },
  {
    id: 'portugal-day',
    countries: ['pt'],
    theme: 'portugal',
    icon: '\uD83C\uDDF5\uD83C\uDDF9',
    particles: ['\uD83C\uDDF5\uD83C\uDDF9', '\u2B50', '\u2728'],
    matches(date) {
      return isSameMonthDay(date, 6, 10);
    }
  },
  {
    id: 'independence-day',
    countries: ['us'],
    theme: 'independence',
    icon: '\uD83C\uDF86',
    particles: ['\uD83C\uDF86', '\uD83C\uDDFA\uD83C\uDDF8', '\u2728'],
    matches(date) {
      return isSameMonthDay(date, 7, 4);
    }
  },
  {
    id: 'labor-day',
    countries: ['us'],
    theme: 'patriot',
    icon: '\uD83C\uDDFA\uD83C\uDDF8',
    particles: ['\uD83C\uDDFA\uD83C\uDDF8', '\u2B50', '\u2728'],
    matches(date) {
      return isSameLocalDate(date, getNthWeekdayOfMonth(date.getFullYear(), 9, 1, 1));
    }
  },
  {
    id: 'columbus-day',
    countries: ['us'],
    theme: 'patriot',
    icon: '\uD83C\uDDFA\uD83C\uDDF8',
    particles: ['\uD83C\uDDFA\uD83C\uDDF8', '\u2B50', '\u2728'],
    matches(date) {
      return isSameLocalDate(date, getNthWeekdayOfMonth(date.getFullYear(), 10, 1, 2));
    }
  },
  {
    id: 'veterans-day',
    countries: ['us'],
    theme: 'patriot',
    icon: '\uD83C\uDDFA\uD83C\uDDF8',
    particles: ['\uD83C\uDDFA\uD83C\uDDF8', '\u2B50', '\u2728'],
    matches(date) {
      return isSameMonthDay(date, 11, 11);
    }
  },
  {
    id: 'thanksgiving',
    countries: ['us'],
    theme: 'thanksgiving',
    icon: '\uD83E\uDD83',
    particles: ['\uD83E\uDD83', '\uD83C\uDF41', '\u2728'],
    matches(date) {
      return isSameLocalDate(date, getNthWeekdayOfMonth(date.getFullYear(), 11, 4, 4));
    }
  },
  {
    id: 'restoration-day',
    countries: ['pt'],
    theme: 'portugal',
    icon: '\uD83C\uDDF5\uD83C\uDDF9',
    particles: ['\uD83C\uDDF5\uD83C\uDDF9', '\u2B50', '\u2728'],
    matches(date) {
      return isSameMonthDay(date, 12, 1);
    }
  },
  {
    id: 'christmas',
    countries: ['us', 'pt'],
    theme: 'christmas',
    icon: '\uD83C\uDF84',
    particles: ['\uD83C\uDF84', '\u2728', '\u2744\uFE0F'],
    matches(date) {
      return isSameMonthDay(date, 12, 25);
    }
  }
];

function createLocalDate(year, month, day) {
  return new Date(year, month - 1, day);
}

function isSameLocalDate(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isSameMonthDay(date, month, day) {
  return date.getMonth() === month - 1 && date.getDate() === day;
}

function getNthWeekdayOfMonth(year, month, weekday, nth) {
  const first = createLocalDate(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return createLocalDate(year, month, 1 + offset + ((nth - 1) * 7));
}

function getLastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(year, month, 0);
  const offset = (lastDay.getDay() - weekday + 7) % 7;
  return createLocalDate(year, month, lastDay.getDate() - offset);
}

function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = ((19 * a) + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + (2 * e) + (2 * i) - h - k) % 7;
  const m = Math.floor((a + (11 * h) + (22 * l)) / 451);
  const month = Math.floor((h + l - (7 * m) + 114) / 31);
  const day = ((h + l - (7 * m) + 114) % 31) + 1;
  return createLocalDate(year, month, day);
}

function getHolidayCopy(key, fallback) {
  if (window.langSystem) {
    return langSystem.t('holiday', key) || fallback;
  }
  return fallback;
}

function getCurrentHoliday(date = new Date()) {
  return holidayCatalog.find(holiday => holiday.matches(date)) || null;
}

function buildHolidayTitle(holiday) {
  const regions = holiday.countries
    .map(country => getHolidayCopy(`label-${country}`, country.toUpperCase()))
    .join(' / ');
  const title = getHolidayCopy('title', "Today's holiday");
  const name = getHolidayCopy(`name-${holiday.id}`, holiday.id);
  return `${title}: ${name} - ${regions}`;
}

function scheduleHolidayRefresh() {
  if (holidayRefreshTimer) {
    clearTimeout(holidayRefreshTimer);
  }

  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 1, 0);
  const delay = Math.max(1000, nextMidnight.getTime() - Date.now());

  holidayRefreshTimer = window.setTimeout(() => {
    renderHolidayMonitor();
  }, delay);
}

function renderHolidayParticles(holiday, container) {
  if (!container) return;

  const particleCount = 11;
  const timeSeed = Date.now() / 1000;
  container.innerHTML = '';

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement('span');
    const isTop = index % 2 === 0;
    const duration = 5.1 + ((index % 5) * 0.55);
    const offset = (timeSeed + (index * 0.73)) % duration;

    particle.className = `holiday-particle ${isTop ? 'is-top' : 'is-bottom'}`;
    particle.textContent = holiday.particles[index % holiday.particles.length];
    particle.style.left = `${-6 + ((index * 11) % 108)}%`;
    particle.style.top = isTop ? `${-8 + ((index % 4) * 7)}%` : 'auto';
    particle.style.bottom = isTop ? 'auto' : `${-8 + ((index % 4) * 7)}%`;
    particle.style.fontSize = `${0.82 + ((index % 4) * 0.12)}rem`;
    particle.style.opacity = `${0.2 + ((index % 3) * 0.08)}`;
    particle.style.animationDelay = `-${offset}s`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.setProperty('--drift', `${(index % 2 === 0 ? 1 : -1) * (12 + (index * 2))}px`);
    particle.style.setProperty('--travel-y', isTop ? '150%' : '-150%');
    container.appendChild(particle);
  }
}

function renderHolidayMonitor() {
  const holiday = getCurrentHoliday();
  const bubble = document.getElementById('holiday-monitor');
  const icon = document.getElementById('holiday-icon');
  const text = document.getElementById('holiday-text');
  const particles = document.getElementById('holiday-particles');

  scheduleHolidayRefresh();

  if (!bubble || !icon || !text || !particles) return;

  if (!holiday) {
    bubble.hidden = true;
    bubble.removeAttribute('data-holiday-id');
    bubble.removeAttribute('data-theme');
    bubble.removeAttribute('title');
    bubble.removeAttribute('aria-label');
    particles.innerHTML = '';
    text.textContent = '';
    icon.textContent = '';
    return;
  }

  bubble.hidden = false;
  bubble.dataset.theme = holiday.theme;
  const shouldRefreshParticles = bubble.dataset.holidayId !== holiday.id || particles.childElementCount === 0;
  bubble.dataset.holidayId = holiday.id;
  bubble.title = buildHolidayTitle(holiday);
  bubble.setAttribute('aria-label', bubble.title);
  icon.textContent = holiday.icon;
  text.textContent = getHolidayCopy(`message-${holiday.id}`, getHolidayCopy(`name-${holiday.id}`, holiday.id));
  if (shouldRefreshParticles) {
    renderHolidayParticles(holiday, particles);
  }
}

// Custom dropdown component.
// Replaces native <select> so we can render icons + flag images
// in both the trigger and the option list.
let customSelectGlobalsBound = false;
const openCustomSelects = new Set();

function initCustomSelect(root, { onSelect, value } = {}) {
  if (!root || root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const trigger = root.querySelector('.cs-trigger');
  const options = root.querySelector('.cs-options');
  if (!trigger || !options) return;

  function close() {
    if (!root.classList.contains('is-open')) return;
    root.classList.remove('is-open');
    options.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    openCustomSelects.delete(root);
  }

  function open() {
    if (root.classList.contains('is-open')) return;
    openCustomSelects.forEach(other => {
      if (other !== root) {
        other.dispatchEvent(new CustomEvent('cs:close'));
      }
    });
    root.classList.add('is-open');
    options.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    openCustomSelects.add(root);
  }

  root.addEventListener('cs:close', close);

  trigger.addEventListener('click', event => {
    event.stopPropagation();
    if (root.classList.contains('is-open')) {
      close();
    } else {
      open();
    }
  });

  trigger.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
      const first = options.querySelector('.cs-option');
      if (first) first.focus();
    }
  });

  options.querySelectorAll('.cs-option').forEach(option => {
    option.tabIndex = 0;

    option.addEventListener('click', event => {
      event.stopPropagation();
      const next = option.dataset.value;
      setCustomSelectValue(root, next);
      close();
      if (typeof onSelect === 'function') onSelect(next);
    });

    option.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        option.click();
      } else if (event.key === 'Escape') {
        close();
        trigger.focus();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = option.nextElementSibling;
        if (next) next.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = option.previousElementSibling;
        if (prev) prev.focus();
        else trigger.focus();
      }
    });
  });

  if (!customSelectGlobalsBound) {
    customSelectGlobalsBound = true;
    document.addEventListener('click', () => {
      openCustomSelects.forEach(node => node.dispatchEvent(new CustomEvent('cs:close')));
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        openCustomSelects.forEach(node => node.dispatchEvent(new CustomEvent('cs:close')));
      }
    });
  }

  if (value !== undefined) {
    setCustomSelectValue(root, value);
  }
}

function setCustomSelectValue(root, value) {
  if (!root) return;
  root.dataset.value = value;
  const options = root.querySelectorAll('.cs-option');
  let activeOption = null;
  options.forEach(option => {
    const isActive = option.dataset.value === value;
    option.classList.toggle('is-active', isActive);
    if (isActive) activeOption = option;
  });

  const trigger = root.querySelector('.cs-trigger');
  if (!trigger || !activeOption) return;

  const labelEl = trigger.querySelector('.cs-label');
  const iconEl = trigger.querySelector('.cs-icon');
  const flagEl = trigger.querySelector('.cs-flag');

  const optionLabel = activeOption.querySelector('span:not(.cs-icon)');
  const optionIcon = activeOption.querySelector('.cs-icon');
  const optionFlag = activeOption.querySelector('.cs-flag');

  if (labelEl && optionLabel) labelEl.textContent = optionLabel.textContent;
  if (iconEl && optionIcon) iconEl.textContent = optionIcon.textContent;
  if (flagEl && optionFlag) flagEl.src = optionFlag.src;
}

function getCustomSelectValue(root) {
  return root ? root.dataset.value : null;
}

function initThemeSelect() {
  const root = document.getElementById('theme-select');
  if (!root) return;

  const currentTheme = getStoredTheme();
  initCustomSelect(root, {
    value: currentTheme,
    onSelect: nextTheme => {
      const safeTheme = SITE_THEMES.includes(nextTheme) ? nextTheme : 'theme-light';
      applySiteTheme(safeTheme, true);
      const trigger = root.querySelector('.cs-trigger');
      if (trigger) trigger.title = getThemeSelectTitle(safeTheme);
    }
  });

  const trigger = root.querySelector('.cs-trigger');
  if (trigger) trigger.title = getThemeSelectTitle(currentTheme);
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
  const resolvedNavId = navId === 'home' ? 'nav-home' : navId;
  const navLinks = document.querySelectorAll('.nav a, .editorial-nav [data-nav-id]');
  navLinks.forEach(link => link.classList.remove('active'));
  if (!resolvedNavId) return;
  navLinks.forEach(link => {
    if (link.id === resolvedNavId || link.dataset.navId === resolvedNavId || (resolvedNavId === 'nav-home' && link.getAttribute('href') === '/')) {
      link.classList.add('active');
    }
  });
}

function closeEditorialNav() {
  document.querySelectorAll('.editorial-nav-trigger[aria-expanded="true"]').forEach(trigger => {
    trigger.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.editorial-submenu.is-open').forEach(panel => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  });
}

function initEditorialNav() {
  const nav = document.querySelector('.editorial-nav');
  if (!nav || nav.dataset.bound === 'true') return;
  nav.dataset.bound = 'true';

  nav.addEventListener('click', event => {
    const trigger = event.target.closest('.editorial-nav-trigger');
    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      const menuName = trigger.dataset.editorialMenu;
      const panel = nav.querySelector(`[data-editorial-panel="${menuName}"]`);
      if (!panel) return;
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      closeEditorialNav();
      if (willOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
      }
      return;
    }

    if (event.target.closest('.editorial-submenu-close')) {
      event.preventDefault();
      closeEditorialNav();
    }
  });

  if (!editorialNavGlobalsBound) {
    editorialNavGlobalsBound = true;
    document.addEventListener('click', event => {
      if (!event.target.closest('.editorial-nav')) closeEditorialNav();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeEditorialNav();
    });
  }
}

function beginPageTransition(contentEl) {
  closeEditorialNav();
  if (!document.body.classList.contains('theme-light') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    contentEl.classList.add('is-loading');
    return Promise.resolve();
  }

  document.body.classList.add('is-page-transitioning');
  contentEl.classList.remove('is-page-entering', 'is-page-entering-active');
  contentEl.classList.add('is-page-leaving');
  return new Promise(resolve => window.setTimeout(resolve, 210));
}

function finishPageTransition(contentEl) {
  const useSlide = document.body.classList.contains('theme-light')
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  contentEl.classList.remove('is-loading', 'is-page-leaving');
  if (!useSlide) {
    document.body.classList.remove('is-page-transitioning');
    return Promise.resolve();
  }

  contentEl.classList.add('is-page-entering');
  void contentEl.offsetWidth;
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      contentEl.classList.add('is-page-entering-active');
      window.setTimeout(() => {
        contentEl.classList.remove('is-page-entering', 'is-page-entering-active');
        document.body.classList.remove('is-page-transitioning');
        resolve();
      }, 300);
    });
  });
}

function normalizePath(pathname) {
  return pathname === '/index.html' ? '/' : pathname;
}

function getPageFromPath(pathname) {
  const normalized = normalizePath(pathname);
  if (normalized === '/') return 'index';
  if (normalized === '/about.html') return 'about';
  if (normalized === '/news.html') return 'news';
  if (normalized === '/gallery.html') return 'gallery';
  if (normalized === '/changelog.html') return 'changelog';
  return null;
}

function getNavIdForPage(page) {
  return page ? navByPage[page] : null;
}

// Load header and footer, then initialize language system
function loadHeaderFooter(activeNavId, page, langCallback) {
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');

  const headerLoaded = headerEl && headerEl.dataset.loaded === 'true';
  const footerLoaded = footerEl && footerEl.dataset.loaded === 'true';

  const headerPromise = headerEl && !headerLoaded
    ? fetch(`/header.html?v=${PARTIAL_VERSION}`).then(r => r.text())
    : Promise.resolve(null);
  const footerPromise = footerEl && !footerLoaded
    ? fetch(`/footer.html?v=${PARTIAL_VERSION}`).then(r => r.text())
    : Promise.resolve(null);

  return Promise.all([headerPromise, footerPromise]).then(([headerHtml, footerHtml]) => {
    if (headerHtml && headerEl) {
      headerEl.innerHTML = headerHtml;
      headerEl.dataset.loaded = 'true';
    }
    if (footerHtml && footerEl) {
      footerEl.innerHTML = footerHtml;
      footerEl.dataset.loaded = 'true';
    }

    if (page) {
      document.body.dataset.page = page;
    }

    if (activeNavId) setActiveNav(activeNavId);
    initThemeSelect();
    initEditorialNav();
    updateRetroAddress();
    initFooter();

    // Initialize language system after header is loaded
    const langInit = window.langSystem
      ? window.langSystem.init(page, langCallback)
      : Promise.resolve();

    return Promise.resolve(langInit).then(() => {
      bindLanguageHandler();
      initSpaNavigation();
      renderHolidayMonitor();
      return true;
    });
  });
}

function bindLanguageHandler() {
  if (languageHandlerBound) return;
  languageHandlerBound = true;
  document.addEventListener('languageChanged', () => {
    handleLanguageChange();
  });
}

function initPage(page, activeNavId) {
  const contentEl = document.getElementById('page-content');
  return loadHeaderFooter(activeNavId, page).then(() => {
    runPageInit(page);
    handleLanguageChange();
    if (contentEl) {
      requestAnimationFrame(() => {
        contentEl.classList.remove('is-loading');
      });
    }
  });
}

function initSpaNavigation() {
  if (spaInitialized) return;
  spaInitialized = true;

  document.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a');
    if (!link) return;
    if (!shouldHandleLink(link)) return;

    event.preventDefault();
    navigate(link.href, { push: true });
  });

  window.addEventListener('popstate', () => {
    navigate(window.location.href, { push: false });
  });
}

function shouldHandleLink(link) {
  if (!link) return false;
  if (link.target === '_blank' || link.hasAttribute('download')) return false;
  if (link.hasAttribute('data-no-spa')) return false;

  const href = link.getAttribute('href') || '';
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

  const url = new URL(link.href, window.location.origin);
  if (url.origin !== window.location.origin) return false;

  return spaRoutes.has(url.pathname) || spaRoutes.has(normalizePath(url.pathname));
}

function navigate(url, options = {}) {
  if (navInFlight) return;

  const targetUrl = new URL(url, window.location.origin);
  const currentUrl = new URL(window.location.href);
  const targetPath = normalizePath(targetUrl.pathname);
  const currentPath = normalizePath(currentUrl.pathname);
  const isHistoryNav = options.push === false;

  if (!spaRoutes.has(targetUrl.pathname) && !spaRoutes.has(targetPath)) {
    window.location.href = targetUrl.href;
    return;
  }

  if (!isHistoryNav && targetPath === currentPath && targetUrl.search === currentUrl.search) {
    if (targetUrl.hash) {
      const target = document.querySelector(targetUrl.hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  const contentEl = document.getElementById('page-content');
  if (!contentEl) {
    window.location.href = targetUrl.href;
    return;
  }

  navInFlight = true;
  closeLightbox();

  fetch(targetUrl.pathname + targetUrl.search, {
    credentials: 'same-origin',
    headers: { Accept: 'text/html' }
  })
    .then(response => {
      const responseUrl = new URL(response.url, window.location.origin);
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || responseUrl.origin !== window.location.origin || !contentType.includes('text/html')) {
        throw new Error('Navigation failed');
      }
      return response.text();
    })
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newContent = doc.getElementById('page-content');
      if (!newContent) throw new Error('Missing content');

      const nextPage = doc.body && doc.body.dataset && doc.body.dataset.page
        ? doc.body.dataset.page
        : getPageFromPath(targetPath);
      const nextNavId = getNavIdForPage(nextPage);

      return beginPageTransition(contentEl).then(() => ({ doc, newContent, nextPage, nextNavId }));
    })
    .then(({ doc, newContent, nextPage, nextNavId }) => {
      document.title = doc.title || document.title;
      contentEl.replaceChildren(...newContent.childNodes);

      if (nextPage) {
        document.body.dataset.page = nextPage;
        contentEl.dataset.page = nextPage;
      } else {
        delete document.body.dataset.page;
        delete contentEl.dataset.page;
      }

      document.body.style.overflow = '';

      return loadHeaderFooter(nextNavId, nextPage).then(() => {
        runPageInit(nextPage);
        handleLanguageChange();
      }).then(() => {
        if (options.push !== false) {
          history.pushState({}, '', targetUrl.pathname + targetUrl.search + targetUrl.hash);
        }
        updateRetroAddress(targetUrl.href);
        if (targetUrl.hash) {
          const target = document.querySelector(targetUrl.hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
        return finishPageTransition(contentEl);
      });
    })
    .catch(() => {
      window.location.href = targetUrl.href;
    })
    .finally(() => {
      navInFlight = false;
    });
}

function runPageInit(page) {
  switch (page) {
    case 'index':
      initIndexPage();
      break;
    case 'about':
      initAboutPage();
      break;
    case 'news':
      initNewsPage();
      break;
    case 'gallery':
      initGalleryPage();
      break;
    case 'changelog':
      initChangelogPage();
      break;
    default:
      break;
  }
}

function handleLanguageChange() {
  const page = document.body.dataset.page;
  if (page === 'gallery') {
    renderGallery();
  } else if (page === 'changelog') {
    refreshCommitDates();
    refreshChangelogText();
  } else if (page === 'index') {
    syncMonthlyAlt();
    renderVinMonthlyImage();
    if (vinRecentCommits.length > 0) {
      renderVinRecentNotes(vinRecentCommits);
    }
  }

  renderHolidayMonitor();
}

// Wires the medium-thumbnail src and the click-to-lightbox on a monthly
// hero <img>. The displayed image is always a thumbnail so the page never
// downloads a multi-MB master at first paint -- the original only loads
// when the user actually clicks to open the lightbox.
function bindMonthlyHeroImage(image, item, label) {
  if (!image || !item) return;
  const paths = getMonthlyImagePaths(item.file);
  image.src = paths.medium;
  image.alt = label;
  image.dataset.fullSrc = paths.full;
  image.onclick = () => openLightbox(paths.full, label);
}

function syncMonthlyAlt() {
  const caption = document.getElementById('monthly-caption');
  const image = document.getElementById('monthly-image');
  if (!caption || !image) return;
  const item = getLatestMonthlyImage();
  const label = caption.textContent || image.alt || '';
  if (item) {
    bindMonthlyHeroImage(image, item, label);
  } else {
    image.alt = label;
  }
}

function getLatestMonthlyImage() {
  const latestYear = Object.keys(monthlyImages)
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))[0];
  return latestYear && monthlyImages[latestYear] ? monthlyImages[latestYear][0] : null;
}

function getMonthlyImageLabel(item) {
  if (!item) return '';
  const lang = window.langSystem ? langSystem.getCurrentLang() : getStoredLang();
  if (item.caption && item.caption[lang]) {
    return item.caption[lang];
  }
  const monthName = window.langSystem ? langSystem.getMonthName(item.month) : item.month;
  return `${monthName} ${item.year}`;
}

function renderVinMonthlyImage() {
  const item = getLatestMonthlyImage();
  const image = document.getElementById('vin-monthly-image');
  const caption = document.getElementById('vin-monthly-caption');

  if (!item || !image || !caption) return;

  const label = getMonthlyImageLabel(item);

  bindMonthlyHeroImage(image, item, label);
  caption.textContent = label;
}

function getIndexText(key, fallback) {
  if (window.langSystem) {
    return langSystem.t('index', key) || fallback;
  }
  return fallback;
}

function formatVinCommitDate(date) {
  const currentLang = window.langSystem ? langSystem.getCurrentLang() : getStoredLang();
  const locale = getLocaleForLang(currentLang);
  const month = date.toLocaleDateString(locale, { month: 'short' });
  return {
    month,
    day: String(date.getDate()).padStart(2, '0')
  };
}

function getCommitSummary(commit) {
  const message = commit.commit && commit.commit.message ? commit.commit.message : '';
  const lines = message.split('\n');
  const title = lines[0] || 'Site update';
  const description = lines
    .slice(1)
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ');

  return {
    title,
    description: description || commit.sha.substring(0, 7)
  };
}

function renderVinRecentNotes(commits) {
  const container = document.getElementById('vin-recent-notes');
  if (!container) return;

  if (!Array.isArray(commits) || commits.length === 0) {
    container.innerHTML = `<div class="vin-loading">${getIndexText('recent-notes-empty', 'No recent commits found.')}</div>`;
    return;
  }

  container.innerHTML = commits.slice(0, 4).map(commit => {
    const commitDate = new Date(commit.commit.author.date);
    const dateParts = formatVinCommitDate(commitDate);
    const summary = getCommitSummary(commit);
    const commitUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/commit/${commit.sha}`;

    return `
      <a class="note-item" href="${commitUrl}" target="_blank" rel="noopener">
        <time datetime="${commitDate.toISOString()}"><span>${escapeHtml(dateParts.month)}</span><strong>${escapeHtml(dateParts.day)}</strong></time>
        <span><strong>${escapeHtml(summary.title)}</strong><small>${escapeHtml(summary.description)}</small></span>
        <span aria-hidden="true">&rarr;</span>
      </a>
    `;
  }).join('');
}

async function fetchVinRecentNotes() {
  const container = document.getElementById('vin-recent-notes');
  if (!container || container.dataset.loaded === 'true') return;

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/commits?per_page=4`);
    if (!response.ok) throw new Error('API error');
    const commits = await response.json();
    vinRecentCommits = Array.isArray(commits) ? commits : [];
    renderVinRecentNotes(commits);
    container.dataset.loaded = 'true';
  } catch (error) {
    container.innerHTML = `<div class="vin-loading">${getIndexText('recent-notes-error', 'Could not load recent commits.')}</div>`;
  }
}

function initIndexPage() {
  syncMonthlyAlt();
  renderVinMonthlyImage();
  fetchVinRecentNotes();
  initLightboxBindings();
}

function initAboutPage() {
  return;
}

function initNewsPage() {
  document.querySelectorAll('.news-sections .section-content').forEach(section => {
    section.style.display = 'block';
    const btn = section.previousElementSibling;
    const icon = btn ? btn.querySelector('.toggle-icon') : null;
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (icon) icon.textContent = '▲';
  });
}

function initGalleryPage() {
  renderGallery();
  initLightboxBindings();
}

function initChangelogPage() {
  changelogState.allCommits = [];
  changelogState.displayedCount = 0;
  changelogState.userData = null;
  fetchCommits();
}

function toggleSection(sectionId) {
  const content = document.getElementById(sectionId);
  if (!content) return;
  const btn = content.previousElementSibling;
  const icon = btn ? btn.querySelector('.toggle-icon') : null;
  const isHidden = content.style.display === 'none' || !content.style.display;
  content.style.display = isHidden ? 'block' : 'none';
  if (btn) btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  if (icon) icon.textContent = isHidden ? '▲' : '▼';
}

function toggleYear(yearId) {
  const content = document.getElementById(yearId);
  if (!content) return;
  const icon = content.previousElementSibling
    ? content.previousElementSibling.querySelector('.toggle-icon')
    : null;
  const isHidden = content.style.display === 'none' || !content.style.display;
  content.style.display = isHidden ? 'block' : 'none';
  if (icon) icon.textContent = isHidden ? '▲' : '▼';
}

function renderGallery() {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  let html = '';
  const years = Object.keys(monthlyImages).sort((a, b) => parseInt(b) - parseInt(a));

  years.forEach(year => {
    const yearItems = monthlyImages[year];
    const yearId = `year-${year}`;

    html += `
      <div class="gallery-year-section">
        <button class="gallery-year-toggle" onclick="toggleYear('${yearId}')">
          <span class="year-label">${year}</span>
          <span class="toggle-icon">▼</span>
        </button>
        <div class="gallery-year-content" id="${yearId}">
          <div class="gallery-grid">
    `;

    yearItems.forEach(item => {
      const paths = getMonthlyImagePaths(item.file);
      const label = getMonthlyImageLabel(item);
      const fullEsc = paths.full.replace(/'/g, "\\'");
      const labelEsc = label.replace(/'/g, "\\'");

      html += `
        <div class="gallery-item">
          <div class="gallery-item-container">
            <img src="${paths.small}" alt="${label}" class="gallery-media" loading="lazy" decoding="async" onclick="openLightbox('${fullEsc}', '${labelEsc}')">
          </div>
          <div class="gallery-item-caption">${label}</div>
        </div>
      `;
    });

    html += '</div></div></div>';
  });

  container.innerHTML = html;

  if (years.length > 0) {
    const firstYearContent = document.getElementById(`year-${years[0]}`);
    if (firstYearContent) {
      firstYearContent.style.display = 'block';
      const icon = firstYearContent.previousElementSibling
        ? firstYearContent.previousElementSibling.querySelector('.toggle-icon')
        : null;
      if (icon) icon.textContent = '▲';
    }
  }
}

function getStoredLang() {
  const storedLang = localStorage.getItem('lang');
  return SUPPORTED_LANGS.includes(storedLang) ? storedLang : 'en';
}

function getChangelogText(key, fallback) {
  if (window.langSystem) {
    return langSystem.t('changelog', key) || fallback;
  }
  return fallback;
}

function formatDate(date, lang) {
  const locale = getLocaleForLang(lang);
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function fetchUserAvatar(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (response.ok) return await response.json();
  } catch (e) {}
  return { avatar_url: `https://github.com/${username}.png` };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getSafeGitHubImageUrl(value, fallback) {
  try {
    const url = new URL(value);
    const allowedHosts = new Set(['github.com', 'avatars.githubusercontent.com']);
    return url.protocol === 'https:' && allowedHosts.has(url.hostname) ? url.href : fallback;
  } catch (error) {
    return fallback;
  }
}

function renderCommit(commit) {
  const currentLang = window.langSystem ? langSystem.getCurrentLang() : getStoredLang();
  const commitDate = new Date(commit.commit.author.date);
  const formattedDate = formatDate(commitDate, currentLang);
  const safeSha = /^[0-9a-f]{7,40}$/i.test(commit.sha) ? commit.sha : '';
  const shortHash = safeSha ? safeSha.substring(0, 7) : 'commit';
  const commitUrl = safeSha
    ? `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/commit/${safeSha}`
    : `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}`;
  const fallbackAvatarUrl = `https://github.com/${GITHUB_USERNAME}.png`;
  const avatarUrl = getSafeGitHubImageUrl(changelogState.userData && changelogState.userData.avatar_url, fallbackAvatarUrl);
  const messageLines = commit.commit.message.split('\n');
  const title = messageLines[0];

  let description = '';
  for (let i = 1; i < messageLines.length; i++) {
    if (messageLines[i].trim() === '') {
      description = messageLines.slice(i + 1).filter(line => line.trim()).join('\n');
      break;
    }
  }

  return `
    <div class="commit-item">
      <div class="commit-avatar">
        <img src="${avatarUrl}" alt="Profile" class="profile-pic">
      </div>
      <div class="commit-content">
        <div class="commit-header">
          <a href="${commitUrl}" target="_blank" rel="noopener noreferrer"><span class="commit-hash">${shortHash}</span></a>
          <span class="commit-date" data-original-date="${commit.commit.author.date}">${formattedDate}</span>
        </div>
        <div class="commit-message">${escapeHtml(title)}</div>
        ${description ? `<div class="commit-description">${escapeHtml(description)}</div>` : ''}
        <div class="commit-author">${escapeHtml(commit.commit.author.name)}</div>
      </div>
    </div>
  `;
}

function updateSeeMoreButton() {
  const btn = document.getElementById('see-more-btn');
  if (!btn) return;
  const currentLang = window.langSystem ? langSystem.getCurrentLang() : getStoredLang();

  if (changelogState.displayedCount < changelogState.allCommits.length) {
    const remaining = changelogState.allCommits.length - changelogState.displayedCount;
    const seeMoreText = window.langSystem ? (langSystem.t('changelog', 'see-more-btn') || 'See More') : 'See More';
    const remainingText = window.langSystem
      ? (langSystem.t('changelog', 'see-more-remaining') || 'remaining')
      : (currentLang === 'pt' ? 'restantes' : currentLang === 'ja' ? '\u6B8B\u308A' : 'remaining');
    btn.textContent = `${seeMoreText} (${remaining} ${remainingText})`;
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
}

function showMoreCommits() {
  const container = document.getElementById('commits-container');
  if (!container || changelogState.allCommits.length === 0) return;
  const nextBatch = changelogState.allCommits.slice(
    changelogState.displayedCount,
    changelogState.displayedCount + LOAD_MORE_COUNT
  );

  nextBatch.forEach(commit => {
    container.innerHTML += renderCommit(commit);
  });

  changelogState.displayedCount += nextBatch.length;
  updateSeeMoreButton();
}

async function fetchCommits() {
  const container = document.getElementById('commits-container');
  if (!container) return;

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/commits?per_page=${COMMITS_TO_FETCH}`);
    if (!response.ok) throw new Error('API error');

    changelogState.allCommits = await response.json();
    if (changelogState.allCommits.length === 0) {
      container.innerHTML = `<div class="no-commits">${getChangelogText('changelog-no-commits', 'No commits found')}</div>`;
      return;
    }

    changelogState.userData = await fetchUserAvatar(GITHUB_USERNAME);

    const initialCommits = changelogState.allCommits.slice(0, INITIAL_DISPLAY);
    container.innerHTML = initialCommits.map(renderCommit).join('');
    changelogState.displayedCount = initialCommits.length;

    updateSeeMoreButton();
  } catch (error) {
    container.innerHTML = `<div class="error-message">${getChangelogText('changelog-error', 'Could not load commits from GitHub.')}</div>`;
  }
}

function refreshCommitDates() {
  const currentLang = window.langSystem ? langSystem.getCurrentLang() : getStoredLang();
  document.querySelectorAll('.commit-date[data-original-date]').forEach(el => {
    const date = new Date(el.dataset.originalDate);
    el.textContent = formatDate(date, currentLang);
  });
  updateSeeMoreButton();
}

function refreshChangelogText() {
  const loadingEl = document.getElementById('changelog-loading');
  if (loadingEl) {
    loadingEl.textContent = getChangelogText('changelog-loading', 'Loading commits...');
  }
  const noCommitsEl = document.querySelector('.no-commits');
  if (noCommitsEl) {
    noCommitsEl.textContent = getChangelogText('changelog-no-commits', 'No commits found');
  }
  const errorEl = document.querySelector('.error-message');
  if (errorEl) {
    errorEl.textContent = getChangelogText('changelog-error', 'Could not load commits from GitHub.');
  }
}

function openLightbox(src, caption) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const image = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  if (image) image.src = src;
  if (captionEl) captionEl.textContent = caption || '';
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox(event) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  if (event) {
    const target = event.target;
    const isCloseTarget = target && (
      target.id === 'lightbox' ||
      (target.classList && target.classList.contains('lightbox-close'))
    );
    if (!isCloseTarget) return;
  }

  lightbox.style.display = 'none';
  document.body.style.overflow = '';
}

function initLightboxBindings() {
  if (lightboxBound) return;
  lightboxBound = true;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
}

window.toggleSection = toggleSection;
window.toggleYear = toggleYear;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.showMoreCommits = showMoreCommits;
window.initCustomSelect = initCustomSelect;
window.setCustomSelectValue = setCustomSelectValue;
window.getCustomSelectValue = getCustomSelectValue;

// Export for use
window.siteUtils = {
  loadHeaderFooter,
  setActiveNav,
  initPage,
  navigate,
  handleLanguageChange,
  getCurrentLang: () => {
    if (window.langSystem) return window.langSystem.getCurrentLang();
    return getStoredLang();
  }
};

