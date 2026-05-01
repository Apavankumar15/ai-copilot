import pdfParse from "pdf-parse";

export async function extractResumeText(file) {
  if (!file) {
    throw new Error("No resume file was uploaded.");
  }

  const mime = file.mimetype || "";
  const originalName = file.originalname || "resume";

  if (mime.includes("pdf") || originalName.toLowerCase().endsWith(".pdf")) {
    const parsed = await pdfParse(file.buffer);
    return normalizeText(parsed.text);
  }

  if (mime.startsWith("text/") || originalName.toLowerCase().endsWith(".txt")) {
    return normalizeText(file.buffer.toString("utf8"));
  }

  throw new Error("Unsupported resume format. Upload a PDF or text file.");
}

export function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 12000);
}
