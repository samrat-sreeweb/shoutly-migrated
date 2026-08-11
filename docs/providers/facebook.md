# Facebook

Connect and post to **Facebook Pages** via Outstand (BYOK OAuth). Network value: `facebook`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- [Meta Developer](https://developers.facebook.com) app with Facebook Login / Pages permissions
- A Facebook Page you can manage

---

## 1. Meta developer app

1. Create or open a Meta app  
2. Add products needed for Page posting (Facebook Login + Pages)  
3. Valid OAuth redirect URI (exact):

```text
https://www.outstand.so/app/api/socials/facebook/callback
```

4. Copy **App ID** and **App Secret**

Production publishing usually needs Meta **App Review** for the relevant scopes. Dev/test mode works for admin/tester roles first.

---

## 2. Env (`backend/.env`)

```bash
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"facebook\"}"
```

```bash
curl http://localhost:3000/api/networks
```

---

## 4. Connect and post

### UI

1. http://localhost:5173  
2. Network → **Facebook** → **Connect**  
3. Approve on Meta  
4. If Outstand returns `?session=`, pick the **Page(s)** on `/oauth/callback` and finalize  
5. Compose → **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=facebook&redirectUri=http://localhost:5173/oauth/callback"
```

Multi-Page finalize (after OAuth lands with `session`):

```bash
curl http://localhost:3000/api/pending/SESSION_TOKEN

curl -X POST http://localhost:3000/api/pending/SESSION_TOKEN/finalize \
  -H "Content-Type: application/json" \
  -d "{\"selectedPageIds\":[\"PAGE_ID\"]}"
```

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Hello from Shoutly on Facebook\"}"
```

---

## Flow

```text
UI (network=facebook)
  → GET /api/connect-url?network=facebook
  → Meta OAuth
  → …/socials/facebook/callback
  → /oauth/callback (?account_id=… or ?session=…)
  → optional Page picker + finalize
  → POST /api/post
```

---

## Code map

| Piece | Path |
|---|---|
| Connect / pending | `backend/src/connect/` |
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'facebook'`) |
| Page picker UI | `frontend/src/pages/OAuthCallbackPage.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Redirect URI mismatch | Exact Outstand Facebook callback on the Meta app |
| No Pages listed | User must be admin of a Page; check `GET /api/pending/:session` |
| Publish blocked in prod | Complete Meta App Review for publish scopes |
