// The print helper: a small server for the kiosk PC that lists the printers and prints the finished pages silently
// (no print preview) when the kiosk runs from the hosted website.  npm run print-helper
// It needs no database or login, only the printers on this PC.
import express from 'express';
import { errorHandler } from './http.mjs';
import { printersRouter } from './routes/printers.mjs';

const PORT = Number(process.env.PRINT_HELPER_PORT || 3002);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use('/api', printersRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

app.listen(PORT, '127.0.0.1', () => console.log(`PLAYY print helper on http://127.0.0.1:${PORT}`));
