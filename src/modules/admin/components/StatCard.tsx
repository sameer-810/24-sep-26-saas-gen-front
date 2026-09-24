import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { adminPanel } from "./AdminUi";

export type StatTone = "blue" | "green" | "amber" | "purple" | "red";

const TONES: Record<StatTone, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
  purple: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  red: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
};

type Icon = ComponentType<{ className?: string }>;

/** A pastel-tinted rounded square with the icon in the matching saturated colour. */
export function IconTile({
  icon: Icon,
  tone,
  className,
}: {
  icon: Icon;
  tone: StatTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl",
        TONES[tone],
        className,
      )}
      aria-hidden="true"
    >
      <Icon className="h-7 w-7" />
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  icon: Icon;
  tone: StatTone;
}) {
  return (
    <div className={cn(adminPanel, "flex items-center gap-6 p-6")}>
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="text-[15px] text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-3xl font-bold leading-none tabular-nums text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
