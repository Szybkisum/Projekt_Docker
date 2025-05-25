"use client";

import NotAuthenticated from "@/components/NotAuthenticated";
import Authenticated from "@/components/Authenticated";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading")
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (session) {
    const { user } = session;
    return <Authenticated user={user} />;
  }
  return <NotAuthenticated />;
}
