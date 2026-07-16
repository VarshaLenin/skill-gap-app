# Resume ↔ JD Analyzer

A full-stack app with two tabs, built for two assignments:

1. **Skill Gap Checker** — matched skills, missing skills (flagged critical vs.
   nice-to-have), and a deterministic match percentage.
2. **Fit Verdict** — Qualified / Almost There / Not Yet, with 3 supporting
   reasons.

Both tabs use the **Gemini API (free tier)** to extract skills and generate
judgments. Resume can be uploaded as **.pdf, .docx, or .txt**; the JD is
pasted as plain text.

## Architecture

- **Backend: Flask** — holds the Gemini API key (server-side only, never
  sent to the browser), extracts resume text (`pdfplumber` for PDF,
  `python-docx` for DOCX), builds prompts, and calls Gemini.
- **Frontend: React (Vite) + Tailwind** — uploads the resume file and JD
  text to the Flask API and renders the results.
- **Single deployable service**: Flask serves the built React app as static
  files, so there's one process and one URL in production.

```
skill-gap-app/
  backend/
    app.py                  Flask app: API routes + serves built frontend
    requirements.txt
    .env.example
    utils/
      extract_text.py       PDF/DOCX/TXT text extraction
      gemini_client.py      Gemini API client (key stays server-side)
      prompts.py            Prompt templates for both assignments
  frontend/
    src/
      App.jsx                Tabs + shared state + orchestration
      lib/api.js              Calls the Flask backend
      components/
        ResumeUpload.jsx
        JdInput.jsx
        SkillGapResult.jsx
        FitVerdictResult.jsx
  Procfile                   For Render/Railway (gunicorn)
  build.sh                   Build script for deployment platforms
```

## Local development

**1. Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and add your free Gemini key (from
https://aistudio.google.com/apikey):

```
GEMINI_API_KEY=your_actual_key_here
```

Run the backend:

```bash
python app.py
```

This starts Flask on `http://localhost:5000`.

**2. Frontend** (in a separate terminal)

```bash
cd frontend
npm install
npm run dev
```

This starts Vite on `http://localhost:5173` and proxies `/api/*` requests to
Flask automatically (see `vite.config.js`), so there's no CORS friction
during development.

Open `http://localhost:5173` and use the app.

## Deploying (single combined service)

This is set up to deploy as **one service** that builds the frontend and
serves it from Flask. Works on Render, Railway, or any platform that runs a
build command + a start command.

**General steps (any platform):**

1. Push this project to a GitHub repo.
2. Set the **Build Command** to:
   ```
   bash build.sh
   ```
3. Set the **Start Command** to:
   ```
   gunicorn --chdir backend app:app
   ```
4. Add an environment variable: `GEMINI_API_KEY` = your key.
5. Deploy.

**Render specifically:**

1. New → Web Service → connect your repo.
2. Runtime: Python 3.
3. Build Command: `bash build.sh`
4. Start Command: `gunicorn --chdir backend app:app`
5. Add environment variable `GEMINI_API_KEY` in the Render dashboard.
6. Deploy — Render will give you a public URL serving both the UI and the
   API from that same URL.

**Railway specifically:**

1. New Project → Deploy from GitHub repo.
2. Railway auto-detects Python; set Build Command to `bash build.sh` and
   Start Command to `gunicorn --chdir backend app:app` in the service
   settings if it doesn't infer them automatically.
3. Add `GEMINI_API_KEY` under Variables.
4. Deploy.

**PythonAnywhere:** PythonAnywhere's free tier doesn't run arbitrary build
scripts or Node — you'd need to build the frontend locally (`npm run build`
inside `frontend/`) and commit/upload the resulting `frontend/dist` folder,
then point a WSGI app at `backend/app.py`. Render or Railway are simpler
for this project since they run the build script for you.

## How match percentage is calculated

**Hybrid approach:**

- Gemini extracts skills from both documents and determines
  `matchedSkills` / `missingSkills`.
- **Match Percentage** is computed deterministically in `backend/app.py` as
  `len(matchedSkills) / len(jdSkills) * 100` — auditable and reproducible,
  not left to the model's arithmetic.
- Gemini separately flags each missing skill as **Critical** or **Nice to
  have**, and adds optional notes about transferable/adjacent skills. These
  are shown as context but are **not** folded into the headline percentage.

The Fit Verdict tab (Assignment 2) is where holistic, AI-judged nuance comes
in instead — that's a judgment call, not a ratio.

## Notes / limitations

- Scanned/image-only PDFs won't extract text (no OCR). Use a text-based PDF
  or a `.txt` file instead.
- Gemini free tier has rate limits; a 429 error means "wait and retry."
- Model used: `gemini-2.5-flash` (change `GEMINI_MODEL` in
  `backend/utils/gemini_client.py` to swap models). Google's free-tier
  model lineup changes fairly often — worth checking
  https://ai.google.dev/gemini-api/docs/pricing before you deploy, in case
  this needs updating again.
- `GEMINI_API_KEY` must be set as an environment variable both locally
  (`.env`) and on your deployment platform's dashboard — it is never
  committed to the repo (`.env` is gitignored) and never sent to the
  browser.
