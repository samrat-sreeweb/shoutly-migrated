export interface SocialAccount {
  id: string;
  nickname?: string;
  username?: string;
  profile_picture_url?: string;
  network?: string;
}

export interface Post {
  id: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  socialAccounts?: Array<{
    id?: string;
    network?: string;
    username?: string;
    status?: string;
    error?: string | null;
    platformPostId?: string | null;
    platformPostUrl?: string | null;
  }>;
  [key: string]: unknown;
}

export interface ApiErrorBody {
  success: false;
  error?: string;
  details?: unknown;
}

export interface AccountsResponse {
  success: true;
  accounts: SocialAccount[];
}

export interface ConnectUrlResponse {
  success: true;
  authUrl: string;
}

export interface PostResponse {
  success: true;
  post: Post;
}

export interface MediaUploadResponse {
  success: true;
  url: string;
  filename: string;
}

export interface MediaRef {
  url: string;
  filename?: string;
}

export interface YoutubeOptions {
  isShort?: boolean;
  privacyStatus?: 'public' | 'private' | 'unlisted';
  title?: string;
  tags?: string[];
  madeForKids?: boolean;
  categoryId?: string;
}

export interface CreatePostPayload {
  accountId: string;
  content: string;
  scheduledAt?: string;
  media?: MediaRef[];
  youtube?: YoutubeOptions;
}
