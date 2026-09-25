import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Cookie, Eye, ExternalLink, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NammaTech - Google AdSense & GDPR Compliant",
  description:
    "Comprehensive privacy policy for NammaTech detailing data protection, cookie usage, Google AdSense disclosures, CCPA, and GDPR rights.",
  openGraph: {
    title: "Privacy Policy | NammaTech",
    description: "Learn how NammaTech protects user data, adheres to Google AdSense policies, and complies with GDPR & CCPA.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-500">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trust & Privacy Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Last Updated &amp; Effective Date: September 20, 2026 &bull; Compliant with Google AdSense, GDPR, &amp; CCPA/CPRA Standards
        </p>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-8 text-sm text-[var(--muted-foreground)] leading-relaxed shadow-sm">
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>1. Introduction &amp; Scope</span>
          </h2>
          <p>
            Welcome to <strong>NammaTech</strong> (accessible at{" "}
            <a href="https://www.techsavvymuthuraj.dev" className="text-amber-500 hover:underline">
              https://www.techsavvymuthuraj.dev
            </a>
            , founded by <strong>Muthuraj C</strong>). We are dedicated to providing safe, verified digital resources, tutorials, articles, and tools while strictly safeguarding your personal privacy.
          </p>
          <p>
            This Privacy Policy document details the types of personal information collected, how it is processed and stored, and our adherence to digital advertising policies including <strong>Google AdSense</strong>, the <strong>General Data Protection Regulation (GDPR)</strong>, and the <strong>California Consumer Privacy Act (CCPA)</strong>.
          </p>
        </section>

        {/* Google AdSense & Advertising Cookies */}
        <section className="space-y-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2 text-amber-500">
            <Cookie className="w-4 h-4 text-amber-500" />
            <span>2. Google AdSense &amp; DoubleClick DART Cookie Disclosures</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed font-medium">
            Google is a third-party vendor on our website. Please review the following mandatory disclosures regarding Google advertising:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs leading-relaxed">
            <li>
              <strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies to serve advertisements based on a user&apos;s prior visits to our website or other websites on the Internet.
            </li>
            <li>
              <strong>DoubleClick DART Cookie:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to our visitors based on their visit to <em>NammaTech</em> and/or other sites across the World Wide Web.
            </li>
            <li>
              <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising by visiting{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 font-bold underline inline-flex items-center gap-0.5"
              >
                Google Ads Settings <ExternalLink className="w-3 h-3 inline" />
              </a>
              . Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{" "}
              <a
                href="https://optout.aboutads.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 font-bold underline inline-flex items-center gap-0.5"
              >
                aboutads.info <ExternalLink className="w-3 h-3 inline" />
              </a>{" "}
              or the{" "}
              <a
                href="https://optout.networkadvertising.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 font-bold underline inline-flex items-center gap-0.5"
              >
                Network Advertising Initiative Opt-Out <ExternalLink className="w-3 h-3 inline" />
              </a>
              .
            </li>
            <li>
              <strong>Publisher Information:</strong> Our registered Google AdSense Publisher Account ID is <code>ca-pub-1960459798233871</code>, verified via our public root <code>/ads.txt</code> file.
            </li>
          </ul>
        </section>

        {/* Log Files */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-500" />
            <span>3. Log Files &amp; Technical Diagnostics</span>
          </h2>
          <p>
            Like virtually all modern web applications, NammaTech follows standard logging procedures. The information logged includes Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and click counts.
          </p>
          <p>
            These logs are used solely to analyze security trends, combat automated denial-of-service attacks, diagnose infrastructure latency, and administer the site. They are not linked to personally identifiable information.
          </p>
        </section>

        {/* Cookies and Web Beacons */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            4. Cookies &amp; Web Beacons
          </h2>
          <p>
            NammaTech utilizes cookies to store visitor preferences, record user-specific session authentication, and customize web page content based on browser type or other technical attributes.
          </p>
          <p>
            For granular information about our cookie categories (Essential, Analytics, and Advertising) and step-by-step instructions on controlling cookie settings in popular browsers, please consult our dedicated{" "}
            <Link href="/cookie-policy" className="text-amber-500 font-semibold underline">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* GDPR Rights */}
        <section className="space-y-3 p-5 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            5. GDPR Privacy Rights (EEA &amp; UK Users)
          </h2>
          <p className="text-xs sm:text-sm">
            If you reside in the European Economic Area (EEA) or the United Kingdom, you hold specific statutory data protection rights under the General Data Protection Regulation:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>The Right to Access:</strong> You can request copies of your personal data held by us.</li>
            <li><strong>The Right to Rectification:</strong> You may request correction of inaccurate or incomplete information.</li>
            <li><strong>The Right to Erasure:</strong> You may request the deletion of your account and associated personal data under certain conditions.</li>
            <li><strong>The Right to Restrict Processing:</strong> You have the right to request restriction of processing your personal data.</li>
            <li><strong>The Right to Data Portability:</strong> You may request that we transfer your collected data to another organization.</li>
          </ul>
        </section>

        {/* CCPA Rights */}
        <section className="space-y-3 p-5 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            6. CCPA / CPRA Rights (California Residents)
          </h2>
          <p className="text-xs sm:text-sm">
            Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), California residents are entitled to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Right to Know:</strong> Request disclosure of categories and specific pieces of personal data collected.</li>
            <li><strong>Right to Delete:</strong> Request deletion of collected personal data, subject to legal exceptions.</li>
            <li><strong>Right to Opt-Out of Sale or Sharing:</strong> <em>We do not sell personal data.</em> You may opt-out of cross-context behavioral advertising through Google Ad Settings.</li>
            <li><strong>Non-Discrimination:</strong> We will never discriminate against you for exercising your statutory privacy rights.</li>
          </ul>
        </section>

        {/* Children's Information */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
            7. Children&apos;s Information (COPPA)
          </h2>
          <p>
            Protecting children&apos;s privacy online is paramount. NammaTech does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child has provided personal information on our platform, please contact us immediately, and we will promptly remove such records from our databases.
          </p>
        </section>

        {/* Contact Information */}
        <section className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500" />
            <span>8. Contact Our Privacy &amp; Data Officer</span>
          </h2>
          <p>
            If you have questions, feedback, or wish to exercise your data privacy rights under GDPR or CCPA, reach out directly:
          </p>
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1 text-xs">
            <p><strong>NammaTech Data Protection</strong></p>
            <p><strong>Founder &amp; Lead Architect:</strong> Muthuraj C</p>
            <p><strong>Email:</strong> <a href="mailto:techsavvy.muthuraj.dev@gmail.com" className="text-amber-500 hover:underline">techsavvy.muthuraj.dev@gmail.com</a></p>
            <p><strong>Location:</strong> Tamil Nadu, India</p>
            <p>
              <strong>Direct Contact Form:</strong>{" "}
              <Link href="/contact" className="text-amber-500 hover:underline font-medium">
                Submit an inquiry via our Contact Page
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
