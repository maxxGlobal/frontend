import type { ProductRow, Product, ProductImage } from "../../types/product";

export type ApiProductListItem = {
  id: number;
  name: string;
  code: string;
  categoryName?: string | null;
  primaryImageUrl?: string | null;
  stockQuantity?: number | null;
  unit?: string | null;
  isActive?: boolean | null;
  isInStock?: boolean | null;
};

export function normalizeProductList(
  items: ApiProductListItem[]
): ProductRow[] {
  return (items ?? []).map((x) => ({
    id: x.id,
    name: String(x?.name ?? ""),
    code: String(x?.code ?? ""),
    categoryName: x?.categoryName ?? null,
    primaryImageUrl: x?.primaryImageUrl ?? null,
    stockQuantity: x?.stockQuantity ?? null,
    unit: x?.unit ?? null,
    isActive: x?.isActive ?? null,
    isInStock: x?.isInStock ?? null,
  }));
}

export function normalizeImages(arr: any[] | null | undefined): ProductImage[] {
  return (arr ?? []).map((i) => ({
    id: Number(i?.id),
    imageUrl: String(i?.imageUrl ?? ""),
    isPrimary: Boolean(i?.isPrimary),
  }));
}

export function normalizeProductDetail(raw: any): Product {
  return {
    id: Number(raw?.id),
    name: String(raw?.name ?? ""),
    code: String(raw?.code ?? ""),
    description: raw?.description ?? null,
    categoryId: raw?.categoryId ?? null,
    categoryName: raw?.categoryName ?? null,
    material: raw?.material ?? null,
    size: raw?.size ?? null,
    diameter: raw?.diameter ?? null,
    angle: raw?.angle ?? null,
    sterile: raw?.sterile ?? null,
    singleUse: raw?.singleUse ?? null,
    implantable: raw?.implantable ?? null,
    ceMarking: raw?.ceMarking ?? null,
    fdaApproved: raw?.fdaApproved ?? null,
    medicalDeviceClass: raw?.medicalDeviceClass ?? null,
    regulatoryNumber: raw?.regulatoryNumber ?? null,
    weightGrams: raw?.weightGrams ?? null,
    dimensions: raw?.dimensions ?? null,
    color: raw?.color ?? null,
    surfaceTreatment: raw?.surfaceTreatment ?? null,
    serialNumber: raw?.serialNumber ?? null,
    manufacturerCode: raw?.manufacturerCode ?? null,
    manufacturingDate: raw?.manufacturingDate ?? null,
    expiryDate: raw?.expiryDate ?? null,
    shelfLifeMonths: raw?.shelfLifeMonths ?? null,
    unit: raw?.unit ?? null,
    barcode: raw?.barcode ?? null,
    lotNumber: raw?.lotNumber ?? null,
    stockQuantity: raw?.stockQuantity ?? null,
    minimumOrderQuantity: raw?.minimumOrderQuantity ?? null,
    maximumOrderQuantity: raw?.maximumOrderQuantity ?? null,
    images: normalizeImages(raw?.images),
    primaryImageUrl: raw?.primaryImageUrl ?? null,
    isActive: raw?.isActive ?? null,
    isInStock: raw?.isInStock ?? null,
    isExpired: raw?.isExpired ?? null,
    createdDate: raw?.createdDate ?? null,
    updatedDate: raw?.updatedDate ?? null,
    status: raw?.status ?? null,
  };
}
