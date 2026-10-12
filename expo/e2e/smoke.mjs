// Browser smoke test: loads each tab of the web build and fails on runtime errors,
// nested <button>s, or buttons with no accessible name. Usage: BASE_URL=http://localhost:4173 node e2e/smoke.mjs
import { chromium } from 'playwright';

const BASE_URL = (process.env.BASE_URL || 'http://localhost:8081').replace(/\/$/, '');
const ROUTES = ['/', '/daily', '/learn', '/adventures', '/leaderboard', '/playground'];
const IGNORED_ERRORS = [/navigator\.vibrate/i];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const failures = [];
let routeErrors = [];
page.on('pageerror', (err) => routeErrors.push(err.message));
page.on('console', (msg) => {
  if (msg.type() === 'error' && !IGNORED_ERRORS.some((re) => re.test(msg.text()))) routeErrors.push(msg.text());
});

for (const route of ROUTES) {
  routeErrors = [];
  await page.goto(BASE_URL + route, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(3000);
  const skip = page.getByText('Skip Tutorial');
  if (await skip.count()) {
    await skip.first().click();
    await page.waitForTimeout(500);
  }
  const report = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button,[role=button]')];
    return {
      textLength: document.body.innerText.trim().length,
      nested: document.querySelectorAll('button button').length,
      unnamed: buttons.filter((b) => !(b.getAttribute('aria-label') || b.textContent.trim())).length,
    };
  });
  const problems = [];
  if (report.textLength < 20) problems.push('page rendered no content');
  if (report.nested) problems.push(`${report.nested} nested button(s)`);
  if (report.unnamed) problems.push(`${report.unnamed} button(s) without an accessible name`);
  problems.push(...routeErrors.map((e) => `error: ${e.slice(0, 200)}`));
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${route}${problems.length ? '\n  - ' + problems.join('\n  - ') : ''}`);
  if (problems.length) failures.push(route);
}

await browser.close();
if (failures.length) {
  console.error(`\nSmoke test failed on: ${failures.join(', ')}`);
  process.exit(1);
}
