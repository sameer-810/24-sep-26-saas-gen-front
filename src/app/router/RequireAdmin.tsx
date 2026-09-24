import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

/**
 * The tenant counterpart of this guard reads `state.auth`; this one reads
 * `state.admin` and sends people to a different login. The two are deliberately
 * separate files rather than one parameterised guard — a single component with
 * a `slice` prop is one wrong prop away from letting a tenant employee into the
 * console.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const token = useAppSelector((s) => s.admin.accessToken);
  const loc = useLocation();
  if (!token) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
