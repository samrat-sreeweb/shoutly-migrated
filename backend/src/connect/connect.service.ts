import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutstandService } from '../outstand/outstand.service';

@Injectable()
export class ConnectService {
  constructor(
    private readonly outstand: OutstandService,
    private readonly config: ConfigService,
  ) {}

  async getConnectUrl(
    network = 'facebook',
    redirectUri?: string,
  ) {
    const resolvedRedirect =
      redirectUri ||
      this.config.get<string>('OAUTH_SUCCESS_REDIRECT') ||
      undefined;

    const result = await this.outstand.getAuthUrl(network, {
      forceAccountSelection: true,
      ...(resolvedRedirect ? { redirectUri: resolvedRedirect } : {}),
    });
    const data = result as { data?: { auth_url?: string }; auth_url?: string };
    const authUrl = data.data?.auth_url ?? data.auth_url;
    return { success: true, authUrl, redirectUri: resolvedRedirect ?? null };
  }

  async getPending(sessionToken: string) {
    const result = await this.outstand.getPendingConnection(sessionToken);
    return { success: true, ...(result as object) };
  }

  async finalize(sessionToken: string, selectedPageIds: string[]) {
    const result = await this.outstand.finalizePendingConnection(
      sessionToken,
      selectedPageIds,
    );
    return { success: true, ...(result as object) };
  }
}
