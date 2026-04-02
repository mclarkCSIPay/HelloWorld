import { test, expect } from '@playwright/test';

/**
 * Test Suite: Display Transaction Types (CSIPAY-485)
 * Based on: https://csipay.atlassian.net/wiki/spaces/qa/pages/553287682
 *
 * baseURL should be set in playwright.config.ts:
 *   baseURL: 'https://admin.qa.payfac.csipay.com'
 *
 * ORG_ID: the organization ID visible in the URL after login.
 * Update TRANSACTION_ID_* with real transaction IDs from your QA environment.
 */

const ORG_ID = process.env.ORG_ID ?? '6967bf0cc07b32086f21f107';

const TRANSACTION_DETAIL_PATH = (id: string) =>
  `/organization/${ORG_ID}/payment/history/${id}`;

const TRANSACTION_API_PATH = (id: string) =>
  `/api/v1/organization/${ORG_ID}/payments/${id}`;

// Replace these with real transaction IDs seeded in your QA environment
const TX = {
  SWIPED:      process.env.TX_SWIPED      ?? 'REPLACE_WITH_SWIPED_TX_ID',
  DIPPED:      process.env.TX_DIPPED      ?? 'REPLACE_WITH_DIPPED_TX_ID',
  TAP:         process.env.TX_TAP         ?? 'REPLACE_WITH_TAP_TX_ID',
  APPLE_PAY:   process.env.TX_APPLE_PAY   ?? 'REPLACE_WITH_APPLEPAY_TX_ID',
  GOOGLE_PAY:  process.env.TX_GOOGLE_PAY  ?? 'REPLACE_WITH_GOOGLEPAY_TX_ID',
  ACH:         process.env.TX_ACH         ?? 'REPLACE_WITH_ACH_TX_ID',
  UNKNOWN:     process.env.TX_UNKNOWN     ?? 'REPLACE_WITH_UNKNOWN_TX_ID',
  NO_CHANNEL:  process.env.TX_NO_CHANNEL  ?? 'REPLACE_WITH_NO_CHANNEL_TX_ID',
  EMPTY_DETAIL:process.env.TX_EMPTY       ?? 'REPLACE_WITH_EMPTY_DETAIL_TX_ID',
};

// ─── Req 1: Display Transaction Type Field ────────────────────────────────────────────

test.describe('Req 1: Display Transaction Type Field', () => {

  // TC-1.1
  test('TC-1.1: "Transaction Type" field is rendered on transaction details page', async ({ page }) => {
    await page.goto(TRANSACTION_DETAIL_PATH(TX.SWIPED));
    await expect(page.getByText('Transaction Type', { exact: false })).toBeVisible();
  });

  // TC-1.2
  test('TC-1.2: Transaction Type field is populated from paymentChannel.detail', async ({ page }) => {
    await page.goto(TRANSACTION_DETAIL_PATH(TX.SWIPED));
    await expect(page.getByText('Transaction Type', { exact: false })).toBeVisible();
    await expect(page.getByText('Swiped')).toBeVisible();
  });

  // TC-1.3
  test('TC-1.3: ACH transaction shows blank Transaction Type field', async ({ page }) => {
    await page.goto(TRANSACTION_DETAIL_PATH(TX.ACH));
    await expect(page.getByText('Transaction Type', { exact: false })).toBeVisible();
    // The value next to "Transaction Type" should be empty for ACH
    const row = page.locator('[data-testid="transaction-type-row"]');
    await expect(row.locator('[data-testid="transaction-type-value"]')).toHaveText('');
  });

});

// ─── Req 2: Transaction Type Mapping ─────────────────────────────────────────────────

test.describe('Req 2: Transaction Type Mapping', () => {

  const mappingCases: { tc: string; txId: string; expected: string }[] = [
    { tc: 'TC-2.1', txId: TX.SWIPED,     expected: 'Swiped'     },
    { tc: 'TC-2.2', txId: TX.DIPPED,     expected: 'Dipped'     },
    { tc: 'TC-2.3', txId: TX.TAP,        expected: 'Tap'        },
    { tc: 'TC-2.4', txId: TX.APPLE_PAY,  expected: 'Apple Pay'  },
    { tc: 'TC-2.5', txId: TX.GOOGLE_PAY, expected: 'Google Pay' },
  ];

  for (const { tc, txId, expected } of mappingCases) {
    test(`${tc}: displays "${expected}"`, async ({ page }) => {
      await page.goto(TRANSACTION_DETAIL_PATH(txId));
      await expect(page.getByText(expected)).toBeVisible();
    });
  }

  const blankCases: { tc: string; detail: string; txId: string }[] = [
    { tc: 'TC-2.6', detail: 'unknown/unmapped', txId: TX.UNKNOWN    },
    { tc: 'TC-2.7', detail: 'null/undefined',   txId: TX.NO_CHANNEL },
    { tc: 'TC-2.8', detail: 'ach',              txId: TX.ACH        },
  ];

  for (const { tc, detail, txId } of blankCases) {
    test(`${tc}: channel.detail="${detail}" displays blank`, async ({ page }) => {
      await page.goto(TRANSACTION_DETAIL_PATH(txId));
      await expect(page.getByText('Transaction Type', { exact: false })).toBeVisible();
      await expect(page.locator('[data-testid="transaction-type-value"]')).toHaveText('');
    });
  }

});

// ─── Req 3: Field Label Accuracy ───────────────────────────────────────────────────

test.describe('Req 3: Field Label Accuracy', () => {

  // TC-3.1
  test('TC-3.1: Field label reads exactly "Transaction Type"', async ({ page }) => {
    await page.goto(TRANSACTION_DETAIL_PATH(TX.SWIPED));
    await expect(page.getByText('Transaction Type', { exact: true })).toBeVisible();
  });

  // TC-3.2
  test('TC-3.2: No field labeled "Method" exists for transaction type data', async ({ page }) => {
    await page.goto(TRANSACTION_DETAIL_PATH(TX.SWIPED));
    await expect(page.locator('[data-testid="transaction-type-label"]')).not.toHaveText('Method');
  });

});

// ─── Req 5: Payment Endpoint — Entry Mode Capture ────────────────────────────────────────

test.describe('Req 5: Payment Endpoint — Entry Mode Capture', () => {

  // TC-5.1
  test('TC-5.1: POST terminal payment with entryMode is accepted', async ({ request }) => {
    const response = await request.post(`/api/v1/organization/${ORG_ID}/terminal/test-terminal-id/payment`, {
      data: {
        amount: 10.00,
        cardNumber: '4111111111111111',
        expirationDate: '1230',
        entryMode: 'swiped',
      },
    });
    expect(response.status()).toBeLessThan(400);
  });

  // TC-5.2
  test('TC-5.2: POST terminal payment without entryMode maintains backward compatibility', async ({ request }) => {
    const response = await request.post(`/api/v1/organization/${ORG_ID}/terminal/test-terminal-id/payment`, {
      data: {
        amount: 10.00,
        cardNumber: '4111111111111111',
        expirationDate: '1230',
      },
    });
    expect(response.status()).toBeLessThan(400);
  });

  // TC-5.3
  test('TC-5.3: POST terminal payment with invalid entryMode returns validation error', async ({ request }) => {
    const response = await request.post(`/api/v1/organization/${ORG_ID}/terminal/test-terminal-id/payment`, {
      data: {
        amount: 10.00,
        cardNumber: '4111111111111111',
        expirationDate: '1230',
        entryMode: 'INVALID_MODE_XYZ',
      },
    });
    expect(response.status()).toBe(400);
  });

  // TC-5.4
  test('TC-5.4: Submitted entryMode is stored and reflected in transaction details', async ({ request }) => {
    const createResponse = await request.post(`/api/v1/organization/${ORG_ID}/terminal/test-terminal-id/payment`, {
      data: {
        amount: 10.00,
        cardNumber: '4111111111111111',
        expirationDate: '1230',
        entryMode: 'swiped',
      },
    });
    expect(createResponse.status()).toBeLessThan(400);

    const body = await createResponse.json();
    const txId: string = body.transactionId ?? body.id;

    const getResponse = await request.get(TRANSACTION_API_PATH(txId));
    const tx = await getResponse.json();
    expect(tx.channel?.detail).toBe('swiped');
  });

});

// ─── Edge Cases ─────────────────────────────────────────────────────────────────────────

test.describe('Edge Cases', () => {

  // TC-6.1
  test('TC-6.1: Transaction with no channel object shows blank field without crashing', async ({ page }) => {
    await page.goto(TRANSACTION_DETAIL_PATH(TX.NO_CHANNEL));
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="transaction-type-value"]')).toHaveText('');
  });

  // TC-6.2
  test('TC-6.2: channel.detail empty string shows blank Transaction Type', async ({ page }) => {
    await page.goto(TRANSACTION_DETAIL_PATH(TX.EMPTY_DETAIL));
    await expect(page.locator('[data-testid="transaction-type-value"]')).toHaveText('');
  });

  // TC-6.3
  test('TC-6.3: account_entry_modes mapping is case-insensitive (SWIPE, swipe, Swipe all map to swiped)', async ({ request }) => {
    const variants = ['SWIPE', 'swipe', 'Swipe'];
    for (const variant of variants) {
      const response = await request.post('/api/inserter/test', {
        data: { account_entry_modes: variant },
      });
      const body = await response.json();
      expect(body.channel?.detail).toBe('swiped');
    }
  });

  // TC-6.4
  test('TC-6.4: ACH transaction via inserter path stores ach and displays blank', async ({ page }) => {
    await page.goto(TRANSACTION_DETAIL_PATH(TX.ACH));
    await expect(page.locator('[data-testid="transaction-type-value"]')).toHaveText('');
  });

});
