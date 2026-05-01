export default function StatusPill({ tone = "neutral", children }) {
  const tones = {
    neutral: "border-slate-700 bg-slate-900 text-slate-300",
    live: "border-mint/40 bg-mint/10 text-mint",
    warn: "border-amber/40 bg-amber/10 text-amber"
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
