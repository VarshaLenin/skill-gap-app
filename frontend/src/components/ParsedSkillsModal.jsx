function SkillTag({ label }) {
  return (
    <span className="mb-2 mr-2 inline-block rounded-full bg-base px-3.5 py-1.5 text-xs text-ink shadow-pressed-sm">
      {label}
    </span>
  );
}

function JdSkillGroup({ title, skills }) {
  if (!skills.length) return null;
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
        {title} ({skills.length})
      </p>
      <div>
        {skills.map((s) => (
          <SkillTag key={s.skill} label={s.skill} />
        ))}
      </div>
    </div>
  );
}

export default function ParsedSkillsModal({ open, onClose, resumeSkills = [], jdSkills = [] }) {
  if (!open) return null;

  const required = jdSkills.filter((s) => s.requirement === "Required");
  const preferred = jdSkills.filter((s) => s.requirement === "Preferred");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-card bg-surface p-6 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Parsed Skills</h2>
          <button
            onClick={onClose}
            className="transition-soft flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-raised-xs active:shadow-pressed-sm"
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>

        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            From Resume ({resumeSkills.length})
          </p>
          {resumeSkills.length ? (
            <div>
              {resumeSkills.map((s) => (
                <SkillTag key={s} label={s} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">No skills parsed yet.</p>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink">
            From Job Description ({jdSkills.length})
          </p>
          {jdSkills.length ? (
            <>
              <JdSkillGroup title="Required" skills={required} />
              <JdSkillGroup title="Preferred" skills={preferred} />
            </>
          ) : (
            <p className="text-xs text-muted">No skills parsed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
