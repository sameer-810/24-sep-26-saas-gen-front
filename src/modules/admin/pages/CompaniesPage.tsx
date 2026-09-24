import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Building2, CheckCircle2, Clock, PauseCircle, Plus, Search } from "lucide-react";
import { PageLoader } from "@/shared/components/PageLoader";
import { RecordCard } from "@/shared/components/RecordCard";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { Fab } from "@/shared/components/Fab";
import { getApiErrorMessage } from "@/shared/api/http";
import { initialsOf } from "@/lib/utils";
import type { OrgListQuery } from "../api/adminApi";
import { useAdminOrgs, useAdminOverview } from "../hooks/useAdminOrgs";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import {
  OrgStatusChip,
  Pager,
  adminBtnPrimary,
  adminInput,
  adminPanel,
  adminRow,
  adminTd,
  adminTh,
} from "../components/AdminUi";

type Status = NonNullable<OrgListQuery["status"]>;

const STATUS_FILTERS: Array<{ value: Status; label: string }> = [
  { value: "", label: "All" },
  { value: "pending", label: "Awaiting approval" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Declined" },
];

const STATUS_VALUES = new Set<string>(STATUS_FILTERS.map((f) => f.value));

const INTERACTIVE = "a, button, input, select, textarea, label, [role='button'], [data-row-ignore]";

/**
 * Staff drag across a cell to copy an email; the click fires on mouseup at the
 * end of that drag, and a row that opens a company then is worse than a row
 * that never opened.
 */
function isSelectingText(row: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return false;
  if (sel.toString().trim() === "") return false;
  return sel.containsNode(row, true);
}

/**
 * Every company on the platform.
 *
 * `search` and `status` live in the URL so the top bar's search box and the
 * bell can land here with a filter already applied.
 */
export function CompaniesPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [params, setParams] = useSearchParams();

  const search = params.get("search") ?? "";
  const rawStatus = params.get("status") ?? "";
  const status = (STATUS_VALUES.has(rawStatus) ? rawStatus : "") as Status;

  const [searchInput, setSearchInput] = useState(search);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // The URL is the source of truth; the input is a debounced editor of it.
  useEffect(() => setSearchInput(search), [search]);
  useEffect(() => setPage(1), [search, status]);
  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchInput.trim();
      if (next === search) return;
      setParams(
        (p) => {
          if (next) p.set("search", next);
          else p.delete("search");
          return p;
        },
        { replace: true },
      );
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search, setParams]);

  const overview = useAdminOverview();
  const { data, isLoading, isError, error } = useAdminOrgs({ page, limit, search, status });

  const stats = overview.data;
  const rows = data?.items ?? [];
  const filtered = Boolean(search || status);

  function openCompany(e: React.MouseEvent<HTMLTableRowElement>, id: string) {
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    if (isSelectingText(e.currentTarget)) return;
    const href = `/admin/companies/${id}`;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(href);
  }

  const pager = data && (
    <Pager
      page={data.meta.page}
      limit={data.meta.limit}
      total={data.meta.total}
      totalPages={data.meta.totalPages}
      onPage={setPage}
      onLimit={(n) => {
        setLimit(n);
        setPage(1);
      }}
    />
  );

  return (
    <div className="space-y-8" data-testid="admin-companies-page">
      <PageHeader
        crumbs={[{ label: "Companies" }]}
        title="Companies"
        subtitle="Every company on the platform — approve registrations, assign plans and manage access."
        action={
          <Link
            to="/admin/companies/new"
            className={`${adminBtnPrimary} hidden h-[50px] px-6 text-base md:inline-flex`}
          >
            <Plus className="h-5 w-5" /> New company
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total companies"
          value={stats?.totalOrgs ?? "—"}
          icon={Building2}
          tone="blue"
        />
        <StatCard
          label="Awaiting approval"
          value={stats?.pendingOrgs ?? "—"}
          icon={Clock}
          tone="amber"
        />
        <StatCard label="Active" value={stats?.activeOrgs ?? "—"} icon={CheckCircle2} tone="green" />
        <StatCard
          label="Suspended"
          value={stats?.suspendedOrgs ?? "—"}
          icon={PauseCircle}
          tone="red"
        />
      </div>

      <div className={`${adminPanel} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-0 flex-1 md:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={`${adminInput} pl-10`}
              placeholder="Search company, email or GSTIN"
              aria-label="Search companies"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            className={`${adminInput} md:w-52`}
            aria-label="Filter by status"
            value={status}
            onChange={(e) =>
              setParams(
                (p) => {
                  if (e.target.value) p.set("status", e.target.value);
                  else p.delete("status");
                  return p;
                },
                { replace: true },
              )
            }
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <p className="p-10 text-center text-sm text-rose-600">{getApiErrorMessage(error)}</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? "No companies match" : "No companies yet"}
            subtitle={
              filtered
                ? "Try a different search or clear the status filter."
                : "Create your first company to start onboarding customers."
            }
            action={
              !filtered && (
                <Link to="/admin/companies/new" className={adminBtnPrimary}>
                  <Plus className="h-5 w-5" /> Create your first company
                </Link>
              )
            }
          />
        ) : isMobile ? (
          <>
            <div className="space-y-2 p-3">
              {rows.map((org) => (
                <RecordCard
                  key={org.id}
                  to={`/admin/companies/${org.id}`}
                  disc={initialsOf(org.name)}
                  title={org.name}
                  meta={[
                    org.owner?.email || "No owner",
                    <span key="counts" className="tabular-nums">
                      {org.stats.users}u · {org.stats.leads}l · {org.stats.quotations}q ·{" "}
                      {org.stats.sales}s
                    </span>,
                  ]}
                  badge={<OrgStatusChip org={org} />}
                  onClick={() => navigate(`/admin/companies/${org.id}`)}
                />
              ))}
            </div>
            {pager}
          </>
        ) : (
          <>
            <div className="max-h-[calc(100vh-30rem)] min-h-[16rem] overflow-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border">
                    {["Company", "Owner", "Users", "Leads", "Quotations", "Sales", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          scope="col"
                          className={`${adminTh} ${
                            ["Users", "Leads", "Quotations", "Sales"].includes(h)
                              ? "text-right"
                              : ""
                          }`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((org) => (
                    <tr
                      key={org.id}
                      onClick={(e) => openCompany(e, org.id)}
                      onAuxClick={(e) => openCompany(e, org.id)}
                      className={`${adminRow} cursor-pointer`}
                    >
                      <td className={`${adminTd} font-semibold`}>
                        <Link
                          to={`/admin/companies/${org.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {org.name}
                        </Link>
                      </td>
                      <td className={`${adminTd} text-muted-foreground`}>
                        {org.owner?.email || <span className="italic">No owner</span>}
                      </td>
                      <td className={`${adminTd} text-right tabular-nums`}>{org.stats.users}</td>
                      <td className={`${adminTd} text-right tabular-nums`}>{org.stats.leads}</td>
                      <td className={`${adminTd} text-right tabular-nums`}>
                        {org.stats.quotations}
                      </td>
                      <td className={`${adminTd} text-right tabular-nums`}>{org.stats.sales}</td>
                      <td className={adminTd}>
                        <OrgStatusChip org={org} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pager}
          </>
        )}
      </div>

      <Fab label="New company" onClick={() => navigate("/admin/companies/new")} />
    </div>
  );
}
