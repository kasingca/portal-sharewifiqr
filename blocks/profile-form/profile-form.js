import screenContext from '../../scripts/app/context.js';
import { saveAdminProfile, updateCustomer } from '../../scripts/app/api.js';
import {
  copyText, esc, html, icon, readConfig, toast,
} from '../../scripts/app/ui.js';

/**
 * profile-form block: personal information (name, email) of whoever is signed in;
 * customers also see their copyable User ID.
 * Config: `heading`.
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable) return;
  const { adminView, profile, publicId } = ctx.session;

  const card = html(`<section class="card profile-card"><h2>${esc(cfg.heading || 'Personal information')}</h2>
    ${adminView ? '' : `<div class="profile-user-id"><label for="profile-user-id">User ID</label><div><input id="profile-user-id" value="${esc(publicId)}" readonly><button class="button secondary">${icon('copy', 16)} Copy ID</button></div></div>`}
    <form><div class="two-fields"><label>First name<input name="first" required value="${esc(profile.first)}"></label><label>Last name<input name="last" required value="${esc(profile.last)}"></label></div>
      <label>Email address<input name="email" type="email" required value="${esc(profile.email)}"></label>
      <button class="button primary">Save changes</button></form>
  </section>`);

  const userId = card.querySelector('#profile-user-id');
  if (userId) {
    userId.addEventListener('focus', () => userId.select());
    card.querySelector('.profile-user-id button').addEventListener('click', () => copyText(publicId, 'User ID copied', 'Select and copy your User ID from the field.'));
  }
  const form = card.querySelector('form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const [first, last, email] = ['first', 'last', 'email'].map((key) => form[key].value.trim());
    if (!first || !last || !email) return;
    if (adminView) await saveAdminProfile({ first, last, email });
    else await updateCustomer(ctx.owner, { first, last, email });
    toast('Profile saved');
  });
  block.append(card);
}
