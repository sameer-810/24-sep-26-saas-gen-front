import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/**
 * The public site's visual language. Deliberately NOT the CRM's tokens: the
 * site is always light, and its accent is whatever the CMS says (`--site-primary`),
 * so every colour here is either an explicit slate or one of the two site vars.
 */

/** "howItWorks" → "how-it-works": the id every section renders and every "#anchor" is normalised to. */
export const anchorId = (key: string) => key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

export const container = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";

export const eyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--site-primary)]";

export const h2 =
  "mt-3 text-[28px] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-[34px]";

export const lead = "mt-3 max-w-2xl text-[17px] leading-relaxed text-slate-600";

export const card =
  "rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-24px_rgba(15,23,42,0.18)]";

export const btnPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--site-primary)] px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_var(--site-primary)] transition-[filter,transform] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-primary)] focus-visible:ring-offset-2 active:translate-y-px";

export const btnSecondary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-[15px] font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-primary)] focus-visible:ring-offset-2";

export const btnOnDark =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

/** The small tinted square that fronts every feature/benefit/step card. */
export function IconTile({ icon, className }: { icon: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--site-primary-soft)] text-[var(--site-primary)]",
        className,
      )}
    >
      <Icon name={icon} className="h-5 w-5" />
    </span>
  );
}

export function SectionHeading({
  eyebrow: kicker,
  title,
  description,
  align = "left",
  onDark,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  onDark?: boolean;
}) {
  if (!title && !description) return null;
  return (
    <div className={cn(align === "center" && "mx-auto text-center")}>
      {kicker && <p className={eyebrow}>{kicker}</p>}
      {title && <h2 className={cn(h2, onDark && "text-white")}>{title}</h2>}
      {description && (
        <p className={cn(lead, align === "center" && "mx-auto", onDark && "text-slate-300")}>
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * One link component for everything the CMS can point at: "#faq" scrolls,
 * "/login" routes, "https://…" opens in a new tab. An empty href renders nothing
 * clickable so a half-filled CMS never ships a dead button.
 */
export function SmartLink({
  href,
  className,
  children,
  ariaLabel,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const target = (href || "").trim();
  if (!target) return null;
  if (/^(https?:|mailto:|tel:)/i.test(target)) {
    const external = /^https?:/i.test(target);
    return (
      <a
        href={target}
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  if (target.startsWith("#")) {
    return (
      <a
        href={`#${anchorId(target.slice(1))}`}
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={target} className={className} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </Link>
  );
}
