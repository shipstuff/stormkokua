import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getFamilyById } from "@/lib/db";
import { formatCompactCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const family = getFamilyById(Number(id));

  if (!family) {
    return new Response("Not found", { status: 404 });
  }

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
        <div
          style={{
            display: "flex",
            fontSize: "20px",
            fontWeight: 600,
            color: "#93c5fd",
            letterSpacing: "4px",
            textTransform: "uppercase" as const,
          }}
        >
          Storm Kokua - Kona Low Relief
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "56px",
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center" as const,
            lineHeight: 1.1,
            marginTop: "20px",
            maxWidth: "900px",
            padding: "0 40px",
          }}
        >
          {`Help ${family.name}`}
        </div>
        {location ? (
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              color: "#bfddfe",
              marginTop: "12px",
            }}
          >
            {location}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background:
              family.amount_raised !== null
                ? "rgba(249, 115, 22, 0.2)"
                : "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(251, 146, 60, 0.3)",
            borderRadius: "16px",
            padding: "20px 48px",
            marginTop: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: family.amount_raised !== null ? "48px" : "32px",
              fontWeight: 800,
              color: "#fb923c",
            }}
          >
            {family.amount_raised !== null
              ? formatCompactCurrency(family.amount_raised)
              : "Donate Now"}
          </div>
          {family.amount_raised !== null && (
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
              Raised so far
            </div>
          )}
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
