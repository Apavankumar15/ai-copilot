export default function TranscriptPanel({ transcript, interimTranscript }) {
  return (
    <section className="flex min-h-[360px] flex-col rounded-lg border border-line bg-panel/90">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-white">Live Transcript</h2>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4 text-sm leading-6 text-slate-300">
        {transcript ? <p className="whitespace-pre-wrap">{transcript}</p> : <p className="text-slate-500">Transcript appears here once interview mode starts.</p>}
        {interimTranscript && <p className="mt-3 text-mint/80">{interimTranscript}</p>}
      </div>
    </section>
  );
}
