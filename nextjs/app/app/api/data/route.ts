import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user?.roles?.includes("admin")) {
      return NextResponse.json({
        message: "Hello Admin! This is protected data for admins.",
        user: session.user,
      });
    } else if (session.user?.roles?.includes("user")) {
      return NextResponse.json({
        message: "Hello User! This is protected data for users.",
        user: session.user,
      });
    } else {
      return NextResponse.json(
        { error: "Forbidden: Insufficient roles" },
        { status: 403 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Unauthorized: You must be signed in to access this resource." },
      { status: 401 }
    );
  }
}
