<!-- stardust:provenance
  writtenBy: stardust:replica
  writtenAt: 2026-11-22T22:05:00Z
  readArtifacts:
    - stardust/current/_crawl-log.json
    - ~/git/mock-sharewifiqr.com/app/portal-routes.mjs
  synthesizedInputs: []
  stardustVersion: 0.46.2
-->
# Inconsistency register

These are the only permitted deltas from the source. No visual delta is registered: the design is kept pixel-for-pixel.

| ID | Kind | Captured evidence | Minimal change | Status |
|---|---|---|---|---|
| R-01 | IA / routing (platform constraint) | Source routes put record IDs in the path: `/customer/<customerId>/codes/<codeId>`, `/admin/customers/<id>`, `/admin/customers/<id>/view/…` (`portal-routes.mjs`). EDS serves one document per path, and folder mapping is deprecated (aem.live, 2026). | Each screen is one DA document at a fixed path. Record IDs move to query parameters: `/customer/codes/detail?id=studio-guest`, `/admin/customers/account?id=maya`, `/customer?as=maya` (admin "view as customer"), and `?customer=<id>` for the customer workspace. `scripts/app/route.js` also accepts the source's path-style IDs, so a CDN rewrite on `portal.sharewifiqr.com` can restore the original URLs without code changes. | accepted |
| R-02 | Metadata (user-requested) | Every source page has the same title, "ShareWiFiQR \| Portal", and the description "Manage Wi-Fi QR codes and track scans." | Each screen gets its own title in the form `<Screen> \| ShareWiFiQR Portal`, plus a screen description. The user asked for titles and descriptions to be defined for `portal.sharewifiqr.com`. Not visible on the page. | accepted |
| R-03 | Unknown-route behavior | Next.js renders its built-in 404 for unknown portal paths. | EDS serves the project `404.html`. Not gated. | accepted |
| R-04 | Semantics (no visual change) | The source navigates with JS `<button>`s: footer "Terms & conditions" / "Privacy", "View all", the back link, and table rows. | Navigation is rendered as real links (`<a href>`), styled the same. The footer links are authored in the footer document. Accepted in `stardust/replica/accepted.json`. | accepted |
| R-05 | Source defect (no visual change) | At ≤700px the source document scrolls sideways (`scrollWidth` 551 at 360). Its table's `.sr-only` "Details" header is `position: absolute` with no positioned ancestor, so it escapes `.table-scroll`. | `.table-scroll { position: relative }` contains it. The gate's no-horizontal-overflow assert is absolute. | accepted |
| R-06 | Source defect (no visual change) | At 360 the source's top bar (breadcrumb, then the role switcher) is wider than the viewport: `.top-actions` ends at 392px, so the document scrolls sideways. | `header` and `main` get `overflow-x: clip` at ≤700px. Nothing visible changes (the clipped part was off-screen). Also covers the admin account's "Pause account" button, which runs past its stat card to 380px in the source. The gate's no-overflow assert is absolute. | accepted |
