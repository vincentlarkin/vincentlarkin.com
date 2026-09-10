// Shared preferences for Carbon, Retro, and Life of a VIN.
(function () {
  'use strict';
  function read(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Preferences still work for this visit. */ }
  }
  const themes = ['theme-light', 'theme-retro', 'theme-vin'];
  let theme = read('theme', 'theme-light');
  if (!themes.includes(theme)) theme = 'theme-light';
  let mode = read('vl-carbon-theme', 'white') === 'g100' ? 'g100' : 'white';
  let language = read('lang', 'en');
  if (!['en', 'pt', 'ja'].includes(language)) language = 'en';
  const startup = document.currentScript?.dataset || {};
  function stylesheet(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve(link);
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
  let legacyStyles;
  function loadLegacyStyles() {
    return legacyStyles ||= Promise.all(['styles', 'theme-retro', 'theme-vin', 'theme-editorial'].map(name => stylesheet(`/css/${name}.css?v=20260910-emblem`)));
  }
  // Start both downloads in the head, without waiting for the document,
  // legacy scripts, a manifest round trip, or the stylesheet to finish first.
  let carbonAssets;
  if (startup.carbonJs && theme === 'theme-light') {
    carbonAssets = Promise.all([
      Promise.all(startup.carbonCss.split(',').map(stylesheet)),
      import(startup.carbonJs)
    ]);
    carbonAssets.catch(() => {}); // boot.js owns recovery after DOM parsing.
    if (startup.carbonFont) {
      const font = document.createElement('link');
      font.rel = 'preload'; font.as = 'font'; font.type = 'font/woff2';
      font.crossOrigin = 'anonymous'; font.href = startup.carbonFont;
      document.head.appendChild(font);
    }
  } else if (startup.carbonJs) {
    loadLegacyStyles().catch(() => {});
  }
  function analyticsTheme() {
    return theme === 'theme-light' ? (mode === 'g100' ? 'carbon-dark' : 'carbon-light') : theme.replace('theme-', '');
  }
  function sync() {
    document.documentElement.dataset.siteTheme = analyticsTheme();
    document.documentElement.lang = language;
  }
  window.sitePreferences = {
    get theme() { return theme; },
    get mode() { return mode; },
    get language() { return language; },
    analyticsTheme,
    loadLegacyStyles,
    selectTheme(nextTheme, nextMode = mode) {
      if (!themes.includes(nextTheme)) return;
      const previousTheme = analyticsTheme();
      const changeRenderer = (theme === 'theme-light') !== (nextTheme === 'theme-light');
      theme = nextTheme;
      mode = nextMode === 'g100' ? 'g100' : 'white';
      write('theme', theme);
      write('vl-carbon-theme', mode);
      sync();
      if (previousTheme !== analyticsTheme()) {
        window.dispatchEvent(new CustomEvent('site:theme-change', {
          detail: { previous_theme: previousTheme, theme_name: analyticsTheme() }
        }));
      }
      if (changeRenderer) window.setTimeout(() => window.location.reload(), 150);
    },
    selectLanguage(next) {
      if (!['en', 'pt', 'ja'].includes(next) || next === language) return;
      const previous = language;
      language = next;
      write('lang', language);
      sync();
      window.dispatchEvent(new CustomEvent('site:language-change', {
        detail: { previous_language: previous, language_code: language }
      }));
    },
    async mountCarbon() {
      const originalMain = document.querySelector('main');
      window.carbonPage = { content: originalMain?.innerHTML || '', title: document.title };
      if (!carbonAssets) {
        const response = await fetch('/assets/carbon/manifest.json', { cache: 'no-cache' });
        if (!response.ok) throw new Error('Carbon asset manifest unavailable');
        const manifest = await response.json();
        const entry = manifest['src/main.jsx'];
        carbonAssets = Promise.all([
          Promise.all((entry.css || []).map(href => stylesheet('/assets/carbon/' + href))),
          import('/assets/carbon/' + entry.file)
        ]);
      }
      const [, module] = await carbonAssets;
      if (typeof module.mount !== 'function') throw new Error('Carbon entry is invalid');
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (new URL(link.href).pathname.startsWith('/css/')) link.disabled = true;
      });
      document.body.className = 'theme-light';
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
      module.mount(root);
      Array.from(document.body.children).forEach(element => { if (element !== root) element.hidden = true; });
      document.getElementById('carbon-startup-style')?.remove();
    }
  };
  sync();
})();
