import { config, demoMode } from '../../scripts/app/config.js';
import { getSession } from '../../scripts/app/api.js';
import { go, href, readRoute } from '../../scripts/app/route.js';
import {
  avatar, esc, flushPendingToast, html, icon,
} from '../../scripts/app/ui.js';

/** Screens whose nav item is another screen's (detail lives under codes, …). */
const ACTIVE = { detail: 'codes', account: 'customers' };
/** Screens a paused customer may still open (source: `content[screen]` + sign-in). */
const PUBLIC_SCREENS = ['help', 'terms', 'privacy', 'signin'];

/**
 * Reads the nav document (`/customer/nav`, `/admin/nav`): one `sidebar` block whose rows are
 * `brand | <url>`, `group | <label>`, `signed-out | <label> | <icon>` or
 * `<screen> | <label> | <icon>`.
 */
async function loadNav(path) {
  const resp = await fetch(`${path}.plain.html`);
  const doc = html(`<div>${resp.ok ? await resp.text() : ''}</div>`);
  const rows = [...doc.querySelectorAll('.sidebar > div')]
    .map((row) => [...row.children].map((cell) => cell.textContent.trim()));
  const nav = { brand: 'https://www.sharewifiqr.com', groups: [], signedOut: null };
  rows.forEach(([key, label, iconName]) => {
    if (key === 'brand') nav.brand = label;
    else if (key === 'group') nav.groups.push({ label, items: [] });
    else if (key === 'signed-out') nav.signedOut = { screen: 'signin', label, icon: iconName };
    else if (key && nav.groups.length) {
      nav.groups.at(-1).items.push({ screen: key, label, icon: iconName });
    }
  });
  return nav;
}

function navItem(item, current) {
  const active = item.screen === current;
  return `<a class="nav-item${active ? ' current' : ''}"${active ? ' aria-current="page"' : ''} href="${esc(href(item.screen))}">${icon(item.icon, 18)}${esc(item.label)}</a>`;
}

/**
 * Header block: the portal's application shell. Renders the top bar into <header> and mounts
 * the sidebar, mobile overlay and impersonation banner beside it on <body>.
 * @param {Element} block
 */
export default async function decorate(block) {
  const route = readRoute();
  const session = await getSession(route);
  if (session.paused && !PUBLIC_SCREENS.includes(route.screen)) {
    window.location.replace(href('signin'));
    return;
  }
  const navPath = config('nav') || `/${route.role === 'admin' && !route.impersonating ? 'admin' : 'customer'}/nav`;
  const nav = await loadNav(navPath);
  const current = ACTIVE[route.screen] || route.screen;
  const { adminView, profile, signedIn } = session;

  const groups = nav.groups.map((group, index) => {
    let items = group.items.map((item) => navItem(item, current)).join('');
    if (index === 0 && !signedIn && nav.signedOut) items = navItem(nav.signedOut, current);
    return `<div class="nav-label${index ? ' support-label' : ''}">${esc(group.label)}</div>${items}`;
  }).join('');

  const account = adminView
    ? `<span class="avatar violet">${icon('shield-check', 19)}</span>`
    : avatar(session.customer);
  const breadcrumbHome = href(!signedIn ? 'signin' : (adminView && 'customers') || 'overview');

  const sidebar = html(`<aside class="sidebar">
      <a class="brand" href="${esc(nav.brand)}" aria-label="ShareWiFiQR home"><span class="brand-icon">${icon('wifi', 24)}</span><span>ShareWiFi<span class="brand-qr">QR</span><small>WORKSPACE</small></span></a>
      <nav aria-label="Workspace navigation">${groups}</nav>
      <div class="sidebar-bottom"><div class="sidebar-account">${account}<div><strong>${esc(`${profile.first} ${profile.last}`)}</strong><small>${adminView ? 'Admin workspace' : 'Customer workspace'}</small></div><button class="icon-button" aria-label="Sign out">${icon('log-out', 17)}</button></div></div>
    </aside>`);
  const overlay = html('<button class="mobile-overlay" aria-label="Close navigation"></button>');

  block.textContent = '';
  block.append(html(`<div class="topbar"><div class="breadcrumbs"><button class="icon-button mobile-menu" aria-label="Open navigation">${icon('menu', 22)}</button><a href="${esc(breadcrumbHome)}">Portal</a>${icon('chevron-right', 14)}<strong>${esc(config('breadcrumb') || document.title)}</strong></div>
      <div class="top-actions">${demoMode() ? '<span class="demo"><i></i> Demo mode</span>' : ''}<label class="role"><span class="sr-only">Switch workspace</span>${icon(route.role === 'admin' ? 'shield-check' : 'user-round', 17)}<select><option value="customer">Customer view</option><option value="admin">Administrator view</option></select>${icon('chevron-down', 15)}</label></div>
    </div>`));
  // the sidebar and banner are the shell's own landmarks, beside <header> like the source's
  document.body.prepend(overlay, sidebar);

  if (route.impersonating && session.customerKnown) {
    const banner = html(`<div class="impersonation">${icon('eye', 17)}<span>Viewing as <strong>${esc(`${session.customer.first} ${session.customer.last}`)}</strong></span><button class="button secondary">Exit customer view</button></div>`);
    banner.querySelector('button').addEventListener('click', () => go('account', { role: 'admin', id: route.impersonating, impersonating: null }));
    block.closest('header').after(banner);
  }

  const setMobile = (open) => {
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
  };
  block.querySelector('.mobile-menu').addEventListener('click', () => setMobile(true));
  overlay.addEventListener('click', () => setMobile(false));

  const changeRole = (role) => go('signin', { role, impersonating: null });
  const select = block.querySelector('.role select');
  select.value = route.role;
  select.addEventListener('change', () => changeRole(select.value));
  sidebar.querySelector('[aria-label="Sign out"]').addEventListener('click', () => changeRole(route.role));

  flushPendingToast();
}
