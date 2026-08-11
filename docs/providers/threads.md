# Threads

Connect and post to **Threads** via Outstand (BYOK OAuth). Network value: `threads`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- Meta app / product with **Threads API** access
- Threads account linked to the Meta identity you authorize

---

## 1. Meta / Threads app

1. Enable Threads API on your Meta developer app  
2. OAuth redirect (exact):

```text
https://www.outstand.so/app/api/socials/threads/callback
```

3. Copy App ID / App Secret used for Threads

---

## 2. Env (`backend/.env`)

```bash
THREAD_APP_ID=your_app_id
THREAD_APP_SECRET=your_app_secret

# Also accepts THREADS_APP_ID / THREADS_APP_SECRET
# Falls back to FACEBOOK_APP_ID / FACEBOOK_APP_SECRET if unset
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"threads\"}"
```

---

## 4. Connect and post

### UI

1. Network → **Threads** → **Connect**  
2. Approve OAuth → `/oauth/callback`  
   - Threads sometimes returns success **without** `account_id`; the UI falls back to the newest Threads account from Outstand  
3. Compose → **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=threads&redirectUri=http://localhost:5173/oauth/callback"
```

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Hello from Shoutly on Threads\"}"
```

---

## Flow

```text
UI (network=threads)
  → GET /api/connect-url?network=threads
  → Threads / Meta OAuth
  → …/socials/threads/callback
  → /oauth/callback (may omit account_id)
  → POST /api/post
```

---

## Code map

| Piece | Path |
|---|---|
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'threads'`) |
| Callback fallback | `frontend/src/pages/OAuthCallbackPage.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Redirect mismatch | Exact Threads Outstand callback |
| Connected but no account id in URL | Expected for some Threads callbacks — UI resolves via accounts list |
| `Missing credentials` | Set `THREAD_APP_ID` / `THREAD_APP_SECRET`, then `POST /api/networks` |
