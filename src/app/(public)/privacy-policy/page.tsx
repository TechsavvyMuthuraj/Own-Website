import React from "react";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how NammaTech protects user privacy, telemetry standards, and download logs.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Last updated: September 2026
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            1. Minimal Data Collection Principle
          </h2>
          <p>
            NammaTech operates on a strict privacy-conscious model. We collect only what is strictly necessary to deliver digital resources, process payments, and protect server infrastructure from automated denial-of-service attacks.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            2. Information We Collect
          </h2>
          <p>
            When you register, we store your email address and authentication credentials handled securely through Supabase Auth. We do not store raw payment card or banking details; all payment processing is handled directly by verified payment gateways.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            3. Download & Event Logging
          </h2>
          <p>
            To monitor link health and prevent abuse, we log timestamped download events. IP addresses are hashed using SHA-256 and truncated so they cannot be reverse-engineered to identify individual browsing identities.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            4. No Third-Party Data Brokering
          </h2>
          <p>
            We do not sell, rent, or trade your personal information with data brokers or marketing affiliates under any circumstances.
          </p>
        </section>
      </div>
    </div>
  );
}
