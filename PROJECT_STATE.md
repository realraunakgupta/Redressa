# PROJECT_STATE

## Project
- Name: Redressa AI
- Hackathon: Protex Hack-2-Win Hackathon 2026
- Track: Track 2 - Agentic AI / AI Workflows
- Status: Phase 1 live baseline preserved; Prompt 11 complete; Prompt 12 UI polish applied

## One-line problem statement
- Redressa AI helps Indian consumers convert failed refunds, damaged deliveries, and travel disruption complaints into grounded escalation-ready claim packs without manually decoding policies, regulations, and escalation paths.

## One-line solution statement
- Redressa AI is an agentic consumer redressal workflow that ingests messy evidence, extracts the facts, compares them against company policy and applicable rules, selects the best escalation route, and generates action-ready complaint outputs.

## Product boundaries
- This is not a generic chatbot
- This is not an AI lawyer
- This is a workflow-driven grievance-resolution product
- The UI should feel like a hybrid between a consumer tool and an analyst console

## Locked stack
- Frontend/App: Next.js App Router + TypeScript + Tailwind
- Backend logic: inside the Next.js app
- Database + Storage: Supabase
- AI provider: Groq API behind a small provider adapter
- Parsing:
  - real file upload to Supabase Storage for supported evidence flows
  - text extraction via direct decode where possible
  - image/screenshot OCR via OCR.space adapter
  - PDF support is best-effort and limited by OCR.space free-tier constraints
- Retrieval:
  - curated policy/regulation chunk store first
  - optional vector retrieval later
- Deployment: Vercel

## Why this stack is locked
- Web-first is faster and safer than Flutter for this product
- Next.js is a mature ecosystem that AI tools handle well
- Supabase fits the relational data model better than Firestore
- In-app orchestration is easier to debug than n8n for a beginner team
- Vercel is the simplest default deployment path for Next.js

## Phase roadmap

### Phase 1 - Winning-core MVP
Must include:
- complaint intake with evidence upload
- core fact extraction
- company policy and regulation retrieval
- grounded claim evaluation
- escalation route recommendation
- visible Agent Activity
- generated outputs:
  - case summary
  - grievance email draft
  - escalation note
  - evidence checklist
  - evidence-pack preview

Supported verticals:
- IndiGo flight cancellation/refund
- Flipkart damaged/defective goods

Rule:
- If only Phase 1 is completed, the project must still be demoable and worth submitting

### Phase 2 - Intelligence and trust upgrade
Add only after Phase 1 works end-to-end:
- better citation UX
- denial-reason extraction from support chats/emails
- smarter complaint classification
- image/screenshot understanding
- better escalation target selection
- better evidence-pack quality
- stronger policy ingestion and metadata

### Phase 3 - Advanced workflow expansion
Add only if the core system is stable:
- approval-gated email sending
- PDF export
- broader complaint categories
- vector retrieval if needed
- controlled policy refresh / background syncing
- optional browser automation for one narrow stable flow
- optional n8n or external orchestration later
- optional enterprise OCR such as Textract later

## Locked priorities
Build in this order:
1. source-of-truth files
2. backend schema and storage
3. deployment
4. core pipeline
5. retrieval
6. evaluation
7. output generation
8. connected UI
9. demo mode
10. polish
11. advanced features only if time remains

## Out of scope for the first build
- auth
- browser automation
- live scraping dependency
- outbound email sending
- broad legal-advice positioning
- too many complaint categories
- mobile app rewrite
- Flutter rebuild
- Firebase/Firestore backend rewrite

## Required external services
- Supabase project
- Groq API key
- Vercel project

## Required core data
- policy/regulation source texts for:
  - IndiGo
  - DGCA passenger rights
  - Flipkart return/damaged goods policy
- clean demo evidence files for:
  - one aviation case
  - one e-commerce case

## Build rules
- Do not let the AI change the stack mid-build
- Do not add features outside the current phase
- Backend before frontend
- Real data before fancy UI
- Deployment early, not at the end
- Test the full flow after every major feature
- Keep one stable demo path alive at all times
- Add animations only after the core flow is stable

## Success criteria
The project is in a good hackathon state when:
- seeded demo path works reliably
- one live path works
- the Agent Activity makes the workflow visibly agentic
- outputs are grounded by citations
- the UI looks polished enough for judging
- the project can be explained simply in under 30 seconds

## Companion file
- See `Redressa_AI.txt` for the full product brief, merged feature lineage, and roadmap for previously removed features

---

## Current Build Status

| Item | Status |
|------|--------|
| **Current Phase** | Final Build Frozen (Prompt 12 + Final Cleanup applied) |
| Source-of-truth files | Done |
| Validation notes | Done |
| Scaffold | Done |
| Backend schema & services | Done |
| Early deployment | Done |
| Policy corpus & retrieval | Done |
| Core agent pipeline | Done |
| Connected UI | Done |
| End-to-end wiring & demo mode | Done |
| Phase 1 stabilization | Done |
| Phase 2 upgrades | Implemented and verified for current uploaded-image OCR flow |
| Final polish (Prompt 12) | Applied |

**Prompt 12 Status (UI Polish Applied):**
- **Design system:** Updated to charcoal base (zinc-900), electric cobalt blue accent, and standard system fonts.
- **App structure:** Added a left rail (sidebar) to the in-app workspace screens to function as an analyst console.
- **Homepage:** Shifted from marketing-style to a direct, app-first workspace layout.
- **New Claim page:** Moved demo triggers into a subtle "use a sample case" collapsible section.
- **Case page:** Gated the Evidence Debug panel behind a '?debug=1' query parameter and added legal disclaimers.
- **Pipeline integrity:** All data routing, extraction logic (Groq / OCR.space), and backend endpoints remain untouched.

**Open Blockers:**
- The dual-model setup is preserved: Groq for reasoning, OCR.space strictly for image extraction.
- PDF support remains best-effort, constrained by the OCR.space free tier.
- The seeded demo path is preserved as a judge-facing fallback and can be accessed via the subtle affordance on the New Claim page.
