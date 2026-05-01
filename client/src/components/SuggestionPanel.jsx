import { Brain, Code2, Gauge } from "lucide-react";

export default function SuggestionPanel({ suggestion, isLoading }) {
  return (
    <section className="flex min-h-[360px] flex-col rounded-lg border border-line bg-panel/90">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-white">AI Suggestions</h2>
        {isLoading && <span className="text-xs font-medium text-mint">Thinking...</span>}
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">
        {!suggestion ? (
          <p className="text-sm leading-6 text-slate-500">Answer bullets will stream here after a question is detected.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge icon={Brain}>{suggestion.questionType}</Badge>
              <Badge icon={Gauge}>{Math.round((suggestion.confidence || 0) * 100)}% confidence</Badge>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Answer Outline</h3>
              <ul className="space-y-3 text-sm leading-6 text-slate-200">
                {suggestion.answer?.map((item, index) => (
                  <li key={`${item}-${index}`} className="rounded-md border border-slate-800 bg-slate-950/50 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {suggestion.codingHints?.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  <Code2 className="h-4 w-4" />
                  Coding Hints
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {suggestion.codingHints.map((hint, index) => (
                    <li key={`${hint}-${index}`}>- {hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Badge({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold capitalize text-slate-300">
      <Icon className="h-3.5 w-3.5 text-mint" />
      {children}
    </span>
  );
}
