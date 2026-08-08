import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { ConfigureNetworkDto } from './dto/configure-network.dto';

@Controller('api/networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @Get()
  list() {
    return this.networksService.list();
  }

  @Post()
  configure(@Body() body: ConfigureNetworkDto) {
    return this.networksService.configure(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.networksService.remove(id);
  }
}
