import { NavLink } from 'react-router-dom';

const CALLBACKS = [
  { network: 'x', url: 'https://www.outstand.so/app/api/socials/x/callback' },
  { network: 'facebook', url: 'https://www.outstand.so/app/api/socials/facebook/callback' },
  { network: 'instagram', url: 'https://www.outstand.so/app/api/socials/instagram/callback' },
  { network: 'threads', url: 'https://www.outstand.so/app/api/socials/threads/callback' },
  { network: 'youtube', url: 'https://www.outstand.so/app/api/socials/youtube/callback' },
  { network: 'tiktok', url: 'https://www.outstand.so/app/api/socials/tiktok/callback' },
  { network: 'pinterest', url: 'https://www.outstand.so/app/api/socials/pinterest/callback' },
];

export function SetupGuidePage() {
  return (
    <div className="wrap wrap-wide">
      <header className="page-header">
        <span className="badge">SETUP GUIDE</span>
        <h1>Connect networks via Outstand</h1>
        <p className="muted">
          BYOK credentials are registered once with Outstand. Each visitor then connects{' '}
          <em>their own</em> account through OAuth — accounts stay in that browser session only.
        </p>
        <p className="nav-back">
          <NavLink to="/">← Back to Connect &amp; Post</NavLink>
        </p>
      </header>

      <section className="card">
        <h2>Outstand callback URLs (platform developer consoles)</h2>
        <p className="muted">
          Each OAuth app must allow the matching Outstand callback exactly. After token exchange,
          Outstand redirects to this app&apos;s <code>/oauth/callback</code>.
        </p>
        <ol className="steps">
          {CALLBACKS.map((c) => (
            <li key={c.network}>
              <strong>{c.network}</strong>: <code>{c.url}</code>
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2>Instagram</h2>
        <ol className="steps">
          <li>Business or Creator account, linked to a Facebook Page.</li>
          <li>
            Meta app OAuth redirect:{' '}
            <code>https://www.outstand.so/app/api/socials/instagram/callback</code>
          </li>
          <li>
            Env: <code>INSTAGRAM_APP_ID</code> / <code>INSTAGRAM_APP_SECRET</code> (registered as
            Outstand network <code>instagram</code>).
          </li>
          <li>
            Publishing needs Meta App Review for content publish scopes; Test Mode works for
            developers/test users first.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>Threads</h2>
        <ol className="steps">
          <li>Meta Threads app / product with Threads API access.</li>
          <li>
            Callback:{' '}
            <code>https://www.outstand.so/app/api/socials/threads/callback</code>
          </li>
          <li>
            Env: <code>THREAD_APP_ID</code> / <code>THREAD_APP_SECRET</code>.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>YouTube</h2>
        <ol className="steps">
          <li>
            Google Cloud project with <strong>YouTube Data API v3</strong> enabled.
          </li>
          <li>
            OAuth Web client redirect:{' '}
            <code>https://www.outstand.so/app/api/socials/youtube/callback</code>
          </li>
          <li>
            Env: <code>GOOGLE_CLIENT_ID</code> / <code>GOOGLE_CLIENT_SECRET</code>.
          </li>
          <li>
            Posts need a publicly reachable video URL (or Outstand media upload). Use top-level{' '}
            <code>youtube</code> overrides for Shorts / privacy / title.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>Pinterest</h2>
        <ol className="steps">
          <li>Pinterest business account + developer app with pin write scopes.</li>
          <li>
            OAuth redirect:{' '}
            <code>https://www.outstand.so/app/api/socials/pinterest/callback</code>
          </li>
          <li>
            Env: <code>PINTEREST_APP_ID</code> / <code>PINTEREST_APP_SECRET</code> (Outstand network{' '}
            <code>pinterest</code>).
          </li>
          <li>
            Every Pin needs media (image or video) plus a <code>board_id</code>. Use{' '}
            <code>GET/POST /api/accounts/:id/pinterest/boards</code> to list or create boards, then
            pass top-level <code>pinterest</code> options (<code>board_id</code>, optional{' '}
            <code>title</code>, <code>link</code>, <code>alt_text</code>).
          </li>
          <li>
            Upload media via <code>POST /api/media/upload</code> first — Outstand handles Pinterest
            video upload-slot plumbing when you pass the returned public URL.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>LinkedIn</h2>
        <ol className="steps">
          <li>
            LinkedIn developer app with <strong>Share on LinkedIn</strong> and{' '}
            <strong>Sign In with LinkedIn using OpenID Connect</strong>. For company Pages, also add{' '}
            <strong>Advertising API</strong> and/or <strong>Community Management API</strong> when
            LinkedIn grants them.
          </li>
          <li>
            Auth → Authorized redirect URLs:{' '}
            <code>https://www.outstand.so/app/api/socials/linkedin/callback</code>
          </li>
          <li>
            Env: <code>LINKEDIN_CLIENT_ID</code> / <code>LINKEDIN_CLIENT_SECRET</code> (Outstand
            network <code>linkedin</code>). Re-register with{' '}
            <code>{`POST /api/networks { "network": "linkedin" }`}</code> after rotating keys.
          </li>
          <li>
            Connect via Network → LinkedIn (OAuth). Reconnect after changing apps so tokens match
            the new client.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>Bluesky</h2>
        <ol className="steps">
          <li>No OAuth developer app / BYOK — Bluesky uses an app password instead.</li>
          <li>
            Create one at{' '}
            <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer">
              bsky.app/settings/app-passwords
            </a>{' '}
            (not your main account password).
          </li>
          <li>
            Connect via <code>POST /api/accounts/bluesky</code> with{' '}
            <code>{`{ "handle": "you.bsky.social", "appPassword": "xxxx-xxxx-xxxx-xxxx" }`}</code>{' '}
            — the home page has a dedicated form. Outstand keeps the AT Protocol session; this app
            only stores the returned account id in sessionStorage.
          </li>
          <li>
            First connect also ensures an Outstand <code>bluesky</code> social-network row exists
            (placeholders are enough). You can also run{' '}
            <code>{`POST /api/networks { "network": "bluesky" }`}</code>.
          </li>
          <li>Text posts work as-is; attach images through the usual media upload when needed.</li>
        </ol>
      </section>

      <section className="card">
        <h2>API routes</h2>
        <ol className="steps">
          <li>
            <code>
              GET /api/connect-url?network=linkedin|instagram|threads|youtube|pinterest|tiktok&amp;redirectUri=…
            </code>
          </li>
          <li>
            <code>POST /api/networks</code> with <code>{`{ "network": "…" }`}</code> to (re)register
            BYOK from env.
          </li>
          <li>
            <code>POST /api/media/upload</code> then <code>POST /api/post</code> with account ID +
            media URL (required for Pinterest / YouTube).
          </li>
        </ol>
      </section>
    </div>
  );
}
