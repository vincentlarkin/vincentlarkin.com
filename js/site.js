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

let spaInitialized = false;
let navInFlight = false;
let lightboxBound = false;
let languageHandlerBound = false;

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
    { file: "marco-2026.webp", month: "março", year: 2026, type: "image" },
    { file: "fevereiro-2026.jpg", month: "fevereiro", year: 2026, type: "image" },
    { file: "janeiro-2026.webp", month: "janeiro", year: 2026, type: "image" }
  ],
  "2025": [
    { file: "novembro-2025.webp", month: "novembro", year: 2025, type: "image" },
    { file: "outubro-2025.webp", month: "outubro", year: 2025, type: "image" },
    { file: "setembro2025.webp", month: "setembro", year: 2025, type: "image" },
    { file: "agostode2025.webp", month: "agosto", year: 2025, type: "image" }
  ]
};

// Paintings data
const paintings = [
  { file: "the-christian-general.webp", title: "The Christian General", artist: "William L. Maughan" },
  { file: "red-roses-still-life.webp", title: "Red Roses in Ornate Vase", artist: "Unattributed, circa unknown", credit: "AI assisted frame scan by Vincent L." },
  { file: "Shepherdess-with-Her-Flock.webp", title: "Shepherdess with Her Flock", artist: "Julien Dupré (1851–1910)", credit: "AI assisted frame scan by Vincent L." }
];

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

// Initialize theme toggle
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;
  if (!themeBtn.dataset.bound) {
    themeBtn.addEventListener('click', function() {
      const isDark = document.body.classList.contains('theme-dark');
      document.body.className = isDark ? 'theme-light' : 'theme-dark';
      localStorage.setItem('theme', document.body.className);
      themeBtn.textContent = isDark ? '\u25D1' : '\u25D0';
    });
    themeBtn.dataset.bound = 'true';
  }
  themeBtn.textContent = document.body.classList.contains('theme-dark') ? '\u25D0' : '\u25D1';
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
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(link => link.classList.remove('active'));
  if (!resolvedNavId) return;
  navLinks.forEach(link => {
    if (link.id === resolvedNavId || (resolvedNavId === 'nav-home' && link.getAttribute('href') === '/')) {
      link.classList.add('active');
    }
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
    ? fetch('/header.html').then(r => r.text())
    : Promise.resolve(null);
  const footerPromise = footerEl && !footerLoaded
    ? fetch('/footer.html').then(r => r.text())
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
  contentEl.classList.add('is-loading');

  fetch(targetUrl.pathname + targetUrl.search)
    .then(response => {
      if (!response.ok) throw new Error('Navigation failed');
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

      document.title = doc.title || document.title;
      contentEl.innerHTML = newContent.innerHTML;

      if (nextPage) {
        document.body.dataset.page = nextPage;
        contentEl.dataset.page = nextPage;
      } else {
        delete document.body.dataset.page;
        delete contentEl.dataset.page;
      }

      document.body.style.overflow = 'auto';

      return loadHeaderFooter(nextNavId, nextPage).then(() => {
        runPageInit(nextPage);
        handleLanguageChange();
      }).then(() => {
        if (options.push !== false) {
          history.pushState({}, '', targetUrl.pathname + targetUrl.search + targetUrl.hash);
        }
        if (targetUrl.hash) {
          const target = document.querySelector(targetUrl.hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        requestAnimationFrame(() => {
          contentEl.classList.remove('is-loading');
        });
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
    renderPaintings();
  } else if (page === 'changelog') {
    refreshCommitDates();
    refreshChangelogText();
  } else if (page === 'index') {
    syncMonthlyAlt();
  }

  renderHolidayMonitor();
}

function syncMonthlyAlt() {
  const caption = document.getElementById('monthly-caption');
  const image = document.getElementById('monthly-image');
  if (caption && image) {
    image.alt = caption.textContent || image.alt;
  }
}

function initIndexPage() {
  syncMonthlyAlt();
  initLightboxBindings();
}

function initAboutPage() {
  return;
}

function initNewsPage() {
  const firstSection = document.getElementById('section-society');
  if (firstSection) {
    firstSection.style.display = 'block';
    const icon = firstSection.previousElementSibling
      ? firstSection.previousElementSibling.querySelector('.toggle-icon')
      : null;
    if (icon) icon.textContent = '▲';
  }
}

function initGalleryPage() {
  renderGallery();
  renderPaintings();
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
      const monthName = (typeof langSystem !== 'undefined') ? langSystem.getMonthName(item.month) : item.month;
      const filePath = `/images/mês/${item.file}`;

      html += `
        <div class="gallery-item">
          <div class="gallery-item-container">
            <img src="${filePath}" alt="${monthName} ${item.year}" class="gallery-media" loading="lazy" onclick="openLightbox('${filePath}', '${monthName} ${item.year}')">
          </div>
          <div class="gallery-item-caption">${monthName} ${item.year}</div>
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

function renderPaintings() {
  const container = document.getElementById('paintings-container');
  if (!container) return;

  if (paintings.length === 0) {
    const emptyText = (window.langSystem ? langSystem.t('gallery', 'paintings-empty') : '') || 'No paintings yet.';
    container.innerHTML = `<p style="color: var(--muted);">${emptyText}</p>`;
    return;
  }

  let html = '<div class="paintings-grid">';
  paintings.forEach(painting => {
    const filePath = `/images/paintings/${painting.file}`;
    const caption = `${painting.title || ''}${painting.artist ? ' - ' + painting.artist : ''}${painting.credit ? ' - ' + painting.credit : ''}`;
    html += `
      <div class="gallery-item">
        <div class="gallery-item-container">
          <img src="${filePath}" alt="${painting.title || ''}" class="gallery-media" loading="lazy" onclick="openLightbox('${filePath}', '${caption.replace(/'/g, "\\'")}')">
        </div>
        <div class="gallery-item-caption">
          ${painting.title ? `<strong>${painting.title}</strong>` : ''}
          ${painting.artist ? `<br>${painting.artist}` : ''}
          ${painting.credit ? `<br><em style="font-size: 0.85em; opacity: 0.7;">${painting.credit}</em>` : ''}
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function getStoredLang() {
  const storedLang = localStorage.getItem('lang');
  return storedLang === 'pt' || storedLang === 'en' ? storedLang : 'en';
}

function getChangelogText(key, fallback) {
  if (window.langSystem) {
    return langSystem.t('changelog', key) || fallback;
  }
  return fallback;
}

function formatDate(date, lang) {
  const locale = lang === 'pt' ? 'pt-PT' : 'en-US';
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

function renderCommit(commit) {
  const currentLang = window.langSystem ? langSystem.getCurrentLang() : getStoredLang();
  const commitDate = new Date(commit.commit.author.date);
  const formattedDate = formatDate(commitDate, currentLang);
  const shortHash = commit.sha.substring(0, 7);
  const commitUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/commit/${commit.sha}`;
  const avatarUrl = changelogState.userData && changelogState.userData.avatar_url
    ? changelogState.userData.avatar_url
    : `https://github.com/${GITHUB_USERNAME}.png`;
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
          <a href="${commitUrl}" target="_blank"><span class="commit-hash">${shortHash}</span></a>
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
    const remainingText = currentLang === 'pt' ? 'restantes' : 'remaining';
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
  document.body.style.overflow = 'auto';
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

// Export for use
window.siteUtils = {
  loadHeaderFooter,
  setActiveNav,
  initPage,
  navigate,
  handleLanguageChange,
  getCurrentLang: () => {
    if (window.langSystem) return window.langSystem.getCurrentLang();
    const storedLang = localStorage.getItem('lang');
    return storedLang === 'pt' || storedLang === 'en' ? storedLang : 'en';
  }
};

