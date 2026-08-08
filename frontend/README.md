# Shoutly AI — React frontend (Vite + TypeScript)

Migrated UI for the Outstand connect-and-post demo that lived in
`outstand-integration/public`. Talks to the NestJS backend at
`shoutly-migrated/backend` (default `http://localhost:3000`).

## Setup

```bash
cd shoutly-migrated/frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server on port **5173** |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build |

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Nest API base URL (no trailing slash) |

## Screens

- **`/`** — Connect Facebook Page, list connected Pages, compose/schedule a post
- **`/setup`** — Short Meta/Outstand setup notes

## Nest API assumptions

The client mirrors the old Express routes in `outstand-integration/server.mjs`.
Nest should expose the same shapes (CORS allowed for `http://localhost:5173`):

| Method | Path | Request | Success response |
|---|---|---|---|
| `GET` | `/api/accounts?network=facebook` | — | `{ success: true, accounts: SocialAccount[] }` |
| `GET` | `/api/connect-url?network=facebook` | — | `{ success: true, authUrl: string }` |
| `POST` | `/api/post` | `{ accountId, content, scheduledAt? }` | `{ success: true, post: { id, ... } }` |
| `GET` | `/api/posts/:id` | — | `{ success: true, post }` (wired in client; not used by UI yet) |

Errors: `{ success: false, error: string }` with appropriate HTTP status.

There is **no browser auth** in the old app — the Outstand API key stays on the
server. This frontend assumes the same.

## Branding

Visual identity preserved from the original dark demo UI (`#0f1115` background,
`#5b8cff` accent, panel cards). Product badge renamed to **Shoutly AI**.
