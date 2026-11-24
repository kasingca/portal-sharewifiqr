import { getPaymentMethod, getSignedInProfile, savePaymentMethod } from '../../scripts/app/api.js';
import {
  esc, html, icon, readConfig, toast,
} from '../../scripts/app/ui.js';

const PROVIDERS = [
  ['stripe', 'Stripe', 'Pay by card through Stripe', 'credit-card'],
  ['paypal', 'PayPal', 'Pay through your PayPal account', 'wallet'],
];

/**
 * payment-method block: choose the payment provider (customers only).
 * Config: `heading`.
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  block.textContent = '';
  if (getSignedInProfile()?.role !== 'customer') return;

  const card = html(`<section class="card profile-card payment-card" aria-labelledby="payment-method-title">
    <h2 id="payment-method-title">${esc(cfg.heading || 'Payment method')}</h2>
    <p>Choose how you’d like to pay for your subscription.</p>
    <p role="status">Loading your payment method…</p>
    <form><fieldset class="provider-options" disabled><legend class="sr-only">Payment provider</legend>
      ${PROVIDERS.map(([value, name, description, iconName]) => `<label class="provider-option"><input type="radio" name="provider" value="${value}"><span class="tile violet">${icon(iconName, 19)}</span><span>${name}<small>${description}</small></span></label>`).join('')}
    </fieldset><button class="button primary" disabled>Save payment method</button></form>
  </section>`);
  const form = card.querySelector('form');
  const options = form.querySelector('fieldset');
  const save = form.querySelector('button');
  const status = card.querySelector('[role="status"]');
  const { provider } = form.elements;
  form.addEventListener('change', () => { save.disabled = !provider.value; });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (save.disabled || !provider.value) return;
    options.disabled = true;
    save.disabled = true;
    try {
      provider.value = (await savePaymentMethod(provider.value)) ?? '';
      toast('Payment method saved');
    } catch {
      toast('We couldn’t save your payment method. Try again.');
    } finally {
      options.disabled = false;
      save.disabled = !provider.value;
    }
  });
  block.append(card);
  try {
    provider.value = (await getPaymentMethod()) ?? '';
    options.disabled = false;
    save.disabled = !provider.value;
    status.remove();
  } catch {
    status.textContent = 'We couldn’t load your payment method. Refresh to try again.';
  }
  if (window.location.hash === '#payment-method-title') card.scrollIntoView();
}
