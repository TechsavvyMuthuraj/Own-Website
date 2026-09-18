import React from "react";
import { RequestsClient } from "./requests-client";

export const metadata = {
  title: "Software Requests – NammaTech Admin",
};

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <RequestsClient />
    </div>
  );
}
