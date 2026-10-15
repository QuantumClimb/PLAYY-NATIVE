import type { Page } from '@playwright/test';

/** The kiosk pages in the order a visitor meets them, recognised by their heading. */
export type KioskPage =
  | 'head'
  | 'pose'
  | 'colors'
  | 'quiz'
  | 'power'
  | 'world'
  | 'name'
  | 'phone'
  | 'email'
  | 'preview'
  | 'card'
  | 'share'
  | 'success';

const HEADINGS: Record<Exclude<KioskPage, 'quiz' | 'power'>, RegExp> = {
  head: /CHOOSEYOURHEAD/,
  pose: /CHOOSEYOURPOSE/,
  colors: /CHOOSEYOURCOLOURS/,
  world: /CHOOSEYOURBACKGROUND/,
  name: /YOURNAME/,
  phone: /PHONENUMBER/,
  email: /YOUREMAIL/,
  preview: /YOURCOLORINGPAGE/,
  card: /YOURTRUMPCARD/,
  share: /ALLDONE/,
  success: /YOURPLAYYPALISREADY/,
};

/** Opens the kiosk with the print dialog switched off and the share request answered locally. */
export async function openKiosk(page: Page, welcome: 'first-time' | 'stay' = 'first-time'): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __printed: number }).__printed = 0;
    window.print = () => {
      (window as unknown as { __printed: number }).__printed += 1;
    };
  });
  await page.route('**/api/submissions', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 0, email: 'sent' }) }),
  );
  // Counting a visit would write to the real database
  await page.route('**/api/visits', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  await page.goto('/');
  await page.getByText('Tap to Start').waitFor();
  await page.waitForTimeout(800);
  await page.mouse.click(300, 400);
  await page.getByText('FIRST TIME?').waitFor();
  if (welcome === 'first-time') await page.getByText('FIRST TIME?').click();
}

async function headingOf(page: Page): Promise<string> {
  const h1 = page.locator('h1').first();
  if (!(await h1.count())) return '';
  return (await h1.innerText()).replace(/\s+/g, '').toUpperCase();
}

/** Which page is showing right now. */
export async function currentPage(page: Page): Promise<KioskPage | null> {
  if (await page.locator('button.quiz-card').count()) return 'quiz';
  if (await page.locator('.power-award-panel').count()) return 'power';
  const heading = await headingOf(page);
  for (const [name, pattern] of Object.entries(HEADINGS)) if (pattern.test(heading)) return name as KioskPage;
  return null;
}

async function key(page: Page, label: string): Promise<void> {
  await page.locator('.details-keyboard').getByRole('button', { name: label, exact: true }).first().click();
}

/** Fills in whatever the current page needs and moves on. Always takes the first choice. */
export async function advance(page: Page, at: KioskPage): Promise<void> {
  switch (at) {
    case 'quiz':
      await page.locator('button.quiz-card').first().click();
      return;
    case 'name':
      for (const c of 'ARJUN') await key(page, c);
      await page.locator('.details-keyboard .dk-done').click();
      return;
    case 'phone':
      for (const c of '9876543210') await key(page, c);
      await page.locator('.details-keyboard .dk-done').click();
      return;
    case 'email':
      for (const c of 'AB') await key(page, c);
      await key(page, '@');
      for (const c of 'CD') await key(page, c);
      await key(page, '.COM');
      await page.locator('.details-keyboard .dk-done').click();
      return;
    case 'share':
      await page.getByText('SHARE', { exact: true }).first().click();
      return;
    default:
      await page
        .getByText(/^(NEXT|CONTINUE)$/)
        .first()
        .click();
  }
}

/** Walks the kiosk until `target` is showing, calling `onPage` once for each new page on the way. */
export async function walkTo(page: Page, target: KioskPage, onPage?: (at: KioskPage) => Promise<void>): Promise<void> {
  const seen = new Set<string>();
  for (let step = 0; step < 60; step++) {
    const at = await currentPage(page);
    if (at && !seen.has(at)) {
      seen.add(at);
      await page.waitForTimeout(1200);
      await onPage?.(at);
    }
    if (at === target) return;
    if (at) await advance(page, at);
    await page.waitForTimeout(700);
  }
  throw new Error(`Never reached the "${target}" page`);
}
