import { Icon } from "@/modules/public/components/Icon";
import type { FeatureItem } from "../../types";
import {
  useCreateFeature,
  useDeleteFeature,
  useUpdateFeature,
  useWebsiteFeatures,
} from "../../hooks/useAdminWebsite";
import { CrudListPage } from "./CrudListPage";
import { IconInput, TextArea, TextInput, Toggle } from "./WebsiteUi";

type Feature = FeatureItem & { _id: string };

export function WebsiteFeaturesPage() {
  return (
    <CrudListPage<Feature>
      title="Features"
      subtitle="The feature cards on the public site."
      crumbs={[{ label: "Website", to: "/admin/website" }, { label: "Features" }]}
      itemLabel="Feature"
      list={
        useWebsiteFeatures() as ReturnType<typeof useWebsiteFeatures> & {
          data: Feature[] | undefined;
        }
      }
      create={useCreateFeature()}
      update={useUpdateFeature()}
      remove={useDeleteFeature()}
      blank={() => ({
        title: "",
        description: "",
        icon: "Sparkles",
        imageUrl: "",
        link: "",
        order: 0,
        isVisible: true,
      })}
      validate={(f) => (f.title.trim() ? null : "Title is required")}
      summarise={(f) => f.title}
      columns={[
        {
          header: "Feature",
          render: (f) => (
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15">
                <Icon name={f.icon} className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">{f.title}</span>
                <span className="block max-w-md truncate text-xs text-muted-foreground">
                  {f.description}
                </span>
              </span>
            </span>
          ),
        },
        {
          header: "Link",
          render: (f) => <span className="font-mono text-xs">{f.link || "—"}</span>,
        },
      ]}
      Form={({ form, set }) => (
        <div className="space-y-4">
          <TextInput label="Title" value={form.title} onChange={(title) => set({ title })} />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(description) => set({ description })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <IconInput value={form.icon} onChange={(icon) => set({ icon })} />
            <TextInput
              label="Link"
              value={form.link}
              onChange={(link) => set({ link })}
              hint="Optional “Learn more” target"
            />
          </div>
          <TextInput
            label="Image URL"
            type="url"
            value={form.imageUrl}
            onChange={(imageUrl) => set({ imageUrl })}
            hint="Optional; replaces the icon. Upload under Media."
          />
          <Toggle
            label="Visible on the site"
            checked={form.isVisible}
            onChange={(isVisible) => set({ isVisible })}
          />
        </div>
      )}
    />
  );
}
