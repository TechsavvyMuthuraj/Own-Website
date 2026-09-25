"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Trash2, Send, Loader2, Square } from "lucide-react";
import { playMicStartSound, playMicEndSound, playPopSound } from "@/lib/sound";

interface VoiceRecorderProps {
  onSendVoice: (audioUrl: string, durationSeconds: number) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onSendVoice, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (disabled || isRecording) return;
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage("Microphone not supported in this browser.");
        setTimeout(() => setErrorMessage(null), 3500);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Determine best audio mime type supported
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else {
          mimeType = "";
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // collect chunks every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);
      playMicStartSound();

      // Start duration counter
      const startTimestamp = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimestamp) / 1000);
        setRecordingSeconds(elapsed);

        // Auto-stop at 2 minutes max
        if (elapsed >= 120) {
          stopAndSend();
        }
      }, 1000);
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Microphone access denied. Please allow microphone in browser.");
      } else {
        setErrorMessage("Could not start audio recording. Check microphone.");
      }
      setTimeout(() => setErrorMessage(null), 4000);
      cleanupStream();
    }
  };

  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    audioChunksRef.current = [];
    cleanupStream();
    setIsRecording(false);
    setRecordingSeconds(0);
    playPopSound();
  };

  const stopAndSend = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsProcessing(true);
    playMicEndSound();

    const mediaRecorder = mediaRecorderRef.current;
    const duration = Math.max(1, recordingSeconds);

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      // Convert audio blob to base64 Data URL for real-time broadcast and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        onSendVoice(base64Audio, duration);
        setIsRecording(false);
        setIsProcessing(false);
        setRecordingSeconds(0);
        audioChunksRef.current = [];
        cleanupStream();
      };
      reader.readAsDataURL(audioBlob);
    };

    try {
      mediaRecorder.stop();
    } catch {
      cleanupStream();
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-right-1 duration-200">
        {/* Live Recording Pulse & Wave Indicator */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-mono font-bold text-white">
            {formatTimer(recordingSeconds)}
          </span>

          {/* Dancing Audio Waves */}
          <div className="flex items-center gap-0.5 ml-2 h-4 flex-1">
            {[40, 90, 60, 100, 75, 45, 85, 60, 95, 50, 80, 40].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-rose-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.3 + (i % 3) * 0.2}s`,
                }}
              />
            ))}
          </div>

          <span className="text-[10px] text-zinc-400 hidden sm:inline">
            Recording voice message...
          </span>
        </div>

        {/* Discard Voice Message */}
        <button
          type="button"
          onClick={cancelRecording}
          title="Discard recording"
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700/50 transition-all text-xs font-semibold cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Cancel</span>
        </button>

        {/* Send Voice Message */}
        <button
          type="button"
          onClick={stopAndSend}
          disabled={isProcessing}
          title="Send voice note"
          className="p-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 flex-shrink-0"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send Voice</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={startRecording}
        disabled={disabled}
        title="Record voice message"
        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-amber-500/20 text-[var(--muted-foreground)] hover:text-amber-400 border border-black/5 dark:border-white/10 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
      >
        <Mic className="w-4 h-4 text-amber-500" />
        <span className="hidden sm:inline">Voice Note</span>
      </button>

      {errorMessage && (
        <div className="absolute right-0 bottom-full mb-2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-zinc-900 border border-rose-500/40 text-rose-300 text-[11px] shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
