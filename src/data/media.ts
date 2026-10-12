import { api } from './api';

/** Reads a file in the browser and returns its content as base64 (without the `data:` prefix). */
export function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

/** Where the browser loads an uploaded file from. */
export const mediaUrl = (mediaId: string): string => `/api/media/${mediaId}`;

/** Uploads an image, video or audio file to the command center's media store and returns its id. */
export async function uploadMedia(file: File): Promise<string> {
  const base64 = await readAsBase64(file);
  const { mediaId } = await api.post<{ mediaId: string }>('/api/cc/scene-backgrounds/upload', {
    filename: file.name,
    mimeType: file.type,
    base64,
  });
  return mediaId;
}
