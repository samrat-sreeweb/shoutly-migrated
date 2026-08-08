import { Injectable, BadRequestException } from '@nestjs/common';
import { OutstandService } from '../outstand/outstand.service';
import { CreatePostDto } from './dto/create-post.dto';

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

    const payload: Record<string, unknown> = {
      containers: [
        {
          content: dto.content,
          ...(dto.media?.length ? { media: dto.media } : {}),
        },
      ],
      accounts: accountIds,
      ...(dto.scheduledAt ? { scheduledAt: dto.scheduledAt } : {}),
      ...(dto.youtube ? { youtube: dto.youtube } : {}),
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
