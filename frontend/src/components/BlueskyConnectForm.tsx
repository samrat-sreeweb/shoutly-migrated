import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { SocialAccount } from '../api/types';

interface BlueskyConnectFormProps {
  onConnected: (account: SocialAccount) => void;
}

/**
 * Bluesky has no OAuth redirect — Outstand authenticates with a handle +
 * "app password" (created at bsky.app/settings/app-passwords), sent once to
 * create an AT Protocol session. This form exists so that password is typed
 * directly by whoever owns the account, straight into the request — it's
 * never hardcoded, stored, or passed through any other hand along the way.
 */
export function BlueskyConnectForm({ onConnected }: BlueskyConnectFormProps) {
  const [handle, setHandle] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMessage(null);

    if (!handle.trim() || !appPassword.trim()) {
      setError('Handle and app password are both required.');
      return;
    }

    setSubmitting(true);
    try {
      const { account } = await api.connectBluesky({
        handle: handle.trim().replace(/^@/, ''),
        appPassword: appPassword.trim(),
      });
      if (!account?.id) {
        throw new Error('Connect succeeded but no account id was returned.');
      }
      onConnected(account);
      setOkMessage(
        `Connected ${account.username || account.nickname || account.id} — ready to post.`,
      );
      setHandle('');
      setAppPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card">
      <h2>2b. Connect Bluesky</h2>
      <p className="muted">
        Bluesky doesn't use OAuth — create an app password at{' '}
        <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer">
          bsky.app/settings/app-passwords
        </a>{' '}
        and enter it below (not your main Bluesky password). It's sent once to connect and isn't
        stored by this app.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <label htmlFor="bsky-handle">Handle</label>
        <input
          id="bsky-handle"
          type="text"
          placeholder="you.bsky.social"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="bsky-app-password">App password</label>
        <input
          id="bsky-app-password"
          type="password"
          placeholder="xxxx-xxxx-xxxx-xxxx"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="result-err">{error}</p>}
        {okMessage && <p className="result-ok">{okMessage}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Connecting…' : 'Connect Bluesky'}
        </button>
      </form>
    </section>
  );
}
