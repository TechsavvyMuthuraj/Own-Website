import React from "react";
import Link from "next/link";
import { FileText, ShieldAlert, CheckCircle2, Scale, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NammaTech - Legal Agreement & User Standards",
  description:
    "Terms of service, user agreement, download protocols, intellectual property guidelines, and disclaimer of warranties for NammaTech.",
  openGraph: {
    title: "Terms of Service | NammaTech",
    description: "Read the legally binding terms and conditions governing the use of NammaTech digital resources and software tools.",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-500">
          <Scale className="w-3.5 h-3.5" />
          <span>User Agreement &amp; Governance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Last Updated: September 20, 2026 &bull; Governing All Digital Resources, Software, 4K Wallpapers &amp; Educational Materials
        </p>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-8 text-sm text-[var(--muted-foreground)] leading-relaxed shadow-sm">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>1. Acceptance of Agreement</span>
          </h2>
          <p>
            By accessing, browsing, registering for an account, or downloading digital assets from <strong>NammaTech</strong> (<code>https://www.techsavvymuthuraj.dev</code>, founded and operated by <strong>Muthuraj C</strong>), you explicitly agree to be bound by these Terms of Service, our{" "}
            <Link href="/privacy-policy" className="text-amber-500 underline font-semibold">
              Privacy Policy
            </Link>
            , our{" "}
            <Link href="/cookie-policy" className="text-amber-500 underline font-semibold">
              Cookie Policy
            </Link>
            , and all applicable domestic and international laws and regulations.
          </p>
          <p>
            If you do not agree with any provision stated herein, you must immediately discontinue use of this platform and any software or digital files acquired through it.
          </p>
        </section>

        {/* Section 2: Intellectual Property & Software Licenses */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>2. Software Licenses &amp; Legitimate Distribution</span>
          </h2>
          <p>
            NammaTech is committed to honest, verified digital distribution. All software tools, developer packages, scripts, templates, and 4K wallpapers indexed or hosted on this platform are distributed pursuant to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Applicable open-source licenses (such as MIT, Apache 2.0, GNU GPL, BSD, or Creative Commons).</li>
            <li>Author or creator permissions and direct public repository distribution standards.</li>
            <li>Freeware / shareware redistribution rights provided by respective copyright holders.</li>
          </ul>
          <p className="text-xs">
            Users agree to respect the individual license agreements accompanying each downloaded package. Proprietary commercial software downloaded through developer external links remains the sole property of its respective creators.
          </p>
        </section>

        {/* Section 3: Third-Party Ads & Google AdSense */}
        <section className="space-y-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] text-amber-500">
            3. Third-Party Services &amp; Google AdSense Integration
          </h2>
          <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
            Our website displays advertisements served by third-party advertising partners, predominantly <strong>Google AdSense</strong> (<code>ca-pub-1960459798233871</code>).
          </p>
          <p className="text-xs leading-relaxed">
            Advertisements are clearly marked as &quot;Advertisement&quot; or &quot;Sponsored&quot;. NammaTech does not endorse or guarantee the claims made in third-party advertisements. Clicking an advertisement directs you to a third-party domain governed by that party&apos;s independent terms and privacy practices.
          </p>
        </section>

        {/* Section 4: Prohibited Conduct */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>4. Prohibited User Conduct</span>
          </h2>
          <p>
            When utilizing NammaTech, you agree not to engage in any of the following restricted activities:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Automated high-frequency scraping, extraction of download endpoints, or denial-of-service attempts.</li>
            <li>Bypassing or attempting to reverse-engineer download authentication tokens or secure API routes.</li>
            <li>Submitting malicious software, false DMCA claims, or spam through the contact and review systems.</li>
            <li>Simulating artificial clicks or impressions on advertisements, which violates Google AdSense program policies.</li>
            <li>Redistributing commercial or private files in violation of original creator terms.</li>
          </ul>
        </section>

        {/* Section 5: Disclaimer of Warranties */}
        <section className="space-y-3 p-5 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            5. Disclaimer of Warranties &amp; Limitation of Liability
          </h2>
          <p className="text-xs leading-relaxed uppercase tracking-wider font-semibold text-[var(--foreground)]">
            The platform and all downloadable materials are provided strictly on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis.
          </p>
          <p className="text-xs leading-relaxed">
            NammaTech makes no warranties, express or implied, regarding operating system compatibility, uninterrupted uptime, or fitness for a particular purpose. In no event shall NammaTech or its founder Muthuraj C be liable for any direct, indirect, incidental, or consequential damages resulting from the installation or usage of software obtained through this service.
          </p>
        </section>

        {/* Section 6: DMCA & Copyright Disputes */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            6. DMCA &amp; Intellectual Property Protection
          </h2>
          <p>
            We take copyright protection with the utmost seriousness. If you are a copyright owner or an authorized agent and believe content on NammaTech infringes upon your copyright, please review our{" "}
            <Link href="/dmca" className="text-amber-500 underline font-semibold">
              DMCA Policy
            </Link>{" "}
            and submit a takedown notification.
          </p>
        </section>

        {/* Section 7: Governing Law & Jurisdiction */}
        <section className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            7. Governing Law &amp; Contact Information
          </h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Tamil Nadu, India.
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Inquiries regarding these Terms of Service may be directed to{" "}
            <a href="mailto:techsavvy.muthuraj.dev@gmail.com" className="text-amber-500 hover:underline font-semibold">
              techsavvy.muthuraj.dev@gmail.com
            </a>{" "}
            or via our{" "}
            <Link href="/contact" className="text-amber-500 underline">
              Contact Page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
