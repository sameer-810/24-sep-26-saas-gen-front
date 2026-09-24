import type { ReactNode } from "react";

/** A document with three lines, a soft cloud behind, a sparkle and a "+" disc. */
function Illustration() {
  return (
    <svg viewBox="0 0 250 150" className="h-[150px] w-[250px]" aria-hidden="true">
      <g className="fill-blue-100/70 dark:fill-blue-400/10">
        <ellipse cx="128" cy="112" rx="112" ry="36" />
        <circle cx="82" cy="86" r="42" />
        <circle cx="160" cy="78" r="50" />
      </g>
      <rect
        x="76"
        y="14"
        width="92"
        height="116"
        rx="10"
        className="fill-white stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-700"
      />
      <rect x="92" y="38" width="46" height="6" rx="3" className="fill-blue-300 dark:fill-blue-500/60" />
      <rect x="92" y="56" width="60" height="6" rx="3" className="fill-blue-100 dark:fill-slate-600" />
      <rect x="92" y="74" width="36" height="6" rx="3" className="fill-blue-100 dark:fill-slate-600" />
      <g className="stroke-blue-400" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M186 22 L181 10" />
        <path d="M194 26 L204 17" />
        <path d="M198 36 L212 33" />
      </g>
      <circle cx="165" cy="108" r="22" className="fill-blue-600" />
      <path
        d="M165 98v20M155 108h20"
        className="stroke-white"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <Illustration />
      <h2 className="mt-8 text-[26px] font-bold tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="mt-2 max-w-xl text-[17px] text-muted-foreground">{subtitle}</p>}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
