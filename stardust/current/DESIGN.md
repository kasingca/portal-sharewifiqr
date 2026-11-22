<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-11-22T21:22:00Z
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/_computed-styles.json
    - http://localhost:3000/_next/static/chunks/app_globals_0yg4wg8plh8sv.css
  synthesizedInputs: []
  stardustVersion: 0.46.2
-->
---
name: ShareWiFiQR Portal
description: Manage Wi-Fi QR codes and track scans.
colors:
  canvas: "#f8f8fc"
  surface: "#ffffff"
  ink: "#211d35"
  muted: "#6d6a80"
  border: "#e9e7f0"
  purple: "#654ce0"
  purple-dark: "#533dc4"
  violet-tint: "#eee9ff"
  violet-ink: "#6247d5"
  blue-tint: "#e8efff"
  blue-ink: "#4667d7"
  mint-tint: "#e3f6ef"
  mint-ink: "#247e65"
  peach-tint: "#fff0e5"
  peach-ink: "#a55b26"
  nav-ink: "#59566d"
  nav-current-ink: "#5940cb"
  nav-current-bg: "#efebff"
  table-head-bg: "#faf9fd"
  table-cell-ink: "#615b73"
typography:
  h1:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(29px, 4vw, 37px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.045em"
  h2:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  table-cell:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  table-head:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 700
  label-button:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 680
    lineHeight: 1.35
rounded:
  button: "8px"
  nav: "9px"
  tile: "11px"
  brand: "12px"
  card: "13px"
  pill: "99px"
spacing:
  card-gap: "15px"
  section-gap: "16px"
  cell: "12px 17px"
  main-pad: "35px clamp(18px, 4vw, 48px) 30px"
  container: "1320px"
components:
  button-primary:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "8px 13px"
    height: "38px"
    typography: "{typography.label-button}"
  button-primary-hover:
    backgroundColor: "{colors.purple-dark}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "#403951"
    rounded: "{rounded.button}"
    padding: "8px 13px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "19px 21px 17px"
  nav-item:
    textColor: "{colors.nav-ink}"
    rounded: "{rounded.nav}"
    padding: "11px 12px"
    height: "43px"
  nav-item-current:
    backgroundColor: "{colors.nav-current-bg}"
    textColor: "{colors.nav-current-ink}"
  tile-violet:
    backgroundColor: "{colors.violet-tint}"
    textColor: "{colors.violet-ink}"
    size: "40px"
  demo-pill:
    backgroundColor: "#f0ecff"
    textColor: "#5d46c4"
    rounded: "{rounded.pill}"
    padding: "6px 9px"
---

# Design System: ShareWiFiQR Portal

This is a description of the current state, captured from one page (Overview) at `http://localhost:3000`. It records what the site is, not what it should become.

## Overview

A light, airy SaaS dashboard. A white sticky sidebar (238px) and a white 68px top bar frame a near-white `#f8f8fc` canvas, where white cards sit with hairline lavender borders and an almost invisible shadow. Violet `#654ce0` is the only saturated brand color. It's used sparingly: the primary button, the current nav item, the chart line, and the brand tile.

## Colors

### Primary
- **Purple** `#654ce0` (`--purple`) is used for the primary button's background and border, the chart stroke, and text links. On hover it changes to **Purple dark** `#533dc4`.

### Tertiary: tile tints
Four tint/ink pairs mark entities in stat cards and table rows: violet `#eee9ff`/`#6247d5`, blue `#e8efff`/`#4667d7`, mint `#e3f6ef`/`#247e65`, peach `#fff0e5`/`#a55b26`.

### Neutral
- **Canvas** `#f8f8fc` is the page background. **Surface** `#fff` is used for cards, the sidebar and the top bar.
- **Ink** `#211d35` is used for headings and body text. **Muted** `#6d6a80` is used for captions and axes. Several more greys in the `#59566d`–`#655f77` range are used for nav, table head and table cells.
- **Border** `#e9e7f0` is used for card, sidebar and top-bar borders. Row dividers use `#f0eef5`.

## Typography

Inter for everything, falling back to `-apple-system, BlinkMacSystemFont, Segoe UI`. The site loads no font files, so Inter only renders where it's installed locally. The base size is 14px.

### Hierarchy
- **H1** clamp(29–37px), weight 700, line-height 1.15, tracking −0.045em.
- **H2** 17px, weight 700, line-height 1.35, tracking −0.025em.
- **Stat figure** at large size inside `<strong>`; **chart value** 24px.
- **Body** 14px/400. **Table cell** 13px. **Table head** 11px/700. **Axis and date labels** 10px.
- **Buttons** use weight 680; **nav items** use 600.

The scale is ad-hoc (37 → 17 → 14 → 13 → 12), with no modular ratio.

## Layout

- App shell grid: `238px | minmax(0, 1fr)`, with a sticky full-height sidebar.
- `main` is capped at 1320px and centered, with padding `35px clamp(18px, 4vw, 48px) 30px`.
- Stats use a 3-column grid with a 15px gap. Sections are 16px apart.
- Spacing has no 4- or 8-px base. Odd values (5, 7, 9, 11, 13, 17, 19, 21px) are common.
- Breakpoints: at 900px the sidebar shrinks to 185px. At 700px the sidebar becomes an off-canvas drawer, the top bar shrinks to 58px and main padding to 23px 14px. At 390px alternate chart dates are hidden. The CSS also has rules at 750px and 940px.

## Elevation & Depth

Depth is barely there: hairline borders do most of the work.
- Cards: `0 2px 4px rgba(39,33,75,.016)`.
- Primary button: `0 2px 4px rgba(74,51,175,.137)`.
- Brand tile: `0 4px 9px rgba(112,87,232,.173)`.

## Shapes

Small, soft radii that vary by component: 8px (buttons, selects), 9px (nav items), 11px (icon tiles), 12px (brand tile), 13px (cards), 99px (pill), 50% (avatar and status dots).

## Components

### Buttons
- **Primary**: purple fill, white label, weight 680, 38px minimum height, 8px radius, 8px gap before a leading Lucide icon.
- **Secondary**: white with a `#e4e1ed` border and `#403951` text. On hover the label turns purple-dark on `#f5f2fe`.

### Cards / Containers
White, 1px `#e9e7f0` border, 13px radius, near-zero shadow.

### Navigation
Sidebar nav items are 43px tall with an 11px icon–label gap. The current item has a `#efebff` background and `#5940cb` text. Each uses an 18px Lucide icon.

### Data table
Header row `#faf9fd`, 11px bold. Cells are 13px with 12px × 17px padding. The identity cell holds a tinted tile, the code name as a link, and the SSID in `<small>`.

### Status pill
"Demo mode": `#f0ecff` fill, `#5d46c4` text, 99px radius, with a leading dot.

### Icons
Lucide, inline SVG, stroke `currentColor`, stroke width 2.
