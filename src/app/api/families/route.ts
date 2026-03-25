import { NextRequest, NextResponse } from "next/server";
import { getAllFamilies, getFamiliesByIsland, getStats } from "@/lib/db";
import { withMetrics } from "@/lib/metrics";

export const GET = withMetrics("/api/families", async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const island = searchParams.get("island");
  const statsOnly = searchParams.get("stats");

  if (statsOnly === "true") {
    return NextResponse.json(getStats());
  }

  const families = island ? getFamiliesByIsland(island) : getAllFamilies();
  return NextResponse.json({ families, stats: getStats() });
});
