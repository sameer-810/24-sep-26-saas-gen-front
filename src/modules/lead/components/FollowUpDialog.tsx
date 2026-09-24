import { useEffect, useState } from "react";
import { CalendarClock, MessageSquarePlus } from "lucide-react";
import { FormDialog } from "@/modules/common/FormDialog";
import { useAddFollowUp } from "../hooks/useLeads";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatDateTime, formatDate } from "@/lib/utils";
import type { Lead } from "../types";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSuccess: () => void;
}

export function FollowUpDialog({ open, onOpenChange, lead, onSuccess }: Props) {
  const [note, setNote] = useState("");
  const [nextDate, setNextDate] = useState("");
  // Local copy so newly added follow-ups appear instantly (the prop is a snapshot).
  const [localLead, setLocalLead] = useState<Lead | null>(lead);
  const addMutation = useAddFollowUp();

  useEffect(() => {
    setLocalLead(lead);
  }, [lead]);

  async function submit() {
    if (!localLead || !note.trim()) {
      toast.error("Enter a follow-up note");
      return;
    }
    try {
      const updated = await addMutation.mutateAsync({
        id: localLead.id,
        note: note.trim(),
        nextFollowUpDate: nextDate || undefined,
      });
      setLocalLead(updated);
      toast.success("Follow-up added");
      setNote("");
      setNextDate("");
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const history = localLead?.followUps ?? [];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={localLead ? `Follow-ups — ${localLead.customerName}` : "Follow-ups"}
      size="lg"
      hideFooter
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquarePlus className="h-4 w-4 text-primary" /> Add follow-up
          </div>
          <textarea
            className={inputCls}
            rows={2}
            placeholder="Called customer, shared quotation..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Next follow-up date
              </label>
              <input
                type="date"
                className={`${inputCls} w-44`}
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
              />
            </div>
            <button
              onClick={submit}
              disabled={addMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm transition-colors"
            >
              {addMutation.isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-foreground">History ({history.length})</div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No follow-ups logged yet.</p>
          ) : (
            <ol className="space-y-2">
              {[...history].reverse().map((f) => (
                <li key={f.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                  <p className="text-foreground">{f.note}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDateTime(f.createdAt)}</span>
                    {f.createdByName && <span>· by {f.createdByName}</span>}
                    {f.nextFollowUpDate && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <CalendarClock className="h-3 w-3" /> Next: {formatDate(f.nextFollowUpDate)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
