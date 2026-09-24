import { ArrowRight, CheckCircle2, Phone, TrendingUp, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebsiteHero } from "../../types";
import { SmartLink, btnPrimary, btnSecondary, container, eyebrow } from "../ui";

/**
 * A quiet, dark CRM panel standing in for a screenshot when the CMS has none.
 * It reads the hero's own highlights so it stays on-message without inventing
 * numbers of its own.
 */
function DashboardMock({ highlights }: { highlights: WebsiteHero["highlights"] }) {
  const stats = highlights.filter((h) => h.label || h.value).slice(0, 4);
  return (
    <div
      aria-hidden="true"
      className="relative rounded-2xl border border-slate-700/60 bg-slate-900 p-4 text-slate-200 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.6)] sm:p-5"
    >
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--site-primary-glow)] text-[var(--site-primary)]">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="h-2.5 w-28 rounded bg-slate-500/70" />
            <div className="mt-2 h-2 w-40 rounded bg-slate-600/60" />
          </div>
          <span className="rounded-full bg-[var(--site-primary)] px-2.5 py-1 text-[11px] font-semibold text-white">
            New lead
          </span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full rounded bg-slate-700/70" />
          <div className="h-2 w-5/6 rounded bg-slate-700/70" />
          <div className="h-2 w-2/3 rounded bg-slate-700/70" />
        </div>
      </div>

      <div className="my-3 flex justify-center text-[var(--site-primary)]">
        <ArrowRight className="h-4 w-4 rotate-90" />
      </div>

      <div className="rounded-xl border border-[var(--site-primary-line)] bg-[var(--site-primary-glow)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--site-primary)]">
          Pipeline
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {["Qualified", "Quoted", "Follow-up", "Won"].map((stage, i) => (
            <div
              key={stage}
              className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-xs font-medium"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  i === 3 ? "bg-emerald-400" : "bg-[var(--site-primary)]",
                )}
              />
              {stage}
            </div>
          ))}
        </div>
      </div>

      <div className="my-3 flex justify-center text-[var(--site-primary)]">
        <ArrowRight className="h-4 w-4 rotate-90" />
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-slate-200">
            <Phone className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="h-2.5 w-24 rounded bg-slate-500/70" />
            <div className="mt-2 h-2 w-36 rounded bg-slate-600/60" />
          </div>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Quotation sent · follow-up scheduled
        </div>
      </div>

      {stats.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-lg bg-slate-800/80 px-3 py-2">
              <dt className="truncate text-[11px] text-slate-400">{s.label}</dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function Hero({ hero }: { hero: WebsiteHero }) {
  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--site-primary-tint)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_50%_at_80%_0%,var(--site-primary-soft),transparent)]"
      />
      <div
        className={cn(
          container,
          "relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24",
        )}
      >
        <div>
          {hero.badge && <p className={eyebrow}>{hero.badge}</p>}
          <h1 className="mt-4 text-[34px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-[44px] lg:text-[52px]">
            {hero.heading}
          </h1>
          {hero.description && (
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-slate-600 sm:text-lg">
              {hero.description}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {hero.primaryButtonText && (
              <SmartLink href={hero.primaryButtonUrl || "/login"} className={btnPrimary}>
                {hero.primaryButtonText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </SmartLink>
            )}
            {hero.secondaryButtonText && (
              <SmartLink href={hero.secondaryButtonUrl} className={btnSecondary}>
                {hero.secondaryButtonText}
              </SmartLink>
            )}
          </div>
          {hero.supportingText && (
            <p className="mt-5 text-sm text-slate-500">{hero.supportingText}</p>
          )}
        </div>

        <div className="lg:justify-self-end lg:w-full lg:max-w-[540px]">
          {hero.imageUrl ? (
            <img
              src={hero.imageUrl}
              alt=""
              className="w-full rounded-2xl border border-slate-200 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.4)]"
            />
          ) : (
            <DashboardMock highlights={hero.highlights ?? []} />
          )}
        </div>
      </div>
    </section>
  );
}
