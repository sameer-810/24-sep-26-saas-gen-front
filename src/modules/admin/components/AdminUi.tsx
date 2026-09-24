import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/Badge";
import type { AdminOrganization } from "../types";

/**
 * The console's visual language, as a handful of class strings and the few
 * controls every screen repeats. The console is deliberately NOT on the tenant
 * CRM's palette rules (DESIGN.md): the product owner signed off a reference
 * design with tinted icon tiles, rounded-2xl panels and a soft shadow, and
 * every constant below exists so eight screens draw it identically.
 */

export const adminPanel =
  "rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-20px_rgba(15,23,42,0.14)]";

export const adminInput =
  "w-full min-w-0 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60";

export const adminBtnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)] transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

export const adminBtnSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

export const adminBtnSmall =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-card";

export const adminTh =
  "whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground";

export const adminTd = "px-5 py-3.5 align-middle";

export const adminRow = "transition-colors hover:bg-muted/50";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] font-medium text-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A labelled read-only fact. Values that are numbers, dates or IDs pass `mono`. */
export function Fact({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 break-words text-sm font-medium", mono && "font-mono tabular-nums")}>
        {value === "" || value == null ? <span className="text-muted-foreground">—</span> : value}
      </p>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-bold tracking-tight text-foreground">{children}</h2>
      {action}
    </div>
  );
}

/**
 * A company's state, as one chip.
 *
 * Suspension and approval are separate columns in the database on purpose, and
 * the order here is the order that matters to an operator: a declined or
 * pending registration cannot sign in at all, so it outranks suspension.
 */
export function OrgStatusChip({
  org,
}: {
  org: Pick<AdminOrganization, "approvalStatus" | "status">;
}) {
  if (org.approvalStatus === "pending") return <Badge tone="warning">Awaiting approval</Badge>;
  if (org.approvalStatus === "rejected") return <Badge tone="danger">Declined</Badge>;
  if (org.status === "suspended") return <Badge tone="danger">Suspended</Badge>;
  return <Badge tone="success">Active</Badge>;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  destructive,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <div className="mt-2 space-y-3 text-sm text-muted-foreground">{body}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className={adminBtnSecondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              adminBtnPrimary,
              destructive && "bg-rose-600 shadow-none hover:bg-rose-700",
            )}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const ROWS_PER_PAGE = [10, 20, 50, 100];

export function Pager({
  page,
  limit,
  total,
  totalPages,
  onPage,
  onLimit,
}: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <label htmlFor="rows-per-page" className="text-xs">
          Rows
        </label>
        <select
          id="rows-per-page"
          className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs tabular-nums text-foreground"
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
        >
          {ROWS_PER_PAGE.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="text-xs tabular-nums">
          {from}–{to} of {total}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className={adminBtnSmall}
        >
          Previous
        </button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className={adminBtnSmall}
        >
          Next
        </button>
      </div>
    </div>
  );
}
