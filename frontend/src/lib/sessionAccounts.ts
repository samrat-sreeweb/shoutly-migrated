// Per-browser-session connected account list.
//
// There is no user login and no database in this app (by design, for quick
// idea-testing). Outstand itself only tracks one flat pool of connected
// accounts per API key/org -- it has no concept of "which visitor connected
// this." So instead of asking the backend "who's connected?" (which would
// return everyone's accounts), each browser tab remembers only the accounts
// *it* personally connected, in sessionStorage. That storage is cleared
// automatically when the tab/browser closes.
//
// This is a UI-level convenience, not a security boundary: the underlying
// Outstand API key can still see every account across every visitor. Good
// enough for prototyping, not for a real multi-tenant product.

import type { SocialAccount } from '../api/types';

const STORAGE_KEY = 'shoutly.session.accounts';
const PENDING_NETWORK_KEY = 'shoutly.session.pendingNetwork';

export function getSessionAccounts(): SocialAccount[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addSessionAccount(account: SocialAccount): SocialAccount[] {
  const existing = getSessionAccounts().filter((a) => a.id !== account.id);
  const next = [...existing, account];
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeSessionAccount(accountId: string): SocialAccount[] {
  const next = getSessionAccounts().filter((a) => a.id !== accountId);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearSessionAccounts(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Stash which network a connect attempt was for, right before navigating away to OAuth. */
export function setPendingNetwork(network: string): void {
  sessionStorage.setItem(PENDING_NETWORK_KEY, network);
}

export function takePendingNetwork(): string | null {
  const value = sessionStorage.getItem(PENDING_NETWORK_KEY);
  sessionStorage.removeItem(PENDING_NETWORK_KEY);
  return value;
}
