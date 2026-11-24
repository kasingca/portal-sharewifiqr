import { getSignedInProfile, saveSignedInProfile } from '../../scripts/app/api.js';
import {
  copyText, esc, html, icon, readConfig, toast,
} from '../../scripts/app/ui.js';

/**
 * profile-form block: personal information (name, email) of whoever is signed in;
 * customers also see their copyable User ID.
 * Config: `heading`.
 * @param {Element} block
 */
export default function decorate(block) {
  const cfg = readConfig(block);
  const profile = getSignedInProfile();
  block.textContent = '';
  if (!profile) return;
  const {
    role, publicId, firstName, lastName, email,
  } = profile;

  const card = html(`<section class="card profile-card"><h2>${esc(cfg.heading || 'Personal information')}</h2>
    ${role === 'customer' ? `<div class="profile-user-id"><label for="profile-user-id">User ID</label><div><input id="profile-user-id" value="${esc(publicId)}" readonly><button class="button secondary">${icon('copy', 16)} Copy ID</button></div></div>` : ''}
    <form><div class="two-fields"><label>First name<input name="first" required maxlength="150" value="${esc(firstName)}"></label><label>Last name<input name="last" required maxlength="150" value="${esc(lastName)}"></label></div>
      <label>Email address<input name="email" type="email" readonly value="${esc(email)}"></label>
      <button class="button primary">Save changes</button></form>
  </section>`);

  const userId = card.querySelector('#profile-user-id');
  if (userId) {
    userId.addEventListener('focus', () => userId.select());
    card.querySelector('.profile-user-id button').addEventListener('click', () => copyText(publicId, 'User ID copied', 'Select and copy your User ID from the field.'));
  }
  const form = card.querySelector('form');
  const { first, last } = form.elements;
  const save = form.querySelector('button');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const names = { firstName: first.value.trim(), lastName: last.value.trim() };
    if (save.disabled) return;
    if (!names.firstName || !names.lastName) {
      toast('Enter a first and last name.');
      return;
    }
    save.disabled = true;
    first.readOnly = true;
    last.readOnly = true;
    try {
      const saved = await saveSignedInProfile(names);
      if (!saved) return;
      first.value = saved.firstName ?? '';
      last.value = saved.lastName ?? '';
      form.elements.email.value = saved.email ?? '';
      toast('Profile saved');
    } catch {
      toast('We couldn’t save your profile. Try again.');
    } finally {
      save.disabled = false;
      first.readOnly = false;
      last.readOnly = false;
    }
  });
  block.append(card);
}
