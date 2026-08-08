import type { SocialAccount } from '../api/types';

interface AccountListProps {
  accounts: SocialAccount[];
  onRemove: (accountId: string) => void;
}

export function AccountList({ accounts, onRemove }: AccountListProps) {
  return (
    <section className="card">
      <h2>2. Connected accounts (this browser session)</h2>
      <p className="muted">
        Only accounts you personally connected in this tab are listed here. This clears when the
        browser session ends — nothing is saved to a database.
      </p>
      <div className="accounts-list">
        {accounts.length === 0 && (
          <p className="muted">Nothing connected yet. Pick a network above and hit Connect.</p>
        )}
        {accounts.map((a) => (
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
            <span className="network-badge">{a.network || 'unknown'}</span>
            <span>{a.nickname || a.username || 'Unnamed'}</span>
            <span className="id">{a.id}</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onRemove(a.id)}
              aria-label={`Remove ${a.nickname || a.username || a.id}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
