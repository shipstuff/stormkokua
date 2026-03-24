"use client";

import type { Family } from "@/lib/db";

const platformColors: Record<string, string> = {
  GoFundMe: "bg-emerald-100 text-emerald-800",
  Venmo: "bg-blue-100 text-blue-800",
  CashApp: "bg-green-100 text-green-800",
  SpotFund: "bg-purple-100 text-purple-800",
  Other: "bg-gray-100 text-gray-800",
};

export function FamilyCard({ family }: { family: Family }) {
  const platformClass =
    platformColors[family.donation_platform || "Other"] ||
    platformColors.Other;

  const hasLink =
    family.donation_link &&
    family.donation_link.startsWith("http");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-lg leading-tight">{family.name}</h3>
        {family.donation_platform && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${platformClass}`}
          >
            {family.donation_platform}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
        <span>
          {family.neighborhood && `${family.neighborhood}, `}
          {family.island}
        </span>
      </div>

      {family.description && (
        <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1 line-clamp-4">
          &ldquo;{family.description}&rdquo;
        </p>
      )}

      <div className="mt-auto pt-2">
        {hasLink ? (
          <a
            href={family.donation_link!}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Donate via {family.donation_platform}
          </a>
        ) : family.donation_platform === "Venmo" ||
          family.donation_platform === "CashApp" ? (
          <div className="rounded-lg bg-slate-100 px-4 py-2.5 text-center text-sm text-slate-600">
            Donate via {family.donation_platform}:{" "}
            <span className="font-medium">{family.donation_link}</span>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-100 px-4 py-2.5 text-center text-sm text-slate-600">
            Search &ldquo;{family.name}&rdquo; on{" "}
            {family.donation_platform || "GoFundMe"}
          </div>
        )}
      </div>
    </div>
  );
}
