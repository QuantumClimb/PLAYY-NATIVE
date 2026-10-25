import { expect, test } from '@playwright/test';
import { currentPage, openKiosk, walkTo } from './helpers';

test('a visitor can go from the intro screen to the success screen and back to the intro', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await openKiosk(page);
  const visited: string[] = [];
  await walkTo(page, 'share', async (at) => {
    visited.push(at);
  });
  expect(visited).toEqual([
    'head',
    'pose',
    'colors',
    'quiz',
    'power',
    'world',
    'name',
    'phone',
    'email',
    'preview',
    'card',
    'share',
  ]);

  // SHARE prints and moves on to the success screen
  await page.getByText('SHARE', { exact: true }).first().click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);
  await expect.poll(() => currentPage(page)).toBe('success');

  // FINISH returns to the intro screen
  await page.getByText('FINISH', { exact: true }).click();
  await expect(page.getByText('Tap to Start')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the name, phone and email screens cannot be skipped', async ({ page }) => {
  await openKiosk(page);
  await walkTo(page, 'name');
  await page
    .getByText(/^NEXT$/)
    .first()
    .click();
  await expect(page.locator('.details-error')).toHaveText('Please type your name.');
  await expect(page.getByText(/skip/i)).toHaveCount(0);
});

test('the Advanced colour toggle works', async ({ page }) => {
  await openKiosk(page);
  await walkTo(page, 'colors');
  await page.locator('.color-mode-toggle button', { hasText: 'Advanced' }).click();
  await expect(page.locator('.color-mode-toggle .is-active')).toHaveText('Advanced');
  expect(await page.locator('.color-panel').count()).toBeGreaterThan(2);
});

test('"Already a PlayyPal?" asks for a phone number, keeps it and carries on', async ({ page }) => {
  const leads: unknown[] = [];
  await page.route('**/api/leads', (route) => {
    leads.push(route.request().postDataJSON());
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await openKiosk(page, 'stay');
  await page.getByText('Already a PlayyPal?').click();
  await page.getByText('DONE').click();
  await expect(page.locator('.details-error')).toContainText('phone number');
  for (const digit of '9876543210')
    await page.locator('.details-keyboard').getByRole('button', { name: digit, exact: true }).click();
  await page.getByText('DONE').click();
  await expect.poll(() => currentPage(page)).toBe('head');
  expect(leads).toEqual([{ phone: '9876543210' }]);
});

test('the Home button on a page goes back to the intro screen', async ({ page }) => {
  await openKiosk(page);
  await page.getByRole('button', { name: 'Home' }).click();
  await expect(page.getByText('Tap to Start')).toBeVisible();
});

test('freeform colouring: a finger stroke paints the character and is not sent to the server', async ({ page }) => {
  const bodies: string[] = [];
  await openKiosk(page);
  await page.route('**/api/submissions', (route) => {
    bodies.push(route.request().postData() ?? '');
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 0, email: 'sent' }) });
  });
  await walkTo(page, 'colors');
  await page.getByRole('button', { name: 'Freeform' }).click();

  const canvas = page.locator('canvas.paint-canvas');
  await expect(canvas).toBeVisible();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();

  await walkTo(page, 'share');
  await page.getByText('SHARE', { exact: true }).first().click();
  await expect.poll(() => bodies.length).toBe(1);
  expect(bodies[0]).not.toContain('"paint"');
  expect(bodies[0]).toContain('freeform');
});
