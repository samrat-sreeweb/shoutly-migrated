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
    const get = (...keys: string[]) => {
      for (const k of keys) {
        const v = this.config.get<string>(k)?.trim();
        if (v) return v;
      }
      return '';
    };

    switch (n) {
      case 'x':
      case 'twitter':
        return {
          key: get('X_CLIENT_ID', 'X_CONSUMER_KEY'),
          secret: get('X_CLIENT_SECRET', 'X_SECRET_KEY'),
        };
      case 'facebook':
        return {
          key: get('FACEBOOK_APP_ID'),
          secret: get('FACEBOOK_APP_SECRET'),
        };
      case 'instagram':
        return {
          key: get('INSTAGRAM_APP_ID', 'FACEBOOK_APP_ID'),
          secret: get('INSTAGRAM_APP_SECRET', 'FACEBOOK_APP_SECRET'),
        };
      case 'threads':
        return {
          key: get('THREAD_APP_ID', 'THREADS_APP_ID', 'FACEBOOK_APP_ID'),
          secret: get('THREAD_APP_SECRET', 'THREADS_APP_SECRET', 'FACEBOOK_APP_SECRET'),
        };
      case 'youtube':
      case 'google_business':
        // Same Google Cloud OAuth Web client can serve both; each needs its
        // own Outstand redirect URI allow-listed on that client.
        return {
          key: get('GOOGLE_CLIENT_ID', 'YOUTUBE_CLIENT_ID'),
          secret: get('GOOGLE_CLIENT_SECRET', 'YOUTUBE_CLIENT_SECRET'),
        };
      case 'pinterest':
        return {
          key: get('PINTEREST_APP_ID', 'PINTEREST_CLIENT_ID'),
          secret: get('PINTEREST_APP_SECRET', 'PINTEREST_CLIENT_SECRET'),
        };
      case 'tiktok':
        return {
          key: get('TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_ID'),
          secret: get('TIKTOK_CLIENT_SECRET'),
        };
      case 'bluesky':
        // Outstand requires a social-networks row; placeholders are fine —
        // real Bluesky auth is handle + app password on connect.
        return {
          key: get('BLUESKY_CLIENT_KEY') || 'bluesky',
          secret: get('BLUESKY_CLIENT_SECRET') || 'bluesky',
        };
      case 'linkedin':
        return {
          key: get('LINKEDIN_CLIENT_ID', 'LINKEDIN_APP_ID'),
          secret: get('LINKEDIN_CLIENT_SECRET', 'LINKEDIN_APP_SECRET'),
        };
      default:
        return { key: '', secret: '' };
    }
  }

  async configure(dto: ConfigureNetworkDto) {
    const fromEnv = this.credentialsFromEnv(dto.network);
    const clientKey = dto.key || fromEnv.key;
    const clientSecret = dto.secret || fromEnv.secret;

    if (!clientKey || !clientSecret) {
      throw new BadRequestException(
        `Missing credentials for "${dto.network}". Pass key/secret in body, or set env vars for that network (see .env.example).`,
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
