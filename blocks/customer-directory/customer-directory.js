import screenContext from '../../scripts/app/context.js';
import { listCustomers } from '../../scripts/app/api.js';
import { href } from '../../scripts/app/route.js';
import {
  avatar, badge, esc, html, icon, readConfig, rowLinks,
} from '../../scripts/app/ui.js';

const DEFAULT_FILTERS = {
  query: '', status: 'all', activity: 'all', from: '', to: '', sort: 'newest',
};

const select = (name, label, options) => `<label>${label}<select name="${name}">${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;

/**
 * customer-directory block: searchable, filterable list of customer accounts (admin).
 * Config: `heading`, `description`.
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable) return;
  let filters = { ...DEFAULT_FILTERS };

  const card = html(`<section class="card table-card">
    <div class="card-heading"><div><h2>${esc(cfg.heading || 'Customer directory')}</h2>${cfg.description ? `<p>${esc(cfg.description)}</p>` : ''}</div></div>
    <form class="directory-filters" role="search">
      <div class="directory-search">
        <label>Search customers<span class="search">${icon('search', 17)}<input type="search" name="query" placeholder="Name or email"></span></label>
        ${select('sort', 'Sort by', [['newest', 'Newest accounts'], ['oldest', 'Oldest accounts'], ['name', 'Last name A–Z'], ['codes', 'Most QR codes']])}
      </div>
      <div class="directory-filter-grid">
        ${select('status', 'Account status', [['all', 'All statuses'], ['active', 'Active'], ['paused', 'Paused']])}
        ${select('activity', 'QR code activity', [['all', 'All activity'], ['with', 'Has QR codes'], ['without', 'No QR codes']])}
        <label>Joined from<input type="date" name="from"></label>
        <label>Joined through<input type="date" name="to"></label>
      </div>
      <div class="directory-results"><span role="status"></span><button type="button" class="button secondary">Reset filters</button></div>
    </form>
    <div class="directory-list"></div>
  </section>`);
  const form = card.querySelector('form');
  const list = card.querySelector('.directory-list');
  const status = card.querySelector('.directory-results [role="status"]');

  async function render() {
    const { records, total } = await listCustomers(filters);
    status.textContent = `Showing ${records.length} of ${total} customers`;
    if (!records.length) {
      const invalid = filters.from && filters.to && filters.from > filters.to;
      list.innerHTML = `<div class="empty"><p>${invalid ? 'The end date must be on or after the start date.' : 'No customers match these filters.'}</p></div>`;
      return;
    }
    list.innerHTML = `<div class="table-scroll"><table><thead><tr><th>Customer</th><th>Status</th><th>Plan</th><th>QR codes</th><th>Joined</th><th><span class="sr-only">Details</span></th></tr></thead>
      <tbody>${records.map((c) => `<tr><td><div class="identity">${avatar(c)}<div><a class="text-link table-name" href="${esc(href('account', { id: c.id }))}">${esc(`${c.first} ${c.last}`)}</a><small>${esc(c.email)}</small></div></div></td><td>${badge(c.paused ? 'Paused' : 'Active', c.paused)}</td><td>${esc(c.planName)}</td><td class="numeric">${c.codeCount}</td><td>${esc(c.joined)}</td><td>${icon('chevron-right', 17)}</td></tr>`).join('')}</tbody></table></div>`;
    rowLinks(list);
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', (event) => {
    filters = { ...filters, [event.target.name]: event.target.value };
    render();
  });
  form.querySelector('.directory-results button').addEventListener('click', () => {
    form.reset();
    filters = { ...DEFAULT_FILTERS };
    render();
  });
  await render();
  block.append(card);
}
