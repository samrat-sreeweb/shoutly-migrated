import { Injectable, BadRequestException } from '@nestjs/common';
import { OutstandService } from '../outstand/outstand.service';
import { CreatePostDto } from './dto/create-post.dto';
import { normalizeMediaUrl } from '../media/media.service';

@Injectable()
export class PostsService {
  constructor(private readonly outstand: OutstandService) {}

  async create(dto: CreatePostDto) {
    const accountIds =
      dto.accounts?.length
        ? dto.accounts
        : dto.accountId
          ? [dto.accountId]
          : [];

    if (!accountIds.length || !dto.content) {
      throw new BadRequestException('accountId (or accounts) and content are required');
    }

    if (dto.pinterest && !dto.media?.length) {
      throw new BadRequestException(
        'Pinterest Pins require media (image or video). Upload via /api/media/upload first.',
      );
    }

    if (dto.pinterest && !dto.pinterest.board_id?.trim()) {
      throw new BadRequestException('pinterest.board_id is required');
    }

    const media = dto.media?.map((m) => ({
      url: normalizeMediaUrl(m.url),
      ...(m.filename ? { filename: m.filename } : {}),
    }));

    const payload: Record<string, unknown> = {
      containers: [
        {
          content: dto.content,
          ...(media?.length ? { media } : {}),
        },
      ],
      accounts: accountIds,
      ...(dto.scheduledAt ? { scheduledAt: dto.scheduledAt } : {}),
      ...(dto.youtube ? { youtube: dto.youtube } : {}),
      ...(dto.pinterest ? { pinterest: dto.pinterest } : {}),
    };

    const result = await this.outstand.createPost(payload);
    return { success: true, post: result.post };
  }

  async get(id: string) {
    const result = await this.outstand.getPost(id);
    return { success: true, post: result.post };
  }

  async list(query: Record<string, string> = {}) {
    const result = await this.outstand.listPosts(query);
    return { success: true, ...(result as object) };
  }

  async cancel(id: string) {
    await this.outstand.deletePost(id);
    return { success: true, message: `Post ${id} cancelled/deleted` };
  }
}
