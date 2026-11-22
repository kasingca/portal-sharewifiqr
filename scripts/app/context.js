import {
  getBilling, getCode, getCustomer, getSession,
} from './api.js';
import { readRoute } from './route.js';

let pending;

/**
 * The resolved screen context, shared by every block on the page (fetched once).
 * @returns {Promise<{route: object, session: object, owner: string,
 *   code: object|null, account: object|null, accountBilling: object|null,
 *   unavailable: boolean}>}
 */
export default function screenContext() {
  pending ??= (async () => {
    const route = readRoute();
    const session = await getSession(route);
    const owner = session.customer.id;
    const code = route.screen === 'detail' && route.id ? await getCode(owner, route.id) : null;
    const account = route.screen === 'account' && route.id ? await getCustomer(route.id) : null;
    const accountBilling = account ? await getBilling(account.customer.id) : null;
    const unavailable = (!session.adminView && !session.customerKnown)
      || (route.screen === 'account' && !account)
      || (route.screen === 'detail' && !code);
    return {
      route, session, owner, code, account, accountBilling, unavailable,
    };
  })();
  return pending;
}
