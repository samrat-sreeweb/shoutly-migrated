# Pinterest

Connect and create **Pins** via Outstand (BYOK OAuth). Network value: `pinterest`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- Pinterest **business** account + [developer app](https://developers.pinterest.com) with pin write scopes
- Trial apps may accept posts in Outstand but fail on Pinterest until **Standard** API access

---

## 1. Pinterest developer app

1. Create/open app with pin create scopes  
2. OAuth redirect (exact):

```text
https://www.outstand.so/app/api/socials/pinterest/callback
```

3. Copy **App ID** and **App Secret**

---

## 2. Env (`backend/.env`)

```bash
PINTEREST_APP_ID=your_app_id
PINTEREST_APP_SECRET=your_app_secret
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"pinterest\"}"
```

---

## 4. Connect and post

Pins **require** media (image or video) + a **board_id**.

### UI

1. Network → **Pinterest** → **Connect**  
2. Compose: pick/create board, attach media, optional title/link/alt → **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=pinterest&redirectUri=http://localhost:5173/oauth/callback"
```

```bash
curl http://localhost:3000/api/accounts/ACCOUNT_ID/pinterest/boards

curl -X POST http://localhost:3000/api/accounts/ACCOUNT_ID/pinterest/boards \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"My Board\"}"
```

```bash
curl -X POST http://localhost:3000/api/media/upload -F "file=@./pin.jpg"

curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Pin description\",\"media\":[{\"url\":\"MEDIA_URL\",\"filename\":\"pin.jpg\"}],\"pinterest\":{\"board_id\":\"BOARD_ID\",\"title\":\"Optional title\"}}"
```

`pinterest` options: `board_id` (required), `title`, `link`, `alt_text`, `cover_image_url`.

---

## Flow

```text
UI (network=pinterest)
  → OAuth → …/socials/pinterest/callback
  → list/create boards
  → upload media + POST /api/post { pinterest: { board_id } }
```

---

## Code map

| Piece | Path |
|---|---|
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'pinterest'`) |
| Boards API | `backend/src/accounts/` + Outstand Pinterest boards |
| Compose UI | `frontend/src/components/ComposePostForm.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Missing board / media | Both required for Pins |
| Trial / production Pin blocked | Request Pinterest Standard API access |
| URL validation errors | Filenames with spaces are sanitized/encoded on upload |
