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

  private credentialsFromEnv(network: string): {
    key: string;
    secret: string;
  } {
    const n = network.toLowerCase();
    if (n === 'x' || n === 'twitter') {
      return {
        key:
          this.config.get<string>('X_CLIENT_ID') ||
          this.config.get<string>('X_CONSUMER_KEY') ||
          '',
        secret:
          this.config.get<string>('X_CLIENT_SECRET') ||
          this.config.get<string>('X_SECRET_KEY') ||
          '',
      };
    }
    if (n === 'facebook' || n === 'instagram') {
      return {
        key: this.config.get<string>('FACEBOOK_APP_ID') || '',
        secret: this.config.get<string>('FACEBOOK_APP_SECRET') || '',
      };
    }
    return { key: '', secret: '' };
  }

  async configure(dto: ConfigureNetworkDto) {
    const fromEnv = this.credentialsFromEnv(dto.network);
    const clientKey = dto.key || fromEnv.key;
    const clientSecret = dto.secret || fromEnv.secret;

    if (!clientKey || !clientSecret) {
      throw new BadRequestException(
        `Missing credentials for "${dto.network}". Pass key/secret in body, or set the matching env vars (X_CONSUMER_KEY/X_SECRET_KEY or FACEBOOK_APP_ID/FACEBOOK_APP_SECRET).`,
      );
    }

    const result = await this.outstand.configureNetwork(
      dto.network,
      clientKey.trim(),
      clientSecret.trim(),
    );
    return { success: true, ...(result as object) };
  }

  async remove(networkId: string) {
    await this.outstand.deleteSocialNetwork(networkId);
    return { success: true, message: `Network ${networkId} deleted` };
  }
}
