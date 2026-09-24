import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageLoader } from "@/shared/components/PageLoader";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import type { OrgSettings } from "../types";
import { useAdminOrg, useCreateOrg, useUpdateOrg } from "../hooks/useAdminOrgs";
import { PageHeader } from "../components/PageHeader";
import {
  Field,
  SectionTitle,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
} from "../components/AdminUi";

const INDUSTRIES = [
  "generators",
  "electrical",
  "hvac",
  "manufacturing",
  "trading",
  "services",
  "other",
] as const;

/**
 * A credential the console is only ever shown a MASK of.
 *
 * The API treats an absent key as "leave it alone" and `""` as "clear it", and
 * this triple is how that asymmetry reaches the screen without an operator
 * having to know it. There is no third state to invent: the input is for a new
 * value, blank means untouched, and removing is an explicit tick — which is why
 * the field is never pre-filled with the mask. A form that posted back what it
 * displayed would overwrite a live key with "abc123…wxyz".
 */
type Credential = { value: string; clear: boolean };

const BLANK_CREDENTIAL: Credential = { value: "", clear: false };

function credentialPatch(field: string, cred: Credential): Record<string, string> {
  if (cred.clear) return { [field]: "" };
  const next = cred.value.trim();
  return next ? { [field]: next } : {};
}

/** The override only exists when the company itself set one; otherwise 0. */
function CredentialField({
  id,
  label,
  configured,
  masked,
  value,
  onChange,
}: {
  id: string;
  label: string;
  configured: boolean;
  masked: string;
  value: Credential;
  onChange: (next: Credential) => void;
}) {
  return (
    <div>
      <Field
        label={label}
        htmlFor={id}
        hint={
          configured
            ? "Leave blank to keep the stored key unchanged."
            : "Nothing stored yet. Type a key to set one."
        }
      >
        <input
          id={id}
          className={adminInput}
          autoComplete="off"
          placeholder={configured ? "Leave blank — keep current" : "Not configured"}
          disabled={value.clear}
          value={value.value}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
        />
      </Field>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Currently:{" "}
        {configured ? (
          <span className="font-mono tabular-nums">{masked}</span>
        ) : (
          <span className="italic">not configured</span>
        )}
      </p>
      {configured && (
        <label className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 accent-blue-600"
            checked={value.clear}
            onChange={(e) => onChange({ value: "", clear: e.target.checked })}
          />
          Remove the stored key
        </label>
      )}
    </div>
  );
}

const EMPTY_IDENTITY = {
  name: "",
  industry: "generators" as (typeof INDUSTRIES)[number],
  email: "",
  phone: "",
  address: "",
  gstin: "",
  contactPersonalEmail: "",
  contactPhone: "",
};

export function CompanyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: org, isLoading } = useAdminOrg(id);
  const createOrg = useCreateOrg();
  const updateOrg = useUpdateOrg();

  const [identity, setIdentity] = useState(EMPTY_IDENTITY);
  const [admin, setAdmin] = useState({ name: "", email: "", phone: "", password: "" });
  const [limits, setLimits] = useState({ maxUsers: "0", maxProducts: "0", maxLeads: "0" });
  const [indiamart, setIndiamart] = useState<Credential>(BLANK_CREDENTIAL);
  const [waToken, setWaToken] = useState<Credential>(BLANK_CREDENTIAL);
  const [waPhoneId, setWaPhoneId] = useState<Credential>(BLANK_CREDENTIAL);
  // The cloud name is an identifier, not a secret, so it is a plain text field
  // seeded with the tenant's own value. "" means "inherit the platform's".
  const [cloudName, setCloudName] = useState("");
  const [cloudKey, setCloudKey] = useState<Credential>(BLANK_CREDENTIAL);
  const [cloudSecret, setCloudSecret] = useState<Credential>(BLANK_CREDENTIAL);
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!org) return;
    setIdentity({
      name: org.name,
      industry: (INDUSTRIES as readonly string[]).includes(org.industry)
        ? (org.industry as (typeof INDUSTRIES)[number])
        : "other",
      email: org.email,
      phone: org.phone,
      address: org.address,
      gstin: org.gstin,
      contactPersonalEmail: org.contactPersonalEmail,
      contactPhone: org.contactPhone,
    });
    setLimits({
      // Seed from the stored override itself, never from the effective limit:
      // an inherited plan ceiling must load as 0 here, or saving would copy the
      // plan's number in as a permanent company override.
      maxUsers: String(org.settings?.maxUsersOverride ?? 0),
      maxProducts: String(org.settings?.maxProductsOverride ?? 0),
      maxLeads: String(org.settings?.maxLeadsOverride ?? 0),
    });
    setCloudName(org.settings?.cloudinaryCloudNameOverride ?? "");
    setLogoUrl(org.settings?.logoUrl ?? "");
  }, [org]);

  if (isEdit && isLoading) return <PageLoader />;

  const settings: OrgSettings | null = org?.settings ?? null;
  const pending = createOrg.isPending || updateOrg.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (identity.name.trim().length < 2) {
      setError("Company name is required");
      return;
    }

    try {
      if (isEdit && id) {
        await updateOrg.mutateAsync({
          id,
          payload: {
            ...identity,
            name: identity.name.trim(),
            maxUsers: Number(limits.maxUsers) || 0,
            maxProducts: Number(limits.maxProducts) || 0,
            maxLeads: Number(limits.maxLeads) || 0,
            ...credentialPatch("indiamartCrmKey", indiamart),
            ...credentialPatch("whatsappToken", waToken),
            ...credentialPatch("whatsappPhoneNumberId", waPhoneId),
            // Always sent: it is not a secret, so "" is an honest value here
            // (inherit the platform's), not a wipe of something unrecoverable.
            cloudinaryCloudName: cloudName.trim(),
            ...credentialPatch("cloudinaryApiKey", cloudKey),
            ...credentialPatch("cloudinaryApiSecret", cloudSecret),
            logoUrl: logoUrl.trim(),
          },
        });
        toast.success("Company updated");
        navigate(`/admin/companies/${id}`);
        return;
      }

      if (!admin.name.trim() || !admin.email.trim() || admin.password.length < 8) {
        setError("The first admin needs a name, an email and a password of at least 8 characters");
        return;
      }

      const { name, ...rest } = identity;
      const created = await createOrg.mutateAsync({
        ...rest,
        organizationName: name.trim(),
        admin: {
          name: admin.name.trim(),
          email: admin.email.trim(),
          phone: admin.phone.trim(),
          password: admin.password,
        },
      });
      toast.success("Company created");
      navigate(`/admin/companies/${created.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <form className="space-y-8" onSubmit={submit} data-testid="admin-company-form">
      <PageHeader
        crumbs={
          isEdit && id
            ? [
                { label: "Companies", to: "/admin/companies" },
                { label: org?.name ?? "Company", to: `/admin/companies/${id}` },
                { label: "Edit" },
              ]
            : [{ label: "Companies", to: "/admin/companies" }, { label: "New company" }]
        }
        title={isEdit ? `Edit ${org?.name ?? "company"}` : "New company"}
        subtitle={
          isEdit
            ? "Identity, limit overrides, integration credentials and branding."
            : "Register a company and its first administrator."
        }
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {error}
        </div>
      )}

      <section className={`${adminPanel} p-6`}>
        <SectionTitle>Identity</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Company name *" htmlFor="org-name">
            <input
              id="org-name"
              className={adminInput}
              value={identity.name}
              onChange={(e) => setIdentity((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Industry" htmlFor="org-industry">
            <select
              id="org-industry"
              className={adminInput}
              value={identity.industry}
              onChange={(e) =>
                setIdentity((f) => ({
                  ...f,
                  industry: e.target.value as (typeof INDUSTRIES)[number],
                }))
              }
            >
              {INDUSTRIES.map((i) => (
                <option key={i} value={i} className="capitalize">
                  {i}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Company email" htmlFor="org-email">
            <input
              id="org-email"
              className={adminInput}
              value={identity.email}
              onChange={(e) => setIdentity((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <Field label="Company phone" htmlFor="org-phone">
            <input
              id="org-phone"
              className={adminInput}
              value={identity.phone}
              onChange={(e) => setIdentity((f) => ({ ...f, phone: e.target.value }))}
            />
          </Field>
          <Field label="GSTIN" htmlFor="org-gstin" hint="15 characters, or leave blank.">
            <input
              id="org-gstin"
              className={`${adminInput} font-mono uppercase tabular-nums`}
              value={identity.gstin}
              onChange={(e) => setIdentity((f) => ({ ...f, gstin: e.target.value.toUpperCase() }))}
            />
          </Field>
          <Field label="Address" htmlFor="org-address" className="sm:col-span-2 lg:col-span-1">
            <input
              id="org-address"
              className={adminInput}
              value={identity.address}
              onChange={(e) => setIdentity((f) => ({ ...f, address: e.target.value }))}
            />
          </Field>
          <Field label="Contact person email" htmlFor="org-contact-email">
            <input
              id="org-contact-email"
              className={adminInput}
              value={identity.contactPersonalEmail}
              onChange={(e) => setIdentity((f) => ({ ...f, contactPersonalEmail: e.target.value }))}
            />
          </Field>
          <Field label="Contact person phone" htmlFor="org-contact-phone">
            <input
              id="org-contact-phone"
              className={adminInput}
              value={identity.contactPhone}
              onChange={(e) => setIdentity((f) => ({ ...f, contactPhone: e.target.value }))}
            />
          </Field>
        </div>
      </section>

      {!isEdit && (
        <section className={`${adminPanel} p-6`}>
          <SectionTitle>First admin</SectionTitle>
          <p className="mb-3 text-xs text-muted-foreground">
            Created as this company&apos;s administrator and recorded as its owner. Without one,
            nobody can sign in.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Name *" htmlFor="admin-name">
              <input
                id="admin-name"
                className={adminInput}
                value={admin.name}
                onChange={(e) => setAdmin((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field label="Email *" htmlFor="admin-email">
              <input
                id="admin-email"
                className={adminInput}
                autoComplete="off"
                value={admin.email}
                onChange={(e) => setAdmin((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Phone" htmlFor="admin-phone">
              <input
                id="admin-phone"
                className={adminInput}
                value={admin.phone}
                onChange={(e) => setAdmin((f) => ({ ...f, phone: e.target.value }))}
              />
            </Field>
            <Field label="Password *" htmlFor="admin-password" hint="At least 8 characters.">
              <input
                id="admin-password"
                type="password"
                className={adminInput}
                autoComplete="new-password"
                value={admin.password}
                onChange={(e) => setAdmin((f) => ({ ...f, password: e.target.value }))}
              />
            </Field>
          </div>
        </section>
      )}

      {isEdit && (
        <>
          <section className={`${adminPanel} p-6`}>
            <SectionTitle>Limit overrides</SectionTitle>
            <p className="mb-3 text-xs text-muted-foreground">
              <span className="font-mono tabular-nums">0</span> clears the override, so the ceiling
              falls back to the plan — and to unlimited when the plan sets none.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["maxUsers", "Max users"],
                  ["maxProducts", "Max products"],
                  ["maxLeads", "Max leads"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label} htmlFor={`limit-${key}`}>
                  <input
                    id={`limit-${key}`}
                    type="number"
                    min={0}
                    className={`${adminInput} no-spinner font-mono tabular-nums`}
                    value={limits[key]}
                    onChange={(e) => setLimits((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </Field>
              ))}
            </div>
          </section>

          <section className={`${adminPanel} p-6`}>
            <SectionTitle>Integration credentials</SectionTitle>
            <p className="mb-3 text-xs text-muted-foreground">
              A blank field leaves the stored credential unchanged — it is never cleared by
              omission. To remove one, tick “Remove the stored key”.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <CredentialField
                id="cred-indiamart"
                label="IndiaMART CRM key"
                configured={Boolean(settings?.indiamartConfigured)}
                masked={settings?.indiamartCrmKeyMasked ?? ""}
                value={indiamart}
                onChange={setIndiamart}
              />
              <CredentialField
                id="cred-wa-token"
                label="WhatsApp token"
                configured={Boolean(settings?.whatsappConfigured)}
                masked={settings?.whatsappTokenMasked ?? ""}
                value={waToken}
                onChange={setWaToken}
              />
              <CredentialField
                id="cred-wa-phone"
                label="WhatsApp phone number ID"
                configured={Boolean(settings?.whatsappPhoneNumberIdMasked)}
                masked={settings?.whatsappPhoneNumberIdMasked ?? ""}
                value={waPhoneId}
                onChange={setWaPhoneId}
              />
            </div>
          </section>

          <section className={`${adminPanel} p-6`}>
            <SectionTitle>Branding</SectionTitle>
            <p className="mb-3 text-xs text-muted-foreground">
              Shown in the sidebar of this company&apos;s CRM. The company&apos;s own admin can also
              upload one from their Settings page; until either is set, their CRM shows the
              company&apos;s initials. Paste a public image URL.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Logo URL" htmlFor="logo-url" hint="Blank removes the logo.">
                <input
                  id="logo-url"
                  className={adminInput}
                  autoComplete="off"
                  placeholder="https://…/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </Field>
              {logoUrl.trim() && (
                <div className="flex items-end">
                  <img
                    src={logoUrl.trim()}
                    alt="Logo preview"
                    className="h-12 w-auto max-w-full rounded-lg border border-border bg-white object-contain p-1"
                  />
                </div>
              )}
            </div>
          </section>

          <section className={`${adminPanel} p-6`}>
            <SectionTitle>Cloudinary</SectionTitle>
            <p className="mb-3 text-xs text-muted-foreground">
              Any field left blank falls through to the platform&apos;s own value from the
              environment file, field by field. The IndiaMART key above has no such fallback — it is
              mandatory for every company.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Cloud name"
                htmlFor="cloud-name"
                hint={
                  settings?.cloudinaryCloudName && !settings.cloudinaryCloudNameOverride
                    ? `Blank — inheriting “${settings.cloudinaryCloudName}” from the platform.`
                    : "Blank inherits the platform's cloud name."
                }
              >
                <input
                  id="cloud-name"
                  className={adminInput}
                  autoComplete="off"
                  placeholder={settings?.cloudinaryCloudName || "Not configured"}
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                />
              </Field>
              <CredentialField
                id="cred-cloud-key"
                label="API key"
                configured={Boolean(settings?.cloudinaryApiKeyMasked)}
                masked={settings?.cloudinaryApiKeyMasked ?? ""}
                value={cloudKey}
                onChange={setCloudKey}
              />
              <CredentialField
                id="cred-cloud-secret"
                label="API secret"
                configured={Boolean(settings?.cloudinaryApiSecretMasked)}
                masked={settings?.cloudinaryApiSecretMasked ?? ""}
                value={cloudSecret}
                onChange={setCloudSecret}
              />
            </div>
          </section>
        </>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className={adminBtnPrimary}
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create company"}
        </button>
        <Link
          to={isEdit && id ? `/admin/companies/${id}` : "/admin/companies"}
          className={adminBtnSecondary}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
