import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { CreatePostPayload, SocialAccount, YoutubeOptions } from '../api/types';

interface ComposePostFormProps {
  accounts: SocialAccount[];
  submitting: boolean;
  result: { ok: boolean; message: string } | null;
  onSubmit: (payload: CreatePostPayload & { file?: File }) => Promise<void>;
}

function isVideoFile(file: File) {
  return file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
}

function isImageFile(file: File) {
  return file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(file.name);
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
  const [file, setFile] = useState<File | null>(null);
  const [ytTitle, setYtTitle] = useState('');
  const [ytIsShort, setYtIsShort] = useState(true);
  const [ytPrivacy, setYtPrivacy] = useState<YoutubeOptions['privacyStatus']>('public');
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The native <input type="file"> keeps showing its last-chosen filename
  // even after we clear `file` in React state — browsers don't let React
  // control that field's displayed value. Without this, switching accounts
  // (which clears `file` below) leaves the button visually showing a file
  // that is no longer actually attached, so a post can silently go out
  // text-only while the UI still looks like media is selected.
  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Same reasoning: once a post succeeds, drop the previous file so the
  // next post (possibly to a different network) can't be mistaken for
  // still having that media attached.
  useEffect(() => {
    if (result?.ok) clearFile();
  }, [result]);

  const effectiveAccountId = accountId || accounts[0]?.id || '';
  const selected = useMemo(
    () => accounts.find((a) => a.id === effectiveAccountId),
    [accounts, effectiveAccountId],
  );
  const network = (selected?.network || '').toLowerCase();
  const isYoutube = network === 'youtube';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!effectiveAccountId || !content.trim()) {
      setFormError('Account and content are required.');
      return;
    }

    if (isYoutube) {
      if (!file) {
        setFormError('YouTube requires a video file.');
        return;
      }
      if (!isVideoFile(file)) {
        setFormError('YouTube only accepts video files (e.g. MP4, MOV).');
        return;
      }
    } else if (file && !isImageFile(file) && !isVideoFile(file)) {
      setFormError('Attach an image or video file.');
      return;
    }

    const scheduledAt = scheduledAtLocal
      ? new Date(scheduledAtLocal).toISOString()
      : undefined;

    const youtube: YoutubeOptions | undefined = isYoutube
      ? {
          isShort: ytIsShort,
          privacyStatus: ytPrivacy,
          ...(ytTitle.trim() ? { title: ytTitle.trim() } : {}),
        }
      : undefined;

    await onSubmit({
      accountId: effectiveAccountId,
      content: content.trim(),
      scheduledAt,
      youtube,
      file: file || undefined,
    });
  }

  const accept = isYoutube
    ? 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm'
    : 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov';

  return (
    <section className="card">
      <h2>3. Compose &amp; Post</h2>
      <p className="muted">
        {isYoutube
          ? 'YouTube needs a video file. Text becomes the description; optional title/Shorts settings below.'
          : 'Optional media: images or short videos work for most networks. Leave empty for text-only.'}
      </p>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <label htmlFor="account-select">Post as</label>
        <select
          id="account-select"
          required
          value={effectiveAccountId}
          onChange={(e) => {
            setAccountId(e.target.value);
            clearFile();
            setFormError(null);
          }}
          disabled={!accounts.length}
        >
          {!accounts.length && <option value="">No accounts</option>}
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              [{a.network || 'unknown'}] {a.nickname || a.username || a.id} ({a.id})
            </option>
          ))}
        </select>

        <label htmlFor="content">{isYoutube ? 'Description' : 'Content'}</label>
        <textarea
          id="content"
          rows={4}
          placeholder={isYoutube ? 'Video description…' : 'What do you want to publish?'}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label htmlFor="media-file">
          {isYoutube ? 'Video file (required)' : 'Media file (optional)'}
        </label>
        <input
          id="media-file"
          type="file"
          ref={fileInputRef}
          accept={accept}
          required={isYoutube}
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setFormError(null);
          }}
        />
        {file ? (
          <p className="muted media-hint">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        ) : (
          <p className="muted media-hint">
            {isYoutube
              ? 'No video selected yet — YouTube requires a video file.'
              : 'No media attached — this post will be text-only.'}
          </p>
        )}

        {isYoutube && (
          <div className="youtube-options">
            <label htmlFor="yt-title">YouTube title (optional)</label>
            <input
              id="yt-title"
              type="text"
              maxLength={100}
              placeholder="Defaults to first line of description"
              value={ytTitle}
              onChange={(e) => setYtTitle(e.target.value)}
            />

            <label htmlFor="yt-privacy">Privacy</label>
            <select
              id="yt-privacy"
              value={ytPrivacy}
              onChange={(e) =>
                setYtPrivacy(e.target.value as YoutubeOptions['privacyStatus'])
              }
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>

            <label className="checkbox-row" htmlFor="yt-short">
              <input
                id="yt-short"
                type="checkbox"
                checked={ytIsShort}
                onChange={(e) => setYtIsShort(e.target.checked)}
              />
              Publish as YouTube Short
            </label>
          </div>
        )}

        <label htmlFor="scheduled-at">
          Schedule for (optional, leave blank to publish now)
        </label>
        <input
          id="scheduled-at"
          type="datetime-local"
          value={scheduledAtLocal}
          onChange={(e) => setScheduledAtLocal(e.target.value)}
        />

        {(formError || null) && <p className="result-err">{formError}</p>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !accounts.length}
        >
          {submitting ? 'Uploading / publishing…' : 'Publish'}
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
