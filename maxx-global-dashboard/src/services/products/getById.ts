import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary?: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  unit?: string | null;
  stockQuantity?: number | null;
  material?: string | null;
  size?: string | null;
  diameter?: string | null;
  angle?: string | null;
  weightGrams?: number | null;
  dimensions?: string | null;
  surfaceTreatment?: string | null;
  serialNumber?: string | null;
  manufacturerCode?: string | null;
  manufacturingDate?: string | null;
  expiryDate?: string | null;
  shelfLifeMonths?: number | null;
  barcode?: string | null;
  lotNumber?: string | null;
  medicalDeviceClass?: string | null;
  regulatoryNumber?: string | null;
  primaryImageUrl?: string | null;
  isActive?: boolean;
  isInStock?: boolean;
  images?: ProductImage[];
}

const norm = (raw: any): ProductDetail => ({
  id: Number(raw?.id),
  name: String(raw?.name ?? raw?.productName ?? ""),
  code: String(raw?.code ?? raw?.productCode ?? ""),
  description: raw?.description ?? null,
  categoryId: raw?.categoryId ?? null,
  categoryName: raw?.categoryName ?? null,
  unit: raw?.unit ?? null,
  stockQuantity: raw?.stockQuantity ?? null,
  material: raw?.material ?? null,
  size: raw?.size ?? null,
  diameter: raw?.diameter ?? null,
  angle: raw?.angle ?? null,
  weightGrams: raw?.weightGrams ?? null,
  dimensions: raw?.dimensions ?? null,
  surfaceTreatment: raw?.surfaceTreatment ?? null,
  serialNumber: raw?.serialNumber ?? null,
  manufacturerCode: raw?.manufacturerCode ?? null,
  manufacturingDate: raw?.manufacturingDate ?? null,
  expiryDate: raw?.expiryDate ?? null,
  shelfLifeMonths: raw?.shelfLifeMonths ?? null,
  barcode: raw?.barcode ?? null,
  lotNumber: raw?.lotNumber ?? null,
  medicalDeviceClass: raw?.medicalDeviceClass ?? null,
  regulatoryNumber: raw?.regulatoryNumber ?? null,
  primaryImageUrl: raw?.primaryImageUrl ?? null,
  isActive: !!raw?.isActive,
  isInStock: !!raw?.isInStock,
  images: Array.isArray(raw?.images)
    ? raw.images.map((x: any) => ({
        id: Number(x?.id),
        imageUrl: String(x?.imageUrl ?? ""),
        isPrimary: !!x?.isPrimary,
      }))
    : [],
});

export async function getProductById(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<ProductDetail> {
  const res = await api.get<ApiEnvelope<any> | any>(`/products/${id}`, {
    signal: opts?.signal,
  });
  const payload = (res as any).data?.data ?? (res as any).data;
  return norm(payload);
}
