import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageLoader } from "@/shared/components/PageLoader";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/lib/utils";
import { PageHeader } from "../../components/PageHeader";
import { SectionTitle, adminBtnPrimary, adminBtnSmall, adminPanel } from "../../components/AdminUi";
import { useAdminWebsite, useSaveSections, useUpdateWebsite } from "../../hooks/useAdminWebsite";
import type { SectionEntry, WebsitePatch } from "../../types";
import { normaliseSections } from "./WebsiteOverviewPage";
import { COPY_TABS, SectionEditor, type CopyTab } from "./SectionEditors";
import { DRAFT_NOTE, DraftNote, SECTION_META, Toggle } from "./WebsiteUi";

/** Order + visibility with HTML5 drag-and-drop, and arrow buttons for keyboards and phones. */
function OrderEditor({
  initial,
  onSave,
  pending,
}: {
  initial: SectionEntry[];
  onSave: (s: SectionEntry[]) => void;
  pending: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  useEffect(() => setRows(initial), [initial]);

  function reorder(from: number, to: number) {
    if (from === to) return;
    setRows((r) => {
      const next = [...r];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  return (
    <div className="space-y-4">
      <ol className="divide-y divide-border rounded-xl border border-border">
        {rows.map((s, i) => (
          <li
            key={s.key}
            draggable
            onDragStart={(e) => {
              setDragging(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging !== null) reorder(dragging, i);
              setDragging(null);
              setOver(null);
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            className={cn(
              "flex items-center gap-3 bg-card px-3 py-2.5 first:rounded-t-xl last:rounded-b-xl",
              over === i && dragging !== null && dragging !== i && "bg-blue-50 dark:bg-blue-500/10",
              dragging === i && "opacity-50",
            )}
          >
            <GripVertical
              className="h-4 w-4 cursor-grab text-muted-foreground"
              aria-hidden="true"
            />
            <span className="w-6 font-mono text-xs tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <span
              className={cn(
                "flex-1 text-sm font-semibold",
                !s.isVisible && "text-muted-foreground line-through",
              )}
            >
              {SECTION_META[s.key].label}
            </span>
            <Toggle
              label="Visible"
              checked={s.isVisible}
              onChange={(isVisible) =>
                setRows((r) => r.map((x) => (x.key === s.key ? { ...x, isVisible } : x)))
              }
            />
            <button
              type="button"
              onClick={() => reorder(i, i - 1)}
              disabled={i === 0}
              className={adminBtnSmall}
              aria-label={`Move ${SECTION_META[s.key].label} up`}
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => reorder(i, i + 1)}
              disabled={i === rows.length - 1}
              className={adminBtnSmall}
              aria-label={`Move ${SECTION_META[s.key].label} down`}
            >
              <ArrowDown className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ol>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onSave(rows)}
          disabled={pending}
          className={adminBtnPrimary}
        >
          {pending ? "Saving…" : "Save order & visibility"}
        </button>
      </div>
    </div>
  );
}

export function WebsiteSectionsPage() {
  const { data: doc, isLoading } = useAdminWebsite();
  const saveSections = useSaveSections();
  const update = useUpdateWebsite();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab") as CopyTab | null;
  const tab: CopyTab = COPY_TABS.some((t) => t.key === tabParam) ? (tabParam as CopyTab) : "hero";

  async function saveOrder(rows: SectionEntry[]) {
    try {
      await saveSections.mutateAsync(rows);
      toast.success(`Section order saved. ${DRAFT_NOTE}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function saveCopy(patch: WebsitePatch) {
    try {
      await update.mutateAsync(patch);
      toast.success(`Saved. ${DRAFT_NOTE}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8" data-testid="admin-website-sections">
      <PageHeader
        crumbs={[{ label: "Website", to: "/admin/website" }, { label: "Sections" }]}
        title="Sections"
        subtitle="Order and show or hide the page's sections, then edit each one's copy below."
      />
      <DraftNote />

      {isLoading || !doc ? (
        <PageLoader />
      ) : (
        <>
          <div className={`${adminPanel} p-6`}>
            <SectionTitle>Order & visibility</SectionTitle>
            <OrderEditor
              key={doc.updatedAt}
              initial={normaliseSections(doc.draft.sections)}
              onSave={saveOrder}
              pending={saveSections.isPending}
            />
          </div>

          <div className={`${adminPanel} p-6`}>
            <SectionTitle>Copy</SectionTitle>
            <div
              role="tablist"
              aria-label="Section"
              className="mb-6 flex flex-wrap gap-1 border-b border-border"
            >
              {COPY_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setParams({ tab: t.key }, { replace: true })}
                  className={cn(
                    "-mb-px border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors",
                    tab === t.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div role="tabpanel" key={`${tab}-${doc.updatedAt}`}>
              <SectionEditor
                tab={tab}
                content={doc.draft}
                onSave={saveCopy}
                pending={update.isPending}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
