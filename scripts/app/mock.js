/*
 * In-browser demo backend (api-mode=mock). Seed data and rules are ported verbatim from
 * the source app (app/data.js, billing-data.mjs, customer-directory.mjs). State persists
 * in localStorage under the same key the source uses.
 */

const STORE = 'sharewifiqr-demo-v1';

export const customerIds = Object.freeze({
  maya: 'b2693d9c2124f3ca9547b897794ac6a1',
  alex: '534b44a19bf18d20b71ecc4eb77c572f',
  jordan: 'd16d377af76c99d27093abc22244b342',
});

export const demoAdmin = {
  id: 'admin', first: 'Sam', last: 'Rivera', email: 'admin@example.com',
};

const initialCustomers = [
  {
    id: 'maya', first: 'Maya', last: 'Chen', email: 'maya@example.com', joined: 'Mar 12, 2026', paused: false, color: 'violet',
  },
  {
    id: 'alex', first: 'Alex', last: 'Morgan', email: 'alex@example.com', joined: 'Jun 8, 2026', paused: false, color: 'blue',
  },
  {
    id: 'jordan', first: 'Jordan', last: 'Lee', email: 'jordan@example.com', joined: 'Aug 24, 2026', paused: true, color: 'rose',
  },
];

const seed = (id, owner, name, network, color, created, scans, security = 'WPA/WPA2') => ({
  id, owner, name, network, color, created, scans, security, password: security === 'Open' ? '' : 'demo-guest-wifi',
});

const initialCodes = [
  seed('studio-guest', 'maya', 'Studio Guest Wi-Fi', 'Studio_Guest', 'violet', 'Oct 14, 2026', [44, 65, 53, 91, 77, 116, 130, 144]),
  seed('home-network', 'maya', 'Home Network', 'Maya_Home', 'blue', 'Oct 2, 2026', [15, 32, 23, 34, 28, 45, 55, 62]),
  seed('sunday-market', 'maya', 'Sunday Market', 'Market_WiFi', 'peach', 'Sep 21, 2026', [22, 28, 18, 45, 31, 39, 32, 44], 'Open'),
  seed('workshop', 'alex', 'Workshop Guest Wi-Fi', 'Workshop_Guest', 'blue', 'Oct 9, 2026', [9, 15, 12, 5, 36, 41, 38, 44]),
  seed('gallery', 'jordan', 'Gallery Wi-Fi', 'Gallery_Guest', 'peach', 'Sep 7, 2026', [11, 7, 13, 20, 14, 22, 30, 18]),
];

export const plans = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    description: 'For sharing your home network.',
    features: [
      'Unlimited direct codes',
      '1 tracked code with scan counts',
      '100 tracked scans a month',
      'All security types and hidden networks',
      'PNG download',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 1,
    interval: 'per month',
    description: 'For hosts who want to know their card is working.',
    features: [
      'Everything in Free',
      '10 tracked codes with scan counts',
      '1,000 tracked scans a month',
      'Edit network details without reprinting',
      'Print-ready PDF cards',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 6,
    interval: 'per month',
    description: 'For venues and multiple locations.',
    features: [
      'Everything in Plus',
      '50 tracked codes',
      '10,000 tracked scans a month',
      'Scan history for every location',
      'Priority email support',
    ],
  },
};

const samplePlanChanges = {
  maya: [{ month: '2025-04-01', plan: 'plus' }],
  alex: [{ month: '2025-04-01', plan: 'plus' }, { month: '2026-02-01', plan: 'business' }],
  jordan: [{ month: '2026-05-01', plan: 'plus' }, { month: '2026-11-01', plan: 'free' }],
};

export function scanTotal(code) {
  return code.scans.reduce((sum, value) => sum + value, 0);
}

export function billingMonth(date = new Date()) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1)).toISOString().slice(0, 10);
}

function shiftMonth(month, offset) {
  const [year, number] = month.split('-').map(Number);
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 10);
}

export function planAt(customer, month) {
  const changes = [...(samplePlanChanges[customer.id] || []), ...(customer.planChanges || [])];
  const change = changes.findLast((entry) => entry.month <= month);
  return plans[change?.plan] || plans.free;
}

export function schedulePlanChange(customer, planId, month) {
  const previous = (customer.planChanges || []).filter((change) => change.month <= month);
  if (planAt(customer, month).id === planId) return previous;
  return [...previous, { month: shiftMonth(month, 1), plan: planId }];
}

export function monthlyPayments(customer, month) {
  return Array.from({ length: 24 }, (_, offset) => {
    const date = shiftMonth(month, -offset);
    const plan = planAt(customer, date);
    let status = 'Paid';
    if (plan.price === 0) status = 'No charge';
    else if (customer.id === 'jordan' && date === '2026-10-01') status = 'Failed';
    let method = 'Stripe';
    if (plan.price === 0) method = '—';
    else if (customer.id === 'alex') method = 'PayPal';
    return {
      date, plan: plan.id, amount: plan.price, status, method,
    };
  });
}

const byName = new Intl.Collator('en', { sensitivity: 'base' });

function joinedDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const timestamp = Date.parse(`${value} UTC`);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : '';
}

export function customerDirectory(customers, codes, filters) {
  const counts = new Map();
  codes.forEach(({ owner }) => counts.set(owner, (counts.get(owner) ?? 0) + 1));
  const terms = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const records = customers
    .map((customer) => ({
      ...customer,
      codeCount: counts.get(customer.id) ?? 0,
      joinedOn: joinedDate(customer.joined),
    }))
    .filter((customer) => {
      const searchable = [customer.first, customer.last, customer.email].join(' ').toLowerCase();
      const status = customer.paused ? 'paused' : 'active';
      const activity = customer.codeCount ? 'with' : 'without';
      return terms.every((term) => searchable.includes(term))
        && (filters.status === 'all' || status === filters.status)
        && (filters.activity === 'all' || activity === filters.activity)
        && (!filters.from || customer.joinedOn >= filters.from)
        && (!filters.to || (customer.joinedOn && customer.joinedOn <= filters.to));
    });
  return records.sort((a, b) => {
    const newestFirst = b.joinedOn.localeCompare(a.joinedOn);
    switch (filters.sort) {
      case 'oldest': return -newestFirst;
      case 'name': return byName.compare(a.last, b.last) || byName.compare(a.first, b.first);
      case 'codes': return b.codeCount - a.codeCount || newestFirst;
      default: return newestFirst;
    }
  });
}

/* ---- persistence ---- */

function initial() {
  return { customers: structuredClone(initialCustomers), codes: structuredClone(initialCodes) };
}

export function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && Array.isArray(saved.customers) && Array.isArray(saved.codes)
      && saved.customers.some((item) => item.id === 'maya')) return saved;
  } catch { /* fall through to seed data */ }
  return initial();
}

export function save(data) {
  try { localStorage.setItem(STORE, JSON.stringify(data)); } catch { /* private mode */ }
}
