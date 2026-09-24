import { useState } from "react";
import { FormDialog } from "@/modules/common/FormDialog";
import { useAddStock } from "../hooks/useInventory";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import type { Inventory } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Inventory | null;
  onSuccess: () => void;
}

export function AddStockDialog({ open, onOpenChange, item, onSuccess }: Props) {
  const [qty, setQty] = useState(1);
  const addMutation = useAddStock();

  async function submit() {
    if (!item || qty < 1) {
      toast.error("Enter a quantity of at least 1");
      return;
    }
    try {
      await addMutation.mutateAsync({ id: item.id, quantity: qty });
      toast.success(`Added ${qty} unit(s) to ${item.model}`);
      setQty(1);
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
      title={item ? `Add Stock — ${item.model}` : "Add Stock"}
      onSubmit={submit}
      isPending={addMutation.isPending}
      submitLabel="Add Stock"
      size="sm"
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Current available:{" "}
          <strong className="text-foreground">{item?.availableQuantity ?? 0}</strong>
        </p>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Quantity to add
          </label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
      </div>
    </FormDialog>
  );
}
