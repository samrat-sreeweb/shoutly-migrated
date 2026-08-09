import type {
  AccountsResponse,
  ApiErrorBody,
  ConnectBlueskyPayload,
  ConnectBlueskyResponse,
  ConnectUrlResponse,
  CreatePinterestBoardResponse,
  CreatePostPayload,
  MediaUploadResponse,
  PinterestBoardsResponse,
  PostResponse,
} from './types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init?.headers,
    },
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const body = data as { success?: boolean; error?: string } & T;
  if (!res.ok || body.success === false) {
    const err = data as ApiErrorBody;
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }

  return body;
}

/** Mirrors Express routes from outstand-integration/server.mjs */
export const api = {
  getAccounts(network = 'facebook') {
    const qs = new URLSearchParams({ network });
    return request<AccountsResponse>(`/api/accounts?${qs}`);
  },

  getConnectUrl(network = 'facebook', redirectUri?: string) {
    const qs = new URLSearchParams({ network });
    if (redirectUri) qs.set('redirectUri', redirectUri);
    return request<ConnectUrlResponse>(`/api/connect-url?${qs}`);
  },

  uploadMedia(file: File) {
    const body = new FormData();
    body.append('file', file);
    return request<MediaUploadResponse>('/api/media/upload', {
      method: 'POST',
      body,
    });
  },

  createPost(payload: CreatePostPayload) {
    return request<PostResponse>('/api/post', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPost(id: string) {
    return request<PostResponse>(`/api/posts/${encodeURIComponent(id)}`);
  },

  listPinterestBoards(accountId: string) {
    return request<PinterestBoardsResponse>(
      `/api/accounts/${encodeURIComponent(accountId)}/pinterest/boards`,
    );
  },

  createPinterestBoard(accountId: string, name: string) {
    return request<CreatePinterestBoardResponse>(
      `/api/accounts/${encodeURIComponent(accountId)}/pinterest/boards`,
      {
        method: 'POST',
        body: JSON.stringify({ name, privacy: 'PUBLIC' }),
      },
    );
  },

  // Bluesky has no OAuth redirect — the handle + app password are submitted
  // straight from the form the user fills in, over to our backend, over to
  // Outstand. Nothing in this client ever stores or logs the password.
  connectBluesky(payload: ConnectBlueskyPayload) {
    return request<ConnectBlueskyResponse>('/api/accounts/bluesky', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export { API_BASE };
