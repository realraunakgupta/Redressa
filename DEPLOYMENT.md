# Deployment Guide - Redressa AI

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

Where to find them:

- Supabase keys: Dashboard > Project Settings > API
- Groq key: [Groq Console](https://console.groq.com/keys)
- OCR.space key: [OCR.space](https://ocr.space/OCRAPI)

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
