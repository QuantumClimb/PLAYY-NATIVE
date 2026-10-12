import { getFontEmbedCSS, toJpeg } from 'html-to-image';

/** The finished pages as JPEGs (base64, no data: prefix) plus a small thumbnail of the card, ready to send. */
interface ShareImages {
  bw: string;
  color: string;
  cardFront: string;
  cardBack: string;
}

export interface ShareCapture {
  images: ShareImages;
  /** data: URL, about 160 px wide */
  thumbnail: string;
}

export interface CaptureNodes {
  bw: HTMLElement;
  color: HTMLElement;
  cardFront: HTMLElement;
  cardBack: HTMLElement;
}

// The web fonts are read once and reused for every picture (reading them is the slow part)
let fontCss: Promise<string> | null = null;
export function prepareFonts(node: HTMLElement): Promise<string> {
  fontCss ??= getFontEmbedCSS(node).catch(() => '');
  return fontCss;
}

const strip = (dataUrl: string) => dataUrl.replace(/^data:image\/jpeg;base64,/, '');

async function shoot(node: HTMLElement, pixelRatio: number, fontEmbedCSS: string): Promise<string> {
  return toJpeg(node, { quality: 0.86, pixelRatio, backgroundColor: '#ffffff', fontEmbedCSS, cacheBust: false });
}

async function thumbnailOf(dataUrl: string, width = 160): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.round((img.height / img.width) * width);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.75);
}

/** Pictures of the four things that get printed and emailed. The nodes must be laid out at their full size. */
export async function captureShare(nodes: CaptureNodes): Promise<ShareCapture> {
  const fonts = await prepareFonts(nodes.color);
  // One after another: they are big, and doing them together can run a small kiosk PC out of memory
  const bw = await shoot(nodes.bw, 1.24, fonts);
  const color = await shoot(nodes.color, 1.24, fonts);
  const cardFront = await shoot(nodes.cardFront, 3, fonts);
  const cardBack = await shoot(nodes.cardBack, 3, fonts);
  return {
    images: { bw: strip(bw), color: strip(color), cardFront: strip(cardFront), cardBack: strip(cardBack) },
    thumbnail: await thumbnailOf(cardFront),
  };
}
