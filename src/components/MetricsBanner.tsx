"use client";

import {
  STORMKOKUA_FORM_URL,
  STORMKOKUA_OVERALL_FUND_URL,
  STORMKOKUA_SHEET_URL,
} from "@/lib/links";
import { formatCompactCurrency } from "@/lib/format";

interface Stats {
  totalFamilies: number;
  totalRaised: number;
  familyRaised: number;
  overallFundRaised: number;
  trackedFamilies: number;
  islands: { island: string; count: number }[];
  lastSync: string | null;
}

export function MetricsBanner({ stats }: { stats: Stats }) {
  const formattedRaised = formatCompactCurrency(stats.totalRaised);
  const formattedOverallFundRaised = formatCompactCurrency(stats.overallFundRaised);

  return (
    <section className="relative overflow-hidden bg-[#24362d] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(24, 37, 28, 0.48) 0%, rgba(18, 31, 24, 0.7) 50%, rgba(12, 24, 19, 0.88) 100%), url('/hero.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,244,204,0.24),_transparent_42%)]" />

      <div className="absolute inset-0 opacity-[0.08]">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1440 560">
          <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,560L0,560Z" fill="currentColor" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-[#e8d9a7] uppercase">
            Kona Low Storm Relief
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Storm K<span className="text-[#f4d67f]">o</span>kua
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/[0.88]">
            Families, farms, and businesses across Hawai&#699;i were devastated by
            the Kona Low storms. They need our help.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={STORMKOKUA_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.12] px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.18]"
            >
              Open Original Spreadsheet
            </a>
            <a
              href={STORMKOKUA_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#f4d67f]/35 bg-[#c56a2d]/35 px-4 py-2 text-sm font-semibold text-[#fff4d6] backdrop-blur-sm transition hover:bg-[#c56a2d]/45"
            >
              Submit Family Information
            </a>
            <a
              href={STORMKOKUA_OVERALL_FUND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#c56a2d] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1c140c]/30 transition hover:bg-[#af5d28]"
            >
              Donate To Overall Fund
            </a>
            {stats.lastSync && (
              <span className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-white/[0.75] backdrop-blur-sm">
                Last synced{" "}
                {new Date(stats.lastSync + "Z").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 sm:gap-5">
          <StatCard value={stats.totalFamilies} label="Families in need" accent />
          <StatCard value={formattedRaised} label="Estimated raised" />
          <StatCard value={stats.islands.length} label="Islands affected" />
        </div>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-6 text-white/[0.72]">
          {stats.overallFundRaised > 0
            ? `Estimated raised includes ${formattedOverallFundRaised} from the overall GoFundMe relief fund, plus ${stats.trackedFamilies} public family GoFundMe totals from the source sheet.`
            : `Estimated raised is based on ${stats.trackedFamilies} public family GoFundMe totals from the source sheet.`}{" "}
          Venmo, CashApp, SpotFund, and direct website totals are usually not
          public.
        </p>

        <div className="mt-8 text-center">
          <a
            href="#families"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#1d2d24] shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#f6f0de] hover:shadow-black/30"
          >
            Browse &amp; Donate
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl px-4 py-4 text-center ${
      accent
        ? "bg-[#c56a2d]/28 ring-1 ring-[#f4d67f]/30 backdrop-blur-sm"
        : "bg-white/10 ring-1 ring-white/14 backdrop-blur-sm"
    }`}>
      <p className={`text-3xl font-extrabold tabular-nums ${accent ? "text-[#f4d67f]" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/[0.68]">
        {label}
      </p>
    </div>
  );
}
