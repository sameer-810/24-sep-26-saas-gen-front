import { createResourceHooks } from "@/modules/common/createResourceHooks";
import { listSales, createSale, deleteSale } from "../api/saleApi";
import type { SaleListQuery, SaleCreatePayload, SaleListResult } from "../types";

const crud = createResourceHooks<SaleListQuery, SaleCreatePayload, SaleListResult>("sales", {
  list: listSales,
  create: createSale,
  update: () => Promise.reject(new Error("Sales are immutable; void and re-create instead")),
  remove: deleteSale,
});

export const useSales = crud.useList;
export const useCreateSale = crud.useCreate;
export const useDeleteSale = crud.useDelete;
