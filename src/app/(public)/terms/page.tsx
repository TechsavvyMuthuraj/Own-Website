import React from "react";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing the use of NammaTech resources and services.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Last updated: September 2026
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or downloading resources from NammaTech, you agree to comply with these terms, all applicable laws, and the individual software licenses attached to respective downloadable files.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            2. Legitimate Distribution
          </h2>
          <p>
            All open-source, freeware, and commercial resources hosted or linked on this platform are distributed strictly in compliance with applicable author permissions, open-source licenses (such as GPL, MIT, Apache, BSD, or Creative Commons), or developer distribution agreements.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            3. User Conduct
          </h2>
          <p>
            Users agree not to attempt automated scraping, DDoS attacks, unauthorized access to private storage buckets, tampering with download token signatures, or redistribution of commercial resources beyond authorized entitlement limits.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            4. Limitation of Liability
          </h2>
          <p>
            NammaTech provides all software, assets, and tools &quot;as is&quot; without warranty of any kind, whether express or implied. Users assume full responsibility for software installation and compatibility on their target systems.
          </p>
        </section>
      </div>
    </div>
  );
}
