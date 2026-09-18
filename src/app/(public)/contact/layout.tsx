import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Support",
  description:
    "Get in touch with the NammaTech team for support, business inquiries, developer submissions, and feedback.",
  openGraph: {
    title: "Contact Us & Support | NammaTech",
    description: "Get in touch with the NammaTech team.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
