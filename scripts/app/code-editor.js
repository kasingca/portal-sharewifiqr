import { saveCode } from './api.js';
import { href } from './route.js';
import {
  esc, html, icon, toastAfterNavigation,
} from './ui.js';

const SECURITY = ['WPA/WPA2', 'WPA3', 'WEP', 'Open'];

/**
 * Opens the create / edit Wi-Fi QR code dialog.
 * @param {object} options
 * @param {string} options.customer owner id
 * @param {object} [options.code] existing code to edit
 */
export default function openCodeEditor({ customer, code = null }) {
  let security = code?.security || 'WPA/WPA2';
  let show = false;
  const overlay = html(`<div class="overlay">
    <section class="dialog card" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <div class="card-heading"><div><h2 id="editor-title">${code ? 'Edit network' : 'Create a Wi-Fi QR code'}</h2><p>Enter the network details your guests will see.</p></div>
        <button class="icon-button" aria-label="Close editor">${icon('x', 21)}</button></div>
      <form>
        <label>QR code name<input name="name" required maxlength="90" placeholder="e.g. Studio Guest Wi-Fi" value="${esc(code?.name)}"></label>
        <label>Wi-Fi network name (SSID)<input name="network" required maxlength="32" placeholder="e.g. Studio_Guest" value="${esc(code?.network)}"></label>
        <label>Security type<select name="security">${SECURITY.map((s) => `<option${s === security ? ' selected' : ''}>${s}</option>`).join('')}</select></label>
        <label class="password-row">Wi-Fi password<span class="password-field"><input name="password" type="password" required value="${esc(code?.password)}"><button type="button" class="icon-button" aria-label="Show password">${icon('eye', 18)}</button></span></label>
        <div class="form-actions"><button type="button" class="button secondary">Cancel</button><button class="button primary">${code ? 'Save changes' : 'Create QR code'}</button></div>
      </form>
    </section></div>`);

  const form = overlay.querySelector('form');
  const passwordRow = overlay.querySelector('.password-row');
  const password = passwordRow.querySelector('input');
  const toggle = passwordRow.querySelector('button');

  const onKey = (event) => {
    if (event.key === 'Escape') {
      overlay.remove();
      window.removeEventListener('keydown', onKey);
    }
  };
  const close = () => onKey({ key: 'Escape' });
  function syncSecurity() {
    const open = security === 'Open';
    passwordRow.hidden = open;
    password.disabled = open;
  }

  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  overlay.querySelector('[aria-label="Close editor"]').addEventListener('click', close);
  overlay.querySelector('.form-actions .secondary').addEventListener('click', close);
  form.security.addEventListener('change', () => { security = form.security.value; syncSecurity(); });
  toggle.addEventListener('click', () => {
    show = !show;
    password.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = form.name.value.trim();
    const network = form.network.value;
    if (!name || !network.trim()) return;
    const saved = await saveCode(customer, {
      name, network, security, password: security === 'Open' ? '' : password.value,
    }, code?.id);
    toastAfterNavigation(code ? 'Network updated' : 'Wi-Fi QR code created');
    window.location.assign(href('detail', { id: saved.id }));
  });

  syncSecurity();
  window.addEventListener('keydown', onKey);
  document.body.append(overlay);
  form.name.focus();
}
