/*
 * The one data boundary of the portal. Blocks never read data any other way.
 *
 * api-mode=mock (today): served from scripts/app/mock.js, persisted in this browser.
 * api-mode=live (later): each call below maps to the REST route in its comment on
 * `api-base` (https://api.sharewifiqr.com). Swap a call's mock branch for `request()`
 * when its endpoint ships; the block code does not change.
 */
import { apiBase, apiMode } from './config.js';
import {
  getAuthenticatedSession, loadAuthenticatedSession, redirectIfSignedOut,
} from './session.js';
import {
  billingMonth, customerDirectory, customerIds, demoAdmin, load, monthlyPayments, planAt,
  plans, save, scanTotal, schedulePlanChange,
} from './mock.js';

export { plans, scanTotal };

const live = () => apiMode() === 'live';

async function request(method, path, body) {
  const response = await fetch(`${apiBase()}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`${method} ${path} failed: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

async function sessionRequest(method, path, body) {
  const headers = {};
  if (body) {
    const token = getAuthenticatedSession()?.csrfToken;
    if (!token) throw new Error('Missing session token');
    headers['Content-Type'] = 'application/json';
    headers['X-CSRF-Token'] = token;
  }
  const response = await fetch(`${apiBase()}${path}`, {
    method,
    credentials: 'include',
    cache: 'no-store',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (redirectIfSignedOut(response) || !response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function mutate(change) {
  const data = load();
  const result = change(data);
  save(data);
  return result;
}

/** GET /session?persona=&customer=&as= */
export async function getSession(route) {
  if (live()) return request('GET', `/session?${new URLSearchParams({ persona: route.persona, customer: route.customerId || '', as: route.impersonating || '' })}`);
  const data = load();
  const matched = data.customers.find((item) => (route.impersonating
    ? item.id === route.impersonating
    : customerIds[item.id] === (route.customerId || customerIds.maya)));
  const customer = matched || data.customers[0];
  const adminView = route.role === 'admin' && !route.impersonating;
  const paused = route.role === 'customer' && Boolean(matched?.paused);
  return {
    role: route.role,
    adminView,
    impersonating: route.impersonating,
    customer,
    customerKnown: Boolean(matched),
    publicId: customerIds[customer.id],
    admin: data.admin || demoAdmin,
    profile: adminView ? data.admin || demoAdmin : customer,
    paused,
    signedIn: !route.signedOut && !paused,
  };
}

/** GET /customers/{customer}/codes */
export async function listCodes(customer) {
  if (live()) return request('GET', `/customers/${customer}/codes`);
  return load().codes.filter((code) => code.owner === customer);
}

/** GET /customers/{customer}/codes/{id} */
export async function getCode(customer, id) {
  if (live()) return request('GET', `/customers/${customer}/codes/${id}`);
  return load().codes.find((code) => code.owner === customer && code.id === id) || null;
}

/** POST /customers/{customer}/codes  ·  PATCH /customers/{customer}/codes/{id} */
export async function saveCode(customer, fields, id) {
  if (live()) {
    return id
      ? request('PATCH', `/customers/${customer}/codes/${id}`, fields)
      : request('POST', `/customers/${customer}/codes`, fields);
  }
  return mutate((data) => {
    if (id) {
      const index = data.codes.findIndex((item) => item.id === id);
      data.codes[index] = { ...data.codes[index], ...fields };
      return data.codes[index];
    }
    const code = {
      ...fields,
      id: crypto.randomUUID(),
      owner: customer,
      color: 'violet',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      scans: Array(8).fill(0),
    };
    data.codes.unshift(code);
    return code;
  });
}

/** Public scan URL encoded in a QR code. */
export function scanLink(code) {
  return `${apiBase()}/${customerIds[code.owner] || code.owner}/q/${encodeURIComponent(code.id)}`;
}

/** GET /admin/customers */
export async function listCustomers(filters) {
  if (live()) return request('GET', `/admin/customers?${new URLSearchParams(filters)}`);
  const data = load();
  const month = billingMonth();
  return {
    records: customerDirectory(data.customers, data.codes, filters)
      .map((record) => ({ ...record, planName: planAt(record, month).name })),
    total: data.customers.length,
    active: data.customers.filter((item) => !item.paused).length,
    codes: data.codes.length,
  };
}

/** GET /admin/customers/{id} */
export async function getCustomer(id) {
  if (live()) return request('GET', `/admin/customers/${id}`);
  const data = load();
  const customer = data.customers.find((item) => item.id === id);
  if (!customer) return null;
  const codes = data.codes.filter((item) => item.owner === id);
  return { customer, codes, scans: codes.reduce((sum, item) => sum + scanTotal(item), 0) };
}

/** PATCH /admin/customers/{id}  ·  PATCH /me */
export async function updateCustomer(id, fields) {
  if (live()) return request('PATCH', `/admin/customers/${id}`, fields);
  return mutate((data) => {
    const index = data.customers.findIndex((item) => item.id === id);
    data.customers[index] = { ...data.customers[index], ...fields };
    return data.customers[index];
  });
}

export function getSignedInProfile() {
  return getAuthenticatedSession()?.actor;
}

export async function loadSignedInProfile() {
  return (await loadAuthenticatedSession())?.actor;
}

export async function saveSignedInProfile(names) {
  await sessionRequest('PATCH', '/v1/me', names);
  return loadSignedInProfile();
}

/** GET /customers/{customer}/billing */
export async function getBilling(customer) {
  if (live()) return request('GET', `/customers/${customer}/billing`);
  const record = load().customers.find((item) => item.id === customer);
  const month = billingMonth();
  const payments = monthlyPayments(record, month);
  return {
    month,
    current: planAt(record, month),
    pending: record.planChanges?.find((change) => change.month > month) || null,
    payments,
    lastPayment: payments.find((payment) => payment.status === 'Paid') || null,
    method: record.paymentMethod || (record.id === 'alex' ? 'PayPal' : 'Stripe'),
  };
}

/** POST /customers/{customer}/billing/plan-changes */
export async function schedulePlan(customer, planId) {
  if (live()) return request('POST', `/customers/${customer}/billing/plan-changes`, { plan: planId });
  const month = billingMonth();
  return mutate((data) => {
    const record = data.customers.find((item) => item.id === customer);
    const isCurrent = planAt(record, month).id === planId;
    record.planChanges = schedulePlanChange(record, planId, month);
    return { canceled: isCurrent };
  });
}

function paymentMethodPath() {
  const { actor, effectiveCustomer } = getAuthenticatedSession() || {};
  if (actor?.role !== 'customer' || !effectiveCustomer?.publicId) {
    throw new Error('No signed-in customer');
  }
  return `/v1/customers/${encodeURIComponent(effectiveCustomer.publicId)}/payment-method`;
}

function readProvider({ paymentMethod }) {
  if (paymentMethod === null) return null;
  const { provider } = paymentMethod || {};
  if (provider !== 'stripe' && provider !== 'paypal') throw new Error('Invalid payment method');
  return provider;
}

export async function getPaymentMethod() {
  return readProvider(await sessionRequest('GET', paymentMethodPath()));
}

export async function savePaymentMethod(provider) {
  return readProvider(await sessionRequest('PUT', paymentMethodPath(), { provider }));
}
