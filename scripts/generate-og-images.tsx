import React from "react";
import { ImageResponse } from "@vercel/og";
import { getAllFamilies, getStats, closeDb } from "../src/lib/db";
import { formatCompactCurrency } from "../src/lib/format";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "out");
const PUBLIC_DIR = join(process.cwd(), "public");

async function renderToBuffer(response: ImageResponse): Promise<Buffer> {
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function imageDataUri(filename: string): string {
  const file = readFileSync(join(PUBLIC_DIR, filename));
  return `data:image/jpeg;base64,${file.toString("base64")}`;
}

function siteOgImage(
  stats: ReturnType<typeof getStats>,
  backgroundImage: string
): ImageResponse {
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
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <img
          src={backgroundImage}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(24, 37, 28, 0.42) 0%, rgba(18, 31, 24, 0.72) 55%, rgba(12, 24, 19, 0.9) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top, rgba(255, 244, 204, 0.24) 0%, transparent 40%)",
          }}
        />
        <div style={{ display: "flex", fontSize: "24px", fontWeight: 600, color: "#e8d9a7", letterSpacing: "4px", textTransform: "uppercase" as const, position: "relative" }}>
          Kona Low Storm Relief
        </div>
        <div style={{ display: "flex", fontSize: "72px", fontWeight: 900, color: "#ffffff", letterSpacing: "-1px", marginTop: "16px", position: "relative" }}>
          {`Storm Kokua`}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "rgba(255, 255, 255, 0.88)", maxWidth: "800px", textAlign: "center" as const, lineHeight: 1.4, marginTop: "16px", position: "relative" }}>
          {`${stats.totalFamilies} families across Hawaii need your help`}
        </div>
        <div style={{ display: "flex", gap: "32px", marginTop: "40px", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(197, 106, 45, 0.28)", border: "1px solid rgba(244, 214, 127, 0.3)", borderRadius: "16px", padding: "20px 40px" }}>
            <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: "#f4d67f" }}>{formattedRaised}</div>
            <div style={{ display: "flex", fontSize: "14px", color: "rgba(255, 255, 255, 0.72)", textTransform: "uppercase" as const, letterSpacing: "2px", marginTop: "4px" }}>Estimated Raised</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.14)", borderRadius: "16px", padding: "20px 40px" }}>
            <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: "#ffffff" }}>{String(stats.totalFamilies)}</div>
            <div style={{ display: "flex", fontSize: "14px", color: "rgba(255, 255, 255, 0.72)", textTransform: "uppercase" as const, letterSpacing: "2px", marginTop: "4px" }}>Families</div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "32px", fontSize: "18px", color: "#e8d9a7", fontWeight: 600, position: "relative" }}>stormkokua.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function familyOgImage(
  family: ReturnType<typeof getAllFamilies>[number],
  backgroundImage: string
): ImageResponse {
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
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <img
          src={backgroundImage}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(24, 37, 28, 0.38) 0%, rgba(18, 31, 24, 0.72) 55%, rgba(12, 24, 19, 0.9) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top, rgba(255, 244, 204, 0.22) 0%, transparent 38%)",
          }}
        />
        <div style={{ display: "flex", fontSize: "20px", fontWeight: 600, color: "#e8d9a7", letterSpacing: "4px", textTransform: "uppercase" as const, position: "relative" }}>
          Storm Kokua - Kona Low Relief
        </div>
        <div style={{ display: "flex", fontSize: "56px", fontWeight: 900, color: "#ffffff", textAlign: "center" as const, lineHeight: 1.1, marginTop: "20px", maxWidth: "900px", padding: "0 40px", position: "relative" }}>
          {`Help ${family.name}`}
        </div>
        {location ? (
          <div style={{ display: "flex", fontSize: "22px", color: "rgba(255, 255, 255, 0.84)", marginTop: "12px", position: "relative" }}>{location}</div>
        ) : null}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: family.amount_raised !== null ? "rgba(197, 106, 45, 0.28)" : "rgba(255, 255, 255, 0.1)",
          border: family.amount_raised !== null ? "1px solid rgba(244, 214, 127, 0.3)" : "1px solid rgba(255, 255, 255, 0.14)",
          borderRadius: "16px",
          padding: "20px 48px",
          marginTop: "32px",
          position: "relative",
        }}>
          <div style={{ display: "flex", fontSize: family.amount_raised !== null ? "48px" : "32px", fontWeight: 800, color: family.amount_raised !== null ? "#f4d67f" : "#ffffff" }}>
            {family.amount_raised !== null ? formatCompactCurrency(family.amount_raised) : "Donate Now"}
          </div>
          {family.amount_raised !== null && (
            <div style={{ display: "flex", fontSize: "14px", color: "rgba(255, 255, 255, 0.72)", textTransform: "uppercase" as const, letterSpacing: "2px", marginTop: "4px" }}>Raised so far</div>
          )}
        </div>
        <div style={{ display: "flex", marginTop: "32px", fontSize: "18px", color: "#e8d9a7", fontWeight: 600, position: "relative" }}>stormkokua.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

async function main() {
  const stats = getStats();
  const families = getAllFamilies();
  const siteUnfurlImage = imageDataUri("site-unfurl.jpg");
  const familyUnfurlImage = imageDataUri("family-unfurl.jpg");

  console.log(`Generating OG images for ${families.length} families...`);

  // Site-wide OG
  const siteBuffer = await renderToBuffer(siteOgImage(stats, siteUnfurlImage));
  writeFileSync(join(OUT_DIR, "og-image.png"), siteBuffer);
  console.log("  og-image.png");

  // Per-family OG
  for (const family of families) {
    const dir = join(OUT_DIR, "family", String(family.id));
    mkdirSync(dir, { recursive: true });
    const buffer = await renderToBuffer(familyOgImage(family, familyUnfurlImage));
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
