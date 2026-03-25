import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllFamilies, getFamilyById } from "@/lib/db";
import { formatCompactCurrency } from "@/lib/format";
import { FamilyRedirect } from "./redirect";

export async function generateStaticParams() {
  const families = getAllFamilies();
  return families.map((f) => ({ id: String(f.id) }));
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
      ? ` - Raised ${formatCompactCurrency(family.amount_raised)}`
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
          url: `/family/${id}/og.png`,
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
      images: [`/family/${id}/og.png`],
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

  return <FamilyRedirect id={id} />;
}
