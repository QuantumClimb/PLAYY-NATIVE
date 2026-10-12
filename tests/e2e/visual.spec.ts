import { expect, test } from '@playwright/test';
import { currentPage, openKiosk, walkTo } from './helpers';

test.use({ viewport: { width: 1280, height: 720 } });

const masked = (page: import('@playwright/test').Page) => [
  page.locator('video'),
  page.locator('.success-countdown'),
  page.locator('canvas'),
];

// Screenshot baselines for every kiosk page. They are the safety net for the layout and CSS refactor:
// after a change, `npm run test:visual` must report no differences. The baselines show the live content
// (names, backgrounds, tab labels) from the database, so refresh them with `npm run test:visual:update`
// whenever that content changes on purpose, and at the start of each refactor session.
test('the pages up to the share screen look as they did', async ({ page }) => {
  await openKiosk(page);
  await walkTo(page, 'share', async (at) => {
    await expect(page).toHaveScreenshot(`${at}.png`, { mask: masked(page) });
  });
});

// A separate visit, so the big pictures taken by SHARE do not pile up on top of the screenshots above
test('the success screen looks as it did', async ({ page }) => {
  await openKiosk(page);
  await walkTo(page, 'share');
  await page.getByText('SHARE', { exact: true }).first().click();
  await expect.poll(() => currentPage(page)).toBe('success');
  await page.waitForTimeout(1500);
  await expect(page).toHaveScreenshot('success.png', { mask: masked(page) });
});
