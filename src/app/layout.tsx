import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SITE_TITLE } from "@/lib/constants";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description:
    "Support families, farms, and businesses affected by the Kona Low storms across Hawai'i. Find and donate to those who need it most.",
  metadataBase: new URL("https://stormkokua.com"),
  openGraph: {
    title: "Storm Kokua - Kona Low Storm Relief",
    description:
      "Families across Hawai'i need your help after the Kona Low storms. Browse and donate to those who need it most.",
    type: "website",
    url: "https://stormkokua.com",
    siteName: "Storm Kokua",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Storm Kokua - Kona Low Storm Relief for Hawai'i",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Storm Kokua - Kona Low Storm Relief",
    description:
      "Families across Hawai'i need your help after the Kona Low storms. Browse and donate.",
    images: ["/og-image.png"],
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YNY29836D3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YNY29836D3');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
