import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { PageLoader } from "@/shared/components/PageLoader";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { PageHeader } from "../../components/PageHeader";
import { adminBtnPrimary, adminBtnSmall, adminInput, adminPanel } from "../../components/AdminUi";
import { useSaveNavigation, useWebsiteNavigation } from "../../hooks/useAdminWebsite";
import type { NavItem } from "../../types";
import { DRAFT_NOTE, DraftNote, Toggle } from "./WebsiteUi";

function NavEditor({
  initial,
  onSave,
  pending,
}: {
  initial: NavItem[];
  onSave: (items: NavItem[]) => void;
  pending: boolean;
}) {
  const [rows, setRows] = useState<NavItem[]>(initial);

  const commit = (next: NavItem[]) => setRows(next.map((r, i) => ({ ...r, order: i })));
  const patch = (i: number, p: Partial<NavItem>) =>
    commit(rows.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(rows.map(({ id: _ignored, ...r }) => r));
      }}
    >
      <div className="hidden grid-cols-[1fr_1fr_auto_auto] gap-3 px-1 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground md:grid">
        <span>Label</span>
        <span>Link</span>
        <span>Visible</span>
        <span className="w-[108px]" />
      </div>
      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No links yet.
        </p>
      )}
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/30 p-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-center"
        >
          <input
            aria-label="Label"
            value={r.label}
            onChange={(e) => patch(i, { label: e.target.value })}
            className={adminInput}
            placeholder="Features"
          />
          <input
            aria-label="Link"
            value={r.href}
            onChange={(e) => patch(i, { href: e.target.value })}
            className={`${adminInput} font-mono`}
            placeholder="#features"
          />
          <Toggle
            label="Visible"
            checked={r.isVisible}
            onChange={(isVisible) => patch(i, { isVisible })}
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className={adminBtnSmall}
              aria-label="Move up"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === rows.length - 1}
              className={adminBtnSmall}
              aria-label="Move down"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => commit(rows.filter((_, idx) => idx !== i))}
              className={`${adminBtnSmall} hover:text-rose-600`}
              aria-label="Remove"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={() =>
            commit([...rows, { label: "", href: "#", order: rows.length, isVisible: true }])
          }
          className={adminBtnSmall}
        >
          <Plus className="h-3 w-3" /> Add link
        </button>
        <button type="submit" disabled={pending} className={adminBtnPrimary}>
          {pending ? "Saving…" : "Save navigation"}
        </button>
      </div>
    </form>
  );
}

export function WebsiteNavigationPage() {
  const { data, isLoading, dataUpdatedAt } = useWebsiteNavigation();
  const save = useSaveNavigation();

  async function onSave(items: NavItem[]) {
    if (items.some((i) => !i.label.trim() || !i.href.trim())) {
      toast.error("Every link needs a label and a target");
      return;
    }
    try {
      await save.mutateAsync(items);
      toast.success(`Navigation saved. ${DRAFT_NOTE}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ label: "Website", to: "/admin/website" }, { label: "Navigation" }]}
        title="Navigation"
        subtitle="Links in the public site's header. Use #section for in-page anchors (e.g. #pricing)."
      />
      <DraftNote />
      <div className={`${adminPanel} p-6`}>
        {isLoading || !data ? (
          <PageLoader />
        ) : (
          <NavEditor
            key={dataUpdatedAt}
            initial={[...data].sort((a, b) => a.order - b.order)}
            onSave={onSave}
            pending={save.isPending}
          />
        )}
      </div>
    </div>
  );
}
