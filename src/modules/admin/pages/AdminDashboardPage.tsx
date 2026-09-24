import { Link } from "react-router-dom";
import { Building2, CheckCircle2, Clock, Layers, PauseCircle, Plus } from "lucide-react";
import { PageLoader } from "@/shared/components/PageLoader";
import { getApiErrorMessage } from "@/shared/api/http";
import { formatDate } from "@/lib/utils";
import { useAdminOrgs, useAdminOverview } from "../hooks/useAdminOrgs";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import {
  OrgStatusChip,
  SectionTitle,
  adminBtnPrimary,
  adminBtnSecondary,
  adminPanel,
} from "../components/AdminUi";

export function AdminDashboardPage() {
  const overview = useAdminOverview();
  const recent = useAdminOrgs({ page: 1, limit: 5 });
  const stats = overview.data;
  const rows = recent.data?.items ?? [];

  return (
    <div className="space-y-8" data-testid="admin-dashboard-page">
      <PageHeader
        crumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        subtitle="A snapshot of every company on the platform and what needs your attention."
        action={
          <Link to="/admin/companies/new" className={`${adminBtnPrimary} h-[50px] px-6 text-base`}>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className={`${adminPanel} overflow-hidden lg:col-span-2`}>
          <div className="px-6 pt-6">
            <SectionTitle
              action={
                <Link
                  to="/admin/companies"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View all
                </Link>
              }
            >
              Recent companies
            </SectionTitle>
          </div>
          {recent.isLoading ? (
            <PageLoader />
          ) : recent.isError ? (
            <p className="px-6 pb-6 text-sm text-rose-600">{getApiErrorMessage(recent.error)}</p>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No companies yet"
              subtitle="Create the first company to get the platform going."
              action={
                <Link to="/admin/companies/new" className={adminBtnPrimary}>
                  <Plus className="h-5 w-5" /> New company
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {rows.map((org) => (
                <li key={org.id}>
                  <Link
                    to={`/admin/companies/${org.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{org.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {org.owner?.email || "No owner"} · {formatDate(org.createdAt)}
                      </p>
                    </div>
                    <OrgStatusChip org={org} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${adminPanel} p-6`}>
          <SectionTitle>Quick actions</SectionTitle>
          <div className="flex flex-col gap-3">
            <Link to="/admin/companies/new" className={adminBtnPrimary}>
              <Building2 className="h-4 w-4" /> New company
            </Link>
            <Link to="/admin/plans" className={adminBtnSecondary}>
              <Layers className="h-4 w-4" /> New plan
            </Link>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">{stats?.totalUsers ?? "—"}</span> users
            and{" "}
            <span className="font-semibold text-foreground">{stats?.totalLeads ?? "—"}</span> leads
            across all companies.
          </p>
        </section>
      </div>
    </div>
  );
}
