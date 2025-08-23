// src/types/category.ts
export type CategoryStatus = "ACTIVE" | "PASSIVE" | "DELETED" | string;

export interface CategorySummary {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  parentCategoryName?: string | null;
  parentId?: number | null;
  status?: CategoryStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CategoryRow {
  id: number;
  name: string;
  parentName?: string | null;
  status?: CategoryStatus | null;
  createdAt?: string | null;
}

export interface CategoryCreateRequest {
  name: string;
  parentId?: number | null;
}

export interface CategoryUpdateRequest {
  name?: string;
  parentId?: number | null;
  status?: CategoryStatus;
}
