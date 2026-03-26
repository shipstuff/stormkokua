"use client";

import type { Family } from "@/lib/db";

const platformStyles: Record<string, { bg: string; text: string; btn: string }> = {
  GoFundMe: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
  },
  Venmo: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
  },
  CashApp: {
    bg: "bg-green-50",
    text: "text-green-700",
    btn: "bg-green-600 hover:bg-green-700 shadow-green-600/20",
  },
  SpotFund: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    btn: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
  },
  Website: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
  },
  Other: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    btn: "bg-slate-600 hover:bg-slate-700 shadow-slate-600/20",
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatHandle(family: Family) {
  if (!family.donation_handle) return null;

  if (family.donation_platform === "CashApp") {
    return `$${family.donation_handle}`;
  }

  if (family.donation_platform === "Venmo") {
    return `@${family.donation_handle}`;
  }

  return family.donation_handle;
}

export function FamilyCard({
  family,
  onSelect,
}: {
  family: Family;
  onSelect: (family: Family) => void;
}) {
  const style = platformStyles[family.donation_platform || "Other"] || platformStyles.Other;
  const hasLink = family.donation_link && family.donation_link.startsWith("http");
  const handle = formatHandle(family);

  return (
    <article
      className="group relative flex h-full min-w-0 cursor-pointer flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-lg"
      onClick={() => onSelect(family)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="min-w-0 flex-1 font-bold text-base leading-snug text-slate-900 transition-colors group-hover:text-ocean-700">
          {family.name}
        </h3>
        {family.donation_platform && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}>
            {family.donation_platform}
          </span>
        )}
      </div>

      {/* Location */}
      {(family.neighborhood || family.island) && (
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
          <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="truncate">
            {family.neighborhood && `${family.neighborhood}, `}
            {family.island}
          </span>
        </div>
      )}

      {family.amount_raised !== null && (
        <div className="mb-3 inline-flex w-fit rounded-full bg-lava-50 px-3 py-1 text-sm font-semibold text-lava-700">
          Raised {formatCurrency(family.amount_raised)}
        </div>
      )}

      {family.amount_raised === null && handle && (
        <div className="mb-3 inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {handle}
        </div>
      )}

      {/* Description */}
      {family.description && (
        <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1 line-clamp-3">
          {family.description}
        </p>
      )}

      {/* Action */}
      <div className="mt-auto space-y-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(family);
          }}
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          View Details
        </button>

        {hasLink ? (
          <a
            href={family.donation_link!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className={`flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${style.btn}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            Donate Now
          </a>
        ) : (
          <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-center text-sm text-slate-500">
            No public direct donation link was exposed in the sheet for this
            family yet.
          </div>
        )}
      </div>
    </article>
  );
}
