import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const results: { publicData?: any; protectedData?: any; error?: string } = {};

  try {
    const publicResponse = await fetch(`${process.env.BACKEND_EXTERNAL_URL}/`);
    if (!publicResponse.ok) {
      results.publicData = {
        error: `Failed to fetch public data: ${publicResponse.status} ${publicResponse.statusText}`,
        details: await publicResponse.text(),
      };
    } else {
      results.publicData = await publicResponse.json();
    }
  } catch (error: any) {
    console.error("Error fetching public data from Express API:", error);
    results.publicData = {
      error: "Could not connect to Express API public endpoint.",
      details: error.message,
    };
  }

  return NextResponse.json(results);
}
