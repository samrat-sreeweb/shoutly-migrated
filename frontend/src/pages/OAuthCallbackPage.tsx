import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { addSessionAccount, takePendingNetwork } from '../lib/sessionAccounts';

/**
 * Outstand lands here after the user approves (or declines) the OAuth
 * consent screen, e.g.:
 *   /oauth/callback?success=true&account_id=acc_123&network_unique_id=178...&username=brand
 * or on failure:
 *   /oauth/callback?success=false&error=access_denied
 *
 * There's no backend account list to consult here (and deliberately no
 * database/login for this app — see lib/sessionAccounts.ts) — Outstand's
 * account pool is shared across every visitor using this API key, so this
 * page never calls GET /api/accounts. Instead it takes the account_id
 * Outstand just handed back, pairs it with the network we stashed in
 * sessionStorage right before leaving for OAuth, and remembers *only that
 * one account* for this browser session.
 */
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

  const ok = summary.success !== 'false' && Boolean(summary.accountId);

  useEffect(() => {
    if (savedRef.current || !ok || !summary.accountId) return;
    savedRef.current = true;
    addSessionAccount({
      id: summary.accountId,
      username: summary.username ?? undefined,
      nickname: summary.username ?? undefined,
      network,
    });
    const timer = setTimeout(() => navigate('/', { replace: true }), 900);
    return () => clearTimeout(timer);
  }, [ok, summary.accountId, summary.username, network, navigate]);

  return (
    <div className="wrap">
      <header className="page-header">
        <span className="badge">OAUTH</span>
        <h1>{ok ? 'Account connected' : 'Connect result'}</h1>
        <p className="muted">
          {ok
            ? 'Saved to this browser session — taking you back to Connect & Post…'
            : 'Something went wrong. Check the app callback URL and Outstand network credentials.'}
        </p>
        <p className="nav-back">
          <NavLink to="/">← Back to Connect &amp; Post</NavLink>
        </p>
      </header>

      <section className="card">
        <h2>Callback details</h2>
        {summary.error && <p className="result-err">{summary.error}</p>}
        {!summary.error && (
          <ul className="steps">
            {summary.accountId && (
              <li>
                Account ID: <code>{summary.accountId}</code>
              </li>
            )}
            {summary.username && (
              <li>
                Username: <code>{summary.username}</code>
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
