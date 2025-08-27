// src/services/products/restore.ts
import api from "../../lib/api";
import type { Product } from "../../types/product";

type Raw = any;

const norm = (raw: Raw): Product => ({
  id: Number(raw?.id),
  name: String(raw?.name ?? ""),
  code: String(raw?.code ?? ""),
  description: raw?.description ?? "",
  categoryId: raw?.categoryId ?? undefined,
  categoryName: raw?.categoryName ?? undefined,
  material: raw?.material ?? "",
  size: raw?.size ?? "",
  diameter: raw?.diameter ?? "",
  angle: raw?.angle ?? "",
  sterile: !!raw?.sterile,
  singleUse: !!raw?.singleUse,
  implantable: !!raw?.implantable,
  ceMarking: !!raw?.ceMarking,
  fdaApproved: !!raw?.fdaApproved,
  medicalDeviceClass: raw?.medicalDeviceClass ?? "",
  regulatoryNumber: raw?.regulatoryNumber ?? "",
  weightGrams: raw?.weightGrams ?? undefined,
  dimensions: raw?.dimensions ?? "",
  color: raw?.color ?? "",
  surfaceTreatment: raw?.surfaceTreatment ?? "",
  serialNumber: raw?.serialNumber ?? "",
  manufacturerCode: raw?.manufacturerCode ?? "",
  manufacturingDate: raw?.manufacturingDate ?? null,
  expiryDate: raw?.expiryDate ?? null,
  shelfLifeMonths: raw?.shelfLifeMonths ?? undefined,
  unit: raw?.unit ?? "",
  barcode: raw?.barcode ?? "",
  lotNumber: raw?.lotNumber ?? "",
  stockQuantity: raw?.stockQuantity ?? undefined,
  minimumOrderQuantity: raw?.minimumOrderQuantity ?? undefined,
  maximumOrderQuantity: raw?.maximumOrderQuantity ?? undefined,
  primaryImageUrl: raw?.primaryImageUrl ?? null,
  isActive: !!raw?.isActive,
  isInStock: !!raw?.isInStock,
  // Backend bazen "ACTIVE" döndürüyor; UI'de "AKTİF" kullanıyoruz.
  status:
    raw?.status === "ACTIVE"
      ? "AKTİF"
      : raw?.status === "DELETED"
      ? "SİLİNDİ"
      : raw?.status,
});

export async function restoreProduct(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<Product> {
  const res = await api.post(`/products/${id}/restore`, undefined, {
    signal: opts?.signal,
  });

  const payload = (res as any).data?.data ?? (res as any).data;
  return norm(payload);
}
