"use client";

import { useState, useMemo } from "react";
import type { Family } from "@/lib/db";
import { MetricsBanner } from "./MetricsBanner";
import { FilterBar } from "./FilterBar";
import { FamilyCard } from "./FamilyCard";

interface Stats {
  totalFamilies: number;
  islands: { island: string; count: number }[];
  areas: { area: string; count: number }[];
  lastSync: string | null;
}

export function HomePage({
  initialFamilies,
  initialStats,
}: {
  initialFamilies: Family[];
  initialStats: Stats;
}) {
  const [selectedIsland, setSelectedIsland] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let results = initialFamilies;

    if (selectedIsland) {
      results = results.filter((f) => f.island === selectedIsland);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.area && f.area.toLowerCase().includes(q)) ||
          (f.neighborhood && f.neighborhood.toLowerCase().includes(q)) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    return results;
  }, [initialFamilies, selectedIsland, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50">
      <MetricsBanner stats={initialStats} />

      <FilterBar
        islands={initialStats.islands}
        selectedIsland={selectedIsland}
        searchQuery={searchQuery}
        onIslandChange={setSelectedIsland}
        onSearchChange={setSearchQuery}
        resultCount={filtered.length}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((family) => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-slate-400">
              No results found.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">
            Data sourced from community-maintained records.
          </p>
          {initialStats.lastSync && (
            <p className="mt-1 text-xs text-slate-400">
              Last synced{" "}
              {new Date(initialStats.lastSync + "Z").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <a
              href="https://bit.ly/stormkokua"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean-600 font-medium hover:text-ocean-800 transition-colors"
            >
              Original Spreadsheet
            </a>
            <span className="text-slate-300">|</span>
            <a
              href="https://github.com/shipstuff/stormkokua"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean-600 font-medium hover:text-ocean-800 transition-colors"
            >
              Contribute on GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
