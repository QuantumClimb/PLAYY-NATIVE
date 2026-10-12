import 'dotenv/config';
import { expect, test } from '@playwright/test';

const password = process.env.COMMAND_CENTER_PASSWORD;

test.describe('command center', () => {
  test.skip(!password, 'COMMAND_CENTER_PASSWORD is not set');

  test('signs in and opens every tab without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/command-center');
    await page.locator('input[type="password"]').fill(password!);
    await page.keyboard.press('Enter');

    const tabs = [
      'Characters',
      'Scene backgrounds',
      'Intro badges',
      'Progress tabs',
      'Trump card',
      'Users',
      'Share & email',
      'Power quiz',
      'Logo',
      'Sounds',
    ];
    for (const name of tabs) {
      await page.getByRole('button', { name, exact: true }).click();
      await page.waitForTimeout(600);
      await expect(page.locator('.cc-root')).toContainText(/.+/);
    }
    expect(errors).toEqual([]);
  });
});
