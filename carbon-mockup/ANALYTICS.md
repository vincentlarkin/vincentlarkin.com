# Site measurement

The existing GA4 web stream remains `G-9D6Q6F0NB5`. `js/analytics.js` loads Google's tag on `vincentlarkin.com` and `www.vincentlarkin.com`. Local previews queue the same commands for inspection but never load Google or transmit visits.

The global event context includes `site_theme` and `site_language`, including the initial automatic page view. Theme values are `carbon-light`, `carbon-dark`, `retro`, and `vin`. `preferred_theme` is also set as a user property. The site preserves the original advertising-disabled configuration.

| Event | Parameters | Trigger |
| --- | --- | --- |
| `theme_view` | `site_theme`, `site_language` | Initial page load and legacy SPA page changes |
| `theme_change` | `previous_theme`, `theme_name`, current context | A preference actually changes, including light/dark and legacy theme selection |
| `language_change` | `previous_language`, `language_code`, current context | A language preference actually changes |
| `gallery_image_open` | `image_name`, current context | Opening a photograph |

Existing navigation, outbound, contact, download, engagement, scroll, error, and video events remain. Search queries and email addresses are not sent by custom interaction events. Clicking an already selected theme does not generate a change. Carbon changes its main pages in place through the History API; Enhanced Measurement tracks those page changes. Other document links navigate normally. There is no second manual page-view event.

## Useful next measurements

Prioritize questions with a clear site decision:

| Question | Available now | Additional work |
| --- | --- | --- |
| Which sources bring engaged visitors? | Session source/medium, landing page, engagement, contact_click key event | Consistent UTM tags on links posted externally; no extra site tracker needed |
| What do people do after landing? | Page views, navigation_click, outbound_click | Build a GA path exploration and an optional Home → About → contact intent funnel |
| Which projects draw interest? | Outbound destination, link label and placement | Compare clicks to sessions that saw the relevant page; add card-visibility events only if true impression-based CTR becomes useful |
| Which photographs keep visitors browsing? | gallery_image_open with image_name | Track viewer next/previous and year-filter changes to distinguish browsing from initial opens |
| Does site search help? | Link/photo clicks after search exist but have no explicit search attribution | Add search_open, result count, zero-result state and result selection; omit raw typed queries |
| Do people try to contact me? | Email-link contact_click | Add a separate contact_copy event only after clipboard copying succeeds; it still measures intent, not a sent email |
| Do slower loads affect engagement? | Page/device/theme and engagement | Add sampled Web Vitals and bounded load-failure categories, avoiding raw stack traces and user-entered values |

The search modal, email-copy button, photo next/previous controls, and year filter currently have no dedicated events. This is a roadmap, not a claim that those events were implemented. Existing article/scroll/active-reading events can already support content comparisons; cumulative reading thresholds must not be summed as total reading time.

GA supports [path explorations](https://support.google.com/analytics/answer/9317498?hl=en) and [funnel explorations](https://support.google.com/analytics/answer/9327974?hl=en) from the existing event stream. Start with those and source quality after enough post-repair data accumulates. The linked Search Console Domain property includes subdomains, so isolate the personal site's hostname before interpreting its search performance.

The production CSP repair and GA reporting setup were verified on September 12, 2026: page views, navigation and named photo events reached Realtime. Historical records before that repair are incomplete. Thirteen event dimensions and contact_click as a once-per-session key event were registered in GA; future administrators should check existing definitions before adding duplicates.

## GA4 reporting setup

In the existing property's **Admin → Data display → Custom definitions**, register these event-scoped dimensions if they do not already exist:

| Display name | Event parameter |
| --- | --- |
| Site theme | `site_theme` |
| Previous theme | `previous_theme` |
| Selected theme | `theme_name` |
| Site language | `site_language` |

Optionally register **Preferred theme** with User scope and user property `preferred_theme`. In Explore, use Site theme as rows and Views / Active users as metrics to see usage; filter Event name to `theme_change` and use Previous theme / Selected theme with Event count to examine switching.

An Analytics property Editor must register custom dimensions for their values to appear in standard reports and explorations. Collection works before registration. Allow 24–48 hours after registration for reporting. See [Google's event-scoped custom dimensions guide](https://support.google.com/analytics/answer/14239696?hl=en), [configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config), and [page-view guidance](https://developers.google.com/analytics/devguides/collection/ga4/views).

The repository does not grant access to the property's Admin or reports. Custom definitions and server-side receipt must be checked there after deployment; a local commit does not publish the site.

## Verification

`npm run test:site` checks the production files, four theme values, state persistence, transitions, and language changes. It also loads the real Google tag against a locally served copy under the production origin and captures its collection requests, fulfilling those requests locally so QA traffic never reaches the property. This verifies outgoing measurement ID, page-view theme context, and old/new theme parameters without creating artificial production visitors.
