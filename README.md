# Resume ↔ JD Analyzer

A full-stack app I built for the Techotlist Connects take-home — covers both assignments in one UI (tabbed), backed by one Flask service.

**Live app:** https://skill-gap-application.onrender.com/

> Heads up: it's on Render's free tier, so if it's been idle a bit the first request can take 30-50s to wake up. Just give it a moment on first load.

**Demo video:** [Output.mp4](https://github.com/VarshaLenin/skill-gap-app/blob/main/Output.mp4) — in case the live link is cold-starting or the free-tier Gemini key is rate-limited when you check it out. Click on "View Raw" to view the video.

## What it does

**Assignment 1 — Skill Gap Checker**
Upload a resume, paste a JD, get back matched skills, missing skills, and a match percentage.

**Assignment 2 — Fit Verdict**
Same inputs, but instead of a skill breakdown you get a verdict (Qualified / Almost There / Not Yet) with 3 supporting reasons.

Both tabs share the same upload + JD input and hit the Gemini API to do the actual skill extraction and reasoning.

## Stack

- **Backend:** Flask — keeps the Gemini API key server-side (never touches the browser), extracts text from resumes (`pdfplumber` for PDF, `python-docx` for DOCX), builds the prompts, calls Gemini.
- **Frontend:** React (Vite) + Tailwind — handles the upload/JD form and renders results.
- **Deployment:** one combined service — Flask serves the built React app as static files, so it's a single process and a single URL in production. No CORS juggling, no separate frontend/backend deploys.

```
skill-gap-app/
  backend/
    app.py                  routes + serves the built frontend
    requirements.txt
    tests/
      test_analysis_routes.py
    utils/
      extract_text.py       PDF/DOCX/TXT parsing
      gemini_client.py      Gemini API calls
      prompts.py            prompt templates
  frontend/
    src/
      App.jsx
      lib/api.js
      components/
        ResumeUpload.jsx
        JdInput.jsx
        SkillGapResult.jsx
        FitVerdictResult.jsx
        ParsedSkillsModal.jsx
  Procfile
  build.sh
```

## Running it locally

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```
Drop a free Gemini key into `.env` (grab one at https://aistudio.google.com/apikey):
```
GEMINI_API_KEY=your_key_here
```
Then:
```bash
python app.py
```
Flask runs on `http://localhost:5000`.

**Frontend** (separate terminal)
```bash
cd frontend
npm install
npm run dev
```
Vite runs on `http://localhost:5173` and proxies `/api/*` to Flask, so no CORS setup needed for local dev.

## How the match % is calculated

Wanted this to be auditable, not just "whatever the model says." So it's a hybrid:
- Gemini extracts skills from both documents and figures out matched vs. missing.
- **Match percentage is computed in code**, and it only counts **Required** JD skills — `matched Required skills / total Required JD skills * 100`. A matched Preferred skill doesn't inflate the number.
- Gemini also tags every skill as **Required** or **Preferred** based on how it's phrased in the JD (e.g. "must-have" vs. "nice to have" language). Both Matched and Missing skills are shown split into Required/Preferred groups in the UI (color-coded), so Preferred matches are still visible as context — they just don't count toward the headline percentage.
- Gemini also adds short notes on adjacent/transferable skills where relevant.

The Fit Verdict tab is where I let Gemini make the more holistic, judgment-call kind of decision — that one's not meant to be a strict ratio. It's explicitly told to weigh Required gaps more heavily than Preferred gaps when choosing a verdict.

## Assumptions & trade-offs

- Resume parsing assumes text-based PDFs/DOCX/TXT — scanned/image-only PDFs won't extract anything since there's no OCR step. Didn't want to pull in a heavier OCR dependency for a take-home scope.
- Went with Gemini's free tier, which comes with rate limits (expect an occasional 429 under repeated rapid testing — it's just "wait and retry," not a bug).
- Single combined deploy (Flask serving the React build) over separate frontend/backend hosting — fewer moving parts, one URL, no CORS config to maintain in production.
- Match percentage is deterministic by design (see above) — traded a bit of "AI does everything" purity for something explainable in an interview.

## Known limitations

- No OCR for scanned PDFs.
- Free-tier Gemini rate limits apply.
- Model in use is `gemini-3.1-flash-lite`, set in `backend/utils/gemini_client.py` — Google's free-tier lineup shifts fairly often, so if this 404s down the line, that's the first place to check against https://ai.google.dev/gemini-api/docs/pricing.
- There's a basic test suite at `backend/tests/test_analysis_routes.py`.
