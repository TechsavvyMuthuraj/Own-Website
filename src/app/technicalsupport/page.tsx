import React from "react";
import type { Metadata } from "next";
import { TechnicalSupportClient } from "./technical-support-client";

export const metadata: Metadata = {
  title: "Technical Support Specialist Portal | NammaTech Operations",
  description:
    "Dedicated operations terminal and authentication gateway for NammaTech Technical Support Specialists and Engineers.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default function TechnicalSupportPage() {
  return <TechnicalSupportClient />;
}
