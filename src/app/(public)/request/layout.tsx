import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Resource - NammaTech",
  description:
    "Can't find a resource on NammaTech? Submit a request and our team will review it.",
  openGraph: {
    title: "Request a Resource - NammaTech",
    description:
      "Can't find a resource on NammaTech? Submit a request and our team will review it.",
  },
};

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
