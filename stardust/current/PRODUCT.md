<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-11-22T21:20:00Z
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/pages/index.html
    - stardust/current/_brand-extraction.json
  synthesizedInputs: []
  stardustVersion: 0.46.2
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

_provenance: inferred. Basis: the sidebar label "WORKSPACE", the "Customer view / Administrator view" switch, and the sample data ("Studio Guest Wi-Fi", "Home Network", "Sunday Market")._

Customers of ShareWiFiQR who have made one or more Wi-Fi QR codes. The sample data suggests small venues, studios, pop-up markets and households. They sign in to manage their codes and see how often guests scan them. There is also an administrator role, available from the role switch in the top bar.

## Product Purpose

From the meta description: "Manage Wi-Fi QR codes and track scans." The portal is the signed-in workspace for sharewifiqr.com. The brand mark links to `https://www.sharewifiqr.com`. Its jobs are to create QR codes (primary CTA "Create QR code"), list a workspace's codes, show scan activity over time, and give access to billing, profile and help.

## Positioning

_provenance: inferred. Basis: only one dashboard page was captured._

A focused, single-purpose tool. It shares Wi-Fi credentials as a scannable code and counts how often guests use it. The page shows no positioning claim beyond that.

## Capabilities and Constraints

- Navigation: Overview, Wi-Fi QR codes, Billing, My profile, Help center. Routes are scoped per customer (`/customer/<id>/…`).
- Overview: three stats (Total scans, Wi-Fi QR codes, Scans this week), a "Scan activity" line chart with a period select (8 weeks / 4 weeks / last month / custom), and a "Your Wi-Fi QR codes" table (name, SSID, security, total scans, created).
- Per-code detail routes exist (`/codes/<slug>`) but weren't captured.
- "Demo mode" pill: every number shown is demo data ("Demo activity through Nov 22, 2026").
- Built with Next.js (App Router). Captured from `next dev` at `http://localhost:3000`. The public preview (`mock-sharewifiqrcom-git-main-kasing.vercel.app`) is behind Vercel SSO.

## Brand Commitments

- Name: **ShareWiFiQR**. The wordmark sets "QR" apart in its own span (`.brand-qr`), with a "WORKSPACE" sub-label.
- Mark: a Lucide `wifi` glyph in white, on a 38px violet gradient tile with 12px radius.
- Register guess: **product**. It's a data dashboard with tables, filters and role switching, behind sign-in.
- Observed personality: calm, tidy, light. Soft violet on near-white, sentence-case labels, plain second-person copy.
- Observed anti-references: none stated.

## Evidence on Hand

- `stardust/current/pages/index.json` and `pages/index.html`: the captured Overview page, with its rendered DOM.
- `stardust/current/assets/screenshots/index.png`: full-page capture at 1440 px.
- `stardust/current/assets/logo.svg`: the brand-icon glyph.
- `stardust/current/_computed-styles.json`: the computed-style census.
- `stardust/current/_brand-extraction.json`: the consolidated brand surface.
- Absent: favicon, font files, photography, testimonials, marketing copy, and every page other than Overview. Don't fabricate any of these.

## Product Principles

_provenance: inferred. Basis: one dashboard page._

1. Scans are the main metric. Every surface reports activity per code.
2. Keep it small. The navigation has five items and no secondary product areas.
3. Say plainly when data is demo data. The page labels it in the top bar and in captions.

## Accessibility & Inclusion

Observed: `sr-only` labels on the selects and the details column, an `aria-current` nav item, an `aria-live` chart value, and a labelled mobile-menu button. No stated standard.
