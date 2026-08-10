# ShoutlyAI — X (Twitter) integration

How to run this app and connect **X** via Outstand (BYOK OAuth).

| Path | Role | Local URL |
|---|---|---|
| `backend/` | NestJS API (holds Outstand + X keys) | http://localhost:3000 |
| `frontend/` | React + Vite UI | http://localhost:5173 |

There is **no separate X auth module**. X uses the shared connect flow with `network=x`.

---

## Prerequisites

- Node.js 20+
- [Outstand](https://www.outstand.so) API key
- [X Developer](https://developer.x.com) app with **OAuth 2.0** Client ID + Client Secret

---

## 1. Install

```bash
git clone <your-repo-url> shoutly-migrated
cd shoutly-migrated

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## 2. Backend env (`backend/.env`)

```bash
cd backend
cp .env.example .env
```

Set these values:

```bash
OUTSTAND_API_KEY=ost_your_key_here
OUTSTAND_BASE_URL=https://api.outstand.so
PORT=3000
CORS_ORIGIN=http://localhost:5173
OAUTH_SUCCESS_REDIRECT=http://localhost:5173/oauth/callback

# X OAuth 2.0 (required for X)
X_CLIENT_ID=your_oauth2_client_id
X_CLIENT_SECRET=your_oauth2_client_secret

# Optional fallbacks only if Client ID/Secret are empty:
# X_CONSUMER_KEY=
# X_SECRET_KEY=
```

---

## 3. Frontend env (`frontend/.env`)

```bash
VITE_API_URL=http://localhost:3000
```

---

## 4. Configure the X developer app

1. Open https://developer.x.com → your app  
2. Enable **OAuth 2.0**  
3. Permissions: **Read and write**  
4. Callback / redirect URI — exact match:

```text
https://www.outstand.so/app/api/socials/x/callback
```

5. Copy **Client ID** and **Client Secret** into `backend/.env` (step 2)

---

## 5. Run

Terminal 1:

```bash
cd backend
npm run start:dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Check API:

```bash
curl http://localhost:3000/api/health
```

Open http://localhost:5173

---

## 6. Register X with Outstand (BYOK)

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"x\"}"
```

Or pass keys explicitly:

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"x\",\"key\":\"YOUR_CLIENT_ID\",\"secret\":\"YOUR_CLIENT_SECRET\"}"
```

Confirm:

```bash
curl http://localhost:3000/api/networks
```

---

## 7. Connect X and post

### UI

1. http://localhost:5173  
2. Network → **X (Twitter)** → **Connect**  
3. Approve on X → return to `/oauth/callback`  
4. Compose → **Publish**

### API

Get auth URL (open `authUrl` in a browser):

```bash
curl "http://localhost:3000/api/connect-url?network=x&redirectUri=http://localhost:5173/oauth/callback"
```

After connect, publish (replace `ACCOUNT_ID`):

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Hello from Shoutly on X\"}"
```

Optional media:

```bash
curl -X POST http://localhost:3000/api/media/upload -F "file=@./sample.jpg"
```

Then include in the post body:

```json
{
  "accountId": "ACCOUNT_ID",
  "content": "Hello with media",
  "media": [{ "url": "https://…", "filename": "sample.jpg" }]
}
```

---

## Flow

```text
UI (network=x)
  → GET /api/connect-url?network=x
  → Outstand auth URL
  → User approves on X
  → https://www.outstand.so/app/api/socials/x/callback
  → http://localhost:5173/oauth/callback
  → account in sessionStorage
  → POST /api/post
```

---

## Code map (X only)

| Piece | Path |
|---|---|
| Connect URL | `backend/src/connect/connect.controller.ts` |
| Outstand `getAuthUrl` | `backend/src/outstand/outstand.service.ts` |
| BYOK `X_CLIENT_ID` / `X_CLIENT_SECRET` | `backend/src/networks/networks.service.ts` (`case 'x'`) |
| Network picker (`value: 'x'`) | `frontend/src/components/ConnectSection.tsx` |
| OAuth callback | `frontend/src/pages/OAuthCallbackPage.tsx` |
| Compose / publish | `frontend/src/components/ComposePostForm.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Wrong redirect / OAuth error | Callback must be exactly `https://www.outstand.so/app/api/socials/x/callback` |
| `Missing credentials for "x"` | Set `X_CLIENT_ID` + `X_CLIENT_SECRET`, restart API, run `POST /api/networks` with `"network":"x"` |
| Still using old X app | Re-register network after rotating keys, then reconnect in the UI |
| CORS in browser | `CORS_ORIGIN=http://localhost:5173` and `VITE_API_URL=http://localhost:3000` |

---

## Production checklist (X)

- Set `OUTSTAND_API_KEY`, `X_CLIENT_ID`, `X_CLIENT_SECRET` on the API host  
- Set `VITE_API_URL` to the public API URL on the frontend host  
- `redirectUri` / `OAUTH_SUCCESS_REDIRECT` = `https://YOUR_FRONTEND/oauth/callback`  
- X app callback stays: `https://www.outstand.so/app/api/socials/x/callback`  
- Never commit `.env` or real secrets  

More API endpoints (non-X): `backend/README.md`
