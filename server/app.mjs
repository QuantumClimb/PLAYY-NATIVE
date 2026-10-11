// PLAYYS API: printers, asset library (CMS) and the /command-center login.
// An Express app with no listener: server/kiosk-server.mjs runs it locally, api/index.mjs runs it on Vercel.
import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { listPrinters, setDefault } from './printers.mjs';
import {
  ASSET_TYPES,
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  listSceneBackgrounds,
  getSceneBackground,
  upsertSceneBackground,
  resetSceneBackground,
  createMediaFile,
  getMediaFile,
  getPowerQuizQuestions,
  savePowerQuizQuestions,
  resetPowerQuizQuestions,
} from './db.mjs';

// Printers belong to the kiosk PC, so they are off on Vercel unless ENABLE_PRINTERS=1
const HOSTED = !!process.env.VERCEL;
const PRINTERS = (process.env.ENABLE_PRINTERS ?? (HOSTED ? '0' : '1')) === '1';
const PASSWORD = process.env.COMMAND_CENTER_PASSWORD || '';
// Stable across serverless instances: set COMMAND_CENTER_SECRET, or it is derived from the password
const SECRET =
  process.env.COMMAND_CENTER_SECRET || crypto.createHash('sha256').update('playys-command-center:' + PASSWORD).digest('hex');
const SESSION_MS = 8 * 60 * 60 * 1000;

const app = express();
app.use(express.json({ limit: '50mb' }));

// ---------- Printers (used by the Alt+Shift+P dialog) ----------
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => res.status(500).json({ error: e.message }));

if (PRINTERS) app.get('/api/printers', wrap(async (_req, res) => res.json({ printers: await listPrinters() })));
if (PRINTERS) app.post('/api/printers/default', wrap(async (req, res) => {
  const printers = await listPrinters();
  if (!printers.some((p) => p.name === req.body?.name)) return res.status(404).json({ error: 'Unknown printer' });
  await setDefault(req.body.name);
  res.json({ printers: await listPrinters() });
}));

// ---------- Command center auth ----------
const cookie = (req, value, maxAgeSeconds) =>
  `cc_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`;

const sign = (exp) => `${exp}.${crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex')}`;

function validSession(req) {
  const token = /(?:^|;\s*)cc_session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  if (!token) return false;
  const exp = Number(token.split('.')[0]);
  const expected = sign(exp);
  return (
    exp > Date.now() &&
    token.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  );
}

const requireAdmin = (req, res, next) => (validSession(req) ? next() : res.status(401).json({ error: 'Not signed in' }));

let failures = [];
app.post('/api/cc/login', (req, res) => {
  if (!PASSWORD) return res.status(503).json({ error: 'Set COMMAND_CENTER_PASSWORD in .env to enable the command center' });
  const now = Date.now();
  failures = failures.filter((t) => now - t < 60_000);
  if (failures.length >= 5) return res.status(429).json({ error: 'Too many attempts. Wait a minute.' });

  const a = crypto.createHash('sha256').update(String(req.body?.password ?? '')).digest();
  const b = crypto.createHash('sha256').update(PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    failures.push(now);
    return res.status(401).json({ error: 'Wrong password' });
  }
  res.setHeader('Set-Cookie', cookie(req, sign(now + SESSION_MS), SESSION_MS / 1000));
  res.json({ ok: true });
});

app.post('/api/cc/logout', (req, res) => {
  res.setHeader('Set-Cookie', cookie(req, '', 0));
  res.json({ ok: true });
});

app.get('/api/cc/session', (req, res) => res.json({ signedIn: validSession(req), enabled: !!PASSWORD }));

// ---------- Assets ----------
// Uploaded SVGs are rendered on the kiosk, so anything that can run code or load remote content is rejected.
const FORBIDDEN_SVG = [
  /<\s*script/i, /<\s*foreignObject/i, /<\s*iframe/i, /<\s*embed/i, /<\s*object/i,
  /\son\w+\s*=/i, /javascript\s*:/i, /<!ENTITY/i, /<\s*image\b/i, /<\s*use\b[^>]*href\s*=\s*["'](?!#)/i,
  /(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i,
];

function checkSvg(svg) {
  if (typeof svg !== 'string' || !/<svg[\s>]/i.test(svg)) return 'Not an SVG file';
  if (svg.length > 2_000_000) return 'SVG is too large (2 MB max)';
  const bad = FORBIDDEN_SVG.find((re) => re.test(svg));
  return bad ? 'SVG contains disallowed content (scripts, event handlers, images or external links)' : null;
}

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'asset';
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Public (the kiosk reads these)
app.get('/api/assets', wrap(async (req, res) => {
  const type = ASSET_TYPES.includes(req.query.type) ? req.query.type : undefined;
  res.json({ assets: await listAssets({ type, enabledOnly: true }) });
}));

// Admin
app.get('/api/cc/assets', requireAdmin, wrap(async (_req, res) => res.json({ assets: await listAssets() })));

app.post('/api/cc/assets', requireAdmin, wrap(async (req, res) => {
  const { type, name, svg, parts = {}, meta = {} } = req.body ?? {};
  if (!ASSET_TYPES.includes(type)) return res.status(400).json({ error: 'Unknown asset type' });
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!isObj(parts) || !isObj(meta)) return res.status(400).json({ error: 'Invalid parts/meta' });
  const problem = checkSvg(svg);
  if (problem) return res.status(400).json({ error: problem });
  try {
    res.status(201).json({ asset: await createAsset({ type, slug: slugify(name), name: name.trim(), svg, parts, meta }) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'An asset with that name already exists' });
    throw e;
  }
}));

app.put('/api/cc/assets/:id', requireAdmin, wrap(async (req, res) => {
  const patch = {};
  const { name, svg, parts, meta, enabled, sort } = req.body ?? {};
  if (name !== undefined) patch.name = String(name).trim();
  if (svg !== undefined) {
    const problem = checkSvg(svg);
    if (problem) return res.status(400).json({ error: problem });
    patch.svg = svg;
  }
  if (parts !== undefined) { if (!isObj(parts)) return res.status(400).json({ error: 'Invalid parts' }); patch.parts = parts; }
  if (meta !== undefined) { if (!isObj(meta)) return res.status(400).json({ error: 'Invalid meta' }); patch.meta = meta; }
  if (enabled !== undefined) patch.enabled = !!enabled;
  if (Number.isFinite(sort)) patch.sort = sort;
  const asset = await updateAsset(Number(req.params.id), patch);
  asset ? res.json({ asset }) : res.status(404).json({ error: 'Not found' });
}));

app.delete('/api/cc/assets/:id', requireAdmin, wrap(async (req, res) =>
  (await deleteAsset(Number(req.params.id))) ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' })));

// ---------- Scene Backgrounds & Media API ----------
const VALID_SCENE_IDS = ['intro', 'head', 'body', 'symbol', 'world', 'name', 'quiz', 'review', 'celebrate'];
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

app.get('/api/scene-backgrounds', wrap(async (_req, res) => {
  const list = await listSceneBackgrounds();
  const map = {};
  list.forEach((s) => {
    map[s.scene_id] = {
      sceneId: s.scene_id,
      bgType: s.bg_type,
      mediaId: s.media_id,
      fallbackMediaId: s.fallback_media_id,
      mediaUrl: s.media_id ? `/api/media/${s.media_id}` : null,
      fallbackMediaUrl: s.fallback_media_id ? `/api/media/${s.fallback_media_id}` : null,
      fit: s.fit,
      position: s.position,
      overlayColor: s.overlay_color,
      overlayOpacity: Number(s.overlay_opacity),
      badgePlacement: s.badge_placement,
      startButtonPlacement: s.start_button_placement,
      startButtonSize: s.start_button_size,
      badgeGap: s.badge_gap,
      floatAnimation: s.float_animation,
      updatedAt: s.updated,
    };
  });
  res.json({ scenes: map });
}));

app.get('/api/media/:id', wrap(async (req, res) => {
  const { id } = req.params;
  if (id === 'cheerful-castle-initial') {
    const filePath = path.resolve('public/assets/Cheerful-Mascot-Castle-Adventure.png');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'image/png');
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  const media = await getMediaFile(id);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  const buffer = Buffer.from(media.data_base64, 'base64');
  const mimeType = media.mime_type;

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;
    const chunksize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${buffer.length}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
    });
    res.end(buffer.subarray(start, end + 1));
  } else {
    res.writeHead(200, {
      'Content-Length': buffer.length,
      'Accept-Ranges': 'bytes',
      'Content-Type': mimeType,
    });
    res.end(buffer);
  }
}));

app.post('/api/cc/scene-backgrounds/upload', requireAdmin, wrap(async (req, res) => {
  const { filename, mimeType, base64 } = req.body ?? {};
  if (!filename || !mimeType || !base64) {
    return res.status(400).json({ error: 'Missing filename, mimeType or base64 data' });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
  if (!isImage && !isVideo) {
    return res.status(400).json({ error: 'Unsupported file type. Allowed: PNG, JPG, WebP, MP4, WebM.' });
  }

  const buffer = Buffer.from(base64, 'base64');
  const maxBytes = isVideo ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return res.status(400).json({
      error: `File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${isVideo ? '30MB for video' : '10MB for image'}.`,
    });
  }

  const id = `med_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  await createMediaFile({ id, filename, mimeType, dataBase64: base64, sizeBytes: buffer.length });

  res.status(201).json({
    mediaId: id,
    mediaUrl: `/api/media/${id}`,
    filename,
    mimeType,
    sizeBytes: buffer.length,
  });
}));

app.put('/api/cc/scene-backgrounds/:sceneId', requireAdmin, wrap(async (req, res) => {
  const { sceneId } = req.params;
  if (!VALID_SCENE_IDS.includes(sceneId)) {
    return res.status(400).json({ error: `Invalid scene ID: ${sceneId}` });
  }

  const { bgType, mediaId, fallbackMediaId, fit, position, overlayColor, overlayOpacity, badgePlacement, startButtonPlacement, startButtonSize, badgeGap, floatAnimation } = req.body ?? {};
  if (bgType && !['default', 'image', 'video'].includes(bgType)) {
    return res.status(400).json({ error: 'Invalid background type' });
  }
  if (fit && !['cover', 'contain'].includes(fit)) {
    return res.status(400).json({ error: 'Invalid fit option' });
  }
  if (startButtonSize && !['large', 'extra-large'].includes(startButtonSize)) {
    return res.status(400).json({ error: 'Invalid start button size' });
  }
  if (badgeGap && !['comfortable', 'relaxed'].includes(badgeGap)) {
    return res.status(400).json({ error: 'Invalid badge gap' });
  }
  if (floatAnimation && !['none', 'gentle', 'slow'].includes(floatAnimation)) {
    return res.status(400).json({ error: 'Invalid float animation' });
  }

  const result = await upsertSceneBackground(sceneId, {
    bg_type: bgType,
    media_id: mediaId,
    fallback_media_id: fallbackMediaId,
    fit,
    position,
    overlay_color: overlayColor,
    overlay_opacity: overlayOpacity,
    badge_placement: badgePlacement,
    start_button_placement: startButtonPlacement,
    start_button_size: startButtonSize,
    badge_gap: badgeGap,
    float_animation: floatAnimation,
  });

  res.json({
    scene: {
      sceneId: result.scene_id,
      bgType: result.bg_type,
      mediaId: result.media_id,
      fallbackMediaId: result.fallback_media_id,
      mediaUrl: result.media_id ? `/api/media/${result.media_id}` : null,
      fallbackMediaUrl: result.fallback_media_id ? `/api/media/${result.fallback_media_id}` : null,
      fit: result.fit,
      position: result.position,
      overlayColor: result.overlay_color,
      overlayOpacity: Number(result.overlay_opacity),
      badgePlacement: result.badge_placement,
      startButtonPlacement: result.start_button_placement,
      startButtonSize: result.start_button_size,
      badgeGap: result.badge_gap,
      floatAnimation: result.float_animation,
      updatedAt: result.updated,
    },
  });
}));

app.post('/api/cc/scene-backgrounds/:sceneId/reset', requireAdmin, wrap(async (req, res) => {
  const { sceneId } = req.params;
  if (!VALID_SCENE_IDS.includes(sceneId)) {
    return res.status(400).json({ error: `Invalid scene ID: ${sceneId}` });
  }

  const result = await resetSceneBackground(sceneId);
  res.json({
    scene: {
      sceneId: result.scene_id,
      bgType: result.bg_type,
      mediaId: result.media_id,
      fallbackMediaId: result.fallback_media_id,
      mediaUrl: null,
      fallbackMediaUrl: null,
      fit: result.fit,
      position: result.position,
      overlayColor: result.overlay_color,
      overlayOpacity: Number(result.overlay_opacity),
      badgePlacement: result.badge_placement,
      startButtonPlacement: result.start_button_placement,
      startButtonSize: result.start_button_size,
      badgeGap: result.badge_gap,
      floatAnimation: result.float_animation,
      updatedAt: result.updated,
    },
  });
}));

// ---------- Power Quiz Questions API ----------
app.get('/api/power-quiz-questions', wrap(async (_req, res) => {
  const saved = await getPowerQuizQuestions();
  res.json({ questions: saved || null });
}));

app.put('/api/cc/power-quiz-questions', requireAdmin, wrap(async (req, res) => {
  const { questions } = req.body ?? {};
  if (!Array.isArray(questions)) return res.status(400).json({ error: 'Questions must be an array' });
  const saved = await savePowerQuizQuestions(questions);
  res.json({ questions: saved });
}));

app.post('/api/cc/power-quiz-questions/reset', requireAdmin, wrap(async (_req, res) => {
  await resetPowerQuizQuestions();
  res.json({ ok: true });
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
