"use client";

/**
 * Web Audio API synthesized audio notification chimes.
 * 100% in-browser synthesis with 0 network latency and 0 external file dependency.
 */

class ChatAudioManager {
  private audioCtx: AudioContext | null = null;
  private isMuted = false;
  private originalTitle = "";
  private titleFlashInterval: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.originalTitle = document.title || "NammaTech";
      const unlockAudio = () => {
        this.getContext();
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      };
      window.addEventListener("click", unlockAudio, { passive: true });
      window.addEventListener("keydown", unlockAudio, { passive: true });
      window.addEventListener("touchstart", unlockAudio, { passive: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Pleasant, high-tech two-tone incoming message chime (C5 -> E5)
   */
  public playIncoming() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Tone 1 (C5 - 523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Tone 2 (E5 - 659.25 Hz with slight delay for chime effect)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.08);
      gain2.gain.setValueAtTime(0, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.48);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Gentle tactile pop for sent messages
   */
  public playSent() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio context might be restricted
    }
  }

  /**
   * Flashes the browser tab title when a new message arrives while tab is inactive
   */
  public flashTitle(alertText = "💬 New Support Message!") {
    if (typeof window === "undefined") return;
    if (document.hasFocus()) return;

    if (document.title && !document.title.startsWith("🔔") && !document.title.startsWith("💬")) {
      this.originalTitle = document.title;
    }

    this.clearTitleFlash();
    let toggle = false;

    this.titleFlashInterval = setInterval(() => {
      document.title = toggle ? alertText : (this.originalTitle || "NammaTech");
      toggle = !toggle;
    }, 1000);

    const onFocus = () => {
      this.clearTitleFlash();
      window.removeEventListener("focus", onFocus);
    };
    window.addEventListener("focus", onFocus);
  }

  public clearTitleFlash() {
    if (this.titleFlashInterval) {
      clearInterval(this.titleFlashInterval);
      this.titleFlashInterval = null;
    }
    if (typeof window !== "undefined" && this.originalTitle) {
      document.title = this.originalTitle;
    }
  }
}

export const chatAudio = new ChatAudioManager();
