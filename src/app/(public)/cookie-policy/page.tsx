import React from "react";
import Link from "next/link";
import { Cookie, ShieldAlert, CheckCircle2, ExternalLink, Sliders, Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | NammaTech - Transparency & Control",
  description:
    "Learn about the cookies and tracking technologies used on NammaTech, including essential, analytics, and Google AdSense advertising cookies.",
  openGraph: {
    title: "Cookie Policy | NammaTech",
    description: "Detailed overview of cookie categories, Google AdSense cookies, and instructions on how to manage your cookie preferences.",
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-500">
          <Cookie className="w-3.5 h-3.5" />
          <span>User Consent &amp; Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
          Cookie Policy
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Last Updated: September 20, 2026 &bull; Compliant with EU ePrivacy Directive, GDPR, and Google AdSense Guidelines
        </p>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-8 text-sm text-[var(--muted-foreground)] leading-relaxed shadow-sm">
        {/* What are Cookies? */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            <span>1. What Are Cookies?</span>
          </h2>
          <p>
            Cookies are small text files placed on your computer, smartphone, or tablet when you visit a website. They are widely used by web developers to make websites function efficiently, remember user preferences, maintain secure login states, and provide analytical data to site owners.
          </p>
          <p>
            This Cookie Policy explains what cookies we use on <strong>NammaTech</strong> (<code>https://www.techsavvymuthuraj.dev</code>), why we use them, and how you can exercise full control over their placement.
          </p>
        </section>

        {/* Categories of Cookies */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span>2. Categories of Cookies We Use</span>
          </h2>
          <p>
            We organize our cookies into clear, distinct classifications:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Essential */}
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] space-y-2">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strictly Necessary (Essential)</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                These cookies are required for fundamental security and navigation functions, such as authentication sessions, token protection, and shopping cart persistence. They cannot be turned off.
              </p>
            </div>

            {/* Performance & Analytics */}
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] space-y-2">
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Performance &amp; Analytics</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                These cookies collect aggregated, anonymous telemetry regarding page load latency, popular resources, and user journey paths, allowing us to enhance website speed and UX.
              </p>
            </div>

            {/* Preferences */}
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] space-y-2">
              <div className="flex items-center gap-2 text-purple-500 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Preferences &amp; Language</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Stores your theme choices (Dark/Light mode) and chosen language translations (via Google Translate widget) so you do not need to reconfigure them on every page reload.
              </p>
            </div>

            {/* Advertising & AdSense */}
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <Cookie className="w-4 h-4" />
                <span>Advertising (Google AdSense)</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Used by our advertising partner <strong>Google AdSense</strong> (<code>ca-pub-1960459798233871</code>) to serve non-intrusive, relevant contextual advertisements and monitor ad performance.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Google AdSense Cookie Table */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            3. Google AdSense &amp; Advertising Cookies Table
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[var(--border)] rounded-xl overflow-hidden">
              <thead className="bg-[var(--secondary)] text-[var(--foreground)] font-bold">
                <tr>
                  <th className="p-3 border-b border-[var(--border)]">Cookie Name</th>
                  <th className="p-3 border-b border-[var(--border)]">Provider</th>
                  <th className="p-3 border-b border-[var(--border)]">Purpose</th>
                  <th className="p-3 border-b border-[var(--border)]">Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--muted-foreground)]">
                <tr>
                  <td className="p-3 font-mono font-bold text-[var(--foreground)]">__gpi / _gads</td>
                  <td className="p-3">Google AdSense</td>
                  <td className="p-3">Records ad impressions and helps prevent fraudulent click activity.</td>
                  <td className="p-3">13 Months</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-[var(--foreground)]">_ga / _ga_*</td>
                  <td className="p-3">Google Analytics 4 (G-0PV54Y30XS)</td>
                  <td className="p-3">Distinguishes unique users and measures anonymous telemetry &amp; site usage.</td>
                  <td className="p-3">2 Years</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-[var(--foreground)]">IDE / DART</td>
                  <td className="p-3">Google DoubleClick</td>
                  <td className="p-3">Used to measure the efficacy of an ad campaign and serve contextual ads.</td>
                  <td className="p-3">12 Months</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-[var(--foreground)]">theme_mode</td>
                  <td className="p-3">NammaTech</td>
                  <td className="p-3">Preserves your preferred theme (Dark Mode / Light Mode).</td>
                  <td className="p-3">Permanent / Local</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-[var(--foreground)]">cookie_consent</td>
                  <td className="p-3">NammaTech</td>
                  <td className="p-3">Stores your cookie consent preference (Accepted / Customized).</td>
                  <td className="p-3">6 Months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How to Control and Disable Cookies */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>4. How Can You Control or Block Cookies?</span>
          </h2>
          <p>
            You have the absolute right to decide whether to accept or reject non-essential cookies. You can exercise your preferences at any time:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>Browser Controls:</strong> You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though access to some functionality (such as keeping account login sessions active) may be restricted.
            </li>
            <li>
              <strong>Google Ads Preferences:</strong> Manage personal ad settings via{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 underline font-semibold"
              >
                Google Ad Settings
              </a>
              .
            </li>
            <li>
              <strong>Industry Opt-Out Portals:</strong> Opt out of targeted ads via{" "}
              <a
                href="https://optout.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 underline font-semibold"
              >
                AboutAds (Digital Advertising Alliance)
              </a>{" "}
              or the{" "}
              <a
                href="https://www.youronlinechoices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 underline font-semibold"
              >
                European Interactive Digital Advertising Alliance (EDAA)
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Browser specific guide */}
        <section className="space-y-3 p-5 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Managing Cookies in Your Browser:
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--muted-foreground)]">
            <li>
              <strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Third-party cookies
            </li>
            <li>
              <strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Enhanced Tracking Protection
            </li>
            <li>
              <strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Block all cookies
            </li>
            <li>
              <strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section className="pt-4 border-t border-[var(--border)] space-y-2">
          <p className="text-xs">
            For further queries regarding our cookie policies or data protection methods, please review our{" "}
            <Link href="/privacy-policy" className="text-amber-500 font-bold underline">
              Privacy Policy
            </Link>{" "}
            or email us at{" "}
            <a href="mailto:techsavvy.muthuraj.dev@gmail.com" className="text-amber-500 hover:underline font-semibold">
              techsavvy.muthuraj.dev@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
