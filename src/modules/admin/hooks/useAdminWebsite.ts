import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminWebsiteApi, type InquiryQuery } from "../api/adminApi";
import type {
  FaqItem,
  FeatureItem,
  InquiryStatus,
  NavItem,
  SectionEntry,
  WebsiteContact,
  WebsitePatch,
  WebsiteSeo,
  WebsiteSettings,
} from "../types";

const KEY = ["admin", "website"] as const;

export function useAdminWebsite() {
  return useQuery({ queryKey: KEY, queryFn: () => adminWebsiteApi.get(), staleTime: 15_000 });
}

/**
 * Every write invalidates the whole website tree: the document's `updatedAt`
 * moves on any edit, and the overview's "unpublished changes" chip reads it.
 */
function useWebsiteMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export const useUpdateWebsite = () =>
  useWebsiteMutation((patch: WebsitePatch) => adminWebsiteApi.update(patch));
export const usePublishWebsite = () => useWebsiteMutation(() => adminWebsiteApi.publish());
export const useSaveSections = () =>
  useWebsiteMutation((sections: SectionEntry[]) => adminWebsiteApi.saveSections(sections));

export function useWebsiteNavigation() {
  return useQuery({
    queryKey: [...KEY, "navigation"],
    queryFn: () => adminWebsiteApi.listNavigation(),
  });
}
export const useSaveNavigation = () =>
  useWebsiteMutation((items: NavItem[]) => adminWebsiteApi.saveNavigation(items));

export function useWebsiteFeatures() {
  return useQuery({
    queryKey: [...KEY, "features"],
    queryFn: () => adminWebsiteApi.listFeatures(),
  });
}
export const useCreateFeature = () =>
  useWebsiteMutation((p: Omit<FeatureItem, "_id">) => adminWebsiteApi.createFeature(p));
export const useUpdateFeature = () =>
  useWebsiteMutation(
    ({ id, payload }: { id: string; payload: Partial<Omit<FeatureItem, "_id">> }) =>
      adminWebsiteApi.updateFeature(id, payload),
  );
export const useDeleteFeature = () =>
  useWebsiteMutation((id: string) => adminWebsiteApi.deleteFeature(id));

export function useWebsiteFaq() {
  return useQuery({ queryKey: [...KEY, "faq"], queryFn: () => adminWebsiteApi.listFaq() });
}
export const useCreateFaq = () =>
  useWebsiteMutation((p: Omit<FaqItem, "_id">) => adminWebsiteApi.createFaq(p));
export const useUpdateFaq = () =>
  useWebsiteMutation(({ id, payload }: { id: string; payload: Partial<Omit<FaqItem, "_id">> }) =>
    adminWebsiteApi.updateFaq(id, payload),
  );
export const useDeleteFaq = () => useWebsiteMutation((id: string) => adminWebsiteApi.deleteFaq(id));

export const useSaveContact = () =>
  useWebsiteMutation((c: WebsiteContact) => adminWebsiteApi.saveContact(c));
export const useSaveSeo = () => useWebsiteMutation((s: WebsiteSeo) => adminWebsiteApi.saveSeo(s));
export const useSaveSettings = () =>
  useWebsiteMutation((s: WebsiteSettings) => adminWebsiteApi.saveSettings(s));

export function useWebsiteInquiries(query: InquiryQuery) {
  return useQuery({
    queryKey: [...KEY, "inquiries", query],
    queryFn: () => adminWebsiteApi.listInquiries(query),
    placeholderData: (prev) => prev,
  });
}
export const useUpdateInquiry = () =>
  useWebsiteMutation(({ id, status }: { id: string; status: InquiryStatus }) =>
    adminWebsiteApi.updateInquiry(id, status),
  );

export const useUploadMedia = () =>
  useMutation({ mutationFn: (file: File) => adminWebsiteApi.uploadMedia(file) });
