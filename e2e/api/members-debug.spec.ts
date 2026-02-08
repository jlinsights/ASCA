import { test, expect } from '@playwright/test';

/**
 * Debug test to see what's happening
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Members API - Debug', () => {
  test('debug GET /api/members response', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members`);

    console.log('Status:', response.status());
    console.log('Status Text:', response.statusText());
    console.log('Headers:', await response.headers());

    const text = await response.text();
    console.log('Response Body:', text);

    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Failed to parse as JSON:', e);
    }
  });
});
