import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { listSimpleDealers } from "./simple";
import type { DealerSummary } from "../../types/dealer";

export function useSimpleDealers(
  options?: Omit<
    UseQueryOptions<DealerSummary[], Error, DealerSummary[]>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<DealerSummary[], Error> {
  return useQuery<DealerSummary[], Error>({
    queryKey: ["simpleDealers"] as const,
    queryFn: () => listSimpleDealers(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...options,
  });
}
