import { http } from "@/shared/api/http";
import { createResourceApi } from "@/modules/common/createResourceApi";
import type { Inventory, InventoryListQuery, InventoryCreatePayload } from "../types";

const api = createResourceApi<Inventory, InventoryListQuery, InventoryCreatePayload>("/inventory");

export const listInventory = (query: InventoryListQuery) => api.list(query);
export const createInventory = (payload: InventoryCreatePayload) => api.create(payload);
export const updateInventory = (id: string, payload: Partial<InventoryCreatePayload>) =>
  api.update(id, payload);
export const deleteInventory = (id: string) => api.remove(id);

export async function addStock(
  id: string,
  payload: { quantity: number; serialNumbers?: string[] },
) {
  const res = await http.post<{ data: Inventory }>(`/inventory/${id}/add-stock`, payload);
  return res.data.data;
}

export type ImportResult = {
  created: number;
  skipped: number;
  total: number;
  errors: { row: number; message: string }[];
};

export async function importInventory(fileBase64: string) {
  const res = await http.post<{ data: ImportResult }>("/inventory/import", { fileBase64 });
  return res.data.data;
}

export const inventoryExportPath = "/inventory/export";
