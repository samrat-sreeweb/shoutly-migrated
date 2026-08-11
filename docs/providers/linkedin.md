# LinkedIn

Connect and post to **LinkedIn** (profile and/or Company Pages) via Outstand (BYOK OAuth). Network value: `linkedin`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- [LinkedIn Developer](https://www.linkedin.com/developers/) app
- Products typically needed:
  - **Share on LinkedIn**
  - **Sign In with LinkedIn using OpenID Connect**
  - For Company Pages: **Advertising API** and/or **Community Management API** (approval often required)

Outstand requests org + analytics scopes; if LinkedIn shows “Bummer, something went wrong”, missing product/scope approval is the usual cause.

---

## 1. LinkedIn developer app

1. Open your LinkedIn app → **Auth**  
2. Authorized redirect URL (exact):

```text
https://www.outstand.so/app/api/socials/linkedin/callback
```

3. Copy **Client ID** and **Client Secret**  
4. Confirm required products are added / approved on the **Products** tab

---

## 2. Env (`backend/.env`)

```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"linkedin\"}"
```

Re-run after rotating keys, then reconnect in the UI.

---

## 4. Connect and post

### UI

1. Network → **LinkedIn** → **Connect**  
2. Approve OAuth (pick Company Page when prompted, if posting as a Page)  
3. If `?session=` appears, select Page(s) and finalize  
4. Compose → **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=linkedin&redirectUri=http://localhost:5173/oauth/callback"
```

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Hello from Shoutly on LinkedIn\"}"
```

---

## Flow

```text
UI (network=linkedin)
  → GET /api/connect-url?network=linkedin
  → LinkedIn OAuth
  → …/socials/linkedin/callback
  → /oauth/callback (?account_id=… or ?session=…)
  → POST /api/post
```

---

## Code map

| Piece | Path |
|---|---|
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'linkedin'`) |
| Connect / pending | `backend/src/connect/` |
| Page picker | `frontend/src/pages/OAuthCallbackPage.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| “Bummer, something went wrong” | App missing scopes/products Outstand requests (often Community Management) |
| Redirect error | Exact LinkedIn Outstand callback |
| Old tokens after key rotate | `POST /api/networks` + reconnect |
