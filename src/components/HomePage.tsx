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
    <main className="min-h-screen">
      <MetricsBanner stats={initialStats} />

      <FilterBar
        islands={initialStats.islands}
        selectedIsland={selectedIsland}
        searchQuery={searchQuery}
        onIslandChange={setSelectedIsland}
        onSearchChange={setSearchQuery}
        resultCount={filtered.length}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((family) => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-500">
              No results found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p>
            Data sourced from community-maintained records.{" "}
            {initialStats.lastSync && (
              <span>
                Last updated:{" "}
                {new Date(initialStats.lastSync + "Z").toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }
                )}
              </span>
            )}
          </p>
          <p className="mt-2">
            <a
              href="https://bit.ly/stormkokua"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View original spreadsheet
            </a>
            {" | "}
            <a
              href="https://github.com/shipstuff/stormkokua"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Contribute on GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
