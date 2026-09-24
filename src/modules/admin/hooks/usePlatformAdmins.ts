import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";

export function usePlatformAdmins() {
  return useQuery({
    queryKey: ["admin", "admins"],
    queryFn: () => adminApi.listAdmins(),
  });
}

function useAdminsInvalidator() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["admin", "admins"] });
    qc.invalidateQueries({ queryKey: ["admin", "audit"] });
  };
}

export function useCreatePlatformAdmin() {
  const invalidate = useAdminsInvalidator();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      adminApi.createAdmin(payload),
    onSuccess: invalidate,
  });
}

export function useUpdatePlatformAdmin() {
  const invalidate = useAdminsInvalidator();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      adminApi.updateAdmin(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeletePlatformAdmin() {
  const invalidate = useAdminsInvalidator();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdmin(id),
    onSuccess: invalidate,
  });
}
