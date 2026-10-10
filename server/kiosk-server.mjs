// Runs the PLAYYS API locally and serves the built website: npm start / npm run server
//   Kiosk PC: http://127.0.0.1:3001   Hosted elsewhere (PORT set): all interfaces on that port
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import api from './app.mjs';

const PORT = Number(process.env.PORT || process.env.PRINTER_HELPER_PORT || 3001);
const HOST = process.env.HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const hasSite = fs.existsSync(path.join(DIST, 'index.html'));

const app = express();
app.use(api);

// The built website (npm run build); any other path (/command-center ...) is handled by the app itself
if (hasSite) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, HOST, () => {
  console.log(`PLAYYS kiosk server on http://${HOST}:${PORT}${hasSite ? ' (serving the built site)' : ' (API only: run npm run build to serve the site)'}`);
  if (!process.env.COMMAND_CENTER_PASSWORD) console.log('Command center disabled: set COMMAND_CENTER_PASSWORD in .env');
});
