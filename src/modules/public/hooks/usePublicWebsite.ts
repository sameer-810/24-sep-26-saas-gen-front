import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api/publicApi";

export function usePublicWebsite() {
  return useQuery({
    queryKey: ["public", "website"],
    queryFn: () => publicApi.website(),
    staleTime: 5 * 60_000,
  });
}
