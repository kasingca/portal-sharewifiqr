import screenContext from '../../scripts/app/context.js';
import { getBilling, savePaymentMethod } from '../../scripts/app/api.js';
import {
  esc, html, icon, readConfig, toast,
} from '../../scripts/app/ui.js';

const PROVIDERS = [
  ['Stripe', 'Pay by card through Stripe', 'credit-card'],
  ['PayPal', 'Pay through your PayPal account', 'wallet'],
];

/**
 * payment-method block: choose the payment provider (customers only).
 * Config: `heading`, `description`.
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable || ctx.session.adminView) return;
  const { method } = await getBilling(ctx.owner);

  const card = html(`<section class="card profile-card payment-card" aria-labelledby="payment-method-title">
    <h2 id="payment-method-title">${esc(cfg.heading || 'Payment method')}</h2>
    ${cfg.description ? `<p>${esc(cfg.description)}</p>` : ''}
    <form><fieldset class="provider-options"><legend class="sr-only">Payment provider</legend>
      ${PROVIDERS.map(([name, description, iconName]) => `<label class="provider-option"><input type="radio" name="provider" value="${name}"${name === method ? ' checked' : ''}><span class="tile violet">${icon(iconName, 19)}</span><span>${name}<small>${description}</small></span></label>`).join('')}
    </fieldset><button class="button primary">Save payment method</button></form>
  </section>`);
  const form = card.querySelector('form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await savePaymentMethod(ctx.owner, form.provider.value);
    toast('Payment method saved');
  });
  block.append(card);
  if (window.location.hash === '#payment-method-title') card.scrollIntoView();
}
