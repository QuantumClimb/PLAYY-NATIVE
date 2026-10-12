// The PLAYYS API: the kiosk reads its content from here and the command center edits it.
// An Express app with no listener: server/kiosk-server.mjs runs it locally and api/index.mjs runs it on Vercel.
import express from 'express';
import { authRouter } from './auth.mjs';
import { HOSTED } from './config.mjs';
import { errorHandler } from './http.mjs';
import { assetsRouter } from './routes/assets.mjs';
import { brandRouter } from './routes/brand.mjs';
import { mediaRouter } from './routes/media.mjs';
import { printersRouter } from './routes/printers.mjs';
import { sceneBackgroundsRouter } from './routes/sceneBackgrounds.mjs';
import { settingsRouter } from './routes/settings.mjs';
import { shareRouter } from './routes/share.mjs';

const app = express();
if (HOSTED) app.set('trust proxy', true);
app.use(express.json({ limit: '50mb' }));

app.use('/api', authRouter);
app.use('/api', printersRouter);
app.use('/api', assetsRouter);
app.use('/api', mediaRouter);
app.use('/api', sceneBackgroundsRouter);
app.use('/api', brandRouter);
app.use('/api', settingsRouter);
app.use('/api', shareRouter);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;
