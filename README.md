# Redressa AI

> Agentic consumer redressal workflow that turns messy complaint evidence into grounded, escalation-ready claim packages.

**Hackathon**: Protex Hack-2-Win 2026  
**Track**: Track 2 - Agentic AI / AI Workflows

## Stack

| Layer | Tech |
|-------|------|
| Frontend / App | Next.js 16 App Router + TypeScript + Tailwind v4 |
| Backend | Server-side logic inside Next.js route handlers and server components |
| Database + Storage | Supabase (PostgreSQL + Storage) |
| AI Reasoning | Groq API via provider adapter (`llama-3.3-70b-versatile`) |
| OCR / Document Extraction | OCR.space |
| Deployment | Vercel |

## Current Baseline

- The live pipeline uses Groq as the primary reasoning provider.
- OCR.space is used only for uploaded image OCR and best-effort PDF extraction.
- The hidden sample-case path remains available as the safest fallback demo path.
- The app is a guidance workflow, not legal advice.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project
- A Groq API key
- An OCR.space API key

### Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Environment Setup

Create `.env.local` from the example:

```powershell
Copy-Item .env.example .env.local
```

Then fill in:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API > anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Project Settings > API > service_role key |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) |
| `OCR_SPACE_API_KEY` | [OCR.space](https://ocr.space/OCRAPI) |

### Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run `supabase/schema.sql`.
4. Confirm the `evidence` storage bucket exists.
5. Confirm storage policies are present for the browser upload flow.
6. Visit `/api/health` locally and confirm Supabase is configured.

## Project Structure

```text
app/                    # Next.js pages, layouts, route handlers
  api/health/           # Health check endpoint
  api/pipeline/run/     # Pipeline execution endpoint
  case/[id]/            # Case workspace
  new/                  # Intake workspace
lib/
  document/             # OCR.space adapter
  groq/                 # Groq reasoning adapter
  pipeline/             # Pipeline steps and orchestration
  supabase/             # Supabase clients and helpers
  types/                # Shared types
scripts/                # Utilities, including backend cleanup helpers
supabase/               # Database schema and policies
data/
  policies/raw/         # Policy and regulation corpus
  demo-evidence/        # Seeded text evidence for sample cases
public/demo-assets/     # Demo assets used by hidden sample-case flow
```

## Deployment

Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)

Quick version:

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add these environment variables before deploying:

| Variable | Required |
|----------|:--------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `GROQ_API_KEY` | Yes |
| `OCR_SPACE_API_KEY` | Yes |

4. Deploy.
5. Verify with `/api/health`.

## Demo Notes

- The default experience is consumer-facing and does not prominently expose demo shortcuts.
- Hidden sample cases are still available from the subtle "or use a sample case" section on the new-claim page.
- The debug panel is hidden behind `?debug=1` on case pages.

## Limitations

- OCR.space free-tier constraints still apply.
- Uploaded image OCR is verified working.
- PDF extraction is best-effort and may be constrained by file size and free-tier limits.
- The product provides informational guidance, not legal advice.

## Documentation

- [PROJECT_STATE.md](PROJECT_STATE.md) - current build state and scope truth
- [DEPLOYMENT.md](DEPLOYMENT.md) - deployment guide
- [DEMO_CHECKLIST.md](DEMO_CHECKLIST.md) - live and fallback demo flow
- [VALIDATION.md](VALIDATION.md) - problem validation and track fit
