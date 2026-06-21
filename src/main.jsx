import React, { useEffect, useMemo, useState } from 'react';
import './styles.css';
import {
  activatePremiumCode,
  createPremiumCode,
  getAdminSnapshot,
  getOrCreateDeviceId,
  getUsageStatus,
  incrementUsage,
  setPremiumDevice
} from './premium.js';
import { generateStudyGuide } from './studyAi.js';
import { deleteNote, getNotes, saveNote } from './storage.js';

const sampleText =
  'Photosynthesis is the process by which plants convert light energy into chemical energy. Chlorophyll absorbs sunlight, carbon dioxide enters through stomata, and water is absorbed by roots. In the chloroplasts, light-dependent reactions create ATP and NADPH, while the Calvin cycle uses carbon dioxide to produce glucose. Oxygen is released as a byproduct.';
const ADMIN_PASSWORD = 'Mukilan@2009';
const ADMIN_SESSION_KEY = 'learnito_admin_password';
const WHATSAPP_PREMIUM_LINK = 'https://wa.me/message/6FSCTMUBFVESK1?src=qr';
const ASSET_BASE = import.meta.env.BASE_URL;
const LOGO_UI_SRC = `${ASSET_BASE}learnito-logo-ui.png`;

function App() {
  const [sourceText, setSourceText] = useState(sampleText);
  const [title, setTitle] = useState('Photosynthesis review');
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [guide, setGuide] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [premiumCode, setPremiumCode] = useState('');
  const [usage, setUsage] = useState({ count: 0, limit: 10, premiumActive: false });
  const [status, setStatus] = useState('Ready offline');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installReady, setInstallReady] = useState(false);
  const [installHelp, setInstallHelp] = useState('');
  const [view, setView] = useState(() => (window.location.pathname === '/admin' ? 'admin' : 'app'));
  const limitReached = !usage.premiumActive && usage.count >= usage.limit;

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
    setUsage(getUsageStatus());

    getNotes().then((storedNotes) => {
      setNotes(storedNotes);
      if (storedNotes[0]) {
        openNote(storedNotes[0]);
      }
    });
  }, []);

  useEffect(() => {
    function handlePopState() {
      setView(window.location.pathname === '/admin' ? 'admin' : 'app');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
      setInstallReady(true);
      setInstallHelp('');
    }

    function handleInstalled() {
      setInstallPrompt(null);
      setInstallReady(false);
      setStatus('Learnito app installed');
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const wordCount = useMemo(() => {
    return sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  }, [sourceText]);

  async function handleGenerate() {
    if (!sourceText.trim()) {
      setStatus('Paste study material first');
      return;
    }

    if (limitReached) {
      setError('Free limit reached. Activate premium to create more notes.');
      setStatus('Free limit reached');
      return;
    }

    setIsGenerating(true);
    setError('');
    setMessage('');
    setStatus('Generating study guide...');

    try {
      const generatedGuide = await generateStudyGuide(sourceText);
      setGuide(generatedGuide);
      if (!usage.premiumActive) {
        setUsage(incrementUsage());
      }
      setStatus('Summary, concepts, and quiz ready');
    } catch {
      setError('Could not generate the study guide. Please try again.');
      setStatus('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!sourceText.trim()) {
      setStatus('Paste study material before saving');
      return;
    }

    if (!guide && limitReached) {
      setError('Free limit reached. Activate premium to create more notes.');
      setStatus('Free limit reached');
      return;
    }

    setIsGenerating(true);
    setError('');
    setMessage('');
    setStatus(guide ? 'Saving note...' : 'Generating and saving note...');

    try {
      const guideToSave = guide || (await generateStudyGuide(sourceText));
      const noteId = activeNoteId || createNoteId();
      const saved = await saveNote({
        id: noteId,
        title: title.trim() || 'Untitled study note',
        sourceText,
        guide: guideToSave,
        updatedAt: new Date().toISOString()
      });

      if (!guide) {
        setGuide(guideToSave);
        if (!usage.premiumActive) {
          setUsage(incrementUsage());
        }
      }

      const storedNotes = await getNotes();
      setNotes(storedNotes);
      setActiveNoteId(saved.id);
      setStatus('Saved for offline study');
    } catch {
      setError('Could not save this note. Please try again.');
      setStatus('Save failed');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(id) {
    await deleteNote(id);
    const storedNotes = await getNotes();
    setNotes(storedNotes);

    if (activeNoteId === id) {
      setActiveNoteId(null);
      setGuide(null);
      setTitle('New study note');
      setSourceText('');
    }

    setStatus('Note deleted');
  }

  function openNote(note) {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setSourceText(note.sourceText);
    setGuide(note.guide);
    setStatus('Loaded from offline storage');
  }

  function startNewNote() {
    setActiveNoteId(null);
    setTitle('New study note');
    setSourceText('');
    setGuide(null);
    setStatus('New note ready');
  }

  function activatePremium() {
    setError('');
    setMessage('');

    const result = activatePremiumCode(premiumCode);

    if (!result.ok) {
      setError(result.error);
      setStatus(result.error);
      return;
    }

    setPremiumCode('');
    setUsage(getUsageStatus());
    setMessage('Premium is activated.');
    setStatus('Premium is activated');
  }

  async function copyDeviceId() {
    if (!deviceId) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(deviceId);
      } else {
        fallbackCopy(deviceId);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      fallbackCopy(deviceId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  function navigate(nextView) {
    window.history.pushState({}, '', nextView === 'admin' ? '/admin' : '/');
    setView(nextView);
  }

  async function installApp() {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setStatus('Learnito app is already installed');
      setInstallHelp('');
      return;
    }

    if (!installPrompt) {
      setStatus('Install from browser menu');
      setInstallHelp('Open the browser menu, then choose Install app or Add to home screen.');
      return;
    }

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallReady(false);
    setInstallHelp(
      choice.outcome === 'accepted'
        ? ''
        : 'Install was cancelled. Tap Install again or use the browser menu.'
    );
    setStatus(choice.outcome === 'accepted' ? 'Learnito app install started' : 'Install cancelled');
  }

  if (view === 'admin') {
    return <AdminPanel onBack={() => navigate('app')} onUsageChange={setUsage} />;
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
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
              <p className="eyebrow">PWA Study Tool</p>
              <h1>Learnito AI Study Notes Generator</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              aria-label="Install Learnito app"
              className="install-button"
              type="button"
              onClick={installApp}
            >
              <Icon label="App" />
              {installReady ? 'Install App' : 'Install'}
            </button>
            <div className="status-pill" role="status" aria-live="polite">
              <Icon label="OK" />
              {status}
            </div>
            {installHelp && <p className="install-help">{installHelp}</p>}
          </div>
        </header>

        <div className="editor-grid">
            <section className="input-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Source Material</p>
                  <h2>Paste lecture notes</h2>
                </div>
                <span>{wordCount} words</span>
              </div>

              <label className="field-label" htmlFor="note-title">
                Note title
              </label>
              <input
                id="note-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Biology chapter 3"
              />

              <label className="field-label" htmlFor="source-text">
                Study material
              </label>
            <textarea
              id="source-text"
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              onFocus={() => {
                if (sourceText === sampleText) {
                  setSourceText('');
                }
              }}
              placeholder="Paste textbook content, class notes, or revision material..."
            />

              <div className="actions">
                <button type="button" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <Icon className="spin" label="..." /> : <Icon label="AI" />}
                  Generate
                </button>
                <button className="secondary" type="button" onClick={handleSave}>
                  <Icon label="Save" />
                  Save offline
                </button>
              </div>
            </section>

            <section className="results-panel">
              {!guide ? (
                <div className="empty-state">
                  <span className="empty-icon" aria-hidden="true">AI</span>
                  <h2>Your study guide appears here</h2>
                  <p>Generate concise summaries, highlighted concepts, and practice questions.</p>
                </div>
              ) : (
                <StudyGuide guide={guide} />
              )}
            </section>
        </div>
      </section>

      <aside className="library">
        <div className="premium-panel">
          <h2>{usage.premiumActive ? 'Premium active' : 'Premium access'}</h2>
          <p className="muted">
            {usage.premiumActive
              ? 'Premium active on this device.'
              : `${usage.count}/${usage.limit} free generated notes used this month.`}
          </p>

          {message && <p className="premium-message" role="status" aria-live="polite">{message}</p>}
          {error && <p className="limit-alert" role="alert">{error}</p>}

          <div className="device-box">
            <span>Your device ID</span>
            <div>
              <input id="device-id" aria-label="Your device ID" readOnly value={deviceId} />
              <button className="copy-device-button" type="button" onClick={copyDeviceId} aria-label="Copy device ID">
                <Icon label="ID" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <label className="field-label compact" htmlFor="premium-code">
            Premium code
          </label>
          <div className="premium-form">
            <input
              id="premium-code"
              value={premiumCode}
              onChange={(event) => setPremiumCode(event.target.value)}
              placeholder="TR-..."
            />
            <button type="button" onClick={activatePremium}>Activate</button>
          </div>

          {!usage.premiumActive && (
            <a
              className="premium-access-button"
              href={WHATSAPP_PREMIUM_LINK}
              rel="noreferrer"
              target="_blank"
            >
              Access Premium
            </a>
          )}

          {limitReached && (
            <div className="whatsapp-payment-card">
              <img src={`${ASSET_BASE}whatsapp-qr.jpeg`} alt="WhatsApp premium payment QR code" />
              <h3>Free trial finished</h3>
              <p>You used 10 free note generations this month.</p>
              <p>Scan this WhatsApp QR to pay for premium and send your device ID for activation.</p>
              <a
                className="premium-access-button"
                href={WHATSAPP_PREMIUM_LINK}
                rel="noreferrer"
                target="_blank"
              >
                Access Premium
              </a>
              <strong>Safe and secure WhatsApp payment support.</strong>
            </div>
          )}
        </div>

        <div className="library-header">
          <div>
            <p className="eyebrow">Offline Library</p>
            <h2>Saved notes</h2>
          </div>
          <button className="icon-button" type="button" onClick={startNewNote} aria-label="Create note">
            <Icon label="+" />
          </button>
        </div>

        <div className="note-list">
          {notes.length === 0 ? (
            <p className="muted">Saved notes will be available here, even offline.</p>
          ) : (
            notes.map((note) => (
              <article
                className={note.id === activeNoteId ? 'note-card active' : 'note-card'}
                key={note.id}
              >
                <button type="button" onClick={() => openNote(note)} aria-label={`Open ${note.title}`}>
                  <strong>{note.title}</strong>
                  <span>{new Date(note.updatedAt).toLocaleString()}</span>
                </button>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  aria-label={`Delete ${note.title}`}
                >
                  <Icon label="Del" />
                </button>
              </article>
            ))
          )}
        </div>
      </aside>
      <footer className="app-footer">
        <div>
          <strong>Mukilan Muthuvalathan</strong>
          <span>Founder &amp; CEO, Learnito</span>
        </div>
        <button className="admin-link" type="button" onClick={() => navigate('admin')}>
          <Icon label="Admin" />
          Admin
        </button>
      </footer>
    </main>
  );
}

function AdminPanel({ onBack, onUsageChange }) {
  const [password, setPassword] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) || '');
  const [authorized, setAuthorized] = useState(() => Boolean(sessionStorage.getItem(ADMIN_SESSION_KEY)));
  const [snapshot, setSnapshot] = useState(getAdminSnapshot);
  const [deviceId, setDeviceId] = useState('');
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
    createPremiumCode();
    setMessage('Premium code created.');
    setError('');
    loadDashboard();
  }

  function updateDevice(active) {
    const targetDeviceId = deviceId.trim() || (snapshot.devices.length === 1 ? snapshot.devices[0].deviceId : '');
    const result = setPremiumDevice(targetDeviceId, active);

    if (!result.ok) {
      setMessage('');
      setError(result.error);
      return;
    }

    setDeviceId('');
    setError('');
    setMessage(active ? 'Device activated.' : 'Device deactivated.');
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
              <p className="eyebrow">Premium codes</p>
              <h2>Create code</h2>
            </div>
            <button type="button" onClick={createCode}>
              <Icon label="Key" />
              Create code
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
              <button type="button" onClick={() => updateDevice(true)}>Activate</button>
              <button className="deactivate-button" type="button" onClick={() => updateDevice(false)}>
                Deactivate
              </button>
            </div>
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
                <span>{code.active ? 'Active' : 'Inactive'}{code.usedByDeviceId ? ` - Used by ${code.usedByDeviceId}` : ''}</span>
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

function StudyGuide({ guide }) {
  return (
    <div className="study-guide">
      <GuideSection icon="Summary" title="Key Summary">
        <ul>
          {guide.summary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection icon="Concept" title="Important Concepts">
        <div className="concepts">
          {guide.concepts.map((concept) => (
            <span key={concept}>{concept}</span>
          ))}
        </div>
      </GuideSection>

      <GuideSection icon="Quiz" title="Practice Quiz">
        <ol>
          {guide.quiz.map((question) => (
            <li key={question.question}>
              <strong>{question.question}</strong>
              <p>{question.answer}</p>
            </li>
          ))}
        </ol>
      </GuideSection>
    </div>
  );
}

function GuideSection({ children, icon, title }) {
  return (
    <section className="guide-section">
      <h2>
        <Icon label={icon} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Icon({ className = '', label }) {
  return (
    <span className={`mini-icon ${className}`.trim()} aria-hidden="true">
      {label}
    </span>
  );
}

function fallbackCopy(value) {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function createNoteId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

createRoot(document.getElementById('root')).render(<App />);

