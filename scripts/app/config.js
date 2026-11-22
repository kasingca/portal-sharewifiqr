import { getMetadata } from '../aem.js';

/**
 * App configuration. Every value comes from page metadata, which authors set once
 * in the root bulk-metadata sheet (`/metadata`) rather than on individual pages.
 *
 * | metadata key | example                          | meaning                                   |
 * |--------------|----------------------------------|-------------------------------------------|
 * | persona      | customer \| admin                | which workspace this page belongs to      |
 * | nav          | /customer/nav                    | sidebar navigation fragment               |
 * | footer       | /customer/footer                 | footer fragment                           |
 * | api-mode     | mock \| live                     | mock = in-browser demo data               |
 * | api-base     | https://api.sharewifiqr.com      | REST origin used when api-mode is live    |
 * | demo-mode    | true                             | shows the "Demo mode" pill                |
 * | screen       | overview                         | screen key (breadcrumb, active nav item)  |
 * | breadcrumb   | Overview                         | breadcrumb label                          |
 * | signed-out   | true                             | page is reachable without a session       |
 */
const DEFAULTS = {
  'api-mode': 'mock',
  'api-base': 'https://api.sharewifiqr.com',
  'demo-mode': 'true',
};

export function config(key) {
  return getMetadata(key) || DEFAULTS[key] || '';
}

export const persona = () => {
  const value = getMetadata('persona') || window.location.pathname.split('/')[1];
  return value === 'admin' ? 'admin' : 'customer';
};
export const apiMode = () => (config('api-mode') === 'live' ? 'live' : 'mock');
export const apiBase = () => config('api-base').replace(/\/$/, '');
export const demoMode = () => config('demo-mode') !== 'false';
