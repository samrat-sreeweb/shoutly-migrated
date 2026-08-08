import type { SocialAccount } from '../api/types';

interface AccountListProps {
  accounts: SocialAccount[];
  loading: boolean;
  error: string | null;
}

export function AccountList({ accounts, loading, error }: AccountListProps) {
  return (
    <section className="card">
      <h2>2. Connected Facebook Pages</h2>
      <div className="accounts-list">
        {loading && <p className="muted">Loading…</p>}
        {!loading && error && <p className="result-err">{error}</p>}
        {!loading && !error && accounts.length === 0 && (
          <p className="muted">
            No Facebook Pages connected yet. Click &quot;Connect Facebook Page&quot; above.
          </p>
        )}
        {!loading &&
          !error &&
          accounts.map((a) => (
            <div key={a.id} className="account-item">
              {a.profile_picture_url ? (
                <img
                  className="pic"
                  src={a.profile_picture_url}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="pic pic-placeholder" />
              )}
              <span>{a.nickname || a.username || 'Unnamed'}</span>
              <span className="id">{a.id}</span>
            </div>
          ))}
      </div>
    </section>
  );
}
