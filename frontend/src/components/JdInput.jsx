export default function JdInput({ jdText, setJdText }) {
  return (
    <textarea
      value={jdText}
      onChange={(e) => setJdText(e.target.value)}
      placeholder="Paste the job description here…"
      rows={8}
      className="transition-soft w-full resize-none rounded-control bg-base px-4 py-3.5 text-sm text-ink placeholder:text-muted outline-none shadow-pressed focus:shadow-pressed"
    />
  );
}
