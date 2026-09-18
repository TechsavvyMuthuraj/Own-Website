import React from "react";

export const metadata = {
  title: "Disclaimer",
  description: "General disclaimer regarding software downloads, external links, and verification status.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          Disclaimer
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Last updated: September 2026
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            1. Software Verification & Safety
          </h2>
          <p>
            While NammaTech verifies file integrity, developer hashes, and authentic release channels, we do not make unsubstantiated claims such as &quot;100% Virus Free&quot; without independent cryptographic verification. Users are encouraged to run local security and antivirus checks on any installed executables.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            2. External Links
          </h2>
          <p>
            Certain resources link directly to third-party developer websites or mirrors. NammaTech does not control or assume liability for content, software modifications, or privacy practices on external third-party sites.
          </p>
        </section>
      </div>
    </div>
  );
}
