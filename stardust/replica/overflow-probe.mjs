// Lists the outermost elements whose right edge passes the viewport (horizontal overflow).
import { pathToFileURL } from 'node:url';
const { openBrowser, newLiveContext } = await import(pathToFileURL('stardust/scripts/stardust/browser.mjs').href);
const [url, width = '360'] = process.argv.slice(2);
const browser = await openBrowser({ mode: 'chrome' });
const context = await newLiveContext(browser, { viewport: { width: Number(width), height: Number(process.argv[4] || 900) }, reducedMotion: 'reduce', stateUrl: url });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
for (let y = 0; y < 3000; y += 400) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(150); }
await page.evaluate(() => window.scrollTo(0, 0));
console.log(await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1) {
      const path = []; let n = el;
      while (n && n !== document.body && path.length < 5) { path.unshift(n.tagName.toLowerCase() + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : '')); n = n.parentElement; }
      out.push(`${Math.round(r.left)}→${Math.round(r.right)}  ${path.join(' > ')}  pos=${getComputedStyle(el).position}`);
    }
  });
  return `scrollWidth ${document.documentElement.scrollWidth}\n` + out.slice(0, 12).join('\n');
}));
await browser.close();
