<!-- stardust:provenance
  writtenBy: stardust:replica
  writtenAt: 2026-11-22T22:08:00Z
  readArtifacts:
    - stardust/current/_crawl-log.json
    - stardust/current/pages/*.json (dynamic sections)
    - ~/git/mock-sharewifiqr.com/app/*.jsx, *.mjs
  synthesizedInputs: []
  stardustVersion: 0.46.2
-->
# Dynamic surface: dispositions

The crawl's reach scan found **0 network data endpoints** and no third-party scripts. All state in the source is client-side seed data (`app/data.js`, `billing-data.mjs`), persisted to `localStorage['sharewifiqr-demo-v1']`. So every row below is a **transactional surface**. Disposition for all of them: **reproduce through `scripts/app/api.js`**, using `api-mode=mock` (same seed data, same storage key) now and `api-mode=live` (`api-base` = `https://api.sharewifiqr.com`) later. No block reads seed data directly.

| # | Surface | Screens | Source | EDS owner | API call(s) | Disposition |
|---|---|---|---|---|---|---|
| D1 | Session / signed-in identity, sidebar account, sign-out | all | `Portal` state, route | `header` block | `getSession(persona)` | reproduce (mock) |
| D2 | Persona switch (Customer view ↔ Administrator view) | all | `<select>` → `/role/sign-in` | `header` block | none (navigation) | reproduce |
| D3 | Mobile nav drawer + overlay | all ≤700px | `mobile` state | `header` block | none | reproduce |
| D4 | Breadcrumb current label | all | nav/content lookup | `header` block (page `breadcrumb` metadata) | none | reproduce |
| D5 | Impersonation banner "Viewing as …" + Exit | `/customer?as=` (admin) | `impersonating` | `header` block | `getCustomer(id)` | reproduce |
| D6 | Stat cards (overview, customers, account, billing) | overview, customers, account, billing | computed | `stats` block (`source` config) | `listCodes`, `listCustomers`, `getCustomer`, `getBilling` | reproduce |
| D7 | Scan activity chart + period select + custom range | overview, code detail | `ScanChart` | `scan-activity` block | `getScanActivity({ codeId? })` | reproduce |
| D8 | QR code table (+ empty state, row click) | overview (top 3), codes | `CodeTable` | `code-table` block (`limit`) | `listCodes(customerId)` | reproduce |
| D9 | Create / edit Wi-Fi QR code dialog (validation, password toggle, Escape) | overview, codes, detail | `Editor` | `scripts/app/code-editor.js` (opened by `page-header` actions) | `saveCode(code)` | reproduce |
| D10 | QR image generation, Download PNG, Copy link | code detail | `qrcode` lib | `code-detail` block (vendored `qrcode-generator`) | `getCode(id)`; scan link `https://api.sharewifiqr.com/<customerId>/q/<codeId>` | reproduce |
| D11 | Password reveal | code detail | state | `code-detail` block | none | reproduce |
| D12 | Plan options, schedule / cancel change | billing | `PlanOptions` | `plan-options` block | `getBilling`, `schedulePlan(planId)` | reproduce |
| D13 | Payment history: date filter, presets, pagination, page size | billing, account | `PaymentHistory` | `payment-history` block | `listPayments(customerId)` | reproduce |
| D14 | Profile form (name, email), User ID copy | profile (both personas) | form | `profile-form` block | `getProfile`, `saveProfile` | reproduce |
| D15 | Payment method radio + save | customer profile | `PaymentMethod` | `payment-method` block | `savePaymentMethod` | reproduce |
| D16 | Customer directory search / sort / filters / reset | admin | `DirectoryFilters` | `customer-directory` block | `listCustomers(filters)` | reproduce |
| D17 | Pause / resume account | admin account | button | `stats` block (`account` source) | `setCustomerPaused` | reproduce |
| D18 | Sign-in "Continue as …" (paused-account guard) | sign-in | `SignIn` | `sign-in` block | `signIn(persona)` | reproduce |
| D19 | Toast notifications | many | `toast` state | `scripts/app/toast.js` | none | reproduce |
| D20 | Help / Terms / Privacy text | help, terms, privacy | `portal-content.js` | **authored default content** in DA (the only real content) | none | content |

Endpoint plan for `api-mode=live` is in the code: `scripts/app/api.js` names each call's REST path.
