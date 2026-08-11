# TikTok

Connect and post to **TikTok** via Outstand (BYOK OAuth). Network value: `tiktok`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- [TikTok for Developers](https://developers.tiktok.com) app with **Login Kit** + **Content Posting API**
- Sandbox target users for testing; production needs TikTok audit / production access

---

## 1. TikTok developer app

1. Create/open app → add **Content Posting API**  
2. OAuth redirect (exact):

```text
https://www.outstand.so/app/api/socials/tiktok/callback
```

3. Copy **Client Key** and **Client Secret**  
4. **URL Properties**: verify the domain that hosts your **media URLs** (see below)

---

## 2. Env (`backend/.env`)

```bash
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"tiktok\"}"
```

---

## 4. Connect and post

### UI

1. Network → **TikTok** → **Connect**  
2. Approve OAuth → `/oauth/callback`  
3. Compose with media → **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=tiktok&redirectUri=http://localhost:5173/oauth/callback"
```

```bash
curl -X POST http://localhost:3000/api/media/upload -F "file=@./clip.mp4"

curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Hello on TikTok\",\"media\":[{\"url\":\"MEDIA_URL\",\"filename\":\"clip.mp4\"}]}"
```

---

## Media URL ownership (important)

Outstand posts TikTok media with TikTok’s **PULL_FROM_URL** flow. TikTok only fetches URLs on domains verified under **URL Properties**.

Uploads in this app typically land on **Outstand’s media host** (e.g. `media.outstand.so`), **not** your website. Verifying `shoutlyai.com` alone does **not** cover Outstand’s domain → `url_ownership_unverified`.

Options:

1. Host media under a domain you verified (e.g. `media.yourdomain.com`), **or**  
2. Use Outstand **Managed Keys** for TikTok (their media domain is already verified)

Docs: [TikTok Media Transfer Guide](https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide/#pull_from_url), [Outstand TikTok](https://www.outstand.so/docs/configurations/tiktok)

---

## Flow

```text
UI (network=tiktok)
  → GET /api/connect-url?network=tiktok
  → TikTok OAuth
  → …/socials/tiktok/callback
  → /oauth/callback
  → upload media + POST /api/post
```

---

## Code map

| Piece | Path |
|---|---|
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'tiktok'`) |
| Media upload | `backend/src/media/` |
| Connect | `backend/src/connect/` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `url_ownership_unverified` | Verify the **media URL domain**, not only the marketing site |
| Sandbox-only | Add target users; production needs TikTok audit |
| Redirect mismatch | Exact TikTok Outstand callback |
