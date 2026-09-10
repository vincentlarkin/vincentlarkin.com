# Site emblems

Updated September 10, 2026 from the two owner-supplied emblems.

| Asset | Use |
| --- | --- |
| `../images/site-emblem.png` | Transparent full-color master, 512 × 768, also used for social metadata. |
| `../images/site-emblem-small.webp` | Lossless 186px-high header derivative for Life of a VIN and readable fallback. VIN retains its existing warm filter. |
| `../images/site-emblem-carbon.png` | Transparent Carbon master, 501 × 768, with an opaque white pelican. |
| `../images/site-emblem-carbon-small.webp` | Lossless 120px-high derivative shared by the early header and mounted Carbon header. |
| `../images/site-emblem-retro.png` | 31 × 46 indexed PNG from the full-color cutout, nearest-neighbor sampling and 32 colors, rendered with Retro's existing pixelated treatment. |
| `../images/favicons/` and `../favicon.ico` | Full-color emblem in tab and shortcut sizes. Transparent icon artwork uses `purpose: any`; it is not a maskable icon. |

The two transparent masters were produced with the built-in imagegen tool. Resizing, encoding and icon packaging preserve their generated alpha channels. White stars, stripes, sword and the Carbon pelican remain opaque. Experimental pixel-art generations were discarded; the shipping Retro raster derives directly from the selected full-color emblem.

## Final extraction prompts

Full-color input: `ChatGPT Image Sep 10, 2026, 03_55_04 PM.png`.

> Use case: background-extraction. Edit target: provided full-color personal site emblem. Remove ONLY the solid black outside background and return the exact emblem as a clean RGBA transparent PNG. Preserve the navy outline, gold pelican and nest, sword, scales, four stars, American stripes and Portuguese coat of arms and all original colors/shapes/details unchanged. Keep white parts inside shield opaque. No redesign, no additions, no shadow, no checkerboard painted into the image. Actual transparent alpha surrounding the entire emblem. Crop to emblem with a small transparent margin.

Carbon input: `ChatGPT Image Sep 10, 2026, 03_59_44 PM.png`.

> Use case: background-extraction. Edit target: attached Carbon style site emblem. Remove ONLY the off-white background surrounding the emblem, return a clean RGBA PNG with actual transparent alpha. Preserve exactly the black outline, pelican shape and opaque white body, gold beak and nest, sword, scales, four stars, US stripes, red/green Portuguese half and detailed coat of arms. The white pelican, white sword, stars, stripes and white heraldic details are part of the emblem and must stay opaque. Clear outside white and the small gaps BETWEEN the legs/nest and outside outline, but keep bird body white. No redesign, no added details, no shadow, no checkerboard drawn into image. Crop to emblem with small transparent margin.

## Cleanup

Removed the superseded `pelican-carbon.png` and `pelican-carbon-small.webp`, plus four unused `images/themes/life-of-a-vin/corner-*.svg` graphics. A reference audit found no active consumers for those corner assets. The active VIN background, archive artwork master, gallery originals and font license remain. Production builds clear superseded hashed bundles and regenerate every page's startup references.
