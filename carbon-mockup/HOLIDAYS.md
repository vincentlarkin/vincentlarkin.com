# Carbon holiday strip

The 32px strip appears directly beneath the fixed 56px header only on a holiday. It uses the visitor's local calendar date, matching the previous site's behavior, and refreshes at midnight and when a background tab becomes visible. Main content and mobile navigation move down by the strip's height. Coinciding holidays are preserved; matching holidays share their country flags. Long combinations can be scrolled horizontally without widening the page.

The U.S. strip uses red/white/blue accents, Portugal green/red, Japan white/red, and Louisiana blue/white. `images/flags/la.svg` is a simplified pelican flag glyph drawn for this interface. It is not an official flag reproduction. Decorative rectangular particles run for less than five seconds on arrival and are disabled for reduced-motion preferences.

## Calendar sources

Reviewed September 7, 2026:

- [U.S. Office of Personnel Management](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/): all eleven nationwide federal holidays. Fixed dates appear on both the actual date and the Friday/Monday federal observance when different; the latter is explicitly marked observed. The Washington-area-only Inauguration Day is excluded.
- [Portugal's Labour Code, Article 234](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475-46746675): all thirteen mandatory national holidays. Good Friday, Easter, and Corpus Christi are calculated annually. Optional Carnival and municipal holidays are excluded; weekends do not create an assumed Monday substitute.
- [Japan Cabinet Office](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html): all sixteen national holidays plus substitute and intervening citizens' holidays. The published 2026 and 2027 calendars are covered in full and checked date-for-date in tests. Equinox dates are authoritative year-specific entries, not predictions. **Add the 2028 equinox dates to `src/holidays.js` after the Cabinet Office publishes them in February 2027**, then extend the calendar fixture. Recurring statutory dates keep working beyond 2027, but future equinox dates must be updated to preserve complete coverage.
- [Louisiana Revised Statutes 1:55](https://legis.la.gov/Legis/Law.aspx?d=74097): Louisiana-specific legal dates include the Battle of New Orleans, Mardi Gras, Good Friday, Huey P. Long Day, All Saints' Day, and even-year Election Day. Federal dates use the U.S. flag rather than duplicate messages. The banner identifies holidays, not a guarantee that every office or business closes. Acadian Day depends on a gubernatorial proclamation and is not automatically asserted before one is verified; parish-specific closures are excluded.

No visitor-side holiday API, location permission, or third-party flag host is used. The existing Retro and Life of a VIN holiday monitor is retained; this expanded calendar powers Carbon.

## Verification

Run `node --test holidays.test.mjs` for independent official date fixtures and `node qa-holidays.mjs` against the local site for the header menu, country variants, overlapping holidays, narrow screens, midnight rollover, accessibility, and reduced motion. Screenshots and reports are under ignored `qa/`.
