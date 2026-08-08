import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { AccountList } from '../components/AccountList';
import { ComposePostForm } from '../components/ComposePostForm';
import { ConnectSection } from '../components/ConnectSection';
import { Header } from '../components/Header';
import { getSessionAccounts, removeSessionAccount, setPendingNetwork } from '../lib/sessionAccounts';

export function HomePage() {
  const [network, setNetwork] = useState('x');
  const [accounts, setAccounts] = useState(() => getSessionAccounts());
  const [connecting, setConnecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // No backend call here on purpose — accounts live only in this browser's
  // sessionStorage (see lib/sessionAccounts.ts). GET /api/accounts would
  // return every account connected under the shared Outstand API key, not
  // just the ones this visitor connected.
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
      // Same-tab navigation (not window.open): the OAuth round trip has to
      // land back in this tab so it shares this tab's sessionStorage.
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
