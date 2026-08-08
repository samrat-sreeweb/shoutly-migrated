export interface SocialAccount {
  id: string;
  nickname?: string;
  username?: string;
  profile_picture_url?: string;
  network?: string;
}

export interface Post {
  id: string;
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

export interface CreatePostPayload {
  accountId: string;
  content: string;
  scheduledAt?: string;
}
