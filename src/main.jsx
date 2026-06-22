import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Copy,
  Highlighter,
  MonitorDown,
  KeyRound,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2
} from 'lucide-react';
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
const CONTACT_RECEIVED_PATH = '/contact-received';
const PAGE_PATHS = {
  about: '/about',
  app: '/',
  contact: CONTACT_RECEIVED_PATH,
  howToUse: '/how-to-use',
  privacyTerms: '/privacy-policy-terms'
};
const INFO_PAGES = {
  howToUse: {
    eyebrow: 'How to use',
    title: 'How to use Learnito AI',
    intro: 'Learnito helps students turn study material into short summaries, important concepts, and practice quiz questions.',
    sections: [
      { title: '1. Paste your study material', body: 'Copy lecture notes, textbook content, revision material, or class notes and paste them into the Study material box.' },
      { title: '2. Generate study notes', body: 'Click Generate. Learnito creates exact key bullet points, important concepts, and practice questions based on your content.' },
      { title: '3. Practice faster', body: 'Read the short answers in the Practice Quiz section. The answers are written in simple points for quick revision.' },
      { title: '4. Save offline', body: 'Click Save offline to keep your notes on the same device. Saved notes can be opened again even when you are offline.' },
      { title: '5. Premium access', body: 'Every device gets 10 free note generations per month. Premium unlocks unlimited generation for 28 days on the activated device.' }
    ]
  },
  privacyTerms: {
    eyebrow: 'Privacy and terms',
    title: 'Privacy Policy and Terms',
    intro: 'Learnito is built for students. These simple rules explain how the app works and what users should know before using it.',
    sections: [
      { title: 'Privacy Policy', body: 'Learnito stores saved notes locally on your device using browser storage. Your saved notes are not uploaded to a Learnito account database.' },
      { title: 'Study material', body: 'Only paste study material you are allowed to use. Do not paste private, sensitive, or illegal content.' },
      { title: 'Device ID and premium', body: 'Learnito creates a device ID in your browser so premium access can be activated for one device. Admin activation links work only for the matching device ID.' },
      { title: 'Payments', body: 'Premium requests are handled through WhatsApp support. Always confirm payment details before paying. Premium access lasts 28 days after activation.' },
      { title: 'Terms of use', body: 'Learnito is a study helper. Users should review generated notes and answers before depending on them for exams, homework, or official work.' },
      { title: 'Contact', body: 'For help, premium activation, or questions, use the Access Premium WhatsApp button in the app.' }
    ]
  },
  about: {
    eyebrow: 'About Learnito',
    title: 'About Learnito AI',
    intro: 'Learnito AI Study Notes Generator helps students revise faster by converting study material into clear notes and practice questions.',
    sections: [
      { title: 'What Learnito does', body: 'Students paste study material and Learnito creates key summaries, important concepts, and practice quiz questions with simple answers.' },
      { title: 'Founder', body: 'Learnito was founded by Mukilan Muthuvalathan, Founder and CEO of Learnito.' },
      { title: 'Mission', body: 'The mission of Learnito is to make studying faster, easier, and more useful for students on phone, tablet, laptop, and desktop.' },
      { title: 'Offline-first study', body: 'Learnito supports offline saved notes on the same device, so students can continue revision without needing to reload everything.' }
    ]
  }
};
const ASSET_BASE = import.meta.env.BASE_URL;
const LOGO_UI_SRC = `${ASSET_BASE}learnito-logo-small.png`;

function App() {
  const [sourceText, setSourceText] = useState(sampleText);
  const [title, setTitle] = useState('Photosynthesis review');
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [guide, setGuide] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [premiumCode, setPremiumCode] = useState('');
  const [generatedActivationLink, setGeneratedActivationLink] = useState('');
  const [usage, setUsage] = useState({ count: 0, limit: 10, premiumActive: false });
  const [status, setStatus] = useState('Ready offline');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installReady, setInstallReady] = useState(false);
  const [installHelp, setInstallHelp] = useState('');
  const [view, setView] = useState(() => getViewFromPath());
  const limitReached = !usage.premiumActive && usage.count >= usage.limit;

  useEffect(() => {
    const currentDeviceId = getOrCreateDeviceId();
    setDeviceId(currentDeviceId);
    setUsage(getUsageStatus());
    handlePremiumActivationLink(currentDeviceId);

    getNotes().then((storedNotes) => {
      setNotes(storedNotes);
      if (storedNotes[0]) {
        openNote(storedNotes[0]);
      }
    });
  }, []);

  useEffect(() => {
    function handlePopState() {
      setView(getViewFromPath());
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

  function handlePremiumActivationLink(currentDeviceId) {
    const params = new URLSearchParams(window.location.search);
    const premiumDeviceId = params.get('premiumDevice');
    const premiumKey = params.get('premiumKey');

    if (!premiumDeviceId || !premiumKey) return;

    const cleanUrl = window.location.pathname || '/';
    window.history.replaceState({}, '', cleanUrl);

    if (premiumDeviceId !== currentDeviceId) {
      setError('This premium link is for another device. Copy this device ID and ask admin for a new link.');
      setStatus('Premium link device mismatch');
      return;
    }

    const result = activatePremiumCode(premiumKey);

    if (!result.ok) {
      setError(result.error);
      setStatus(result.error);
      return;
    }

    setPremiumCode('');
    setUsage(getUsageStatus());
    setMessage('Premium is activated on this device.');
    setStatus('Premium is activated');
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
    const path = nextView === 'admin' ? '/admin' : PAGE_PATHS[nextView] || PAGE_PATHS.app;
    window.history.pushState({}, '', path);
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

  if (view === 'contact') {
    return <ContactReceivedPage onBack={() => navigate('app')} />;
  }

  if (INFO_PAGES[view]) {
    return <InfoPage page={INFO_PAGES[view]} onBack={() => navigate('app')} onNavigate={navigate} />;
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
              <MonitorDown size={17} />
              {installReady ? 'Install App' : 'Install'}
            </button>
            <div className="status-pill" role="status" aria-live="polite">
              <CheckCircle2 size={16} />
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
                  {isGenerating ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                  Generate
                </button>
                <button className="secondary" type="button" onClick={handleSave}>
                  <Save size={18} />
                  Save offline
                </button>
              </div>
            </section>

            <section className="results-panel">
              {!guide ? (
                <div className="empty-state">
                  <Brain size={44} />
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
                <Copy size={16} />
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
              placeholder="LA-..."
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
            <Plus size={18} />
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
                  <Trash2 size={16} />
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
        <nav className="footer-links" aria-label="Learnito pages">
          <button type="button" onClick={() => navigate('howToUse')}>How to use</button>
          <button type="button" onClick={() => navigate('privacyTerms')}>Privacy &amp; Terms</button>
          <button type="button" onClick={() => navigate('about')}>About</button>
          <button className="admin-link" type="button" onClick={() => navigate('admin')}>
            <ShieldCheck size={17} />
            Admin
          </button>
        </nav>
      </footer>
    </main>
  );
}

function InfoPage({ onBack, onNavigate, page }) {
  return (
    <main className="info-page">
      <section className="info-shell">
        <header className="info-header">
          <div className="brand-heading">
            <img src={LOGO_UI_SRC} alt="Learnito AI logo" width="82" height="82" decoding="async" />
            <div>
              <p className="eyebrow">{page.eyebrow}</p>
              <h1>{page.title}</h1>
            </div>
          </div>
          <button className="secondary-link" type="button" onClick={onBack}>Back to app</button>
        </header>

        <p className="info-intro">{page.intro}</p>

        <div className="info-grid">
          {page.sections.map((section) => (
            <article className="info-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>

        <div className="info-actions">
          <button type="button" onClick={onBack}>Start using Learnito</button>
          <button className="secondary-info-button" type="button" onClick={() => onNavigate('contact')}>Contact support</button>
        </div>
      </section>
    </main>
  );
}

function ContactReceivedPage({ onBack }) {
  return (
    <main className="contact-page">
      <section className="contact-card">
        <img
          src={LOGO_UI_SRC}
          alt="Learnito AI logo"
          width="82"
          height="82"
          decoding="async"
        />
        <p className="eyebrow">Contact received</p>
        <h1>Thank you for contacting Learnito</h1>
        <p>
          Your premium access request has been received. We will reply on WhatsApp with the next step.
        </p>
        <a className="premium-access-button" href={WHATSAPP_PREMIUM_LINK} rel="noreferrer" target="_blank">
          Continue on WhatsApp
        </a>
        <button className="secondary-link" type="button" onClick={onBack}>Back to app</button>
      </section>
    </main>
  );
}

function getViewFromPath() {
  if (window.location.pathname === '/admin') return 'admin';
  if (window.location.pathname === PAGE_PATHS.contact) return 'contact';
  if (window.location.pathname === PAGE_PATHS.howToUse) return 'howToUse';
  if (window.location.pathname === PAGE_PATHS.privacyTerms) return 'privacyTerms';
  if (window.location.pathname === PAGE_PATHS.about) return 'about';
  return 'app';
}
function AdminPanel({ onBack, onUsageChange }) {
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

function StudyGuide({ guide }) {
  return (
    <div className="study-guide">
      <GuideSection icon={<BookOpen />} title="Key Summary">
        <ul>
          {guide.summary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection icon={<Highlighter />} title="Important Concepts">
        <div className="concepts">
          {guide.concepts.map((concept) => (
            <span key={concept}>{concept}</span>
          ))}
        </div>
      </GuideSection>

      <GuideSection icon={<Brain />} title="Practice Quiz">
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
        {React.cloneElement(icon, { size: 20 })}
        {title}
      </h2>
      {children}
    </section>
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
