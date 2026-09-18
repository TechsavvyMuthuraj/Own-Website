import React from "react";

export const metadata = {
  title: "Refund Policy",
  description: "Refund terms and conditions for commercial digital resource purchases.",
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          Refund Policy
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Last updated: September 2026
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            1. Digital Products Policy
          </h2>
          <p>
            Due to the immediate access nature of downloadable digital files, templates, and software licenses, purchases are generally non-refundable once the file has been accessed or downloaded.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            2. Defective Files & Inaccessibility
          </h2>
          <p>
            If a purchased product is proven to be corrupted, incomplete, or technically inaccessible, and our technical support team cannot resolve the issue within 48 hours of notification, we will issue a full refund to the original payment method.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--foreground)] mb-2">
            3. Requesting a Refund
          </h2>
          <p>
            To initiate a review, contact support within 7 days of purchase providing your Order Number and a detailed explanation of the defect.
          </p>
        </section>
      </div>
    </div>
  );
}
