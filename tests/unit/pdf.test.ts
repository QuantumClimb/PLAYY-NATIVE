import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildPdfs } from '../../server/share.mjs';

const JPEG = readFileSync(resolve('tests/fixtures/sample.jpg')).toString('base64');

describe('buildPdfs', () => {
  it('makes a two-page coloring PDF and a one-page card PDF', async () => {
    const { coloring, card } = await buildPdfs({ bw: JPEG, color: JPEG, cardFront: JPEG, cardBack: JPEG });
    expect((await PDFDocument.load(coloring)).getPageCount()).toBe(2);
    expect((await PDFDocument.load(card)).getPageCount()).toBe(1);
  });
});
