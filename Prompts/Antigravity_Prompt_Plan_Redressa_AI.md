# Antigravity Prompt Plan - Redressa AI

Use the same AntiGravity chat and paste these prompts one by one in order.

This plan is adapted to:
- the AI-Assisted Full-Stack Development Guide phase order
- the final `Redressa AI` product brief
- the locked stack
- a fresh-folder rebuild

Before starting:
- copy `Redressa_AI.txt` into the new folder
- copy `PROJECT_STATE.md` into the new folder
- start a fresh AntiGravity chat in that new folder

Important rule:
- after every major milestone, update `PROJECT_STATE.md`

---

## Prompt 1 - Inspect, lock context, create build plan

```text
You are working inside a new project folder for a hackathon build.

This folder contains source-of-truth files for the project:
- `Redressa_AI.txt`
- `PROJECT_STATE.md`

Read both files first and treat them as the source of truth.

Rules:
- do not change the product idea
- do not change the stack unless I explicitly approve it
- do not broaden scope
- preserve these files and use them as the basis for all work

Your task:
1. Inspect the folder and confirm what files exist
2. Read `Redressa_AI.txt`
3. Read `PROJECT_STATE.md`
4. Summarize:
   - the product
   - the locked stack
   - the current MVP scope
   - what is explicitly out of scope
   - the phase roadmap
5. Then create a practical build plan for this repo in a new file called `BUILD_PLAN.md`

`BUILD_PLAN.md` should include:
- build phases in order
- the exact order of implementation
- the minimum manual setup steps
- the most important risks
- what must be true before moving from one phase to the next

Also:
- add a short section to `PROJECT_STATE.md` called `Current Build Status`
- initialize it with:
  - current phase
  - not started / in progress / done markers
  - open blockers
  - next step

Do not scaffold the app yet.
This prompt is only for grounding, planning, and initializing control documents.

At the end:
- summarize what you created
- list any questions or missing values only if strictly required
```

---

## Prompt 2 - Validation notes and problem proof

```text
Use the current folder and continue from the existing context.

Read:
- `Redressa_AI.txt`
- `PROJECT_STATE.md`
- `BUILD_PLAN.md`

Your task:
Create a lightweight validation file called `VALIDATION.md` for the hackathon.

It should contain:
- 3-bullet evidence list that this problem is real
- why this fits Track 2 (For hackathon tracks, look at Tracks_Portex_2026.pdf)
- why the first two complaint categories were chosen
- why the phased approach is the right build strategy for a beginner team

Use the project’s existing idea and deep-research direction.
Do not overcomplicate this.
This is not a long research paper.
It should be short, clear, and usable later for PPT/pitching.

Also update `PROJECT_STATE.md`:
- set the current phase to validation complete
- set the next step to scaffolding and backend setup

Do not build app code yet.
```

---

## Prompt 3 - Scaffold the app from scratch

```text
Continue in the same chat and use the current repo context.

Read:
- `Redressa_AI.txt`
- `PROJECT_STATE.md`
- `BUILD_PLAN.md`

Now scaffold the project from scratch in this folder.

Locked stack:
- Next.js App Router
- TypeScript
- Tailwind
- Supabase
- Gemini API
- Vercel deployment target

Rules:
- preserve existing markdown and text files
- do not add auth
- do not add chatbot UI
- do not add n8n
- do not add browser automation
- do not add live scraping
- do not add extra complaint categories

Create:
- a clean Next.js project structure
- `app`, `components`, `lib`, `scripts`, `supabase`, `data`, `public/demo-assets`
- `.env.example`
- basic `README.md`
- placeholder homepage
- placeholder case page route
- setup or health route if useful

Do not implement business logic yet.
Just create a clean, modular foundation.

At the end:
- summarize the scaffold
- list files created
- update `PROJECT_STATE.md` with current status
```

---

## Prompt 4 - Backend first: Supabase schema and service setup

```text
Continue from the current repo state.

Before changing anything:
- inspect the project scaffold
- preserve the existing structure

Now implement backend setup first.

Your task:
- design and add the minimal Supabase schema needed for the Phase 1 MVP
- create schema SQL files under `supabase/`
- create the minimal data model for:
  - cases
  - case_files
  - case_events
  - policy_documents
  - policy_chunks
  - generated_outputs
- add typed schemas/helpers in the app code
- add a Supabase client setup with:
  - public/browser-safe client
  - server/admin client using service role key
- add clear env var validation
- add setup instructions in `README.md`

Do not build the frontend yet.
Do not add auth.

Important:
- keep the schema minimal
- only include what the Phase 1 MVP actually needs
- ask me explicitly for any missing env var names or service credentials only if absolutely necessary

At the end:
- summarize the schema and service setup
- list files added or changed
- update `PROJECT_STATE.md`
- clearly tell me the minimum manual steps I must do next in Supabase
```

---

## Prompt 5 - Deployment early, not late

```text
Continue from the current repo state.

Your task:
Prepare this project for early deployment on Vercel.

Do the following:
- add any Vercel-friendly config if needed
- make sure the project can be deployed as early as possible
- add a setup or status page that can safely render even before full backend completion
- make sure environment variables are clearly documented
- update `README.md` with:
  - local run steps
  - Vercel deployment steps
  - required env vars
- add a short `DEPLOYMENT.md` with a beginner-friendly checklist

Do not build new product features here.
This is just to make deployment easy early in the process.

At the end:
- summarize what is ready for deployment
- update `PROJECT_STATE.md`
- clearly tell me what I need to do manually in Vercel
```

---

## Prompt 6 - Policy corpus and ingestion setup

```text
Continue from the current repo state.

Your task:
Set up the policy and regulation knowledge base for the Phase 1 MVP.

Create:
- `data/policies/raw/`
- placeholders or starter files for:
  - DGCA passenger rights
  - IndiGo cancellation/refund policy
  - Flipkart damaged/defective goods return policy
- an ingestion script under `scripts/`
- chunking logic
- deterministic retrieval helpers
- citation structure with source title, section label, and excerpt

Rules:
- no live scraping dependency
- no vector search dependency yet
- no browser automation
- keep retrieval simple and stable
- optimize for curated data, not internet-scale search

At the end:
- summarize the ingestion/retrieval setup
- list files added or changed
- update `PROJECT_STATE.md`
- clearly tell me what raw policy texts I need to paste or confirm manually
```

---

## Prompt 7 - Core pipeline: extraction, evaluation, routing, outputs

```text
Continue from the current repo state.

Your task:
Build the Phase 1 agent workflow inside the app code.

Implement the typed in-app pipeline with these steps:
1. complaint intake
2. evidence parsing
3. fact extraction
4. timeline assembly
5. complaint classification
6. policy retrieval
7. regulation retrieval
8. grounded evaluation
9. escalation route recommendation
10. output generation

Outputs must include:
- case summary
- grievance email draft
- escalation note
- evidence checklist
- evidence-pack preview data

Rules:
- do not add n8n
- do not add outbound email sending
- do not add browser automation
- do not add live scraping
- keep provider-specific logic behind adapters
- write visible case events for each major step

If some parts need to stay stubbed temporarily, do it honestly and keep the interfaces real.

At the end:
- summarize the pipeline
- list files changed
- update `PROJECT_STATE.md`
- tell me what is real vs temporarily stubbed
```

---

## Prompt 8 - Connected UI, not mock UI

```text
Continue from the current repo state.

Your task:
Build the actual Phase 1 UI connected to real backend data.

This is not a chatbot.
Build a workflow dashboard.

Create and connect:
- homepage
- intake form
- file upload area
- case page
- Agent Activity panel
- extracted facts panel
- citations panel
- recommendation panel
- generated outputs panel
- evidence-pack preview section

Requirements:
- connect to real data from the backend as much as possible
- do not rely on fake placeholders once a real backend path exists
- keep the UI clean and demo-friendly
- prioritize laptop demo quality, but do not break mobile

Do not add animations yet.
Do not do design polish beyond what is needed for a clean usable UI.

At the end:
- summarize the UI data flow
- list files changed
- update `PROJECT_STATE.md`
```

---

## Prompt 9 - End-to-end wiring and demo mode

```text
Continue from the current repo state.

Your task:
Make the full Phase 1 flow work end-to-end and add safe demo mode.

The user should be able to:
- create a case
- upload evidence
- trigger processing
- view case events
- view citations
- view recommendation
- view outputs

Also add:
- seeded demo cases for:
  - IndiGo flight cancellation
  - Flipkart damaged/defective goods
- demo-friendly data and replayable activity flow
- clear distinction between live mode and demo mode if needed

Rules:
- demo mode must be stable
- live mode should remain available
- seeded demo path should be reliable enough for the hackathon demo
- keep architecture unchanged

At the end:
- summarize the end-to-end flow
- summarize demo mode
- list files changed
- update `PROJECT_STATE.md`
```

---

## Prompt 10 - Phase 1 stabilization

```text
Continue from the current repo state.

Your task:
Do the Phase 1 stabilization pass.

Review and improve:
- setup/status page
- homepage
- intake form
- upload flow
- case page
- processing trigger
- Agent Activity
- citations
- outputs
- seeded demo flow

Fix:
- broken buttons
- broken wiring
- inconsistent loading states
- weak empty states
- weak error states
- any obvious code duplication or messy structure if it can be cleaned cheaply

Rules:
- do not broaden feature scope
- do not add Phase 2 features yet
- preserve working flows over visual flourishes
- make the project demo-ready first

At the end:
- summarize what you fixed
- list files changed
- list remaining risks
- update `PROJECT_STATE.md`
- tell me clearly whether Phase 1 is complete enough to submit if needed
```

---

## Prompt 11 - Phase 2 upgrades, only after Phase 1 is stable

```text
Continue from the current repo state.

Only proceed if Phase 1 is already stable.

Your task:
Implement the highest-value Phase 2 upgrades in this order:
1. better citation UX
2. better escalation target selection
3. better complaint classification
4. image/screenshot understanding
5. stronger evidence-pack quality

Rules:
- do not try to do all Phase 2 features at once if the codebase becomes unstable
- preserve the working Phase 1 flow
- prefer improvements that increase trust, clarity, and perceived intelligence
- do not add Phase 3 features yet

At the end:
- summarize which Phase 2 features were added
- list files changed
- update `PROJECT_STATE.md`
- tell me whether the app is now stronger or riskier than the stable Phase 1 baseline
```

---

## Prompt 12 - Final polish, UI polish, animations, docs, presentation readiness

```text
Continue from the current repo state.

Only do this after the core flow is stable.

Your task:
Apply final polish for hackathon presentation readiness.

Do:
- final UI cleanup
- tasteful visual polish
- optional subtle animations only if they are safe and do not break layout or interactions
- improve homepage presentation
- improve panel hierarchy and readability
- improve demo clarity
- update `README.md` with:
  - local setup
  - deployment
  - live mode
  - demo mode
  - smoke-test checklist
- create a short `DEMO_CHECKLIST.md`

Rules:
- animations are optional and must be subtle
- no heavy parallax unless it is completely safe
- no gimmicks
- functionality must remain intact
- do not add new product features here

At the end:
- summarize final polish changes
- list files changed
- update `PROJECT_STATE.md`
- tell me whether the repo is demo-ready
```

---

## How to use this plan

Use this rule:
- after each prompt finishes, do a quick sanity check
- if the output looks wrong, fix that phase before moving on
- do not blindly continue if a previous phase is broken

## Absolute minimum submission-safe stopping point

If time goes bad, stop after:
- Prompt 9 or Prompt 10

That should still give you:
- a valid Phase 1 product
- a working demo path
- enough for hackathon submission
