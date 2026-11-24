/*
 * Session check for the signed-in workspaces (`/customer…`, `/admin…`). Runs before any
 * dashboard content renders. The API's destination decides the workspace; the API still
 * authorizes every protected operation.
 */
import { getMetadata } from '../aem.js';
import { apiBase } from './config.js';

const DESTINATIONS = ['/customer', '/admin'];
const AEM_LIVE_ORIGIN = 'https://main--portal-sharewifiqr--kasingca.aem.live';
let session;

export function getAuthenticatedSession() {
  return session;
}

export function redirectIfSignedOut(response) {
  if (response.status !== 401) return false;
  session = undefined;
  if (window.location.origin !== AEM_LIVE_ORIGIN) window.location.replace('/');
  return true;
}

export async function loadAuthenticatedSession() {
  const response = await fetch(`${apiBase()}/v1/me`, { credentials: 'include', cache: 'no-store' });
  if (redirectIfSignedOut(response)) return null;
  if (response.status !== 200) throw new Error('Unable to load session');
  const data = await response.json();
  if (!DESTINATIONS.includes(data?.destination)) throw new Error('Invalid session destination');
  session = data;
  return session;
}

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
  if (window.location.origin === AEM_LIVE_ORIGIN) return true;
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

  let current;
  try {
    current = await loadAuthenticatedSession();
  } catch {
    return fail();
  }
  if (!current) return false;
  const { destination } = current;

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
