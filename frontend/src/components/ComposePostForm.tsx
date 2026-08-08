import { useState, type FormEvent } from 'react';
import type { SocialAccount } from '../api/types';

interface ComposePostFormProps {
  accounts: SocialAccount[];
  submitting: boolean;
  result: { ok: boolean; message: string } | null;
  onSubmit: (payload: {
    accountId: string;
    content: string;
    scheduledAt?: string;
  }) => Promise<void>;
}

export function ComposePostForm({
  accounts,
  submitting,
  result,
  onSubmit,
}: ComposePostFormProps) {
  const [accountId, setAccountId] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAtLocal, setScheduledAtLocal] = useState('');

  const effectiveAccountId = accountId || accounts[0]?.id || '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!effectiveAccountId || !content.trim()) return;

    const scheduledAt = scheduledAtLocal
      ? new Date(scheduledAtLocal).toISOString()
      : undefined;

    await onSubmit({
      accountId: effectiveAccountId,
      content: content.trim(),
      scheduledAt,
    });
  }

  return (
    <section className="card">
      <h2>3. Compose &amp; Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="account-select">Post as</label>
        <select
          id="account-select"
          required
          value={effectiveAccountId}
          onChange={(e) => setAccountId(e.target.value)}
          disabled={!accounts.length}
        >
          {!accounts.length && <option value="">No accounts</option>}
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nickname || a.username} ({a.id})
            </option>
          ))}
        </select>

        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          rows={4}
          placeholder="What do you want to publish?"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label htmlFor="scheduled-at">
          Schedule for (optional, leave blank to publish now)
        </label>
        <input
          id="scheduled-at"
          type="datetime-local"
          value={scheduledAtLocal}
          onChange={(e) => setScheduledAtLocal(e.target.value)}
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !accounts.length}
        >
          {submitting ? 'Publishing…' : 'Publish'}
        </button>
      </form>
      {result && (
        <div className={result.ok ? 'result-ok' : 'result-err'} id="post-result">
          {result.message}
        </div>
      )}
    </section>
  );
}
