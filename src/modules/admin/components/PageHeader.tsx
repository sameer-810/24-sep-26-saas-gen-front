import type { ReactNode } from "react";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export type Crumb = { label: string; to?: string };

/** Home icon → "/" → each crumb. The last crumb is the current page. */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-[15px] text-muted-foreground">
      <Link to="/admin" aria-label="Dashboard" className="transition-colors hover:text-foreground">
        <Home className="h-5 w-5" />
      </Link>
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true">/</span>
          {c.to ? (
            <Link to={c.to} className="truncate transition-colors hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span aria-current="page" className="truncate text-foreground/80">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  crumbs,
  title,
  subtitle,
  action,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  /** Primary action, top-right — a button or link styled with `adminBtnPrimary`. */
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-5 flex flex-wrap items-center gap-3 text-[34px] font-bold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-[17px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
