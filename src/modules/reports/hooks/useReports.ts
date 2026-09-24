import { useQuery } from "@tanstack/react-query";
import { getReport, type ReportName } from "../api/reportsApi";

export function useReport(name: ReportName, params: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["reports", name, params],
    queryFn: () => getReport(name, params),
  });
}
