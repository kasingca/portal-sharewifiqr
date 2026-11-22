// Smoke check: render each EDS screen, collect console/page errors, take a screenshot.
import { pathToFileURL } from 'node:url';
const { openBrowser, newLiveContext } = await import(pathToFileURL('stardust/scripts/stardust/browser.mjs').href);
const base = process.argv[2] || 'http://localhost:3636';
const width = Number(process.argv[3] || 1440);
const paths = process.argv.slice(4);
const browser = await openBrowser({ mode: 'chrome' });
const context = await newLiveContext(browser, { viewport: { width, height: 900 }, stateUrl: base });
for (const p of paths) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const slug = (p.replace(/[/?=]+/g, '-').replace(/^-|-$/g, '') || 'root') + '-' + width;
  await page.screenshot({ path: `stardust/replica/smoke/${slug}.png`, fullPage: true });
  console.log(`${errors.length ? 'ERR' : 'ok '} ${p} ${errors.slice(0, 3).join(' | ')}`);
  await page.close();
}
await browser.close();
