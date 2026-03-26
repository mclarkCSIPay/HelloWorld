import { test, expect } from '@playwright/test';

// ─── TC-01: Page Loads Successfully ───────────────────────────────────────────
test('TC-01: GET / returns HTTP 200', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
});

// ─── TC-02: Correct Content-Type Header ───────────────────────────────────────
test('TC-02: Content-Type header includes text/html', async ({ request }) => {
  const response = await request.get('/');
  const contentType = response.headers()['content-type'];
  expect(contentType).toContain('text/html');
});

// ─── TC-03: Hello World Text is Present ───────────────────────────────────────
test('TC-03: Response body contains "Hello World"', async ({ request }) => {
  const response = await request.get('/');
  const body = await response.text();
  expect(body).toContain('Hello World');
});

// ─── TC-04: Horizontal Centering — Desktop (1280px) ───────────────────────────
test('TC-04: "Hello World" is horizontally centered at 1280px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const h1 = page.locator('h1');
  const box = await h1.boundingBox();
  expect(box).not.toBeNull();

  const viewportWidth = 1280;
  const elementCenter = box!.x + box!.width / 2;
  expect(Math.abs(elementCenter - viewportWidth / 2)).toBeLessThan(2);
});

// ─── TC-05: Horizontal Centering — Mobile (375px) ─────────────────────────────
test('TC-05: "Hello World" is horizontally centered at 375px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  const h1 = page.locator('h1');
  const box = await h1.boundingBox();
  expect(box).not.toBeNull();

  const viewportWidth = 375;
  const elementCenter = box!.x + box!.width / 2;
  expect(Math.abs(elementCenter - viewportWidth / 2)).toBeLessThan(2);
});

// ─── TC-06: CSS-Only Centering (No JavaScript) ────────────────────────────────
test('TC-06: No <script> tags present in the page', async ({ request }) => {
  const response = await request.get('/');
  const body = await response.text();
  expect(body.toLowerCase()).not.toContain('<script');
});

// ─── TC-07: Valid HTML Structure — DOCTYPE ────────────────────────────────────
test('TC-07: Document begins with <!DOCTYPE html>', async ({ request }) => {
  const response = await request.get('/');
  const body = await response.text();
  expect(body.trimStart().toLowerCase()).toMatch(/^<!doctype html>/);
});

// ─── TC-08: Valid HTML Structure — html[lang], head, body ─────────────────────
test('TC-08: Document contains <html lang>, <head>, and <body> elements', async ({ page }) => {
  await page.goto('/');

  const htmlLang = await page.getAttribute('html', 'lang');
  expect(htmlLang).toBeTruthy();

  await expect(page.locator('head')).toHaveCount(1);
  await expect(page.locator('body')).toHaveCount(1);
});

// ─── TC-09: Meta Charset Tag ──────────────────────────────────────────────────
test('TC-09: <meta charset="UTF-8"> is present in <head>', async ({ request }) => {
  const response = await request.get('/');
  const body = await response.text();
  expect(body.toLowerCase()).toContain('<meta charset="utf-8"');
});

// ─── TC-10: Meta Viewport Tag ─────────────────────────────────────────────────
test('TC-10: Meta viewport tag is present', async ({ request }) => {
  const response = await request.get('/');
  const body = await response.text();
  expect(body.toLowerCase()).toContain('name="viewport"');
  expect(body.toLowerCase()).toContain('width=device-width');
  expect(body.toLowerCase()).toContain('initial-scale=1');
});

// ─── TC-11: Page Title — Present and Non-Empty ────────────────────────────────
test('TC-11: <title> element is present and non-empty', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title).toBeTruthy();
  expect(title.trim().length).toBeGreaterThan(0);
});

// ─── TC-12: Page Title — Correct Value ───────────────────────────────────────
test('TC-12: Page title equals "AI-DLC POC - triPOS Lane Devices"', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('AI-DLC POC - triPOS Lane Devices');
});

// ─── TC-13: No JavaScript Errors on Page Load ─────────────────────────────────
test('TC-13: Zero JavaScript errors in browser console on page load', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(errors).toHaveLength(0);
});

// ─── TC-14: No JavaScript Warnings on Page Load ───────────────────────────────
test('TC-14: Zero JavaScript warnings in browser console on page load', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(warnings).toHaveLength(0);
});
