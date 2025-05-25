import KeycloakProvider from "next-auth/providers/keycloak";
import { NextAuthOptions, Account } from "next-auth";
import { JWT } from "next-auth/jwt";

const keycloakPublicIssuer = process.env.KEYCLOAK_ISSUER;
const keycloakInternalBaseUrl =
  process.env.KEYCLOAK_INTERNAL_BASE_URL || keycloakPublicIssuer;

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: keycloakPublicIssuer,
      wellKnown: undefined,
      token: {
        url: `${keycloakInternalBaseUrl}/protocol/openid-connect/token`,
      },
      userinfo: {
        url: `${keycloakInternalBaseUrl}/protocol/openid-connect/userinfo`,
      },
      jwks_endpoint: `${keycloakInternalBaseUrl}/protocol/openid-connect/certs`,
      authorization: {
        url: `${keycloakPublicIssuer}/protocol/openid-connect/auth`,
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      account?: Account | null;
    }): Promise<JWT> {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        try {
          const decodedAccessToken = JSON.parse(
            Buffer.from(account.access_token.split(".")[1], "base64").toString()
          );

          let roles: string[] = [];
          if (decodedAccessToken.realm_access?.roles) {
            roles = roles.concat(decodedAccessToken.realm_access.roles);
          }

          const clientId = process.env.KEYCLOAK_CLIENT_ID;
          if (
            clientId &&
            decodedAccessToken.resource_access?.[clientId]?.roles
          ) {
            roles = roles.concat(
              decodedAccessToken.resource_access[clientId].roles
            );
          }

          token.roles = [...new Set(roles)];
        } catch (e) {
          console.error(
            "Error decoding access token or extracting roles in JWT callback",
            e
          );
        }
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: any;
      token: JWT;
    }): Promise<any> {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.roles) {
        session.user.roles = token.roles as string[];
      } else {
        session.user.roles = [];
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
