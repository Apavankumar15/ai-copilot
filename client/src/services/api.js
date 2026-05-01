const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

export async function uploadResume(sessionId, file) {
  const body = new FormData();
  body.append("sessionId", sessionId);
  body.append("resume", file);

  const response = await fetch(`${API_BASE}/upload-resume`, {
    method: "POST",
    body
  });

  return parseResponse(response);
}

export async function generateAnswer(sessionId, transcript) {
  const response = await fetch(`${API_BASE}/generate-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, transcript })
  });

  return parseResponse(response);
}

export function createSuggestionSocket(sessionId, onMessage) {
  const socket = new WebSocket(`${WS_BASE}/?sessionId=${encodeURIComponent(sessionId)}`);
  socket.addEventListener("message", (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      onMessage({ type: "raw", data: event.data });
    }
  });
  return socket;
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}
