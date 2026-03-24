import { NextRequest, NextResponse } from "next/server";
import { getAllFamilies, getFamiliesByIsland, getStats } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const island = searchParams.get("island");
  const statsOnly = searchParams.get("stats");

  if (statsOnly === "true") {
    return NextResponse.json(getStats());
  }

  const families = island ? getFamiliesByIsland(island) : getAllFamilies();
  return NextResponse.json({ families, stats: getStats() });
}
