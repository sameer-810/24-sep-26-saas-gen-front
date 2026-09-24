import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageLoader } from "@/shared/components/PageLoader";
import { Badge } from "@/shared/components/Badge";
import { RecordCard, CardAction } from "@/shared/components/RecordCard";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { Fab } from "@/shared/components/Fab";
import { FormDialog } from "@/modules/common/FormDialog";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatDateTime, initialsOf } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import type { PlatformAdminRow } from "../types";
import {
  useCreatePlatformAdmin,
  useDeletePlatformAdmin,
  usePlatformAdmins,
  useUpdatePlatformAdmin,
} from "../hooks/usePlatformAdmins";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import {
  ConfirmDialog,
  Field,
  adminBtnPrimary,
  adminBtnSmall,
  adminInput,
  adminPanel,
  adminRow,
  adminTd,
  adminTh,
} from "../components/AdminUi";

/**
 * Platform admins.
 *
 * The server refuses two deletions outright — your own account, and the last
 * active admin — and both refusals arrive as a 400 with a sentence explaining
 * why. That sentence is kept inside the open confirm dialog rather than sent to
 * a toast that fades: the dialog is where the operator is still looking.
 */
export function AdminsPage() {
  const isMobile = useIsMobile();
  const me = useAppSelector((s) => s.admin.admin);
  const { data: admins, isLoading } = usePlatformAdmins();
  const createAdmin = useCreatePlatformAdmin();
  const updateAdmin = useUpdatePlatformAdmin();
  const deleteAdmin = useDeletePlatformAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformAdminRow | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", isActive: true });
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PlatformAdminRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openEditor(admin: PlatformAdminRow | null) {
    setEditing(admin);
    setForm({
      name: admin?.name ?? "",
      email: admin?.email ?? "",
      password: "",
      isActive: admin?.isActive ?? true,
    });
    setFormError(null);
    setDialogOpen(true);
  }

  async function save() {
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("Name is required");
      return;
    }
    try {
      if (editing) {
        await updateAdmin.mutateAsync({
          id: editing.id,
          payload: {
            name: form.name.trim(),
            isActive: form.isActive,
            // Absent means "leave the password alone" — the same rule the
            // integration credentials follow on the company form.
            ...(form.password ? { password: form.password } : {}),
          },
        });
        toast.success("Admin updated");
      } else {
        if (!form.email.trim() || form.password.length < 8) {
          setFormError("An email and a password of at least 8 characters are required");
          return;
        }
        await createAdmin.mutateAsync({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });
        toast.success("Admin created");
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  }

  async function remove() {
    if (!confirmDelete) return;
    setDeleteError(null);
    try {
      await deleteAdmin.mutateAsync(confirmDelete.id);
      toast.success("Admin removed");
      setConfirmDelete(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8" data-testid="admin-admins-page">
      <PageHeader
        crumbs={[{ label: "Admins" }]}
        title="Admins"
        subtitle={`${admins?.length ?? 0} accounts with platform-wide access to every company.`}
        action={
          <button
            type="button"
            onClick={() => openEditor(null)}
            className={`${adminBtnPrimary} hidden h-[50px] px-6 text-base md:inline-flex`}
          >
            <Plus className="h-5 w-5" /> New admin
          </button>
        }
      />

      <div className={`${adminPanel} overflow-hidden`}>
        {isLoading ? (
          <PageLoader />
        ) : !admins?.length ? (
          <EmptyState
            title="No admins yet"
            subtitle="Add a platform admin to share console access."
            action={
              <button type="button" onClick={() => openEditor(null)} className={adminBtnPrimary}>
                <Plus className="h-5 w-5" /> Create your first admin
              </button>
            }
          />
        ) : isMobile ? (
          <div className="space-y-2 p-3">
            {admins.map((a) => (
              <RecordCard
                key={a.id}
                disc={initialsOf(a.name)}
                onClick={() => openEditor(a)}
                title={a.name}
                meta={[
                  a.email,
                  a.id === me?.id ? "You" : null,
                  <span key="seen" className="tabular-nums">
                    {a.lastLoginAt ? `Last seen ${formatDateTime(a.lastLoginAt)}` : "Never signed in"}
                  </span>,
                ]}
                badge={a.isActive ? undefined : <Badge tone="neutral">Disabled</Badge>}
                actions={
                  <>
                    <CardAction icon={Pencil} label="Edit" onClick={() => openEditor(a)} />
                    <CardAction
                      icon={Trash2}
                      label="Delete"
                      disabled={a.id === me?.id}
                      onClick={() => {
                        setDeleteError(null);
                        setConfirmDelete(a);
                      }}
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
                  {["Name", "Email", "Last sign-in", "Added", "Status", "Actions"].map((h) => (
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
                {admins.map((a) => (
                  <tr key={a.id} className={adminRow}>
                    <td className={`${adminTd} font-semibold`}>
                      {a.name}
                      {a.id === me?.id && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">You</span>
                      )}
                    </td>
                    <td className={`${adminTd} text-muted-foreground`}>{a.email}</td>
                    <td className={`${adminTd} tabular-nums`}>
                      {a.lastLoginAt ? formatDateTime(a.lastLoginAt) : "—"}
                    </td>
                    <td className={`${adminTd} tabular-nums`}>{formatDateTime(a.createdAt)}</td>
                    <td className={adminTd}>
                      {a.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Disabled</Badge>
                      )}
                    </td>
                    <td className={adminTd}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditor(a)}
                          className={adminBtnSmall}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          type="button"
                          disabled={a.id === me?.id}
                          title={a.id === me?.id ? "You cannot remove your own account" : undefined}
                          onClick={() => {
                            setDeleteError(null);
                            setConfirmDelete(a);
                          }}
                          className={`${adminBtnSmall} hover:text-rose-600`}
                        >
                          <Trash2 className="h-3 w-3" /> Delete
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

      <Fab label="New admin" onClick={() => openEditor(null)} />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? `Edit ${editing.name}` : "New platform admin"}
        size="md"
        error={formError}
        isPending={createAdmin.isPending || updateAdmin.isPending}
        submitLabel={editing ? "Save changes" : "Create admin"}
        onSubmit={save}
      >
        <div className="grid grid-cols-1 gap-3">
          <Field label="Name *" htmlFor="pa-name">
            <input
              id="pa-name"
              className={adminInput}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field
            label="Email *"
            htmlFor="pa-email"
            hint={
              editing ? "Fixed — it is the login identity and the audit trail's key." : undefined
            }
          >
            <input
              id="pa-email"
              className={adminInput}
              autoComplete="off"
              disabled={Boolean(editing)}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <Field
            label={editing ? "New password" : "Password *"}
            htmlFor="pa-password"
            hint={
              editing
                ? "Leave blank to keep the current password. At least 8 characters otherwise."
                : "At least 8 characters."
            }
          >
            <input
              id="pa-password"
              type="password"
              autoComplete="new-password"
              className={adminInput}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </Field>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active — can sign in to the console
            </label>
          )}
        </div>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Remove platform admin"
        destructive
        confirmLabel="Remove"
        pending={deleteAdmin.isPending}
        onCancel={() => {
          setConfirmDelete(null);
          setDeleteError(null);
        }}
        onConfirm={remove}
        body={
          <>
            <p>
              Remove “{confirmDelete?.name}”? They lose access to every company immediately. Their
              entries in the audit log are kept.
            </p>
            {deleteError && (
              <p
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {deleteError}
              </p>
            )}
          </>
        }
      />
    </div>
  );
}
