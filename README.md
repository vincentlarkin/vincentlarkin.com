# vincentlarkin.com

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/22wyu.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v3/monitor/22wyu.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

Static site for [vincentlarkin.com](https://vincentlarkin.com). Plain HTML/CSS/JS, deployed via GitHub Pages workflow in `.github/workflows/deploy.yml`.

## Project layout

### Top-level pages
| File | Purpose |
| --- | --- |
| `index.html` | Home. Renders both the legacy "classic" layout (used by `theme-dark` and `theme-retro`) and the rich `vin-home-main` layout (used by `theme-vin`). The legacy block is hidden in the VIN theme via CSS, the VIN block is hidden in the others. |
| `about.html` | Single contact card. |
| `news.html` | Curated articles (links into `articles/`) plus a bookshelf placeholder. |
| `gallery.html` | Monthly Gallery grouped by year (data lives in `js/site.js`) plus a paintings section that just links out to `archive.vincentlarkin.com`. |
| `changelog.html` | Live GitHub commit feed for this repo. |
| `header.html` / `footer.html` | Shared partials, fetched at runtime by `js/site.js`. Cache-busted with `?v=...` (see `PARTIAL_VERSION`). |

### Static assets
| Path | Purpose |
| --- | --- |
| `css/styles.css` | Global layout, base typography, header/nav/footer skeleton, lightbox, holiday monitor, custom dropdown styles. |
| `css/theme-vin.css` | "Life of a VIN" theme (default). Gothic luxury look with the dark background and ornate cards. |
| `css/theme-dark.css` | Minimal dark theme overrides on top of the global default. |
| `css/theme-retro.css` | Retro IBM / NCSA Mosaic theme + fake browser chrome (chrome is injected by `js/site.js`). |
| `js/site.js` | App glue: SPA-style navigation, theme/language wiring, holiday monitor, monthly image renderer, GitHub commit fetcher, lightbox. |
| `js/i18n.js` | Translation system (English / Português / 日本語). All strings are embedded in `embeddedTranslations`; no JSON fetch. To add a new string, add a key with `{ en, pt, ja }` values. To add a new language, append it to `supportedLangs`, give every translation key a value for that lang, add an entry to `LANG_LABELS`/`LANG_FLAGS`/`LANG_LOCALES` in `js/site.js`, and add an `<li class="cs-option">` to the lang dropdown in `header.html`. |
| `images/site-emblem.png` | Brand mark used in the header. |
| `images/favicons/` | Favicon set + `site.webmanifest`. |
| `images/flags/` | `us.png`, `pt.svg` for the language switcher. |
| `images/themes/life-of-a-vin/background.png` | Background art for `theme-vin`. |
| `images/mês/` | Monthly featured photos. Folder name is Portuguese for "month" (note the `ê`). Filenames are referenced from `monthlyImages` in `js/site.js`. |
| `images/articles/` | Images embedded in `articles/*.html`. |
| `articles/` | Long-form article HTML. Each one is self-contained and uses the same shared header/footer/CSS. |
| `robots.txt`, `sitemap.xml` | SEO. |
| `.github/workflows/deploy.yml` | GitHub Actions deploy pipeline. |

## Default theme
`theme-vin` ("Life of a VIN") is the default and is set in three places:
1. Each HTML file: `<body class="theme-vin">`.
2. The inline boot script in `index.html` falls back to `theme-vin`.
3. `getStoredTheme()` in `js/site.js` returns `theme-vin` if nothing valid is in `localStorage`.

## Cache-busting
Shared partials and JS bundles are loaded with `?v=PARTIAL_VERSION` (see top of `js/site.js`). Bump that string when you change `header.html`, `footer.html`, `js/site.js`, or `js/i18n.js` so visitors don't get the stale cached copy.

## Adding a new monthly image
1. Drop the file into `images/mês/`.
2. Add an entry at the top of the appropriate year array in `monthlyImages` inside `js/site.js`.
