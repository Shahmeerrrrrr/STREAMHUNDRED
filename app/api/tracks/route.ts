import { NextResponse } from "next/server";
import { getLiveTracks } from "@/lib/tracks-live";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getLiveTracks();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API /api/tracks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live tracks" },
      { status: 500 }
    );
  }
}
