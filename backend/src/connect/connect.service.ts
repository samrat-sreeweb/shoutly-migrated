import { Injectable } from '@nestjs/common';
import { OutstandService } from '../outstand/outstand.service';

@Injectable()
export class ConnectService {
  constructor(private readonly outstand: OutstandService) {}

  async getConnectUrl(
    network = 'facebook',
    redirectUri?: string,
  ) {
    const result = await this.outstand.getAuthUrl(network, {
      forceAccountSelection: true,
      ...(redirectUri ? { redirectUri } : {}),
    });
    const data = result as { data?: { auth_url?: string }; auth_url?: string };
    const authUrl = data.data?.auth_url ?? data.auth_url;
    return { success: true, authUrl };
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
