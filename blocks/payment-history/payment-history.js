import screenContext from '../../scripts/app/context.js';
import { getBilling, plans } from '../../scripts/app/api.js';
import {
  currency, displayDate, esc, html, icon, readConfig,
} from '../../scripts/app/ui.js';

const PAGE_SIZES = [20, 50, 100, 250, 500];

/**
 * payment-history block: monthly payments with date filters and pagination.
 * Config: `heading`, `description`. On the admin account screen it shows the
 * customer in `?id=`; elsewhere the signed-in customer.
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable) return;
  const { payments } = ctx.accountBilling || await getBilling(ctx.owner);
  const state = {
    from: '', to: '', page: 1, pageSize: 20,
  };

  const card = html(`<section class="card table-card">
    <div class="card-heading"><div><h2>${esc(cfg.heading || 'Payment history')}</h2>${cfg.description ? `<p>${esc(cfg.description)}</p>` : ''}</div></div>
    <div class="date-filters" role="group" aria-label="Filter payments by date">
      <label>From date<input type="date" name="from"></label>
      <label>To date<input type="date" name="to"></label>
      <div class="date-presets">
        <button class="button secondary" data-from="${payments[2].date}">Last 3 months</button>
        <button class="button secondary" data-from="${payments[11].date}">Last 12 months</button>
        <button class="button secondary" data-from="">Clear dates</button>
      </div>
    </div>
    <div class="payments"></div>
    <div class="billing-pagination">
      <span role="status"></span>
      <div class="pagination-controls">
        <label>Rows per page <select>${PAGE_SIZES.map((size) => `<option>${size}</option>`).join('')}</select></label>
        <button class="icon-button" aria-label="Previous page">${icon('chevron-left', 18)}</button>
        <span class="page-of"></span>
        <button class="icon-button" aria-label="Next page">${icon('chevron-right', 18)}</button>
      </div>
    </div>
  </section>`);

  const [fromInput, toInput] = card.querySelectorAll('.date-filters input');
  const list = card.querySelector('.payments');
  const status = card.querySelector('.billing-pagination [role="status"]');
  const [prev, next] = card.querySelectorAll('.pagination-controls .icon-button');

  function render() {
    const { from, to, pageSize } = state;
    const matches = payments.filter(({ date }) => (!from || date >= from) && (!to || date <= to));
    const pages = Math.max(1, Math.ceil(matches.length / pageSize));
    const start = (state.page - 1) * pageSize;
    const rows = matches.slice(start, start + pageSize);
    fromInput.value = from;
    toInput.value = to;
    list.innerHTML = rows.length
      ? `<div class="table-scroll"><table><thead><tr><th scope="col">Billing month</th><th scope="col">Plan</th><th scope="col">Method</th><th scope="col">Amount (USD)</th><th scope="col">Status</th></tr></thead>
        <tbody>${rows.map((p) => `<tr><td class="numeric">${displayDate(p.date)}</td><td>${esc(plans[p.plan].name)}</td><td>${esc(p.method)}</td><td class="numeric">${currency.format(p.amount)}</td><td><span class="badge${p.status === 'Paid' ? '' : ' muted-badge'}"><i></i>${esc(p.status)}</span></td></tr>`).join('')}</tbody></table></div>`
      : `<div class="empty"><p>${from && to && from > to ? 'The end date must be on or after the start date.' : 'No payments match these dates.'}</p></div>`;
    status.textContent = matches.length
      ? `Showing ${start + 1}–${start + rows.length} of ${matches.length} payments` : '0 payments';
    card.querySelector('.page-of').textContent = `Page ${state.page} of ${pages}`;
    prev.disabled = state.page <= 1;
    next.disabled = state.page >= pages;
  }

  function setRange(from, to) {
    Object.assign(state, { from, to, page: 1 });
    render();
  }

  fromInput.addEventListener('change', () => setRange(fromInput.value, state.to));
  toInput.addEventListener('change', () => setRange(state.from, toInput.value));
  card.querySelectorAll('.date-presets button').forEach((button) => button.addEventListener('click', () => setRange(button.dataset.from, '')));
  card.querySelector('.pagination-controls select').addEventListener('change', (event) => {
    Object.assign(state, { pageSize: Number(event.target.value), page: 1 });
    render();
  });
  prev.addEventListener('click', () => { state.page -= 1; render(); });
  next.addEventListener('click', () => { state.page += 1; render(); });

  render();
  block.append(card);
}
