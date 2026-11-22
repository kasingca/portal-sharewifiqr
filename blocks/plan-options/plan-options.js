import screenContext from '../../scripts/app/context.js';
import { getBilling, plans, schedulePlan } from '../../scripts/app/api.js';
import {
  displayDate, esc, html, icon, readConfig, toast,
} from '../../scripts/app/ui.js';

function buttonLabel(plan, active, scheduled, pending) {
  if (scheduled) return 'Scheduled';
  if (active) return pending ? `Keep ${plan.name}` : 'Current plan';
  return `Choose ${plan.name}`;
}

/**
 * plan-options block: plan cards with schedule / keep actions.
 * Config: `heading`, `description`, `popular | <plan id>` (badge "Most popular").
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable) return;

  async function render() {
    const { current, pending } = await getBilling(ctx.owner);
    const panel = html(`<section class="card plan-panel" aria-labelledby="plan-options-title">
      <div class="card-heading"><div><h2 id="plan-options-title">${esc(cfg.heading || 'Plans and pricing')}</h2>${cfg.description ? `<p>${esc(cfg.description)}</p>` : ''}</div></div>
      ${pending ? `<p class="plan-scheduled" role="status"><strong>${esc(plans[pending.plan].name)}</strong> is scheduled for ${displayDate(pending.month)}.</p>` : ''}
      <div class="plan-grid">${Object.values(plans).map((plan) => {
    const active = plan.id === current.id;
    const scheduled = plan.id === pending?.plan;
    const disabled = scheduled || (active && !pending);
    return `<article class="plan-option${active ? ' current-plan' : ''}">
          <div class="plan-option-heading"><h3>${esc(plan.name)}</h3>${plan.id === (cfg.popular || 'plus') ? '<span class="plan-popular">Most popular</span>' : ''}</div>
          <p class="plan-price"><strong>$${plan.price}</strong> ${esc(plan.interval)}</p>
          <p>${esc(plan.description)}</p>
          <ul>${plan.features.map((feature) => `<li>${icon('check', 16)}${esc(feature)}</li>`).join('')}</ul>
          <button class="button ${active || scheduled ? 'secondary' : 'primary'}" data-plan="${plan.id}"${disabled ? ' disabled' : ''}>${esc(buttonLabel(plan, active, scheduled, pending))}</button>
        </article>`;
  }).join('')}</div>
    </section>`);
    panel.querySelectorAll('button[data-plan]').forEach((button) => button.addEventListener('click', async () => {
      const { canceled } = await schedulePlan(ctx.owner, button.dataset.plan);
      toast(canceled ? 'Scheduled change canceled' : 'Plan change scheduled');
      await render();
      // the stats row shows the plan too
      document.dispatchEvent(new CustomEvent('portal:billing-changed'));
    }));
    block.replaceChildren(panel);
  }
  await render();
}
