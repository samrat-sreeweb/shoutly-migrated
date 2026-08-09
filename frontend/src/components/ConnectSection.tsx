import { BlueskyConnectForm } from './BlueskyConnectForm';
import type { SocialAccount } from '../api/types';

interface ConnectSectionProps {
  network: string;
  connecting: boolean;
  onConnect: () => void;
  onRefresh: () => void;
  onNetworkChange: (network: string) => void;
  onBlueskyConnected: (account: SocialAccount) => void;
}

// Matches the "network" values Outstand's API expects (see /docs/getting-started).
const NETWORKS = [
  { value: 'x', label: 'X (Twitter)' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'threads', label: 'Threads' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'google_business', label: 'Google Business Profile' },
  { value: 'vimeo', label: 'Vimeo' },
];

export function ConnectSection({
  network,
  connecting,
  onConnect,
  onRefresh,
  onNetworkChange,
  onBlueskyConnected,
}: ConnectSectionProps) {
  const label = NETWORKS.find((n) => n.value === network)?.label || network;
  const isBluesky = network === 'bluesky';

  return (
    <section className="card">
      <h2>1. Connect your own account</h2>
      <p className="muted">
        {isBluesky
          ? 'Bluesky uses an app password instead of OAuth — enter your handle and password below.'
          : "Pick a platform, hit Connect, and log in with your own account on the next screen. You'll be brought straight back here once it's done — nothing is opened in a new tab."}
      </p>
      <div className="row" style={{ marginBottom: '0.75rem' }}>
        <label className="muted" htmlFor="network-select">
          Network
        </label>
        <select
          id="network-select"
          value={network}
          onChange={(e) => onNetworkChange(e.target.value)}
          disabled={connecting}
        >
          {NETWORKS.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </div>

      {isBluesky ? (
        <>
          <p className="muted">
            Create an app password at{' '}
            <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer">
              bsky.app/settings/app-passwords
            </a>{' '}
            (not your main Bluesky password). It&apos;s sent once to connect and isn&apos;t stored
            here.
          </p>
          <BlueskyConnectForm embedded onConnected={onBlueskyConnected} />
          <div className="row" style={{ marginTop: '0.75rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onRefresh}>
              Refresh list
            </button>
          </div>
        </>
      ) : (
        <div className="row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? 'Redirecting…' : `Connect ${label}`}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onRefresh}>
            Refresh list
          </button>
        </div>
      )}
    </section>
  );
}
