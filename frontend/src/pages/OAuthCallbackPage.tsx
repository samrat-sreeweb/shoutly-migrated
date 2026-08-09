import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { addSessionAccount, takePendingNetwork } from '../lib/sessionAccounts';
import { api } from '../api/client';
import type { AvailablePage } from '../api/types';

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
 *
 * Facebook, LinkedIn org pages, and Google Business locations follow a THIRD
 * shape: Outstand redirects here with only `?session=<token>` — no
 * success/error/account_id — because the connecting user may manage more than
 * one Page/location and Outstand needs us to ask which one(s) to connect. That
 * token is fetched via GET /api/pending/:session to list candidates, the user
 * picks, and POST /api/pending/:session/finalize creates the account(s).
 * See https://www.outstand.so/docs/configurations/facebook and
 * https://www.outstand.so/docs/configurations/google-business.
 */
type Status = 'resolving' | 'ok' | 'error' | 'selecting' | 'finalizing';

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const savedRef = useRef(false);

  const summary = useMemo(() => {
    const success = params.get('success');
    const error = params.get('error');
    const accountId = params.get('account_id');
    const username = params.get('username');
    const session = params.get('session');
    return { success, error, accountId, username, session };
  }, [params]);

  const [network] = useState(() => takePendingNetwork() || params.get('network') || 'unknown');

  const looksLikeFailure = summary.success === 'false' || Boolean(summary.error);

  const [status, setStatus] = useState<Status>(() => {
    if (summary.session) return 'selecting';
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

  const [pendingError, setPendingError] = useState<string | null>(null);
  const [availablePages, setAvailablePages] = useState<AvailablePage[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<
    { id: string; username?: string }[]
  >([]);

  // Facebook/LinkedIn multi-page flow: fetch the list of connectable Pages
  // for this session token.
  useEffect(() => {
    if (status !== 'selecting' || !summary.session) return;
    let cancelled = false;
    api
      .getPendingConnection(summary.session)
      .then((res) => {
        if (cancelled) return;
        const pages = res.data?.availablePages ?? [];
        setAvailablePages(pages);
        setSelectedIds(pages.map((p) => p.id));
        if (!pages.length) setPendingError('No connectable Pages were returned for this account.');
      })
      .catch((err) => {
        if (cancelled) return;
        setPendingError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [status, summary.session]);

  function togglePage(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleFinalize() {
    if (!summary.session || !selectedIds.length) return;
    setStatus('finalizing');
    setPendingError(null);
    try {
      const res = await api.finalizePendingConnection(summary.session, selectedIds);
      const accounts = res.connectedAccounts ?? [];
      for (const account of accounts) {
        addSessionAccount({
          id: account.id,
          username: account.username,
          nickname: account.nickname ?? account.username,
          network: account.network ?? network,
        });
      }
      setConnectedAccounts(accounts.map((a) => ({ id: a.id, username: a.username })));
      setStatus('ok');
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : String(err));
      setStatus('selecting');
    }
  }

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
    // Single-account path only (account_id in the callback, or resolved via
    // GET /api/accounts fallback). The multi-page finalize path above
    // already saves its own accounts and doesn't need this.
    if (savedRef.current || status !== 'ok' || !resolved?.id || connectedAccounts.length) return;
    savedRef.current = true;
    addSessionAccount({
      id: resolved.id,
      username: resolved.username,
      nickname: resolved.username,
      network,
    });
    const timer = setTimeout(() => navigate('/', { replace: true }), 900);
    return () => clearTimeout(timer);
  }, [status, resolved, network, navigate, connectedAccounts]);

  useEffect(() => {
    if (status !== 'ok' || !connectedAccounts.length) return;
    const timer = setTimeout(() => navigate('/', { replace: true }), 1200);
    return () => clearTimeout(timer);
  }, [status, connectedAccounts, navigate]);

  const heading =
    status === 'ok'
      ? 'Account connected'
      : status === 'resolving'
        ? 'Finishing up…'
        : status === 'selecting'
          ? 'Choose Pages to connect'
          : status === 'finalizing'
            ? 'Connecting…'
            : 'Connect result';
  const subtext =
    status === 'ok'
      ? 'Saved to this browser session — taking you back to Connect & Post…'
      : status === 'resolving'
        ? 'Outstand didn’t send back an account id directly — confirming the connection now…'
        : status === 'selecting'
          ? 'This account manages more than one Page — pick which one(s) to connect.'
          : status === 'finalizing'
            ? 'Creating the selected account(s)…'
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

      {(status === 'selecting' || status === 'finalizing') && (
        <section className="card">
          <h2>Available Pages</h2>
          {pendingError && <p className="result-err">{pendingError}</p>}
          {!availablePages.length && !pendingError && <p className="muted">Loading Pages…</p>}
          {availablePages.length > 0 && (
            <>
              <ul className="steps">
                {availablePages.map((page) => (
                  <li key={page.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(page.id)}
                        disabled={status === 'finalizing'}
                        onChange={() => togglePage(page.id)}
                      />{' '}
                      {page.name || page.username || page.id}
                      {page.type ? ` (${page.type})` : ''}
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-primary"
                disabled={status === 'finalizing' || !selectedIds.length}
                onClick={() => void handleFinalize()}
              >
                {status === 'finalizing' ? 'Connecting…' : `Connect ${selectedIds.length} selected`}
              </button>
            </>
          )}
        </section>
      )}

      {status !== 'selecting' && status !== 'finalizing' && (
        <section className="card">
          <h2>Callback details</h2>
          {status === 'error' && summary.error && <p className="result-err">{summary.error}</p>}
          {status !== 'error' && (
            <ul className="steps">
              {connectedAccounts.length > 0 &&
                connectedAccounts.map((a) => (
                  <li key={a.id}>
                    Connected: <code>{a.username || a.id}</code>
                  </li>
                ))}
              {!connectedAccounts.length && resolved?.id && (
                <li>
                  Account ID: <code>{resolved.id}</code>
                </li>
              )}
              {!connectedAccounts.length && resolved?.username && (
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
      )}
    </div>
  );
}
