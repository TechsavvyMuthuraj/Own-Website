"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, Check, AlertCircle, Loader2, Power, Wrench, Trash2, AlertTriangle, ShieldAlert, QrCode, Phone, Headphones } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function SettingsClient({ initialSettings }: { initialSettings: Record<string, any> }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [siteName, setSiteName] = useState(initialSettings.site_name || "NammaTech");
  const [siteDescription, setSiteDescription] = useState(
    initialSettings.site_description || "Trusted Digital Resources & Open-Source Software"
  );
  const [contactEmail, setContactEmail] = useState(
    initialSettings.contact_email || "support@yourdomain.com"
  );
  const [defaultCurrency, setDefaultCurrency] = useState(
    initialSettings.default_currency || "INR"
  );
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(
    initialSettings.maintenance_mode === true || initialSettings.maintenance_mode === "true"
  );
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  // Technical Support Team Configuration
  const [techSupportEmail, setTechSupportEmail] = useState(
    initialSettings.technical_support_email || "techsavvy.muthuraj.dev@gmail.com"
  );
  const [techSupportPhone, setTechSupportPhone] = useState(
    initialSettings.technical_support_phone || "+91 99448 75726"
  );
  const [techSupportWhatsApp, setTechSupportWhatsApp] = useState(
    initialSettings.technical_support_whatsapp || "919944875726"
  );
  const [techSupportHours, setTechSupportHours] = useState(
    initialSettings.technical_support_hours || "Mon–Sat, 9AM–6PM IST"
  );

  const [newDays, setNewDays] = useState(
    initialSettings.new_resource_threshold_days || "14"
  );
  const [updatedDays, setUpdatedDays] = useState(
    initialSettings.updated_resource_threshold_days || "14"
  );

  // UPI Payment Gateway Settings
  const initialPayment = initialSettings.payment_settings || {};
  const [upiId, setUpiId] = useState(initialPayment.upi_id || "muthurajc@slc");
  const [merchantName, setMerchantName] = useState(
    initialPayment.merchant_name || "NammaTech Digital / Muthuraj C"
  );
  const [receiverPhone, setReceiverPhone] = useState(
    initialPayment.receiver_phone || "+91 99448 75726"
  );

  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Instant 1-Click Maintenance Mode Toggle with Auto-Save
  const handleToggleMaintenance = async (nextVal: boolean) => {
    setMaintenanceMode(nextVal);
    setTogglingMaintenance(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance_mode: nextVal,
        }),
      });

      if (res.ok) {
        if (nextVal) {
          showToast({
            type: "warning",
            title: "Maintenance Mode Activated ⚠️",
            message: "All public visitors are now redirected to the maintenance screen. Admin routes remain accessible.",
            duration: 5000,
          });
        } else {
          showToast({
            type: "success",
            title: "Platform Is Live! 🟢",
            message: "Maintenance mode disabled. The website is now open to all public visitors.",
            duration: 5000,
          });
        }
        router.refresh();
      } else {
        const data = await res.json();
        setMaintenanceMode(!nextVal); // Rollback
        showToast({
          type: "error",
          title: "Update Failed",
          message: data.error || "Could not toggle maintenance mode.",
        });
      }
    } catch {
      setMaintenanceMode(!nextVal); // Rollback
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to communicate with settings server.",
      });
    } finally {
      setTogglingMaintenance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName.trim(),
          site_description: siteDescription.trim(),
          contact_email: contactEmail.trim(),
          technical_support_email: techSupportEmail.trim(),
          technical_support_phone: techSupportPhone.trim(),
          technical_support_whatsapp: techSupportWhatsApp.trim(),
          technical_support_hours: techSupportHours.trim(),
          default_currency: defaultCurrency,
          maintenance_mode: maintenanceMode,
          new_resource_threshold_days: Number(newDays) || 14,
          updated_resource_threshold_days: Number(updatedDays) || 14,
          payment_settings: {
            upi_id: upiId.trim(),
            merchant_name: merchantName.trim(),
            receiver_phone: receiverPhone.trim(),
          },
        }),
      });

      if (res.ok) {
        showToast({
          type: "success",
          title: "Settings Saved 🚀",
          message: "All platform configuration settings updated successfully.",
        });
        router.refresh();
      } else {
        const data = await res.json();
        showToast({
          type: "error",
          title: "Save Failed",
          message: data.error || "Failed to update platform settings.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "An unexpected network error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl space-y-6">
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Platform Name
          </label>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Platform Meta Description
          </label>
          <textarea
            rows={2}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              General Contact Email
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Default Currency
            </label>
            <input
              type="text"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
            />
          </div>
        </div>

        {/* ── Technical Support Team & Help Desk Configuration ── */}
        <div className="p-5 rounded-2xl border border-sky-500/20 bg-sky-500/5 space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Headphones className="w-4 h-4" />
            <span>Technical Support Team &amp; Helpline Configuration</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Configure the official technical support email, direct phone/helpline, WhatsApp channel, and availability hours shown to users across the technical support dashboard and contact pages.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Technical Support Team Email
              </label>
              <input
                type="email"
                required
                value={techSupportEmail}
                onChange={(e) => setTechSupportEmail(e.target.value)}
                placeholder="techsavvy.muthuraj.dev@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Technical Helpline / Support Phone
              </label>
              <input
                type="text"
                value={techSupportPhone}
                onChange={(e) => setTechSupportPhone(e.target.value)}
                placeholder="+91 91764 43726"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                WhatsApp Direct Number / Link
              </label>
              <input
                type="text"
                value={techSupportWhatsApp}
                onChange={(e) => setTechSupportWhatsApp(e.target.value)}
                placeholder="919944875726"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Support Team Working Hours
              </label>
              <input
                type="text"
                value={techSupportHours}
                onChange={(e) => setTechSupportHours(e.target.value)}
                placeholder="Mon–Sat, 9AM–6PM IST"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              &quot;NEW&quot; Badge Threshold (Days)
            </label>
            <input
              type="number"
              value={newDays}
              onChange={(e) => setNewDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              &quot;UPDATED&quot; Badge Threshold (Days)
            </label>
            <input
              type="number"
              value={updatedDays}
              onChange={(e) => setUpdatedDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
            />
          </div>
        </div>

        {/* Maintenance mode instant toggle */}
        <div
          className={`p-5 rounded-2xl border transition-all duration-300 ${
            maintenanceMode
              ? "bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100 shadow-sm"
              : "bg-[var(--secondary)]/60 border-[var(--border)]"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  Platform Maintenance Mode
                </h4>
                {maintenanceMode ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 animate-pulse">
                    ACTIVE (VISITORS REDIRECTED)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    PLATFORM ONLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-lg leading-relaxed">
                When activated, all public visitors are immediately redirected to the maintenance page. Admin routes remain accessible. Auto-saves instantly upon toggle.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {togglingMaintenance && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  disabled={togglingMaintenance}
                  onChange={(e) => handleToggleMaintenance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6.5 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)]/60 flex flex-wrap items-center gap-4 text-xs">
            <a
              href="/maintenance"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--primary)] hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>View Maintenance Screen</span>
              <span>↗</span>
            </a>
            <span className="text-[var(--muted-foreground)]">•</span>
            <a
              href="/?admin_preview=true"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium inline-flex items-center gap-1"
            >
              <span>Preview Live Site as Admin</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── UPI Payment Gateway & Receiver Configuration ── */}
      <div className="p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Active UPI Gateway &amp; Settlement Routing
            </h2>
            <p className="text-xs text-neutral-400">
              Configure default UPI ID, payee name, and merchant receiver phone number across the platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-200">
              Active UPI ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. muthurajc@slc"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-200">
              Merchant / Business Name
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. NammaTech Digital / Muthuraj C"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Receiver Phone Number</span>
            </label>
            <input
              type="text"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              placeholder="e.g. +91 91764 43726"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving Settings...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save General Settings</span>
          </>
        )}
      </button>
    </form>

    {/* ── Danger Zone: Factory Reset & Wipe Platform Data ── */}
    <div className="mt-12 pt-8 border-t-2 border-red-500/20">
      <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5 dark:bg-red-950/20 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold text-red-600 dark:text-red-400">
                Danger Zone: Factory Reset & Wipe Platform Data
              </h3>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
              Permanently erase all catalog resources, downloads, order history, payment records, messages, and coupon logs in one click to start completely fresh. Admin accounts and critical system configurations will be safely preserved.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setResetConfirmText("");
              setShowResetModal(true);
            }}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-all shadow-sm shadow-red-600/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe All Data & Reset</span>
          </button>
        </div>
      </div>
    </div>

    {/* ── Reset Confirmation Modal ── */}
    {showResetModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[var(--card)] border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--foreground)]">
                Confirm Platform Data Wipe
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                This action is <strong className="text-red-500">irreversible</strong>. All resources, orders, payment history, customer requests, and logs will be permanently deleted from the database.
              </p>
            </div>
          </div>

          <div className="bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 p-3.5 rounded-xl space-y-2">
            <p className="text-xs font-medium text-[var(--foreground)]">
              To confirm this factory reset, type <span className="font-mono font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">RESET</span> below:
            </p>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Type RESET to confirm"
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isResetting}
              onClick={() => {
                setShowResetModal(false);
                setResetConfirmText("");
              }}
              className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={resetConfirmText !== "RESET" || isResetting}
              onClick={async () => {
                setIsResetting(true);
                try {
                  const res = await fetch("/api/admin/system/reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ confirmation: "RESET" }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    showToast({
                      type: "error",
                      title: "Reset Failed",
                      message: data.error || "Failed to wipe platform data",
                    });
                  } else {
                    showToast({
                      type: "success",
                      title: "Platform Reset Complete ✨",
                      message: data.message || "All platform data was erased successfully. Ready for fresh products!",
                      duration: 6000,
                    });
                    setShowResetModal(false);
                    router.refresh();
                  }
                } catch (err: any) {
                  showToast({
                    type: "error",
                    title: "Network Error",
                    message: err?.message || "Failed to communicate with reset endpoint",
                  });
                } finally {
                  setIsResetting(false);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Erasing All Data...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Wipe All Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
