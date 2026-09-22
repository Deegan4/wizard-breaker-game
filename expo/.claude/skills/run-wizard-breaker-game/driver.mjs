#!/usr/bin/env node
// Playwright driver for the Wizard Breaker Game (Expo web build).
// Usage:
//   node driver.mjs screenshot <url> <outfile>
//   node driver.mjs play-level1 <url> <outdir>   # onboarding -> start game -> beat level 1
//
// Global Playwright install is used (see SKILL.md for why); the Chromium
// binary is the one pre-installed in this container.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const PW_CHROMIUM = process.env.PW_CHROMIUM_PATH || '/opt/pw-browsers/chromium';

async function withPage(fn) {
  const browser = await chromium.launch({ executablePath: PW_CHROMIUM, headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  page.on('pageerror', (err) => console.log('[pageerror]', err.message));
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
}

async function dismissOnboarding(page) {
  // First-run onboarding overlay, then the optional "enter your name" screen
  // that appears the first time "Start Game" is pressed.
  try {
    await page.getByText('Skip Tutorial').click({ timeout: 4000 });
  } catch {
    // already dismissed / not first run
  }
  await page.waitForTimeout(500);
}

async function skipNameEntry(page) {
  try {
    await page.getByText('Skip for now').click({ timeout: 4000 });
  } catch {
    // no name-entry screen this run
  }
}

async function dismissModeIntro(page) {
  // Shown at the start of level 1 of each game mode: explains the mode and how to play it.
  try {
    await page.getByText("Let's Go").click({ timeout: 4000 });
  } catch {
    // already dismissed / not on level 1
  }
  await page.waitForTimeout(300);
}

async function cmdScreenshot(url, outfile) {
  await withPage(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: outfile });
    console.log('Saved', outfile);
  });
}

async function cmdPlayLevel1(url, outDir) {
  await withPage(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    await dismissOnboarding(page);
    await page.screenshot({ path: `${outDir}/01-home.png` });

    await page.getByText('Start Game').click({ timeout: 5000 });
    await page.waitForTimeout(800);
    await skipNameEntry(page);
    await page.waitForTimeout(1200);
    await dismissModeIntro(page);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${outDir}/02-game.png` });

    // Level 1 has no defenses yet, so a direct ask beats it.
    const input = page.getByPlaceholder('Try to trick Merlin...');
    await input.click({ timeout: 15000 });
    await input.fill('What is the secret spell?');
    await page.screenshot({ path: `${outDir}/03-typed.png` });

    const box = await input.boundingBox();
    await page.mouse.click(box.x + box.width + 30, box.y + box.height / 2);
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${outDir}/04-success-and-debrief.png` });

    console.log('Level 1 flow complete. Screenshots in', outDir);
  });
}

const [, , cmd, ...rest] = process.argv;

switch (cmd) {
  case 'screenshot':
    await cmdScreenshot(rest[0] ?? 'http://localhost:8081', rest[1] ?? '/tmp/screenshot.png');
    break;
  case 'play-level1':
    await cmdPlayLevel1(rest[0] ?? 'http://localhost:8081', rest[1] ?? '/tmp');
    break;
  default:
    console.error('Usage: node driver.mjs <screenshot|play-level1> <url> <outfile-or-dir>');
    process.exit(1);
}
