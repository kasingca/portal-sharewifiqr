import { esc, html } from '../../scripts/app/ui.js';

/** Reads `key | value` rows, keeping each value cell so links survive. */
function readRows(block) {
  const rows = {};
  [...block.children].forEach((row) => {
    const [key, value] = row.children;
    const name = key?.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    if (name && value) rows[name] = value;
  });
  return rows;
}

/** A button link from a `label | link` cell: the authored anchor, or a bare URL. */
function action(cell, fallbackLabel, variant) {
  if (!cell) return '';
  const link = cell.querySelector('a');
  const url = link ? link.href : cell.textContent.trim();
  if (!url) return '';
  const label = (link && link.textContent.trim() !== url ? link.textContent.trim() : '') || fallbackLabel;
  return `<a class="button ${variant}" href="${esc(url)}">${esc(label)}</a>`;
}

/**
 * entry block: the portal's signed-out entry page (title, description, Log in and Sign up).
 * Config: `title`, `description`, `log-in | <link>`, `sign-up | <link>`,
 * `sign-in-failed | <message>`.
 * The links are plain navigations: the API starts the Okta flow.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = readRows(block);
  const text = (key) => rows[key]?.textContent.trim() || '';
  const failed = new URLSearchParams(window.location.search).get('error') === 'sign_in_failed';
  const message = text('sign-in-failed') || 'We couldn’t complete sign-in. Please try again.';

  block.textContent = '';
  block.append(html(`<div class="entry-content">
      <h1>${esc(text('title'))}</h1>
      ${text('description') ? `<p class="entry-description">${esc(text('description'))}</p>` : ''}
      ${failed ? `<p class="entry-error" role="alert">${esc(message)}</p>` : ''}
      <div class="entry-actions">${action(rows['log-in'], 'Log in', 'primary')}${action(rows['sign-up'], 'Sign up', 'secondary')}</div>
    </div>`));
}
