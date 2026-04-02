# Redressa

> Agentic workflow that turns messy consumer complaint evidence into grounded, escalation-ready claim packages.

**Hackathon**: Protex Hack-2-Win 2026  
**Track**: Track 2 – Agentic AI / AI Workflows

## Stack

| Layer | Tech |
|-------|------|
| Frontend / App | Next.js 16 App Router + TypeScript + Tailwind v4 |
| Backend | Server-side logic inside Next.js route handlers and server components |
| Database + Storage | Supabase (PostgreSQL + Storage) |
| AI Reasoning | Groq API (`llama-3.3-70b-versatile`) |
| OCR / Document Extraction | OCR.space |
| Deployment | Vercel |

## What It Does

1. **Intake** – The consumer describes their complaint and uploads supporting evidence (emails, screenshots, receipts).
2. **Evidence Extraction** – OCR and document parsing extract structured facts from uploaded files.
3. **Policy Retrieval** – The pipeline retrieves relevant company policies and consumer regulations (DGCA rules, E-Commerce Rules 2020) grounded to the complaint.
4. **AI Analysis** – Groq-powered reasoning evaluates the claim against retrieved policies, identifies violations, and scores claim strength.
5. **Output Generation** – The system produces a case summary, drafted grievance emails, escalation notes, and an evidence checklist.
6. **Communication & Escalation** – Built-in email drafting and escalation workflows with manual, assisted, and autopilot modes.

## Current Baseline

- The live pipeline uses Groq as the primary reasoning provider.
- OCR.space is used for uploaded image OCR and best-effort PDF extraction.
- **Support Breadth:** The platform applies a *Hybrid Grounding Model*.
  - **Merchant-grounded support:** IndiGo and Flipkart have full policy coverage in the stable baseline.
  - **Generic fallback:** For unsupported merchants, the pipeline relies on ingested regulations and generic escalation guidance.
- The app provides informational guidance, not legal advice.

### Retrieval Evolution Note

Currently, the pipeline isolates policy grounding through deterministic keyword matching and merchant-name normalization.
**Future Roadmap:** In future versions, policy retrieval should migrate from keyword filtering to deep semantic embeddings stored in PostgreSQL using `pgvector`. A vector-based retriever would intelligently match conceptually identical grievances without requiring hardcoded keyword maps, dramatically improving retrieval accuracy on generalized merchant policies.

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
  api/case/delete/      # Secure claim deletion endpoint
  case/[id]/            # Case workspace (resizable panels)
  new/                  # Intake workspace
  profile/              # User profile management
lib/
  document/             # OCR.space adapter
  groq/                 # Groq reasoning adapter
  pipeline/             # Pipeline steps and orchestration
  supabase/             # Supabase clients and helpers
  types/                # Shared types
supabase/               # Database schema and migrations
data/
  policies/raw/         # Policy and regulation corpus
```

## Key Features

- **Resizable Workspace** – Desktop case view uses `react-resizable-panels` for adjustable panel sizing; mobile auto-stacks.
- **Communication Modes** – Manual, assisted, and autopilot escalation workflows.
- **User Profile** – Editable name, email, and phone used as default variables in drafted complaint letters.
- **Secure Claim Deletion** – User-scoped deletion with ownership verification, confirmation step, cascading DB cleanup, and evidence storage pruning.
- **Responsive Design** – Premium dark editorial theme with mobile-optimized spacing and layout.

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

## Limitations

- OCR.space free-tier constraints still apply.
- Uploaded image OCR is verified working.
- PDF extraction is best-effort and may be constrained by file size and free-tier limits.
- The product provides informational guidance, not legal advice.

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) – Deployment guide
- [VALIDATION.md](VALIDATION.md) – Problem validation and track fit
