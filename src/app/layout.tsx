import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Storm Kokua - Kona Low Storm Relief for Hawai'i",
  description:
    "Support families, farms, and businesses affected by the Kona Low storms across Hawai'i. Find and donate to those who need it most.",
  openGraph: {
    title: "Storm Kokua - Kona Low Storm Relief",
    description:
      "81 families across Hawai'i need your help after the Kona Low storms. Browse and donate.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
