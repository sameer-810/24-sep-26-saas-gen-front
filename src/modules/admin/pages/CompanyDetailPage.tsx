import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, Users } from "lucide-react";
import { PageLoader } from "@/shared/components/PageLoader";
import { Badge } from "@/shared/components/Badge";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatDate } from "@/lib/utils";
import type { CredentialSource, LimitSource } from "../types";
import {
  useAdminOrg,
  useArchiveOrg,
  useAssignPlan,
  useOrgLifecycle,
  type OrgLifecycleAction,
} from "../hooks/useAdminOrgs";
import { useAdminPlans } from "../hooks/useAdminPlans";
import { PageHeader } from "../components/PageHeader";
import {
  ConfirmDialog,
  Fact,
  Field,
  OrgStatusChip,
  SectionTitle,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
} from "../components/AdminUi";

const SUBSCRIPTION_STATUSES = ["trial", "active", "past_due", "cancelled"] as const;

/** `<input type="date">` wants yyyy-MM-dd; the API speaks ISO. */
function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

const LIMIT_SOURCE: Record<LimitSource, string> = {
  override: "company override",
  plan: "from plan",
  unlimited: "unlimited",
};

/**
 * 0 is the stored value for "no ceiling". Printing it as "0" reads as "none
 * allowed" — and it is why the guard below checks for `undefined`, not
 * falsiness: 0 is a real answer here, not a missing one.
 */
function LimitRow({
  label,
  value,
  source,
}: {
  label: string;
  value: number | undefined;
  source: LimitSource | undefined;
}) {
  if (value === undefined) return <Fact label={label} value="—" />;
  return (
    <Fact
      label={label}
      value={
        <span>
          <span className="font-mono tabular-nums">{value === 0 ? "Unlimited" : value}</span>{" "}
          <span className="text-xs font-light text-muted-foreground">
            ({LIMIT_SOURCE[source ?? "unlimited"]})
          </span>
        </span>
      }
    />
  );
}

/**
 * One credential as the console shows it: the tenant's own mask when they set
 * one, otherwise WHERE it comes from. "Platform default" is a real answer here
 * and gets no mask on purpose — the console never prints a fragment of the
 * platform's secret next to a customer's name. `required` marks the one
 * credential (IndiaMART) that has no platform fallback, so its absence is a
 * problem rather than a default.
 */
function CredentialFact({
  label,
  masked,
  source,
  required = false,
}: {
  label: string;
  masked: string | undefined;
  source: CredentialSource | undefined;
  required?: boolean;
}) {
  if (masked) return <Fact label={label} value={masked} mono />;
  if (source === "platform") {
    return (
      <Fact label={label} value={<span className="text-muted-foreground">Platform default</span>} />
    );
  }
  return (
    <Fact
      label={label}
      value={
        <span className={required ? "text-rose-600" : "text-muted-foreground"}>
          {required ? "Not configured — required" : "Not configured"}
        </span>
      }
    />
  );
}

type PendingAction = { action: OrgLifecycleAction | "archive" } | null;

export function CompanyDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const { data: org, isLoading, isError, error } = useAdminOrg(id);
  const { data: plans } = useAdminPlans();
  const assignPlan = useAssignPlan();
  const lifecycle = useOrgLifecycle();
  const archive = useArchiveOrg();

  const [pending, setPending] = useState<PendingAction>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [planForm, setPlanForm] = useState({
    planCode: "",
    status: "trial" as (typeof SUBSCRIPTION_STATUSES)[number],
    trialEndsAt: "",
    currentPeriodEndsAt: "",
  });

  // Seeded from the record so the form opens showing what is in force rather
  // than an empty shape an operator could save by accident.
  useEffect(() => {
    if (!org) return;
    setPlanForm({
      planCode: org.subscription?.planCode ?? "",
      status: (org.subscription?.status || "trial") as (typeof SUBSCRIPTION_STATUSES)[number],
      trialEndsAt: toDateInput(org.subscription?.trialEndsAt),
      currentPeriodEndsAt: toDateInput(org.subscription?.currentPeriodEndsAt),
    });
  }, [org]);

  if (isLoading) return <PageLoader />;
  if (isError || !org)
    return (
      <div className={`${adminPanel} p-10 text-center text-sm text-rose-600`}>
        {getApiErrorMessage(error)}
      </div>
    );

  async function savePlan() {
    if (!planForm.planCode) {
      toast.error("Pick a plan first");
      return;
    }
    try {
      await assignPlan.mutateAsync({
        id,
        payload: {
          planCode: planForm.planCode,
          status: planForm.status,
          trialEndsAt: planForm.trialEndsAt || null,
          currentPeriodEndsAt: planForm.currentPeriodEndsAt || null,
        },
      });
      toast.success("Plan assigned");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function runPending() {
    if (!pending) return;
    try {
      if (pending.action === "archive") {
        await archive.mutateAsync(id);
        toast.success("Company archived");
        navigate("/admin/companies", { replace: true });
        return;
      }
      await lifecycle.mutateAsync({
        id,
        action: pending.action,
        note: pending.action === "reject" ? declineNote.trim() : undefined,
      });
      toast.success(
        {
          approve: "Company approved",
          reject: "Registration declined",
          suspend: "Company suspended",
          reactivate: "Company reactivated",
        }[pending.action],
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setPending(null);
      setDeclineNote("");
    }
  }

  const sub = org.subscription;
  const settings = org.settings;

  return (
    <div className="space-y-8" data-testid="admin-company-detail">
      <PageHeader
        crumbs={[{ label: "Companies", to: "/admin/companies" }, { label: org.name }]}
        title={
          <>
            {org.name} <OrgStatusChip org={org} />
          </>
        }
        subtitle={
          <>
            Created <span className="tabular-nums">{formatDate(org.createdAt)}</span> ·{" "}
            <span className="font-mono text-sm tabular-nums">{org.id}</span>
          </>
        }
        action={
          <Link to={`/admin/companies/${org.id}/edit`} className={adminBtnSecondary}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        }
      />

      <section className={`${adminPanel} p-6`}>
        <SectionTitle>Identity</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Company name" value={org.name} />
          <Fact label="Industry" value={org.industry} />
          <Fact label="Email" value={org.email} />
          <Fact label="Phone" value={org.phone} mono />
          <Fact label="GSTIN" value={org.gstin} mono />
          <Fact label="Address" value={org.address} />
        </div>
      </section>

      <section className={`${adminPanel} p-6`}>
        <SectionTitle
          action={
            <Link
              to={`/admin/companies/${org.id}/users`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
            >
              <Users className="h-4 w-4" />
              <span className="font-mono tabular-nums">{org.stats.users}</span> users
            </Link>
          }
        >
          Owner
        </SectionTitle>
        {org.owner ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Fact label="Name" value={org.owner.name} />
            <Fact label="Email" value={org.owner.email} />
            <Fact label="Phone" value={org.owner.phone} mono />
            <Fact
              label="Account"
              value={
                org.owner.isActive ? (
                  "Active"
                ) : (
                  <span className="text-rose-600">Deactivated</span>
                )
              }
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No owner recorded — nobody on this company can sign in.
          </p>
        )}
      </section>

      <section className={`${adminPanel} p-6`}>
        <SectionTitle>Subscription</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Plan" value={sub?.planName || sub?.planCode || "None"} />
          <Fact
            label="Status"
            value={
              sub?.status ? (
                <Badge
                  tone={
                    sub.status === "active"
                      ? "success"
                      : sub.status === "past_due"
                        ? "danger"
                        : "neutral"
                  }
                >
                  {sub.status.replace("_", " ")}
                </Badge>
              ) : (
                "—"
              )
            }
          />
          <Fact
            label="Trial ends"
            value={sub?.trialEndsAt ? formatDate(sub.trialEndsAt) : "—"}
            mono
          />
          <Fact
            label="Period ends"
            value={sub?.currentPeriodEndsAt ? formatDate(sub.currentPeriodEndsAt) : "—"}
            mono
          />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-3 text-sm font-bold text-foreground">
            Assign plan
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Plan" htmlFor="assign-plan">
              <select
                id="assign-plan"
                className={adminInput}
                value={planForm.planCode}
                onChange={(e) => setPlanForm((f) => ({ ...f, planCode: e.target.value }))}
              >
                <option value="">Select a plan…</option>
                {plans?.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.name} ({p.code}){p.isActive ? "" : " — inactive"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status" htmlFor="assign-status">
              <select
                id="assign-status"
                className={adminInput}
                value={planForm.status}
                onChange={(e) =>
                  setPlanForm((f) => ({
                    ...f,
                    status: e.target.value as (typeof SUBSCRIPTION_STATUSES)[number],
                  }))
                }
              >
                {SUBSCRIPTION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Trial ends" htmlFor="assign-trial">
              <input
                id="assign-trial"
                type="date"
                className={adminInput}
                value={planForm.trialEndsAt}
                onChange={(e) => setPlanForm((f) => ({ ...f, trialEndsAt: e.target.value }))}
              />
            </Field>
            <Field label="Period ends" htmlFor="assign-period">
              <input
                id="assign-period"
                type="date"
                className={adminInput}
                value={planForm.currentPeriodEndsAt}
                onChange={(e) =>
                  setPlanForm((f) => ({ ...f, currentPeriodEndsAt: e.target.value }))
                }
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={savePlan}
            disabled={assignPlan.isPending}
            className={`${adminBtnPrimary} mt-4`}
          >
            {assignPlan.isPending ? "Saving…" : "Assign plan"}
          </button>
        </div>
      </section>

      <section className={`${adminPanel} p-6`}>
        <SectionTitle>Limits</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <LimitRow
            label="Max users"
            value={settings?.maxUsers}
            source={settings?.maxUsersSource}
          />
          <LimitRow
            label="Max products"
            value={settings?.maxProducts}
            source={settings?.maxProductsSource}
          />
          <LimitRow
            label="Max leads"
            value={settings?.maxLeads}
            source={settings?.maxLeadsSource}
          />
        </div>
      </section>

      <section className={`${adminPanel} p-6`}>
        <SectionTitle>Integrations</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CredentialFact
            label="IndiaMART CRM key"
            masked={settings?.indiamartCrmKeyMasked}
            source={settings?.indiamartSource}
            required
          />
          <CredentialFact
            label="WhatsApp token"
            masked={settings?.whatsappTokenMasked}
            source={settings?.whatsappSource}
          />
          <CredentialFact
            label="WhatsApp phone number ID"
            masked={settings?.whatsappPhoneNumberIdMasked}
            source={settings?.whatsappSource}
          />
          <Fact
            label="Company logo"
            value={
              settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`${org.name} logo`}
                  className="h-10 w-auto max-w-full rounded border border-border bg-white object-contain p-0.5"
                />
              ) : (
                <span className="text-muted-foreground">Not set — their CRM shows initials</span>
              )
            }
          />
          <Fact
            label="Cloudinary cloud name"
            value={settings?.cloudinaryCloudName || "Not configured"}
            mono={Boolean(settings?.cloudinaryCloudName)}
          />
          <CredentialFact
            label="Cloudinary API key"
            masked={settings?.cloudinaryApiKeyMasked}
            source={settings?.cloudinarySource}
          />
          <CredentialFact
            label="Cloudinary API secret"
            masked={settings?.cloudinaryApiSecretMasked}
            source={settings?.cloudinarySource}
          />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          The API returns masks only — the console never holds a usable credential. Change one from
          Edit.
        </p>
      </section>

      <section className={`${adminPanel} p-6`}>
        <SectionTitle>Actions</SectionTitle>
        {org.approvalStatus === "rejected" && org.approvalNote && (
          <p className="mb-3 text-sm text-muted-foreground">
            Declined with the note: “{org.approvalNote}”
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {org.approvalStatus !== "approved" && (
            <button
              type="button"
              onClick={() => setPending({ action: "approve" })}
              className={adminBtnPrimary}
            >
              Approve
            </button>
          )}
          {org.approvalStatus === "pending" && (
            <button
              type="button"
              onClick={() => setPending({ action: "reject" })}
              className={adminBtnSecondary}
            >
              Decline
            </button>
          )}
          {org.status === "suspended" ? (
            <button
              type="button"
              onClick={() => setPending({ action: "reactivate" })}
              className={adminBtnSecondary}
            >
              Reactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPending({ action: "suspend" })}
              className={`${adminBtnSecondary} hover:text-rose-600`}
            >
              Suspend
            </button>
          )}
          <button
            type="button"
            onClick={() => setPending({ action: "archive" })}
            className={`${adminBtnSecondary} hover:text-rose-600`}
          >
            Archive
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(pending)}
        title={
          pending?.action === "archive"
            ? "Archive company"
            : pending?.action === "suspend"
              ? "Suspend company"
              : pending?.action === "reject"
                ? "Decline registration"
                : pending?.action === "reactivate"
                  ? "Reactivate company"
                  : "Approve company"
        }
        destructive={
          pending?.action === "archive" ||
          pending?.action === "suspend" ||
          pending?.action === "reject"
        }
        confirmLabel={
          pending?.action === "archive"
            ? "Archive"
            : pending?.action === "suspend"
              ? "Suspend"
              : pending?.action === "reject"
                ? "Decline"
                : pending?.action === "reactivate"
                  ? "Reactivate"
                  : "Approve"
        }
        pending={lifecycle.isPending || archive.isPending}
        onCancel={() => {
          setPending(null);
          setDeclineNote("");
        }}
        onConfirm={runPending}
        body={
          <>
            <p>
              {pending?.action === "archive"
                ? `Archive “${org.name}”? Everyone on this company loses access immediately.`
                : pending?.action === "suspend"
                  ? `Suspend “${org.name}”? Staff cannot sign in until it is reactivated.`
                  : pending?.action === "reject"
                    ? `Decline the registration for “${org.name}”?`
                    : pending?.action === "reactivate"
                      ? `Reactivate “${org.name}” and let its staff back in?`
                      : `Approve “${org.name}”? Its staff can sign in straight away.`}
            </p>
            {pending?.action === "reject" && (
              <Field
                label="Reason"
                htmlFor="decline-note"
                hint="Shown to the applicant, so write it for them."
              >
                <textarea
                  id="decline-note"
                  rows={3}
                  maxLength={500}
                  className={adminInput}
                  value={declineNote}
                  onChange={(e) => setDeclineNote(e.target.value)}
                />
              </Field>
            )}
          </>
        }
      />
    </div>
  );
}
