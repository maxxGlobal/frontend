import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { listSimpleProducts } from "./simple";
import type { ProductSimple } from "../../types/product";

export function useSimpleProducts(
  options?: Omit<
    UseQueryOptions<ProductSimple[], unknown, ProductSimple[]>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<ProductSimple[]> {
  return useQuery<ProductSimple[]>({
    queryKey: ["simpleProducts"],
    queryFn: () => listSimpleProducts(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...options,
  });
}
