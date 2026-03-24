"use client";

interface FilterBarProps {
  islands: { island: string; count: number }[];
  selectedIsland: string;
  searchQuery: string;
  onIslandChange: (island: string) => void;
  onSearchChange: (query: string) => void;
  resultCount: number;
}

export function FilterBar({
  islands,
  selectedIsland,
  searchQuery,
  onIslandChange,
  onSearchChange,
  resultCount,
}: FilterBarProps) {
  return (
    <div id="families" className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-md py-4 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onIslandChange("")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                selectedIsland === ""
                  ? "bg-ocean-950 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {islands.map((island) => (
              <button
                key={island.island}
                onClick={() => onIslandChange(island.island)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  selectedIsland === island.island
                    ? "bg-ocean-950 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {island.island}
                <span className="ml-1 opacity-50">{island.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search families..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:bg-white sm:w-56"
              />
            </div>
            <span className="hidden text-sm font-medium text-slate-400 tabular-nums sm:block">
              {resultCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
