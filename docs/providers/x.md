# X (Twitter)

Connect and post to **X** via Outstand (BYOK OAuth). Network value: `x`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- [X Developer](https://developer.x.com) app with **OAuth 2.0** Client ID + Client Secret

---

## 1. X developer app

1. https://developer.x.com → your app  
2. Enable **OAuth 2.0**  
3. Permissions: **Read and write**  
4. Callback (exact):

```text
https://www.outstand.so/app/api/socials/x/callback
```

---

## 2. Env (`backend/.env`)

```bash
X_CLIENT_ID=your_oauth2_client_id
X_CLIENT_SECRET=your_oauth2_client_secret

# Optional fallbacks if Client ID/Secret are empty:
# X_CONSUMER_KEY=
# X_SECRET_KEY=
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"x\"}"
```

Or:

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"x\",\"key\":\"YOUR_CLIENT_ID\",\"secret\":\"YOUR_CLIENT_SECRET\"}"
```

```bash
curl http://localhost:3000/api/networks
```

---

## 4. Connect and post

### UI

1. http://localhost:5173  
2. Network → **X (Twitter)** → **Connect**  
3. Approve on X → `/oauth/callback`  
4. Compose → **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=x&redirectUri=http://localhost:5173/oauth/callback"
```

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Hello from Shoutly on X\"}"
```

Optional media:

```bash
curl -X POST http://localhost:3000/api/media/upload -F "file=@./sample.jpg"
```

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
  → /oauth/callback
  → POST /api/post
```

---

## Code map

| Piece | Path |
|---|---|
| Connect URL | `backend/src/connect/` |
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'x'`) |
| Picker | `frontend/src/components/ConnectSection.tsx` |
| Callback | `frontend/src/pages/OAuthCallbackPage.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| OAuth redirect error | Callback must be exactly `https://www.outstand.so/app/api/socials/x/callback` |
| `Missing credentials for "x"` | Set `X_CLIENT_ID` / `X_CLIENT_SECRET`, restart API, `POST /api/networks` |
| Old app still used | Re-register BYOK after rotating keys; reconnect in UI |
