import React from "react";
import { ImageResponse } from "@vercel/og";
import { getAllFamilies, getStats, closeDb } from "../src/lib/db";
import { formatCompactCurrency } from "../src/lib/format";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "out");

async function renderToBuffer(response: ImageResponse): Promise<Buffer> {
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function siteOgImage(stats: ReturnType<typeof getStats>): ImageResponse {
  const formattedRaised = formatCompactCurrency(stats.totalRaised);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f1f4d 0%, #1e3a88 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: "24px", fontWeight: 600, color: "#93c5fd", letterSpacing: "4px", textTransform: "uppercase" as const }}>
          Kona Low Storm Relief
        </div>
        <div style={{ display: "flex", fontSize: "72px", fontWeight: 900, color: "#ffffff", letterSpacing: "-1px", marginTop: "16px" }}>
          {`Storm Kokua`}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "#bfddfe", maxWidth: "800px", textAlign: "center" as const, lineHeight: 1.4, marginTop: "16px" }}>
          {`${stats.totalFamilies} families across Hawaii need your help`}
        </div>
        <div style={{ display: "flex", gap: "32px", marginTop: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(249, 115, 22, 0.2)", border: "1px solid rgba(251, 146, 60, 0.3)", borderRadius: "16px", padding: "20px 40px" }}>
            <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: "#fb923c" }}>{formattedRaised}</div>
            <div style={{ display: "flex", fontSize: "14px", color: "#93c5fd", textTransform: "uppercase" as const, letterSpacing: "2px", marginTop: "4px" }}>Estimated Raised</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", padding: "20px 40px" }}>
            <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: "#ffffff" }}>{String(stats.totalFamilies)}</div>
            <div style={{ display: "flex", fontSize: "14px", color: "#93c5fd", textTransform: "uppercase" as const, letterSpacing: "2px", marginTop: "4px" }}>Families</div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "32px", fontSize: "18px", color: "#5fa3f9", fontWeight: 600 }}>stormkokua.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function familyOgImage(family: ReturnType<typeof getAllFamilies>[number]): ImageResponse {
  const location = family.neighborhood
    ? `${family.neighborhood}, ${family.island}`
    : family.island || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f1f4d 0%, #1e3a88 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: "20px", fontWeight: 600, color: "#93c5fd", letterSpacing: "4px", textTransform: "uppercase" as const }}>
          Storm Kokua - Kona Low Relief
        </div>
        <div style={{ display: "flex", fontSize: "56px", fontWeight: 900, color: "#ffffff", textAlign: "center" as const, lineHeight: 1.1, marginTop: "20px", maxWidth: "900px", padding: "0 40px" }}>
          {`Help ${family.name}`}
        </div>
        {location ? (
          <div style={{ display: "flex", fontSize: "22px", color: "#bfddfe", marginTop: "12px" }}>{location}</div>
        ) : null}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: family.amount_raised !== null ? "rgba(249, 115, 22, 0.2)" : "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(251, 146, 60, 0.3)",
          borderRadius: "16px",
          padding: "20px 48px",
          marginTop: "32px",
        }}>
          <div style={{ display: "flex", fontSize: family.amount_raised !== null ? "48px" : "32px", fontWeight: 800, color: "#fb923c" }}>
            {family.amount_raised !== null ? formatCompactCurrency(family.amount_raised) : "Donate Now"}
          </div>
          {family.amount_raised !== null && (
            <div style={{ display: "flex", fontSize: "14px", color: "#93c5fd", textTransform: "uppercase" as const, letterSpacing: "2px", marginTop: "4px" }}>Raised so far</div>
          )}
        </div>
        <div style={{ display: "flex", marginTop: "32px", fontSize: "18px", color: "#5fa3f9", fontWeight: 600 }}>stormkokua.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

async function main() {
  const stats = getStats();
  const families = getAllFamilies();

  console.log(`Generating OG images for ${families.length} families...`);

  // Site-wide OG
  const siteBuffer = await renderToBuffer(siteOgImage(stats));
  writeFileSync(join(OUT_DIR, "og-image.png"), siteBuffer);
  console.log("  og-image.png");

  // Per-family OG
  for (const family of families) {
    const dir = join(OUT_DIR, "family", String(family.id));
    mkdirSync(dir, { recursive: true });
    const buffer = await renderToBuffer(familyOgImage(family));
    writeFileSync(join(dir, "og.png"), buffer);
  }
  console.log(`  ${families.length} family OG images`);

  closeDb();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
