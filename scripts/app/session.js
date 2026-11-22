/*
 * Session check for the signed-in workspaces (`/customer…`, `/admin…`). Runs before any
 * dashboard content renders. The API's destination decides the workspace; the API still
 * authorizes every protected operation.
 */
import { getMetadata } from '../aem.js';

const ME = 'https://api.sharewifiqr.com/v1/me';
const DESTINATIONS = ['/customer', '/admin'];

/** The workspace root of the current path ('/customer' | '/admin'), or null. */
function workspace() {
  const root = `/${window.location.pathname.split('/')[1]}`;
  return DESTINATIONS.includes(root) ? root : null;
}

/**
 * Checks the session when the page belongs to a workspace.
 * @returns {Promise<boolean>} true when the page may render
 */
export default async function checkSession() {
  const root = workspace();
  if (!root || getMetadata('signed-out') === 'true') return true;

  const status = document.createElement('p');
  status.className = 'session-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Checking your session…';
  document.body.prepend(status);
  document.body.classList.add('appear', 'session-pending');
  const fail = () => {
    status.textContent = 'We couldn’t check your session. Refresh to try again.';
    return false;
  };

  let response;
  try {
    response = await fetch(ME, { credentials: 'include', cache: 'no-store' });
  } catch {
    return fail();
  }
  if (response.status === 401) {
    window.location.replace('/');
    return false;
  }
  if (response.status !== 200) return fail();

  let destination;
  try {
    ({ destination } = await response.json());
  } catch {
    return fail();
  }
  if (!DESTINATIONS.includes(destination)) return fail();

  // an administrator viewing a customer workspace (`/customer…?as=<id>`) stays on it
  const viewingAs = destination === '/admin' && root === '/customer'
    && new URLSearchParams(window.location.search).has('as');
  if (destination !== root && !viewingAs) {
    window.location.replace(destination);
    return false;
  }

  status.remove();
  document.body.classList.remove('session-pending');
  return true;
}
