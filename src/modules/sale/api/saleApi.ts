import { createResourceApi } from "@/modules/common/createResourceApi";
import type { Sale, SaleListQuery, SaleCreatePayload } from "../types";

const api = createResourceApi<Sale, SaleListQuery, SaleCreatePayload>("/sales");

export const listSales = (query: SaleListQuery) => api.list(query);
export const createSale = (payload: SaleCreatePayload) => api.create(payload);
export const deleteSale = (id: string) => api.remove(id);
