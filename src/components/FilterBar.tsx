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
    <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onIslandChange("")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedIsland === ""
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              All Islands
            </button>
            {islands.map((island) => (
              <button
                key={island.island}
                onClick={() => onIslandChange(island.island)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedIsland === island.island
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                {island.island}{" "}
                <span className="opacity-60">({island.count})</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name or area..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Showing {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
      </div>
    </div>
  );
}
