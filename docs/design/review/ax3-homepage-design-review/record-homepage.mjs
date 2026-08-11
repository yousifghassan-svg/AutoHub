/**
 * 15s homepage review recording — load, hero, search, scroll, motion.
 * Run: node docs/design/review/ax3-homepage-design-review/record-homepage.mjs
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, 'recording', 'homepage-15s.webm');
const url = process.env.HOME_URL || 'http://localhost:3000/';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: path.join(__dirname, 'recording'),
    size: { width: 1440, height: 900 },
  },
});
const page = await context.newPage();

const start = Date.now();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.waitForTimeout(2200); // hero enter

const search = page.locator('input[type="search"]').first();
await search.click();
await page.waitForTimeout(400);
await search.fill('Toyota');
await page.waitForTimeout(900); // suggestions / focus
await search.press('Control+A');
await search.fill('');
await page.waitForTimeout(300);

// Scroll through sections — motion / stagger
await page.evaluate(async () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    window.scrollTo({ top: (total * i) / steps, behavior: 'smooth' });
    await new Promise((r) => setTimeout(r, 450));
  }
});
await page.waitForTimeout(1200);

// Return toward top briefly
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
await page.waitForTimeout(800);

const elapsed = Date.now() - start;
if (elapsed < 15000) {
  await page.waitForTimeout(15000 - elapsed);
}

await context.close();
await browser.close();

// Playwright names the video by page; rename latest webm in folder
import fs from 'node:fs';
const dir = path.join(__dirname, 'recording');
const webms = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.webm'))
  .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t);
if (webms[0] && webms[0].f !== 'homepage-15s.webm') {
  const src = path.join(dir, webms[0].f);
  if (fs.existsSync(out)) fs.unlinkSync(out);
  fs.renameSync(src, out);
}
console.log('Wrote', out, 'elapsed_ms~', elapsed);
