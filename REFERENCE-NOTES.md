# THENGA — reference adaptation

Working brand name: THENGA. The supplied name field was blank. The flavour range, packaging, and copy are a creative brand concept. No verified commercial SKU data, pricing, nutrition panel, real customers, or checkout provider was supplied. The site explores flavours and does not pretend to take orders.

## Reference review before implementation
Source: supplied 11.235-second screen recording, 736×464. Examined at half-second intervals and key moments. The reference is a compressed recording of scrolling, not a fixed-duration animation; the implementation maps its phases to user scroll position.

| Time | Composition and movement | Implementation |
| --- | --- | --- |
| 0–0.6 s | Cream field, central floating whole coconut; large condensed type in opposite corners | Green coconut, matching oversized headline and small supporting copy, floating product and palm frond |
| 0.6–2.4 s | Shell opens toward the viewer; informational circular seals enter around it | Scroll-driven hemispheres, white flesh, water surface and orbiting visual callouts |
| 2.4–4.3 s | Halves return together and coconut rotates at the centre | Three-dimensional shell closure and axial rotation; Kerala origin copy inserted within this same sequence |
| 4.3–5.6 s | Coconut splits vertically; tall cream drink can emerges between shell halves | Shells separate along the vertical axis; can grows from the centre |
| 5.6–7.1 s | Can turns from front through side/rear; “keep sipping” behind it | Real 3D cylindrical/lathed packaging with wrapped front and rear typography |
| 7.1–8.0 s | Scalloped coloured panel rises; bold centred statement | Deep Kerala green panel, scalloped edge and oversized statement |
| 8.0–8.6 s | Flavour cards in a horizontal strip | Five scrollable colour-coded cards with product details and flavour switching |
| 8.6–9.2 s | Editorial image collage | Authentic Kerala houseboat and paddy photography with opposing scroll parallax |
| 9.2–10.0 s | Three quote cards and two campaign panels | Three daily rituals in the same three-column rhythm, without fabricated customer testimonials; twin closing campaign panels |
| 10.0–11.235 s | Scalloped closing panel; large brand wordmark | Green closing panel and full-width THENGA wordmark |

## Motion
GSAP ScrollTrigger drives a 600vh desktop / 520vh mobile sticky scene. Native scrolling remains available; there is no wheel hijack. Scrub interpolation is 0.85 seconds. Three.js uses real geometry for product rotation, shell separation, interior flesh and packaging. The initial hero is a photographic cutout that transitions into the 3D scene. Geometry is an authored approximation rather than an original commercial 3D model. A software Canvas2D renderer projects the same textured Three.js meshes when WebGL is unavailable; it has simpler lighting than the WebGL view. Main view has capped pixel ratio and stops rendering when outside the viewport. Product thumbnails are rendered once and graphics resources disposed. Reduced-motion preference removes decorative motion; the header control pauses ambient movement.

## Generated assets
Built-in imagegen: isolated fresh green Kerala coconut with tan crown and droplets; 2:1 seamless green fibrous coconut-husk texture; transparent sunlit coconut-palm frond. Files in public/assets. Photography is independently sourced and credited in IMAGE-CREDITS.md and the site footer.

## Running
Install with the package manager recorded in package.json / pnpm-lock.yaml. Run `pnpm dev` or `pnpm build`. This checkout uses the Sites-managed Vinext starter and its existing deployment integration.

## Validation
TypeScript passed. Browser checks covered the desktop hero, coconut opening, can reveal, five product thumbnails, opening details, next-flavour selection, navigation, and a 390px mobile iframe. No horizontal mobile overflow and no broken loaded images were found. The test browser disables WebGL, so rendering QA used the software fallback; hardware lighting was not visually verified.

## Kerala packaging revision
The second version preserves the original layout and scroll choreography. All five can textures now use original Kathakali-and-palms artwork with flavour-coloured bands, cream labels and gold rules. Kathakali appears in the origin scene, section accents, and real heritage photography. The coconut husk uses an unlit, tone-mapping-independent material, with its colour calibrated against the supplied photographic hero. Software rendering now applies material colour in linear colour space and bypasses its green-tinted lighting for that coconut material, matching the hardware-rendering path.
