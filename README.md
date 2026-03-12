# 🍱 Bento — Content ideas, neatly packed.

A content ideation tool for content marketers. Enter a topic and platform, get 3 research-backed content ideas with briefs — tailored to your brand and audience.

---

## How to deploy Bento (step by step)

This guide assumes you've never done this before. Follow each step in order.

### Step 1: Create your accounts (5 minutes)

You'll need three free accounts:

1. **GitHub** — where your code lives
   - Go to https://github.com and sign up
   - Pick a username and verify your email

2. **Vercel** — where your app is hosted (free)
   - Go to https://vercel.com and click "Sign Up"
   - Sign up with your GitHub account (easiest option)

3. **Anthropic API** — the AI that powers Bento
   - Go to https://console.anthropic.com and sign up
   - Add a payment method (you'll only be charged for what you use — expect a few dollars)
   - Go to "API Keys" and click "Create Key"
   - **Copy the key and save it somewhere safe** — you'll need it in Step 4
   - Go to "Settings" > "Limits" and set a monthly spending limit (e.g., $10) so you're never surprised

### Step 2: Upload the code to GitHub (5 minutes)

1. Log into GitHub
2. Click the **+** icon in the top right → **New repository**
3. Name it `bento-app`
4. Keep it **Public** (or Private — both work)
5. Do NOT check "Add a README" (we already have one)
6. Click **Create repository**

Now you need to upload the project files. The easiest way:

**Option A: Upload via browser (no coding tools needed)**
1. On your new repo page, click **"uploading an existing file"** link
2. Drag the entire contents of this project folder into the upload area:
   - `package.json`
   - `next.config.js`
   - `.gitignore`
   - `.env.example`
   - `README.md`
   - `app/` folder (with all files inside)
3. Click **"Commit changes"**

**Option B: Using command line (if you have Git installed)**
```bash
cd bento-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bento-app.git
git push -u origin main
```

### Step 3: Deploy on Vercel (3 minutes)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Find `bento-app` in your GitHub repos and click **"Import"**
4. Under **Framework Preset**, make sure it says **Next.js**
5. **IMPORTANT:** Before clicking Deploy, expand **"Environment Variables"**
   - Add a new variable:
     - **Key:** `ANTHROPIC_API_KEY`
     - **Value:** paste your API key from Step 1
   - Click **"Add"**
6. Click **"Deploy"**

Wait 1-2 minutes. Vercel will build and deploy your app.

### Step 4: You're live! 🎉

Vercel will give you a URL like: `https://bento-app.vercel.app`

That's your live app. You can:
- Share this URL on LinkedIn
- Add it to your portfolio
- Use it in interviews to demo

### Optional: Custom domain

If you want a nicer URL like `bentotool.com`:
1. Buy a domain from Namecheap or Google Domains (~$10/year)
2. In Vercel dashboard → your project → Settings → Domains
3. Add your domain and follow the DNS instructions

---

## Project structure

```
bento-app/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.js    ← Server-side API (keeps your API key safe)
│   ├── globals.css          ← Base styles
│   ├── layout.js            ← Page layout & metadata
│   └── page.js              ← The main Bento app
├── .env.example              ← Template for environment variables
├── .gitignore                ← Files Git should ignore
├── next.config.js            ← Next.js configuration
├── package.json              ← Project dependencies
└── README.md                 ← This file
```

---

## Making changes

To update the app after it's deployed:

1. Edit files on GitHub (click any file → pencil icon → edit → commit)
2. Vercel automatically re-deploys when you push changes
3. Your live URL updates within 1-2 minutes

For bigger changes, you can clone the repo locally:
```bash
git clone https://github.com/YOUR_USERNAME/bento-app.git
cd bento-app
npm install
```

Create a `.env.local` file with your API key:
```
ANTHROPIC_API_KEY=your-key-here
```

Run locally:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Spending & safety

- Set a monthly limit at https://console.anthropic.com → Settings → Limits
- Each "Pack my bento" click costs ~$0.01–0.05 depending on response length
- For demo/portfolio use, expect to spend $2-5 total
- If you share the URL publicly, consider adding rate limiting later

---

## What's next (Phase 2 & 3)

This is Phase 1. Future additions could include:
- Visual/creative inspiration sourcing
- Competitor brand research
- Save ideas to folders
- Export as downloadable content proposal
- Rate limiting for public use

---

Built with Next.js + Claude API
