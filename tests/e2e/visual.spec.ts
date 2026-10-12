import { expect, test } from '@playwright/test';
import { openKiosk, walkTo } from './helpers';

test.use({ viewport: { width: 1280, height: 720 } });

// Screenshot baselines for every kiosk page. They are the safety net for the layout and CSS refactor:
// after a change, `npm run test:visual` must report no differences.
// Create or refresh them (only when a visual change is intended) with `npm run test:visual:update`.
test('every kiosk page looks as it did', async ({ page }) => {
  await openKiosk(page);
  await walkTo(page, 'success', async (at) => {
    if (at === 'share') await page.getByText('SHARE', { exact: true }).first().waitFor();
    await expect(page).toHaveScreenshot(`${at}.png`, {
      mask: [page.locator('video'), page.locator('.success-countdown'), page.locator('canvas')],
    });
  });
});
