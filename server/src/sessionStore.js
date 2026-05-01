const sessions = new Map();

export function getSession(sessionId = "default") {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      transcript: "",
      resumeText: "",
      lastSuggestion: null,
      updatedAt: Date.now()
    });
  }

  const session = sessions.get(sessionId);
  session.updatedAt = Date.now();
  return session;
}

export function appendTranscript(sessionId, text) {
  const session = getSession(sessionId);
  const nextText = [session.transcript, text].filter(Boolean).join(" ").trim();
  session.transcript = nextText.slice(-8000);
  session.updatedAt = Date.now();
  return session;
}

export function setResumeText(sessionId, resumeText) {
  const session = getSession(sessionId);
  session.resumeText = resumeText;
  session.updatedAt = Date.now();
  return session;
}

export function setLastSuggestion(sessionId, suggestion) {
  const session = getSession(sessionId);
  session.lastSuggestion = suggestion;
  session.updatedAt = Date.now();
  return session;
}

export function clearStaleSessions(maxAgeMs = 1000 * 60 * 60 * 4) {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.updatedAt > maxAgeMs) {
      sessions.delete(sessionId);
    }
  }
}
