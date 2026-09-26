import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Technical Support & Contact",
  description:
    "Get instant technical support, software troubleshooting, and contact NammaTech engineering specialists via real-time live chat or direct WhatsApp (+91 99448 75726).",
  keywords: [
    "NammaTech support",
    "nammatech support",
    "nammatech technical support",
    "nammatech customer support",
    "nammatech live chat",
    "nammatech contact",
    "nammatech help desk",
    "support",
    "chat",
    "technical support",
    "live technical support",
    "software troubleshooting",
    "Muthuraj C support",
    "Techsavvy Muthuraj support",
  ],
  alternates: {
    canonical: "https://www.techsavvymuthuraj.dev/contact",
  },
  openGraph: {
    title: "Live Technical Support & Contact | NammaTech",
    description: "Get real-time live chat technical support and instant software assistance on NammaTech.",
    url: "https://www.techsavvymuthuraj.dev/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
