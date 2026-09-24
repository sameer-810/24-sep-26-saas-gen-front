import { Activity as ActivityIcon } from "lucide-react";
import { FormDialog } from "@/modules/common/FormDialog";
import { useLeadTimeline } from "../hooks/useActivities";
import { ACTIVITY_META } from "../constants/activity.constants";
import { formatDateTime } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
  leadName?: string;
}

export function LeadTimelineDialog({ open, onOpenChange, leadId, leadName }: Props) {
  const { data, isLoading } = useLeadTimeline(open ? leadId : null);
  const items = data ?? [];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={leadName ? `Timeline — ${leadName}` : "Lead Timeline"}
      size="lg"
      hideFooter
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
      ) : (
        <ol className="relative ml-3 border-l border-border">
          {items.map((a) => {
            const meta = ACTIVITY_META[a.type];
            const Icon = meta?.icon ?? ActivityIcon;
            return (
              <li key={a.id} className="mb-5 ml-5">
                <span
                  className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-card ring-4 ring-background ${meta?.color ?? ""}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-medium text-foreground">{a.action}</p>
                  <time className="text-xs text-muted-foreground">
                    {formatDateTime(a.createdAt)}
                  </time>
                </div>
                {a.remarks && <p className="text-sm text-muted-foreground">{a.remarks}</p>}
                <p className="text-xs text-muted-foreground">
                  by {a.userName || a.user?.name || "system"}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </FormDialog>
  );
}
