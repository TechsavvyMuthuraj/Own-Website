"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Globe } from "lucide-react";
import { playMicStartSound, playMicEndSound } from "@/lib/sound";

interface VoiceSearchButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
}

export function VoiceSearchButton({
  onTranscript,
  className = "",
}: VoiceSearchButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<"en-IN" | "ta-IN">("en-IN");
  const [interimText, setInterimText] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const infoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showInfo = (msg: string, durationMs = 3500) => {
    if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
    setInfoMessage(msg);
    infoTimerRef.current = setTimeout(() => {
      setInfoMessage(null);
    }, durationMs);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setInterimText("");
    playMicEndSound();
  };

  const startListening = async () => {
    if (!isSupported) {
      showInfo("Voice search not supported in this browser.", 3000);
      return;
    }

    setInfoMessage(null);
    setInterimText("");

    // Pre-flight check / trigger native browser prompt if needed
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release microphone hardware track so recognition engine can attach
        testStream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
          showInfo("Microphone blocked. Click 🔒/🎚 in address bar & set Mic to Allow.", 4500);
          return;
        }
      }
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        playMicStartSound();
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalTranscript.trim()) {
          setIsListening(false);
          setInterimText("");
          playMicEndSound();
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setInterimText("");
        playMicEndSound();
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          showInfo("Microphone blocked. Click 🔒/🎚 in address bar & set Mic to Allow.", 4500);
        } else if (event.error === "no-speech") {
          showInfo("No speech detected. Tap mic and speak.", 2500);
        } else {
          showInfo("Voice search stopped. Tap to speak.", 2500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      showInfo("Tap mic to retry voice search.", 2500);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
    };
  }, []);

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLang = lang === "en-IN" ? "ta-IN" : "en-IN";
    setLang(nextLang);
    if (isListening) {
      stopListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`}>
      {/* Tamil / English Toggle Pill */}
      <button
        type="button"
        onClick={toggleLanguage}
        title={`Voice Language: ${lang === "en-IN" ? "English (India)" : "Tamil (தமிழ்)"}. Click to switch.`}
        className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
      >
        <Globe className="w-2.5 h-2.5" />
        {lang === "en-IN" ? "EN" : "தமிழ்"}
      </button>

      {/* Voice Mic Trigger Button */}
      <button
        type="button"
        id="voice-search-mic-btn"
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? "Stop listening" : "Start voice search"}
        className={`relative p-1.5 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
          isListening
            ? "bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.7)] animate-pulse scale-105 ring-2 ring-rose-400"
            : "text-[var(--muted-foreground)] hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 active:scale-95"
        }`}
        title={isListening ? "Listening... Tap to stop" : "Tap to speak in English or தமிழ்"}
      >
        {isListening ? (
          <div className="flex items-center gap-0.5 px-0.5">
            <span className="w-1 h-3.5 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-2.5 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Floating Listening Feedback Bubble */}
      {isListening && (
        <div className="absolute right-0 top-full mt-2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-black/90 dark:bg-zinc-900/95 border border-rose-500/30 text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-semibold text-white">
            {lang === "ta-IN" ? "பேசுங்கள்..." : "Listening..."}
          </span>
          {interimText ? (
            <span className="text-amber-300 max-w-[180px] truncate">&quot;{interimText}&quot;</span>
          ) : (
            <span className="text-zinc-400 text-[11px]">
              {lang === "ta-IN" ? "தமிழில் பேசுங்கள்" : "Speak app or movie name"}
            </span>
          )}
        </div>
      )}

      {/* Info message tooltip */}
      {infoMessage && (
        <div
          role="status"
          onClick={() => {
            if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
            setInfoMessage(null);
          }}
          className="absolute right-0 top-full mt-2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-zinc-950/95 dark:bg-black/95 border border-amber-500/40 text-amber-300 text-[11px] shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 cursor-pointer flex items-center gap-1.5 hover:bg-zinc-900 transition-colors"
          title="Click to dismiss"
        >
          <span>{infoMessage}</span>
          <span className="text-zinc-500 hover:text-white text-[10px] ml-1 font-bold">✕</span>
        </div>
      )}
    </div>
  );
}
