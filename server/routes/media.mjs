import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { requireAdmin } from '../auth.mjs';
import { createMediaFile, getMediaFile } from '../db/index.mjs';
import { badRequest, notFound, wrap } from '../http.mjs';

const MEGABYTE = 1024 * 1024;

/** What can be uploaded, by kind, with the biggest size allowed. */
const KINDS = {
  image: { types: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'], maxMegabytes: 10, label: 'image' },
  video: { types: ['video/mp4', 'video/webm'], maxMegabytes: 30, label: 'video' },
  audio: {
    types: [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
      'audio/ogg',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
    ],
    maxMegabytes: 10,
    label: 'audio',
  },
};

const kindOf = (mimeType) => Object.values(KINDS).find((kind) => kind.types.includes(mimeType));

/** The first scene background is seeded with a picture that ships in public/assets rather than in the database. */
const SEEDED_MEDIA = { 'cheerful-castle-initial': 'public/assets/Cheerful-Mascot-Castle-Adventure.png' };

/** Sends a stored file, honouring byte-range requests so video and audio can seek. */
function sendFile(req, res, media) {
  const buffer = Buffer.from(media.data_base64, 'base64');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  const range = req.headers.range;
  if (!range) {
    res.writeHead(200, { 'Content-Length': buffer.length, 'Accept-Ranges': 'bytes', 'Content-Type': media.mime_type });
    return res.end(buffer);
  }
  const [startText, endText] = range.replace(/bytes=/, '').split('-');
  const start = parseInt(startText, 10);
  const end = endText ? parseInt(endText, 10) : buffer.length - 1;
  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${buffer.length}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': media.mime_type,
  });
  res.end(buffer.subarray(start, end + 1));
}

/** Uploaded pictures, videos and sounds. */
export const mediaRouter = express.Router();

mediaRouter.get(
  '/media/:id',
  wrap(async (req, res) => {
    const seeded = SEEDED_MEDIA[req.params.id];
    if (seeded && fs.existsSync(path.resolve(seeded))) {
      res.setHeader('Content-Type', 'image/png');
      return fs.createReadStream(path.resolve(seeded)).pipe(res);
    }
    const media = await getMediaFile(req.params.id);
    if (!media) throw notFound('Media not found');
    sendFile(req, res, media);
  }),
);

mediaRouter.post(
  '/cc/scene-backgrounds/upload',
  requireAdmin,
  wrap(async (req, res) => {
    const { filename, mimeType, base64 } = req.body ?? {};
    if (!filename || !mimeType || !base64) throw badRequest('Missing filename, mimeType or base64 data');

    const kind = kindOf(mimeType);
    if (!kind)
      throw badRequest('Unsupported file type. Allowed: PNG, JPG, WebP, MP4, WebM, and MP3, WAV, OGG, M4A audio.');

    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > kind.maxMegabytes * MEGABYTE) {
      throw badRequest(
        `File size (${(buffer.length / MEGABYTE).toFixed(1)}MB) exceeds limit of ${kind.maxMegabytes}MB for ${kind.label}.`,
      );
    }

    const id = `med_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await createMediaFile({ id, filename, mimeType, dataBase64: base64, sizeBytes: buffer.length });
    res.status(201).json({ mediaId: id, mediaUrl: `/api/media/${id}`, filename, mimeType, sizeBytes: buffer.length });
  }),
);
