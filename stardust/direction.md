<!-- stardust:provenance
  writtenBy: stardust:replica
  writtenAt: 2026-11-22T22:05:00Z
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
  synthesizedInputs: []
  stardustVersion: 0.46.2
-->
# Direction — preserve (replica)

**Flow:** replica (`flowSource: user-phrase`). The ask was "match the source page", and the user's /goal (2026-11-22) says "hard code the experience exactly like how you see it on http://localhost:3000".

## What was promoted
`stardust/current/PRODUCT.md`, `DESIGN.md` and `DESIGN.json` were copied verbatim to the project root as the target spec. The stardust `direct` skill was not run, and no divergence was rolled. The descriptive synthesis came from the first single-page extract (Overview). The 16-page prep crawl that followed confirmed the same tokens on every screen; the source stylesheet is one global sheet, `app/globals.css`.

## Register
`stardust/replica/inconsistency-register.md` lists the only permitted deltas.

## Platform contract (user-stated, binding)
- Target: AEM Edge Delivery Services, authored in da.live; production host `portal.sharewifiqr.com`.
- The site is an **application shell**. Apart from per-block configuration, no page carries content. Every screen is a set of transactional blocks that read data through one API module (`scripts/app/api.js`). That module is mocked today with the source's demo data, and will later be switched to `https://api.sharewifiqr.com`.
- App configuration (API base, API mode, persona, nav, demo flag) lives in root **bulk metadata** (`/metadata` sheet), not in pages.
- Every page defines `title` and `description`.
- Two personas: customer (`/customer…`) and administrator (`/admin…`).
