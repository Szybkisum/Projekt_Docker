import SimpleButton from "@/components/SimpleButton";
import { signIn } from "next-auth/react";

export default function NotAuthenticated() {
  const keycloakIssuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
  const registerUrl = keycloakIssuer
    ? `${keycloakIssuer}/protocol/openid-connect/registrations?client_id=${
        process.env.NEXT_PUBLIC_FRONTEND_CLIENT_ID
      }&response_type=code&scope=openid%20email&redirect_uri=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/auth/callback/keycloak`
      )}`
    : "";

  const handleRegister = () => {
    if (registerUrl) {
      window.location.href = registerUrl;
    } else {
      console.error(
        "Registration URL is not configured. Check NEXT_PUBLIC_KEYCLOAK_ISSUER environment variable."
      );
    }
  };

  return (
    <div>
      <p>Not authenticated</p>
      <SimpleButton text="Sign In" action={signIn} />
      <SimpleButton text="Register" action={handleRegister} />
    </div>
  );
}
