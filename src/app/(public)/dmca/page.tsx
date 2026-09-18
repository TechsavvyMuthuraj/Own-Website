import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "DMCA & Copyright Policy",
  description: "DMCA takedown notice guidelines and copyright dispute mechanism for NammaTech.",
};

export default function DmcaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-rose-500 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Intellectual Property Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          DMCA & Copyright Policy
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Last updated: September 2026
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            Commitment to Copyright Compliance
          </h2>
          <p>
            NammaTech strictly respects the intellectual property rights of developers, creators, and authors. We adhere to clear distribution permissions and open-source licensing. If you believe your copyrighted work has been improperly indexed or distributed on our site, we provide a prompt and transparent takedown mechanism.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            Filing a Notice of Infringement
          </h2>
          <p className="mb-3">
            To submit a copyright complaint, please include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Exact URL or slug of the resource page on NammaTech.</li>
            <li>Your contact information (name, address, telephone number, and email).</li>
            <li>A statement of good faith belief that the disputed use is unauthorized.</li>
            <li>A statement made under penalty of perjury that the information is accurate and you are the copyright owner or authorized agent.</li>
          </ul>
        </section>

        <section className="pt-2">
          <p>
            Please send copyright notices directly through our{" "}
            <Link href="/contact" className="text-[var(--primary)] font-semibold underline">
              contact form
            </Link>{" "}
            with the subject &quot;DMCA Copyright Notice&quot;.
          </p>
        </section>
      </div>
    </div>
  );
}
