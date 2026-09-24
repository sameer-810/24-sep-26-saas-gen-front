import { useState } from "react";
import { Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { PublicPlan, WebsitePricing } from "../../types";
import { SectionHeading, SmartLink, btnOnDark, btnPrimary, container } from "../ui";

/**
 * Plan cards from `plans`, exactly as the server decorated them. The toggle
 * only chooses WHICH stored figure to headline (perMonth vs total); nothing is
 * multiplied, divided or rounded here.
 */
type Mode = "month" | "total";

function limitText(n: number): string {
  return n === 0 ? "Unlimited" : String(n);
}

function PlanCard({ plan, mode, ctaText }: { plan: PublicPlan; mode: Mode; ctaText: string }) {
  const featured = plan.isFeatured;
  const headline = mode === "month" ? plan.perMonth : plan.total;
  const suffix =
    mode === "month" ? "/month" : plan.termMonths > 1 ? `for ${plan.termMonths} months` : "/month";
  const badge = plan.badge || (plan.savePct > 0 ? `Save ${plan.savePct}%` : "");

  return (
    <li
      className={cn(
        "relative flex flex-col rounded-2xl border p-7",
        featured
          ? "border-slate-800 bg-slate-950 text-white shadow-[0_30px_60px_-30px_rgba(15,23,42,0.6)] lg:-my-4"
          : "border-slate-200 bg-white text-slate-900",
      )}
    >
      {badge && (
        <span
          className={cn(
            "absolute right-5 top-5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            featured
              ? "bg-[var(--site-primary)] text-white"
              : "bg-[var(--site-primary-soft)] text-[var(--site-primary)]",
          )}
        >
          {badge}
        </span>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--site-primary)]">
        {plan.name}
      </p>
      {plan.tagline && (
        <p className={cn("mt-1 text-sm", featured ? "text-slate-300" : "text-slate-500")}>
          {plan.tagline}
        </p>
      )}
      <p className="mt-5 flex items-baseline gap-2">
        <span className="font-mono text-[36px] font-semibold leading-none tabular-nums">
          {formatCurrency(headline)}
        </span>
        <span className={cn("text-sm", featured ? "text-slate-400" : "text-slate-500")}>
          {suffix}
        </span>
      </p>
      <p
        className={cn("mt-2 text-xs tabular-nums", featured ? "text-slate-400" : "text-slate-500")}
      >
        {mode === "month" && plan.termMonths > 1 && (
          <>
            {formatCurrency(plan.total)} billed for {plan.termMonths} months
          </>
        )}
        {mode === "total" && plan.termMonths > 1 && <>{formatCurrency(plan.perMonth)} per month</>}
        {plan.reference > plan.total && (
          <>
            {" · "}
            <span className="line-through">{formatCurrency(plan.reference)}</span>
          </>
        )}
      </p>
      {plan.description && (
        <p
          className={cn(
            "mt-4 text-sm leading-relaxed",
            featured ? "text-slate-300" : "text-slate-600",
          )}
        >
          {plan.description}
        </p>
      )}
      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <Check
              className={cn("mt-0.5 h-4 w-4 shrink-0", "text-[var(--site-primary)]")}
              aria-hidden="true"
            />
            <span className={featured ? "text-slate-200" : "text-slate-700"}>{f}</span>
          </li>
        ))}
      </ul>
      <p
        className={cn(
          "mt-6 border-t pt-4 font-mono text-xs tabular-nums",
          featured ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500",
        )}
      >
        {limitText(plan.maxUsers)} users · {limitText(plan.maxProducts)} products ·{" "}
        {limitText(plan.maxLeads)} leads
      </p>
      <SmartLink
        href="/login"
        className={cn(
          featured ? btnPrimary : btnOnDark,
          "mt-5 w-full",
          !featured && "border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
        )}
      >
        {ctaText || "Get started"}
      </SmartLink>
    </li>
  );
}

export function Pricing({ pricing, plans }: { pricing: WebsitePricing; plans: PublicPlan[] }) {
  const [mode, setMode] = useState<Mode>("month");
  if (!plans.length && !pricing.heading) return null;
  return (
    <section id="pricing" className="bg-slate-50 py-20 sm:py-24">
      <div className={container}>
        <SectionHeading
          eyebrow="Pricing"
          title={pricing.heading}
          description={pricing.description}
          align="center"
        />
        {pricing.showToggle && plans.length > 0 && (
          <div
            role="group"
            aria-label="Price display"
            className="mx-auto mt-8 inline-flex w-auto rounded-full border border-slate-200 bg-white p-1"
          >
            {(["month", "total"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  mode === m ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {m === "month" ? "Per month" : "Total"}
              </button>
            ))}
          </div>
        )}
        {plans.length > 0 ? (
          <ul
            className={cn(
              "mt-12 grid grid-cols-1 gap-6 lg:items-center",
              plans.length === 1 && "mx-auto max-w-md",
              plans.length === 2 && "mx-auto max-w-3xl md:grid-cols-2",
              plans.length >= 3 && "md:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} mode={mode} ctaText={pricing.ctaText} />
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-center text-sm text-slate-500">
            Plans are being finalised. Contact us for a quote.
          </p>
        )}
      </div>
    </section>
  );
}
