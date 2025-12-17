// src/types/category.ts
export type CategoryStatus = "AKTİF" | "SİLİNDİ" | "DELETED" | string;

export interface CategorySummary {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  nameEn?: string;
  description?: string | null;
  descriptionEn?: string | null;
  parentCategoryName?: string | null;
  parentId?: number | null;
  status?: CategoryStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  depth?: number;
}

export interface CategoryRow {
  id: number;
  name: string;
  nameEn?: string;
  description?: string | null;
  descriptionEn?: string | null;
  parentName?: string | null;
  status?: CategoryStatus | null;
  createdAt?: string | null;
  depth?: number;
}

export interface CategoryCreateRequest {
  name: string;
  nameEn: string;
  description?: string | null;
  descriptionEn?: string | null;
  parentId?: number | null;
}

export interface CategoryUpdateRequest {
  name?: string;
  nameEn?: string;
  description?: string | null;
  descriptionEn?: string | null;
  parentId?: number | null;
  status?: CategoryStatus;
}

// Endpoint-özel tipler

// Backend "data" alanı (curl çıktısına birebir uyumlu)
export interface CategoryDTO {
  id: number;
  name: string;
  nameEn?: string;
  description?: string | null;
  descriptionEn?: string | null;
  parentCategoryName?: string | null;
  createdAt?: string | null;
  status?: string | null;
}

// Tam HTTP cevabı (success/message/code/timestamp + data: CategoryDTO)
export interface CategoryByIdResponse {
  success?: boolean;
  message?: string | null;
  data: CategoryDTO;
  code?: number;
  timestamp?: string;
}

// (İstersen) istek param tipin
export interface GetCategoryByIdParams {
  id: number;
}
