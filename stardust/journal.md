# Journal

## extract (2026-11-22)
- `https://mock-sharewifiqrcom-git-main-kasing.vercel.app` is behind Vercel Deployment Protection (302 to `vercel.com/sso-api`). The extract was retargeted at the user's request to the same app on `http://localhost:3000` (`next dev`, repo `~/git/mock-sharewifiqr.com`).
- 16 pages were captured live across both personas. The first pass timed out on 5 pages (`next dev` compiling on first hit); they were re-captured serially with a 150 s timeout. Every screenshot passed the vision check.
- Page types: overview, codes, code-detail, billing, profile, content (help/terms/privacy), sign-in, customers (admin), account (admin). `/customer` and `/admin/customers/maya/view` are byte-duplicates of Overview.

## preserve-direction
- Promoted `current/` PRODUCT/DESIGN/DESIGN.json to the root (hlxignored). The register (`replica/inconsistency-register.md`) has no visual deltas. Its non-visual entries are R-01 query-param record IDs (folder mapping is deprecated), R-02 per-screen titles and descriptions (user request), R-03 the EDS 404, R-04 links instead of JS buttons for navigation, and R-05 containing the source's `.sr-only` overflow.
- Dynamic surface: 20 rows (`dynamic-features.md`). All are client-side state in the source, so every one is reproduced through `scripts/app/api.js` (mock now, `api.sharewifiqr.com` later).

## recreate
- **Deviation from the replica card, recorded on purpose:** no standalone `stardust/prototypes/*.html`. The deliverable is an application shell whose every block renders from JS data. A static HTML prototype would be thrown away at conversion, so each archetype was authored directly as EDS blocks plus da.live documents in `./content/`, served by `aem up` (`:3636`). The same measured gate runs against it.
- Values were lifted from the source stylesheet (`app/globals.css`) into block-scoped CSS, and from the source components into block JS (same Lucide icon paths, same `qrcode` library and options, the same seed data and rules ported verbatim).
- Shell: `<header>` is the top bar. The header block mounts the sidebar (fixed over grid column 1), the mobile overlay and the impersonation banner on `<body>`, so the landmarks match the source. Header and footer load in the eager phase, the right choice for an app shell (and the gate's chrome probe needed it).

## source-fidelity-gate
- The source dev server on `:3000` exited mid-run (cause unknown; not stopped by this session). It was restarted with `npm run dev` in `~/git/mock-sharewifiqr.com`.
- Overview: 1440 iter3, pixels 0.25%, Δh 0, content 0 🔴, chrome ✓ (confirmed standalone after the eager-header change). 360 iter3: 0.83%, Δh 0, overflow ok, content 0 🔴, chrome ✓, Clipped 0.
- 360 overflow: the page scrolled sideways (`scrollWidth` 551) because of the source's own `.sr-only` escape. Fixed as R-05.
- Account@360 also overflowed (source "Pause account" button to 380px), so R-06 now covers `main` too. On mobile the workspace became a full-height flex column, matching the source footer position on short pages: `main`/`footer` boxes Δ0 at 360.
- **Result: 9/9 archetypes pass the bar at 1440 and 360.** Pixels 0.04–0.83%. Δh 0, except billing@360 at 7px (bound 8, one offset at y≈397: residual). 0 🔴 content findings (R-04 role swaps accepted in `replica/accepted.json`), chrome parity ✓, Clipped 0, no overflow. cap-probe passes @2560.
- The detail page's advisory visual-diff timed out twice under parallel load; run standalone it reports no flags.
- Lint (eslint + stylelint) is clean. Reordering CSS for lint changed nothing: a re-capture of all 18 archetype×width builds shows 0.00% against the gated build images.
- Functional: `replica/flows.mjs` passes 15/15 transactional flows (create/edit code, QR + link, plan scheduling, payment filters, profile/payment save, directory filters, pause/resume, impersonation, paused-account redirect, role switch, unavailable record), with 0 page errors.

## handoff (not run: needs da.live auth)
- Next: `aem content` push of `./content/` (22 docs and the `/metadata` sheet), then preview. Then gate against the published origin: `gate.sh <slug> <live> https://main--portal-sharewifiqr--kasingca.aem.page/<path> <w> pub1 --full`.
