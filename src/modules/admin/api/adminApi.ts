import { adminHttp } from "@/shared/api/adminHttp";
import type {
  AdminOrganization,
  AdminOverview,
  AdminPlan,
  AuditEntry,
  FaqItem,
  FeatureItem,
  InquiryStatus,
  MediaUpload,
  NavItem,
  OrgUser,
  PlatformAdminRow,
  SectionEntry,
  WebsiteContact,
  WebsiteDoc,
  WebsiteInquiry,
  WebsitePatch,
  WebsiteSeo,
  WebsiteSettings,
} from "../types";
import type { PlatformAdmin } from "../adminSlice";

/** The API envelope: { success, message?, data?, meta? }. */
type Envelope<T> = { data: T; message?: string };
type ListEnvelope<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type OrgListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "suspended" | "pending" | "rejected" | "";
};

export const adminApi = {
  /* ── auth ─────────────────────────────────────────────────────────────── */
  async login(email: string, password: string) {
    const res = await adminHttp.post<
      Envelope<{ accessToken: string; refreshToken: string; admin: PlatformAdmin }>
    >("/auth/login", { email, password });
    return res.data.data;
  },

  async logout() {
    // Best effort: the local session is cleared regardless. A failed logout
    // must never leave someone stuck signed in to the console.
    await adminHttp.post("/auth/logout").catch(() => undefined);
  },

  async me() {
    const res = await adminHttp.get<Envelope<PlatformAdmin>>("/auth/me");
    return res.data.data;
  },

  /* ── overview ─────────────────────────────────────────────────────────── */
  async overview() {
    const res = await adminHttp.get<Envelope<AdminOverview>>("/overview");
    return res.data.data;
  },

  /* ── organizations ────────────────────────────────────────────────────── */
  async listOrganizations(query: OrgListQuery) {
    const res = await adminHttp.get<ListEnvelope<AdminOrganization>>("/organizations", {
      params: query,
    });
    return { items: res.data.data, meta: res.data.meta };
  },

  async getOrganization(id: string) {
    const res = await adminHttp.get<Envelope<AdminOrganization>>(`/organizations/${id}`);
    return res.data.data;
  },

  async createOrganization(payload: Record<string, unknown>) {
    const res = await adminHttp.post<Envelope<AdminOrganization>>("/organizations", payload);
    return res.data.data;
  },

  async updateOrganization(id: string, payload: Record<string, unknown>) {
    const res = await adminHttp.patch<Envelope<AdminOrganization>>(`/organizations/${id}`, payload);
    return res.data.data;
  },

  async archiveOrganization(id: string) {
    await adminHttp.delete(`/organizations/${id}`);
  },

  async assignPlan(
    id: string,
    payload: {
      planCode: string;
      status: string;
      trialEndsAt?: string | null;
      currentPeriodEndsAt?: string | null;
    },
  ) {
    const res = await adminHttp.post<Envelope<AdminOrganization>>(
      `/organizations/${id}/plan`,
      payload,
    );
    return res.data.data;
  },

  async approveOrganization(id: string) {
    const res = await adminHttp.post<Envelope<AdminOrganization>>(`/organizations/${id}/approve`);
    return res.data.data;
  },

  async rejectOrganization(id: string, note?: string) {
    const res = await adminHttp.post<Envelope<AdminOrganization>>(`/organizations/${id}/reject`, {
      note,
    });
    return res.data.data;
  },

  async suspendOrganization(id: string) {
    const res = await adminHttp.post<Envelope<AdminOrganization>>(`/organizations/${id}/suspend`);
    return res.data.data;
  },

  async reactivateOrganization(id: string) {
    const res = await adminHttp.post<Envelope<AdminOrganization>>(
      `/organizations/${id}/reactivate`,
    );
    return res.data.data;
  },

  /* ── tenant users ─────────────────────────────────────────────────────── */
  async listOrgUsers(id: string) {
    const res = await adminHttp.get<Envelope<OrgUser[]>>(`/organizations/${id}/users`);
    return res.data.data;
  },

  async resetOrgUserPassword(orgId: string, userId: string, password: string) {
    await adminHttp.post(`/organizations/${orgId}/users/${userId}/reset-password`, { password });
  },

  async setOrgUserActive(orgId: string, userId: string, isActive: boolean) {
    await adminHttp.post(`/organizations/${orgId}/users/${userId}/active`, { isActive });
  },

  /* ── plans ────────────────────────────────────────────────────────────── */
  async listPlans(includeInactive = true) {
    const res = await adminHttp.get<Envelope<AdminPlan[]>>("/plans", {
      params: { includeInactive },
    });
    return res.data.data;
  },

  async createPlan(payload: Record<string, unknown>) {
    const res = await adminHttp.post<Envelope<AdminPlan>>("/plans", payload);
    return res.data.data;
  },

  async updatePlan(id: string, payload: Record<string, unknown>) {
    const res = await adminHttp.patch<Envelope<AdminPlan>>(`/plans/${id}`, payload);
    return res.data.data;
  },

  async deletePlan(id: string) {
    await adminHttp.delete(`/plans/${id}`);
  },

  /* ── platform admins ──────────────────────────────────────────────────── */
  async listAdmins() {
    const res = await adminHttp.get<Envelope<PlatformAdminRow[]>>("/admins");
    return res.data.data;
  },

  async createAdmin(payload: { name: string; email: string; password: string }) {
    const res = await adminHttp.post<Envelope<PlatformAdminRow>>("/admins", payload);
    return res.data.data;
  },

  async updateAdmin(id: string, payload: Record<string, unknown>) {
    const res = await adminHttp.patch<Envelope<PlatformAdminRow>>(`/admins/${id}`, payload);
    return res.data.data;
  },

  async deleteAdmin(id: string) {
    await adminHttp.delete(`/admins/${id}`);
  },

  /* ── audit ────────────────────────────────────────────────────────────── */
  async listAudit(query: { page?: number; limit?: number; action?: string; entityType?: string }) {
    const res = await adminHttp.get<ListEnvelope<AuditEntry>>("/audit", { params: query });
    return { items: res.data.data, meta: res.data.meta };
  },
};

/* ── website CMS ──────────────────────────────────────────────────────────
   Appended rather than merged into the object above so the console's existing
   surface is untouched. Sub-document ids arrive as `_id` (Mongoose subdocs);
   `withId` tolerates an API that has already renamed them to `id`. */
type MaybeId<T> = T & { id?: string; _id?: string };
function withId<T>(row: MaybeId<T>): T & { _id: string } {
  return { ...row, _id: String(row._id ?? row.id ?? "") };
}

export type InquiryQuery = { page?: number; limit?: number; status?: InquiryStatus | "" };

export const adminWebsiteApi = {
  async get() {
    const res = await adminHttp.get<Envelope<WebsiteDoc>>("/website");
    return res.data.data;
  },

  async update(patch: WebsitePatch) {
    const res = await adminHttp.put<Envelope<WebsiteDoc>>("/website", patch);
    return res.data.data;
  },

  async publish() {
    const res = await adminHttp.post<Envelope<WebsiteDoc>>("/website/publish");
    return res.data.data;
  },

  async saveSections(sections: SectionEntry[]) {
    const res = await adminHttp.put<Envelope<WebsiteDoc>>("/website/sections", sections);
    return res.data.data;
  },

  async listNavigation() {
    const res = await adminHttp.get<Envelope<NavItem[]>>("/website/navigation");
    return res.data.data.map(withId);
  },

  async saveNavigation(items: NavItem[]) {
    const res = await adminHttp.put<Envelope<NavItem[]>>("/website/navigation", items);
    return res.data.data;
  },

  async listFeatures() {
    const res = await adminHttp.get<Envelope<FeatureItem[]>>("/website/features");
    return res.data.data.map(withId);
  },

  async createFeature(payload: Omit<FeatureItem, "_id">) {
    const res = await adminHttp.post<Envelope<FeatureItem>>("/website/features", payload);
    return res.data.data;
  },

  async updateFeature(id: string, payload: Partial<Omit<FeatureItem, "_id">>) {
    const res = await adminHttp.put<Envelope<FeatureItem>>(`/website/features/${id}`, payload);
    return res.data.data;
  },

  async deleteFeature(id: string) {
    await adminHttp.delete(`/website/features/${id}`);
  },

  async listFaq() {
    const res = await adminHttp.get<Envelope<FaqItem[]>>("/website/faq");
    return res.data.data.map(withId);
  },

  async createFaq(payload: Omit<FaqItem, "_id">) {
    const res = await adminHttp.post<Envelope<FaqItem>>("/website/faq", payload);
    return res.data.data;
  },

  async updateFaq(id: string, payload: Partial<Omit<FaqItem, "_id">>) {
    const res = await adminHttp.put<Envelope<FaqItem>>(`/website/faq/${id}`, payload);
    return res.data.data;
  },

  async deleteFaq(id: string) {
    await adminHttp.delete(`/website/faq/${id}`);
  },

  async saveContact(contact: WebsiteContact) {
    const res = await adminHttp.put<Envelope<unknown>>("/website/contact", contact);
    return res.data.data;
  },

  async saveSeo(seo: WebsiteSeo) {
    const res = await adminHttp.put<Envelope<unknown>>("/website/seo", seo);
    return res.data.data;
  },

  async saveSettings(settings: WebsiteSettings) {
    const res = await adminHttp.put<Envelope<unknown>>("/website/settings", settings);
    return res.data.data;
  },

  async listInquiries(query: InquiryQuery) {
    const res = await adminHttp.get<Partial<ListEnvelope<MaybeId<WebsiteInquiry>>>>(
      "/website/inquiries",
      { params: query },
    );
    const items = (res.data.data ?? []).map((r) => ({ ...r, id: String(r.id ?? r._id ?? "") }));
    const meta = res.data.meta ?? {
      total: items.length,
      page: query.page ?? 1,
      limit: query.limit ?? items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
    return { items, meta };
  },

  async updateInquiry(id: string, status: InquiryStatus) {
    const res = await adminHttp.patch<Envelope<WebsiteInquiry>>(`/website/inquiries/${id}`, {
      status,
    });
    return res.data.data;
  },

  async uploadMedia(file: File) {
    const body = new FormData();
    body.append("file", file);
    const res = await adminHttp.post<Envelope<MediaUpload>>("/website/media", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },
};
