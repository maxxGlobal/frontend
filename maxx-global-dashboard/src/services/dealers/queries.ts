import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { listSimpleDealers } from "./simple";
import type { DealerSummary } from "../../types/dealer";

export function useSimpleDealers(
  options?: Omit<
    UseQueryOptions<DealerSummary[], unknown, DealerSummary[]>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<DealerSummary[]> {
  return useQuery<DealerSummary[]>({
    queryKey: ["simpleDealers"],
    queryFn: () => listSimpleDealers(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...options,
  });
}
