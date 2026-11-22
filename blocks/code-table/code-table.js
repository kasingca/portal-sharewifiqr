import screenContext from '../../scripts/app/context.js';
import { listCodes, scanTotal } from '../../scripts/app/api.js';
import { href } from '../../scripts/app/route.js';
import {
  esc, html, icon, number, readConfig, rowLinks,
} from '../../scripts/app/ui.js';

/**
 * code-table block: the customer's Wi-Fi QR codes.
 * Config: `heading`, `description`, `limit` (rows shown), `view-all` (button label).
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable) return;
  const codes = await listCodes(ctx.owner);
  const shown = cfg.limit ? codes.slice(0, Number(cfg.limit)) : codes;

  const card = html('<section class="card table-card"></section>');
  if (cfg.heading) {
    card.append(html(`<div class="card-heading"><div><h2>${esc(cfg.heading)}</h2>${cfg.description ? `<p>${esc(cfg.description)}</p>` : ''}</div>${cfg['view-all'] ? `<a class="button secondary" href="${esc(href('codes'))}">${esc(cfg['view-all'])} ${icon('arrow-right', 16)}</a>` : ''}</div>`));
  }

  if (!shown.length) {
    const empty = html(`<div class="empty">${icon('qr-code', 30)}<h3>No Wi-Fi QR codes yet</h3><p>Create a code to start sharing a network.</p><button class="button primary">${icon('plus', 17)} Create QR code</button></div>`);
    empty.querySelector('button').addEventListener('click', async () => (await import('../../scripts/app/code-editor.js')).default({ customer: ctx.owner }));
    card.append(empty);
  } else {
    const table = html(`<div class="table-scroll"><table><thead><tr><th>QR code</th><th>Security</th><th>Total scans</th><th>Created</th><th><span class="sr-only">Details</span></th></tr></thead>
      <tbody>${shown.map((code) => `<tr><td><div class="identity"><span class="tile ${esc(code.color)}">${icon('qr-code', 19)}</span><div><a class="text-link table-name" href="${esc(href('detail', { id: code.id }))}">${esc(code.name)}</a><small>${esc(code.network)}</small></div></div></td><td>${esc(code.security)}</td><td class="numeric">${number.format(scanTotal(code))}</td><td>${esc(code.created)}</td><td>${icon('chevron-right', 17)}</td></tr>`).join('')}</tbody></table></div>`);
    rowLinks(table);
    card.append(table);
  }
  block.append(card);
}
