# Bluesky

Connect and post to **Bluesky** via Outstand. Network value: `bluesky`.

**No OAuth developer app.** Users connect with a handle + [app password](https://bsky.app/settings/app-passwords).

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- Bluesky account
- App password (not the main account password)

---

## 1. Env (`backend/.env`)

Outstand still needs a `bluesky` social-networks row. Placeholders are enough:

```bash
BLUESKY_CLIENT_KEY=bluesky
BLUESKY_CLIENT_SECRET=bluesky

# Optional local notes only — not used by the public API:
# BLUESKY_HANDLE=you.bsky.social
# BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

---

## 2. Ensure network stub (optional)

First UI connect auto-registers the stub. Or:

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"bluesky\"}"
```

---

## 3. Connect and post

### UI

1. Network → **Bluesky**  
2. Enter handle + app password (inline form) → **Connect Bluesky**  
3. Compose → **Publish**

### API

```bash
curl -X POST http://localhost:3000/api/accounts/bluesky \
  -H "Content-Type: application/json" \
  -d "{\"handle\":\"you.bsky.social\",\"appPassword\":\"xxxx-xxxx-xxxx-xxxx\"}"
```

Body must use camelCase `appPassword` (Outstand expectation).

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Hello from Shoutly on Bluesky\"}"
```

Optional images via `POST /api/media/upload` then `media` on the post.

---

## Flow

```text
UI (Bluesky form)
  → POST /api/accounts/bluesky { handle, appPassword }
  → Outstand AT Protocol session
  → account in sessionStorage
  → POST /api/post
```

---

## Code map

| Piece | Path |
|---|---|
| Connect API | `backend/src/accounts/` (`connectBluesky`) |
| Outstand call | `backend/src/outstand/outstand.service.ts` |
| UI form | `frontend/src/components/BlueskyConnectForm.tsx` |
| Picker wiring | `frontend/src/components/ConnectSection.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Auth rejected | Use an **app password**, not the main password; handle without leading `@` |
| Network not found | `POST /api/networks` with `"network":"bluesky"` or connect once from UI |
| Wrong JSON field | Must be `appPassword` (camelCase), not `app_password` |
