import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutstandService } from '../outstand/outstand.service';
import { ConfigureNetworkDto } from './dto/configure-network.dto';

@Injectable()
export class NetworksService {
  constructor(
    private readonly outstand: OutstandService,
    private readonly config: ConfigService,
  ) {}

  async list() {
    const result = await this.outstand.listSocialNetworks();
    return { success: true, ...(result as object) };
  }

  async configure(dto: ConfigureNetworkDto) {
    const clientKey =
      dto.key || this.config.get<string>('FACEBOOK_APP_ID') || '';
    const clientSecret =
      dto.secret || this.config.get<string>('FACEBOOK_APP_SECRET') || '';

    if (!clientKey || !clientSecret) {
      throw new BadRequestException(
        'Missing credentials. Pass key/secret in body, or set FACEBOOK_APP_ID / FACEBOOK_APP_SECRET in .env.',
      );
    }

    const result = await this.outstand.configureNetwork(
      dto.network,
      clientKey,
      clientSecret,
    );
    return { success: true, ...(result as object) };
  }

  async remove(networkId: string) {
    await this.outstand.deleteSocialNetwork(networkId);
    return { success: true, message: `Network ${networkId} deleted` };
  }
}
