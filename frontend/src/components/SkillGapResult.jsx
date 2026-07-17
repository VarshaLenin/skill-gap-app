function SkillTag({ label, variant }) {
  const styles = {
    matched: "bg-primary text-white shadow-raised-xs",
    "matched-preferred": "bg-primary/60 text-white shadow-raised-xs",
    missing: "bg-surface text-warm shadow-pressed-sm",
  };
  return (
    <span className={`transition-soft mb-2 mr-2 inline-block rounded-full px-3.5 py-1.5 text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}

function SkillGroup({ title, skills, variant = "missing" }) {
  if (!skills.length) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
        {title}
      </p>
      <div>
        {skills.map((s) => (
          <SkillTag key={s.skill} label={s.skill} variant={variant} />
        ))}
      </div>
    </div>
  );
}

// Signature element: the match score reads as a dial pressed into the
// surface, with the filled arc rising out of it -- the one place in the
// page where the "pressed vs raised" language of soft UI tells the story
// (how much of the gap is already closed) instead of just decorating it.
function MatchDial({ percentage }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(percentage, 100) / 100) * c;

  return (
    <div className="relative mx-auto h-36 w-36 rounded-full bg-surface shadow-pressed">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#D7DEEA" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#5A63E8"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold text-ink">{percentage}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
          Matched
        </span>
      </div>
    </div>
  );
}

export default function SkillGapResult({ result }) {
  if (!result) return null;

  const {
    matchedSkills = [],
    missingSkills = [],
    jdSkills = [],
    transferableNotes = [],
    matchPercentage = 0,
  } = result;

  const matchedRequired = matchedSkills.filter((s) => s.requirement === "Required");
  const matchedPreferred = matchedSkills.filter((s) => s.requirement === "Preferred");
  const missingRequired = missingSkills.filter((s) => s.requirement === "Required");
  const missingPreferred = missingSkills.filter((s) => s.requirement === "Preferred");
  const requiredJdCount = jdSkills.filter((s) => s.requirement === "Required").length;

  return (
    <div className="mt-6 rounded-card bg-surface p-6 shadow-raised">
      <div className="mb-8 flex flex-col items-center">
        <MatchDial percentage={matchPercentage} />
        <p className="mt-4 text-xs text-muted">
          {matchedRequired.length} of {requiredJdCount} required skills matched
        </p>
      </div>

      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink">
          Matched Skills
        </p>
        {matchedSkills.length ? (
          <>
            <SkillGroup title="Required" skills={matchedRequired} variant="matched" />
            <SkillGroup title="Preferred" skills={matchedPreferred} variant="matched-preferred" />
          </>
        ) : (
          <p className="text-xs text-muted">No matched skills found.</p>
        )}
      </div>

      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-warm">
          Missing Skills
        </p>
        {missingSkills.length ? (
          <>
            <SkillGroup title="Required" skills={missingRequired} variant="missing" />
            <SkillGroup title="Preferred" skills={missingPreferred} variant="missing" />
          </>
        ) : (
          <p className="text-xs text-muted">No gaps — full match!</p>
        )}
      </div>

      {transferableNotes.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            Transferable Skill Notes
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-muted">
            {transferableNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
