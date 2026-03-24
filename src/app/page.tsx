import { getAllFamilies, getStats } from "@/lib/db";
import { HomePage } from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default function Page() {
  const families = getAllFamilies();
  const stats = getStats();

  return <HomePage initialFamilies={families} initialStats={stats} />;
}
