import { getAllFamilies, getStats } from "@/lib/db";
import { HomePage } from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ family?: string }>;
}) {
  const { family: familyId } = await searchParams;
  const families = getAllFamilies();
  const stats = getStats();

  return (
    <HomePage
      initialFamilies={families}
      initialStats={stats}
      initialFamilyId={familyId ? Number(familyId) : undefined}
    />
  );
}
