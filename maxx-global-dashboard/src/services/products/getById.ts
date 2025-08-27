// src/services/products/getById.ts
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

  // Ek alanlar (opsiyonel – geriye dönük uyumlu)
  sterile?: boolean | null;
  singleUse?: boolean | null;
  implantable?: boolean | null;
  ceMarking?: boolean | null;
  fdaApproved?: boolean | null;
  color?: string | null;
  minimumOrderQuantity?: number | null;
  maximumOrderQuantity?: number | null;

  // Durum (TR normalize)
  status?: "AKTİF" | "SİLİNDİ";
}

const normalizeStatus = (raw: any): "AKTİF" | "SİLİNDİ" => {
  const s: string | undefined = raw?.status;
  if (s) {
    const up = s.toUpperCase();
    if (up === "ACTIVE" || up === "AKTIF" || up === "AKTİF") return "AKTİF";
    if (up === "SİLİNDİ" || up === "DELETED") return "SİLİNDİ";
  }
  // status yoksa isActive'ten türet
  return raw?.isActive ? "AKTİF" : "SİLİNDİ";
};
function pickRawImages(raw: any): any[] {
  if (Array.isArray(raw?.images)) return raw.images;
  if (Array.isArray(raw?.productImages)) return raw.productImages;
  if (Array.isArray(raw?.Images)) return raw.Images;
  if (Array.isArray(raw?.imageList)) return raw.imageList;
  if (Array.isArray(raw?.pictures)) return raw.pictures;
  if (Array.isArray(raw?.files)) return raw.files;
  if (Array.isArray(raw?.data?.images)) return raw.data.images;
  if (Array.isArray(raw?.data?.productImages)) return raw.data.productImages;
  // sayfalı gelebilir
  if (Array.isArray(raw?.images?.content)) return raw.images.content;
  if (Array.isArray(raw?.productImages?.content))
    return raw.productImages.content;
  return [];
}

function getImageUrl(x: any): string {
  return (
    x?.imageUrl ??
    x?.url ??
    x?.image ??
    x?.path ??
    x?.src ??
    x?.link ??
    x?.downloadUrl ??
    x?.fullUrl ??
    ""
  );
}
function getIsPrimary(x: any): boolean {
  const v = x?.isPrimary ?? x?.primary ?? x?.is_primary ?? x?.main;
  return !!v;
}
const norm = (raw: any): ProductDetail => {
  const rawImages = pickRawImages(raw);

  const images: ProductImage[] = rawImages
    .map((x: any, idx: number) => ({
      id: Number(x?.id ?? x?.imageId ?? x?.fileId ?? idx),
      imageUrl: String(getImageUrl(x)),
      isPrimary: getIsPrimary(x),
    }))
    .filter((im) => im.imageUrl); // url'i boş olanları ayıkla

  // primaryImageUrl boşsa primary görselden doldur
  const primaryFromObject =
    raw?.primaryImage?.imageUrl ??
    raw?.primaryImage?.url ??
    raw?.primaryImage?.path ??
    raw?.primaryImage?.src ??
    null;

  const primaryFromList =
    images.find((im) => im.isPrimary)?.imageUrl || images[0]?.imageUrl || null;

  const status = normalizeStatus(raw);

  return {
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
    primaryImageUrl:
      raw?.primaryImageUrl ?? primaryFromObject ?? primaryFromList,
    isActive: !!raw?.isActive,
    isInStock: !!raw?.isInStock,
    images,

    sterile: raw?.sterile ?? null,
    singleUse: raw?.singleUse ?? null,
    implantable: raw?.implantable ?? null,
    ceMarking: raw?.ceMarking ?? null,
    fdaApproved: raw?.fdaApproved ?? null,
    color: raw?.color ?? null,
    minimumOrderQuantity: raw?.minimumOrderQuantity ?? null,
    maximumOrderQuantity: raw?.maximumOrderQuantity ?? null,
    status,
  };
};

export async function getProductById(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<ProductDetail> {
  const res = await api.get<ApiEnvelope<any> | any>(`/products/${id}`, {
    signal: opts?.signal,
  });

  // Envelope’lu / envelopesuz destek
  const root = (res as any)?.data ?? res;
  const payload = root?.data ?? root;

  if (!payload) {
    throw new Error("Boş ürün cevabı");
  }
  return norm(payload);
}
