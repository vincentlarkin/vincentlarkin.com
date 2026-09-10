# First-load performance

Measured September 8, 2026. Three fresh browser contexts per build, cache disabled, installed Chrome, 1440 × 950 viewport, 4× CPU slowdown, 80 ms network latency, 500,000 bytes/second download throughput. The local static server serves uncompressed files in both runs; these are comparative lab measurements, not claims about every visitor's connection or the production server.

| Measurement (median) | Before | After |
| --- | ---: | ---: |
| First contentful paint | 6,236 ms | 1,304 ms |
| Mounted Carbon interface | 6,188 ms | 3,429 ms |
| Carbon CSS, uncompressed | 898,524 bytes | 350,757 bytes |
| Header emblem | 570,365 bytes | 7,846 bytes |
| Archive card artwork | 1,208,708 bytes | 11,292 bytes |
| Portrait | 194,792 bytes | 14,266 bytes |

These are the final build's latest three-run medians. Earlier optimized runs measured 420 ms for first paint and 2,457 ms for the interface; host-load variation makes the byte reductions more repeatable than wall-clock timings. The first paint now displays the actual linked site identity on the dark header. The complete interface appears after its styles and script are ready. Saved dark mode is applied before the body paints. There is no loading spinner or artificial entrance delay.

## Loading path

- `build-startup.mjs` reads the generated manifest and writes current hashed CSS/JS URLs into each site's preference script tag. Normal first loads no longer fetch the manifest.
- Preferences starts CSS and the JavaScript module concurrently in the document head and preloads the regular Plex font.
- `boot.js` mounts Carbon without downloading the old themes' JavaScript or styles. Old styles remain in `noscript` for script-free reading, and load on demand for Retro/VIN or recovery.
- Hidden legacy images use lazy loading so the HTML preload scanner does not download a second set of page artwork while Carbon starts.
- Styles import only the Carbon components in use. When adding a component, include its Sass module and verify its keyboard, responsive, and theme states.
- Display assets use compact derivatives. The September 10 replacement Carbon emblem is a 120 px-high lossless WebP (11,786 bytes); the table above records the earlier September 8 emblem. Archive artwork is a 960 px WebP at quality 85, and the portrait is a 400 px WebP at quality 88. Current PNG/JPEG masters remain available.
- The static header remains until the React mount commits; failed module or stylesheet requests restore the readable legacy page.

Run `node qa-first-load.mjs` with the local server active, without other browser tests competing for resources. It saves timings and request waterfalls under `qa/first-load-after.json`. Set `REPORT` to another label to retain a comparison. `qa-startup.mjs` checks early light/dark painting, unused request exclusions, failed assets, and disabled JavaScript. The normal production and menu tests cover the slimmer stylesheet's layout, accessibility, theme/language switching, photo viewer, and Analytics.

Every `npm run build:site` updates both hashed assets and their HTML references. Commit both together. No server configuration changes are required.
