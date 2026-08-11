# Instagram

Connect and post to **Instagram** via Outstand (BYOK OAuth). Network value: `instagram`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- Instagram **Business or Creator** account linked to a Facebook Page
- [Meta Developer](https://developers.facebook.com) app (often separate from the Facebook app)

---

## 1. Meta developer app

1. Create/open Meta app with Instagram product / content publish access  
2. OAuth redirect (exact):

```text
https://www.outstand.so/app/api/socials/instagram/callback
```

3. Copy **App ID** and **App Secret**

Publishing needs Meta **App Review** for content publish scopes. Test Mode works for developers/testers first.

---

## 2. Env (`backend/.env`)

```bash
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret

# Falls back to FACEBOOK_APP_ID / FACEBOOK_APP_SECRET if Instagram vars are empty
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"instagram\"}"
```

---

## 4. Connect and post

### UI

1. Network → **Instagram** → **Connect**  
2. Approve OAuth → `/oauth/callback`  
3. Compose (media often required for feed posts) → **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=instagram&redirectUri=http://localhost:5173/oauth/callback"
```

```bash
curl -X POST http://localhost:3000/api/media/upload -F "file=@./photo.jpg"

curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Hello on Instagram\",\"media\":[{\"url\":\"MEDIA_URL\",\"filename\":\"photo.jpg\"}]}"
```

---

## Flow

```text
UI (network=instagram)
  → GET /api/connect-url?network=instagram
  → Meta / Instagram OAuth
  → …/socials/instagram/callback
  → /oauth/callback
  → POST /api/post (+ media as needed)
```

---

## Code map

| Piece | Path |
|---|---|
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'instagram'`) |
| Connect | `backend/src/connect/` |
| Compose | `frontend/src/components/ComposePostForm.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Connect fails | Business/Creator + linked Facebook Page required |
| Redirect error | Exact Instagram Outstand callback on Meta app |
| Publish only in test | App Review still pending for publish scopes |
