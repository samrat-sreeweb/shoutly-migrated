# YouTube

Connect and upload/publish to **YouTube** via Outstand (BYOK OAuth). Network value: `youtube`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- [Google Cloud](https://console.cloud.google.com) project with **YouTube Data API v3** enabled
- OAuth 2.0 **Web** client
- YouTube channel under the Google account you authorize

Production may require Google OAuth verification / YouTube API quota for public use.

---

## 1. Google Cloud OAuth client

1. APIs & Services → enable **YouTube Data API v3**  
2. Create **OAuth client ID** → Web application  
3. Authorized redirect URI (exact):

```text
https://www.outstand.so/app/api/socials/youtube/callback
```

4. Copy **Client ID** and **Client Secret**

(The same client can also serve Google Business Profile if you add that callback too — see [`google-business.md`](google-business.md).)

---

## 2. Env (`backend/.env`)

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"youtube\"}"
```

---

## 4. Connect and post

### UI

1. Network → **YouTube** → **Connect**  
2. Approve Google OAuth → `/oauth/callback`  
3. Compose: **video file required**; optional title / Shorts / privacy  
4. **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=youtube&redirectUri=http://localhost:5173/oauth/callback"
```

```bash
curl -X POST http://localhost:3000/api/media/upload -F "file=@./video.mp4"
```

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Video description\",\"media\":[{\"url\":\"MEDIA_URL\",\"filename\":\"video.mp4\"}],\"youtube\":{\"isShort\":true,\"privacyStatus\":\"public\",\"title\":\"My Short\"}}"
```

`youtube` overrides (optional): `isShort`, `privacyStatus`, `title`, `tags`, `madeForKids`, `categoryId`.

---

## Flow

```text
UI (network=youtube)
  → GET /api/connect-url?network=youtube
  → Google OAuth
  → …/socials/youtube/callback
  → /oauth/callback
  → media upload + POST /api/post { youtube: { … } }
```

---

## Code map

| Piece | Path |
|---|---|
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'youtube'`) |
| Post DTO | `backend/src/posts/dto/create-post.dto.ts` (`youtube`) |
| Compose UI | `frontend/src/components/ComposePostForm.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Redirect mismatch | Exact YouTube Outstand callback on the Web client |
| Post rejected (no media) | YouTube requires a video URL / upload |
| Quota / verification errors | Google Cloud quota + OAuth verification for production |
