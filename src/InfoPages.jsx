import React from 'react';

const SUPPORT_EMAIL = 'learnitoai@gmail.com';
const SUPPORT_MAIL_LINK = 'mailto:learnitoai@gmail.com?subject=Learnito%20AI%20Support';
const WHATSAPP_PREMIUM_LINK = 'https://wa.me/message/6FSCTMUBFVESK1?src=qr';
const ASSET_BASE = import.meta.env.BASE_URL;

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
      { title: 'Contact', body: 'For feedback and contact support, email learnitoai@gmail.com.' }
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
  },
  aiStudyNotes: {
    eyebrow: 'SEO guide',
    title: 'AI Study Notes Generator',
    intro: 'Learnito AI helps students convert long study material into clear notes for faster revision.',
    sections: [
      { title: 'Generate notes from any subject', body: 'Paste textbook content, lecture notes, class notes, or revision material and get structured study notes in seconds.' },
      { title: 'Exact key summaries', body: 'Learnito focuses on exact bullet points from the source material, so the summary stays useful and easy to revise.' },
      { title: 'Important concepts', body: 'The app highlights key terms and concepts that students should remember before exams.' },
      { title: 'Offline saved notes', body: 'Saved notes stay available on the same device, helping students continue revision even without internet.' }
    ]
  },
  practiceQuiz: {
    eyebrow: 'SEO guide',
    title: 'Practice Quiz Generator',
    intro: 'Learnito creates practice quiz questions from study material with short, easy answers for quick learning.',
    sections: [
      { title: 'Questions from your notes', body: 'The quiz is based on the content students paste, so practice stays connected to the exact chapter or topic.' },
      { title: 'Short answers', body: 'Answers are written in simple points so students can understand quickly and revise faster.' },
      { title: 'Useful for exam revision', body: 'Practice questions help students check what they remember and find weak areas before tests.' },
      { title: 'Up to 50 questions', body: 'For longer study material, Learnito can create more practice questions to support deeper preparation.' }
    ]
  },
  notesSummarizer: {
    eyebrow: 'SEO guide',
    title: 'Notes Summarizer for Students',
    intro: 'Learnito summarizes study material into clean bullet points so students can revise without reading everything again.',
    sections: [
      { title: 'Student-friendly summaries', body: 'The key summary is short, direct, and based on the pasted material.' },
      { title: 'Less reading, better revision', body: 'Students can use the summary to review important ideas faster before class, homework, or exams.' },
      { title: 'Works with lecture notes', body: 'Paste classroom notes, textbook paragraphs, or revision content and turn them into a study-ready format.' },
      { title: 'Save for offline study', body: 'Generated notes can be saved locally, making Learnito useful for daily revision.' }
    ]
  },
  privacyPolicy: {
    eyebrow: 'Privacy Policy',
    title: 'Privacy Policy',
    intro: 'Learnito AI explains privacy in simple student-friendly language so users know how their study data is handled.',
    sections: [
      { title: 'Data collection', body: 'Learnito stores saved notes locally on your device. Your offline notes are kept in your browser storage, not in a public account.' },
      { title: 'Cookies and local storage', body: 'The app uses browser storage for saved notes, device ID, monthly usage count, premium status, and app settings.' },
      { title: 'Analytics', body: 'Learnito may use Google Analytics to understand visits and improve the website. Analytics is loaded after the page is usable for better performance.' },
      { title: 'Privacy protection', body: 'Do not paste private or sensitive information. Learnito is designed for educational study material, notes, summaries, and quizzes.' }
    ]
  },
  termsConditions: {
    eyebrow: 'Terms & Conditions',
    title: 'Terms & Conditions',
    intro: 'These terms keep Learnito AI safe, useful, and focused on education.',
    sections: [
      { title: 'Educational use only', body: 'Learnito AI is a study helper for notes, summaries, and practice questions. It should be used for learning and revision.' },
      { title: 'User responsibilities', body: 'Users are responsible for the content they paste and should review generated answers before using them for exams or homework.' },
      { title: 'Premium payment terms', body: 'Free users get 10 note generations per month. Premium gives unlimited note generation for 28 days after activation on one device.' },
      { title: 'Limitation of liability', body: 'Learnito AI is provided as a learning aid. We are not responsible for mistakes, exam results, or decisions made from generated content.' }
    ]
  },
  premium: {
    eyebrow: 'Premium',
    title: 'Learnito AI Premium',
    intro: 'Premium is simple: 10 free notes per month, then unlimited note generation for 28 days after activation.',
    sections: [
      { title: 'Free plan', body: 'Every device can generate 10 free notes each month.' },
      { title: 'Premium access', body: 'Premium unlocks unlimited note generation for 28 days on the activated device ID.' },
      { title: 'WhatsApp payment', body: 'Premium support and payment guidance happen through WhatsApp for a simple and safe activation process.' },
      { title: 'Safe and secure', body: 'Send your device ID only through the official Access Premium WhatsApp button shown in the app.' }
    ]
  },
  blog: {
    eyebrow: 'Blog / SEO',
    title: 'Learnito AI Blog',
    intro: 'Study tips and SEO pages for students who want faster revision with AI.',
    sections: [
      { title: 'AI Study Notes Generator', body: 'Learn how AI can turn long study material into clear revision notes.' },
      { title: 'Practice Quiz Generator', body: 'Use practice quizzes to test memory and prepare before exams.' },
      { title: 'Notes Summarizer for Students', body: 'Summarize class notes and textbook content into student-friendly bullet points.' }
    ]
  }
};

function InfoPageByView({ onBack, onNavigate, view }) {
  return <InfoPage page={INFO_PAGES[view]} onBack={onBack} onNavigate={onNavigate} />;
}

export default function InfoPages({ onBack, onNavigate, view }) {
  if (view === 'contact') {
    return <ContactReceivedPage onBack={onBack} />;
  }

  return <InfoPageByView view={view} onBack={onBack} onNavigate={onNavigate} />;
}

function InfoPage({ onBack, onNavigate, page }) {
  return (
    <main className="info-page">
      <section className="info-shell">
        <header className="info-header">
          <div className="brand-heading">
            <img
              src={`${ASSET_BASE}learnito-logo-small.png`}
              alt="Learnito AI logo"
              width="82"
              height="82"
              decoding="async"
            />
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
          <a className="secondary-info-button" href={SUPPORT_MAIL_LINK}>Contact support</a>
        </div>
      </section>
    </main>
  );
}

export function ContactReceivedPage({ onBack }) {
  return (
    <main className="contact-page">
      <section className="contact-card">
        <img
              src={`${ASSET_BASE}learnito-logo-small.png`}
              alt="Learnito AI logo"
              width="82"
              height="82"
              decoding="async"
            />
        <p className="eyebrow">Contact received</p>
        <h1>Thank you for contacting Learnito</h1>
        <p>
          For feedback or contact support, send an email to learnitoai@gmail.com.
        </p>
        <a className="premium-access-button" href={SUPPORT_MAIL_LINK}>
          Email Learnito support
        </a>
        <button className="secondary-link" type="button" onClick={onBack}>Back to app</button>
      </section>
    </main>
  );
}