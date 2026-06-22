import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import {
  createPremiumCode,
  getAdminSnapshot,
  getUsageStatus,
  setPremiumDevice
} from './premium.js';

const ADMIN_PASSWORD = 'Mukilan@2009';
const ADMIN_SESSION_KEY = 'learnito_admin_password';
const LOGO_UI_SRC = `${import.meta.env.BASE_URL}learnito-logo-small.png`;

export default function AdminPanel({ onBack, onUsageChange }) {
  const [password, setPassword] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) || '');
  const [authorized, setAuthorized] = useState(() => Boolean(sessionStorage.getItem(ADMIN_SESSION_KEY)));
  const [snapshot, setSnapshot] = useState(getAdminSnapshot);
  const [deviceId, setDeviceId] = useState('');
  const [generatedDeviceCode, setGeneratedDeviceCode] = useState('');
  const [generatedActivationLink, setGeneratedActivationLink] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const activePremiumCount = snapshot.devices.filter((device) => device.premiumActive).length;
  const totalNotes = snapshot.usage.reduce((sum, row) => sum + row.count, 0);

  function loadDashboard() {
    const nextSnapshot = getAdminSnapshot();
    setSnapshot(nextSnapshot);
    onUsageChange(getUsageStatus());
  }

  function login(event) {
    event.preventDefault();
    setError('');

    if (password !== ADMIN_PASSWORD) {
      setError('Incorrect admin password.');
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, password);
    setAuthorized(true);
    loadDashboard();
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthorized(false);
  }

  function createCode() {
    const targetDeviceId = deviceId.trim() || (snapshot.devices.length === 1 ? snapshot.devices[0].deviceId : '');
    const result = createPremiumCode(targetDeviceId);

    if (!result.ok) {
      setMessage('');
      setGeneratedDeviceCode('');
      setGeneratedActivationLink('');
      setError(result.error);
      return;
    }

    const activationLink = `${window.location.origin}/?premiumDevice=${encodeURIComponent(targetDeviceId)}&premiumKey=${encodeURIComponent(result.code.code)}`;
    setGeneratedDeviceCode(result.code.code);
    setGeneratedActivationLink(activationLink);
    setMessage('One-device premium code created. It works only for this Device ID.');
    setError('');
    loadDashboard();
  }

  async function updateDevice(active) {
    const targetDeviceId = deviceId.trim() || (snapshot.devices.length === 1 ? snapshot.devices[0].deviceId : '');

    if (!targetDeviceId) {
      setMessage('');
      setGeneratedDeviceCode('');
      setError('Device ID is required.');
      return;
    }

    if (active) {
      const result = createPremiumCode(targetDeviceId);

      if (!result.ok) {
        setMessage('');
        setGeneratedDeviceCode('');
        setGeneratedActivationLink('');
        setError(result.error);
        return;
      }

      const code = result.code.code;
      const activationLink = `${window.location.origin}/?premiumDevice=${encodeURIComponent(targetDeviceId)}&premiumKey=${encodeURIComponent(code)}`;
      setGeneratedDeviceCode(code);
      setGeneratedActivationLink(activationLink);
      setError('');
      setMessage('One-device activation link created. Send this link to the user. It works only for this Device ID.');

      try {
        await navigator.clipboard?.writeText(activationLink);
      } catch {
        // The visible link can still be copied manually.
      }

      return;
    }

    const result = setPremiumDevice(targetDeviceId, false);

    if (!result.ok) {
      setMessage('');
      setGeneratedDeviceCode('');
      setError(result.error);
      return;
    }

    setError('');
    setGeneratedDeviceCode('');
    setMessage('Device deactivated on this admin browser. Ask the user to remove premium locally if needed.');
    loadDashboard();
  }

  if (!authorized) {
    return (
      <main className="admin-page">
        <section className="admin-login-card">
          <h1>Admin login</h1>
          <form onSubmit={login}>
            <label className="field-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
            <button type="submit">Login</button>
          </form>
          {error && <p className="limit-alert" role="alert">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-topbar">
          <div className="brand-heading">
            <img
              src={LOGO_UI_SRC}
              alt="Learnito AI logo"
              width="82"
              height="82"
              decoding="async"
              fetchPriority="high"
            />
            <div>
              <p className="eyebrow">Admin</p>
              <h1>Premium dashboard</h1>
            </div>
          </div>
          <button className="secondary-link" type="button" onClick={onBack}>Back to app</button>
          <button className="secondary-link" type="button" onClick={logout}>Logout</button>
        </header>

        {(message || error) && (
          <p className={error ? 'limit-alert' : 'premium-message'} role="status" aria-live="polite">{error || message}</p>
        )}

        <section className="admin-stats">
          <StatCard label="Devices" value={snapshot.devices.length} />
          <StatCard label="Active premium" value={activePremiumCount} />
          <StatCard label="Total notes" value={totalNotes} />
        </section>

        <section className="admin-grid">
          <div className="admin-card">
            <div>
              <p className="eyebrow">One device access</p>
              <h2>Create Device ID code</h2>
            </div>
            <button type="button" onClick={createCode}>
              <KeyRound size={18} />
              Create code for Device ID
            </button>
          </div>

          <div className="admin-card activate-device-card">
            <div>
              <p className="eyebrow">Device activation</p>
              <h2>Activate user</h2>
            </div>
            <div className="admin-device-field">
              <input
                id="admin-device-id"
                aria-label="Device ID"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
                placeholder="Paste or select Device ID"
              />
              <button type="button" onClick={() => updateDevice(true)}>Create activation link</button>
              <button className="deactivate-button" type="button" onClick={() => updateDevice(false)}>
                Deactivate
              </button>
            </div>
            {generatedActivationLink && (
              <div className="generated-code-box">
                <span>One-device premium link</span>
                {generatedDeviceCode && <code>{generatedDeviceCode}</code>}
                <strong>{generatedActivationLink}</strong>
                <small>This code/link works only on the matching Device ID.</small>
              </div>
            )}
          </div>
        </section>

        <section className="code-table">
          <h2>Premium codes</h2>
          {snapshot.codes.length === 0 ? (
            <p className="muted">No codes yet.</p>
          ) : (
            snapshot.codes.map((code) => (
              <article className="code-row" key={code.id}>
                <strong>{code.code}</strong>
                <span>{code.active ? 'Active' : 'Inactive'}{code.deviceId ? ` - For ${code.deviceId}` : ''}{code.usedByDeviceId ? ` - Used by ${code.usedByDeviceId}` : ''}</span>
                <small>{code.expiresAt ? `Expires ${new Date(code.expiresAt).toLocaleDateString()}` : 'No expiry'}</small>
              </article>
            ))
          )}
        </section>

        <section className="code-table">
          <h2>Submitted devices</h2>
          {snapshot.devices.length === 0 ? (
            <p className="muted">No devices yet.</p>
          ) : (
            snapshot.devices.map((device) => (
              <button
                className="code-row selectable-row"
                key={device.deviceId}
                type="button"
                onClick={() => setDeviceId(device.deviceId)}
                aria-label={`Select device ${device.deviceId}`}
              >
                <strong>{device.deviceId}</strong>
                <span>{device.premiumActive ? 'Premium active' : 'Inactive'}</span>
                <small>This month: {device.usageCount} notes</small>
              </button>
            ))
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}