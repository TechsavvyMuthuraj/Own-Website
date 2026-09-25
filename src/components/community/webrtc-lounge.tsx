"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Share2,
  Users,
  LogOut,
  Sparkles,
  Shield,
  Loader2,
  Maximize2,
  ExternalLink,
  Radio,
  Monitor,
  Activity,
  Volume2,
} from "lucide-react";
import { CommunityRole, CommunityPresenceUser } from "./community-types";
import { playMicStartSound, playMicEndSound, playPopSound } from "@/lib/sound";

interface WebRTCLoungeProps {
  roomName: string;
  userName: string;
  userRole: CommunityRole;
  userAvatar?: string | null;
  presenceUsers?: CommunityPresenceUser[];
}

export function WebRTCLounge({
  roomName,
  userName,
  userRole,
  userAvatar,
  presenceUsers = [],
}: WebRTCLoungeProps) {
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const safeRoomId = `nammatech-${roomName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const dedicatedMeetUrl = `https://meet.jit.si/${safeRoomId}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&userInfo.displayName=${encodeURIComponent(
    `${userName} [${userRole}]`
  )}`;

  // Clean up media streams and audio context on unmount
  const stopAllTracks = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, [stopAllTracks]);

  // Visualizer loop for drawing audio frequency wave
  const startAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWave = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 255) * 100));
        setAudioLevel(normalized);
        setIsSpeaking(normalized > 12);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;

            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, "rgba(245, 158, 11, 0.4)");
            gradient.addColorStop(1, "rgba(244, 63, 94, 0.9)");

            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

            x += barWidth;
          }
        }

        animationFrameRef.current = requestAnimationFrame(drawWave);
      };

      drawWave();
    } catch (e) {
      console.warn("Audio visualizer could not start:", e);
    }
  };

  // Join Native WebRTC Stage
  const joinNativeStage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera and microphone APIs are not supported in this browser.");
        setIsLoading(false);
        return;
      }

      // Request both Camera and Microphone
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err: any) {
        // Fallback to audio-only if camera is unavailable or denied
        console.warn("Video failed, trying audio-only:", err);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setIsVideoMuted(true);
      }

      localStreamRef.current = stream;

      setHasJoined(true);
      setIsLoading(false);
      playMicStartSound();

      // Attach stream to video element
      setTimeout(() => {
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
        }
        startAudioVisualizer(stream);
      }, 150);
    } catch (err: any) {
      setIsLoading(false);
      console.warn("Native WebRTC stage join error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone / Camera access was denied. Please allow device permissions in your browser.");
      } else {
        setError("Could not access media devices. Check your camera & microphone connections.");
      }
    }
  };

  const leaveStage = () => {
    stopAllTracks();
    setHasJoined(false);
    setIsScreenSharing(false);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsSpeaking(false);
    playMicEndSound();
  };

  // Toggle Microphone
  const toggleAudio = () => {
    if (!localStreamRef.current) return;
    const nextState = !isAudioMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextState;
    });
    setIsAudioMuted(nextState);
    if (nextState) {
      setIsSpeaking(false);
      setAudioLevel(0);
    }
    playPopSound();
  };

  // Toggle Camera Video
  const toggleVideo = async () => {
    if (!localStreamRef.current) return;
    const nextState = !isVideoMuted;

    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !nextState;
    });
    setIsVideoMuted(nextState);
    playPopSound();
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      playPopSound();
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert("Screen sharing is not supported on this browser/device.");
          return;
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        playPopSound();

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };

        setTimeout(() => {
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = screenStream;
          }
        }, 150);
      } catch (err) {
        console.warn("Screen share cancelled or failed:", err);
      }
    }
  };

  return (
    <div className="relative w-full h-[650px] sm:h-[720px] rounded-3xl overflow-hidden bg-[#07070a] border border-black/10 dark:border-white/10 flex flex-col shadow-2xl">
      {/* Top Stage Header Control Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
            <Video className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                NammaTech Live Stage
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                WEBRTC HD
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span>Channel: #{roomName}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Native Peer Audio & Video</span>
            </p>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2">
          {/* External Dedicated Meet Window */}
          <a
            href={dedicatedMeetUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open high-speed dedicated Jitsi Meet room in a new browser window"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Dedicated Window ↗</span>
          </a>

          {hasJoined && (
            <button
              type="button"
              onClick={leaveStage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all text-xs font-semibold cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Stage Stage Canvas */}
      <div className="relative flex-1 w-full h-full bg-[#050508] overflow-hidden flex items-center justify-center p-3 sm:p-5">
        {/* PRE-JOIN LOBBY SCREEN */}
        {!hasJoined ? (
          <div className="max-w-md w-full mx-auto p-6 sm:p-8 text-center space-y-6 z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative mx-auto w-20 h-20 rounded-3xl p-1 bg-gradient-to-tr from-amber-500/30 via-rose-500/20 to-cyan-500/30 ring-1 ring-white/10 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-[#0e0e14] flex items-center justify-center text-amber-400">
                <Radio className="w-10 h-10 animate-pulse text-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Live Community Audio & Video Stage
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Connect your microphone and camera to talk, share screens, stream tutorials, or join live community discussions.
              </p>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 max-w-xs mx-auto">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white truncate max-w-[130px]">{userName}</p>
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  {userRole}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
                {error}
              </p>
            )}

            {/* Join Action Buttons */}
            <div className="space-y-3 max-w-xs mx-auto">
              <button
                type="button"
                onClick={joinNativeStage}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-black font-black text-sm tracking-wide shadow-[0_8px_32px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Connecting Hardware...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Enter Live Stage</span>
                  </>
                )}
              </button>

              <a
                href={dedicatedMeetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Launch in Dedicated Jitsi App ↗</span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500 pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Browser-to-browser Encrypted
              </span>
              <span>•</span>
              <span>Instant Screen Sharing</span>
            </div>
          </div>
        ) : (
          /* ACTIVE LIVE WEBRTC STAGE VIEW */
          <div className="w-full h-full flex flex-col gap-3">
            {/* Upper Viewport: Screen Share or Primary Camera */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-[#0c0c12] border border-white/10 shadow-2xl flex items-center justify-center">
              {/* Screen Share Stream if Active */}
              {isScreenSharing ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Live Screen Share</span>
                  </div>
                </div>
              ) : (
                /* Primary Camera Video / Avatar Tile */
                <div className="relative w-full h-full flex items-center justify-center">
                  {!isVideoMuted ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                  ) : (
                    /* Video Off Fallback Avatar */
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div
                        className={`w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-black text-2xl flex items-center justify-center shadow-xl ring-4 ${
                          isSpeaking ? "ring-emerald-400 animate-pulse" : "ring-white/10"
                        }`}
                      >
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-bold text-white">{userName}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300">
                        Camera Off
                      </span>
                    </div>
                  )}

                  {/* Top Overlay Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-1.5 shadow-md">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSpeaking ? "bg-emerald-400 animate-ping" : "bg-emerald-400"
                        }`}
                      />
                      <span>{userName} (You)</span>
                    </span>

                    <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500 text-black shadow-xs">
                      {userRole}
                    </span>
                  </div>

                  {/* Audio Visualizer Wave Canvas Overlay (Bottom Left) */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                    <Volume2
                      className={`w-3.5 h-3.5 ${
                        isSpeaking ? "text-emerald-400 animate-bounce" : "text-zinc-500"
                      }`}
                    />
                    <canvas ref={canvasRef} width={80} height={20} className="w-20 h-5" />
                    <span className="text-[10px] font-mono text-zinc-400">{audioLevel}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom In-Stage Hardware Dock Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                {/* Mic Mute / Unmute */}
                <button
                  type="button"
                  onClick={toggleAudio}
                  title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer active:scale-95 flex items-center gap-2 ${
                    isAudioMuted
                      ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30 shadow-xs"
                      : "bg-white/10 hover:bg-white/15 text-white border-white/15 shadow-xs"
                  }`}
                >
                  {isAudioMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span className="text-xs font-bold hidden sm:inline">
                    {isAudioMuted ? "Unmute" : "Mute"}
                  </span>
                </button>

                {/* Camera Toggle */}
                <button
                  type="button"
                  onClick={toggleVideo}
                  title={isVideoMuted ? "Turn on camera" : "Turn off camera"}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer active:scale-95 flex items-center gap-2 ${
                    isVideoMuted
                      ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30"
                      : "bg-white/10 hover:bg-white/15 text-white border-white/15"
                  }`}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4 text-rose-400" /> : <Video className="w-4 h-4 text-amber-400" />}
                  <span className="text-xs font-bold hidden sm:inline">
                    {isVideoMuted ? "Start Cam" : "Stop Cam"}
                  </span>
                </button>

                {/* Screen Sharing Toggle */}
                <button
                  type="button"
                  onClick={toggleScreenShare}
                  title={isScreenSharing ? "Stop sharing screen" : "Share your screen"}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer active:scale-95 flex items-center gap-2 ${
                    isScreenSharing
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-white/10 hover:bg-white/15 text-white border-white/15"
                  }`}
                >
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold hidden sm:inline">
                    {isScreenSharing ? "Stop Share" : "Share Screen"}
                  </span>
                </button>
              </div>

              {/* Leave Stage Button */}
              <button
                type="button"
                onClick={leaveStage}
                className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/20 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Stage</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
