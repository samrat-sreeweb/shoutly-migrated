import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { addSessionAccount, takePendingNetwork } from '../lib/sessionAccounts';
import { api } from '../api/client';

/**
 * Outstand lands here after the user approves (or declines) the OAuth
 * consent screen, e.g.:
 *   /oauth/callback?success=true&account_id=acc_123&network_unique_id=178...&username=brand
 * or on failure:
 *   /oauth/callback?success=false&error=access_denied
 *
 * Some networks (observed: Threads) don't follow that shape — they redirect
 * with only a human-readable `success` sentence and no account_id/username
 * at all, even though the account connected successfully on Outstand's end.
 * When that happens we fall back to GET /api/accounts?network=<network> and
 * take the most recently created account for that network. This is the one
 * place this app calls the shared accounts list instead of relying purely
 * on sessionStorage — see lib/sessionAccounts.ts for why that's normally
 * avoided. It's a narrow, best-effort exception used only when Outstand's
 * own callback doesn't give us an account id any other way: if two visitors
 * connected the same network at the exact same instant, one could
 * momentarily grab the other's account id this way. Acceptable for this
 * "idea testing" app; not something to build on for anything
 * security-sensitive.
 */
type Status = 'resolving' | 'ok' | 'error';

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const savedRef = useRef(false);

  const summary = useMemo(() => {
    const success = params.get('success');
    const error = params.get('error');
    const accountId = params.get('account_id');
    const username = params.get('username');
    return { success, error, accountId, username };
  }, [params]);

  const [network] = useState(() => takePendingNetwork() || params.get('network') || 'unknown');

  const looksLikeFailure = summary.success === 'false' || Boolean(summary.error);

  const [status, setStatus] = useState<Status>(() => {
    if (looksLikeFailure) return 'error';
    if (summary.accountId) return 'ok';
    // success is present but Outstand didn't hand back an account_id for
    // this network — go look it up before deciding this failed.
    if (summary.success) return 'resolving';
    return 'error';
  });

  const [resolved, setResolved] = useState<{ id: string; username?: string } | null>(
    summary.accountId ? { id: summary.accountId, username: summary.username ?? undefined } : null,
  );

  useEffect(() => {
    if (status !== 'resolving') return;
    let cancelled = false;
    api
      .getAccounts(network)
      .then((res) => {
        if (cancelled) return;
        const accounts = res.accounts ?? [];
        const newest = [...accounts].sort((a, b) =>
          (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
        )[0];
        if (newest) {
          setResolved({ id: newest.id, username: newest.username });
          setStatus('ok');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [status, network]);

  useEffect(() => {
    if (savedRef.current || status !== 'ok' || !resolved?.id) return;
    savedRef.current = true;
    addSessionAccount({
      id: resolved.id,
      username: resolved.username,
      nickname: resolved.username,
      network,
    });
    const timer = setTimeout(() => navigate('/', { replace: true }), 900);
    return () => clearTimeout(timer);
  }, [status, resolved, network, navigate]);

  const heading =
    status === 'ok' ? 'Account connected' : status === 'resolving' ? 'Finishing up…' : 'Connect result';
  const subtext =
    status === 'ok'
      ? 'Saved to this browser session — taking you back to Connect & Post…'
      : status === 'resolving'
        ? 'Outstand didn’t send back an account id directly — confirming the connection now…'
        : 'Something went wrong. Check the app callback URL and Outstand network credentials.';

  return (
    <div className="wrap">
      <header className="page-header">
        <span className="badge">OAUTH</span>
        <h1>{heading}</h1>
        <p className="muted">{subtext}</p>
        <p className="nav-back">
          <NavLink to="/">← Back to Connect &amp; Post</NavLink>
        </p>
      </header>

      <section className="card">
        <h2>Callback details</h2>
        {status === 'error' && summary.error && <p className="result-err">{summary.error}</p>}
        {status !== 'error' && (
          <ul className="steps">
            {resolved?.id && (
              <li>
                Account ID: <code>{resolved.id}</code>
              </li>
            )}
            {resolved?.username && (
              <li>
                Username: <code>{resolved.username}</code>
              </li>
            )}
            <li>
              Network: <code>{network}</code>
            </li>
          </ul>
        )}
      </section>
    </div>
  );
}
