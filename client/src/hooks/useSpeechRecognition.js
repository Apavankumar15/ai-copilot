import { useEffect, useRef, useState } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useSpeechRecognition({ onFinalTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }

      setInterimTranscript(interim);
      if (finalText.trim()) onFinalTranscript(finalText.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error || "Speech recognition failed.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [onFinalTranscript]);

  const start = () => {
    setError("");
    if (!recognitionRef.current) {
      setError("Speech recognition is not available in this browser. Chrome is recommended.");
      return;
    }
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return {
    isSupported: Boolean(SpeechRecognition),
    isListening,
    interimTranscript,
    error,
    start,
    stop
  };
}
