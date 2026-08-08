import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ConnectService } from './connect.service';
import { FinalizePendingDto } from './dto/finalize-pending.dto';

@Controller('api')
export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}

  /** Mirrors old Express GET /api/connect-url?network= */
  @Get('connect-url')
  getConnectUrl(
    @Query('network') network?: string,
    @Query('redirectUri') redirectUri?: string,
  ) {
    return this.connectService.getConnectUrl(network || 'facebook', redirectUri);
  }

  @Get('pending/:sessionToken')
  getPending(@Param('sessionToken') sessionToken: string) {
    return this.connectService.getPending(sessionToken);
  }

  @Post('pending/:sessionToken/finalize')
  finalize(
    @Param('sessionToken') sessionToken: string,
    @Body() body: FinalizePendingDto,
  ) {
    return this.connectService.finalize(sessionToken, body.selectedPageIds);
  }
}
