import express from 'express';
import { requireAdmin } from '../auth.mjs';
import { settings } from '../db/index.mjs';
import { wrap } from '../http.mjs';
import {
  parseIntroBadges,
  parsePowerQuiz,
  parseProgressTabs,
  parseSounds,
  parseTrumpCard,
} from '../settingsSchemas.mjs';

/**
 * One command center setting. The kiosk reads it at `/api/<path>` and the command center saves it at
 * `/api/cc/<path>`, either as the whole body or as `body[bodyKey]`. The answer is always `{ [key]: saved }`.
 */
const SETTINGS = [
  {
    path: 'power-quiz-questions',
    key: 'questions',
    bodyKey: 'questions',
    store: settings.powerQuiz,
    parse: parsePowerQuiz,
  },
  { path: 'intro-badges', key: 'badges', bodyKey: 'badges', store: settings.introBadges, parse: parseIntroBadges },
  { path: 'progress-tabs', key: 'tabs', store: settings.progressTabs, parse: parseProgressTabs },
  { path: 'trump-card', key: 'settings', store: settings.trumpCard, parse: parseTrumpCard },
  { path: 'sounds', key: 'settings', bodyKey: 'settings', store: settings.soundSettings, parse: parseSounds },
];

export const settingsRouter = express.Router();

for (const { path, key, bodyKey, store, parse } of SETTINGS) {
  settingsRouter.get(
    `/${path}`,
    wrap(async (_req, res) => res.json({ [key]: (await store.get()) || null })),
  );

  settingsRouter.put(
    `/cc/${path}`,
    requireAdmin,
    wrap(async (req, res) => {
      const input = bodyKey ? req.body?.[bodyKey] : req.body;
      res.json({ [key]: await store.save(parse(input)) });
    }),
  );

  settingsRouter.post(
    `/cc/${path}/reset`,
    requireAdmin,
    wrap(async (_req, res) => {
      await store.reset();
      res.json({ ok: true });
    }),
  );
}
