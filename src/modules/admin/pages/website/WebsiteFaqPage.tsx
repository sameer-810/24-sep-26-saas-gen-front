import type { FaqItem } from "../../types";
import {
  useCreateFaq,
  useDeleteFaq,
  useUpdateFaq,
  useWebsiteFaq,
} from "../../hooks/useAdminWebsite";
import { CrudListPage } from "./CrudListPage";
import { TextArea, TextInput, Toggle } from "./WebsiteUi";

type Faq = FaqItem & { _id: string };

export function WebsiteFaqPage() {
  return (
    <CrudListPage<Faq>
      title="FAQ"
      subtitle="Questions and answers shown in the accordion on the public site."
      crumbs={[{ label: "Website", to: "/admin/website" }, { label: "FAQ" }]}
      itemLabel="Question"
      list={useWebsiteFaq() as ReturnType<typeof useWebsiteFaq> & { data: Faq[] | undefined }}
      create={useCreateFaq()}
      update={useUpdateFaq()}
      remove={useDeleteFaq()}
      blank={() => ({ question: "", answer: "", order: 0, isVisible: true })}
      validate={(f) =>
        !f.question.trim() ? "Question is required" : !f.answer.trim() ? "Answer is required" : null
      }
      summarise={(f) => f.question}
      columns={[
        {
          header: "Question",
          render: (f) => (
            <span>
              <span className="block font-semibold">{f.question}</span>
              <span className="block max-w-lg truncate text-xs text-muted-foreground">
                {f.answer}
              </span>
            </span>
          ),
        },
      ]}
      Form={({ form, set }) => (
        <div className="space-y-4">
          <TextInput
            label="Question"
            value={form.question}
            onChange={(question) => set({ question })}
          />
          <TextArea
            label="Answer"
            rows={5}
            value={form.answer}
            onChange={(answer) => set({ answer })}
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
