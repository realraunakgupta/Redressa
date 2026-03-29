# Deployment Guide - Redressa AI

> Beginner-friendly checklist for deploying to Vercel.

---

## Prerequisites

Before you start, make sure you have:

- [ ] A GitHub account
- [ ] This repo pushed to a GitHub repository
- [ ] A Supabase project (free tier at [supabase.com](https://supabase.com))
- [ ] Your Supabase schema created (run `supabase/schema.sql` in the SQL Editor)
- [ ] A Vercel account (free at [vercel.com](https://vercel.com))

---

## Step-by-Step Deployment

### 1. Push to GitHub

```powershell
git init
git add .
git commit -m "Initial commit - Redressa AI scaffold"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repo
4. Vercel auto-detects Next.js — no framework changes needed
5. **Before clicking Deploy**, add environment variables (next step)

### 3. Set Environment Variables

In the Vercel import screen, expand **Environment Variables** and add:

| Name | Value | Required |
|------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key | ✅ Yes |
| `GROQ_API_KEY` | Your Groq API key | ✅ Yes |
| `OCR_SPACE_API_KEY` | Your OCR.space API key | ✅ Yes |

> **Where to find Supabase keys:** Dashboard → Project Settings → API
>
> **Where to get Groq key:** [Groq Console](https://console.groq.com/keys)
>
> **Where to get OCR.space key:** [OCR.space](https://ocr.space/OCRAPI)

### 4. Deploy

1. Click **Deploy**
2. Wait for the build to complete (should take ~30 seconds)
3. Vercel gives you a URL like `https://your-app.vercel.app`

### 5. Verify

Visit these URLs on your deployed app:

| URL | What you should see |
|-----|-------------------|
| `/` | Homepage with "Redressa AI" title |
| `/status` | Service status page showing configured services |
| `/api/health` | JSON with `status: "ok"` or `"degraded"` |

---

## Redeploying After Changes

After pushing new commits to GitHub, Vercel auto-deploys. No manual steps needed.

To force a redeploy without code changes (e.g., after updating env vars):
1. Vercel Dashboard → your project → **Deployments**
2. Click the `...` menu on the latest deployment
3. Click **Redeploy**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails | Check the build log in Vercel — most likely a TypeScript error |
| `/api/health` shows `supabase: "error"` | Check that your Supabase URL and keys are correct in Vercel env vars |
| `/api/health` shows `supabase: "not_configured"` | You haven't added the Supabase env vars in Vercel yet |
| Page is blank / 500 error | Check Vercel function logs (Deployments → latest → Functions tab) |
