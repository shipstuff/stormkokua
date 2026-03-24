import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Storm Kōkua - Kona Low Storm Relief",
  description:
    "Support families, farms, and businesses affected by the Kona Low storms across Hawaiʻi. Find and donate to those who need it most.",
  openGraph: {
    title: "Storm Kōkua - Kona Low Storm Relief",
    description:
      "Support families, farms, and businesses affected by the Kona Low storms across Hawaiʻi.",
    type: "website",
    url: "https://stormkokua.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
