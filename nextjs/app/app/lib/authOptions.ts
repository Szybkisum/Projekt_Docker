import KeycloakProvider from "next-auth/providers/keycloak";
import { NextAuthOptions, Account, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import fs from "fs";

function readSecretFromFile(filePath: string): string | undefined {
  if (filePath) {
    return fs.readFileSync(filePath as string, "utf8").trim();
  }
}

const keycloakClientSecretValue =
  process.env.KEYCLOAK_CLIENT_SECRET ||
  readSecretFromFile(process.env.KEYCLOAK_CLIENT_SECRET_PATH as string);

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.FRONTEND_CLIENT_ID!,
      clientSecret: keycloakClientSecretValue!,
      issuer: process.env.KEYCLOAK_ISSUER,
      wellKnown: undefined,
      token: {
        url: `${process.env.KEYCLOAK_FRONTEND_INTERNAL_URL}/protocol/openid-connect/token`,
      },
      userinfo: {
        url: `${process.env.KEYCLOAK_FRONTEND_INTERNAL_URL}/protocol/openid-connect/userinfo`,
      },
      jwks_endpoint: `${process.env.KEYCLOAK_FRONTEND_INTERNAL_URL}/protocol/openid-connect/certs`,
      authorization: {
        url: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
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

          const clientId = process.env.FRONTEND_CLIENT_ID;
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
