"use client";

import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { useState } from "react";

export default function Authenticated({ user }: { user: User }) {
  const roles = user?.roles || [];
  const isAdmin = roles.includes("admin");
  const [fetchState, setFetchState] = useState("");

  async function fetchData() {
    if (!fetchState) {
      setFetchState("fetching");
      const data = await fetch("api/data");
      const dataJson = await data.json();
      setFetchState(dataJson.message);
    }
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <SimpleButton text="Sign Out" action={signOut} />
      <p>Your roles: {roles.join(", ")}</p>
      <div>
        <SimpleButton
          text="Fetch protected data from next api"
          action={fetchData}
          disabled={!!fetchState}
        />
        <p>{fetchState === "fetching" ? <p>Loading...</p> : fetchState}</p>
      </div>
      {isAdmin && (
        <Link href={"/admin"}>
          <SimpleButton text="Admin Panel" />
        </Link>
      )}
    </div>
  );
}
