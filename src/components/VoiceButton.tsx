"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type VoiceButtonProps = {
  onResult: (text: string) => void;
  disabled: boolean;
};

type VoiceState = "idle" | "recording" | "processing";

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
};

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

type VoiceSupportState = "unknown" | "supported" | "unsupported";

function getVoiceSupportState(): VoiceSupportState {
  return getSpeechRecognition() ? "supported" : "unsupported";
}

function subscribeToVoiceSupport() {
  return () => {};
}

export default function VoiceButton({ onResult, disabled }: VoiceButtonProps) {
  const supportState = useSyncExternalStore(
    subscribeToVoiceSupport,
    getVoiceSupportState,
    () => "unknown" as VoiceSupportState,
  );
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function startRecording() {
    const SpeechRecognitionClass = getSpeechRecognition();

    if (!SpeechRecognitionClass || disabled) {
      return;
    }

    setError(null);

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setState("recording");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();

      if (transcript) {
        setState("processing");
        onResult(transcript);
      }

      setState("idle");
    };

    recognition.onerror = (event) => {
      setState("idle");

      if (event.error === "not-allowed") {
        setError("Izin mikrofon ditolak. Aktifkan akses mikrofon di browser.");
        return;
      }

      if (event.error !== "aborted") {
        setError("Rekaman gagal. Silakan coba lagi.");
      }
    };

    recognition.onend = () => {
      setState((current) => (current === "recording" ? "idle" : current));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setState("idle");
  }

  if (supportState === "unknown") {
    return null;
  }

  if (supportState === "unsupported") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <MicOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Input suara belum didukung di browser ini. Gunakan Chrome di
            Android/desktop untuk rekam tilawah.
          </p>
        </div>
      </div>
    );
  }

  const isRecording = state === "recording";

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || state === "processing"}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
          isRecording
            ? "border-red-300 bg-red-50 text-red-700 animate-pulse dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
            : "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200 dark:hover:bg-teal-900/40"
        }`}
        aria-pressed={isRecording}
      >
        <Mic className="h-4 w-4" aria-hidden="true" />
        {state === "processing"
          ? "Memproses..."
          : isRecording
            ? "Berhenti rekam"
            : "Rekam tilawah"}
      </button>

      {error ? (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Baca penggalan ayat, lalu hasilnya akan otomatis dicari.
        </p>
      )}
    </div>
  );
}
