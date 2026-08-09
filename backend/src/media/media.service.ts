import { Injectable, BadRequestException } from '@nestjs/common';
import { OutstandService } from '../outstand/outstand.service';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webp': 'image/webp',
};

/** Outstand stores the filename in the public URL path — spaces break URL validators. */
function sanitizeFilename(name: string): string {
  const trimmed = name.trim() || 'upload.bin';
  const dot = trimmed.lastIndexOf('.');
  const base = dot > 0 ? trimmed.slice(0, dot) : trimmed;
  const ext = dot > 0 ? trimmed.slice(dot).toLowerCase() : '';
  const safeBase = base
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
  return `${safeBase || 'upload'}${ext}`;
}

/** Encode path/query safely without double-encoding already-escaped URLs. */
export function normalizeMediaUrl(url: string): string {
  try {
    // URL() rejects unencoded spaces; encodeURI keeps protocol/host intact.
    return encodeURI(decodeURI(url));
  } catch {
    return encodeURI(url);
  }
}

@Injectable()
export class MediaService {
  constructor(private readonly outstand: OutstandService) {}

  async upload(
    file: Express.Multer.File,
  ): Promise<{ success: true; url: string; filename: string }> {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const filename = sanitizeFilename(file.originalname || 'upload.bin');
    const ext = filename.includes('.')
      ? `.${filename.split('.').pop()!.toLowerCase()}`
      : '';
    const contentType =
      file.mimetype || CONTENT_TYPES[ext] || 'application/octet-stream';

    const { data } = await this.outstand.requestUploadUrl(filename, contentType);
    await this.outstand.putFile(data.upload_url, file.buffer, contentType);
    const confirmed = await this.outstand.confirmUpload(
      data.id,
      file.buffer.length,
    );

    // Outstand wraps the media object in `data` (same as list/upload).
    const media =
      (confirmed as { data?: { url?: string; filename?: string } }).data ??
      (confirmed as { url?: string; filename?: string });
    const rawUrl = media.url;
    if (!rawUrl) {
      throw new BadRequestException(
        'Outstand confirmed the upload but returned no public URL',
      );
    }

    return {
      success: true,
      url: normalizeMediaUrl(rawUrl),
      filename: media.filename || filename,
    };
  }
}
