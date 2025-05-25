import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";

export default function Authenticated({ user }: { user: User }) {
  const roles = user?.roles || [];
  const isAdmin = roles.includes("admin");

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <SimpleButton text="Sign Out" action={signOut} />
      <p>Your roles: {roles.join(", ")}</p>
      {isAdmin && (
        <Link href={"/admin"}>
          <SimpleButton text="Admin Panel" />
        </Link>
      )}
    </div>
  );
}
