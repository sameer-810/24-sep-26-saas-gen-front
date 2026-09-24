import { useState } from "react";
import { CheckCircle2, Layers, PauseCircle, Pencil, Plus, Star, Trash2, Users } from "lucide-react";
import { PageLoader } from "@/shared/components/PageLoader";
import { Badge } from "@/shared/components/Badge";
import { RecordCard, CardAction } from "@/shared/components/RecordCard";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { Fab } from "@/shared/components/Fab";
import { FormDialog } from "@/modules/common/FormDialog";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatCurrency } from "@/lib/utils";
import type { AdminPlan } from "../types";
import { useAdminPlans, useCreatePlan, useDeletePlan, useUpdatePlan } from "../hooks/useAdminPlans";
import { useAdminOrgs } from "../hooks/useAdminOrgs";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import { PlanFormFields, type PlanForm } from "../components/PlanFormFields";
import {
  ConfirmDialog,
  adminBtnPrimary,
  adminBtnSmall,
  adminPanel,
  adminRow,
  adminTd,
  adminTh,
} from "../components/AdminUi";

/**
 * Subscription plans.
 *
 * Every figure on a plan card is derived server-side (`planDisplay.js`) from a
 * handful of stored values, so the form edits the stored side and the table
 * shows what a customer would actually read.
 */

const EMPTY_FORM: PlanForm = {
  name: "",
  code: "",
  tagline: "",
  description: "",
  termMonths: "1",
  priceMonthly: "0",
  priceTotal: "0",
  referencePrice: "0",
  badge: "",
  isFeatured: false,
  isActive: true,
  sortOrder: "0",
  maxUsers: "0",
  maxProducts: "0",
  maxLeads: "0",
  features: "",
};

function toForm(plan: AdminPlan): PlanForm {
  return {
    name: plan.name,
    code: plan.code,
    tagline: plan.tagline,
    description: plan.description,
    termMonths: String(plan.termMonths),
    priceMonthly: String(plan.stored.priceMonthly),
    priceTotal: String(plan.stored.priceTotal),
    referencePrice: String(plan.stored.referencePrice),
    badge: plan.stored.badge,
    isFeatured: plan.isFeatured,
    isActive: plan.isActive,
    sortOrder: String(plan.sortOrder),
    maxUsers: String(plan.maxUsers),
    maxProducts: String(plan.maxProducts),
    maxLeads: String(plan.maxLeads),
    features: plan.features.join("\n"),
  };
}

function toPayload(form: PlanForm, includeCode: boolean): Record<string, unknown> {
  return {
    ...(includeCode ? { code: form.code.trim() } : {}),
    name: form.name.trim(),
    tagline: form.tagline.trim(),
    description: form.description.trim(),
    termMonths: Number(form.termMonths) || 1,
    priceMonthly: Number(form.priceMonthly) || 0,
    priceTotal: Number(form.priceTotal) || 0,
    referencePrice: Number(form.referencePrice) || 0,
    badge: form.badge.trim(),
    isFeatured: form.isFeatured,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder) || 0,
    maxUsers: Number(form.maxUsers) || 0,
    maxProducts: Number(form.maxProducts) || 0,
    maxLeads: Number(form.maxLeads) || 0,
    features: form.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean),
  };
}

function limitText(n: number): string {
  return n === 0 ? "Unlimited" : String(n);
}

export function PlansPage() {
  const isMobile = useIsMobile();
  const { data: plans, isLoading } = useAdminPlans();
  // ponytail: no "companies on a plan" endpoint, so count client-side from one
  // page of 200 (the API's ceiling). Past 200 companies this is a lower bound;
  // add a server-side count then.
  const orgs = useAdminOrgs({ page: 1, limit: 200 });
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<AdminPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCount = plans?.filter((p) => p.isActive).length;
  const companiesOnPlans = orgs.data?.items.filter((o) => o.subscription?.planCode).length;

  function openEditor(plan: AdminPlan | null) {
    setEditing(plan);
    setForm(plan ? toForm(plan) : EMPTY_FORM);
    setError(null);
    setDialogOpen(true);
  }

  async function save() {
    setError(null);
    if (!form.name.trim()) {
      setError("Plan name is required");
      return;
    }
    if (!editing && !form.code.trim()) {
      setError("Plan code is required");
      return;
    }
    try {
      if (editing) {
        await updatePlan.mutateAsync({ id: editing.id, payload: toPayload(form, false) });
        toast.success("Plan updated");
      } else {
        await createPlan.mutateAsync(toPayload(form, true));
        toast.success("Plan created");
      }
      setDialogOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function remove() {
    if (!confirmDelete) return;
    try {
      await deletePlan.mutateAsync(confirmDelete.id);
      toast.success("Plan deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div className="space-y-8" data-testid="admin-plans-page">
      <PageHeader
        crumbs={[{ label: "Plans" }]}
        title="Plans"
        subtitle="Manage pricing plans and features for all companies. Plan values are used to calculate the price on the price card."
        action={
          <button
            type="button"
            onClick={() => openEditor(null)}
            className={`${adminBtnPrimary} hidden h-[50px] px-6 text-base md:inline-flex`}
          >
            <Plus className="h-5 w-5" /> New plan
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Plans" value={plans?.length ?? "—"} icon={Layers} tone="blue" />
        <StatCard label="Active Plans" value={activeCount ?? "—"} icon={CheckCircle2} tone="green" />
        <StatCard
          label="Inactive Plans"
          value={plans ? plans.length - (activeCount ?? 0) : "—"}
          icon={PauseCircle}
          tone="amber"
        />
        <StatCard
          label="Companies Using Plans"
          value={companiesOnPlans ?? "—"}
          icon={Users}
          tone="purple"
        />
      </div>

      <div className={`${adminPanel} overflow-hidden`}>
        {isLoading ? (
          <PageLoader />
        ) : !plans?.length ? (
          <EmptyState
            title="No plans yet"
            subtitle="Create your first plan to start offering pricing options to companies."
            action={
              <button type="button" onClick={() => openEditor(null)} className={adminBtnPrimary}>
                <Plus className="h-5 w-5" /> Create your first plan
              </button>
            }
          />
        ) : isMobile ? (
          <div className="space-y-2 p-3">
            {plans.map((p) => (
              <RecordCard
                key={p.id}
                onClick={() => openEditor(p)}
                title={
                  <span className="flex items-center gap-1.5">
                    {p.name}
                    {p.isFeatured && <Star className="h-3.5 w-3.5 fill-current text-amber-500" />}
                  </span>
                }
                amount={formatCurrency(p.perMonth)}
                meta={[
                  <span key="code" className="font-mono tabular-nums">
                    {p.code} · {p.termMonths}m · {formatCurrency(p.total)}
                  </span>,
                  p.reference > p.total ? (
                    <span key="ref" className="font-mono tabular-nums line-through">
                      {formatCurrency(p.reference)}
                    </span>
                  ) : null,
                  `Users ${limitText(p.maxUsers)} · Products ${limitText(p.maxProducts)}`,
                ]}
                badge={
                  !p.isActive ? (
                    <Badge tone="neutral">Inactive</Badge>
                  ) : p.savePct > 0 ? (
                    <Badge tone="success">
                      <span className="font-mono tabular-nums">{p.savePct}%</span> off
                    </Badge>
                  ) : undefined
                }
                actions={
                  <>
                    <CardAction icon={Pencil} label="Edit" onClick={() => openEditor(p)} />
                    <CardAction icon={Trash2} label="Delete" onClick={() => setConfirmDelete(p)} />
                  </>
                }
              />
            ))}
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-card">
                <tr className="border-b border-border">
                  {[
                    "Plan",
                    "Term",
                    "Per month",
                    "Total",
                    "Reference",
                    "Save",
                    "Limits",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className={`${adminTh} ${
                        ["Term", "Per month", "Total", "Reference", "Save", "Actions"].includes(h)
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((p) => (
                  <tr key={p.id} className={adminRow}>
                    <td className={adminTd}>
                      <span className="flex items-center gap-1.5 font-semibold">
                        {p.name}
                        {p.isFeatured && (
                          <Star
                            className="h-3.5 w-3.5 fill-current text-amber-500"
                            aria-label="Featured"
                          />
                        )}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {p.code}
                      </span>
                    </td>
                    <td className={`${adminTd} text-right tabular-nums`}>{p.termMonths}m</td>
                    <td className={`${adminTd} text-right tabular-nums`}>
                      {formatCurrency(p.perMonth)}
                    </td>
                    <td className={`${adminTd} text-right tabular-nums`}>
                      {formatCurrency(p.total)}
                    </td>
                    <td className={`${adminTd} text-right tabular-nums text-muted-foreground`}>
                      {p.reference > p.total ? (
                        <span className="line-through">{formatCurrency(p.reference)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${adminTd} text-right`}>
                      {p.savePct > 0 ? (
                        <Badge tone="success">
                          <span className="tabular-nums">{p.badge || `${p.savePct}%`}</span>
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className={`${adminTd} font-mono text-xs tabular-nums text-muted-foreground`}>
                      {limitText(p.maxUsers)} / {limitText(p.maxProducts)} /{" "}
                      {limitText(p.maxLeads)}
                    </td>
                    <td className={adminTd}>
                      {p.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td className={adminTd}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditor(p)}
                          className={adminBtnSmall}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(p)}
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

      <Fab label="New plan" onClick={() => openEditor(null)} />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? `Edit ${editing.name}` : "New plan"}
        size="lg"
        error={error}
        isPending={createPlan.isPending || updatePlan.isPending}
        submitLabel={editing ? "Save changes" : "Create plan"}
        onSubmit={save}
      >
        <PlanFormFields form={form} setForm={setForm} editing={Boolean(editing)} />
      </FormDialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete plan"
        destructive
        confirmLabel="Delete"
        pending={deletePlan.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={remove}
        body={
          <p>
            Delete “{confirmDelete?.name}”? Companies already on it keep their subscription, but the
            plan stops being offered.
          </p>
        }
      />
    </div>
  );
}
