import { config, persona } from './config.js';

/**
 * Screen → document path. Each screen is one da.live document; record IDs travel as
 * query parameters (see stardust/replica/inconsistency-register.md R-01).
 */
const PATHS = {
  customer: {
    overview: '/customer',
    codes: '/customer/codes',
    detail: '/customer/codes/detail',
    billing: '/customer/billing',
    profile: '/customer/profile',
    help: '/customer/help',
    terms: '/customer/terms',
    privacy: '/customer/privacy',
    signin: '/customer/sign-in',
  },
  admin: {
    customers: '/admin',
    account: '/admin/customers/account',
    profile: '/admin/profile',
    help: '/admin/help',
    terms: '/admin/terms',
    privacy: '/admin/privacy',
    signin: '/admin/sign-in',
  },
};

const CUSTOMER_ID = /^[a-f0-9]{32}$/;

/**
 * Reads IDs written the source's way (`/customer/<customerId>/codes/<id>`,
 * `/admin/customers/<id>/view/…`) so a CDN rewrite can keep those URLs.
 */
function readPathIds(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const ids = {};
  if (parts[0] === 'customer' && CUSTOMER_ID.test(parts[1] || '')) {
    [, ids.customerId] = parts;
    if (parts[2] === 'codes' && parts[3]) [, , , ids.id] = parts;
  }
  if (parts[0] === 'admin' && parts[1] === 'customers' && parts[2] && parts[2] !== 'account') {
    if (parts[3] === 'view') {
      [, , ids.impersonating] = parts;
      if (parts[4] === 'codes' && parts[5]) [, , , , , ids.id] = parts;
    } else {
      [, , ids.id] = parts;
    }
  }
  return ids;
}

/**
 * The current route: who is looking, at which screen, at which record.
 * @returns {{persona: string, role: string, screen: string, id: string|null,
 *   customerId: string|null, impersonating: string|null, signedOut: boolean}}
 */
export function readRoute() {
  const params = new URLSearchParams(window.location.search);
  const fromPath = readPathIds(window.location.pathname);
  const impersonating = params.get('as') || fromPath.impersonating || null;
  const pagePersona = persona();
  return {
    persona: pagePersona,
    // an administrator viewing a customer workspace keeps the admin role
    role: impersonating ? 'admin' : pagePersona,
    screen: config('screen') || (pagePersona === 'admin' ? 'customers' : 'overview'),
    id: params.get('id') || fromPath.id || null,
    customerId: params.get('customer') || fromPath.customerId || null,
    impersonating,
    signedOut: config('signed-out') === 'true',
  };
}

/**
 * Builds the URL of a screen, keeping the workspace context of the current route.
 * @param {string} screen screen key
 * @param {object} [options]
 * @param {string} [options.id] record id
 * @param {string} [options.role] force a persona ('customer' | 'admin')
 * @param {string|null} [options.impersonating] admin "view as customer" id
 * @returns {string}
 */
export function href(screen, options = {}) {
  const route = readRoute();
  const impersonating = options.impersonating === undefined
    ? route.impersonating : options.impersonating;
  const role = options.role || (impersonating ? 'customer' : route.persona);
  const path = PATHS[role][screen] || PATHS[role][role === 'admin' ? 'customers' : 'overview'];
  const params = new URLSearchParams();
  if (options.id) params.set('id', options.id);
  if (role === 'customer' && impersonating) params.set('as', impersonating);
  if (role === 'customer' && !impersonating && route.customerId && !options.role) {
    params.set('customer', route.customerId);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function go(screen, options) {
  window.location.assign(href(screen, options));
}
