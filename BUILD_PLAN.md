# BUILD_PLAN.md - Redressa AI

> Practical build plan derived from `Redressa_AI.txt` and `PROJECT_STATE.md`.
> Do not modify the product idea, stack, or scope without explicit approval.

---

## 1. Build Phases in Order

### Phase 1 - Winning-Core MVP

The hackathon-minimum. If the build stops here, the project must still be demoable and submission-worthy.

| Step | What | Key Deliverable |
|------|------|-----------------|
| 1.1 | **Source-of-truth & planning** | `PROJECT_STATE.md`, `BUILD_PLAN.md`, `VALIDATION.md` |
| 1.2 | **Scaffold** | Clean Next.js App Router + TS + Tailwind project with folder conventions |
| 1.3 | **Backend schema & services** | Supabase tables (`cases`, `case_files`, `case_events`, `policy_documents`, `policy_chunks`, `generated_outputs`), typed clients |
| 1.4 | **Early deployment** | Vercel deploy succeeding with a status/health page |
| 1.5 | **Policy corpus & retrieval** | Curated policy/regulation chunks for IndiGo + DGCA + Flipkart; deterministic retrieval helpers; citation structure |
| 1.6 | **Core agent pipeline** | Typed in-app pipeline: intake -> parse -> extract -> timeline -> classify -> retrieve policy -> retrieve regulation -> evaluate -> route -> generate outputs |
| 1.7 | **Connected UI** | Dashboard with intake form, upload, case page, Agent Activity panel, facts panel, citations panel, recommendation panel, outputs panel, evidence-pack preview |
| 1.8 | **End-to-end wiring & demo mode** | Full flow works; seeded demo cases for IndiGo and Flipkart; live mode available alongside demo mode |
| 1.9 | **Phase 1 stabilization** | Bug fixes, loading/error/empty states, demo reliability pass |

### Phase 2 - Intelligence & Trust Upgrade

Only after Phase 1 is end-to-end stable.

| Priority | Feature |
|----------|---------|
| 1 | Better citation UX (source cards, highlighted excerpts) |
| 2 | Better escalation target selection (grievance cell / nodal officer / regulator) |
| 3 | Image/screenshot understanding |
| 4 | Smarter complaint classification |
| 5 | Stronger evidence-pack export quality |
| 6 | Denial-reason extraction from support emails/chats |
| 7 | Stronger policy ingestion and metadata structure |

### Phase 3 - Advanced Workflow Expansion

Only if core is stable and time remains.

- Approval-gated outbound email sending
- Formal PDF evidence-pack export
- Broader complaint categories
- Vector retrieval / embeddings
- Controlled policy refresh / background sync
- Optional browser automation (one narrow flow)
- Optional n8n orchestration
- Optional enterprise OCR (Textract)

---

## 2. Exact Implementation Order

This is the locked priority sequence from `PROJECT_STATE.md`:

```text
1. Source-of-truth files                  - completed
2. Validation notes                       - completed
3. Scaffold (Next.js + TypeScript + Tailwind)
4. Backend schema & Supabase service setup
5. Early deployment on Vercel
6. Policy corpus & retrieval setup
7. Core agent pipeline
8. Connected UI (not mock UI)
9. End-to-end wiring + demo mode
10. Phase 1 stabilization
11. Phase 2 upgrades (in priority order)
12. Final polish, animations, docs
```

**Rule**: Do not advance to the next step until the current step is confirmed working.

---

## 3. Minimum Manual Setup Steps

These are the things that cannot be automated by code generation and must be done by hand:

### Before any code runs
- [ ] Create a **Supabase project** at [supabase.com](https://supabase.com)
- [ ] Create a **Gemini API key** at [aistudio.google.com](https://aistudio.google.com)
- [ ] Create a **Vercel project** linked to the GitHub repo (or folder)

### After scaffold is created
- [ ] Copy `.env.example` -> `.env.local` and fill in real values:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY`
- [ ] Run the Supabase schema SQL in the Supabase SQL Editor
- [ ] Confirm `npm run dev` starts without errors

### After policy corpus is set up
- [ ] Verify / paste real policy text for:
  - IndiGo cancellation/refund policy
  - DGCA passenger rights
  - Flipkart damaged/defective goods return policy
- [ ] Prepare clean demo evidence files (one aviation case, one e-commerce case)

### Before hackathon demo
- [ ] Deploy to Vercel with all env vars set
- [ ] Run seeded demo flow end-to-end on the deployed URL
- [ ] Confirm demo mode works without Supabase cold-start issues

---

## 4. Most Important Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | **Gemini API latency / rate limits** | Pipeline steps time out or fail during demo | Use seeded demo mode as fallback; keep prompts small; add timeouts with graceful error UI |
| 2 | **Supabase cold start** | First request after idle hangs or errors | Deploy early; keep the project warm before demo; add retry logic |
| 3 | **Policy text quality** | Bad chunks -> bad retrieval -> bad evaluation | Hand-curate and verify chunks before wiring them in; keep the corpus tiny and high-quality |
| 4 | **Scope creep** | Adding Phase 2/3 features before Phase 1 is stable | Enforce phase gates; do not merge Phase 2 code until Phase 1 passes stabilization |
| 5 | **PDF/evidence parsing fragility** | Unexpected file formats break extraction | Use deterministic parsing first; constrain demo files to known-good formats |
| 6 | **Time pressure** | Not enough time to finish Phase 1 | Each step is independently demoable; worst case stop after step 1.8 or 1.9 |
| 7 | **Vercel deployment issues** | Build or runtime errors on deploy | Deploy a skeleton early (step 1.4) and keep deploying after every major change |

---

## 5. Phase-Gate Criteria

### Gate: Phase 1 -> Phase 2

All of the following must be true before starting Phase 2 work:

- [ ] Supabase schema is live and populated with seed data
- [ ] Full pipeline runs without errors for both demo cases (IndiGo + Flipkart)
- [ ] Agent Activity panel shows visible step-by-step progress
- [ ] All five generated outputs render correctly (case summary, email draft, escalation note, checklist, evidence-pack preview)
- [ ] Citations are present and reference real policy text
- [ ] Demo mode is reliable and repeatable
- [ ] Live mode accepts a new case and processes it end-to-end
- [ ] App is deployed on Vercel and accessible via public URL
- [ ] No critical bugs in the core flow
- [ ] `PROJECT_STATE.md` reflects Phase 1 complete

### Gate: Phase 2 -> Phase 3

- [ ] Phase 1 flow still works after Phase 2 additions (no regressions)
- [ ] At least citation UX and escalation target selection are implemented
- [ ] Demo path is still stable
- [ ] Team agrees remaining time justifies Phase 3 work

### Gate: Phase 2/3 -> Final Polish

- [ ] Core flow is stable - no known crash paths
- [ ] Polish will not introduce new features, only improve existing presentation
- [ ] `DEMO_CHECKLIST.md` is created with a step-by-step demo script

---

## 6. Absolute Minimum Submission-Safe Stopping Point

If time runs out, **stop after step 1.8 (end-to-end wiring + demo mode)** or **step 1.9 (stabilization)**.

That gives you:
- A valid Phase 1 product
- A working seeded demo path
- Enough for hackathon submission and judging

---

## 7. Files in This Repo

| File | Purpose |
|------|---------|
| `Redressa_AI.txt` | Full product brief, merged lineage, feature roadmap |
| `PROJECT_STATE.md` | Locked stack, scope, phases, build rules, success criteria |
| `BUILD_PLAN.md` | This file - practical build plan |
| `Ideas and Guides/` | Research PDFs, hackathon track info |
| `Prompts/` | Prompt plan for the build sequence |
