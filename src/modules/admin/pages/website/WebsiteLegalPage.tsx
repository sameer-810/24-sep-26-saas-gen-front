import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/shared/components/PageLoader";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { PageHeader } from "../../components/PageHeader";
import { Field, adminBtnSmall, adminInput, adminPanel } from "../../components/AdminUi";
import { useAdminWebsite, useUpdateWebsite } from "../../hooks/useAdminWebsite";
import type { LegalDoc, WebsiteLegal } from "../../types";
import { DRAFT_NOTE, DraftNote, SectionForm, TextInput } from "./WebsiteUi";

const BLANK: LegalDoc = { title: "", updatedAt: "", body: "" };

const TABS: { key: keyof WebsiteLegal; label: string; path: string; fallback: string }[] = [
  { key: "privacy", label: "Privacy Policy", path: "/privacy", fallback: "Privacy Policy" },
  { key: "terms", label: "Terms of Service", path: "/terms", fallback: "Terms of Service" },
];

const SYNTAX = "Supported: ## heading, - bullet, **bold**, blank line = new paragraph.";

export function WebsiteLegalPage() {
  const { data: doc, isLoading } = useAdminWebsite();
  const save = useUpdateWebsite();
  const [tab, setTab] = useState<keyof WebsiteLegal>("privacy");

  async function onSave(legal: WebsiteLegal) {
    try {
      await save.mutateAsync({ legal });
      toast.success(`Legal pages saved. ${DRAFT_NOTE}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ label: "Website", to: "/admin/website" }, { label: "Legal" }]}
        title="Legal"
        subtitle="The Privacy Policy and Terms of Service shown at /privacy and /terms."
      />
      <DraftNote />
      <div className={`${adminPanel} p-6`}>
        {isLoading || !doc ? (
          <PageLoader />
        ) : (
          <SectionForm
            key={doc.updatedAt}
            initial={{
              privacy: doc.draft.legal?.privacy ?? BLANK,
              terms: doc.draft.legal?.terms ?? BLANK,
            }}
            onSave={onSave}
            pending={save.isPending}
          >
            {(d, set) => (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex gap-1.5">
                    {TABS.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={cn(
                          adminBtnSmall,
                          tab === t.key &&
                            "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-500/15",
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <a
                    href={TABS.find((t) => t.key === tab)!.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={adminBtnSmall}
                  >
                    <ExternalLink className="h-3 w-3" /> Preview
                  </a>
                </div>

                {TABS.filter((t) => t.key === tab).map((t) => {
                  const value = d[t.key];
                  const patch = (p: Partial<LegalDoc>) => set({ [t.key]: { ...value, ...p } });
                  return (
                    <div key={t.key} className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <TextInput
                          label="Title"
                          value={value.title}
                          onChange={(title) => patch({ title })}
                          placeholder={t.fallback}
                          hint={`Falls back to “${t.fallback}”`}
                        />
                        <TextInput
                          label="Last updated"
                          value={value.updatedAt}
                          onChange={(updatedAt) => patch({ updatedAt })}
                          placeholder="25 September 2026"
                          hint="Free text; shown under the heading. Leave empty to hide."
                        />
                      </div>
                      <Field label="Body" htmlFor={`legal-body-${t.key}`} hint={SYNTAX}>
                        <textarea
                          id={`legal-body-${t.key}`}
                          rows={28}
                          value={value.body}
                          onChange={(e) => patch({ body: e.target.value })}
                          spellCheck={false}
                          className={cn(adminInput, "resize-y font-mono text-[13px] leading-6")}
                        />
                      </Field>
                    </div>
                  );
                })}
              </>
            )}
          </SectionForm>
        )}
      </div>
    </div>
  );
}
