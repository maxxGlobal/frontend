// src/services/products/getById.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary?: boolean;
}

export interface ProductPriceInfo {
  productPriceId: number | null;
  currency: string | null;
  amount: number | null;
}

export interface ProductVariant {
  id: number;
  size: string | null;
  sku?: string | null;
  stockQuantity?: number | null;
  isDefault?: boolean;
  prices?: ProductPriceInfo[];
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
  variants?: ProductVariant[] | null;
  defaultVariantId?: number | null;

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
    if (up === "DELETED" || up === "SİLİNDİ") return "SİLİNDİ";
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

function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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

  const variants: ProductVariant[] = Array.isArray(raw?.variants)
    ? raw.variants
        .map((variant: any, idx: number) => {
          const id =
            parseNumber(variant?.id ?? variant?.variantId ?? variant?.variantID) ??
            idx;
          const stockQuantity = parseNumber(
            variant?.stockQuantity ?? variant?.stock ?? variant?.quantity
          );
          const prices: ProductPriceInfo[] = Array.isArray(variant?.prices)
            ? variant.prices
                .map((price: any) => {
                  const amount = parseNumber(price?.amount ?? price?.price);
                  const productPriceId = parseNumber(
                    price?.productPriceId ?? price?.id ?? price?.priceId
                  );
                  const currency =
                    price?.currency ??
                    price?.currencyType ??
                    price?.currencyCode ??
                    price?.currency_code ??
                    null;

                  if (
                    amount === null &&
                    productPriceId === null &&
                    currency === null
                  ) {
                    return null;
                  }

                  return {
                    productPriceId,
                    currency: currency ? String(currency) : null,
                    amount,
                  } as ProductPriceInfo;
                })
                .filter((p: ProductPriceInfo | null): p is ProductPriceInfo => !!p)
            : [];

          return {
            id,
            size:
              variant?.size ??
              variant?.name ??
              variant?.label ??
              variant?.dimension ??
              null,
            sku: variant?.sku ?? variant?.code ?? null,
            stockQuantity,
            isDefault: Boolean(variant?.isDefault ?? variant?.default),
            prices,
          } as ProductVariant;
        })
        .map((variant) => ({
          ...variant,
          size: variant.size != null ? String(variant.size) : null,
        }))
    : [];

  const variantStockValues = variants
    .map((variant) => variant.stockQuantity)
    .filter((qty): qty is number => qty !== null && qty !== undefined);

  const variantStockTotal =
    variantStockValues.length > 0
      ? variantStockValues.reduce((acc, qty) => acc + qty, 0)
      : null;

  const defaultVariantId = parseNumber(
    raw?.defaultVariantId ?? raw?.defaultVariant?.id
  );

  const derivedStockQuantity =
    raw?.stockQuantity ?? raw?.totalStockQuantity ?? variantStockTotal;

  const derivedIsInStock =
    typeof raw?.isInStock === "boolean"
      ? Boolean(raw?.isInStock)
      : derivedStockQuantity != null
      ? derivedStockQuantity > 0
      : undefined;

  const defaultVariant =
    (defaultVariantId != null
      ? variants.find((variant) => variant.id === defaultVariantId)
      : variants.find((variant) => variant.isDefault)) ?? variants[0];

  return {
    id: Number(raw?.id),
    name: String(raw?.name ?? raw?.productName ?? ""),
    code: String(raw?.code ?? raw?.productCode ?? ""),
    description: raw?.description ?? null,
    categoryId: raw?.categoryId ?? null,
    categoryName: raw?.categoryName ?? null,
    unit: raw?.unit ?? null,
    stockQuantity:
      derivedStockQuantity != null
        ? Number(derivedStockQuantity)
        : null,
    material: raw?.material ?? null,
    size: raw?.size ?? defaultVariant?.size ?? null,
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
    isInStock: derivedIsInStock,
    images,
    variants: variants.length > 0 ? variants : null,
    defaultVariantId: defaultVariantId ?? null,

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
