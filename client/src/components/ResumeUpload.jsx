import { FileText, Upload } from "lucide-react";

export default function ResumeUpload({ resumeState, onUpload }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-line bg-panel/90 px-5 py-4 transition hover:border-mint/50">
      <div className="flex min-w-0 items-center gap-3">
        <FileText className="h-5 w-5 shrink-0 text-mint" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{resumeState.filename || "Upload resume"}</p>
          <p className="text-xs text-slate-400">{resumeState.message || "PDF or text, used only as temporary session context"}</p>
        </div>
      </div>
      <Upload className="h-5 w-5 shrink-0 text-slate-400" />
      <input className="hidden" type="file" accept=".pdf,.txt,text/plain,application/pdf" onChange={(event) => onUpload(event.target.files?.[0])} />
    </label>
  );
}
