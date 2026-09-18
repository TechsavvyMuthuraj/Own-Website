"use client";

import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";

interface UpiQrCardProps {
  amount: number;
  orderNumber: string;
  upiId?: string;
  payeeName?: string;
  onConfirmPayment: (utr: string) => Promise<void>;
  isProcessing?: boolean;
}

export function UpiQrCard({
  amount,
  orderNumber,
  upiId = "muthurajc@slc",
  payeeName = "Techsavvy Muthuraj",
  onConfirmPayment,
  isProcessing = false,
}: UpiQrCardProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [activeTab, setActiveTab] = useState<"QR" | "APPS">("QR");

  // Construct standard universal UPI URI
  const formattedAmount = Math.max(0, amount).toFixed(2);
  const note = `Order ${orderNumber}`;
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Generate dynamic QR code whenever amount or orderNumber changes
  const generateQR = useCallback(async () => {
    try {
      const dataUrl = await QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 1.5,
        color: {
          dark: "#0B0C10",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("QR Code generation error:", err);
      // Fallback to static uploaded image if offline or generator fails
      setQrCodeDataUrl("/images/upi-qr.png");
    }
  }, [upiUri]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleAppPay = (app: "gpay" | "phonepe" | "paytm" | "any") => {
    // Mobile Intent URLs with exact amount and merchant ID
    let targetUri = upiUri;
    if (app === "phonepe") {
      targetUri = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else if (app === "paytm") {
      targetUri = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else if (app === "gpay") {
      targetUri = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    }

    // Try opening the specific app, fall back to universal UPI URI
    window.location.href = targetUri;
    setTimeout(() => {
      window.location.href = upiUri;
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPayment(utrNumber.trim());
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200">
      {/* 1. Header & Price Badge */}
      <div className="space-y-1.5 w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Instant UPI Payment</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
          Pay with Any UPI App
        </h2>

        {/* Dynamic Amount Banner */}
        <div className="py-2.5 px-4 rounded-xl bg-gradient-to-b from-[var(--secondary)]/70 via-[var(--card)] to-[var(--card)] border border-[var(--border)] shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Total Payable Amount
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#FD1843] tracking-tight">
            ₹{formattedAmount}
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Scan below to automatically fill this exact amount in your app.
          </p>
        </div>
      </div>

      {/* 2. Mode Selector: QR Code vs Mobile Direct Apps */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--secondary)]/80 border border-[var(--border)] w-full">
        <button
          type="button"
          onClick={() => setActiveTab("QR")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "QR"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-[#FD1843]" />
          <span>Scan Dynamic QR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("APPS")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "APPS"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
          <span>Pay via Mobile App</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === "QR" ? (
        <div className="w-full flex flex-col items-center justify-center space-y-2">
          {/* Glowing QR Container */}
          <div className="relative p-3 sm:p-4 rounded-2xl bg-white border-2 border-[#FD1843]/40 shadow-xl shadow-[#FD1843]/15 transition-transform hover:scale-[1.01]">
            {/* Subtle animated scan beam */}
            <div className="absolute inset-x-3 h-1 bg-gradient-to-r from-transparent via-[#FD1843] to-transparent rounded-full animate-scan-line pointer-events-none" />

            {qrCodeDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeDataUrl}
                alt={`Scan to pay ₹${formattedAmount} via UPI`}
                width={180}
                height={180}
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-xl mx-auto block"
              />
            ) : (
              <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center bg-gray-50 rounded-xl">
                <Loader2 className="w-7 h-7 animate-spin text-[#FD1843]" />
              </div>
            )}

            {/* Bottom QR pill */}
            <div className="mt-1.5 text-center">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#FD1843]" />
                Auto-Price: ₹{formattedAmount}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)] max-w-xs">
            Open PhonePe, Google Pay, Paytm, BHIM, or any UPI banking app and scan this QR.
          </p>
        </div>
      ) : (
        /* Mobile App 1-Click Launchers */
        <div className="w-full space-y-3">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">
            Tap your preferred app below. It will open directly with amount{" "}
            <strong className="text-[var(--foreground)]">₹{formattedAmount}</strong> prefilled:
          </p>

          <button
            type="button"
            onClick={() => handleAppPay("gpay")}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--foreground)] font-semibold text-xs transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                G
              </span>
              <span>Google Pay</span>
            </div>
            <span className="text-[11px] text-[var(--muted-foreground)] group-hover:text-[var(--primary)] flex items-center gap-1">
              Pay ₹{formattedAmount} <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAppPay("phonepe")}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--foreground)] font-semibold text-xs transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-sm">
                Pe
              </span>
              <span>PhonePe</span>
            </div>
            <span className="text-[11px] text-[var(--muted-foreground)] group-hover:text-[var(--primary)] flex items-center gap-1">
              Pay ₹{formattedAmount} <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAppPay("paytm")}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--foreground)] font-semibold text-xs transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-sm">
                PT
              </span>
              <span>Paytm</span>
            </div>
            <span className="text-[11px] text-[var(--muted-foreground)] group-hover:text-[var(--primary)] flex items-center gap-1">
              Pay ₹{formattedAmount} <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAppPay("any")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-xs hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25"
          >
            <Zap className="w-4 h-4" />
            <span>Open in Any UPI App</span>
          </button>
        </div>
      )}

      {/* 4. Copy UPI ID Widget */}
      <div className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--secondary)]/60 border border-[var(--border)] flex items-center justify-between gap-2.5">
        <div className="text-left">
          <span className="block text-[9px] uppercase font-bold text-[var(--muted-foreground)]">
            Official UPI ID
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-[var(--foreground)] select-all">
            {upiId}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyUpiId}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] transition-all shadow-xs active:scale-95"
          title="Copy UPI ID"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* 5. UTR / Payment Reference Confirmation Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-2.5 pt-1">
        <div className="text-left">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-[var(--foreground)]">
              UTR / Transaction Ref (12 Digits) <span className="text-[#FD1843]">*</span>
            </label>
            {utrNumber.length > 0 && (
              <span
                className={`text-[10px] font-mono font-bold ${
                  utrNumber.length === 12 ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {utrNumber.length}/12
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={12}
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="Enter 12-digit UTR from your UPI app"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] shadow-inner"
            />
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
            Check PhonePe, GPay, or Paytm transaction receipt for the 12-digit UTR number.
          </p>
        </div>

        <button
          type="submit"
          disabled={isProcessing || utrNumber.length !== 12}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Payment...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>I Have Paid ₹{formattedAmount} • Unlock Download</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
