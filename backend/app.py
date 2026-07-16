"""
Flask backend for the Resume <-> JD Analyzer.

Serves two API endpoints:
  POST /api/skill-gap    -> Assignment 1 (matched/missing skills + %)
  POST /api/fit-verdict  -> Assignment 2 (Qualified/Almost There/Not Yet + reasons)

Both accept multipart/form-data with:
  - "resume": the uploaded resume file (.pdf, .docx, .txt)
  - "jd": plain text job description

In production, this same Flask app also serves the built React frontend
(static files in frontend/dist) so the whole thing is one deployable service.
"""
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from utils.extract_text import UnsupportedFileType, extract_text
from utils.gemini_client import GeminiError, call_gemini_json
from utils.prompts import build_combined_analysis_prompt, build_fit_verdict_prompt, build_skill_gap_prompt


def _build_combined_analysis_payload(resume_text: str, jd_text: str) -> dict:
    """Run one Gemini call and return both analysis payloads."""
    result = call_gemini_json(build_combined_analysis_prompt(resume_text, jd_text))
    skill_gap_result = result.get("skillGap") or {}
    fit_verdict_result = result.get("fitVerdict") or {}

    # Deterministic match percentage, computed here rather than trusting
    # the model's arithmetic -- see design note in utils/prompts.py.
    jd_skills = skill_gap_result.get("jdSkills", []) or []
    matched_skills = skill_gap_result.get("matchedSkills", []) or []
    total = len(jd_skills) or 1
    skill_gap_result["matchPercentage"] = round(len(matched_skills) / total * 100)

    return {"skillGap": skill_gap_result, "fitVerdict": fit_verdict_result}

load_dotenv()

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")

# CORS is only needed for local dev when frontend (Vite, port 5173) and
# backend (Flask, port 5000) run separately. Harmless to leave on in prod
# since everything is served from the same origin there.
CORS(app)

MAX_JD_LENGTH = 20000  # generous cap to avoid abuse


def _get_resume_and_jd():
    """Shared parsing/validation for both analysis endpoints."""
    if "resume" not in request.files:
        raise ValueError("No resume file uploaded.")

    resume_file = request.files["resume"]
    if not resume_file.filename:
        raise ValueError("No resume file selected.")

    jd_text = (request.form.get("jd") or "").strip()
    if not jd_text:
        raise ValueError("Job description text is required.")
    if len(jd_text) > MAX_JD_LENGTH:
        raise ValueError("Job description is too long.")

    resume_text = extract_text(resume_file)
    if not resume_text:
        raise ValueError(
            "No text could be extracted from the resume. If it's a scanned/"
            "image-based PDF, try a text-based PDF or a .txt file instead."
        )

    return resume_text, jd_text


@app.post("/api/skill-gap")
def skill_gap():
    try:
        resume_text, jd_text = _get_resume_and_jd()
        prompt = build_skill_gap_prompt(resume_text, jd_text)
        result = call_gemini_json(prompt)

        # Deterministic match percentage, computed here rather than trusting
        # the model's arithmetic -- see design note in utils/prompts.py.
        jd_skills = result.get("jdSkills", []) or []
        matched_skills = result.get("matchedSkills", []) or []
        total = len(jd_skills) or 1
        result["matchPercentage"] = round(len(matched_skills) / total * 100)

        return jsonify(result)
    except UnsupportedFileType as e:
        return jsonify({"error": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except GeminiError as e:
        return jsonify({"error": str(e)}), 502
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"Unexpected server error: {e}"}), 500


@app.post("/api/fit-verdict")
def fit_verdict():
    try:
        resume_text, jd_text = _get_resume_and_jd()
        prompt = build_fit_verdict_prompt(resume_text, jd_text)
        result = call_gemini_json(prompt)
        return jsonify(result)
    except UnsupportedFileType as e:
        return jsonify({"error": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except GeminiError as e:
        return jsonify({"error": str(e)}), 502
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"Unexpected server error: {e}"}), 500


@app.post("/api/analyze-all")
def analyze_all():
    try:
        resume_text, jd_text = _get_resume_and_jd()
        payload = _build_combined_analysis_payload(resume_text, jd_text)
        return jsonify(payload)
    except UnsupportedFileType as e:
        return jsonify({"error": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except GeminiError as e:
        return jsonify({"error": str(e)}), 502
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"Unexpected server error: {e}"}), 500


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


# --- Serve the built React frontend for all non-API routes ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
