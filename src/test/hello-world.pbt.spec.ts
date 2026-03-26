import { test } from '@playwright/test';
// @ts-ignore - fast-check types available after npm install
import * as fc from 'fast-check';

const BASE_URL = 'http://localhost:3000';

// ─── PBT-01: GET / Always Returns 200 ─────────────────────────────────────────
test('PBT-01: GET / always returns HTTP 200', async ({ request }) => {
  await fc.assert(
    fc.asyncProperty(fc.constant('/'), async (path: string) => {
      const response = await request.get(path);
      return response.status() === 200;
    }),
    { numRuns: 10 }
  );
});

// ─── PBT-02: Response Always Contains "Hello World" ───────────────────────────
test('PBT-02: Response body always contains "Hello World"', async ({ request }) => {
  await fc.assert(
    fc.asyncProperty(fc.constant('/'), async (path: string) => {
      const response = await request.get(path);
      const body = await response.text();
      return body.includes('Hello World');
    }),
    { numRuns: 10 }
  );
});

// ─── PBT-03: Centering CSS Applies at All Viewport Widths (320–2560px) ─────────
test('PBT-03: "Hello World" is horizontally centered at all viewport widths 320–2560px', async ({ browser }) => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 320, max: 2560 }),
      async (width: number) => {
        const context = await browser.newContext({
          viewport: { width, height: 768 },
        });
        const page = await context.newPage();

        await page.goto(BASE_URL);
        const h1 = page.locator('h1');
        const box = await h1.boundingBox();

        await context.close();

        if (!box) return false;

        const elementCenter = box.x + box.width / 2;
        return Math.abs(elementCenter - width / 2) < 2; // within 2px tolerance
      }
    ),
    { numRuns: 25 }
  );
});
