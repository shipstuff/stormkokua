"use client";

import { useState, useMemo } from "react";
import type { Family } from "@/lib/db";
import { MetricsBanner } from "./MetricsBanner";
import { FilterBar } from "./FilterBar";
import { FamilyCard } from "./FamilyCard";
import { FamilyModal } from "./FamilyModal";

interface Stats {
  totalFamilies: number;
  totalRaised: number;
  familyRaised: number;
  overallFundRaised: number;
  trackedFamilies: number;
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
  const [sortOrder, setSortOrder] = useState<
    "default" | "amount-asc" | "amount-desc"
  >("default");
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);

  const filtered = useMemo(() => {
    let results = [...initialFamilies];

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
          (f.description && f.description.toLowerCase().includes(q)) ||
          (f.donation_handle && f.donation_handle.toLowerCase().includes(q)) ||
          f.related_links.some((link) => link.label.toLowerCase().includes(q))
      );
    }

    if (sortOrder !== "default") {
      results.sort((a, b) => {
        const aAmount = a.amount_raised;
        const bAmount = b.amount_raised;

        if (aAmount === null && bAmount === null) {
          return a.name.localeCompare(b.name);
        }

        if (aAmount === null) return 1;
        if (bAmount === null) return -1;

        if (sortOrder === "amount-asc") {
          return aAmount - bAmount || a.name.localeCompare(b.name);
        }

        return bAmount - aAmount || a.name.localeCompare(b.name);
      });
    }

    return results;
  }, [initialFamilies, searchQuery, selectedIsland, sortOrder]);

  return (
    <main className="min-h-screen bg-slate-50">
      <MetricsBanner stats={initialStats} />

      <FilterBar
        islands={initialStats.islands}
        selectedIsland={selectedIsland}
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        onIslandChange={setSelectedIsland}
        onSearchChange={setSearchQuery}
        onSortChange={setSortOrder}
        resultCount={filtered.length}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((family) => (
            <FamilyCard
              key={family.id}
              family={family}
              onSelect={setSelectedFamily}
            />
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
        </div>
      </footer>

      <FamilyModal
        family={selectedFamily}
        onClose={() => setSelectedFamily(null)}
      />
    </main>
  );
}
