import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaService } from './media.service';

// Keep uploads in memory for the Outstand putFile flow. Cap at 100MB for short test videos.
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

@Controller('api/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /** Multipart upload → Outstand media storage; returns public URL */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('file is required (field name: file)');
    }
    return this.mediaService.upload(file);
  }
}
