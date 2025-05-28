import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export async function GET(request: Request) {
  const session: Session | null = await getServerSession(authOptions);
  const results: { publicData?: any; protectedData?: any; error?: string } = {};

  if (session?.accessToken) {
    try {
      const protectedResponse = await fetch(
        `${process.env.BACKEND_EXTERNAL_URL}/protected`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!protectedResponse.ok) {
        const errorBody = await protectedResponse.json().catch(() => ({
          error: "Failed to parse error response from protected endpoint",
        }));
        results.protectedData = {
          message: `Access to protected data failed with status: ${protectedResponse.status}`,
          details: errorBody,
        };
        if (protectedResponse.status === 401) {
          results.protectedData.hint =
            "Token might be invalid or missing. Ensure you are logged in.";
        } else if (protectedResponse.status === 403) {
          results.protectedData.hint =
            "Token is valid, but you might not have sufficient permissions for this specific resource if it checks roles.";
        }
      } else {
        results.protectedData = await protectedResponse.json();
      }
    } catch (error: any) {
      console.error("Error fetching protected data from Express API:", error);
      results.protectedData = {
        error: "Could not connect to Express API protected endpoint.",
        details: error.message,
      };
    }
  } else {
    results.protectedData = {
      message:
        "Not attempting to fetch protected data: No active session or access token found in Next.js session.",
    };
  }

  return NextResponse.json(results);
}
