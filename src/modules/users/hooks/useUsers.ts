import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listUsers, createUser, updateUser } from "@/modules/auth/api/authApi";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: listUsers });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
