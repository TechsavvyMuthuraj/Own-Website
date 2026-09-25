"use client";

let audioCtx: AudioContext | null = null;
let clickAudioBuffer: AudioBuffer | null = null;
let isAudioBufferLoading = false;
const fallbackAudioPool: HTMLAudioElement[] = [];
let soundEnabled = true;
let lastClickTime = 0;

const CLICK_SOUND_URL = "/sounds/click.mp3";

// Helper: Convert base64 data URL to ArrayBuffer in browser
function base64ToArrayBuffer(base64Data: string): ArrayBuffer {
  const binaryString = window.atob(base64Data.replace(/^data:audio\/\w+;base64,/, ""));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Pre-decode audio buffer lazily: tries static asset first, falls back to dynamic chunk import
async function initClickBuffer() {
  if (typeof window === "undefined" || clickAudioBuffer || isAudioBufferLoading) return;
  isAudioBufferLoading = true;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const res = await fetch(CLICK_SOUND_URL);
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      clickAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
    }
  } catch {
    // Graceful fallback to HTMLAudioElement pool
  } finally {
    isAudioBufferLoading = false;
  }
}

// Client initialization
if (typeof window !== "undefined") {
  // Ensure sound is active by default
  soundEnabled = true;

  // Initialize a pool of pre-buffered HTMLAudioElements
  try {
    for (let i = 0; i < 4; i++) {
      const audio = new Audio();
      audio.src = CLICK_SOUND_URL;
      audio.preload = "auto";
      audio.volume = 1.0;
      fallbackAudioPool.push(audio);
    }
  } catch {
    // Non-blocking
  }

  // Pre-decode on first user touch/pointer/key
  const primeAudio = () => {
    initClickBuffer();
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener("pointerdown", primeAudio);
    window.removeEventListener("keydown", primeAudio);
  };
  window.addEventListener("pointerdown", primeAudio, { once: true, passive: true });
  window.addEventListener("keydown", primeAudio, { once: true, passive: true });
}

/**
 * Play the custom community click sound instantly with zero latency
 */
export function playClickSound() {
  if (!soundEnabled) return;

  // Debounce ultra-fast micro jitter (30ms)
  const nowMs = Date.now();
  if (nowMs - lastClickTime < 30) return;
  lastClickTime = nowMs;

  try {
    const ctx = getAudioContext();

    // Unlock context if suspended
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // 1. High-Fidelity Web Audio Buffer playback
    if (ctx && clickAudioBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = clickAudioBuffer;
      const gain = ctx.createGain();
      gain.gain.value = 1.0; // Clear, audible volume
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
      return;
    }

    // 2. High-speed HTMLAudioElement pool playback
    if (fallbackAudioPool.length > 0) {
      const audio = fallbackAudioPool.find((a) => a.paused || a.ended) || fallbackAudioPool[0];
      audio.currentTime = 0;
      audio.volume = 1.0;
      audio.play().catch(() => {
        // Retry with direct instance if needed
        const direct = new Audio(CLICK_SOUND_URL);
        direct.volume = 1.0;
        direct.play().catch(() => {});
      });

      if (!clickAudioBuffer && !isAudioBufferLoading) {
        initClickBuffer();
      }
      return;
    }

    // 3. Direct audio fallback
    const directAudio = new Audio(CLICK_SOUND_URL);
    directAudio.volume = 1.0;
    directAudio.play().catch(() => {});
  } catch {
    // Autoplay fallback gracefully
  }
}

/**
 * Play a soft bubble pop sound (for tabs, filters, chips)
 */
export function playPopSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.04);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.048);
  } catch {
    // Fallback
  }
}

/**
 * Play a positive two-tone confirmation chime
 */
export function playSuccessSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now + 0.07); // G5
    gain2.gain.setValueAtTime(0.08, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.19);
  } catch {
    // Fallback
  }
}

export function playMicStartSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {}
}

export function playMicEndSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch {}
}

export function playMessageChimeSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.09, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, now + 0.08); // B5
    gain2.gain.setValueAtTime(0.07, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.23);
  } catch {}
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (typeof window !== "undefined") {
    localStorage.setItem("namatech_sound_enabled", enabled ? "true" : "false");
  }
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled);
  if (soundEnabled) {
    playClickSound();
  }
  return soundEnabled;
}

