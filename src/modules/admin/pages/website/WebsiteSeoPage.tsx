import { PageLoader } from "@/shared/components/PageLoader";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { PageHeader } from "../../components/PageHeader";
import { adminPanel } from "../../components/AdminUi";
import { useAdminWebsite, useSaveSeo } from "../../hooks/useAdminWebsite";
import type { WebsiteSeo } from "../../types";
import { DRAFT_NOTE, DraftNote, SectionForm, TextArea, TextInput } from "./WebsiteUi";

export function WebsiteSeoPage() {
  const { data: doc, isLoading } = useAdminWebsite();
  const save = useSaveSeo();

  async function onSave(seo: WebsiteSeo) {
    try {
      await save.mutateAsync(seo);
      toast.success(`SEO saved. ${DRAFT_NOTE}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ label: "Website", to: "/admin/website" }, { label: "SEO" }]}
        title="SEO"
        subtitle="The browser title, search description and social sharing card."
      />
      <DraftNote />
      <div className={`${adminPanel} p-6`}>
        {isLoading || !doc ? (
          <PageLoader />
        ) : (
          <SectionForm
            key={doc.updatedAt}
            initial={doc.draft.seo}
            onSave={onSave}
            pending={save.isPending}
          >
            {(d, set) => (
              <>
                <TextInput
                  label="Page title"
                  value={d.title}
                  onChange={(title) => set({ title })}
                  hint={`${d.title.length}/60 characters is a safe length`}
                />
                <TextArea
                  label="Meta description"
                  value={d.description}
                  onChange={(description) => set({ description })}
                  hint={`${d.description.length}/160 characters`}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Open Graph title"
                    value={d.ogTitle}
                    onChange={(ogTitle) => set({ ogTitle })}
                    hint="Falls back to the page title"
                  />
                  <TextInput
                    label="Open Graph image URL"
                    type="url"
                    value={d.ogImageUrl}
                    onChange={(ogImageUrl) => set({ ogImageUrl })}
                    hint="1200×630 works best"
                  />
                </div>
                <TextArea
                  label="Open Graph description"
                  value={d.ogDescription}
                  onChange={(ogDescription) => set({ ogDescription })}
                  hint="Falls back to the meta description"
                />
              </>
            )}
          </SectionForm>
        )}
      </div>
    </div>
  );
}
