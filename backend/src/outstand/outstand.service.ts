import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutstandApiError } from './outstand-api.error';

export { OutstandApiError };

@Injectable()
export class OutstandService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('OUTSTAND_BASE_URL') ||
      'https://api.outstand.so';
    this.apiKey = this.config.get<string>('OUTSTAND_API_KEY') || '';
  }

  private requireApiKey(): string {
    if (!this.apiKey) {
      throw new OutstandApiError(
        'Missing OUTSTAND_API_KEY. Add it to your .env file (see .env.example).',
        500,
      );
    }
    return this.apiKey;
  }

  private async request<T = Record<string, unknown>>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      raw?: boolean;
    } = {},
  ): Promise<T> {
    const apiKey = this.requireApiKey();
    const url = `${this.baseUrl}${path}`;
    const { body, headers = {}, raw = false } = options;

    const init: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(raw ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
    };

    if (body !== undefined) {
      init.body = raw ? (body as BodyInit) : JSON.stringify(body);
    }

    const res = await fetch(url, init);
    const text = await res.text();
    let data: Record<string, unknown>;
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const message =
        (data?.error as string) ||
        (data?.message as string) ||
        `Request failed with status ${res.status}`;
      throw new OutstandApiError(message, res.status, data);
    }

    return data as T;
  }

  // ---- Social accounts ----
  listSocialAccounts(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request('GET', `/v1/social-accounts${qs ? `?${qs}` : ''}`);
  }

  getAccountMetrics(accountId: string, params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(
      'GET',
      `/v1/social-accounts/${accountId}/metrics${qs ? `?${qs}` : ''}`,
    );
  }

  checkAccountHealth(accountId: string) {
    return this.request('GET', `/v1/social-accounts/${accountId}/health`);
  }

  deleteSocialAccount(accountId: string) {
    return this.request('DELETE', `/v1/social-accounts/${accountId}`);
  }

  // ---- OAuth / connecting networks ----
  configureNetwork(network: string, clientKey: string, clientSecret: string) {
    return this.request('POST', '/v1/social-networks', {
      body: {
        network,
        client_key: clientKey,
        client_secret: clientSecret,
      },
    });
  }

  listSocialNetworks() {
    return this.request('GET', '/v1/social-networks');
  }

  deleteSocialNetwork(networkId: string) {
    return this.request('DELETE', `/v1/social-networks/${networkId}`);
  }

  getAuthUrl(
    network: string,
    options: {
      redirectUri?: string;
      tenantId?: string;
      scopes?: string[];
      forceAccountSelection?: boolean;
    } = {},
  ) {
    const { redirectUri, tenantId, scopes, forceAccountSelection } = options;
    return this.request('POST', `/v1/social-networks/${network}/auth-url`, {
      body: {
        ...(redirectUri ? { redirect_uri: redirectUri } : {}),
        ...(tenantId ? { tenant_id: tenantId } : {}),
        ...(scopes ? { scopes } : {}),
        ...(forceAccountSelection !== undefined
          ? { force_account_selection: forceAccountSelection }
          : {}),
      },
    });
  }

  getPendingConnection(sessionToken: string) {
    return this.request('GET', `/v1/social-accounts/pending/${sessionToken}`);
  }

  finalizePendingConnection(
    sessionToken: string,
    selectedPageIds: string[],
  ) {
    return this.request(
      'POST',
      `/v1/social-accounts/pending/${sessionToken}/finalize`,
      { body: { selectedPageIds } },
    );
  }

  connectBluesky(handle: string, appPassword: string) {
    return this.request('POST', '/v1/social-accounts/bluesky', {
      body: { handle, appPassword },
    });
  }

  // ---- Pinterest ----
  listPinterestBoards(accountId: string) {
    return this.request('GET', `/v1/pinterest/accounts/${accountId}/boards`);
  }

  createPinterestBoard(
    accountId: string,
    body: { name: string; privacy?: string; description?: string },
  ) {
    return this.request('POST', `/v1/pinterest/accounts/${accountId}/boards`, {
      body,
    });
  }

  getPinterestProfile(accountId: string) {
    return this.request('GET', `/v1/pinterest/accounts/${accountId}/profile`);
  }

  // ---- Media ----
  requestUploadUrl(filename: string, contentType: string) {
    return this.request<{
      data: { id: string; upload_url: string };
    }>('POST', '/v1/media/upload', {
      body: { filename, content_type: contentType },
    });
  }

  async putFile(
    uploadUrl: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<boolean> {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: new Uint8Array(fileBuffer),
    });
    if (!res.ok) {
      throw new OutstandApiError(
        `Upload PUT failed with status ${res.status}`,
        res.status,
      );
    }
    return true;
  }

  confirmUpload(mediaId: string, size: number) {
    return this.request<{
      data?: { url: string; filename: string };
      url?: string;
      filename?: string;
    }>('POST', `/v1/media/${mediaId}/confirm`, { body: { size } });
  }

  // ---- Posts ----
  createPost(payload: Record<string, unknown>) {
    return this.request<{ post: Record<string, unknown> }>('POST', '/v1/posts/', {
      body: payload,
    });
  }

  updatePost(postId: string, payload: Record<string, unknown>) {
    return this.request('PATCH', `/v1/posts/${postId}`, { body: payload });
  }

  listPosts(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request('GET', `/v1/posts${qs ? `?${qs}` : ''}`);
  }

  getPost(postId: string) {
    return this.request<{ post: Record<string, unknown> }>(
      'GET',
      `/v1/posts/${postId}`,
    );
  }

  deletePost(postId: string) {
    return this.request('DELETE', `/v1/posts/${postId}`);
  }
}
