import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type OrgListQuery } from "../api/adminApi";

/**
 * Every console query key starts with "admin" so signing out can drop the
 * cross-tenant cache in one call, and so a tenant key can never collide with
 * one of these.
 */
export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => adminApi.overview(),
    staleTime: 30_000,
  });
}

export function useAdminOrgs(query: OrgListQuery) {
  return useQuery({
    queryKey: ["admin", "orgs", query],
    queryFn: () => adminApi.listOrganizations(query),
    // Paging a list that re-fetches from scratch blanks the table on every
    // page change; holding the previous rows keeps the row height stable.
    placeholderData: (prev) => prev,
  });
}

export function useAdminOrg(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "org", id],
    queryFn: () => adminApi.getOrganization(id as string),
    enabled: Boolean(id),
  });
}

function useOrgInvalidator() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: ["admin", "orgs"] });
    qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    // The audit trail records every one of these actions, so a console left
    // open on the Audit tab would otherwise show a log missing the last entry.
    qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    if (id) qc.invalidateQueries({ queryKey: ["admin", "org", id] });
  };
}

export function useCreateOrg() {
  const invalidate = useOrgInvalidator();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminApi.createOrganization(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateOrg() {
  const invalidate = useOrgInvalidator();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      adminApi.updateOrganization(id, payload),
    onSuccess: (_data, vars) => invalidate(vars.id),
  });
}

export function useArchiveOrg() {
  const invalidate = useOrgInvalidator();
  return useMutation({
    mutationFn: (id: string) => adminApi.archiveOrganization(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useAssignPlan() {
  const invalidate = useOrgInvalidator();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof adminApi.assignPlan>[1];
    }) => adminApi.assignPlan(id, payload),
    onSuccess: (_data, vars) => invalidate(vars.id),
  });
}

export type OrgLifecycleAction = "approve" | "reject" | "suspend" | "reactivate";

/** Approve / decline / suspend / reactivate — one mutation, four endpoints. */
export function useOrgLifecycle() {
  const invalidate = useOrgInvalidator();
  return useMutation({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: string;
      action: OrgLifecycleAction;
      note?: string;
    }) => {
      if (action === "approve") return adminApi.approveOrganization(id);
      if (action === "reject") return adminApi.rejectOrganization(id, note);
      if (action === "suspend") return adminApi.suspendOrganization(id);
      return adminApi.reactivateOrganization(id);
    },
    onSuccess: (_data, vars) => invalidate(vars.id),
  });
}

export function useOrgUsers(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "org-users", id],
    queryFn: () => adminApi.listOrgUsers(id as string),
    enabled: Boolean(id),
  });
}

export function useResetOrgUserPassword() {
  return useMutation({
    mutationFn: ({
      orgId,
      userId,
      password,
    }: {
      orgId: string;
      userId: string;
      password: string;
    }) => adminApi.resetOrgUserPassword(orgId, userId, password),
  });
}

export function useSetOrgUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orgId,
      userId,
      isActive,
    }: {
      orgId: string;
      userId: string;
      isActive: boolean;
    }) => adminApi.setOrgUserActive(orgId, userId, isActive),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "org-users", vars.orgId] });
      qc.invalidateQueries({ queryKey: ["admin", "org", vars.orgId] });
    },
  });
}
