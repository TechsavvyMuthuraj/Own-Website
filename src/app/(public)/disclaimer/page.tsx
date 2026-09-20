import React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | NammaTech - Software, Advertising & Content Notices",
  description:
    "Official disclaimer regarding software downloads, digital resources, Google AdSense advertisements, and external links on NammaTech.",
  openGraph: {
    title: "Disclaimer | NammaTech",
    description: "Read our official disclaimers concerning digital software downloads, third-party advertising, and external references.",
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-500">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Legal Notices &amp; Disclaimers</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
          Disclaimer
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Last Updated: September 20, 2026 &bull; Clear Transparency on Software Safety, Advertising, &amp; External Links
        </p>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-8 text-sm text-[var(--muted-foreground)] leading-relaxed shadow-sm">
        {/* Section 1: General Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            <span>1. General Educational &amp; Informational Purposes</span>
          </h2>
          <p>
            The information and software resources provided on <strong>NammaTech</strong> (<code>https://www.techsavvymuthuraj.dev</code>, founded by <strong>Muthuraj C</strong>) are intended for general technical, educational, and productivity purposes only.
          </p>
          <p>
            While we strive to keep information accurate, up to date, and verified, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability of the website or the information, products, or services contained on the site.
          </p>
        </section>

        {/* Section 2: Advertising & Google AdSense Disclaimer */}
        <section className="space-y-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] text-amber-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span>2. Advertising &amp; Google AdSense Transparency</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
            NammaTech is supported by digital advertising, including the <strong>Google AdSense</strong> program (Publisher ID: <code>ca-pub-1960459798233871</code>).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--muted-foreground)]">
            <li>Third-party advertisements are served dynamically by Google and other advertising networks.</li>
            <li>All advertisement placements are clearly demarcated with &quot;Advertisement&quot; or &quot;Sponsored&quot; labels.</li>
            <li>We do not place deceptive or disguised download buttons that mimic advertisements.</li>
            <li>The appearance of an advertisement on NammaTech does not constitute an endorsement or warranty of the advertised product, software, or service.</li>
          </ul>
        </section>

        {/* Section 3: Software Safety & User Responsibility */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>3. Software Downloads &amp; Verification Protocol</span>
          </h2>
          <p>
            We curate developer utilities, open-source binaries, and wallpapers with strict manual verification checks. However, computer architectures, dependencies, and operating systems vary widely.
          </p>
          <p>
            Users are strongly advised to perform their own antivirus and malware scans prior to running any executable software on their local operating systems. NammaTech will not be held responsible for system crashes, data corruption, or incompatibilities resulting from software installation.
          </p>
        </section>

        {/* Section 4: External Links Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-cyan-500" />
            <span>4. External Third-Party Links</span>
          </h2>
          <p>
            NammaTech may contain links to external third-party websites, developer GitHub repositories, or official mirrors that are not owned, operated, or maintained by NammaTech.
          </p>
          <p>
            Please note that we have no control over the nature, content, uptime, or privacy policies of those external websites. The inclusion of any links does not necessarily imply a recommendation or endorsement of the views expressed within them.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-4 border-t border-[var(--border)] space-y-2">
          <p className="text-xs">
            If you have questions about this disclaimer, please reach out directly at{" "}
            <a href="mailto:techsavvy.muthuraj.dev@gmail.com" className="text-amber-500 hover:underline font-semibold">
              techsavvy.muthuraj.dev@gmail.com
            </a>{" "}
            or via our{" "}
            <Link href="/contact" className="text-amber-500 font-semibold underline">
              Contact Page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
