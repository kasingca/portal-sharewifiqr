import screenContext from '../../scripts/app/context.js';
import { href } from '../../scripts/app/route.js';
import {
  esc, fill, html, icon, number, readConfig,
} from '../../scripts/app/ui.js';
import { plans, scanTotal } from '../../scripts/app/api.js';

/** Back links: `back | codes` → "Wi-Fi QR codes" … */
const BACK = { codes: 'Wi-Fi QR codes', customers: 'Customers' };

/**
 * Actions an author can place in the header (`action | <key> [| <label>]`).
 * Each returns the button/link markup and an optional click handler.
 */
const ACTIONS = {
  'create-code': (label, ctx) => ({
    markup: `<button class="button primary">${icon('plus', 19)} ${esc(label || 'Create QR code')}</button>`,
    onClick: async () => (await import('../../scripts/app/code-editor.js')).default({ customer: ctx.owner }),
  }),
  'edit-code': (label, ctx) => ({
    markup: `<button class="button primary">${esc(label || 'Edit network')}</button>`,
    onClick: async () => (await import('../../scripts/app/code-editor.js')).default({ customer: ctx.owner, code: ctx.code }),
  }),
  'manage-payment': (label) => ({
    markup: `<a class="button secondary" href="${esc(`${href('profile')}#payment-method-title`)}">${icon('credit-card', 17)} ${esc(label || 'Manage payment method')}</a>`,
  }),
  'view-as-customer': (label, ctx) => ({
    markup: `<a class="button primary" href="${esc(href('overview', { role: 'customer', impersonating: ctx.account.customer.id }))}">${icon('eye', 17)} ${esc(label || 'View as customer')}</a>`,
  }),
};

/** Values available to `{token}` placeholders in title and description. */
function tokens(ctx) {
  const values = {};
  if (ctx.code) {
    Object.assign(values, {
      name: ctx.code.name,
      created: ctx.code.created,
      scans: number.format(scanTotal(ctx.code)),
    });
  }
  if (ctx.account) {
    const { customer } = ctx.account;
    const plan = ctx.accountBilling?.current;
    Object.assign(values, {
      name: `${customer.first} ${customer.last}`,
      email: customer.email,
      joined: customer.joined,
      plan: plan ? ` · ${plan.name} plan ($${plan.price} ${plan.interval})` : '',
    });
  }
  return values;
}

/**
 * page-header block: the screen title row.
 * Config rows: `title`, `description`, `admin-description` (used in the admin
 * workspace), `action | <key> [| label]`, `back | codes|customers`.
 * @param {Element} block
 */
export default async function decorate(block) {
  const actionRow = [...block.children].find((row) => row.firstElementChild?.textContent.trim().toLowerCase() === 'action');
  const actionLabel = actionRow?.children[2]?.textContent.trim();
  const cfg = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';

  if (ctx.unavailable) {
    const fallback = ctx.route.role === 'admin' && !ctx.route.impersonating
      ? ['customers', 'customers'] : ['codes', 'Wi-Fi QR codes'];
    block.append(html(`<section class="card empty"><h1>Page unavailable</h1><p>This record is unavailable in this demo browser.</p><a class="button secondary" href="${esc(href(fallback[0]))}">Return to ${fallback[1]}</a></section>`));
    document.body.classList.add('screen-unavailable');
    return;
  }

  const values = tokens(ctx);
  const description = (ctx.session.adminView && cfg['admin-description']) || cfg.description;
  const scheduled = ctx.accountBilling?.pending;
  const action = ACTIONS[cfg.action]?.(actionLabel, ctx);

  if (cfg.back && BACK[cfg.back]) {
    block.append(html(`<a class="back" href="${esc(href(cfg.back))}">${icon('arrow-left', 16)} ${BACK[cfg.back]}</a>`));
  }
  const heading = html(`<div class="page-heading${cfg.action === 'manage-payment' ? ' wrap-mobile' : ''}"><div><h1>${esc(fill(cfg.title, values))}</h1>${description ? `<p>${esc(fill(description, values))}</p>` : ''}${scheduled ? `<p>Scheduled plan: ${esc(plans[scheduled.plan].name)} starting ${esc(scheduled.month)}</p>` : ''}</div>${action ? action.markup : ''}</div>`);
  if (action?.onClick) heading.querySelector('.button').addEventListener('click', action.onClick);
  block.append(heading);
}
