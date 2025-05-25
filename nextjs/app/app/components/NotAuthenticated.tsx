import SimpleButton from "@/components/SimpleButton";
import { signIn } from "next-auth/react";

export default function NotAuthenticated() {
  return (
    <div>
      <p>Not authenticated</p>
      <SimpleButton text="Sign In" action={signIn} />
    </div>
  );
}
