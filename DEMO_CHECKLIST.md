# Redressa - Demo Checklist

Use this checklist for a clean judging demo.

## 0. Pre-flight Checks

- [ ] `.env.local` contains valid Supabase, Groq, and OCR.space keys
- [ ] `npm run build` succeeds locally
- [ ] The live site returns successfully from `/api/health`
- [ ] The homepage recent-cases list is empty or only contains cases you intentionally want to show

## 1. Know Your Two Demo Paths

### Live OCR path
Use this when network conditions and OCR limits are stable.

- Best for showing real uploaded screenshot OCR
- Recommended file type: small `.png` or `.jpg`
- Keep image size comfortably under OCR.space free-tier limits when possible

### Hidden sample-case path
Use this as the fallback demo path.

- Open `/new`
- Expand the subtle `or use a sample case` section below the submit button
- Choose either:
  - `IndiGo flight cancellation`
  - `Flipkart damaged goods`

This preserves a reliable demo path without making demo shortcuts the main consumer experience.

## 2. Recommended Live Demo Flow

1. Start on `/`
2. Click **File a New Claim**
3. Choose the correct category
4. Fill the merchant and complaint summary
5. Upload one clear screenshot containing facts not repeated in the typed description
6. Submit the case
7. While the pipeline runs, explain that:
   - OCR.space extracts the document text
   - Groq handles reasoning, classification, evaluation, routing, and output drafting

## 3. What to Show on the Case Page

Highlight:

- **Agent Activity** to show the workflow sequence
- **Extracted Facts** to show grounded fact extraction
- **Citations** to show policy/regulation grounding
- **Recommendation** to show escalation logic
- **Generated Outputs** to show drafts the user can act on

## 4. Technical Proof Mode

If a judge wants to see the evidence pipeline:

1. Open a finished case URL
2. Append `?debug=1`
3. Show:
   - uploaded file info
   - OCR diagnostics
   - parsed text preview
   - extraction evidence prompt preview

## 5. Talking Points

- This is a workflow system, not a chatbot.
- It converts messy consumer evidence into structured escalation-ready outputs.
- It is grounded in policy and regulation retrieval rather than free-form advice.
- It is informational guidance, not legal advice.

## Current Limitations to Mention Honestly

- OCR on uploaded images is verified working.
- PDF OCR is best-effort and depends on OCR.space free-tier constraints.
- Hidden sample cases are available as the fallback demo path if live OCR is unstable.
