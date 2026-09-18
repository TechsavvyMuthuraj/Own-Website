import React from "react";
import { MaintenanceClient } from "./maintenance-client";

export const metadata = {
  title: "Platform Maintenance – NammaTech",
  description: "NammaTech is currently undergoing scheduled platform maintenance. We'll be back shortly.",
};

export const revalidate = 0;

export default function MaintenancePage() {
  return <MaintenanceClient />;
}
