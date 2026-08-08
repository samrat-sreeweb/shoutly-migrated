import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('api')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /** Mirrors old Express POST /api/post */
  @Post('post')
  create(@Body() body: CreatePostDto) {
    return this.postsService.create(body);
  }

  @Get('posts')
  list(@Query() query: Record<string, string>) {
    return this.postsService.list(query);
  }

  /** Mirrors old Express GET /api/posts/:id */
  @Get('posts/:id')
  get(@Param('id') id: string) {
    return this.postsService.get(id);
  }

  /** Cancel / delete a queued post (from CLI cancel-post) */
  @Delete('posts/:id')
  cancel(@Param('id') id: string) {
    return this.postsService.cancel(id);
  }
}
