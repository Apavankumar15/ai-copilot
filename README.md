# AI Interview Copilot

AI Interview Copilot is a visible real-time assistant for interview practice and learning support. It listens through the browser, displays a live transcript, and generates concise answer suggestions that can be tailored with resume context.

This project does not hide itself from screen sharing or attempt to bypass monitoring. It is intended to be used transparently.

## Features

- React + Tailwind dark dashboard UI
- Browser microphone capture through the Web Speech API
- Live transcript and AI suggestion panels
- Resume upload for `.txt` and `.pdf` files
- Express API with `/transcribe`, `/generate-answer`, and `/upload-resume`
- WebSocket channel for live suggestion updates
- OpenAI integration when `OPENAI_API_KEY` is configured
- Local fallback suggestions when no API key is present
- STAR formatting for behavioral questions
- Coding-question hints and confidence score

## Folder Structure

```text
ai-interview-copilot/
|-- client/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- components/
|   |   |-- hooks/
|   |   `-- services/
|   |-- index.html
|   |-- package.json
|   `-- tailwind.config.js
|-- server/
|   |-- src/
|   |   |-- index.js
|   |   |-- openai.js
|   |   |-- resume.js
|   |   `-- sessionStore.js
|   |-- package.json
|   `-- .env.example
|-- package.json
`-- README.md
```

## Prerequisites

- Node.js 18 or newer
- Chrome or another Chromium browser for speech recognition
- Optional: an OpenAI API key

## Setup

```bash
npm install
cp server/.env.example server/.env
```

Add your API key to `server/.env` if you want GPT-powered answers:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

Run the app:

```bash
npm run dev
```

Open the client at:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:4000
```

## Usage

1. Upload a resume as a `.txt` or `.pdf` file.
2. Click **Start Interview Mode** and allow microphone access.
3. Ask or receive interview questions out loud.
4. Review live transcript text and structured answer suggestions.
5. Use the manual prompt box when speech recognition is unavailable.

## API

### `POST /upload-resume`

Multipart form field: `resume`

Returns extracted resume text metadata and stores the text in the current temporary session.

### `POST /generate-answer`

```json
{
  "transcript": "Tell me about a time you handled conflict.",
  "sessionId": "browser-session-id"
}
```

Returns:

```json
{
  "questionType": "behavioral",
  "answer": ["Situation: ...", "Task: ..."],
  "confidence": 0.86,
  "codingHints": []
}
```

### `POST /transcribe`

Accepts text in the basic version and echoes it into the session transcript. This endpoint is included so the app can be extended to Whisper-based audio upload later.

## Notes

- The basic version uses the browser Web Speech API, so no paid transcription dependency is required.
- PDF text extraction uses `pdf-parse`, an open-source package.
- Session data is stored in memory and cleared when the server restarts.
- Keep API keys only in `server/.env`; never expose them in the browser.
