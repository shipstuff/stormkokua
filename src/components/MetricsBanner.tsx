"use client";

interface Stats {
  totalFamilies: number;
  islands: { island: string; count: number }[];
}

export function MetricsBanner({ stats }: { stats: Stats }) {
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
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 max-w-3xl mx-auto">
          <StatCard value={stats.totalFamilies} label="Families in need" accent />
          <StatCard value={stats.islands.length} label="Islands affected" />
          {stats.islands.slice(0, 2).map((island) => (
            <StatCard
              key={island.island}
              value={island.count}
              label={island.island}
            />
          ))}
        </div>

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
  value: number;
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
