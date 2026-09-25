import type { ReactNode } from "react";
import type {
  BenefitItem,
  Highlight,
  StepItem,
  TrustItem,
  WebsiteContent,
  WebsiteCta,
} from "@/modules/public/types";
// The content blocks are shared with the public site; the PATCH shape is the
// console's own — it describes what `PUT /website` accepts, which is an admin
// concern the public module has no reason to know about.
import type { WebsitePatch } from "@/modules/admin/types";
import { ListEditor, SectionForm, TextArea, TextInput, Toggle } from "./WebsiteUi";

export type CopyTab =
  | "hero"
  | "trust"
  | "howItWorks"
  | "benefits"
  | "cta"
  | "pricing"
  | "finalCta"
  | "footer";

export const COPY_TABS: { key: CopyTab; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "trust", label: "Trust strip" },
  { key: "howItWorks", label: "How it works" },
  { key: "benefits", label: "Benefits" },
  { key: "cta", label: "Call to action" },
  { key: "pricing", label: "Pricing" },
  { key: "finalCta", label: "Final CTA" },
  { key: "footer", label: "Footer" },
];

const blankTrust = (): TrustItem => ({ title: "", description: "", icon: "ShieldCheck", order: 0 });
const blankStep = (): StepItem => ({ title: "", description: "", icon: "Circle", order: 0 });
const blankBenefit = (): BenefitItem => ({
  title: "",
  description: "",
  icon: "Sparkles",
  imageUrl: "",
  order: 0,
});
const blankHighlight = (): Highlight => ({ label: "", value: "" });

function CtaFields({ draft, set }: { draft: WebsiteCta; set: (p: Partial<WebsiteCta>) => void }) {
  return (
    <>
      <TextInput label="Heading" value={draft.heading} onChange={(heading) => set({ heading })} />
      <TextArea
        label="Description"
        value={draft.description}
        onChange={(description) => set({ description })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="Button text"
          value={draft.buttonText}
          onChange={(buttonText) => set({ buttonText })}
        />
        <TextInput
          label="Button URL"
          value={draft.buttonUrl}
          onChange={(buttonUrl) => set({ buttonUrl })}
          hint="/login, #pricing or https://…"
        />
      </div>
    </>
  );
}

/**
 * One form per copy block. Each is keyed on `updatedAt` by the caller so a
 * fresh fetch reseeds it, and each saves only its own block via PUT /website.
 */
export function SectionEditor({
  tab,
  content,
  onSave,
  pending,
}: {
  tab: CopyTab;
  content: WebsiteContent;
  onSave: (patch: WebsitePatch) => void;
  pending: boolean;
}): ReactNode {
  switch (tab) {
    case "hero":
      return (
        <SectionForm initial={content.hero} onSave={(hero) => onSave({ hero })} pending={pending}>
          {(d, set) => (
            <>
              <TextInput
                label="Badge"
                value={d.badge}
                onChange={(badge) => set({ badge })}
                hint="Small eyebrow above the heading"
              />
              <TextInput
                label="Heading"
                value={d.heading}
                onChange={(heading) => set({ heading })}
              />
              <TextArea
                label="Description"
                value={d.description}
                onChange={(description) => set({ description })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  label="Primary button text"
                  value={d.primaryButtonText}
                  onChange={(primaryButtonText) => set({ primaryButtonText })}
                />
                <TextInput
                  label="Primary button URL"
                  value={d.primaryButtonUrl}
                  onChange={(primaryButtonUrl) => set({ primaryButtonUrl })}
                />
                <TextInput
                  label="Secondary button text"
                  value={d.secondaryButtonText}
                  onChange={(secondaryButtonText) => set({ secondaryButtonText })}
                />
                <TextInput
                  label="Secondary button URL"
                  value={d.secondaryButtonUrl}
                  onChange={(secondaryButtonUrl) => set({ secondaryButtonUrl })}
                />
              </div>
              <TextInput
                label="Image URL"
                value={d.imageUrl}
                onChange={(imageUrl) => set({ imageUrl })}
                type="url"
                hint="Leave empty to show the built-in dashboard visual. Upload under Media."
              />
              <TextInput
                label="Supporting text"
                value={d.supportingText}
                onChange={(supportingText) => set({ supportingText })}
              />
              <div>
                <p className="mb-2 text-[13px] font-medium">Highlights</p>
                <ListEditor<Highlight>
                  items={d.highlights ?? []}
                  onChange={(highlights) => set({ highlights })}
                  blank={blankHighlight}
                  itemLabel="Highlight"
                  addLabel="Add highlight"
                  fields={[
                    { key: "label", label: "Label" },
                    { key: "value", label: "Value" },
                  ]}
                />
              </div>
            </>
          )}
        </SectionForm>
      );
    case "trust":
      return (
        <SectionForm
          initial={content.trust}
          onSave={(trust) => onSave({ trust })}
          pending={pending}
        >
          {(d, set) => (
            <ListEditor<TrustItem>
              items={d.items ?? []}
              onChange={(items) => set({ items })}
              blank={blankTrust}
              itemLabel="Point"
              addLabel="Add point"
              fields={[
                { key: "title", label: "Title", span: 8 },
                { key: "icon", label: "Icon", kind: "icon", span: 4 },
                { key: "description", label: "Description", kind: "textarea" },
              ]}
            />
          )}
        </SectionForm>
      );
    case "howItWorks":
      return (
        <SectionForm
          initial={content.howItWorks}
          onSave={(howItWorks) => onSave({ howItWorks })}
          pending={pending}
        >
          {(d, set) => (
            <>
              <TextInput label="Title" value={d.title} onChange={(title) => set({ title })} />
              <TextArea
                label="Description"
                value={d.description}
                onChange={(description) => set({ description })}
              />
              <ListEditor<StepItem>
                items={d.steps ?? []}
                onChange={(steps) => set({ steps })}
                blank={blankStep}
                itemLabel="Step"
                addLabel="Add step"
                fields={[
                  { key: "title", label: "Title", span: 8 },
                  { key: "icon", label: "Icon", kind: "icon", span: 4 },
                  { key: "description", label: "Description", kind: "textarea" },
                ]}
              />
            </>
          )}
        </SectionForm>
      );
    case "benefits":
      return (
        <SectionForm
          initial={content.benefits}
          onSave={(benefits) => onSave({ benefits })}
          pending={pending}
        >
          {(d, set) => (
            <>
              <TextInput
                label="Heading"
                value={d.heading}
                onChange={(heading) => set({ heading })}
              />
              <TextArea
                label="Description"
                value={d.description}
                onChange={(description) => set({ description })}
              />
              <ListEditor<BenefitItem>
                items={d.items ?? []}
                onChange={(items) => set({ items })}
                blank={blankBenefit}
                itemLabel="Benefit"
                addLabel="Add benefit"
                fields={[
                  { key: "title", label: "Title", span: 8 },
                  { key: "icon", label: "Icon", kind: "icon", span: 4 },
                  { key: "imageUrl", label: "Image URL", kind: "url", span: 12 },
                  { key: "description", label: "Description", kind: "textarea" },
                ]}
              />
            </>
          )}
        </SectionForm>
      );
    case "cta":
      return (
        <SectionForm initial={content.cta} onSave={(cta) => onSave({ cta })} pending={pending}>
          {(d, set) => <CtaFields draft={d} set={set} />}
        </SectionForm>
      );
    case "finalCta":
      return (
        <SectionForm
          initial={content.finalCta}
          onSave={(finalCta) => onSave({ finalCta })}
          pending={pending}
        >
          {(d, set) => <CtaFields draft={d} set={set} />}
        </SectionForm>
      );
    case "pricing":
      return (
        <SectionForm
          initial={content.pricing}
          onSave={(pricing) => onSave({ pricing })}
          pending={pending}
        >
          {(d, set) => (
            <>
              <TextInput
                label="Heading"
                value={d.heading}
                onChange={(heading) => set({ heading })}
              />
              <TextArea
                label="Description"
                value={d.description}
                onChange={(description) => set({ description })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  label="Card button text"
                  value={d.ctaText}
                  onChange={(ctaText) => set({ ctaText })}
                />
                <TextInput
                  label="Layout"
                  value={d.layout}
                  onChange={(layout) => set({ layout })}
                  hint="Free-form hint for the theme, e.g. cards"
                />
              </div>
              <Toggle
                label="Show per-month / total toggle"
                checked={d.showToggle}
                onChange={(showToggle) => set({ showToggle })}
              />
              <p className="text-xs text-muted-foreground">
                Plans and prices come from{" "}
                <a href="/admin/plans" className="underline">
                  Plans
                </a>
                ; only active plans are listed publicly.
              </p>
            </>
          )}
        </SectionForm>
      );
    case "footer":
      return (
        <SectionForm
          initial={content.footer}
          onSave={(footer) => onSave({ footer })}
          pending={pending}
        >
          {(d, set) => (
            <>
              <TextArea
                label="Description"
                value={d.description}
                onChange={(description) => set({ description })}
              />
              <TextInput
                label="Copyright"
                value={d.copyright}
                onChange={(copyright) => set({ copyright })}
                hint="Falls back to Settings › Copyright when empty"
              />
              <div>
                <p className="mb-2 text-[13px] font-medium">Links</p>
                <ListEditor<{ label: string; href: string }>
                  items={d.links ?? []}
                  onChange={(links) => set({ links })}
                  blank={() => ({ label: "", href: "" })}
                  itemLabel="Link"
                  addLabel="Add link"
                  fields={[
                    { key: "label", label: "Label" },
                    { key: "href", label: "URL" },
                  ]}
                />
              </div>
            </>
          )}
        </SectionForm>
      );
  }
}
