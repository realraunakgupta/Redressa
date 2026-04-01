# Deployment Guide - Redressa

> Step-by-step guide for deploying the current Groq + OCR.space build to Vercel.

## Prerequisites

Before deploying, make sure you have:

- A GitHub account
- This repo pushed to GitHub
- A Supabase project
- The Supabase schema applied from `supabase/schema.sql`
- A Vercel account
- A Groq API key
- An OCR.space API key

## 1. Push to GitHub

```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2. Import into Vercel

1. Go to `https://vercel.com/new`
2. Import the GitHub repository
3. Let Vercel detect Next.js automatically
4. Before deploying, add the required environment variables

## 3. Add Environment Variables

Add these values in Vercel Project Settings > Environment Variables:

| Name | Value | Required |
|------|-------|:--------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes |
| `GROQ_API_KEY` | Your Groq API key | Yes |
| `OCR_SPACE_API_KEY` | Your OCR.space API key | Yes |
| `AUTH_GOOGLE_ID` or `GOOGLE_CLIENT_ID` | Google OAuth Client ID for Gmail API | Required for Sending |
| `AUTH_GOOGLE_SECRET` or `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret for Gmail API | Required for Sending |
| `CRON_SECRET` | Secure key to authenticate Vercel Cron jobs | Required for Autopilot |
| `GEMINI_API_KEY` | Optional fallback reasoning API | Optional |

Where to find them:

- Supabase keys: Dashboard > Project Settings > API
- Groq key: [Groq Console](https://console.groq.com/keys)
- OCR.space key: [OCR.space](https://ocr.space/OCRAPI)
- Google Auth: [Google Cloud Console](https://console.cloud.google.com/) -> APIs & Services -> Credentials
- Cron Secret: Generate a secure random string (e.g., `openssl rand -hex 32`)

### 3.1. Vercel Cron Configuration

Redressa includes an Autopilot job that polls for approved, unsent messages and dispatches them in the background. Vercel handles this via `vercel.json` and the `/api/cron/auto-dispatch` route.

1. Ensure `CRON_SECRET` is set in Vercel. 
2. The endpoint will explicitly **fail closed (status 500 or 401)** in production if `CRON_SECRET` is missing.
3. The cron schedule is already defined in `vercel.json`.

### 3.2. Gmail OAuth Limitations (Test Mode)

If your Google Cloud app is currently in "Testing" mode (not verified):
- You **must** manually add any tester's email address to the "Test users" list in the Google Cloud OAuth Consent Screen.
- If a user not on this list attempts to log in or dispatch an email, the Gmail API will silently or explicitly fail with an "Insufficient Permission" or 403 scope error.

### 3.3. Development Cleanup
A destructive cleanup script is provided for wiping out raw test data (cases, threads, messages) before a hackathon demo or production handover, while explicitly preserving policies and seed data.
Run locally with: `npm run cleanup:dev -- --confirm`

## 4. Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Open the generated Vercel URL

## 5. Verify the Deployment

Check:

| URL | Expected Result |
|-----|-----------------|
| `/` | Landing page loads normally |
| `/new` | New-claim workspace loads |
| `/api/health` | Service health JSON returns successfully |
| `/case/[id]?debug=1` | Debug panel appears only when explicitly requested |

## Redeploying Later

Pushing new commits to the connected branch should trigger a redeploy automatically.

To force a redeploy after only changing environment variables:

1. Open the Vercel dashboard
2. Open your project
3. Go to **Deployments**
4. Choose the latest deployment
5. Click **Redeploy**

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails | Check the Vercel build logs for TypeScript or lint failures |
| `/api/health` shows Supabase not configured | Recheck the Supabase env vars |
| OCR on uploaded images fails | Recheck `OCR_SPACE_API_KEY` and file size limits |
| Reasoning/output generation fails | Recheck `GROQ_API_KEY` |
| Live UI is stale | Confirm the latest branch was deployed and redeploy if needed |

## Important Notes

- Uploaded image OCR is the verified path.
- PDF OCR is best-effort under OCR.space free-tier constraints.
- Hidden sample cases remain available from the new-claim page if live OCR is unstable during a demo.
