# ShoutlyAI Backend (NestJS)

NestJS rewrite of the Outstand integration API from `outstand-integration/`. Proxies the Outstand REST API (`https://api.outstand.so`) so the React frontend never sees `OUTSTAND_API_KEY`.

**Base URL:** `http://localhost:3000`  
**CORS:** `http://localhost:5173` (Vite default)

## Setup

```bash
cd shoutly-migrated/backend
cp .env.example .env
# Edit .env — set OUTSTAND_API_KEY (copy from outstand-integration/.env if you have it)
npm install
```

## Run

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Environment

| Variable | Required | Description |
|---|---|---|
| `OUTSTAND_API_KEY` | yes | Bearer key from Outstand dashboard |
| `OUTSTAND_BASE_URL` | no | Default `https://api.outstand.so` |
| `PORT` | no | Default `3000` |
| `CORS_ORIGIN` | no | Default `http://localhost:5173` |
| `FACEBOOK_APP_ID` | no | Fallback for BYOK `POST /api/networks` |
| `FACEBOOK_APP_SECRET` | no | Fallback for BYOK `POST /api/networks` |

## API endpoints

Response shape matches the old Express app: `{ success: true, ... }` or `{ success: false, error: "..." }`.

### Core (parity with old `server.mjs`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/accounts?network=` | List connected social accounts |
| `GET` | `/api/connect-url?network=facebook` | OAuth URL to connect a network |
| `POST` | `/api/post` | Create or schedule a post |
| `GET` | `/api/posts/:id` | Get post publish status |

**`POST /api/post` body** (same as old UI):

```json
{
  "accountId": "L0CCV",
  "content": "Hello from Shoutly",
  "scheduledAt": "2026-09-04T16:00:00Z"
}
```

Also accepts `"accounts": ["L0CCV", "X2GJe"]` and optional `"media": [{ "url": "...", "filename": "..." }]`.

### Extended (from old CLI scripts)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts` | List posts |
| `DELETE` | `/api/posts/:id` | Cancel/delete a queued post |
| `POST` | `/api/media/upload` | Multipart `file` upload → public media URL |
| `GET` | `/api/networks` | List BYOK network credentials |
| `POST` | `/api/networks` | Register BYOK credentials `{ network, key?, secret? }` |
| `DELETE` | `/api/networks/:id` | Delete a BYOK entry |
| `GET` | `/api/accounts/:id/metrics` | Account metrics |
| `GET` | `/api/accounts/:id/health` | Account health |
| `DELETE` | `/api/accounts/:id` | Disconnect account |
| `GET` | `/api/pending/:sessionToken` | Pending OAuth connection |
| `POST` | `/api/pending/:sessionToken/finalize` | Finalize with `{ selectedPageIds: [] }` |

## Frontend notes

Point the Vite React app at `http://localhost:3000`. Example:

```ts
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
await fetch(`${API}/api/accounts?network=facebook`);
```

There is **no local database** and **no user auth** — the backend is a trusted proxy to Outstand using a server-side API key (same model as the original Express app).
