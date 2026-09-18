import React from "react";
import { UsersClient } from "./users-client";

export const metadata = {
  title: "Users Directory & Verification | NammaTech Admin",
  description: "Monitor user presence, online/offline status, verification, and role assignments.",
};

export default function AdminUsersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <UsersClient />
    </div>
  );
}
