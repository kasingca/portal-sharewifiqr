import icon from './icons.js';

export { icon };

export const number = new Intl.NumberFormat('en-US');
export const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});
export const displayDate = (date) => dateFormat.format(new Date(date));

const ESCAPES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Parses an HTML string into a single element (or a fragment for several). */
export function html(markup) {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  const { content } = template;
  return content.childElementCount === 1 ? content.firstElementChild : content;
}

/**
 * Reads a block's authored configuration rows (`key | value`) into an object.
 * Keys are lower-cased and hyphenated.
 */
export function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [key, value] = row.children;
    if (!key) return;
    const name = key.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    if (name) config[name] = value ? value.textContent.trim() : '';
  });
  return config;
}

/** Fills `{token}` placeholders from a values object. */
export const fill = (text, values) => String(text || '').replace(/\{(\w+)\}/g, (_, k) => values[k] ?? '');

export function avatar(person, extra = '') {
  return `<span class="avatar ${esc(person.color || 'violet')}${extra}">${esc(person.first[0])}${esc(person.last[0])}</span>`;
}

export function badge(text, muted = false) {
  return `<span class="badge${muted ? ' muted-badge' : ''}"><i></i>${esc(text)}</span>`;
}

let toastTimer;
/** Shows the app toast (one at a time, 3.5 s), like the source's `toast` state. */
export function toast(message) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const el = html(`<div class="toast" role="status"><span>${esc(message)}</span><button class="icon-button" aria-label="Dismiss notification">${icon('x', 16)}</button></div>`);
  el.querySelector('button').addEventListener('click', () => el.remove());
  document.body.append(el);
  toastTimer = setTimeout(() => el.remove(), 3500);
}

/** Toast that survives one navigation (shown by the next page's header). */
export function toastAfterNavigation(message) {
  try { sessionStorage.setItem('portal-toast', message); } catch { toast(message); }
}

export function flushPendingToast() {
  try {
    const message = sessionStorage.getItem('portal-toast');
    if (message) {
      sessionStorage.removeItem('portal-toast');
      toast(message);
    }
  } catch { /* ignore */ }
}

export async function copyText(text, done, fallback) {
  try {
    await navigator.clipboard.writeText(text);
    toast(done);
  } catch {
    toast(fallback);
  }
}

/** Makes a table row open its record, like the source's row `onClick`. */
export function rowLinks(table) {
  table.querySelectorAll('tbody tr').forEach((row) => {
    const link = row.querySelector('.table-name');
    if (link) row.addEventListener('click', (event) => { if (event.target !== link) link.click(); });
  });
}
