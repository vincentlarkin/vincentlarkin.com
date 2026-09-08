// Carbon starts directly; the older renderers are fetched only when selected.
(async function () {
  const preferences = window.sitePreferences;
  if (preferences?.theme === 'theme-light') {
    try {
      await preferences.mountCarbon();
      return;
    } catch (error) {
      console.error('Carbon could not load; showing the readable fallback.', error);
      window.carbonFailed = true;
      document.getElementById('carbon-startup-style')?.remove();
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (new URL(link.href).pathname.startsWith('/assets/carbon/')) link.remove();
      });
    }
  }
  try {
    await preferences?.loadLegacyStyles();
    for (const name of ['i18n', 'site']) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `/js/${name}.js?v=20260904`;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }
    const page = document.body.dataset.page || null;
    const nav = { index: 'nav-home', about: 'nav-about', gallery: 'nav-gallery', news: 'nav-news', changelog: 'nav-changelog' };
    await window.siteUtils.initPage(page, nav[page] || null);
  } catch (error) {
    console.error('Showing the static page because interactive features could not load.', error);
    document.getElementById('carbon-startup-style')?.remove();
    document.getElementById('page-content')?.classList.remove('is-loading');
  }
})();
