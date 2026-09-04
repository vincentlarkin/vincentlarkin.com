# Site measurement

The existing GA4 web stream remains `G-9D6Q6F0NB5`. `js/analytics.js` loads Google's tag on `vincentlarkin.com` and `www.vincentlarkin.com`. Local previews queue the same commands for inspection but never load Google or transmit visits.

The global event context includes `site_theme` and `site_language`, including the initial automatic page view. Theme values are `carbon-light`, `carbon-dark`, `retro`, and `vin`. `preferred_theme` is also set as a user property. The site preserves the original advertising-disabled configuration.

| Event | Parameters | Trigger |
| --- | --- | --- |
| `theme_view` | `site_theme`, `site_language` | Initial page load and legacy SPA page changes |
| `theme_change` | `previous_theme`, `theme_name`, current context | A preference actually changes, including light/dark and legacy theme selection |
| `language_change` | `previous_language`, `language_code`, current context | A language preference actually changes |
| `gallery_image_open` | `image_name`, current context | Opening a photograph |

Existing navigation, outbound, contact, download, engagement, scroll, error, and video events remain. Search queries and email addresses are not sent. Clicking an already selected theme does not generate a change. Full page navigation in Carbon lets the Google tag send one standard page view per document; it does not add a second manual page-view event.

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
