const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export default function ResumeUpload({ resumeFile, setResumeFile, error, setError }) {
  function handleFile(file) {
    if (!file) return;
    setError("");

    const name = file.name.toLowerCase();
    const isAllowed = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
    if (!isAllowed) {
      setError("Please upload a .pdf, .docx, or .txt file.");
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <label className="transition-soft cursor-pointer rounded-control bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary shadow-raised-sm active:shadow-pressed-sm">
          Choose File
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        {resumeFile ? (
          <span className="truncate rounded-control bg-base px-3.5 py-2.5 text-xs text-ink shadow-pressed-sm max-w-[240px]">
            {resumeFile.name}
          </span>
        ) : (
          <span className="text-xs text-muted">.pdf, .docx, or .txt</span>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-warm">{error}</p>}
    </div>
  );
}
