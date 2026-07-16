import { useState } from "react";
import ResumeUpload from "./components/ResumeUpload.jsx";
import JdInput from "./components/JdInput.jsx";
import SkillGapResult from "./components/SkillGapResult.jsx";
import FitVerdictResult from "./components/FitVerdictResult.jsx";
import ParsedSkillsModal from "./components/ParsedSkillsModal.jsx";
import { analyzeAll } from "./lib/api.js";

const TABS = {
  GAP: "gap",
  VERDICT: "verdict",
};

function StepBadge({ n }) {
  return (
    <span className="mr-3 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-surface text-xs font-semibold text-primary shadow-raised-xs">
      {n}
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState(TABS.GAP);

  // Shared inputs
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [jdText, setJdText] = useState("");

  // Per-tab state
  const [gapResult, setGapResult] = useState(null);
  const [verdictResult, setVerdictResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Parsed skills, populated from whichever analysis last ran
  const [parsedSkills, setParsedSkills] = useState(null);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);

  const canAnalyze = resumeFile && jdText.trim();

  async function handleAnalyze() {
    setError("");
    setLoading(true);
    try {
      setGapResult(null);
      setVerdictResult(null);

      const result = await analyzeAll(resumeFile, jdText);
      const skillGapResult = result.skillGap || null;
      const verdictResult = result.fitVerdict || null;

      setGapResult(skillGapResult);
      setVerdictResult(verdictResult);

      setParsedSkills({
        resumeSkills: skillGapResult?.resumeSkills || verdictResult?.resumeSkills || [],
        jdSkills: skillGapResult?.jdSkills || verdictResult?.jdSkills || [],
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Recruiting &middot; Analysis
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink">
              Resume &#8596; JD Analyzer
            </h1>
          </div>
          <div className="hidden h-14 w-14 flex-none items-center justify-center rounded-full bg-surface text-primary shadow-raised-sm sm:flex">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-10 flex gap-1 rounded-control bg-base p-1.5 shadow-pressed-sm">
          <button
            onClick={() => setTab(TABS.GAP)}
            className={`transition-soft flex-1 rounded-[13px] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] ${
              tab === TABS.GAP
                ? "bg-surface text-primary shadow-raised-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            Skill Gap Checker
          </button>
          <button
            onClick={() => setTab(TABS.VERDICT)}
            className={`transition-soft flex-1 rounded-[13px] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] ${
              tab === TABS.VERDICT
                ? "bg-surface text-primary shadow-raised-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            Fit Verdict
          </button>
        </div>

        {/* Step 01 */}
        <div className="mb-6 rounded-card bg-surface p-6 shadow-raised">
          <p className="mb-4 flex items-center text-xs font-semibold uppercase tracking-[0.15em] text-ink">
            <StepBadge n={1} />
            Resume
          </p>
          <ResumeUpload
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            error={fileError}
            setError={setFileError}
          />
        </div>

        {/* Step 02 */}
        <div className="mb-6 rounded-card bg-surface p-6 shadow-raised">
          <p className="mb-4 flex items-center text-xs font-semibold uppercase tracking-[0.15em] text-ink">
            <StepBadge n={2} />
            Job Description
          </p>
          <JdInput jdText={jdText} setJdText={setJdText} />
        </div>

        {/* Step 03 */}
        <div className="mb-2 rounded-card bg-surface p-6 shadow-raised">
          <p className="mb-4 flex items-center text-xs font-semibold uppercase tracking-[0.15em] text-ink">
            <StepBadge n={3} />
            Result
          </p>
          <div className="flex items-stretch gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || loading}
              className="transition-soft flex-1 rounded-control bg-primary px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-raised-sm hover:brightness-105 active:shadow-pressed-sm disabled:cursor-not-allowed disabled:bg-surfaceDeep disabled:text-muted disabled:shadow-pressed-sm disabled:active:shadow-pressed-sm"
            >
              {loading
                ? "Analyzing…"
                : tab === TABS.GAP
                ? "Check Skill Gap"
                : "Get Fit Verdict"}
            </button>

            {parsedSkills && (
              <button
                onClick={() => setSkillsModalOpen(true)}
                className="transition-soft whitespace-nowrap rounded-control bg-surface px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink shadow-raised-sm active:shadow-pressed-sm"
              >
                View Parsed Skills
              </button>
            )}
          </div>

          {!canAnalyze && !loading && (
            <p className="mt-3 text-xs text-muted">
              Upload a resume and paste a JD to enable analysis.
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-control bg-warmSoft px-4 py-3 text-sm text-warm shadow-pressed-sm">
              {error}
            </div>
          )}
        </div>

        {tab === TABS.GAP && <SkillGapResult result={gapResult} />}
        {tab === TABS.VERDICT && <FitVerdictResult result={verdictResult} />}
      </div>

      <ParsedSkillsModal
        open={skillsModalOpen}
        onClose={() => setSkillsModalOpen(false)}
        resumeSkills={parsedSkills?.resumeSkills || []}
        jdSkills={parsedSkills?.jdSkills || []}
      />
    </div>
  );
}
