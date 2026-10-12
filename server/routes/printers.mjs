import express from 'express';
import { PRINTERS } from '../config.mjs';
import { notFound, wrap } from '../http.mjs';
import { listPrinters, setDefault } from '../printers.mjs';

/** The printer dialog (Alt+Shift+P). Printers belong to the kiosk PC, so these routes exist only where PRINTERS is on. */
export const printersRouter = express.Router();

if (PRINTERS) {
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
}
