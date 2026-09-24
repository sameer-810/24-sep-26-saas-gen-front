import { useState } from "react";
import {
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Globe,
  Image,
  LayoutList,
  Pencil,
  Search,
  Settings2,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageLoader } from "@/shared/components/PageLoader";
import { Badge } from "@/shared/components/Badge";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "../../components/PageHeader";
import { StatCard } from "../../components/StatCard";
import {
  ConfirmDialog,
  adminBtnPrimary,
  adminBtnSecondary,
  adminBtnSmall,
  adminPanel,
  adminRow,
  adminTd,
  adminTh,
} from "../../components/AdminUi";
import { useAdminWebsite, usePublishWebsite, useSaveSections } from "../../hooks/useAdminWebsite";
import type { SectionEntry } from "../../types";
import { SECTION_KEYS, SECTION_META } from "./WebsiteUi";

const QUICK_LINKS = [
  { to: "/admin/website/navigation", label: "Navigation", icon: LayoutList },
  { to: "/admin/website/media", label: "Media", icon: Image },
  { to: "/admin/website/seo", label: "SEO", icon: Search },
  { to: "/admin/website/settings", label: "Settings", icon: Settings2 },
];

/** Every key exactly once, in saved order, so a partial or unordered list still yields 11 rows. */
export function normaliseSections(saved: SectionEntry[] | undefined): SectionEntry[] {
  const byKey = new Map((saved ?? []).map((s) => [s.key, s]));
  return SECTION_KEYS.map((key, i) => byKey.get(key) ?? { key, order: 100 + i, isVisible: true })
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ ...s, order: i }));
}

export function WebsiteOverviewPage() {
  const { data: doc, isLoading } = useAdminWebsite();
  const publish = usePublishWebsite();
  const saveSections = useSaveSections();
  const [confirmPublish, setConfirmPublish] = useState(false);

  const sections = normaliseSections(doc?.draft.sections);
  const visibleCount = sections.filter((s) => s.isVisible).length;
  const unpublished =
    Boolean(doc) &&
    (!doc?.publishedAt || new Date(doc.updatedAt).getTime() > new Date(doc.publishedAt).getTime());

  async function doPublish() {
    try {
      await publish.mutateAsync(undefined);
      toast.success("Website published");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setConfirmPublish(false);
    }
  }

  async function toggle(entry: SectionEntry) {
    try {
      await saveSections.mutateAsync(
        sections.map((s) => (s.key === entry.key ? { ...s, isVisible: !s.isVisible } : s)),
      );
      toast.success(
        `${SECTION_META[entry.key].label} ${entry.isVisible ? "hidden" : "shown"} in draft`,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8" data-testid="admin-website-overview">
      <PageHeader
        crumbs={[{ label: "Website" }]}
        title={
          <>
            Website
            {doc && (
              <Badge tone={doc.status === "published" ? "success" : "warning"}>
                {doc.status === "published" ? "Published" : "Draft"}
              </Badge>
            )}
            {unpublished && <Badge tone="info">Unpublished changes</Badge>}
          </>
        }
        subtitle="The public marketing site. Edit in draft, then publish when it reads right."
        action={
          <>
            <a href="/" target="_blank" rel="noopener noreferrer" className={adminBtnSecondary}>
              <ExternalLink className="h-4 w-4" /> Preview
            </a>
            <Link to="/admin/website/sections" className={adminBtnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <button
              type="button"
              onClick={() => setConfirmPublish(true)}
              disabled={!doc}
              className={adminBtnPrimary}
            >
              <UploadCloud className="h-4 w-4" /> Publish
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Status"
          value={doc ? (doc.status === "published" ? "Live" : "Draft") : "—"}
          icon={Globe}
          tone={doc?.status === "published" ? "green" : "amber"}
        />
        <StatCard
          label="Visible sections"
          value={doc ? `${visibleCount} / ${sections.length}` : "—"}
          icon={LayoutList}
          tone="blue"
        />
        <StatCard
          label="Last updated"
          value={<span className="text-lg">{doc ? formatDateTime(doc.updatedAt) : "—"}</span>}
          icon={FileText}
          tone="purple"
        />
        <StatCard
          label="Last published"
          value={
            <span className="text-lg">
              {doc?.publishedAt ? formatDateTime(doc.publishedAt) : "Never"}
            </span>
          }
          icon={UploadCloud}
          tone={doc?.publishedAt ? "green" : "red"}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_LINKS.map(({ to, label, icon: QIcon }) => (
          <Link key={to} to={to} className={adminBtnSecondary}>
            <QIcon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </div>

      <div className={`${adminPanel} overflow-hidden`}>
        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-card">
                <tr className="border-b border-border">
                  <th scope="col" className={adminTh}>
                    Section
                  </th>
                  <th scope="col" className={adminTh}>
                    Status
                  </th>
                  <th scope="col" className={`${adminTh} text-right`}>
                    Order
                  </th>
                  <th scope="col" className={`${adminTh} text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sections.map((s) => (
                  <tr key={s.key} className={adminRow}>
                    <td className={adminTd}>
                      <span className="font-semibold">{SECTION_META[s.key].label}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{s.key}</span>
                    </td>
                    <td className={adminTd}>
                      {s.isVisible ? (
                        <Badge tone="success">Visible</Badge>
                      ) : (
                        <Badge tone="neutral">Hidden</Badge>
                      )}
                    </td>
                    <td className={`${adminTd} text-right font-mono tabular-nums`}>
                      {s.order + 1}
                    </td>
                    <td className={adminTd}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={SECTION_META[s.key].editPath} className={adminBtnSmall}>
                          <Pencil className="h-3 w-3" /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle(s)}
                          disabled={saveSections.isPending}
                          className={adminBtnSmall}
                        >
                          {s.isVisible ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                          {s.isVisible ? "Hide" : "Show"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {doc?.lastEditedBy && (
        <p className="text-xs text-muted-foreground">Last edited by {doc.lastEditedBy}</p>
      )}

      <ConfirmDialog
        open={confirmPublish}
        title="Publish website"
        confirmLabel="Publish"
        pending={publish.isPending}
        onCancel={() => setConfirmPublish(false)}
        onConfirm={doPublish}
        body={<p>The current draft replaces what visitors see at “/” immediately.</p>}
      />
    </div>
  );
}
