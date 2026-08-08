import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { CreatePostPayload, Post } from '../api/types';
import { AccountList } from '../components/AccountList';
import { ComposePostForm } from '../components/ComposePostForm';
import { ConnectSection } from '../components/ConnectSection';
import { Header } from '../components/Header';
import { getSessionAccounts, removeSessionAccount, setPendingNetwork } from '../lib/sessionAccounts';

function summarizePostOutcome(post: Post): { ok: boolean; message: string } {
  const accounts = post.socialAccounts || [];
  const failed = accounts.filter((a) => a.status === 'failed');
  const published = accounts.filter((a) => a.status === 'published');
  const pending = accounts.filter(
    (a) => !a.status || a.status === 'pending',
  );

  if (failed.length && !published.length) {
    const errs = failed
      .map((a) => `${a.network || 'account'}: ${a.error || 'failed'}`)
      .join('\n');
    return { ok: false, message: `Publish failed (post ${post.id}).\n${errs}` };
  }

  if (published.length) {
    const links = published
      .map((a) => {
        const label = a.network || 'account';
        return a.platformPostUrl
          ? `${label}: ${a.platformPostUrl}`
          : `${label}: ${a.platformPostId || 'published'}`;
      })
      .join('\n');
    const extra = failed.length
      ? `\nPartial failures:\n${failed.map((a) => `${a.network}: ${a.error}`).join('\n')}`
      : '';
    return {
      ok: true,
      message: `Live on platform(s) (post ${post.id}).\n${links}${extra}`,
    };
  }

  if (pending.length) {
    return {
      ok: true,
      message: `Queued (post ${post.id}) — still publishing. Refresh status in a few seconds.`,
    };
  }

  return {
    ok: true,
    message: `Accepted (post ${post.id}). Check status shortly — create ≠ live on every network.`,
  };
}

async function waitForPostOutcome(postId: string, attempts = 8): Promise<Post> {
  let last: Post | undefined;
  for (let i = 0; i < attempts; i++) {
    const { post } = await api.getPost(postId);
    last = post;
    const accounts = post.socialAccounts || [];
    const settled =
      accounts.length > 0 &&
      accounts.every((a) => a.status === 'published' || a.status === 'failed');
    if (settled || post.publishedAt) return post;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return last!;
}

export function HomePage() {
  const [network, setNetwork] = useState('x');
  const [accounts, setAccounts] = useState(() => getSessionAccounts());
  const [connecting, setConnecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const refreshAccounts = useCallback(() => {
    setAccounts(getSessionAccounts());
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  async function handleConnect() {
    setConnecting(true);
    try {
      setPendingNetwork(network);
      const redirectUri = `${window.location.origin}/oauth/callback`;
      const data = await api.getConnectUrl(network, redirectUri);
      window.location.href = data.authUrl;
    } catch (err) {
      setConnecting(false);
      window.alert(
        `Failed to start connect flow: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  function handleRemove(accountId: string) {
    setAccounts(removeSessionAccount(accountId));
  }

  async function handlePost(payload: CreatePostPayload & { file?: File }) {
    setSubmitting(true);
    setResult(null);
    try {
      let media = payload.media;
      if (payload.file) {
        const uploaded = await api.uploadMedia(payload.file);
        media = [{ url: uploaded.url, filename: uploaded.filename || payload.file.name }];
      }

      const { file: _file, ...rest } = payload;
      const data = await api.createPost({ ...rest, media });
      const outcome = await waitForPostOutcome(String(data.post.id));
      setResult(summarizePostOutcome(outcome));
    } catch (err) {
      setResult({
        ok: false,
        message: `Failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap">
      <Header />
      <ConnectSection
        network={network}
        connecting={connecting}
        onConnect={() => void handleConnect()}
        onRefresh={refreshAccounts}
        onNetworkChange={setNetwork}
      />
      <AccountList accounts={accounts} onRemove={handleRemove} />
      <ComposePostForm
        accounts={accounts}
        submitting={submitting}
        result={result}
        onSubmit={handlePost}
      />
    </div>
  );
}
