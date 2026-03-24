import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { withMetrics } from "@/lib/metrics";

export const GET = withMetrics("/api/healthz", async (_req: NextRequest) => {
  const db = getDb();
  db.prepare("SELECT 1").get();
  return NextResponse.json({ status: "ok" });
});
