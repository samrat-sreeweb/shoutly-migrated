import { NavLink } from 'react-router-dom';

export function SetupGuidePage() {
  return (
    <div className="wrap wrap-wide">
      <header className="page-header">
        <span className="badge">SETUP GUIDE</span>
        <h1>Meta (Facebook &amp; Instagram) Setup</h1>
        <p className="muted">
          Reference for configuring Outstand with Meta apps. The live connect flow lives on the
          home page.
        </p>
        <p className="nav-back">
          <NavLink to="/">← Back to Connect &amp; Post</NavLink>
        </p>
      </header>

      <section className="card">
        <h2>What you need</h2>
        <p className="muted">
          Server-side <code>OUTSTAND_API_KEY</code> (Nest backend), a Meta developer app with
          Facebook Login / Pages permissions, and Outstand network credentials configured via the
          backend or CLI scripts in the original harness.
        </p>
      </section>

      <section className="card">
        <h2>Connect flow</h2>
        <ol className="steps">
          <li>
            Call <code>GET /api/connect-url?network=facebook</code> (Nest mirrors the old Express
            route).
          </li>
          <li>Open the returned <code>authUrl</code> and complete Outstand + Meta OAuth.</li>
          <li>
            Refresh accounts with <code>GET /api/accounts?network=facebook</code>.
          </li>
          <li>
            Publish with <code>POST /api/post</code> using a specific account ID (not just
            &quot;facebook&quot; when multiple Pages exist).
          </li>
        </ol>
      </section>
    </div>
  );
}
