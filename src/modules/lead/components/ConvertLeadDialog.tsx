import { useEffect, useState } from "react";
import { FormDialog } from "@/modules/common/FormDialog";
import { useConvertLead } from "../hooks/useLeads";
import { useInventoryOptions } from "@/modules/inventory/hooks/useInventory";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatCurrency } from "@/lib/utils";
import type { Lead } from "../types";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSuccess: () => void;
}

export function ConvertLeadDialog({ open, onOpenChange, lead, onSuccess }: Props) {
  const convertMutation = useConvertLead();
  const { data: invData } = useInventoryOptions(open);
  const items = invData?.items ?? [];

  const [inventoryId, setInventoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  useEffect(() => {
    if (open) {
      setInventoryId("");
      setQuantity(1);
      setUnitPrice(0);
    }
  }, [open]);

  function onPick(id: string) {
    setInventoryId(id);
    const item = items.find((i) => i.id === id);
    if (item?.sellingPrice) setUnitPrice(item.sellingPrice);
  }

  // Prefer a model matching the lead's required KVA as a hint.
  const matching = lead?.requiredKva
    ? items.filter((i) => i.kva === lead.requiredKva && i.availableQuantity > 0)
    : [];
  const selected = items.find((i) => i.id === inventoryId);
  const total = quantity * unitPrice;

  async function submit() {
    if (!lead) return;
    if (!inventoryId) {
      toast.error("Select a generator model to dispatch");
      return;
    }
    try {
      await convertMutation.mutateAsync({
        id: lead.id,
        payload: { inventoryId, quantity: Number(quantity), unitPrice: Number(unitPrice) },
      });
      toast.success("Lead converted — sale recorded and stock updated");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={lead ? `Convert Lead — ${lead.customerName}` : "Convert Lead"}
      onSubmit={submit}
      isPending={convertMutation.isPending}
      submitLabel="Convert to Sale"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Converting creates a sale record and reduces stock for the chosen model.
          {lead?.requiredKva ? ` Lead requirement: ${lead.requiredKva} kVA.` : ""}
        </p>
        {matching.length > 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 text-xs text-foreground">
            Matching {lead?.requiredKva} kVA models in stock:{" "}
            {matching.map((m) => m.model).join(", ")}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Generator Model *
          </label>
          <select className={inputCls} value={inventoryId} onChange={(e) => onPick(e.target.value)}>
            <option value="">— Select from inventory —</option>
            {items.map((i) => (
              <option key={i.id} value={i.id} disabled={i.availableQuantity <= 0}>
                {i.model} · {i.kva} kVA · {i.availableQuantity} in stock
              </option>
            ))}
          </select>
          {selected && selected.availableQuantity <= 0 && (
            <p className="mt-1 text-xs text-destructive">Out of stock — add stock first.</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Unit Price (₹)
            </label>
            <input
              type="number"
              className={inputCls}
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <div className="text-xs text-muted-foreground">Sale Total</div>
          <div className="text-lg font-bold text-primary">{formatCurrency(total)}</div>
        </div>
      </div>
    </FormDialog>
  );
}
