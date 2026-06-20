# Learnito AI Study Notes Generator

Students paste lecture notes, textbook content, or study material, then the app generates a focused study guide with:

- Exact key summary bullet points, up to 30 words each
- Important concepts highlighted
- Up to 50 valuable quiz questions with short, point-style answers for faster review
- Offline access to saved notes
- Transora-style premium access with device ID, monthly free limit, and premium code activation
- Transora-style admin dashboard for premium codes and device activation

## Tech Stack

| Component | Technology | Why |
| --- | --- | --- |
| Frontend | React + Vite | Fast, modern PWA setup |
| AI | LangChain.js + Free LLM | Text summarization and study guide generation |
| Database | IndexedDB local storage | Offline-first saved notes |
| PWA | Workbox + manifest.json | Installable app with offline support |
| Premium Access | Local device ID + premium code state | Mirrors the premium access flow from the Transora transcript app |
| Admin | Local `/admin` dashboard | Mirrors Transora admin login, codes, devices, and usage overview |

## Performance Metrics:

- Summary generation: ~2 seconds
- Offline note loading: <100ms
- Supports 100+ notes locally
- Works on 4G + offline

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build registers a Workbox-powered service worker, includes an installable web app manifest, and keeps saved notes in IndexedDB for offline studying.

## Premium Demo

- Free users get 10 generated notes per month, and the free trial count resets automatically each new month.
- Premium users can generate unlimited notes for 28 days, then premium becomes inactive automatically.
- Demo codes: `TR-LEARNITO`, `LEARNITO-PRO`, `LEARNITO-2026`, or `STUDY-PRO`.
- Admin password: `Mukilan@2009`.
