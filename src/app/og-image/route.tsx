import { ImageResponse } from "next/og";
import { getStats } from "@/lib/db";
import { formatCompactCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = getStats();

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
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 600,
            color: "#93c5fd",
            letterSpacing: "4px",
            textTransform: "uppercase" as const,
          }}
        >
          Kona Low Storm Relief
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "72px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-1px",
            marginTop: "16px",
          }}
        >
          {`Storm Kokua`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "#bfddfe",
            maxWidth: "800px",
            textAlign: "center" as const,
            lineHeight: 1.4,
            marginTop: "16px",
          }}
        >
          {`${stats.totalFamilies} families across Hawaii need your help`}
        </div>
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(249, 115, 22, 0.2)",
              border: "1px solid rgba(251, 146, 60, 0.3)",
              borderRadius: "16px",
              padding: "20px 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "40px",
                fontWeight: 800,
                color: "#fb923c",
              }}
            >
              {formattedRaised}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "14px",
                color: "#93c5fd",
                textTransform: "uppercase" as const,
                letterSpacing: "2px",
                marginTop: "4px",
              }}
            >
              Estimated Raised
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "20px 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "40px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              {String(stats.totalFamilies)}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "14px",
                color: "#93c5fd",
                textTransform: "uppercase" as const,
                letterSpacing: "2px",
                marginTop: "4px",
              }}
            >
              Families
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "32px",
            fontSize: "18px",
            color: "#5fa3f9",
            fontWeight: 600,
          }}
        >
          stormkokua.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
