# ResumeIQ

> AI-powered resume analysis, ATS checking, JD matching, and resume building — all in the browser. No sign-up. No credit card. Free.

**Live:** [sumeiq-wheat.vercel.app](https://sumeiq-wheat.vercel.app)

---

## Features

| Feature | Description |
|---|---|
| 🔍 **ATS Checker** | Scores your resume for machine-readability and ATS parsing |
| 📊 **Resume Analyzer** | Deep analysis of content, impact, and storytelling quality |
| 🎯 **JD Match** | Compares your resume against a specific job description |
| 🛠 **Resume Builder** | Build a professional PDF resume from scratch with live preview |
| 🔒 **Privacy First** | Resume text is processed server-side per request — never stored |

---

## Tech Stack

- **Frontend** — React 18, Vite 5, Tailwind CSS 3, React Router v6
- **Backend** — Vercel Serverless Functions (`/api/analyze.js`)
- **AI** — [Groq API](https://groq.com) (`openai/gpt-oss-120b`)
- **PDF Parsing** — `pdfjs-dist` (runs entirely in the browser)

---

## Project Structure

```
├── api/
│   └── analyze.js          # Vercel serverless function (Groq integration)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   └── Header.jsx
│   │   └── ui/
│   │       ├── AtsResults.jsx
│   │       ├── AnalyzerResults.jsx
│   │       ├── JdMatchResults.jsx
│   │       ├── DateRangePicker.jsx
│   │       ├── LoadingState.jsx
│   │       ├── ScoreRing.jsx
│   │       ├── ToolPage.jsx
│   │       ├── UploadArea.jsx
│   │       └── ...
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Builder.jsx
│   │   ├── AtsChecker.jsx
│   │   ├── ResumeAnalyzer.jsx
│   │   └── JdMatch.jsx
│   ├── utils/
│   │   ├── api.js           # Frontend fetch wrapper
│   │   ├── validation.js    # Input & spam detection
│   │   ├── pdfText.js       # PDF text extraction
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── context/
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   └── useAnalysis.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example             # Template — copy to .env for local dev
├── vercel.json              # Vercel routing config
└── index.html
```

---

## Local Development

```bash
# 1. Clone and install
git clone <your-repo-url>
cd ResumeIQ
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your Groq API key:
# GROQ_API_KEY=gsk_...

# 3. Start local server (proxies /api/* to the serverless function)
node server.local.js

# 4. In a separate terminal, start Vite
npm run dev

# Open http://localhost:5173
```

> **Note:** `server.local.js` is a local-only Express proxy that simulates the Vercel serverless API. It is listed in `.gitignore` and is not deployed.

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. In **Settings → Environment Variables**, add:
   ```
   GROQ_API_KEY = gsk_your_actual_key_here
   ```
4. Every `git push` to `main` triggers an automatic redeploy.

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `GROQ_API_KEY` | Vercel Dashboard | Server-side API key for Groq. Never exposed to the browser. |

---

## Created by

**Mahesh P** · maheshp2487@gmail.com
