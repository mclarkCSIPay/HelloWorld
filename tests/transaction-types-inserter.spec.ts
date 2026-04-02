import { test, expect } from '@playwright/test';

/**
 * Req 4: Inserter Logic — account_entry_modes mapping (CSIPAY-485)
 *
 * These tests target the inserter endpoint or a test harness that accepts
 * a Legacy SQS-style payload and returns the mapped paymentChannel.detail.
 *
 * Update INSERTER_TEST_PATH to match your actual test/staging endpoint.
 */

const INSERTER_TEST_PATH = '/api/inserter/test';

// ─── Req 4: Inserter Logic ─────────────────────────────────────────────────────────────────

test.describe('Req 4: Inserter Logic — account_entry_modes to paymentChannel.detail', () => {

  const mappingCases: { tc: string; input: string; expected: string }[] = [
    { tc: 'TC-4.1a', input: 'Swipe',       expected: 'swiped'     },
    { tc: 'TC-4.1b', input: 'Insert',      expected: 'dipped'     },
    { tc: 'TC-4.1c', input: 'Contactless', expected: 'tap'        },
    { tc: 'TC-4.1d', input: 'Apple Pay',   expected: 'apple-pay'  },
    { tc: 'TC-4.1e', input: 'Google Pay',  expected: 'google-pay' },
  ];

  for (const { tc, input, expected } of mappingCases) {
    test(`${tc}: account_entry_modes="${input}" maps to channel.detail="${expected}"`, async ({ request }) => {
      const response = await request.post(INSERTER_TEST_PATH, {
        data: { account_entry_modes: input },
      });
      expect(response.status()).toBeLessThan(400);
      const body = await response.json();
      expect(body.channel?.detail).toBe(expected);
    });
  }

  const emptyCases: { tc: string; input: string | null | undefined }[] = [
    { tc: 'TC-4.1f', input: null        },
    { tc: 'TC-4.1g', input: 'Unknown'   },
    { tc: 'TC-4.1h', input: 'Manual'    },
    { tc: 'TC-4.1i', input: 'Token'     },
    { tc: 'TC-4.1j', input: 'Reference' },
  ];

  for (const { tc, input } of emptyCases) {
    test(`${tc}: account_entry_modes="${input}" results in empty channel.detail`, async ({ request }) => {
      const response = await request.post(INSERTER_TEST_PATH, {
        data: { account_entry_modes: input },
      });
      expect(response.status()).toBeLessThan(400);
      const body = await response.json();
      const detail = body.channel?.detail;
      expect(detail == null || detail === '').toBe(true);
    });
  }

  // TC-4.2
  test('TC-4.2: Missing account_entry_modes field is handled gracefully with no error', async ({ request }) => {
    const response = await request.post(INSERTER_TEST_PATH, {
      data: {
        // account_entry_modes intentionally omitted
        someOtherField: 'value',
      },
    });
    expect(response.status()).not.toBe(500);
    const body = await response.json();
    const detail = body.channel?.detail;
    expect(detail == null || detail === '').toBe(true);
  });

});
