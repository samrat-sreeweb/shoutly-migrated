interface ConnectSectionProps {
  connecting: boolean;
  onConnect: () => void;
  onRefresh: () => void;
}

export function ConnectSection({ connecting, onConnect, onRefresh }: ConnectSectionProps) {
  return (
    <section className="card">
      <h2>1. Connect</h2>
      <p className="muted">
        Opens Facebook + Outstand&apos;s authorization flow in a new tab. Come back here and hit
        refresh once you&apos;re done.
      </p>
      <div className="row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onConnect}
          disabled={connecting}
        >
          {connecting ? 'Opening…' : 'Connect Facebook Page'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onRefresh}>
          Refresh accounts
        </button>
      </div>
    </section>
  );
}
