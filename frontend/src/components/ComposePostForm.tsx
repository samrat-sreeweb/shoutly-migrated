import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type {
  CreatePostPayload,
  GoogleBusinessOptions,
  PinterestBoard,
  PinterestOptions,
  SocialAccount,
  YoutubeOptions,
} from '../api/types';

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
  const [pinBoardId, setPinBoardId] = useState('');
  const [pinTitle, setPinTitle] = useState('');
  const [pinLink, setPinLink] = useState('');
  const [pinAltText, setPinAltText] = useState('');
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [gbpTopic, setGbpTopic] =
    useState<NonNullable<GoogleBusinessOptions['topicType']>>('STANDARD');
  const [gbpCtaType, setGbpCtaType] = useState<
    NonNullable<GoogleBusinessOptions['callToAction']>['actionType'] | ''
  >('');
  const [gbpCtaUrl, setGbpCtaUrl] = useState('');
  const [gbpEventTitle, setGbpEventTitle] = useState('');
  const [gbpEventStart, setGbpEventStart] = useState('');
  const [gbpEventEnd, setGbpEventEnd] = useState('');
  const [gbpCoupon, setGbpCoupon] = useState('');
  const [gbpRedeemUrl, setGbpRedeemUrl] = useState('');
  const [gbpTerms, setGbpTerms] = useState('');
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
  const isPinterest = network === 'pinterest';
  const isGoogleBusiness = network === 'google_business';
  const mediaRequired = isYoutube || isPinterest;

  useEffect(() => {
    if (!isPinterest || !effectiveAccountId) {
      setBoards([]);
      setBoardsError(null);
      setPinBoardId('');
      return;
    }

    let cancelled = false;
    setBoardsLoading(true);
    setBoardsError(null);
    api
      .listPinterestBoards(effectiveAccountId)
      .then((res) => {
        if (cancelled) return;
        const list = res.boards ?? [];
        setBoards(list);
        setPinBoardId((prev) => prev || list[0]?.id || '');
      })
      .catch((err) => {
        if (cancelled) return;
        setBoards([]);
        setBoardsError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setBoardsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isPinterest, effectiveAccountId]);

  async function handleCreateBoard() {
    const name = newBoardName.trim();
    if (!name || !effectiveAccountId) return;
    setCreatingBoard(true);
    setFormError(null);
    try {
      const { board } = await api.createPinterestBoard(effectiveAccountId, name);
      setBoards((prev) => {
        if (prev.some((b) => b.id === board.id)) return prev;
        return [board, ...prev];
      });
      setPinBoardId(board.id);
      setNewBoardName('');
    } catch (err) {
      setFormError(
        `Could not create board: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setCreatingBoard(false);
    }
  }

  function parseLocalDateTime(value: string) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return {
      date: {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      },
      time: {
        hours: d.getHours(),
        minutes: d.getMinutes(),
      },
    };
  }

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
    } else if (isPinterest) {
      if (!file) {
        setFormError('Pinterest Pins require an image or video file.');
        return;
      }
      if (!isImageFile(file) && !isVideoFile(file)) {
        setFormError('Pinterest accepts image or video files only.');
        return;
      }
      if (!pinBoardId.trim()) {
        setFormError('Select or create a Pinterest board before publishing.');
        return;
      }
    } else if (isGoogleBusiness) {
      if (file && !isImageFile(file)) {
        setFormError('Google Business Profile posts accept photo media (JPG/PNG) only.');
        return;
      }
      if (gbpTopic === 'EVENT' && !gbpEventTitle.trim()) {
        setFormError('Event posts need an event title.');
        return;
      }
      if (gbpTopic === 'EVENT' && !gbpEventStart) {
        setFormError('Event posts need a start date/time.');
        return;
      }
      if (gbpCtaType && gbpCtaType !== 'CALL' && !gbpCtaUrl.trim()) {
        setFormError('CTA buttons other than CALL need a URL.');
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

    const pinterest: PinterestOptions | undefined = isPinterest
      ? {
          board_id: pinBoardId.trim(),
          ...(pinTitle.trim() ? { title: pinTitle.trim() } : {}),
          ...(pinLink.trim() ? { link: pinLink.trim() } : {}),
          ...(pinAltText.trim() ? { alt_text: pinAltText.trim() } : {}),
        }
      : undefined;

    let google_business: GoogleBusinessOptions | undefined;
    if (isGoogleBusiness) {
      google_business = { topicType: gbpTopic };
      if (gbpCtaType) {
        google_business.callToAction = {
          actionType: gbpCtaType,
          ...(gbpCtaUrl.trim() ? { url: gbpCtaUrl.trim() } : {}),
        };
      }
      if (gbpTopic === 'EVENT') {
        const start = parseLocalDateTime(gbpEventStart);
        const end = parseLocalDateTime(gbpEventEnd);
        google_business.event = {
          title: gbpEventTitle.trim(),
          ...(start
            ? { startDate: start.date, startTime: start.time }
            : {}),
          ...(end ? { endDate: end.date, endTime: end.time } : {}),
        };
      }
      if (gbpTopic === 'OFFER') {
        google_business.offer = {
          ...(gbpCoupon.trim() ? { couponCode: gbpCoupon.trim() } : {}),
          ...(gbpRedeemUrl.trim() ? { redeemOnlineUrl: gbpRedeemUrl.trim() } : {}),
          ...(gbpTerms.trim() ? { termsConditions: gbpTerms.trim() } : {}),
        };
      }
    }

    await onSubmit({
      accountId: effectiveAccountId,
      content: content.trim(),
      scheduledAt,
      youtube,
      pinterest,
      google_business,
      file: file || undefined,
    });
  }

  const accept = isYoutube
    ? 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm'
    : isGoogleBusiness
      ? 'image/jpeg,image/png,.jpg,.jpeg,.png'
      : 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov';

  const mediaLabel = isYoutube
    ? 'Video file (required)'
    : isPinterest
      ? 'Pin media (required — image or video)'
      : isGoogleBusiness
        ? 'Photo (optional — JPG/PNG)'
        : 'Media file (optional)';

  const emptyMediaHint = isYoutube
    ? 'No video selected yet — YouTube requires a video file.'
    : isPinterest
      ? 'No media selected — Pinterest Pins require an image or video.'
      : isGoogleBusiness
        ? 'No photo attached — text-only local post.'
        : 'No media attached — this post will be text-only.';

  return (
    <section className="card">
      <h2>3. Compose &amp; Post</h2>
      <p className="muted">
        {isYoutube
          ? 'YouTube needs a video file. Text becomes the description; optional title/Shorts settings below.'
          : isPinterest
            ? 'Pinterest needs media plus a board. Description is the Pin text; title, link, and alt text are optional.'
            : isGoogleBusiness
              ? 'Google Business local posts: choose Standard / Event / Offer, optional CTA and photo (JPG/PNG).'
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
          placeholder={
            isYoutube
              ? 'Video description…'
              : isPinterest
                ? 'Pin description…'
                : isGoogleBusiness
                  ? 'Local post text (max ~1,500 characters)…'
                  : 'What do you want to publish?'
          }
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label htmlFor="media-file">{mediaLabel}</label>
        <input
          id="media-file"
          type="file"
          ref={fileInputRef}
          accept={accept}
          required={mediaRequired}
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
          <p className="muted media-hint">{emptyMediaHint}</p>
        )}

        {isYoutube && (
          <div className="network-options">
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

        {isPinterest && (
          <div className="network-options">
            <label htmlFor="pin-board">Board</label>
            <select
              id="pin-board"
              required
              value={pinBoardId}
              onChange={(e) => setPinBoardId(e.target.value)}
              disabled={boardsLoading || (!boards.length && !pinBoardId)}
            >
              {!boards.length && (
                <option value="">
                  {boardsLoading ? 'Loading boards…' : 'No boards yet — create one below'}
                </option>
              )}
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || b.id}
                </option>
              ))}
            </select>
            {boardsError && <p className="result-err">{boardsError}</p>}

            <div className="row board-create-row">
              <input
                type="text"
                placeholder="New board name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                disabled={creatingBoard}
              />
              <button
                type="button"
                className="btn btn-ghost"
                disabled={creatingBoard || !newBoardName.trim()}
                onClick={() => void handleCreateBoard()}
              >
                {creatingBoard ? 'Creating…' : 'Create board'}
              </button>
            </div>

            <label htmlFor="pin-title">Pin title (optional)</label>
            <input
              id="pin-title"
              type="text"
              maxLength={100}
              placeholder="Shown on the Pin"
              value={pinTitle}
              onChange={(e) => setPinTitle(e.target.value)}
            />

            <label htmlFor="pin-link">Destination link (optional)</label>
            <input
              id="pin-link"
              type="url"
              placeholder="https://example.com/product"
              value={pinLink}
              onChange={(e) => setPinLink(e.target.value)}
            />

            <label htmlFor="pin-alt">Alt text (optional)</label>
            <input
              id="pin-alt"
              type="text"
              maxLength={500}
              placeholder="Describe the image for accessibility"
              value={pinAltText}
              onChange={(e) => setPinAltText(e.target.value)}
            />
          </div>
        )}

        {isGoogleBusiness && (
          <div className="network-options">
            <label htmlFor="gbp-topic">Post type</label>
            <select
              id="gbp-topic"
              value={gbpTopic}
              onChange={(e) =>
                setGbpTopic(e.target.value as NonNullable<GoogleBusinessOptions['topicType']>)
              }
            >
              <option value="STANDARD">Standard</option>
              <option value="EVENT">Event</option>
              <option value="OFFER">Offer</option>
            </select>

            <label htmlFor="gbp-cta">Call to action (optional)</label>
            <select
              id="gbp-cta"
              value={gbpCtaType}
              onChange={(e) =>
                setGbpCtaType(
                  e.target.value as
                    | NonNullable<GoogleBusinessOptions['callToAction']>['actionType']
                    | '',
                )
              }
            >
              <option value="">None</option>
              <option value="LEARN_MORE">Learn more</option>
              <option value="BOOK">Book</option>
              <option value="ORDER">Order</option>
              <option value="SHOP">Shop</option>
              <option value="SIGN_UP">Sign up</option>
              <option value="CALL">Call</option>
            </select>

            {gbpCtaType && gbpCtaType !== 'CALL' && (
              <>
                <label htmlFor="gbp-cta-url">CTA URL</label>
                <input
                  id="gbp-cta-url"
                  type="url"
                  placeholder="https://example.com"
                  value={gbpCtaUrl}
                  onChange={(e) => setGbpCtaUrl(e.target.value)}
                />
              </>
            )}

            {gbpTopic === 'EVENT' && (
              <>
                <label htmlFor="gbp-event-title">Event title</label>
                <input
                  id="gbp-event-title"
                  type="text"
                  required
                  value={gbpEventTitle}
                  onChange={(e) => setGbpEventTitle(e.target.value)}
                />
                <label htmlFor="gbp-event-start">Starts</label>
                <input
                  id="gbp-event-start"
                  type="datetime-local"
                  required
                  value={gbpEventStart}
                  onChange={(e) => setGbpEventStart(e.target.value)}
                />
                <label htmlFor="gbp-event-end">Ends (optional)</label>
                <input
                  id="gbp-event-end"
                  type="datetime-local"
                  value={gbpEventEnd}
                  onChange={(e) => setGbpEventEnd(e.target.value)}
                />
              </>
            )}

            {gbpTopic === 'OFFER' && (
              <>
                <label htmlFor="gbp-coupon">Coupon code (optional)</label>
                <input
                  id="gbp-coupon"
                  type="text"
                  value={gbpCoupon}
                  onChange={(e) => setGbpCoupon(e.target.value)}
                />
                <label htmlFor="gbp-redeem">Redeem URL (optional)</label>
                <input
                  id="gbp-redeem"
                  type="url"
                  placeholder="https://example.com/redeem"
                  value={gbpRedeemUrl}
                  onChange={(e) => setGbpRedeemUrl(e.target.value)}
                />
                <label htmlFor="gbp-terms">Terms (optional)</label>
                <input
                  id="gbp-terms"
                  type="text"
                  value={gbpTerms}
                  onChange={(e) => setGbpTerms(e.target.value)}
                />
              </>
            )}
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
