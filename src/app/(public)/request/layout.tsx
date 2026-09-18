import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Resource or Software",
  description:
    "Can't find a specific tool, APK, or open-source software? Submit a resource request to the NammaTech community and we will verify and publish it.",
  openGraph: {
    title: "Request a Resource or Software | NammaTech",
    description: "Submit a software or resource request to NammaTech.",
  },
};

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
