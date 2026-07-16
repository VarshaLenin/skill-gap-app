const VERDICT_STYLES = {
  Qualified: "bg-primary text-white shadow-raised-xs",
  "Almost There": "bg-surface text-warm shadow-pressed-sm",
  "Not Yet": "bg-surface text-warm shadow-pressed-sm",
};

export default function FitVerdictResult({ result }) {
  if (!result) return null;

  const { verdict, reasons = [] } = result;
  const style = VERDICT_STYLES[verdict] || "bg-surface text-ink shadow-pressed-sm";

  return (
    <div className="mt-6 rounded-card bg-surface p-6 shadow-raised">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
          Verdict
        </p>
        <span
          className={`transition-soft rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${style}`}
        >
          {verdict}
        </span>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink">
        Reasons
      </p>
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink">
        {reasons.map((reason, i) => (
          <li key={i}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
