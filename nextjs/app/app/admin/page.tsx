"use client";

import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session } = useSession();

  if (session?.user?.roles?.includes("admin")) {
    return (
      <div>
        <h1>This is the Admin Panel</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Access Denied</h1>
    </div>
  );
}
