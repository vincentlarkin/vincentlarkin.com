# Vincent Larkin — Carbon edition

Source for the default vincentlarkin.com theme, replacing Olympus. The directory retains its original mockup name; the production app is served from the existing website URLs.

## Build and run the site

```sh
npm ci
npm run build:site
npm run serve:site
```

Open http://127.0.0.1:4173. The server listens only on this computer. Commit the generated `../assets/carbon/` together with source changes. the server serves the prebuilt files and does not need Node. The deployment excludes this development directory.

`npm run dev` remains an isolated design sandbox with hash navigation. Use `serve:site` for production checks, theme switching, real article pages, and Analytics verification. Stop one server before starting the other; both use port 4173.

## Production integration

- `../js/preferences.js` shares theme and language preferences across Carbon, Retro, and Life of a VIN. Existing `theme-light` preferences now select Carbon.
- `../js/site.js` mounts Carbon for the default preference; legacy themes retain their existing functionality and isolated styles.
- Existing HTML content and metadata remain available for search engines and script-free reading. Article bodies and the privacy policy render inside the Carbon shell without duplicating editorial source content.
- Navigation uses the existing document URLs. Browser Back, direct links, canonical metadata, and article URLs continue to work.
- The live GitHub feed shows recent commits, with a clearly labeled saved fallback if GitHub is unavailable.
- The header preserves the selected blue-and-white pelican with the US/PT shield. Louisiana911 uses its original Olympus artwork. The archive uses a generated, understated gold crest.
- The header is 56px high. The portrait is 160px on desktop and 128px on mobile. Copy remains factual and short.
- Carbon light/dark, Retro, and Life of a VIN are available through the footer Theme setting. The header moon/sun switches Carbon light/dark. Footer language settings preserve English, Portuguese, and Japanese interface choices. Original articles retain their source language.
- The existing GA4 stream is retained. See [ANALYTICS.md](ANALYTICS.md) for events, local exclusions, verification, and property reporting setup.

## Carbon implementation

The design uses actual Carbon React components, IBM Plex fonts, semantic light/dark tokens, spacing and motion tokens, a responsive 16-column layout, and Carbon keyboard interactions. Components include Header, SideNav, Button, ClickableTile, Theme, Tag, Breadcrumb, Tabs, Accordion, Modal, Search, and Select. Fonts and images are self-hosted. Third-party licenses are included in the built assets.

See [DESIGN-NOTES.md](DESIGN-NOTES.md) for the official documentation reviewed, [EMBLEM.md](EMBLEM.md) for the header asset, and [ARCHIVE-IMAGE.md](ARCHIVE-IMAGE.md) for the archive image and generation prompt.

## Verification

With the local site server running:

```sh
npm run test:site
```

This uses installed Chrome through Playwright. It checks desktop and narrow layouts, accessible page structure, automated WCAG A/AA rules, original project assets, the GitHub feed, light/dark persistence, all legacy theme transitions, language changes, the photo viewer, and real Google tag request payloads. Collection requests are intercepted, so test traffic never reaches Analytics. Screenshots and reports are saved under ignored `qa/`.

The earlier `qa.mjs`, `qa-interactions.mjs`, and `qa-refinements.mjs` document design-sandbox checks. Production checks use `qa-production.mjs`.

## Editing

- `src/main.jsx`: pages and interactions.
- `src/styles.scss`: Carbon imports and responsive styling.
- `src/data.js`: photographs, article index, and saved GitHub fallback. Update the legacy monthly image list as described in the root README when adding a photograph.
- `src/translations.js`: Carbon interface translations; article text is preserved.
- `../images/`: shared production and sandbox image source.
- `vite.production.config.js`: reproducible static build and third-party notices.

After an edit, run `npm run build:site`, check the local site, and commit the generated assets with the source.
