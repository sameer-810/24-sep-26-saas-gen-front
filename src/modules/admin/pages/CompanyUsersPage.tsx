import { useState } from "react";
import { useParams } from "react-router-dom";
import { KeyRound, Power } from "lucide-react";
import { PageLoader } from "@/shared/components/PageLoader";
import { Badge } from "@/shared/components/Badge";
import { RecordCard, CardAction } from "@/shared/components/RecordCard";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { FormDialog } from "@/modules/common/FormDialog";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatDate, initialsOf } from "@/lib/utils";
import type { OrgUser } from "../types";
import {
  useAdminOrg,
  useOrgUsers,
  useResetOrgUserPassword,
  useSetOrgUserActive,
} from "../hooks/useAdminOrgs";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import {
  ConfirmDialog,
  Field,
  adminBtnSmall,
  adminInput,
  adminPanel,
  adminRow,
  adminTd,
  adminTh,
} from "../components/AdminUi";

/** Support actions on a customer's own staff. */
export function CompanyUsersPage() {
  const { id = "" } = useParams();
  const isMobile = useIsMobile();

  const { data: org } = useAdminOrg(id);
  const { data: users, isLoading, isError, error } = useOrgUsers(id);
  const resetPassword = useResetOrgUserPassword();
  const setActive = useSetOrgUserActive();

  const [resetting, setResetting] = useState<OrgUser | null>(null);
  const [password, setPassword] = useState("");
  const [toggling, setToggling] = useState<OrgUser | null>(null);

  async function submitReset() {
    if (!resetting) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await resetPassword.mutateAsync({ orgId: id, userId: resetting.id, password });
      toast.success(`Password reset for ${resetting.email}`);
      setResetting(null);
      setPassword("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function submitToggle() {
    if (!toggling) return;
    try {
      await setActive.mutateAsync({ orgId: id, userId: toggling.id, isActive: !toggling.isActive });
      toast.success(toggling.isActive ? "User deactivated" : "User activated");
    } catch (err) {
      // The server refuses to disable a workspace's last active administrator.
      toast.error(getApiErrorMessage(err));
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-8" data-testid="admin-company-users">
      <PageHeader
        crumbs={[
          { label: "Companies", to: "/admin/companies" },
          { label: org?.name ?? "Company", to: `/admin/companies/${id}` },
          { label: "Users" },
        ]}
        title="Users"
        subtitle={`${users?.length ?? 0} staff accounts at ${org?.name ?? "this company"}.`}
      />

      <div className={`${adminPanel} overflow-hidden`}>
        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <p className="p-10 text-center text-sm text-rose-600">{getApiErrorMessage(error)}</p>
        ) : !users?.length ? (
          <EmptyState
            title="No users yet"
            subtitle="This company has no staff accounts."
          />
        ) : isMobile ? (
          <div className="space-y-2 p-3">
            {users.map((u) => (
              <RecordCard
                key={u.id}
                disc={initialsOf(u.name)}
                title={u.name}
                meta={[u.email, u.phone, u.role, `Joined ${formatDate(u.createdAt)}`]}
                badge={u.isActive ? undefined : <Badge tone="danger">Deactivated</Badge>}
                actions={
                  <>
                    <CardAction
                      icon={KeyRound}
                      label="Reset password"
                      onClick={() => setResetting(u)}
                    />
                    <CardAction
                      icon={Power}
                      label={u.isActive ? "Deactivate" : "Activate"}
                      onClick={() => setToggling(u)}
                    />
                  </>
                }
              />
            ))}
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-card">
                <tr className="border-b border-border">
                  {["Name", "Email", "Phone", "Role", "Joined", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className={`${adminTh} ${h === "Actions" ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className={adminRow}>
                    <td className={`${adminTd} font-semibold`}>{u.name}</td>
                    <td className={`${adminTd} text-muted-foreground`}>{u.email}</td>
                    <td className={`${adminTd} tabular-nums`}>{u.phone || "-"}</td>
                    <td className={`${adminTd} capitalize`}>{u.role}</td>
                    <td className={`${adminTd} tabular-nums`}>{formatDate(u.createdAt)}</td>
                    <td className={adminTd}>
                      {u.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="danger">Deactivated</Badge>
                      )}
                    </td>
                    <td className={adminTd}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setResetting(u)}
                          className={adminBtnSmall}
                        >
                          <KeyRound className="h-3 w-3" /> Reset password
                        </button>
                        <button
                          type="button"
                          onClick={() => setToggling(u)}
                          className={`${adminBtnSmall} hover:text-rose-600`}
                        >
                          <Power className="h-3 w-3" /> {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormDialog
        open={Boolean(resetting)}
        onOpenChange={(open) => {
          if (!open) {
            setResetting(null);
            setPassword("");
          }
        }}
        title="Reset password"
        size="sm"
        submitLabel="Reset password"
        isPending={resetPassword.isPending}
        onSubmit={submitReset}
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Sets a new password for {resetting?.email}. Tell them out of band — this screen is the
          only place it is ever shown.
        </p>
        <Field label="New password" htmlFor="reset-password" hint="At least 8 characters.">
          <input
            id="reset-password"
            type="text"
            autoComplete="off"
            className={adminInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(toggling)}
        title={toggling?.isActive ? "Deactivate user" : "Activate user"}
        destructive={toggling?.isActive}
        confirmLabel={toggling?.isActive ? "Deactivate" : "Activate"}
        pending={setActive.isPending}
        onCancel={() => setToggling(null)}
        onConfirm={submitToggle}
        body={
          <p>
            {toggling?.isActive
              ? `${toggling?.name} will be signed out and cannot sign in again until reactivated.`
              : `${toggling?.name} will be able to sign in again.`}
          </p>
        }
      />
    </div>
  );
}
