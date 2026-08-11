# ShoutlyAI Migrated

Outstand-powered multi-network social posting demo.

| Path | Role | Local URL |
|---|---|---|
| `backend/` | NestJS API (Outstand proxy; keys stay server-side) | http://localhost:3000 |
| `frontend/` | React + Vite | http://localhost:5173 |
| `docs/providers/` | Per-network setup guides (copy-paste) | — |

No local database and no user login. Connected accounts live in browser `sessionStorage` for that visit only.

---

## Shared quick start

```bash
git clone <your-repo-url> shoutly-migrated
cd shoutly-migrated

cd backend && npm install && cd ..
cd frontend && npm install && cd ..

cd backend && cp .env.example .env
# Edit backend/.env — set OUTSTAND_API_KEY at minimum
```

`frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

Run:

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

- UI: http://localhost:5173  
- Health: `curl http://localhost:3000/api/health`  
- Full API list: [`backend/README.md`](backend/README.md)

Shared env keys for every OAuth network:

```bash
OUTSTAND_API_KEY=
OUTSTAND_BASE_URL=https://api.outstand.so
PORT=3000
CORS_ORIGIN=http://localhost:5173
OAUTH_SUCCESS_REDIRECT=http://localhost:5173/oauth/callback
```

After filling a network’s keys in `.env`, register BYOK:

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"NETWORK_NAME\"}"
```

---

## Provider docs

Each file is a standalone copy-paste guide for that network.

| Network | Doc |
|---|---|
| X (Twitter) | [`docs/providers/x.md`](docs/providers/x.md) |
| Facebook | [`docs/providers/facebook.md`](docs/providers/facebook.md) |
| Instagram | [`docs/providers/instagram.md`](docs/providers/instagram.md) |
| Threads | [`docs/providers/threads.md`](docs/providers/threads.md) |
| LinkedIn | [`docs/providers/linkedin.md`](docs/providers/linkedin.md) |
| YouTube | [`docs/providers/youtube.md`](docs/providers/youtube.md) |
| Google Business Profile | [`docs/providers/google-business.md`](docs/providers/google-business.md) |
| TikTok | [`docs/providers/tiktok.md`](docs/providers/tiktok.md) |
| Pinterest | [`docs/providers/pinterest.md`](docs/providers/pinterest.md) |
| Bluesky | [`docs/providers/bluesky.md`](docs/providers/bluesky.md) |
| Vimeo | [`docs/providers/vimeo.md`](docs/providers/vimeo.md) |

In-app notes: http://localhost:5173/setup
