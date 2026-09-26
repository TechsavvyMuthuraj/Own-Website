"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  RotateCcw,
  Upload,
  X,
  CheckCircle2,
  ShieldAlert,
  Volume2,
} from "lucide-react";
import { playMicStartSound, playMicEndSound, playPopSound } from "@/lib/sound";

interface VoiceRecorderProps {
  onSendVoice: (audioUrl: string, durationSeconds: number) => void;
  disabled?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export function VoiceRecorder({
  onSendVoice,
  disabled = false,
  onRecordingStateChange,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionGrantedRecently, setPermissionGrantedRecently] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up stream & intervals on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Monitor browser permission changes dynamically
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.permissions || !navigator.permissions.query) {
      return;
    }

    let statusRef: PermissionStatus | null = null;
    try {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          statusRef = status;
          const handleChange = () => {
            if (status.state === "granted") {
              setShowPermissionModal(false);
              setErrorMessage(null);
              setPermissionGrantedRecently(true);
              setTimeout(() => setPermissionGrantedRecently(false), 4000);
            }
          };
          status.addEventListener("change", handleChange);
        })
        .catch(() => {
          // Some browsers don't support microphone query in permissions API
        });
    } catch {}

    return () => {
      if (statusRef) {
        try {
          statusRef.onchange = null;
        } catch {}
      }
    };
  }, []);

  const getAudioStream = async (): Promise<MediaStream> => {
    // Attempt 1: Advanced constraints (echo cancellation & noise suppression)
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      // If permission was strictly denied, rethrow immediately
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        throw err;
      }
      // Attempt 2: Fallback to basic audio stream (works on virtual drivers/basic hardware)
      console.warn("Retrying with simple audio constraints...", err);
      return await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    }
  };

  const startRecording = async () => {
    if (disabled || isRecording) return;
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage("Microphone API not supported in this browser. Please use Chrome/Edge or upload an audio file.");
        setShowPermissionModal(true);
        return;
      }

      const stream = await getAudioStream();

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
      onRecordingStateChange?.(true);
      setShowPermissionModal(false);
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
        setErrorMessage("Microphone access blocked. Click below to allow permission.");
        setShowPermissionModal(true);
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No microphone device found on your computer. You can upload an audio note instead.");
        setShowPermissionModal(true);
      } else {
        setErrorMessage("Could not start audio recording. Check microphone settings.");
        setShowPermissionModal(true);
      }
      cleanupStream();
      setIsRecording(false);
      onRecordingStateChange?.(false);
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
    onRecordingStateChange?.(false);
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
        onRecordingStateChange?.(false);
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
      onRecordingStateChange?.(false);
      setIsProcessing(false);
    }
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Upload existing voice or audio file fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result as string;
      // Probe audio duration
      const audio = new Audio();
      audio.src = base64Audio;
      audio.onloadedmetadata = () => {
        const dur = Math.round(audio.duration) || 5;
        onSendVoice(base64Audio, dur);
        setIsProcessing(false);
        setShowPermissionModal(false);
      };
      audio.onerror = () => {
        onSendVoice(base64Audio, 5);
        setIsProcessing(false);
        setShowPermissionModal(false);
      };
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage("Failed to read audio file.");
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (isRecording) {
    return (
      <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3 animate-in fade-in duration-200">
        {/* Live Recording Pulse & Wave Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>

          <span className="text-xs font-mono font-bold text-white shrink-0">
            {formatTimer(recordingSeconds)}
          </span>

          {/* Dancing Audio Waves */}
          <div className="flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2 h-4 sm:h-5 flex-1 min-w-0 overflow-hidden">
            {[40, 90, 60, 100, 75, 45, 85, 60, 95, 50, 80, 40].map((h, i) => (
              <span
                key={i}
                className={`w-0.5 sm:w-1 bg-rose-400 rounded-full animate-pulse ${i > 6 ? "hidden xs:inline-block" : "inline-block"}`}
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.3 + (i % 3) * 0.2}s`,
                }}
              />
            ))}
          </div>

          <span className="text-[10px] text-zinc-400 font-medium hidden md:inline shrink-0">
            Recording voice note...
          </span>
        </div>

        {/* Discard Voice Message */}
        <button
          type="button"
          onClick={cancelRecording}
          title="Discard recording"
          aria-label="Discard recording"
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-zinc-700/50 transition-all text-xs font-semibold cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0 min-h-[40px] min-w-[40px]"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">Cancel</span>
        </button>

        {/* Send Voice Message */}
        <button
          type="button"
          onClick={stopAndSend}
          disabled={isProcessing}
          title="Send voice note"
          aria-label="Send voice note"
          className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 flex-shrink-0 min-h-[40px]"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Send className="w-3.5 h-3.5 text-black" />
          )}
          <span className="font-bold">Send Voice</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-1 flex-shrink-0">
      <button
        type="button"
        onClick={startRecording}
        disabled={disabled}
        title="Record voice message"
        aria-label="Record voice note"
        className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-h-[38px] ${
          showPermissionModal
            ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
            : "bg-black/5 dark:bg-white/5 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 border-black/5 dark:border-white/10"
        }`}
      >
        <Mic className="w-4 h-4 text-amber-500" />
        <span className="hidden md:inline font-bold">Voice Note</span>
      </button>

      {/* Alternative upload voice audio file button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isProcessing}
        title="Upload recorded audio note from device"
        aria-label="Upload audio note"
        className="hidden sm:flex p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-amber-500/20 text-[var(--muted-foreground)] hover:text-amber-400 border border-black/5 dark:border-white/10 transition-all text-xs cursor-pointer active:scale-95 min-h-[38px] min-w-[38px] items-center justify-center"
      >
        <Upload className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm,.aac"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Permission Granted Confirmation Badge */}
      {permissionGrantedRecently && (
        <div className="fixed sm:absolute bottom-20 sm:bottom-full left-3 right-3 sm:left-auto sm:right-0 mb-2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl backdrop-blur-md flex items-center gap-1.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Microphone access allowed! Click Voice Note to record.</span>
        </div>
      )}

      {/* Permission Denied / Unlock Helper Modal Card */}
      {showPermissionModal && (
        <div className="fixed sm:absolute bottom-20 sm:bottom-full left-3 right-3 sm:left-auto sm:right-0 mb-3 z-50 max-w-sm rounded-2xl bg-zinc-950/98 text-white border border-amber-500/40 shadow-2xl shadow-black/90 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Allow Microphone Access
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowPermissionModal(false);
                setErrorMessage(null);
              }}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-zinc-300 space-y-2">
            <p className="leading-relaxed">
              Microphone access is currently blocked. Follow these 2 steps to unblock:
            </p>

            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  1
                </span>
                <span>
                  Tap the <strong>🎚 tune / 🔒 padlock icon</strong> in the URL bar.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  2
                </span>
                <span>
                  Set <strong>Microphone</strong> to <strong>Allow</strong>.
                </span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 italic">
              Mobile Tip: If using in-app browsers, open directly in Chrome or Safari.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={startRecording}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Audio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
