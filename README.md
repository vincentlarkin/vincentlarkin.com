# vincentlarkin.com

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/22wyu.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v3/monitor/22wyu.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

Static site for [vincentlarkin.com](https://vincentlarkin.com). Plain HTML/CSS/JS, deployed via GitHub Pages workflow in `.github/workflows/deploy.yml`.

## Project layout

### Top-level pages
| File | Purpose |
| --- | --- |
| `index.html` | Home. Contains three isolated presentations: the Olympus-inspired Editorial Light layout, the retro Mosaic layout, and the original Life of a VIN layout. Only the selected theme's block is displayed. |
| `about.html` | Single contact card. |
| `news.html` | Curated articles (links into `articles/`) plus a bookshelf placeholder. |
| `gallery.html` | Monthly Gallery grouped by year (data lives in `js/site.js`) plus a paintings section that just links out to `archive.vincentlarkin.com`. |
| `changelog.html` | Live GitHub commit feed for this repo. |
| `header.html` / `footer.html` | Shared partials, fetched at runtime by `js/site.js`. Cache-busted with `?v=...` (see `PARTIAL_VERSION`). |

### Static assets
| Path | Purpose |
| --- | --- |
| `css/styles.css` | Global layout, base typography, header/nav/footer skeleton, lightbox, holiday monitor, custom dropdown styles. |
| `css/theme-editorial.css` | Default Editorial Light theme. Olympus-inspired typography, measured layout rails, topic cards, and full-width navigation flyouts. |
| `css/theme-vin.css` | Original "Life of a VIN" theme. Gothic luxury look with the dark background and ornate cards. |
| `css/theme-retro.css` | Retro IBM / NCSA Mosaic theme + fake browser chrome (chrome is injected by `js/site.js`). |
| `js/site.js` | App glue: SPA-style navigation, theme/language wiring, holiday monitor, monthly image renderer, GitHub commit fetcher, lightbox. |
| `js/i18n.js` | Translation system (English / Português / 日本語). All strings are embedded in `embeddedTranslations`; no JSON fetch. To add a new string, add a key with `{ en, pt, ja }` values. To add a new language, append it to `supportedLangs`, give every translation key a value for that lang, add an entry to `LANG_LABELS`/`LANG_FLAGS`/`LANG_LOCALES` in `js/site.js`, and add an `<li class="cs-option">` to the lang dropdown in `header.html`. |
| `images/site-emblem.png` | Brand mark used in the header. |
| `images/favicons/` | Favicon set + `site.webmanifest`. |
| `images/flags/` | `us.png`, `pt.svg` for the language switcher. |
| `images/themes/life-of-a-vin/background.webp` | Background art for `theme-vin`. |
| `fonts/` | Self-hosted Noto Sans Latin/Latin Extended webfonts used by Editorial Light, with the SIL Open Font License. |
| `images/profile.jpg` | Portrait shown on the About page bio block. Replace freely; if missing, the bio falls back to a "VL" monogram via the `onerror` handler. |
| `images/mês/` | Monthly featured photos (originals). Folder name is Portuguese for "month" (note the `ê`). Filenames are referenced from `monthlyImages` in `js/site.js`. |
| `images/mês/thumbs/` | ~480px-wide WebP thumbnails used by the gallery grid. Pre-generated; see [Adding a new monthly image](#adding-a-new-monthly-image). |
| `images/mês/thumbs-md/` | ~1024px-wide WebP thumbnails used by the home page "Image of the Month" card. |
| `images/articles/` | Images embedded in `articles/*.html`. |
| `articles/` | Long-form article HTML. Each one is self-contained and uses the same shared header/footer/CSS. |
| `robots.txt`, `sitemap.xml` | SEO. |
| `.github/workflows/deploy.yml` | GitHub Actions deploy pipeline. |

## Default theme
`theme-light` ("Editorial Light") is the default and is set in three places:
1. Each HTML file starts with `theme-light` on its `<body>` where applicable.
2. The inline boot script in `index.html` falls back to `theme-light`.
3. `getStoredTheme()` in `js/site.js` returns `theme-light` if nothing valid is in `localStorage`.

Life of a VIN remains an isolated opt-in theme. Its stylesheet and homepage block should not be changed as part of Editorial Light work.

## Cache-busting
Shared partials and JS bundles are loaded with `?v=PARTIAL_VERSION` (see top of `js/site.js`). Bump that string when you change `header.html`, `footer.html`, `js/site.js`, or `js/i18n.js` so visitors don't get the stale cached copy.

## Adding a new monthly image
The gallery and the home-page "Image of the Month" never load the original
file in the page — they load thumbnails out of `thumbs/` and `thumbs-md/` and
only fetch the original when the lightbox opens. So when you add a new
monthly image you also need to generate the two thumbnail variants.

1. Drop the original into `images/mês/` (any of `.jpg` / `.png` / `.webp` works,
   but WebP is preferred to keep the lightbox payload small).
2. Generate the small + medium WebP thumbnails (requires
   [`ffmpeg`](https://ffmpeg.org) on your `PATH`):

    ```powershell
    cd "images/mês"
    $base = "april-2026"          # filename without extension
    $ext  = "webp"                # extension of the original
    ffmpeg -y -i "$base.$ext" -vf "scale='min(480,iw)':-1"  -compression_level 6 -q:v 76 "thumbs/$base.webp"
    ffmpeg -y -i "$base.$ext" -vf "scale='min(1024,iw)':-1" -compression_level 6 -q:v 82 "thumbs-md/$base.webp"
    ```

    Or, to (re)build thumbnails for *every* file in `images/mês/` at once:

    ```powershell
    Get-ChildItem images/mês -File | Where-Object { $_.Extension -in '.jpg','.jpeg','.png','.webp' } | ForEach-Object {
        $b = [IO.Path]::GetFileNameWithoutExtension($_.Name)
        ffmpeg -y -loglevel error -i $_.FullName -vf "scale='min(480,iw)':-1"  -compression_level 6 -q:v 76 "images/mês/thumbs/$b.webp"
        ffmpeg -y -loglevel error -i $_.FullName -vf "scale='min(1024,iw)':-1" -compression_level 6 -q:v 82 "images/mês/thumbs-md/$b.webp"
    }
    ```

    Targets: small ≈ 10–120 KB each, medium ≈ 70–650 KB each.
3. Add an entry at the top of the appropriate year array in `monthlyImages`
   inside `js/site.js`. Use the original filename — `getMonthlyImagePaths()`
   derives the thumb paths from it automatically.
4. If the new image is the latest one, update the hard-coded `<img src>` and
   `data-full-src` on `#monthly-image` and `#vin-monthly-image` in
   `index.html` so the page renders the right image before JS runs.
5. Bump `PARTIAL_VERSION` in `js/site.js` (and `?v=` references in HTML) so
   visitors pick up the new data without a hard refresh.
