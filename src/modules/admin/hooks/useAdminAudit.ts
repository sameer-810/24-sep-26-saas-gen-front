import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";

export function useAdminAudit(query: {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
}) {
  return useQuery({
    queryKey: ["admin", "audit", query],
    queryFn: () => adminApi.listAudit(query),
    placeholderData: (prev) => prev,
  });
}
