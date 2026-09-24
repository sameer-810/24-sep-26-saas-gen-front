import { useState } from "react";
import { PageLoader } from "@/shared/components/PageLoader";
import { RecordCard } from "@/shared/components/RecordCard";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { getApiErrorMessage } from "@/shared/api/http";
import { formatDateTime } from "@/lib/utils";
import { useAdminAudit } from "../hooks/useAdminAudit";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Pager, adminInput, adminPanel, adminRow, adminTd, adminTh } from "../components/AdminUi";

/**
 * The platform audit trail.
 *
 * Both filters are exact matches server-side, so they are selects rather than
 * search boxes — a free-text field against an equality filter is a screen that
 * silently returns nothing for "org" when every row says "org.suspend".
 */
const ACTIONS = [
  "org.create",
  "org.update",
  "org.archive",
  "org.assign_plan",
  "org.approve",
  "org.reject",
  "org.suspend",
  "org.reactivate",
  "user.reset_password",
  "user.activate",
  "user.deactivate",
  "plan.create",
  "plan.update",
  "plan.delete",
  "admin.create",
  "admin.update",
  "admin.remove",
];

const ENTITY_TYPES = ["Organization", "User", "Plan", "PlatformAdmin"];

export function AuditPage() {
  const isMobile = useIsMobile();
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, error } = useAdminAudit({ page, limit, action, entityType });
  const rows = data?.items ?? [];
  const filtered = Boolean(action || entityType);

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
    <div className="space-y-8" data-testid="admin-audit-page">
      <PageHeader
        crumbs={[{ label: "Audit" }]}
        title="Audit"
        subtitle="Every action taken in this console, recorded against the admin who took it."
      />

      <div className={`${adminPanel} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <select
            className={`${adminInput} md:w-56`}
            aria-label="Filter by action"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            className={`${adminInput} md:w-56`}
            aria-label="Filter by entity type"
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All entity types</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
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
            title={filtered ? "Nothing under this filter" : "No activity yet"}
            subtitle={
              filtered
                ? "Try a different action or entity type."
                : "Actions taken in the console will show up here."
            }
          />
        ) : isMobile ? (
          <>
            <div className="space-y-2 p-3">
              {rows.map((entry) => (
                <RecordCard
                  key={entry.id}
                  title={entry.description || entry.action}
                  meta={[
                    <span key="when" className="tabular-nums">
                      {formatDateTime(entry.createdAt)}
                    </span>,
                    entry.adminEmail,
                    <span key="action" className="font-mono">
                      {entry.action}
                    </span>,
                    entry.ip ? (
                      <span key="ip" className="font-mono tabular-nums">
                        {entry.ip}
                      </span>
                    ) : null,
                  ]}
                />
              ))}
            </div>
            {pager}
          </>
        ) : (
          <>
            <div className="max-h-[calc(100vh-22rem)] min-h-[16rem] overflow-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border">
                    {["When", "Admin", "Action", "Entity", "What happened", "IP"].map((h) => (
                      <th key={h} scope="col" className={adminTh}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((entry) => (
                    <tr key={entry.id} className={adminRow}>
                      <td className={`${adminTd} whitespace-nowrap tabular-nums`}>
                        {formatDateTime(entry.createdAt)}
                      </td>
                      <td className={`${adminTd} text-muted-foreground`}>
                        {entry.adminEmail || "—"}
                      </td>
                      <td className={`${adminTd} font-mono text-xs`}>{entry.action}</td>
                      <td className={`${adminTd} text-xs`}>
                        {entry.entityType || "—"}
                        {entry.entityId && (
                          <span className="block font-mono tabular-nums text-muted-foreground">
                            {entry.entityId}
                          </span>
                        )}
                      </td>
                      <td className={adminTd}>{entry.description || "—"}</td>
                      <td className={`${adminTd} font-mono tabular-nums text-muted-foreground`}>
                        {entry.ip || "—"}
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
    </div>
  );
}
