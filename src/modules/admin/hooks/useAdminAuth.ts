import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import { clearAdminAuth } from "../adminSlice";
import { useAppDispatch } from "@/app/hooks";

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      adminApi.login(email, password),
  });
}

/**
 * Signing out drops the cached cross-tenant data as well as the token. Without
 * the `clear()` the next admin to sign in on the same tab would be shown the
 * previous one's company list until each query refetched.
 */
export function useAdminSignOut() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return async () => {
    await adminApi.logout();
    dispatch(clearAdminAuth());
    qc.clear();
    navigate("/admin/login", { replace: true });
  };
}
