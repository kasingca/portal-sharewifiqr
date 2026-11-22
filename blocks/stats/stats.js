import screenContext from '../../scripts/app/context.js';
import {
  getBilling, listCodes, listCustomers, scanTotal, updateCustomer,
} from '../../scripts/app/api.js';
import {
  badge, currency, displayDate, esc, html, icon, number, readConfig, toast,
} from '../../scripts/app/ui.js';

const stat = ({
  label, value, note, iconName, color,
}) => `<div class="card stat"><span class="tile ${color}">${icon(iconName, 19)}</span><div class="stat-label">${esc(label)}</div><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`;

/** Each source returns the cards for one screen. */
const SOURCES = {
  async overview(ctx) {
    const codes = await listCodes(ctx.owner);
    const lastWeek = codes.reduce((sum, code) => sum + code.scans.at(-1), 0);
    return [
      {
        label: 'Total scans', value: number.format(codes.reduce((sum, code) => sum + scanTotal(code), 0)), note: 'Across all your Wi-Fi codes', iconName: 'smartphone', color: 'violet',
      },
      {
        label: 'Wi-Fi QR codes', value: number.format(codes.length), note: 'Codes in your workspace', iconName: 'qr-code', color: 'blue',
      },
      {
        label: 'Scans this week', value: number.format(lastWeek), note: 'Week of Nov 16 · demo data', iconName: 'activity', color: 'mint',
      },
    ].map(stat);
  },
  async customers() {
    const { total, active, codes } = await listCustomers({
      query: '', status: 'all', activity: 'all', from: '', to: '', sort: 'newest',
    });
    return [
      {
        label: 'Registered customers', value: number.format(total), note: 'All demo accounts', iconName: 'users-round', color: 'violet',
      },
      {
        label: 'Active accounts', value: number.format(active), note: 'Accounts in good standing', iconName: 'shield-check', color: 'mint',
      },
      {
        label: 'QR codes generated', value: number.format(codes), note: 'Across all customer accounts', iconName: 'qr-code', color: 'blue',
      },
    ].map(stat);
  },
  async account(ctx, block) {
    const { customer, codes, scans } = ctx.account;
    const access = html(`<div class="card stat"><span class="tile mint">${icon('shield-check', 19)}</span><div class="stat-label">Account access ${badge(customer.paused ? 'Paused' : 'Active', customer.paused)}</div><button class="button secondary">${customer.paused ? 'Resume account' : 'Pause account'}</button></div>`);
    access.querySelector('button').addEventListener('click', async () => {
      await updateCustomer(customer.id, { paused: !customer.paused });
      toast(customer.paused ? 'Account resumed' : 'Account paused');
      customer.paused = !customer.paused;
      // eslint-disable-next-line no-use-before-define
      await render(block, 'account', ctx);
    });
    return [
      stat({
        label: 'QR codes generated', value: number.format(codes.length), note: 'In this customer’s workspace', iconName: 'qr-code', color: 'violet',
      }),
      stat({
        label: 'Total scans', value: number.format(scans), note: 'Across this customer’s codes', iconName: 'bar-chart-3', color: 'blue',
      }),
      access,
    ];
  },
  async billing(ctx) {
    const { current, method, lastPayment } = await getBilling(ctx.owner);
    return [
      {
        label: 'Current plan', value: current.name, note: `${currency.format(current.price)} ${current.interval}`, iconName: 'wallet', color: 'violet',
      },
      {
        label: 'Payment method', value: method, note: 'Selected for future payments', iconName: 'credit-card', color: 'blue',
      },
      {
        label: 'Last successful payment',
        value: lastPayment ? currency.format(lastPayment.amount) : '—',
        note: lastPayment ? `${displayDate(lastPayment.date)} · USD` : 'No paid months in this history',
        iconName: 'calendar-days',
        color: 'mint',
      },
    ].map(stat);
  },
};

async function render(block, source, ctx) {
  const cards = await SOURCES[source](ctx, block);
  const grid = html(`<div class="stats-grid${source === 'billing' ? ' billing' : ''}"></div>`);
  cards.forEach((card) => grid.append(typeof card === 'string' ? html(card) : card));
  block.replaceChildren(grid);
}

/**
 * stats block: a row of stat cards.
 * Config: `source | overview | customers | account | billing`.
 * @param {Element} block
 */
export default async function decorate(block) {
  const { source = 'overview' } = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable || !SOURCES[source]) return;
  await render(block, source, ctx);
  if (source === 'billing') {
    document.addEventListener('portal:billing-changed', () => render(block, source, ctx));
  }
}
