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

@Injectable()
export class MediaService {
  constructor(private readonly outstand: OutstandService) {}

  async upload(
    file: Express.Multer.File,
  ): Promise<{ success: true; url: string; filename: string }> {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const filename = file.originalname || 'upload.bin';
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

    return {
      success: true,
      url: confirmed.url,
      filename: confirmed.filename,
    };
  }
}
