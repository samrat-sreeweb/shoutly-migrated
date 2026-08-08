import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { SocialAccount } from '../api/types';
import { AccountList } from '../components/AccountList';
import { ComposePostForm } from '../components/ComposePostForm';
import { ConnectSection } from '../components/ConnectSection';
import { Header } from '../components/Header';

export function HomePage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAccounts('facebook');
      setAccounts(data.accounts);
    } catch (err) {
      setAccounts([]);
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const data = await api.getConnectUrl('facebook');
      window.open(data.authUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.alert(
        `Failed to start connect flow: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setConnecting(false);
    }
  }

  async function handlePost(payload: {
    accountId: string;
    content: string;
    scheduledAt?: string;
  }) {
    setSubmitting(true);
    setResult(null);
    try {
      const data = await api.createPost(payload);
      setResult({
        ok: true,
        message: payload.scheduledAt
          ? `Scheduled. Post ID: ${data.post.id}`
          : `Published. Post ID: ${data.post.id}`,
      });
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
        connecting={connecting}
        onConnect={() => void handleConnect()}
        onRefresh={() => void loadAccounts()}
      />
      <AccountList accounts={accounts} loading={loading} error={error} />
      <ComposePostForm
        accounts={accounts}
        submitting={submitting}
        result={result}
        onSubmit={handlePost}
      />
    </div>
  );
}
