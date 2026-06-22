import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Copy,
  Highlighter,
  MonitorDown,
  MessageCircle,
  Loader2,
  Plus,
  Save,
  Share2,
  Sparkles,
  Trash2
} from 'lucide-react';
import './styles.css';
import {
  activatePremiumCode,
  getOrCreateDeviceId,
  getUsageStatus,
  incrementUsage
} from './premium.js';

const sampleText =
  'Photosynthesis is the process by which plants convert light energy into chemical energy. Chlorophyll absorbs sunlight, carbon dioxide enters through stomata, and water is absorbed by roots. In the chloroplasts, light-dependent reactions create ATP and NADPH, while the Calvin cycle uses carbon dioxide to produce glucose. Oxygen is released as a byproduct.';
const WHATSAPP_PREMIUM_LINK = 'https://wa.me/message/6FSCTMUBFVESK1?src=qr';
const SHARE_URL = 'https://learnitoai.in/';
const SHARE_TEXT = 'Try Learnito AI Study Notes Generator: summaries, concepts, and quiz questions from study material.';
const CONTACT_RECEIVED_PATH = '/contact-received';
const AdminPanel = lazy(() => import('./AdminPanel.jsx'));
const RoadmapSections = lazy(() => import('./RoadmapSections.jsx'));
const InfoPages = lazy(() => import('./InfoPages.jsx'));

const PAGE_PATHS = {
  admin: '/admin',
  about: '/about',
  app: '/',
  contact: CONTACT_RECEIVED_PATH,
  aiStudyNotes: '/ai-study-notes-generator',
  howToUse: '/how-to-use',
  notesSummarizer: '/notes-summarizer-for-students',
  practiceQuiz: '/practice-quiz-generator',
  premium: '/premium',
  privacyPolicy: '/privacy-policy',
  privacyTerms: '/privacy-policy-terms',
  termsConditions: '/terms-and-conditions',
  blog: '/blog'
};
const PAGE_META = {
  app: {
    title: 'Learnito AI Study Notes Generator',
    description: 'Generate exact key summaries, important concepts, and practice quiz questions from study material. Save notes offline with Learnito AI.'
  },
  about: {
    title: 'About Learnito AI',
    description: 'Learn about Learnito AI, founded by Mukilan Muthuvalathan to help students create smarter notes, summaries, and quizzes.'
  },
  howToUse: {
    title: 'How to Use Learnito AI',
    description: 'Learn how to paste notes, generate summaries, practice quiz questions, and save study notes offline in Learnito AI.'
  },
  privacyPolicy: {
    title: 'Learnito AI Privacy Policy',
    description: 'Read the Learnito AI privacy policy covering saved notes, analytics, cookies, and student-friendly data protection.'
  },
  termsConditions: {
    title: 'Learnito AI Terms and Conditions',
    description: 'Read Learnito AI terms for educational use, user responsibilities, premium access, payments, and liability limits.'
  },
  premium: {
    title: 'Learnito AI Premium Access',
    description: 'Learnito AI premium gives unlimited note generation for 28 days after admin activation by device ID.'
  },
  blog: {
    title: 'Learnito AI Blog for Students',
    description: 'Study tips and SEO pages for AI study notes, practice quiz generation, and notes summarizing for students.'
  },
  aiStudyNotes: {
    title: 'AI Study Notes Generator',
    description: 'Use Learnito AI to convert study material into exact bullet notes, important concepts, and practice questions.'
  },
  practiceQuiz: {
    title: 'Practice Quiz Generator for Students',
    description: 'Generate practice quiz questions with short, simple answers from your study material using Learnito AI.'
  },
  notesSummarizer: {
    title: 'Notes Summarizer for Students',
    description: 'Summarize lecture notes and textbook content into short exact bullet points for faster revision with Learnito AI.'
  },
  privacyTerms: {
    title: 'Learnito AI Privacy Policy and Terms',
    description: 'Simple student-friendly privacy and terms for using Learnito AI study notes generator.'
  },
  contact: {
    title: 'Learnito AI Contact Received',
    description: 'Learnito AI contact and premium request confirmation page.'
  },
  admin: {
    title: 'Learnito AI Admin',
    description: 'Private Learnito AI admin panel.'
  }
};
const INFO_PAGE_VIEWS = new Set(['howToUse', 'privacyTerms', 'about', 'aiStudyNotes', 'practiceQuiz', 'notesSummarizer', 'privacyPolicy', 'termsConditions', 'premium', 'blog']);
const ASSET_BASE = import.meta.env.BASE_URL;
const GA_MEASUREMENT_ID = 'G-5V26Y64H1J';

function LearnitoMark({ className = 'brand-mark', priority = false }) {
  return (
    <svg
      aria-label="Learnito AI logo"
      className={className}
      role="img"
      viewBox="0 0 512 512"
      width="82"
      height="82"
      focusable="false"
      data-priority={priority ? 'true' : undefined}
    >
      <rect width="512" height="512" rx="104" fill="#047857" />
      <path fill="#fff" d="M145 118h171c34 0 61 27 61 61v231c0 8-9 13-16 9l-34-21c-10-6-22-9-34-9H145c-20 0-36-16-36-36V154c0-20 16-36 36-36Z" />
      <path fill="#bbf7d0" d="M177 193h165v28H177zm0 68h128v28H177zm0 68h88v28h-88z" />
      <path fill="#10b981" d="m352 111 12 33 33 12-33 12-12 33-12-33-33-12 33-12z" />
    </svg>
  );
}

function loadStudyAi() {
  return import('./studyAi.js');
}

function loadStorage() {
  return import('./storage.js');
}

function loadAnalyticsWhenReady() {
  if (typeof window === 'undefined' || window.__learnitoAnalyticsLoaded) return;

  window.__learnitoAnalyticsLoaded = true;

  const loadAnalytics = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  };

  const interactionEvents = ['pointerdown', 'keydown', 'touchstart'];
  const cleanup = () => {
    interactionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, loadOnce);
    });
  };

  const loadOnce = () => {
    cleanup();
    loadAnalytics();
  };

  interactionEvents.forEach((eventName) => {
    window.addEventListener(eventName, loadOnce, { once: true, passive: true });
  });
}

function updatePageMeta(view) {
  if (typeof document === 'undefined') return;

  const meta = PAGE_META[view] || PAGE_META.app;
  document.title = meta.title;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', meta.description);
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', `https://learnitoai.in${PAGE_PATHS[view] || '/'}`);
  }
}

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
  const [showRoadmap, setShowRoadmap] = useState(false);
  const roadmapSentinelRef = useRef(null);
  const limitReached = !usage.premiumActive && usage.count >= usage.limit;

  useEffect(() => {
    loadAnalyticsWhenReady();
    const currentDeviceId = getOrCreateDeviceId();
    setDeviceId(currentDeviceId);
    setUsage(getUsageStatus());
    handlePremiumActivationLink(currentDeviceId);

    const loadSavedNotes = () => {
      loadStorage().then(({ getNotes }) => getNotes()).then((storedNotes) => {
        setNotes(storedNotes);
        if (storedNotes[0]) {
          openNote(storedNotes[0]);
        }
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadSavedNotes, { timeout: 2500 });
    } else {
      window.setTimeout(loadSavedNotes, 900);
    }
  }, []);

  useEffect(() => {
    updatePageMeta(view);
  }, [view]);

  useEffect(() => {
    if (view !== 'app' || showRoadmap) return undefined;

    const sentinel = roadmapSentinelRef.current;
    if (!sentinel || !('IntersectionObserver' in window)) {
      const timer = window.setTimeout(() => setShowRoadmap(true), 3500);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowRoadmap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '360px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showRoadmap, view]);

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
      const { generateStudyGuide } = await loadStudyAi();
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
      const { generateStudyGuide } = guide ? { generateStudyGuide: null } : await loadStudyAi();
      const { saveNote, getNotes } = await loadStorage();
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
    const { deleteNote, getNotes } = await loadStorage();
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

  async function shareLearnito() {
    const shareData = {
      text: SHARE_TEXT,
      title: 'Learnito AI Study Notes Generator',
      url: SHARE_URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setStatus('Share opened');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SHARE_URL);
      } else {
        fallbackCopy(SHARE_URL);
      }
      setStatus('Learnito link copied');
    } catch {
      fallbackCopy(SHARE_URL);
      setStatus('Learnito link copied');
    }
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
    return (
      <Suspense fallback={<main className="admin-page"><section className="admin-login-card"><p>Loading admin...</p></section></main>}>
        <AdminPanel onBack={() => navigate('app')} onUsageChange={setUsage} />
      </Suspense>
    );
  }

  if (view === 'contact') {
    return (
      <Suspense fallback={<main className="contact-page"><section className="contact-card"><p>Loading...</p></section></main>}>
        <InfoPages view="contact" onBack={() => navigate('app')} onNavigate={navigate} />
      </Suspense>
    );
  }

  if (INFO_PAGE_VIEWS.has(view)) {
    return (
      <Suspense fallback={<main className="info-page"><section className="info-shell"><p>Loading...</p></section></main>}>
        <InfoPages view={view} onBack={() => navigate('app')} onNavigate={navigate} />
      </Suspense>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <main id="main-content" className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div className="brand-heading">
            <LearnitoMark priority />

            <div>
              <p className="eyebrow">PWA Study Tool</p>
              <h1>Learnito AI Study Notes Generator</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="utility-button" type="button" onClick={shareLearnito}>
              <Share2 size={17} />
              Share
            </button>
            <a className="utility-button" href={WHATSAPP_PREMIUM_LINK} rel="noreferrer" target="_blank">
              <MessageCircle size={17} />
              Feedback
            </a>
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
              ? 'Premium active on this device. Unlimited note generation is available for 28 days from activation.'
              : `${usage.count}/${usage.limit} free generated notes used this month. Free users get 10 notes per month.`}
          </p>
          {!usage.premiumActive && (
            <ul className="premium-benefits">
              <li>10 free notes every month</li>
              <li>Premium gives unlimited notes for 28 days</li>
              <li>WhatsApp payment and activation support</li>
              <li>Safe and secure payment guidance</li>
            </ul>
          )}

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
      <div className="roadmap-sentinel" ref={roadmapSentinelRef} aria-hidden="true" />
      {showRoadmap && <RoadmapSections onNavigate={navigate} onShare={shareLearnito} />}

      <a className="floating-feedback" href={WHATSAPP_PREMIUM_LINK} rel="noreferrer" target="_blank">
        <MessageCircle size={18} />
        Send Feedback
      </a>
      <footer className="app-footer">
        <div>
          <strong>Mukilan Muthuvalathan</strong>
          <span>Founder &amp; CEO, Learnito</span>
        </div>
        <nav className="footer-links" aria-label="Learnito pages">
          <button type="button" onClick={() => navigate('app')}>Home</button>
          <button type="button" onClick={() => navigate('app')}>Features</button>
          <button type="button" onClick={() => navigate('howToUse')}>How to Use</button>
          <button type="button" onClick={() => navigate('premium')}>Premium</button>
          <button type="button" onClick={() => navigate('blog')}>Blog</button>
          <button type="button" onClick={() => navigate('privacyPolicy')}>Privacy Policy</button>
          <button type="button" onClick={() => navigate('termsConditions')}>Terms &amp; Conditions</button>
          <button type="button" onClick={() => navigate('contact')}>Contact Us</button>
        </nav>
      </footer>
      </main>
    </>
  );
}

function getViewFromPath() {
  if (window.location.pathname === '/admin') return 'admin';
  if (window.location.pathname === PAGE_PATHS.contact) return 'contact';
  if (window.location.pathname === PAGE_PATHS.aiStudyNotes) return 'aiStudyNotes';
  if (window.location.pathname === PAGE_PATHS.howToUse) return 'howToUse';
  if (window.location.pathname === PAGE_PATHS.notesSummarizer) return 'notesSummarizer';
  if (window.location.pathname === PAGE_PATHS.practiceQuiz) return 'practiceQuiz';
  if (window.location.pathname === PAGE_PATHS.premium) return 'premium';
  if (window.location.pathname === PAGE_PATHS.privacyPolicy) return 'privacyPolicy';
  if (window.location.pathname === PAGE_PATHS.privacyTerms) return 'privacyTerms';
  if (window.location.pathname === PAGE_PATHS.termsConditions) return 'termsConditions';
  if (window.location.pathname === PAGE_PATHS.blog) return 'blog';
  if (window.location.pathname === PAGE_PATHS.about) return 'about';
  return 'app';
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
