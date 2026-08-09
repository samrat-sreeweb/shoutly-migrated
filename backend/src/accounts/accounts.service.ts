import { Injectable } from '@nestjs/common';
import { OutstandService } from '../outstand/outstand.service';

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
}
