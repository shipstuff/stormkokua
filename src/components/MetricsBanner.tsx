"use client";

interface Stats {
  totalFamilies: number;
  islands: { island: string; count: number }[];
}

export function MetricsBanner({ stats }: { stats: Stats }) {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Storm Kōkua
          </h1>
          <p className="mt-2 text-blue-100 text-lg">
            Kona Low Storm Relief — Hawaiʻi 2026
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8">
          <MetricCard
            label="Families & Orgs"
            value={stats.totalFamilies}
          />
          <MetricCard
            label="Islands Affected"
            value={stats.islands.length}
          />
          {stats.islands.slice(0, 2).map((island) => (
            <MetricCard
              key={island.island}
              label={island.island}
              value={island.count}
              suffix="affected"
            />
          ))}
        </div>
        <p className="mt-6 text-center text-blue-100 text-sm">
          Every donation makes a difference. Browse below to find families and
          organizations that need your help.
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-4 text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-blue-100">
        {label}
        {suffix && <span className="block text-xs opacity-75">{suffix}</span>}
      </p>
    </div>
  );
}
