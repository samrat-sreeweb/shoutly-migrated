import { NavLink } from 'react-router-dom';

export function SetupGuidePage() {
  return (
    <div className="wrap wrap-wide">
      <header className="page-header">
        <span className="badge">SETUP GUIDE</span>
        <h1>X + Facebook via Outstand</h1>
        <p className="muted">
          BYOK app credentials (one X app, one Meta app) are registered with Outstand once, up
          front. Each visitor then connects <em>their own</em> account through OAuth — nothing is
          saved to a database, only to that browser's session (see the note on the home page).
        </p>
        <p className="nav-back">
          <NavLink to="/">← Back to Connect &amp; Post</NavLink>
        </p>
      </header>

      <section className="card">
        <h2>X (Twitter) checklist</h2>
        <ol className="steps">
          <li>
            In{' '}
            <a href="https://console.x.com" target="_blank" rel="noreferrer">
              console.x.com
            </a>
            , open your app → <strong>Settings</strong> (authentication settings).
          </li>
          <li>
            Callback URI / Redirect URL must be exactly:{' '}
            <code>https://www.outstand.so/app/api/socials/x/callback</code> — this is Outstand's
            own callback, not this app's. Outstand completes the token exchange with X, then
            redirects the browser onward to whatever <code>redirectUri</code> was passed to{' '}
            <code>/api/connect-url</code> (this app uses <code>/oauth/callback</code>).
          </li>
          <li>
            App permissions: <strong>Read and write and Direct message</strong>. Outstand requests
            the <code>tweet.read</code>, <code>tweet.write</code>, <code>users.read</code>,{' '}
            <code>follows.read</code>, <code>dm.write</code>, <code>media.write</code>,{' '}
            <code>offline.access</code> scopes — the DM scope means Read-and-write alone isn't
            enough; X will reject the OAuth request without the DM tier.
          </li>
          <li>
            Type of App: <strong>Native App</strong> (public client) — matches the PKCE
            (<code>code_challenge</code>) flow Outstand uses for X.
          </li>
          <li>
            Consumer Key / Secret get registered with Outstand once via{' '}
            <code>POST /v1/social-networks</code> (network <code>x</code>) — either directly, or
            through this backend's <code>POST /api/networks</code>, which falls back to{' '}
            <code>X_CONSUMER_KEY</code> / <code>X_SECRET_KEY</code> in <code>.env</code> when the
            request body omits key/secret.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>API routes</h2>
        <ol className="steps">
          <li>
            <code>GET /api/connect-url?network=x&amp;redirectUri=…</code> — start OAuth for a
            network.
          </li>
          <li>
            <code>GET /api/accounts?network=x</code> — raw list of every account connected under
            this Outstand key (used for debugging; the UI intentionally does not call this, since
            it would show every visitor's accounts, not just yours).
          </li>
          <li>
            <code>POST /api/post</code> with a specific account ID.
          </li>
        </ol>
      </section>
    </div>
  );
}
