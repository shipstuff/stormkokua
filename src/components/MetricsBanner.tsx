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
    <section className="relative overflow-hidden bg-ocean-950 text-white">
      {/* Subtle wave overlay */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1440 560">
          <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,560L0,560Z" fill="currentColor" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-ocean-300 text-sm font-semibold tracking-widest uppercase mb-3">
            Kona Low Storm Relief
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Storm K<span className="text-ocean-400">o</span>kua
          </h1>
          <p className="mt-4 text-lg text-ocean-200 max-w-2xl mx-auto leading-relaxed">
            Families, farms, and businesses across Hawai&#699;i were devastated by
            the Kona Low storms. They need our help.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={STORMKOKUA_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open Original Spreadsheet
            </a>
            <a
              href={STORMKOKUA_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-lava-300/30 bg-lava-500/20 px-4 py-2 text-sm font-semibold text-lava-50 transition hover:bg-lava-500/30"
            >
              Submit Family Information
            </a>
            <a
              href={STORMKOKUA_OVERALL_FUND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-lava-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-lava-950/20 transition hover:bg-lava-600"
            >
              Donate To Overall Fund
            </a>
            {stats.lastSync && (
              <span className="rounded-full border border-white/10 bg-ocean-900/60 px-4 py-2 text-sm text-ocean-200">
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

        {/* Stats row */}
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 sm:gap-5">
          <StatCard value={stats.totalFamilies} label="Families in need" accent />
          <StatCard value={formattedRaised} label="Estimated raised" />
          <StatCard value={stats.islands.length} label="Islands affected" />
        </div>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-6 text-ocean-300">
          {stats.overallFundRaised > 0
            ? `Estimated raised includes ${formattedOverallFundRaised} from the overall GoFundMe relief fund, plus ${stats.trackedFamilies} public family GoFundMe totals from the source sheet.`
            : `Estimated raised is based on ${stats.trackedFamilies} public family GoFundMe totals from the source sheet.`}{" "}
          Venmo, CashApp, SpotFund, and direct website totals are usually not
          public.
        </p>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="#families"
            className="inline-flex items-center gap-2 rounded-full bg-lava-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-lava-500/25 hover:bg-lava-600 transition-all hover:shadow-lava-500/40 hover:-translate-y-0.5"
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
        ? "bg-lava-500/20 ring-1 ring-lava-400/30"
        : "bg-white/5 ring-1 ring-white/10"
    }`}>
      <p className={`text-3xl font-extrabold tabular-nums ${accent ? "text-lava-400" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-ocean-300 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}
