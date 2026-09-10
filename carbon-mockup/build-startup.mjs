import fs from 'node:fs';

// Keep each static page's early asset hints in sync with the hashed build.
export function writeStartup() {
  const manifest = JSON.parse(fs.readFileSync('../assets/carbon/manifest.json', 'utf8'));
  const entry = manifest['src/main.jsx'];
  const font = Object.values(manifest).find(item => item.file?.endsWith('.woff2') && item.file.includes('sans-latin-400'));
  const critical = fs.readFileSync('src/startup.css', 'utf8').replace(/\s+/g, ' ').trim();
  const tag = `<style id="carbon-startup-style">${critical}</style>\n  <script src="/js/preferences.js?v=20260910-emblem" data-carbon-js="/assets/carbon/${entry.file}" data-carbon-css="${entry.css.map(file => '/assets/carbon/' + file).join(',')}"${font ? ` data-carbon-font="/assets/carbon/${font.file}"` : ''}></script>`;
  const files = [...fs.readdirSync('..').filter(file => file.endsWith('.html')).map(file => '../' + file), ...fs.readdirSync('../articles').filter(file => file.endsWith('.html')).map(file => '../articles/' + file)];
  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('/js/site.js?') && !html.includes('/js/boot.js?')) continue;
    html = html.replace(/\s*<style id="carbon-startup-style">[\s\S]*?<\/style>/, '');
    html = html.replace(/<script src="\/js\/preferences.js[^>]*><\/script>/, tag);
    // Legacy styles remain available with scripting disabled. Preferences
    // loads them only for legacy themes or if Carbon fails to start.
    if (!html.includes('id="legacy-styles"')) {
      html = html.replace(/((?:  <link rel="stylesheet" href="\/css\/[^\n]+\r?\n)+)/, '  <noscript id="legacy-styles">\n$1  </noscript>\n');
    }
    html = html.replace(/<script src="\/js\/analytics.js[^>]*><\/script>/, '<script defer src="/js/analytics.js?v=20260904"></script>');
    html = html.replace(/<script src="\/js\/i18n.js[^>]*><\/script>\s*<script src="\/js\/site.js[^>]*><\/script>/, '<script defer src="/js/boot.js?v=20260910-emblem"></script>');
    html = html.replace(/<script\b[^>]*src="\/js\/boot\.js[^>]*><\/script>/, '<script defer src="/js/boot.js?v=20260910-emblem"></script>');
    html = html.replace(/<div id="site-header">[\s\S]*?<\/div>/, '<div id="site-header"><a class="startup-brand" href="/"><img src="/images/site-emblem-carbon-small.webp" width="36" height="40" alt="">vincentlarkin.com</a></div>');
    // Hidden legacy markup must not compete with the active theme for image
    // bandwidth. Its images load normally when that renderer is visible.
    html = html.replace(/<img\b[^>]*>/g, image => image.includes('site-emblem-carbon-small.webp') || /\bloading\s*=/.test(image) ? image : image.replace('<img', '<img loading="lazy"'));
    fs.writeFileSync(file, html);
  }
}
