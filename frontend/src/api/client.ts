import type {
  AccountsResponse,
  ApiErrorBody,
  ConnectUrlResponse,
  CreatePostPayload,
  MediaUploadResponse,
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
};

export { API_BASE };
