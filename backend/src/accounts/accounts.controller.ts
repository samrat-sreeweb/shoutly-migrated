import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreatePinterestBoardDto } from './dto/create-pinterest-board.dto';

@Controller('api/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /** Mirrors old Express GET /api/accounts?network= */
  @Get()
  list(@Query('network') network?: string) {
    return this.accountsService.list(network);
  }

  @Get(':id/pinterest/boards')
  listPinterestBoards(@Param('id') id: string) {
    return this.accountsService.listPinterestBoards(id);
  }

  @Post(':id/pinterest/boards')
  createPinterestBoard(
    @Param('id') id: string,
    @Body() body: CreatePinterestBoardDto,
  ) {
    return this.accountsService.createPinterestBoard(id, body);
  }

  @Get(':id/metrics')
  metrics(
    @Param('id') id: string,
    @Query() query: Record<string, string>,
  ) {
    const { network: _n, ...rest } = query;
    return this.accountsService.metrics(id, rest);
  }

  @Get(':id/health')
  health(@Param('id') id: string) {
    return this.accountsService.health(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
