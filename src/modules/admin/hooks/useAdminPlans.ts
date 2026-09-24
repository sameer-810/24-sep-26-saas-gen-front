import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";

export function useAdminPlans(includeInactive = true) {
  return useQuery({
    queryKey: ["admin", "plans", includeInactive],
    queryFn: () => adminApi.listPlans(includeInactive),
    staleTime: 60_000,
  });
}

function usePlanInvalidator() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["admin", "plans"] });
    // Featuring a plan demotes whichever one held it, so the whole list moves,
    // and an org's subscription card prints the plan's name.
    qc.invalidateQueries({ queryKey: ["admin", "org"] });
    qc.invalidateQueries({ queryKey: ["admin", "audit"] });
  };
}

export function useCreatePlan() {
  const invalidate = usePlanInvalidator();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminApi.createPlan(payload),
    onSuccess: invalidate,
  });
}

export function useUpdatePlan() {
  const invalidate = usePlanInvalidator();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      adminApi.updatePlan(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeletePlan() {
  const invalidate = usePlanInvalidator();
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePlan(id),
    onSuccess: invalidate,
  });
}
