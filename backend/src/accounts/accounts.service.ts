import { Injectable, BadRequestException } from '@nestjs/common';
import { OutstandService, OutstandApiError } from '../outstand/outstand.service';

@Injectable()
export class AccountsService {
  constructor(private readonly outstand: OutstandService) {}

  async list(network?: string) {
    const params: Record<string, string> = {};
    if (network) params.network = network;
    const result = await this.outstand.listSocialAccounts(params);
    const data = (result as { data?: unknown[] }).data ?? [];
    return { success: true, accounts: data };
  }

  async metrics(accountId: string, query: Record<string, string> = {}) {
    const result = await this.outstand.getAccountMetrics(accountId, query);
    return { success: true, ...(result as object) };
  }

  async health(accountId: string) {
    const result = await this.outstand.checkAccountHealth(accountId);
    return { success: true, ...(result as object) };
  }

  async remove(accountId: string) {
    await this.outstand.deleteSocialAccount(accountId);
    return { success: true };
  }

  async listPinterestBoards(accountId: string) {
    const result = await this.outstand.listPinterestBoards(accountId);
    const data =
      (result as { data?: unknown[]; boards?: unknown[] }).data ??
      (result as { boards?: unknown[] }).boards ??
      [];
    return { success: true, boards: data };
  }

  async createPinterestBoard(
    accountId: string,
    body: { name: string; privacy?: string; description?: string },
  ) {
    const result = await this.outstand.createPinterestBoard(accountId, {
      name: body.name.trim(),
      ...(body.privacy ? { privacy: body.privacy } : { privacy: 'PUBLIC' }),
      ...(body.description ? { description: body.description } : {}),
    });
    const board =
      (result as { data?: unknown }).data ?? result;
    return { success: true, board };
  }

  /**
   * Bluesky has no OAuth step — the handle + app password are submitted
   * straight through to Outstand, which uses them once to create an AT
   * Protocol session (Outstand stores the resulting session tokens, not the
   * app password itself). This request body must come from the person who
   * owns the Bluesky account, entered directly in the app's own connect
   * form — never hardcoded, logged, or relayed from anywhere else.
   *
   * Outstand still expects a `bluesky` row in /v1/social-networks before
   * connect works (placeholders are enough — real auth is the app password).
   */
  async connectBluesky(body: {
    handle: string;
    appPassword: string;
    tenantId?: string;
  }) {
    const handle = body.handle.trim().replace(/^@/, '');
    if (!handle || !body.appPassword?.trim()) {
      throw new BadRequestException('handle and appPassword are required');
    }

    await this.ensureBlueskyNetworkConfigured();

    const result = await this.outstand.connectBluesky(
      handle,
      body.appPassword.trim(),
      {
        ...(body.tenantId ? { tenantId: body.tenantId } : {}),
      },
    );
    const account = (result as { data?: unknown }).data ?? result;
    return { success: true, account };
  }

  private async ensureBlueskyNetworkConfigured() {
    try {
      const listed = await this.outstand.listSocialNetworks();
      const rows =
        (listed as { data?: Array<{ network?: string }> }).data ?? [];
      if (rows.some((n) => (n.network || '').toLowerCase() === 'bluesky')) {
        return;
      }
    } catch {
      // Fall through and attempt create — Outstand may still accept it.
    }

    try {
      await this.outstand.configureNetwork('bluesky', 'bluesky', 'bluesky');
    } catch (err) {
      // Another request may have created it concurrently.
      if (err instanceof OutstandApiError) {
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('exists')) return;
      }
      throw err;
    }
  }
}
