import { config } from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { appendTranscript, clearStaleSessions, getSession, setLastSuggestion, setResumeText } from "./sessionStore.js";
import { generateInterviewAnswer } from "./openai.js";
import { extractResumeText } from "./resume.js";

config({ path: new URL("../.env", import.meta.url) });

const app = express();
const server = http.createServer(app);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "1mb" }));

const wss = new WebSocketServer({ server });
const socketsBySession = new Map();

wss.on("connection", (socket, request) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const sessionId = url.searchParams.get("sessionId") || "default";

  if (!socketsBySession.has(sessionId)) socketsBySession.set(sessionId, new Set());
  socketsBySession.get(sessionId).add(socket);

  socket.send(JSON.stringify({ type: "connected", sessionId }));
  socket.on("close", () => socketsBySession.get(sessionId)?.delete(socket));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, openAiEnabled: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/transcribe", (req, res) => {
  const { sessionId = "default", text = "" } = req.body || {};
  const session = appendTranscript(sessionId, text);
  res.json({ transcript: session.transcript });
});

app.post("/upload-resume", upload.single("resume"), async (req, res, next) => {
  try {
    const sessionId = req.body.sessionId || "default";
    const resumeText = await extractResumeText(req.file);
    setResumeText(sessionId, resumeText);
    broadcast(sessionId, { type: "resume-ready", characters: resumeText.length });
    res.json({
      ok: true,
      filename: req.file.originalname,
      characters: resumeText.length,
      preview: resumeText.slice(0, 600)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/generate-answer", async (req, res, next) => {
  try {
    const { sessionId = "default", transcript = "" } = req.body || {};
    const session = appendTranscript(sessionId, transcript);
    const suggestion = await generateInterviewAnswer({
      transcript: session.transcript,
      resumeText: session.resumeText
    });

    setLastSuggestion(sessionId, suggestion);
    broadcast(sessionId, { type: "suggestion", suggestion });
    res.json(suggestion);
  } catch (error) {
    next(error);
  }
});

app.get("/session/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  res.json({
    transcript: session.transcript,
    hasResume: Boolean(session.resumeText),
    lastSuggestion: session.lastSuggestion
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(400).json({ error: error.message || "Request failed" });
});

function broadcast(sessionId, payload) {
  const sockets = socketsBySession.get(sessionId);
  if (!sockets) return;

  const message = JSON.stringify(payload);
  for (const socket of sockets) {
    if (socket.readyState === WebSocket.OPEN) socket.send(message);
  }
}

setInterval(clearStaleSessions, 1000 * 60 * 30).unref();

server.listen(port, () => {
  console.log(`AI Interview Copilot API listening on http://localhost:${port}`);
});
