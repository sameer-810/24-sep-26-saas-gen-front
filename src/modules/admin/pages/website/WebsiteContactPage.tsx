import { useState } from "react";
import { Archive, MailOpen } from "lucide-react";
import { PageLoader } from "@/shared/components/PageLoader";
import { Badge } from "@/shared/components/Badge";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import {
  Pager,
  SectionTitle,
  adminBtnSmall,
  adminPanel,
  adminRow,
  adminTd,
  adminTh,
} from "../../components/AdminUi";
import {
  useAdminWebsite,
  useSaveContact,
  useUpdateInquiry,
  useWebsiteInquiries,
} from "../../hooks/useAdminWebsite";
import type { InquiryStatus, SocialLink, WebsiteContact } from "../../types";
import {
  DRAFT_NOTE,
  DraftNote,
  ListEditor,
  SectionForm,
  TextArea,
  TextInput,
  Toggle,
} from "./WebsiteUi";

const STATUS_TONE: Record<InquiryStatus, "info" | "neutral" | "warning"> = {
  new: "info",
  read: "neutral",
  archived: "warning",
};

function Inquiries() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<InquiryStatus | "">("");
  const { data, isLoading } = useWebsiteInquiries({ page, limit, status });
  const update = useUpdateInquiry();

  async function mark(id: string, next: InquiryStatus) {
    try {
      await update.mutateAsync({ id, status: next });
      toast.success(`Marked ${next}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className={`${adminPanel} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-base font-bold tracking-tight">Inquiries</h2>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as InquiryStatus | "");
            setPage(1);
          }}
          className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {isLoading ? (
        <PageLoader />
      ) : !data?.items.length ? (
        <EmptyState
          title="No inquiries"
          subtitle="Messages from the public contact form land here."
        />
      ) : (
        <>
          <div className="overflow-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="bg-card">
                <tr className="border-b border-border">
                  {["From", "Message", "Status", "Received", "Actions"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className={`${adminTh} ${h === "Actions" ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((q) => (
                  <tr key={q.id} className={adminRow}>
                    <td className={adminTd}>
                      <span className="block font-semibold">{q.name}</span>
                      <a
                        href={`mailto:${q.email}`}
                        className="block text-xs text-muted-foreground hover:underline"
                      >
                        {q.email}
                      </a>
                      {(q.phone || q.company) && (
                        <span className="block text-xs text-muted-foreground">
                          {[q.company, q.phone].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </td>
                    <td className={`${adminTd} max-w-md`}>
                      <p className="line-clamp-3 whitespace-pre-line text-[13px] leading-relaxed">
                        {q.message}
                      </p>
                    </td>
                    <td className={adminTd}>
                      <Badge tone={STATUS_TONE[q.status]}>{q.status}</Badge>
                    </td>
                    <td className={`${adminTd} whitespace-nowrap text-xs text-muted-foreground`}>
                      {formatDateTime(q.createdAt)}
                    </td>
                    <td className={adminTd}>
                      <div className="flex items-center justify-end gap-1.5">
                        {q.status !== "read" && (
                          <button
                            type="button"
                            onClick={() => mark(q.id, "read")}
                            disabled={update.isPending}
                            className={adminBtnSmall}
                          >
                            <MailOpen className="h-3 w-3" /> Mark read
                          </button>
                        )}
                        {q.status !== "archived" && (
                          <button
                            type="button"
                            onClick={() => mark(q.id, "archived")}
                            disabled={update.isPending}
                            className={adminBtnSmall}
                          >
                            <Archive className="h-3 w-3" /> Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager
            page={data.meta.page}
            limit={limit}
            total={data.meta.total}
            totalPages={data.meta.totalPages}
            onPage={setPage}
            onLimit={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}

export function WebsiteContactPage() {
  const { data: doc, isLoading } = useAdminWebsite();
  const save = useSaveContact();

  async function onSave(contact: WebsiteContact) {
    try {
      await save.mutateAsync(contact);
      toast.success(`Contact details saved. ${DRAFT_NOTE}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ label: "Website", to: "/admin/website" }, { label: "Contact" }]}
        title="Contact"
        subtitle="What the contact section shows, and the messages it collects."
      />
      <DraftNote />
      <div className={`${adminPanel} p-6`}>
        <SectionTitle>Contact section</SectionTitle>
        {isLoading || !doc ? (
          <PageLoader />
        ) : (
          <SectionForm
            key={doc.updatedAt}
            initial={doc.draft.contact}
            onSave={onSave}
            pending={save.isPending}
          >
            {(d, set) => (
              <>
                <TextInput label="Title" value={d.title} onChange={(title) => set({ title })} />
                <TextArea
                  label="Description"
                  value={d.description}
                  onChange={(description) => set({ description })}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Phone"
                    type="tel"
                    value={d.phone}
                    onChange={(phone) => set({ phone })}
                  />
                  <TextInput
                    label="Email"
                    type="email"
                    value={d.email}
                    onChange={(email) => set({ email })}
                  />
                  <TextInput
                    label="WhatsApp"
                    type="tel"
                    value={d.whatsapp}
                    onChange={(whatsapp) => set({ whatsapp })}
                    hint="With country code, e.g. +91 98765 43210"
                  />
                  <TextInput
                    label="Business hours"
                    value={d.businessHours}
                    onChange={(businessHours) => set({ businessHours })}
                  />
                </div>
                <TextArea
                  label="Address"
                  rows={2}
                  value={d.address}
                  onChange={(address) => set({ address })}
                />
                <Toggle
                  label="Show the contact form"
                  checked={d.formEnabled}
                  onChange={(formEnabled) => set({ formEnabled })}
                />
                <div>
                  <p className="mb-2 text-[13px] font-medium">Social links</p>
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
                </div>
              </>
            )}
          </SectionForm>
        )}
      </div>
      <Inquiries />
    </div>
  );
}
