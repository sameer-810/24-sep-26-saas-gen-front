import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listActivities, createManualNote, getLeadTimeline } from "../api/activityApi";
import type { ActivityListQuery } from "../types";

export function useActivities(query: ActivityListQuery) {
  return useQuery({
    queryKey: ["activities", "list", query],
    queryFn: () => listActivities(query),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createManualNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useLeadTimeline(leadId: string | null) {
  return useQuery({
    queryKey: ["activities", "lead", leadId],
    queryFn: () => getLeadTimeline(leadId as string),
    enabled: Boolean(leadId),
  });
}
