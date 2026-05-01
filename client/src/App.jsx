import { useCallback, useEffect, useMemo, useState } from "react";
import { Mic, MicOff, Send, ShieldCheck, Sparkles } from "lucide-react";
import ResumeUpload from "./components/ResumeUpload.jsx";
import StatusPill from "./components/StatusPill.jsx";
import SuggestionPanel from "./components/SuggestionPanel.jsx";
import TranscriptPanel from "./components/TranscriptPanel.jsx";
import { createSuggestionSocket, generateAnswer, uploadResume } from "./services/api.js";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition.js";

const sessionId = crypto.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [resumeState, setResumeState] = useState({ filename: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const requestSuggestion = useCallback(async (text) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const next = await generateAnswer(sessionId, text);
      setSuggestion(next);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFinalTranscript = useCallback(
    (text) => {
      setTranscript((current) => [current, text].filter(Boolean).join("\n"));
      requestSuggestion(text);
    },
    [requestSuggestion]
  );

  const speech = useSpeechRecognition({ onFinalTranscript: handleFinalTranscript });

  useEffect(() => {
    const socket = createSuggestionSocket(sessionId, (message) => {
      if (message.type === "suggestion") setSuggestion(message.suggestion);
      if (message.type === "resume-ready") {
        setResumeState((current) => ({
          ...current,
          message: `Resume indexed (${message.characters.toLocaleString()} characters)`
        }));
      }
    });

    return () => socket.close();
  }, []);

  const status = useMemo(() => {
    if (speech.isListening) return { tone: "live", label: "Listening" };
    if (!speech.isSupported) return { tone: "warn", label: "Manual mode" };
    return { tone: "neutral", label: "Ready" };
  }, [speech.isListening, speech.isSupported]);

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setResumeState({ filename: file.name, message: "Uploading..." });
    setError("");
    try {
      const result = await uploadResume(sessionId, file);
      setResumeState({
        filename: result.filename,
        message: `Resume indexed (${result.characters.toLocaleString()} characters)`
      });
    } catch (uploadError) {
      setResumeState({ filename: file.name, message: "Upload failed" });
      setError(uploadError.message);
    }
  };

  const submitManualPrompt = (event) => {
    event.preventDefault();
    const text = manualPrompt.trim();
    if (!text) return;
    setTranscript((current) => [current, text].filter(Boolean).join("\n"));
    setManualPrompt("");
    requestSuggestion(text);
  };

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-5 rounded-lg border border-line bg-ink/70 px-5 py-5 shadow-glow sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck className="h-4 w-4 text-mint" />
                Visible learning assistant
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">AI Interview Copilot</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Practice with live transcription, resume-aware bullet suggestions, STAR answers, and coding hints.
            </p>
          </div>
          <button
            type="button"
            onClick={speech.isListening ? speech.stop : speech.start}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-mint px-5 py-3 text-sm font-bold text-ink transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {speech.isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {speech.isListening ? "Stop Interview Mode" : "Start Interview Mode"}
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ResumeUpload resumeState={resumeState} onUpload={handleResumeUpload} />
          <form onSubmit={submitManualPrompt} className="flex gap-3 rounded-lg border border-line bg-panel/90 p-3">
            <input
              value={manualPrompt}
              onChange={(event) => setManualPrompt(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-mint"
              placeholder="Type or paste an interview question..."
            />
            <button type="submit" aria-label="Send question" className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-100 px-4 text-ink transition hover:bg-white">
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

        {(error || speech.error) && (
          <div className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
            {error || speech.error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <TranscriptPanel transcript={transcript} interimTranscript={speech.interimTranscript} />
          <SuggestionPanel suggestion={suggestion} isLoading={isLoading} />
        </div>

        <footer className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <Sparkles className="h-4 w-4 text-mint" />
          <span>Uses browser speech recognition by default. Add an OpenAI API key on the server for GPT responses.</span>
        </footer>
      </div>
    </main>
  );
}
