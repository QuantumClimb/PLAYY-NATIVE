// PLAYYS API: printers, asset library (CMS) and the /command-center login.
// An Express app with no listener: server/kiosk-server.mjs runs it locally, api/index.mjs runs it on Vercel.
import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { listPrinters, setDefault } from './printers.mjs';
import { buildPdfs, sendShareEmail, smtpConfigured } from './share.mjs';
import {
  ASSET_TYPES,
  listAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  listSceneBackgrounds,
  upsertSceneBackground,
  resetSceneBackground,
  createMediaFile,
  getMediaFile,
  getPowerQuizQuestions,
  savePowerQuizQuestions,
  resetPowerQuizQuestions,
  getIntroBadges,
  saveIntroBadges,
  resetIntroBadges,
  getProgressTabs,
  saveProgressTabs,
  resetProgressTabs,
  getTrumpCard,
  saveTrumpCard,
  resetTrumpCard,
  getShareSettings,
  saveShareSettings,
  addSubmission,
  setSubmissionEmail,
  listSubmissions,
  getSubmission,
  saveSubmissionFiles,
  getSubmissionFiles,
  deleteSubmissionFiles,
  getBrand,
  saveBrandLogo,
  saveBrandSettings,
  getSoundSettings,
  saveSoundSettings,
  resetSoundSettings,
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
if (HOSTED) app.set('trust proxy', true);
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
  if (!asset) return res.status(404).json({ error: 'Not found' });
  res.json({ asset });
}));

app.delete('/api/cc/assets/:id', requireAdmin, wrap(async (req, res) =>
  (await deleteAsset(Number(req.params.id))) ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' })));

// ---------- Scene Backgrounds & Media API ----------
const VALID_SCENE_IDS = ['intro', 'head', 'body', 'symbol', 'world', 'name', 'quiz', 'review', 'celebrate'];
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac'];

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

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

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
  const isAudio = ALLOWED_AUDIO_TYPES.includes(mimeType);
  if (!isImage && !isVideo && !isAudio) {
    return res.status(400).json({ error: 'Unsupported file type. Allowed: PNG, JPG, WebP, MP4, WebM, and MP3, WAV, OGG, M4A audio.' });
  }

  const buffer = Buffer.from(base64, 'base64');
  const maxBytes = isVideo ? 30 * 1024 * 1024 : isAudio ? 10 * 1024 * 1024 : 10 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return res.status(400).json({
      error: `File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${isVideo ? '30MB for video' : isAudio ? '10MB for audio' : '10MB for image'}.`,
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

// ---------- Brand logo (SVG slot) ----------
const DEFAULT_SHADOW = { enabled: true, blur: 2, offsetY: 1.5, opacity: 0.45 };
const DEFAULT_STROKE = { enabled: true, color: '#ffffff', width: 1.5 };

app.get('/api/brand', wrap(async (_req, res) => {
  const row = await getBrand();
  res.json({
    logoUrl: row?.logo_svg ? `/api/brand/logo?v=${Date.parse(row.updated)}` : null,
    shadow: { ...DEFAULT_SHADOW, ...(row?.settings?.shadow ?? {}) },
    stroke: { ...DEFAULT_STROKE, ...(row?.settings?.stroke ?? {}) },
  });
}));

// Served as an image, with a locked-down policy on top of the upload checks
app.get('/api/brand/logo', wrap(async (_req, res) => {
  const row = await getBrand();
  if (!row?.logo_svg) return res.status(404).json({ error: 'No custom logo' });
  res.set({
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=300',
  });
  res.send(row.logo_svg);
}));

app.put('/api/cc/brand/logo', requireAdmin, wrap(async (req, res) => {
  const svg = req.body?.svg;
  if (svg === null) {
    await saveBrandLogo(null); // back to the built-in PNG logo
    return res.json({ ok: true });
  }
  const problem = checkSvg(svg);
  if (problem) return res.status(400).json({ error: problem });
  await saveBrandLogo(svg);
  res.json({ ok: true });
}));

const inRange = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

app.put('/api/cc/brand/settings', requireAdmin, wrap(async (req, res) => {
  const { shadow, stroke } = req.body ?? {};
  if (shadow !== undefined) {
    if (typeof shadow?.enabled !== 'boolean' || !inRange(shadow.blur, 0, 20) || !inRange(shadow.offsetY, -10, 20) || !inRange(shadow.opacity, 0, 1)) {
      return res.status(400).json({ error: 'Shadow needs enabled, blur 0-20, offsetY -10 to 20 and opacity 0-1' });
    }
  }
  if (stroke !== undefined) {
    if (typeof stroke?.enabled !== 'boolean' || !/^#[0-9a-fA-F]{6}$/.test(stroke.color) || !inRange(stroke.width, 0, 8)) {
      return res.status(400).json({ error: 'Stroke needs enabled, a #rrggbb color and a width from 0 to 8' });
    }
  }
  const row = await getBrand();
  const settings = { ...(row?.settings ?? {}) };
  if (shadow) settings.shadow = { enabled: shadow.enabled, blur: shadow.blur, offsetY: shadow.offsetY, opacity: shadow.opacity };
  if (stroke) settings.stroke = { enabled: stroke.enabled, color: stroke.color, width: stroke.width };
  await saveBrandSettings(settings);
  res.json({ shadow: settings.shadow ?? DEFAULT_SHADOW, stroke: settings.stroke ?? DEFAULT_STROKE });
}));

// ---------- Kiosk sounds ----------
const SFX_EVENTS = ['tap', 'start', 'next', 'back', 'select', 'surprise', 'key', 'backspace', 'flip', 'answer', 'print', 'change', 'done', 'reveal'];
const MUSIC_SRC = /^(file:\/assets\/audio\/music\/[A-Za-z0-9 ._()-]{1,120}|media:[A-Za-z0-9_-]{1,80})$/;
const SOUND_REF = /^(none|synth:[a-z0-9-]{1,30}|custom:[A-Za-z0-9_-]{1,60})$/;

function checkSounds(s) {
  if (!s || typeof s.enabled !== 'boolean' || !(s.volume >= 0 && s.volume <= 1)) return 'Sounds need enabled and a volume from 0 to 1';
  if (!Array.isArray(s.custom) || s.custom.length > 40) return 'Too many custom sounds (40 max)';
  for (const c of s.custom) {
    if (typeof c?.id !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(c.id) || typeof c.mediaId !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(c.mediaId)) return 'Invalid custom sound';
  }
  if (s.music !== undefined) {
    const m = s.music;
    if (!m || typeof m.enabled !== 'boolean' || !(m.volume >= 0 && m.volume <= 1) || !Array.isArray(m.tracks) || m.tracks.length > 20) return 'Invalid music settings';
    for (const t of m.tracks) {
      if (typeof t?.id !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(t.id) || typeof t.src !== 'string' || !MUSIC_SRC.test(t.src)) return 'Invalid music track';
    }
  }
  for (const e of SFX_EVENTS) {
    const v = s.events?.[e];
    if (!v || typeof v.sound !== 'string' || !SOUND_REF.test(v.sound) || !(v.volume >= 0 && v.volume <= 1)) return `Invalid sound for "${e}"`;
  }
  return null;
}

app.get('/api/sounds', wrap(async (_req, res) => {
  res.json({ settings: (await getSoundSettings()) || null });
}));

app.put('/api/cc/sounds', requireAdmin, wrap(async (req, res) => {
  const s = req.body?.settings;
  const problem = checkSounds(s);
  if (problem) return res.status(400).json({ error: problem });
  const clean = {
    enabled: s.enabled,
    volume: s.volume,
    custom: s.custom.map((c) => ({ id: c.id, name: String(c.name ?? 'Sound').slice(0, 40), mediaId: c.mediaId })),
    events: Object.fromEntries(SFX_EVENTS.map((e) => [e, { sound: s.events[e].sound, volume: s.events[e].volume }])),
  };
  if (s.music) {
    clean.music = {
      enabled: s.music.enabled,
      volume: s.music.volume,
      tracks: s.music.tracks.map((t) => ({ id: t.id, name: String(t.name ?? 'Track').slice(0, 60), src: t.src })),
    };
  }
  res.json({ settings: await saveSoundSettings(clean) });
}));

app.post('/api/cc/sounds/reset', requireAdmin, wrap(async (_req, res) => {
  await resetSoundSettings();
  res.json({ ok: true });
}));

// ---------- Intro badges ----------
const BADGE_ICON = /^(lucide:[A-Za-z0-9]{1,40}|media:[A-Za-z0-9_-]{1,80}|emoji:.{1,8})$/u;

function checkBadges(list) {
  if (!Array.isArray(list) || list.length > 5) return 'Badges must be a list of at most 5';
  for (const b of list) {
    if (!b || typeof b.label !== 'string' || !b.label.trim() || b.label.length > 14) return 'Each badge needs a label of 1 to 14 characters';
    if (typeof b.icon !== 'string' || !BADGE_ICON.test(b.icon)) return 'Invalid badge icon';
    if (typeof b.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(b.color)) return 'Invalid badge color';
  }
  return null;
}

app.get('/api/intro-badges', wrap(async (_req, res) => {
  res.json({ badges: (await getIntroBadges()) || null });
}));

app.put('/api/cc/intro-badges', requireAdmin, wrap(async (req, res) => {
  const problem = checkBadges(req.body?.badges);
  if (problem) return res.status(400).json({ error: problem });
  const badges = req.body.badges.map((b, i) => ({
    id: typeof b.id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(b.id) ? b.id : `badge-${i + 1}`,
    label: b.label.trim(),
    icon: b.icon,
    color: b.color,
  }));
  res.json({ badges: await saveIntroBadges(badges) });
}));

app.post('/api/cc/intro-badges/reset', requireAdmin, wrap(async (_req, res) => {
  await resetIntroBadges();
  res.json({ ok: true });
}));

// ---------- Progress tabs (the row of steps at the top of the kiosk pages) ----------
const PROGRESS_TAB_COUNT = 8;
const PROGRESS_ICON = /^(builtin|lucide:[A-Za-z0-9]{1,40}|media:[A-Za-z0-9_-]{1,80}|emoji:.{1,8})$/u;

function checkProgressTabs(body) {
  if (!body || typeof body.showLabels !== 'boolean') return 'showLabels must be true or false';
  if (!Array.isArray(body.stages) || body.stages.length !== PROGRESS_TAB_COUNT) return `There must be exactly ${PROGRESS_TAB_COUNT} tabs`;
  for (const t of body.stages) {
    if (!t || typeof t.label !== 'string' || !t.label.trim() || t.label.length > 14) return 'Each tab needs a label of 1 to 14 characters';
    if (typeof t.icon !== 'string' || !PROGRESS_ICON.test(t.icon)) return 'Invalid tab icon';
  }
  return null;
}

app.get('/api/progress-tabs', wrap(async (_req, res) => {
  res.json({ tabs: (await getProgressTabs()) || null });
}));

app.put('/api/cc/progress-tabs', requireAdmin, wrap(async (req, res) => {
  const problem = checkProgressTabs(req.body);
  if (problem) return res.status(400).json({ error: problem });
  const tabs = {
    showLabels: req.body.showLabels,
    stages: req.body.stages.map((t) => ({ label: t.label.trim(), icon: t.icon })),
  };
  res.json({ tabs: await saveProgressTabs(tabs) });
}));

app.post('/api/cc/progress-tabs/reset', requireAdmin, wrap(async (_req, res) => {
  await resetProgressTabs();
  res.json({ ok: true });
}));

// ---------- Trump card formatting ----------
const HEX = /^#[0-9a-fA-F]{6}$/;

function checkTrumpCard(b) {
  if (!b) return 'Missing settings';
  for (const k of ['outlineColor', 'backBackground', 'backAccent']) if (typeof b[k] !== 'string' || !HEX.test(b[k])) return `Invalid ${k}`;
  if (!Number.isFinite(b.outlineWidth) || b.outlineWidth < 0 || b.outlineWidth > 40) return 'Outline thickness must be between 0 and 40';
  if (!Number.isFinite(b.radius) || b.radius < 0 || b.radius > 60) return 'Corner radius must be between 0 and 60';
  return null;
}

app.get('/api/trump-card', wrap(async (_req, res) => {
  res.json({ settings: (await getTrumpCard()) || null });
}));

app.put('/api/cc/trump-card', requireAdmin, wrap(async (req, res) => {
  const problem = checkTrumpCard(req.body);
  if (problem) return res.status(400).json({ error: problem });
  const { outlineColor, outlineWidth, radius, backBackground, backAccent } = req.body;
  res.json({ settings: await saveTrumpCard({ outlineColor, outlineWidth, radius, backBackground, backAccent }) });
}));

app.post('/api/cc/trump-card/reset', requireAdmin, wrap(async (_req, res) => {
  await resetTrumpCard();
  res.json({ ok: true });
}));

// ---------- Share: log every Playyy and email the PDFs ----------
const DEFAULT_SHARE = { enabled: true, recipients: ['qcquantumclimb@gmail.com', 'aum.janakiram@gmail.com'] };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function shareSettings() {
  const saved = await getShareSettings();
  return {
    enabled: saved?.enabled !== false,
    recipients: Array.isArray(saved?.recipients) ? saved.recipients : DEFAULT_SHARE.recipients,
  };
}

app.get('/api/cc/share-settings', requireAdmin, wrap(async (_req, res) => {
  res.json({ settings: await shareSettings(), smtp: smtpConfigured(), whatsapp: false });
}));

app.put('/api/cc/share-settings', requireAdmin, wrap(async (req, res) => {
  const { enabled, recipients } = req.body ?? {};
  if (typeof enabled !== 'boolean' || !Array.isArray(recipients) || recipients.length > 2) return res.status(400).json({ error: 'Invalid settings' });
  const clean = recipients.map((r) => String(r ?? '').trim());
  if (clean.some((r) => r && !EMAIL_RE.test(r))) return res.status(400).json({ error: 'One of the emails is not valid' });
  res.json({ settings: await saveShareSettings({ enabled, recipients: clean.filter(Boolean) }), smtp: smtpConfigured(), whatsapp: false });
}));

// A visitor can only send a few per minute from one place
const shareHits = new Map();
const tooMany = (ip) => {
  const now = Date.now();
  const hits = (shareHits.get(ip) || []).filter((t) => now - t < 60_000);
  hits.push(now);
  shareHits.set(ip, hits);
  return hits.length > 20;
};

const JPEG_B64 = /^[A-Za-z0-9+/=]+$/;
const IMAGE_KEYS = ['bw', 'color', 'cardFront', 'cardBack'];

async function emailSubmission(id, who, images) {
  const settings = await shareSettings();
  if (!settings.enabled) { await setSubmissionEmail(id, 'off'); return 'off'; }
  try {
    const files = await buildPdfs(images);
    await sendShareEmail({
      recipients: settings.recipients, name: who.name, email: who.email, phone: who.phone,
      when: new Date(who.created).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' (India time)', files,
    });
    await setSubmissionEmail(id, 'sent');
    await deleteSubmissionFiles(id);
    return 'sent';
  } catch (e) {
    await setSubmissionEmail(id, 'failed', String(e.message).slice(0, 300));
    await saveSubmissionFiles(id, images); // kept so it can be resent from the command center
    return 'failed';
  }
}

app.post('/api/submissions', wrap(async (req, res) => {
  if (tooMany(req.ip)) return res.status(429).json({ error: 'Too many requests' });
  const { name, email, phone, thumbnail, config, images } = req.body ?? {};
  const text = (v, max) => String(v ?? '').trim().slice(0, max);
  const who = { name: text(name, 40), email: text(email, 120), phone: text(phone, 30) };
  if (!who.name) return res.status(400).json({ error: 'A name is needed' });
  if (typeof thumbnail !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(thumbnail) || thumbnail.length > 120_000) return res.status(400).json({ error: 'Invalid thumbnail' });
  if (!images || IMAGE_KEYS.some((k) => typeof images[k] !== 'string' || !JPEG_B64.test(images[k]) || images[k].length > 4_000_000)) return res.status(400).json({ error: 'Invalid images' });
  const safeConfig = {};
  for (const k of ['head', 'pose', 'symbol', 'background', 'colors']) if (config && config[k] !== undefined) safeConfig[k] = config[k];
  const row = await addSubmission({ ...who, thumbnail, config: safeConfig });
  const status = await emailSubmission(row.id, { ...who, created: row.created }, Object.fromEntries(IMAGE_KEYS.map((k) => [k, images[k]])));
  res.json({ id: row.id, email: status });
}));

app.get('/api/cc/submissions', requireAdmin, wrap(async (_req, res) => {
  res.json({ submissions: await listSubmissions(500) });
}));

app.post('/api/cc/submissions/:id/resend', requireAdmin, wrap(async (req, res) => {
  const id = Number(req.params.id);
  const who = Number.isInteger(id) ? await getSubmission(id) : null;
  if (!who) return res.status(404).json({ error: 'Not found' });
  const images = await getSubmissionFiles(id);
  if (IMAGE_KEYS.some((k) => !images[k])) return res.status(409).json({ error: 'The files for this one are no longer kept' });
  res.json({ email: await emailSubmission(id, who, images) });
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
