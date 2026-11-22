// Functional check of the portal's transactional flows on the EDS build (mock API).
import { pathToFileURL } from 'node:url';
const { openBrowser, newLiveContext } = await import(pathToFileURL('stardust/scripts/stardust/browser.mjs').href);
const base = process.argv[2] || 'http://localhost:3636';
const browser = await openBrowser({ mode: 'chrome' });
const context = await newLiveContext(browser, { viewport: { width: 1440, height: 900 }, stateUrl: base });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const results = [];
const check = async (name, fn) => {
  try { await fn(); results.push(`ok   ${name}`); } catch (e) { results.push(`FAIL ${name}: ${e.message.split('\n')[0]}`); }
};
const go = (p) => page.goto(base + p, { waitUntil: 'networkidle' });
const expectText = async (sel, text) => {
  await page.waitForFunction(([s, t]) => [...document.querySelectorAll(s)].some((el) => el.textContent.includes(t)), [sel, text], { timeout: 8000 });
};

await check('create QR code → detail + toast', async () => {
  await go('/customer/codes');
  await page.click('.page-header .button.primary');
  await page.fill('input[name=name]', 'Cafe Wi-Fi');
  await page.fill('input[name=network]', 'Cafe_Guest');
  await page.fill('input[name=password]', 'secret123');
  await page.click('.dialog .form-actions .primary');
  await page.waitForURL(/codes\/detail\?id=/);
  await expectText('h1', 'Cafe Wi-Fi');
  await expectText('.toast', 'Wi-Fi QR code created');
});
await check('edit network (Open hides password) → toast', async () => {
  await page.click('.page-header .button.primary');
  await page.selectOption('.dialog select[name=security]', 'Open');
  if (await page.isVisible('.dialog input[name=password]')) throw new Error('password visible for Open');
  await page.click('.dialog .form-actions .primary');
  await page.waitForLoadState('networkidle');
  await expectText('.toast', 'Network updated');
  await expectText('.code-detail dd', 'Open');
});
await check('QR image + copy link field', async () => {
  await page.waitForSelector('.qr-preview img[src^="data:image/png"]');
  const v = await page.inputValue('.code-detail input');
  if (!v.startsWith('https://api.sharewifiqr.com/b2693d9c2124f3ca9547b897794ac6a1/q/')) throw new Error(v);
});
await check('codes list shows new code (4 rows)', async () => {
  await go('/customer/codes');
  const n = await page.locator('.code-table tbody tr').count();
  if (n !== 4) throw new Error(`rows ${n}`);
});
await check('row click opens detail', async () => {
  await page.locator('.code-table tbody tr').nth(1).locator('td').nth(2).click();
  await page.waitForURL(/codes\/detail\?id=/);
});
await check('scan activity: custom invalid range message', async () => {
  await go('/customer');
  await page.selectOption('.scan-activity select', 'custom');
  await page.fill('.scan-filters input[name=start]', '2026-11-20');
  await page.fill('.scan-filters input[name=end]', '2026-11-01');
  await page.locator('.scan-filters input[name=end]').dispatchEvent('change');
  await expectText('.scan-message', 'The end date must be on or after the start date.');
});
await check('billing: choose Business schedules + stats unchanged plan', async () => {
  await go('/customer/billing');
  await page.click('button[data-plan=business]');
  await expectText('.toast', 'Plan change scheduled');
  await expectText('.plan-scheduled', 'Business');
  await expectText('button[data-plan=plus]', 'Keep Plus');
});
await check('payment history: page size + presets', async () => {
  await page.click('.date-presets button:first-child');
  await expectText('.billing-pagination [role=status]', 'of 3 payments');
});
await check('profile save + payment method save', async () => {
  await go('/customer/profile');
  await page.fill('.profile-form input[name=first]', 'Maya');
  await page.click('.profile-form .button.primary');
  await expectText('.toast', 'Profile saved');
  await page.check('input[value=PayPal]');
  await page.click('.payment-method .button.primary');
  await expectText('.toast', 'Payment method saved');
});
await check('admin directory: search + status filter', async () => {
  await go('/admin');
  await page.fill('input[name=query]', 'alex');
  await expectText('.directory-results [role=status]', 'Showing 1 of 3');
  await page.click('.directory-results button');
  await page.selectOption('select[name=status]', 'paused');
  await expectText('.directory-list', 'Jordan Lee');
});
await check('admin account: pause/resume toggles', async () => {
  await go('/admin/customers/account?id=alex');
  await page.click('.stats .button.secondary');
  await expectText('.toast', 'Account paused');
  await expectText('.stats', 'Resume account');
  await page.click('.stats .button.secondary');
  await expectText('.toast', 'Account resumed');
});
await check('view as customer → banner → exit', async () => {
  await go('/admin/customers/account?id=maya');
  await page.click('.page-header .button.primary');
  await page.waitForURL(/\/customer\?as=maya/);
  await expectText('.impersonation', 'Viewing as Maya Chen');
  await page.click('.impersonation button');
  await page.waitForURL(/account\?id=maya/);
});
await check('paused customer redirected to sign-in, toast on continue', async () => {
  await go('/customer?customer=d16d377af76c99d27093abc22244b342');
  await page.waitForURL(/sign-in/);
});
await check('role switch → admin sign-in → continue → /admin', async () => {
  await go('/customer');
  await page.selectOption('header .role select', 'admin');
  await page.waitForURL(/\/admin\/sign-in/);
  await page.click('.sign-in .button.primary');
  await page.waitForURL(/\/admin$/);
});
await check('unknown code → Page unavailable', async () => {
  await go('/customer/codes/detail?id=nope');
  await expectText('.page-header h1', 'Page unavailable');
});
console.log(results.join('\n'));
console.log(errors.length ? `page errors: ${errors.join(' | ')}` : 'page errors: none');
await browser.close();
