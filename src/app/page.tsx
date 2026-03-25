import type { Metadata } from "next";
import { getAllFamilies, getStats } from "@/lib/db";
import { HomePage } from "@/components/HomePage";

export async function generateMetadata(): Promise<Metadata> {
  const stats = getStats();
  const modifiedTime = stats.lastSync
    ? new Date(stats.lastSync + "Z").toISOString()
    : new Date().toISOString();

  return {
    openGraph: {
      type: "article",
      modifiedTime,
    },
  };
}

export default async function Page() {
  const families = getAllFamilies();
  const stats = getStats();

  return <HomePage initialFamilies={families} initialStats={stats} />;
}
