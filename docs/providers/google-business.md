# Google Business Profile

Connect verified **locations** and publish local posts via Outstand (BYOK OAuth). Network value: `google_business`.

Assumes the app is already running (see root [`README.md`](../../README.md)).

---

## Prerequisites

- Outstand API key in `backend/.env`
- Google Cloud project with **Business Profile API access approved** (allow-list). Until approved, quota is often **0** → `429 RESOURCE_EXHAUSTED`
- Verified Google Business Profile location(s)
- OAuth Web client (can be the same as YouTube)

Enable APIs:

- My Business Account Management  
- My Business Business Information  
- Google My Business (legacy)  
- Business Profile Performance  

---

## 1. Google Cloud OAuth client

1. Create/use Web OAuth client  
2. Authorized redirect URI (exact — note the **hyphen**):

```text
https://www.outstand.so/app/api/socials/google-business/callback
```

3. OAuth scope used: `https://www.googleapis.com/auth/business.manage`  
4. Copy Client ID / Secret into env (same vars as YouTube)

---

## 2. Env (`backend/.env`)

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## 3. Register BYOK

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"google_business\"}"
```

---

## 4. Connect and post

### UI

1. Network → **Google Business Profile** → **Connect**  
2. Approve Google OAuth  
3. On `/oauth/callback?session=…`, pick **location(s)** and finalize  
4. Compose: Standard / Event / Offer, optional CTA + JPG/PNG → **Publish**

### API

```bash
curl "http://localhost:3000/api/connect-url?network=google_business&redirectUri=http://localhost:5173/oauth/callback"
```

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"ACCOUNT_ID\",\"content\":\"Now open late!\",\"google_business\":{\"topicType\":\"STANDARD\",\"callToAction\":{\"actionType\":\"LEARN_MORE\",\"url\":\"https://example.com\"}}}"
```

`google_business` options: `topicType` (`STANDARD`|`EVENT`|`OFFER`), `callToAction`, `event`, `offer`.

---

## Flow

```text
UI (network=google_business)
  → GET /api/connect-url?network=google_business
  → Google OAuth
  → …/socials/google-business/callback
  → /oauth/callback?session=…
  → location picker + finalize
  → POST /api/post { google_business: { … } }
```

---

## Code map

| Piece | Path |
|---|---|
| BYOK env | `backend/src/networks/networks.service.ts` (`case 'google_business'`) |
| Post DTO | `backend/src/posts/dto/create-post.dto.ts` |
| Compose UI | `frontend/src/components/ComposePostForm.tsx` |
| Location picker | `frontend/src/pages/OAuthCallbackPage.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `429` / `quota_limit_value: "0"` | Google has not granted Business Profile API quota — request allow-list / quota increase |
| No locations | Location must be **verified**; Google account must manage it |
| Redirect error | Callback is `google-business` (hyphen), not `google_business` |
