"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Upload,
  X,
  Volume2,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  Laptop,
  Smartphone,
} from "lucide-react";
import { playMicStartSound, playMicEndSound, playPopSound } from "@/lib/sound";

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted?: (stream: MediaStream) => void;
}

export function MicrophonePermissionModal({
  isOpen,
  onClose,
  onPermissionGranted,
}: MicrophonePermissionModalProps) {
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unknown">("unknown");
  const [testingMic, setTestingMic] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [browserType, setBrowserType] = useState<"chrome" | "firefox" | "safari" | "edge" | "other">("chrome");

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Detect browser
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("edg/")) {
      setBrowserType("edge");
    } else if (ua.includes("firefox")) {
      setBrowserType("firefox");
    } else if (ua.includes("safari") && !ua.includes("chrome")) {
      setBrowserType("safari");
    } else if (ua.includes("chrome")) {
      setBrowserType("chrome");
    } else {
      setBrowserType("other");
    }
  }, []);

  // Check initial permission status and listen for dynamic changes
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.permissions || !navigator.permissions.query) {
      return;
    }

    try {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          setPermissionState(status.state as any);
          const update = () => {
            setPermissionState(status.state as any);
            if (status.state === "granted") {
              setErrorMessage(null);
            }
          };
          status.addEventListener("change", update);
        })
        .catch(() => {
          setPermissionState("unknown");
        });
    } catch {}
  }, []);

  // Cleanup on unmount or close
  const cleanupStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setTestingMic(false);
    setMicVolume(0);
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupStream();
    }
  }, [isOpen]);

  // Request Microphone in any browser with direct user gesture
  const requestAccess = async () => {
    setErrorMessage(null);
    cleanupStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage("Microphone API is not supported in this browser. Please use Chrome, Edge, Firefox, or Safari.");
        return;
      }

      // Try with multi-tier audio constraints
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err: any) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          throw err;
        }
        // Fallback for simple audio without constraints
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;
      setPermissionState("granted");
      playMicStartSound();

      // Start real-time audio visualizer to prove mic is working
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const pollVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(pollVolume);
        };
        pollVolume();
        setTestingMic(true);
      } catch {
        setTestingMic(true);
      }

      if (onPermissionGranted) {
        onPermissionGranted(stream);
      }
    } catch (err: any) {
      console.warn("Microphone request error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setErrorMessage("Permission was denied. Please allow microphone in your browser settings as shown below.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No microphone device found on this computer. Please plug in a headset or microphone.");
      } else {
        setErrorMessage(err.message || "Could not access microphone. Please check system permissions.");
      }
      playPopSound();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-zinc-950 p-6 text-white shadow-2xl shadow-black/90 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Inbuilt Microphone Access
              </h3>
              <p className="text-xs text-zinc-400">
                Grant permission for Voice Notes &amp; WebRTC Live Calls
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                permissionState === "granted"
                  ? "bg-emerald-400 shadow-[0_0_12px_#34d399]"
                  : permissionState === "denied"
                  ? "bg-rose-500 shadow-[0_0_12px_#f43f5e]"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <div>
              <p className="text-xs font-bold text-white">
                {permissionState === "granted"
                  ? "Microphone Allowed & Active"
                  : permissionState === "denied"
                  ? "Microphone Blocked in Browser"
                  : "Microphone Access Required"}
              </p>
              <p className="text-[11px] text-zinc-400">
                {permissionState === "granted"
                  ? "Ready to speak in Community chat and live stages."
                  : permissionState === "denied"
                  ? "Follow the quick unblock guide below."
                  : "Click below to trigger the browser permission prompt."}
              </p>
            </div>
          </div>

          {testingMic && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span>Live: {micVolume}%</span>
            </div>
          )}
        </div>

        {/* Live Audio Level Meter when testing */}
        {testingMic && (
          <div className="space-y-1.5 p-3 rounded-2xl bg-black/60 border border-emerald-500/30">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Microphone Input Sound Wave</span>
              </span>
              <span>Speak to test</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-75"
                style={{ width: `${Math.max(5, micVolume)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error / Block Notification */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Browser-Specific Step-by-Step Instructions */}
        {permissionState !== "granted" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">How to unblock in your browser:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 uppercase tracking-wider">
                {browserType}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5 text-xs text-zinc-300 font-mono">
              {browserType === "chrome" || browserType === "edge" ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      1
                    </span>
                    <span>
                      Look at the top URL bar: Click the <strong>🎚 tune / 🔒 padlock icon</strong> on the left of the website address.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      2
                    </span>
                    <span>
                      Toggle <strong>Microphone</strong> switch to <strong>Allow (ON)</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      3
                    </span>
                    <span>
                      Click the yellow <strong>&quot;Grant Microphone Access&quot;</strong> button below.
                    </span>
                  </div>
                </>
              ) : browserType === "firefox" ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      1
                    </span>
                    <span>
                      Click the <strong>🔒 lock or 🎙️ mic icon</strong> on the left of the Firefox URL bar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      2
                    </span>
                    <span>
                      Clear the <strong>Blocked</strong> status for Microphone.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      3
                    </span>
                    <span>
                      Click <strong>Grant Microphone Access</strong> below and choose <strong>Allow</strong>.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      1
                    </span>
                    <span>
                      Open your browser site preferences for this website.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      2
                    </span>
                    <span>
                      Set <strong>Microphone</strong> permissions to <strong>Allow</strong>.
                    </span>
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-zinc-400 italic">
              Windows 10/11 Tip: Also verify Windows Settings &gt; Privacy &amp; security &gt; Microphone &gt; &quot;Let desktop apps access microphone&quot; is ON.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={requestAccess}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {permissionState === "granted" ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Re-Test Microphone</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Grant Microphone Access</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs transition-all cursor-pointer active:scale-95"
          >
            {permissionState === "granted" ? "Done" : "Dismiss"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MicrophonePermissionModal;
