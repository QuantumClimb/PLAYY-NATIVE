import express from 'express';
import { PRINTERS } from '../config.mjs';
import { notFound, wrap } from '../http.mjs';
import { buildPdfs } from '../pdf.mjs';
import { listPrinters, setDefault } from '../printers.mjs';
import { printPdfs, testPagePdf } from '../printing.mjs';
import { parseImages } from '../submission.mjs';

/**
 * Only the kiosk's own website and the hosted one may call these routes (they can print): any localhost page, any
 * *.vercel.app page, or an origin listed in PRINT_ALLOWED_ORIGINS (comma separated).
 */
export function isAllowedOrigin(origin, extra = process.env.PRINT_ALLOWED_ORIGINS || '') {
  if (!origin) return false;
  let host;
  try {
    host = new URL(origin).hostname;
  } catch {
    return false;
  }
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app')) return true;
  return extra
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .includes(origin);
}

/** The printer dialog (Alt+Shift+P) and silent printing. Printers belong to the kiosk PC, so these routes exist only where PRINTERS is on. */
export const printersRouter = express.Router();

if (PRINTERS) {
  // The hosted website calls this server on the kiosk PC (127.0.0.1), which Chrome allows only with these headers
  printersRouter.use(['/printers', '/print'], (req, res, next) => {
    if (isAllowedOrigin(req.headers.origin)) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  printersRouter.get(
    '/printers',
    wrap(async (_req, res) => res.json({ printers: await listPrinters() })),
  );

  printersRouter.post(
    '/printers/default',
    wrap(async (req, res) => {
      const printers = await listPrinters();
      if (!printers.some((p) => p.name === req.body?.name)) throw notFound('Unknown printer');
      await setDefault(req.body.name);
      res.json({ printers: await listPrinters() });
    }),
  );

  // Prints the finished pages (coloring pages, then the trump card) straight to the default printer
  printersRouter.post(
    '/print',
    wrap(async (req, res) => {
      const { coloring, card } = await buildPdfs(parseImages(req.body?.images));
      await printPdfs([coloring, card]);
      res.json({ ok: true });
    }),
  );

  printersRouter.post(
    '/print/test',
    wrap(async (_req, res) => {
      await printPdfs([await testPagePdf()]);
      res.json({ ok: true });
    }),
  );
}
