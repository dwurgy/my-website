// Makes public/share.jpg, the 1200 × 630 card shown when a link is shared:
// the hero's opening frame (the coast photo and headline) with the control bar
// hidden. Run it after `npm run build && npm run preview`, then commit the image.
// Uses the Playwright that comes with the cloud environment; it is not a
// dependency of the site.
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');

const url = process.argv[2] ?? 'http://localhost:4321/';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  colorScheme: 'light',
  reducedMotion: 'no-preference',
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: '.bar, .skip-link { display: none !important; }' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200); // let the headline finish its one fade-up
await page.screenshot({ path: 'public/share.jpg', type: 'jpeg', quality: 86 });
await browser.close();
