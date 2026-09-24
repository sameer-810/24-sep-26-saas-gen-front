import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { PageLoader } from "@/shared/components/PageLoader";
import { Badge } from "@/shared/components/Badge";
import { Fab } from "@/shared/components/Fab";
import { FormDialog } from "@/modules/common/FormDialog";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { PageHeader, type Crumb } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import {
  ConfirmDialog,
  adminBtnPrimary,
  adminBtnSmall,
  adminPanel,
  adminRow,
  adminTd,
  adminTh,
} from "../../components/AdminUi";
import { DRAFT_NOTE, DraftNote } from "./WebsiteUi";

type Row = { _id: string; order: number; isVisible: boolean };

/**
 * Features and FAQ are the same screen with different columns: an ordered,
 * hideable list with a dialog form. Reordering swaps `order` with the
 * neighbour (two PUTs); the server keeps the list sorted.
 */
export function CrudListPage<T extends Row>({
  title,
  subtitle,
  crumbs,
  itemLabel,
  list,
  create,
  update,
  remove,
  columns,
  blank,
  validate,
  Form,
  summarise,
}: {
  title: string;
  subtitle: string;
  crumbs: Crumb[];
  itemLabel: string;
  list: UseQueryResult<T[]>;
  create: UseMutationResult<unknown, unknown, Omit<T, "_id">>;
  update: UseMutationResult<unknown, unknown, { id: string; payload: Partial<Omit<T, "_id">> }>;
  remove: UseMutationResult<unknown, unknown, string>;
  columns: { header: string; render: (row: T) => ReactNode }[];
  blank: () => Omit<T, "_id">;
  validate: (form: Omit<T, "_id">) => string | null;
  Form: (props: {
    form: Omit<T, "_id">;
    set: (patch: Partial<Omit<T, "_id">>) => void;
  }) => ReactNode;
  summarise: (row: T) => string;
}) {
  const rows = [...(list.data ?? [])].sort((a, b) => a.order - b.order);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Omit<T, "_id">>(blank);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null);

  function openEditor(row: T | null) {
    setEditing(row);
    if (row) {
      const { _id: _ignored, ...rest } = row;
      setForm(rest as Omit<T, "_id">);
    } else {
      setForm({ ...blank(), order: rows.length });
    }
    setError(null);
    setDialogOpen(true);
  }

  async function save() {
    const problem = validate(form);
    if (problem) return setError(problem);
    try {
      if (editing) await update.mutateAsync({ id: editing._id, payload: form });
      else await create.mutateAsync(form);
      toast.success(`${itemLabel} saved. ${DRAFT_NOTE}.`);
      setDialogOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function run(fn: () => Promise<unknown>, done: string) {
    try {
      await fn();
      toast.success(`${done}. ${DRAFT_NOTE}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  function move(i: number, dir: -1 | 1) {
    const a = rows[i];
    const b = rows[i + dir];
    if (!a || !b) return;
    // Orders may be equal in a fresh seed; use the indexes so a swap is always a swap.
    const orderA = i + dir;
    const orderB = i;
    run(
      () =>
        Promise.all([
          update.mutateAsync({ id: a._id, payload: { order: orderA } as Partial<Omit<T, "_id">> }),
          update.mutateAsync({ id: b._id, payload: { order: orderB } as Partial<Omit<T, "_id">> }),
        ]),
      "Order updated",
    );
  }

  const busy = update.isPending || remove.isPending;

  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={crumbs}
        title={title}
        subtitle={subtitle}
        action={
          <button
            type="button"
            onClick={() => openEditor(null)}
            className={`${adminBtnPrimary} hidden md:inline-flex`}
          >
            <Plus className="h-5 w-5" /> New {itemLabel.toLowerCase()}
          </button>
        }
      />
      <DraftNote />

      <div className={`${adminPanel} overflow-hidden`}>
        {list.isLoading ? (
          <PageLoader />
        ) : rows.length === 0 ? (
          <EmptyState
            title={`No ${itemLabel.toLowerCase()}s yet`}
            subtitle="Add the first one and it appears on the public site once published."
            action={
              <button type="button" onClick={() => openEditor(null)} className={adminBtnPrimary}>
                <Plus className="h-5 w-5" /> Add {itemLabel.toLowerCase()}
              </button>
            }
          />
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-card">
                <tr className="border-b border-border">
                  <th scope="col" className={`${adminTh} w-12 text-right`}>
                    #
                  </th>
                  {columns.map((c) => (
                    <th key={c.header} scope="col" className={adminTh}>
                      {c.header}
                    </th>
                  ))}
                  <th scope="col" className={adminTh}>
                    Status
                  </th>
                  <th scope="col" className={`${adminTh} text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, i) => (
                  <tr key={row._id} className={adminRow}>
                    <td
                      className={`${adminTd} text-right font-mono tabular-nums text-muted-foreground`}
                    >
                      {i + 1}
                    </td>
                    {columns.map((c) => (
                      <td key={c.header} className={adminTd}>
                        {c.render(row)}
                      </td>
                    ))}
                    <td className={adminTd}>
                      {row.isVisible ? (
                        <Badge tone="success">Visible</Badge>
                      ) : (
                        <Badge tone="neutral">Hidden</Badge>
                      )}
                    </td>
                    <td className={adminTd}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={busy || i === 0}
                          className={adminBtnSmall}
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={busy || i === rows.length - 1}
                          className={adminBtnSmall}
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () =>
                                update.mutateAsync({
                                  id: row._id,
                                  payload: { isVisible: !row.isVisible } as Partial<Omit<T, "_id">>,
                                }),
                              row.isVisible ? "Hidden" : "Shown",
                            )
                          }
                          className={adminBtnSmall}
                        >
                          {row.isVisible ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                          {row.isVisible ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditor(row)}
                          className={adminBtnSmall}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(row)}
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

      <Fab label={`New ${itemLabel.toLowerCase()}`} onClick={() => openEditor(null)} />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? `Edit ${itemLabel.toLowerCase()}` : `New ${itemLabel.toLowerCase()}`}
        size="lg"
        error={error}
        isPending={create.isPending || update.isPending}
        submitLabel={editing ? "Save changes" : `Add ${itemLabel.toLowerCase()}`}
        onSubmit={save}
      >
        <Form form={form} set={(patch) => setForm((f) => ({ ...f, ...patch }))} />
      </FormDialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={`Delete ${itemLabel.toLowerCase()}`}
        destructive
        confirmLabel="Delete"
        pending={remove.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          run(() => remove.mutateAsync(confirmDelete._id), `${itemLabel} deleted`).finally(() =>
            setConfirmDelete(null),
          );
        }}
        body={
          <p>Delete “{confirmDelete ? summarise(confirmDelete) : ""}”? This cannot be undone.</p>
        }
      />
    </div>
  );
}
