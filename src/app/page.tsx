import type { Metadata } from "next";
import { getAllFamilies, getStats } from "@/lib/db";
import { HomePage } from "@/components/HomePage";

export async function generateMetadata(): Promise<Metadata> {
  const stats = getStats();
  return {
    other: {
      "article:modified_time": stats.lastSync
        ? new Date(stats.lastSync + "Z").toISOString()
        : new Date().toISOString(),
    },
  };
}

export default async function Page() {
  const families = getAllFamilies();
  const stats = getStats();

  return <HomePage initialFamilies={families} initialStats={stats} />;
}
