import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Technical Support & Contact | Techsavvy Muthuraj",
  description:
    "Connect with Techsavvy Muthuraj (Muthuraj C) and technical specialists via real-time live chat or direct phone/WhatsApp (+91 99448 75726) for instant software troubleshooting and inquiries.",
  keywords: [
    "Techsavvy Muthuraj contact",
    "Muthuraj C support",
    "NammaTech technical support",
    "live tech support chat",
    "software troubleshooting online",
    "NammaTech contact",
  ],
  alternates: {
    canonical: "https://www.techsavvymuthuraj.dev/contact",
  },
  openGraph: {
    title: "Live Technical Support & Contact | Techsavvy Muthuraj",
    description: "Get real-time live chat technical support and reach out to Techsavvy Muthuraj.",
    url: "https://www.techsavvymuthuraj.dev/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
