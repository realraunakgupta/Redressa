# Redressa AI

> Agentic consumer redressal workflow that turns messy complaint evidence into grounded, escalation-ready claim packages.

**Hackathon**: Protex Hack-2-Win 2026  
**Track**: Track 2 - Agentic AI / AI Workflows

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend / App | Next.js 16 App Router + TypeScript + Tailwind v4 |
| Backend | Server-side logic inside Next.js (route handlers + server components) |
| Database + Storage | Supabase (PostgreSQL + Storage) |
| AI | Groq API via provider adapter |
| Deployment | Vercel |

## Current Baseline

- The live pipeline is working with Groq as the active provider.
- The seeded demo path remains the safest fallback for judges.
- The current codebase now includes real file upload to Supabase Storage and a vision-capable parsing path for image/screenshot files.
- PDF parsing is still intentionally limited.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier is fine)
- A Groq API key

### Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Setup

Create your environment file:

```powershell
Copy-Item .env.example .env.local
```

Then fill in your credentials in `.env.local`:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API > anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Project Settings > API > service_role key |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) |

### Supabase Database Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in the Supabase dashboard
3. Paste the contents of `supabase/schema.sql`
4. Click **Run** to create all tables
5. Go to **Storage** and ensure a bucket named `evidence` exists (private is fine)
6. If you are applying `supabase/schema.sql` from scratch, it now provisions the bucket and basic anon storage policies needed for browser uploads
7. Verify: visit `/api/health` and confirm the Supabase check shows `"ok"`

### Project Structure

```text
app/                    # Next.js App Router pages and API routes
  api/health/           # Health check endpoint
  case/[id]/            # Dynamic case page
components/             # Reusable UI components
lib/                    # Core logic
  groq/                 # Groq AI provider adapter
  pipeline/             # Agent pipeline orchestrator
  supabase/             # Supabase client setup
  types/                # TypeScript type definitions
scripts/                # Utility and ingestion scripts
supabase/               # Database schema SQL
data/                   # Policy corpus and demo evidence
  policies/raw/         # Raw policy/regulation source texts
  demo-evidence/        # Demo evidence files for seeded cases
public/demo-assets/     # Static demo assets
```

### Deployment (Vercel)

> Full step-by-step guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)

Quick version:

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repo
3. Add environment variables before deploying:

| Variable | Required Now? |
|----------|:------------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `GROQ_API_KEY` | Yes |

4. Click **Deploy**
5. Verify at `/status` and `/api/health`

## Documentation

- `Redressa_AI.txt` - Full product brief
- `PROJECT_STATE.md` - Locked stack, scope, and build status
- `BUILD_PLAN.md` - Build phases and implementation order
- `VALIDATION.md` - Problem validation and Track 2 fit
