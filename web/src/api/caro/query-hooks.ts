import { useQuery } from "@tanstack/react-query";
import { findCaroMatches, type FindCaroMatchesParams } from "@/api/caro/api.ts";

export const caroMatchKeys = {
  all: ["caro-matches"] as const,
  list: (params: FindCaroMatchesParams) => [...caroMatchKeys.all, "list", params] as const,
};

export function useCaroMatches(params: FindCaroMatchesParams) {
  return useQuery({
    queryKey: caroMatchKeys.list(params),
    queryFn: () => findCaroMatches(params),
    enabled: !!params.userId,
  });
}
