import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createResourceHooks } from "@/modules/common/createResourceHooks";
import {
  listInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  addStock,
} from "../api/inventoryApi";
import type { InventoryListQuery, InventoryCreatePayload, InventoryListResult } from "../types";

const crud = createResourceHooks<InventoryListQuery, InventoryCreatePayload, InventoryListResult>(
  "inventory",
  {
    list: listInventory,
    create: createInventory,
    update: updateInventory,
    remove: deleteInventory,
  },
);

export const useInventory = crud.useList;
export const useCreateInventory = crud.useCreate;
export const useUpdateInventory = crud.useUpdate;
export const useDeleteInventory = crud.useDelete;

export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => addStock(id, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory", "list"] }),
  });
}

/** Lightweight inventory list for selectors (convert lead, manual sale). */
export function useInventoryOptions(enabled = true) {
  return useQuery({
    queryKey: ["inventory", "options"],
    queryFn: () => listInventory({ page: 1, limit: 200 }),
    enabled,
    staleTime: 60 * 1000,
  });
}
