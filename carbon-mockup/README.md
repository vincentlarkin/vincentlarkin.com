# Vincent Larkin — Carbon edition

Source for the default vincentlarkin.com theme, replacing Olympus. The directory retains its original mockup name; the production app is served from the existing website URLs.

## Build and run the site

```sh
npm ci
npm run build:site
npm run serve:site
```

Open http://127.0.0.1:4173. The server listens only on this computer. Commit the generated `../assets/carbon/` and updated root/article HTML together with source changes: the build writes matching early asset URLs into each page. TrueNAS serves the prebuilt files and does not need Node. The deployment excludes this development directory.

`npm run dev` remains an isolated design sandbox with hash navigation. Use `serve:site` for production checks, theme switching, real article pages, and Analytics verification. Stop one server before starting the other; both use port 4173.

## Production integration

- `../js/preferences.js` shares theme and language preferences across Carbon, Retro, and Life of a VIN. Existing `theme-light` preferences now select Carbon.
- `../js/preferences.js` starts the active theme's downloads in the head. `../js/boot.js` mounts Carbon directly; only legacy themes load `site.js`, `i18n.js`, and the legacy stylesheets. A readable fallback remains if Carbon fails to load.
- Only the Carbon component styles used by this site are included. Small WebP display copies preserve the emblem, archive artwork, and portrait, with their original source files retained. See [PERFORMANCE.md](PERFORMANCE.md) for startup measurements and maintenance.
- Existing HTML content and metadata remain available for search engines and script-free reading. Article bodies and the privacy policy render inside the Carbon shell without duplicating editorial source content.
- Header tabs and links between Home, About, Gallery, News / Books, and Changelog switch in place using the existing document URLs. A brief Carbon crossfade keeps the header and holiday strip steady; reduced-motion users get an immediate update. Browser Back/Forward restores scroll position, and titles, canonical URLs, focus, and Analytics follow the current page. Article and privacy links retain normal document navigation.
- The live GitHub feed shows recent commits, with a clearly labeled saved fallback if GitHub is unavailable.
- The header preserves the selected blue-and-white pelican with the US/PT shield. Louisiana911 uses its original Olympus artwork. The archive uses a generated, understated gold crest.
- The header is 56px high. The portrait is 160px on desktop, 128px on tablets, and 96px on phones. The About skills use Carbon's flat ContainedList instead of pills. Copy remains factual and short.
- Carbon, Retro, and Life of a VIN are available through the labeled Theme menu at the top. The separate moon/sun button switches Carbon light/dark on desktop and mobile; selecting Carbon preserves the saved mode. The adjacent EN/PT/JA menu offers English, Português, and 日本語 with full native names and descriptive screen-reader labels. Original articles retain their source language. On small phones, Search is available in the navigation menu to leave room for both preferences.
- Header dropdowns use a consistent dark surface, visible selected checks, keyboard focus, and one open menu at a time. Their position accounts for the holiday strip, keeping every option visible and clickable.
- A thin country-colored holiday strip restores the holiday display beneath the header. It covers U.S., Portuguese, Japanese, and Louisiana holidays, with a small Louisiana flag glyph and brief particles. See [HOLIDAYS.md](HOLIDAYS.md) for official calendar sources, observance rules, and annual updates.
- The existing GA4 stream is retained. See [ANALYTICS.md](ANALYTICS.md) for events, local exclusions, verification, and property reporting setup.

## Carbon implementation

The design uses actual Carbon React components, IBM Plex fonts, semantic light/dark tokens, spacing and motion tokens, a responsive 16/8/4-column layout, and Carbon keyboard interactions. Components include Header, SideNav, Button, ClickableTile, Theme, Tag, ContainedList, OverflowMenu, Breadcrumb, Tabs, Accordion, Modal, and Search. Fonts and images are self-hosted. Third-party licenses are included in the built assets.

See [DESIGN-NOTES.md](DESIGN-NOTES.md) for the official documentation reviewed, [EMBLEM.md](EMBLEM.md) for the header asset, and [ARCHIVE-IMAGE.md](ARCHIVE-IMAGE.md) for the archive image and generation prompt.

## Verification

With the local site server running:

```sh
npm run test:site
node qa-navigation.mjs
node qa-startup.mjs
node qa-carbon-refinement.mjs
node qa-first-load.mjs
```

This uses installed Chrome through Playwright. It checks desktop and narrow layouts, accessible page structure, automated WCAG A/AA rules, original project assets, the GitHub feed, light/dark persistence, all legacy theme transitions, language changes, the photo viewer, and real Google tag request payloads. Collection requests are intercepted, so test traffic never reaches Analytics. Screenshots and reports are saved under ignored `qa/`.

For the production, startup, and navigation suites on a machine with Edge instead of Chrome, set `QA_BROWSER_CHANNEL=msedge` (PowerShell: `$env:QA_BROWSER_CHANNEL='msedge'`). These tests use isolated browser contexts, not the signed-in browser profile.

The earlier `qa.mjs`, `qa-interactions.mjs`, and `qa-refinements.mjs` document design-sandbox checks. Production checks use `qa-production.mjs`.

`qa-navigation.mjs` checks desktop/mobile navigation without reloads, native and fallback transitions, reduced motion, repeated clicks, Back/Forward, scroll restoration, focus, direct links, and article return navigation. The production test verifies one real Google page-view payload per tab change, intercepted locally.

## Editing

- `src/main.jsx`: pages and interactions.
- `src/styles.scss`: Carbon imports and responsive styling.
- `src/data.js`: photographs, article index, and saved GitHub fallback. Update the legacy monthly image list as described in the root README when adding a photograph.
- `src/translations.js`: Carbon interface translations; article text is preserved.
- `../images/`: shared production and sandbox image source.
- `vite.production.config.js`: reproducible static build and third-party notices.

After an edit, run `npm run build:site`, check the local site, and commit the generated assets with the source.
