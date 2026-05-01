import { config } from "dotenv";
import OpenAI from "openai";

config({ path: new URL("../.env", import.meta.url) });

const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateInterviewAnswer({ transcript, resumeText }) {
  const question = extractLatestQuestion(transcript);

  if (!client) {
    return fallbackAnswer(question, resumeText);
  }

  const response = await client.chat.completions.create({
    model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are AI Interview Copilot, a visible interview preparation assistant. Classify interview questions and produce concise, honest bullet-point suggestions. Do not encourage deception. Use resume context only when relevant. Return valid JSON with keys: questionType, answer, confidence, codingHints."
      },
      {
        role: "user",
        content: JSON.stringify({
          transcript: question,
          resumeContext: resumeText || "",
          requirements: [
            "Classify as HR, technical, behavioral, coding, or general.",
            "Use bullet points, not long paragraphs.",
            "Use STAR method for behavioral questions.",
            "For coding questions, include hints and edge cases.",
            "Add a confidence score from 0 to 1."
          ]
        })
      }
    ]
  });

  const raw = response.choices?.[0]?.message?.content || "{}";
  return normalizeAiResponse(JSON.parse(raw), question);
}

function extractLatestQuestion(transcript = "") {
  const cleaned = transcript.trim();
  if (!cleaned) return "No interview question detected yet.";

  const parts = cleaned
    .split(/(?<=[?.!])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const explicitQuestion = [...parts].reverse().find((part) => part.includes("?"));
  return explicitQuestion || parts.at(-1) || cleaned;
}

function normalizeAiResponse(data, question) {
  return {
    question: data.question || question,
    questionType: String(data.questionType || "general").toLowerCase(),
    answer: Array.isArray(data.answer) ? data.answer : [String(data.answer || "Clarify the question, then answer with a concise example.")],
    confidence: Number.isFinite(Number(data.confidence)) ? Number(data.confidence) : 0.72,
    codingHints: Array.isArray(data.codingHints) ? data.codingHints : []
  };
}

function fallbackAnswer(question, resumeText) {
  const lower = question.toLowerCase();
  const isBehavioral = /time when|tell me about|conflict|failure|challenge|leadership|example/.test(lower);
  const isCoding = /code|algorithm|complexity|function|debug|system design|api|database/.test(lower);
  const isTechnical = isCoding || /react|node|sql|javascript|typescript|cloud|security|architecture/.test(lower);
  const questionType = isBehavioral ? "behavioral" : isCoding ? "coding" : isTechnical ? "technical" : "general";
  const resumeLine = resumeText ? "Tie the answer to a concrete project, metric, or responsibility from your resume." : "Add one specific project, metric, or result from your experience.";

  const answer = isBehavioral
    ? [
        "Situation: Briefly set context for the challenge.",
        "Task: State your responsibility and what success meant.",
        "Action: Explain the 2-3 most important steps you personally took.",
        "Result: Quantify the outcome or describe what improved.",
        resumeLine
      ]
    : isCoding
      ? [
          "Restate the problem and confirm inputs, outputs, and constraints.",
          "Start with a simple correct approach, then optimize.",
          "Discuss time and space complexity.",
          "Mention edge cases such as empty input, duplicates, null values, and large data.",
          "Use clear variable names and test with a small example."
        ]
      : [
          "Answer directly in one sentence first.",
          "Support it with 2-3 relevant bullet points.",
          resumeLine,
          "Close with how this helps the team or role you are interviewing for."
        ];

  return {
    question,
    questionType,
    answer,
    confidence: resumeText ? 0.74 : 0.62,
    codingHints: isCoding
      ? ["Clarify constraints before coding.", "Talk through tradeoffs.", "Run through at least one edge case."]
      : []
  };
}
