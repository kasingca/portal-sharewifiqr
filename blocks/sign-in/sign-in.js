import screenContext from '../../scripts/app/context.js';
import { href } from '../../scripts/app/route.js';
import {
  esc, html, icon, readConfig, toast,
} from '../../scripts/app/ui.js';

/**
 * sign-in block: the demo sign-in card.
 * Config: `title`, `description`, `button`, `icon` (lucide name).
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  const ctx = await screenContext();
  const admin = ctx.route.persona === 'admin';
  block.textContent = '';
  const card = html(`<div class="signin"><section class="card"><span class="tile violet">${icon(cfg.icon || (admin ? 'shield-check' : 'wifi'), 23)}</span>
    <h1>${esc(cfg.title)}</h1><p>${esc(cfg.description)}</p>
    <button class="button primary">${esc(cfg.button)} ${icon('arrow-right', 17)}</button></section></div>`);
  card.querySelector('button').addEventListener('click', () => {
    if (!admin && ctx.session.customer.paused) {
      toast('This account is paused.');
      return;
    }
    window.location.replace(href(admin ? 'customers' : 'overview', { role: ctx.route.persona }));
  });
  block.append(card);
}
