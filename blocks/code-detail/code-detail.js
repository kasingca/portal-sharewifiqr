import screenContext from '../../scripts/app/context.js';
import { scanLink } from '../../scripts/app/api.js';
import {
  copyText, esc, html, icon,
} from '../../scripts/app/ui.js';

async function qrDataUrl(link) {
  try {
    const { default: QRCode } = await import('../../scripts/vendor/qrcode.min.js');
    return await QRCode.toDataURL(link, { width: 480, margin: 4 });
  } catch {
    return '';
  }
}

/**
 * code-detail block: share panel (QR image, Download PNG, Copy link) and network
 * settings for the code in `?id=`. No configuration.
 * @param {Element} block
 */
export default async function decorate(block) {
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable || !ctx.code) return;
  const { code } = ctx;
  const link = scanLink(code);
  const png = await qrDataUrl(link);
  const secured = code.security !== 'Open';

  const grid = html(`<div class="detail-grid">
    <section class="card qr-panel"><h2>Share your QR code</h2><p>Guests scan this code to open your Wi-Fi page.</p>
      <div class="qr-preview">${png ? `<img src="${png}" width="180" height="180" alt="${esc(`QR code for ${code.name}`)}">` : icon('qr-code', 80)}</div>
      <div class="share-actions">${png ? `<a class="button primary" href="${png}" download="${esc(code.id)}.png">${icon('arrow-down-to-line', 17)} Download PNG</a>` : ''}<button class="button secondary copy-link">${icon('copy', 16)} Copy link</button></div>
      <input aria-label="Demo scan link" readonly value="${esc(link)}"><small class="hint">Preview link for the planned scan endpoint.</small>
    </section>
    <section class="card network-panel"><h2>Network settings</h2><p>Details shown to guests on the Wi-Fi page.</p>
      <dl><dt>Wi-Fi network name</dt><dd>${esc(code.network)}</dd><dt>Security</dt><dd>${esc(code.security)}</dd>${secured ? `<dt>Password</dt><dd class="password-value"><span>••••••••</span> <button class="icon-button" aria-label="Show password">${icon('eye', 18)}</button></dd>` : ''}</dl>
    </section>
  </div>`);

  grid.querySelector('.copy-link').addEventListener('click', () => copyText(link, 'Scan link copied', 'Copy the scan link from the field below.'));
  grid.querySelector('input').addEventListener('focus', (event) => event.target.select());
  const reveal = grid.querySelector('.password-value button');
  if (reveal) {
    let show = false;
    reveal.addEventListener('click', () => {
      show = !show;
      grid.querySelector('.password-value span').textContent = show ? code.password : '••••••••';
      reveal.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }
  block.append(grid);
}
