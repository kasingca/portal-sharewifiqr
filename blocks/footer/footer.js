import { config, persona } from '../../scripts/app/config.js';
import { href } from '../../scripts/app/route.js';
import { esc, html } from '../../scripts/app/ui.js';

/**
 * Footer block: the portal footer line. Reads the footer document (`footer` metadata,
 * default `/<persona>/footer`): its first paragraph is the label, its links the legal
 * pages. A link to `…/terms` or `…/privacy` resolves to that screen in the current
 * workspace context (customer, admin, or admin viewing a customer).
 * @param {Element} block
 */
export default async function decorate(block) {
  const path = config('footer') || `/${persona()}/footer`;
  const resp = await fetch(`${path}.plain.html`);
  const doc = html(`<div>${resp.ok ? await resp.text() : ''}</div>`);
  const label = doc.querySelector('p')?.textContent.trim() || 'ShareWiFiQR Portal';
  const links = [...doc.querySelectorAll('a')].map((a) => {
    const screen = new URL(a.href, window.location).pathname.split('/').pop();
    const target = ['terms', 'privacy'].includes(screen) ? href(screen) : a.getAttribute('href');
    return `<a href="${esc(target)}">${esc(a.textContent.trim())}</a>`;
  });
  block.textContent = '';
  block.append(html(`<div class="footer-line"><span>${esc(label)}</span><div>${links.join('')}</div></div>`));
}
