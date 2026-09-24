import { http } from "@/shared/api/http";
import type { Activity, ActivityListQuery, ActivityListResult } from "../types";

export async function listActivities(query: ActivityListQuery): Promise<ActivityListResult> {
  const res = await http.get<{ data: Activity[]; meta: ActivityListResult["meta"] }>(
    "/activities",
    {
      params: query,
    },
  );
  return { items: res.data.data, meta: res.data.meta };
}

export async function createManualNote(payload: {
  remarks: string;
  lead?: string;
  entityLabel?: string;
}) {
  const res = await http.post<{ data: Activity }>("/activities", payload);
  return res.data.data;
}

export async function getLeadTimeline(leadId: string) {
  const res = await http.get<{ data: Activity[] }>(`/activities/lead/${leadId}`);
  return res.data.data;
}
