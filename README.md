# ShareWiFiQR Portal

The signed-in workspace for ShareWiFiQR (`portal.sharewifiqr.com`), built on AEM Edge Delivery Services and authored in da.live. The site is an **application shell**: every screen is a da.live document holding a few transactional blocks. Each block gets its data from one API module.

## Environments
- Preview: https://main--portal-sharewifiqr--kasingca.aem.page/
- Live: https://main--portal-sharewifiqr--kasingca.aem.live/
- Production: https://portal.sharewifiqr.com/

## Screens

| Persona | Path | Blocks |
|---|---|---|
| — | `/` | entry (template `entry`: no sidebar, top bar or footer) |
| customer | `/customer` | page-header, stats (overview), scan-activity, code-table (limit 3) |
| customer | `/customer/codes` | page-header, code-table |
| customer | `/customer/codes/detail?id=<code>` | page-header (back, `{name}`), code-detail, scan-activity (code) |
| customer | `/customer/billing` | page-header, stats (billing), plan-options, payment-history |
| customer | `/customer/profile` | page-header, profile-form, payment-method |
| customer | `/customer/sign-in` | sign-in |
| customer | `/customer/help`, `/terms`, `/privacy` | authored default content (section style `content-card`) |
| admin | `/admin` | page-header, stats (customers), customer-directory |
| admin | `/admin/customers/account?id=<customer>` | page-header (back, `{name}`), stats (account), payment-history |
| admin | `/admin/profile` | page-header, profile-form |
| admin | `/admin/sign-in`, `/admin/help`, `/terms`, `/privacy` | as above |
| admin → customer | `/customer?as=<customer>` (any customer screen) | the customer screens, with the "Viewing as" banner |

Record IDs are query parameters (`?id=`, `?as=`, `?customer=`). EDS serves one document per path, and folder mapping is deprecated. `scripts/app/route.js` also reads the old path-style IDs (`/customer/<id>/codes/<code>`), so a CDN rewrite on the production host can keep those URLs.

## Blocks

Each block is configured with `key | value` rows. None of them carries data.

| Block | Config rows |
|---|---|
| `page-header` | `title`, `description` (both accept `{tokens}` from the screen's record), `action \| create-code\|edit-code\|manage-payment\|view-as-customer [\| label]`, `back \| codes\|customers` |
| `stats` | `source \| overview\|customers\|account\|billing` |
| `scan-activity` | `scope \| workspace\|code` |
| `code-table` | `heading`, `description`, `limit`, `view-all` |
| `code-detail` | (none) |
| `plan-options` | `heading`, `description`, `popular \| <plan id>` |
| `payment-history` | `heading`, `description` |
| `profile-form` | `heading` |
| `payment-method` | `heading`, `description` |
| `customer-directory` | `heading`, `description` |
| `sign-in` | `title`, `description`, `button`, `icon` |
| `entry` | `title`, `description`, `log-in \| <link>`, `sign-up \| <link>`, `sign-in-failed \| <message>` (shown on `/?error=sign_in_failed`) |
| `header` | reads `/<persona>/nav`: one `sidebar` block with rows `brand \| url`, `group \| LABEL`, `<screen> \| label \| lucide-icon`, `signed-out \| label \| icon` |
| `footer` | reads `/<persona>/footer`: one paragraph and the legal links |

## Session check

Every `/customer…` and `/admin…` page (except the `signed-out` demo sign-in pages) shows "Checking your session…" and calls `GET https://api.sharewifiqr.com/v1/me` before any dashboard content renders (`scripts/app/session.js`). On 200 it follows the response's `destination` (`/customer` or `/admin`); on 401 it returns to `/`; anything else shows "We couldn’t check your session. Refresh to try again." An administrator on a customer page with `?as=<id>` stays on it. The API allows credentialed CORS only from `https://portal.sharewifiqr.com`, so on localhost and `*.aem.page` the dashboards stop at that message.

## App configuration: root metadata

App configuration lives in the root **bulk metadata** sheet (`/metadata`, see `content/metadata.json`), not in pages. Pages carry only `title`, `description`, `screen`, `breadcrumb` (and `signed-out` on sign-in).

| Key | Values | Purpose |
|---|---|---|
| `api-mode` | `mock` \| `live` | `mock` = in-browser demo data (today); `live` = REST calls |
| `api-base` | `https://api.sharewifiqr.com` | REST origin for `live`, also used in QR scan links |
| `demo-mode` | `true` \| `false` | shows the "Demo mode" pill |
| `persona` | `customer` \| `admin` | workspace of the path (falls back to the first path segment) |
| `nav`, `footer` | `/customer/nav`, `/customer/footer`… | shell fragments |

## API: going live

`scripts/app/api.js` is the only data boundary. Each function documents its REST route (for example `GET /customers/{customer}/codes` or `POST /customers/{customer}/billing/plan-changes`). To move a call to `api.sharewifiqr.com`, implement the route and set `api-mode` to `live`. Blocks don't change. `scripts/app/mock.js` holds the demo seed data and rules.

## Local development

```sh
npm i
npx -y @adobe/aem-cli up   # serves ./content/ (the da.live documents) and local code
```

`./content/` holds the da.live source of every screen. Push it with `aem content add …`, then `aem content commit` and `aem content push`, then preview. `content/` and `stardust/` are excluded from code delivery in `.hlxignore`.

## Linting

```sh
npm run lint
```

## Boilerplate documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `portal-sharewifiqr` directory in your favorite IDE and start coding :)
