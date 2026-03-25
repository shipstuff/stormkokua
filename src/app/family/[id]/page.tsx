import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getFamilyById } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString("en-US")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const family = getFamilyById(Number(id));
  if (!family) return {};

  const raisedText =
    family.amount_raised !== null
      ? ` - Raised ${formatCurrency(family.amount_raised)}`
      : "";

  const title = `Help ${family.name}${raisedText} | Storm Kokua`;
  const description = family.description
    ? family.description.slice(0, 200)
    : `Support ${family.name} from ${family.island || "Hawai'i"} after the Kona Low storms.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://stormkokua.com/family/${id}`,
      siteName: "Storm Kokua",
      images: [
        {
          url: `/family/${id}/og`,
          width: 1200,
          height: 630,
          alt: `Help ${family.name} - Storm Kokua`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/family/${id}/og`],
    },
  };
}

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const family = getFamilyById(Number(id));
  if (!family) notFound();

  redirect(`/?family=${id}`);
}
