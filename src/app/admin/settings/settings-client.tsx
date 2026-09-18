"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, Check, AlertCircle, Loader2 } from "lucide-react";

export function SettingsClient({ initialSettings }: { initialSettings: Record<string, any> }) {
  const router = useRouter();

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
  const [maintenanceMode, setMaintenanceMode] = useState(
    initialSettings.maintenance_mode === true || initialSettings.maintenance_mode === "true"
  );
  const [newDays, setNewDays] = useState(
    initialSettings.new_resource_threshold_days || "14"
  );
  const [updatedDays, setUpdatedDays] = useState(
    initialSettings.updated_resource_threshold_days || "14"
  );

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName.trim(),
          site_description: siteDescription.trim(),
          contact_email: contactEmail.trim(),
          default_currency: defaultCurrency,
          maintenance_mode: maintenanceMode,
          new_resource_threshold_days: Number(newDays) || 14,
          updated_resource_threshold_days: Number(updatedDays) || 14,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Settings updated successfully.");
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to update settings.");
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-6">
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            Platform Name
          </label>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            Global Site Description (Default SEO)
          </label>
          <input
            type="text"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Support / Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Default Currency
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
            >
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
            </select>
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

        {/* Maintenance mode toggle */}
        <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-[var(--foreground)]">
              Platform Maintenance Mode
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              When activated, public visitors will see a maintenance notice while admin users retain console access.
            </p>
          </div>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400"
          />
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
            <span>Save Settings</span>
          </>
        )}
      </button>
    </form>
  );
}
