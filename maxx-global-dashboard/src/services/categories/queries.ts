import { useTranslation } from "react-i18next";
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import { listAllCategories } from "./listAll";
import { buildCategoryTree, type CatNode } from "./buildTree";
import type { CategoryRow } from "../../types/category";

type CategoryList = (CategoryRow & { label: string })[];
const baseKey = ["allCategories"];

export function useAllCategories(
  options?: Omit<
    UseQueryOptions<CategoryList, Error, CategoryList>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<CategoryList, Error> {
  const { i18n } = useTranslation();

  return useQuery<CategoryList, Error>({
    queryKey: [...baseKey, i18n.language],
    queryFn: ({ signal }) => listAllCategories({ signal }),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...options,
  });
}

export function useAllCategoryTree(
  options?: Omit<
    UseQueryOptions<CategoryList, Error, CatNode[]>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<CatNode[], Error> {
  const { i18n } = useTranslation();

  return useQuery<CategoryList, Error, CatNode[]>({
    queryKey: [...baseKey, i18n.language],
    queryFn: ({ signal }) => listAllCategories({ signal }),
    select: (flat) => buildCategoryTree(flat),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...options,
  });
}

