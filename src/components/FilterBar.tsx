"use client";

interface FilterBarProps {
  islands: { island: string; count: number }[];
  selectedIsland: string;
  searchQuery: string;
  sortOrder: "default" | "amount-asc" | "amount-desc";
  onIslandChange: (island: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sortOrder: "default" | "amount-asc" | "amount-desc") => void;
  resultCount: number;
}

export function FilterBar({
  islands,
  selectedIsland,
  searchQuery,
  sortOrder,
  onIslandChange,
  onSearchChange,
  onSortChange,
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h13.5M3 12h9m-9 4.5h6m9-12v15m0 0l3-3m-3 3l-3-3" />
              </svg>
              <select
                value={sortOrder}
                onChange={(e) =>
                  onSortChange(
                    e.target.value as "default" | "amount-asc" | "amount-desc"
                  )
                }
                className="w-full appearance-none rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-9 text-sm text-slate-700 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:bg-white sm:w-52"
              >
                <option value="default">Sort: Name</option>
                <option value="amount-asc">Amount: Low to High</option>
                <option value="amount-desc">Amount: High to Low</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25L12 15.75 4.5 8.25" />
              </svg>
            </div>
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
