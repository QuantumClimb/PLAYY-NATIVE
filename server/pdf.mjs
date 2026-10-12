import { PDFDocument } from 'pdf-lib';

const A4 = [595.28, 841.89];
const MARGIN = 14; // about 5 mm
const CARD_GAP = 24;
const CARD_RATIO = 1.5; // the card is 2:3

/** Draws a JPEG as large as fits in a box, centered in it. */
function drawFit(page, image, box) {
  const scale = Math.min(box.w / image.width, box.h / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  page.drawImage(image, { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, width: w, height: h });
}

const fromBase64 = (base64) => Buffer.from(base64, 'base64');

/** The black-and-white page then the full-colour page, one A4 page each. */
async function coloringPdf({ bw, color }) {
  const pdf = await PDFDocument.create();
  for (const base64 of [bw, color]) {
    drawFit(pdf.addPage(A4), await pdf.embedJpg(fromBase64(base64)), {
      x: MARGIN,
      y: MARGIN,
      w: A4[0] - 2 * MARGIN,
      h: A4[1] - 2 * MARGIN,
    });
  }
  return Buffer.from(await pdf.save());
}

/** The trump card, front and back side by side on one A4 page. */
async function cardPdf({ cardFront, cardBack }) {
  const pdf = await PDFDocument.create();
  const sheet = pdf.addPage(A4);
  const w = (A4[0] - 2 * MARGIN - CARD_GAP) / 2;
  const h = w * CARD_RATIO;
  const y = (A4[1] - h) / 2;
  drawFit(sheet, await pdf.embedJpg(fromBase64(cardFront)), { x: MARGIN, y, w, h });
  drawFit(sheet, await pdf.embedJpg(fromBase64(cardBack)), { x: MARGIN + w + CARD_GAP, y, w, h });
  return Buffer.from(await pdf.save());
}

/** The two files that are emailed, from the four pictures (base64 JPEGs). */
export async function buildPdfs(images) {
  return { coloring: await coloringPdf(images), card: await cardPdf(images) };
}
