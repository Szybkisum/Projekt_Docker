import KeycloakProvider from "next-auth/providers/keycloak";
import { NextAuthOptions, Account, Session } from "next-auth";
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

          const clientId = process.env.KEYCLOAK_CLIENT_ID;
          if (
            clientId &&
            decodedAccessToken.resource_access?.[clientId]?.roles
          ) {
            token.roles = decodedAccessToken.resource_access[clientId].roles;
          }
        } catch (e) {
          console.error(
            "Error decoding access token or extracting roles in JWT callback",
            e
          );
          token.roles = [];
        }
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
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
