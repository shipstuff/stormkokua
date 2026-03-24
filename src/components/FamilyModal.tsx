"use client";

import { useEffect, useState } from "react";
import type { Family } from "@/lib/db";
import { STORMKOKUA_SHEET_URL } from "@/lib/links";

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

export function FamilyModal({
  family,
  onClose,
}: {
  family: Family | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!family) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [family, onClose]);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  if (!family) return null;

  const handle = formatHandle(family);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="h-[92dvh] max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1.5 w-12 rounded-full bg-slate-200" />
          </div>
          <div className="relative px-4 pb-4 pt-3 sm:px-7 sm:py-4">
            <div className="pr-14">
              <div className="flex flex-wrap items-center gap-2">
                {family.donation_platform && (
                  <span className="rounded-full bg-ocean-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-800">
                    {family.donation_platform}
                  </span>
                )}
                {family.amount_raised !== null && (
                  <span className="rounded-full bg-lava-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lava-700">
                    Raised {formatCurrency(family.amount_raised)}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-bold leading-tight text-slate-950 sm:text-3xl">
                {family.name}
              </h2>
              {family.area && (
                <p className="mt-2 text-sm text-slate-500 sm:text-sm">{family.area}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-3 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-800 sm:right-7 sm:top-4"
              aria-label="Close details"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="space-y-6 px-4 pb-8 pt-5 sm:space-y-8 sm:px-7 sm:py-6"
          style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
        >
          <div className="grid gap-3 sm:flex sm:flex-wrap">
            {family.donation_link && (
              <a
                href={family.donation_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ocean-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-ocean-900 sm:w-auto sm:rounded-full sm:py-3"
              >
                Open Donation Link
              </a>
            )}
            <a
              href={STORMKOKUA_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto sm:rounded-full sm:py-3"
            >
              Open Source Sheet
            </a>
            {handle && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(handle);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto sm:rounded-full sm:py-3"
              >
                {copied ? "Copied" : `Copy ${handle}`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <InfoCard label="Island" value={family.island || "Unknown"} />
            <InfoCard label="Neighborhood" value={family.neighborhood || "Unknown"} />
            <InfoCard label="Platform" value={family.donation_platform || "Unknown"} />
            <InfoCard label="Handle / Campaign" value={handle || "Not public"} />
          </div>

          {family.description && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Full Story
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700 sm:leading-7">
                {family.description}
              </p>
            </section>
          )}

          {family.related_links.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Related Links
              </h3>
              <div className="mt-3 grid gap-3 sm:flex sm:flex-wrap">
                {family.related_links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:max-w-xs"
                  >
                    <span className="block font-semibold text-slate-900">
                      {link.label}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {link.platform || "Link"}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {family.amount_raised !== null && (
            <p className="rounded-2xl bg-lava-50 px-4 py-3 text-sm text-lava-900">
              Public amount data comes from the source sheet&apos;s hourly updated
              GoFundMe totals tab. Venmo, CashApp, SpotFund, and direct website
              totals are usually not public.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-5 text-slate-900">
        {value}
      </p>
    </div>
  );
}
