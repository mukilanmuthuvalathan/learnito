import React from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_PREMIUM_LINK = 'https://wa.me/message/6FSCTMUBFVESK1?src=qr';
const SHARE_URL = 'https://learnitoai.in/';
const SHARE_TEXT = 'Try Learnito AI Study Notes Generator: summaries, concepts, and quiz questions from study material.';

const ROADMAP_ITEMS = [
  { text: 'About Page', detail: 'Builds trust and credibility', color: '#10b981' },
  { text: 'Privacy Policy', detail: 'Important for Ads and SEO', color: '#2563eb' },
  { text: 'Terms & Conditions', detail: 'Legal protection and trust', color: '#7c3aed' },
  { text: 'How to Use Page', detail: 'Helps new users quickly understand', color: '#f59e0b' },
  { text: 'Premium Page', detail: 'Clear value and payment trust', color: '#ec4899' },
  { text: 'Blog / SEO Pages', detail: 'Growth and search traffic', color: '#0891b2' },
  { text: 'Feedback Button', detail: 'User feedback and support', color: '#6d28d9' },
  { text: 'Share Button', detail: 'Viral growth and reach', color: '#2563eb' }
];

const HOW_TO_STEPS = [
  { title: 'Paste Notes', body: 'Paste your class notes, text, or content.' },
  { title: 'Generate Summary', body: 'AI creates a clear and concise summary.' },
  { title: 'Practice Quiz', body: 'Get AI-generated quizzes to test yourself.' },
  { title: 'Save Offline', body: 'Download and study anytime, anywhere.' }
];

const BLOG_CARDS = [
  { title: 'AI Study Notes Generator', body: 'Create perfect study notes in seconds using AI.', view: 'aiStudyNotes' },
  { title: 'Practice Quiz Generator', body: 'Generate unlimited quizzes and test your knowledge.', view: 'practiceQuiz' },
  { title: 'Notes Summarizer for Students', body: 'Summarize any content instantly and study smart.', view: 'notesSummarizer' }
];

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



export default function RoadmapSections({ onNavigate, onShare }) {
  return (
    <section className="roadmap-section" aria-label="Learnito AI roadmap pages">
      <div className="roadmap-shell">
        <article className="roadmap-card roadmap-priority">
          <p className="eyebrow">Recommended Order</p>
          <h2>Learnito AI Roadmap</h2>
          <div className="roadmap-list">
            {ROADMAP_ITEMS.map((item, index) => (
              <div className="roadmap-list-item" key={item.text}>
                <span style={{ backgroundColor: item.color }}>{index + 1}</span>
                <div>
                  <strong>{item.text}</strong>
                  <small>{item.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="roadmap-card founder-card">
          <p className="eyebrow">About Page</p>
          <h2>About Learnito AI</h2>
          <p>Learnito AI helps students create notes, summaries, and quizzes using AI to make studying easier and smarter.</p>
          <div className="founder-profile">
            <LearnitoMark className="brand-mark founder-mark" />
            <div>
              <strong>Mukilan Muthuvalathan</strong>
              <span>Founder &amp; CEO, Learnito AI</span>
            </div>
          </div>
        </article>

        <article className="roadmap-card policy-card">
          <p className="eyebrow">Privacy Policy</p>
          <h2>Student-friendly privacy</h2>
          <p>Explains local saved notes, cookies, analytics, and privacy protection in simple language.</p>
          <button type="button" onClick={() => onNavigate('privacyPolicy')}>Read Privacy Policy</button>
        </article>

        <article className="roadmap-card policy-card">
          <p className="eyebrow">Terms &amp; Conditions</p>
          <h2>Educational use only</h2>
          <p>Covers user responsibilities, premium payment terms, and limitation of liability.</p>
          <button type="button" onClick={() => onNavigate('termsConditions')}>Read Terms</button>
        </article>

        <article className="roadmap-card how-card">
          <p className="eyebrow">How to Use</p>
          <h2>Learn in 4 simple steps</h2>
          <div className="step-grid">
            {HOW_TO_STEPS.map((step) => (
              <div className="step-card" key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.body}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="roadmap-card premium-roadmap-card">
          <p className="eyebrow">Premium Page</p>
          <h2>Upgrade with trust</h2>
          <p>10 free notes per month. Premium gives unlimited notes for 28 days with WhatsApp payment and safe activation support.</p>
          <button type="button" onClick={() => onNavigate('premium')}>View Premium</button>
        </article>

        <article className="roadmap-card blog-roadmap-card">
          <p className="eyebrow">Blog / SEO Pages</p>
          <h2>Student search pages</h2>
          <div className="blog-card-grid">
            {BLOG_CARDS.map((card) => (
              <button type="button" className="article-card" key={card.title} onClick={() => onNavigate(card.view)}>
                <strong>{card.title}</strong>
                <span>{card.body}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="roadmap-card feedback-roadmap-card">
          <p className="eyebrow">Feedback</p>
          <h2>We would love to hear from you</h2>
          <p>Found a bug or suggestion? Send it to us on WhatsApp.</p>
          <a className="roadmap-whatsapp" href={WHATSAPP_PREMIUM_LINK} rel="noreferrer" target="_blank">
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </article>

        <article className="roadmap-card share-roadmap-card">
          <p className="eyebrow">Share Button</p>
          <h2>Share Learnito AI</h2>
          <p>Help more students discover smarter study notes.</p>
          <div className="share-options">
            <a href={`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`} rel="noreferrer" target="_blank">WhatsApp</a>
            <button type="button" onClick={onShare}>Copy Link / Native Share</button>
          </div>
        </article>
      </div>
    </section>
  );
}