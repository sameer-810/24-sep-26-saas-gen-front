import { PageLoader } from "@/shared/components/PageLoader";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { PageHeader } from "../../components/PageHeader";
import { SectionTitle, adminPanel } from "../../components/AdminUi";
import { useAdminWebsite, useSaveSettings } from "../../hooks/useAdminWebsite";
import type { SocialLink, WebsiteSettings } from "../../types";
import { DRAFT_NOTE, DraftNote, ListEditor, SectionForm, TextInput } from "./WebsiteUi";

export function WebsiteSettingsPage() {
  const { data: doc, isLoading } = useAdminWebsite();
  const save = useSaveSettings();

  async function onSave(settings: WebsiteSettings) {
    try {
      await save.mutateAsync(settings);
      toast.success(`Settings saved. ${DRAFT_NOTE}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ label: "Website", to: "/admin/website" }, { label: "Settings" }]}
        title="Site settings"
        subtitle="Name, logo, brand colours and the contact details shown site-wide."
      />
      <DraftNote />
      <div className={`${adminPanel} p-6`}>
        {isLoading || !doc ? (
          <PageLoader />
        ) : (
          <SectionForm
            key={doc.updatedAt}
            initial={doc.draft.settings}
            onSave={onSave}
            pending={save.isPending}
          >
            {(d, set) => (
              <>
                <SectionTitle>Identity</SectionTitle>
                <TextInput
                  label="Site name"
                  value={d.siteName}
                  onChange={(siteName) => set({ siteName })}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Logo URL"
                    type="url"
                    value={d.logoUrl}
                    onChange={(logoUrl) => set({ logoUrl })}
                    hint="Upload under Media; empty shows a monogram"
                  />
                  <TextInput
                    label="Favicon URL"
                    type="url"
                    value={d.faviconUrl}
                    onChange={(faviconUrl) => set({ faviconUrl })}
                  />
                </div>
                {d.logoUrl && (
                  <img
                    src={d.logoUrl}
                    alt="Logo preview"
                    className="h-12 w-auto rounded-md border border-border bg-white p-1"
                  />
                )}

                <SectionTitle>Brand colours</SectionTitle>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Primary colour"
                    type="color"
                    value={d.primaryColor}
                    onChange={(primaryColor) => set({ primaryColor })}
                    hint="Buttons, accents and icon tiles on the public site"
                  />
                  <TextInput
                    label="Secondary colour"
                    type="color"
                    value={d.secondaryColor}
                    onChange={(secondaryColor) => set({ secondaryColor })}
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  Preview
                  <span
                    className="inline-flex h-9 items-center rounded-lg px-4 font-semibold text-white"
                    style={{ backgroundColor: d.primaryColor }}
                  >
                    Primary button
                  </span>
                  <span
                    className="inline-block h-9 w-9 rounded-lg border border-border"
                    style={{ backgroundColor: d.secondaryColor }}
                    aria-label="Secondary colour swatch"
                  />
                </div>

                <SectionTitle>Contact & legal</SectionTitle>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Contact email"
                    type="email"
                    value={d.contactEmail}
                    onChange={(contactEmail) => set({ contactEmail })}
                  />
                  <TextInput
                    label="Contact phone"
                    type="tel"
                    value={d.contactPhone}
                    onChange={(contactPhone) => set({ contactPhone })}
                  />
                </div>
                <TextInput
                  label="Copyright line"
                  value={d.copyright}
                  onChange={(copyright) => set({ copyright })}
                  placeholder="© 2026 Your Company. All rights reserved."
                />

                <SectionTitle>Social links</SectionTitle>
                <ListEditor<SocialLink>
                  items={d.socialLinks ?? []}
                  onChange={(socialLinks) => set({ socialLinks })}
                  blank={() => ({ label: "", url: "" })}
                  itemLabel="Link"
                  addLabel="Add social link"
                  fields={[
                    { key: "label", label: "Label" },
                    { key: "url", label: "URL", kind: "url" },
                  ]}
                />
              </>
            )}
          </SectionForm>
        )}
      </div>
    </div>
  );
}
