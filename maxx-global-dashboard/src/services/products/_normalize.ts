import type {
  ProductRow,
  Product,
  ProductImage,
  ProductStatus,
  ProductPrice,
  ProductVariantSummary,
} from "../../types/product";

export type ApiProductListItem = {
  id: number;
  name: string;
  nameEn?: string | null;
  code: string;
  description?: string | null;
  descriptionEn?: string | null;
  categoryName?: string | null;
  primaryImageUrl?: string | null;
  stockQuantity?: number | null;
  unit?: string | null;
  isActive?: boolean | null;
  isInStock?: boolean | null;
  isFavorite?: boolean | null;
  prices?: ProductPrice[];
};
function normalizePrices(raw: any): ProductPrice[] {
  const arr = Array.isArray(raw?.prices)
    ? raw.prices
    : Array.isArray(raw?.productPrices)
    ? raw.productPrices
    : [];

  return arr
    .map((p: any) => {
      const productPriceId = parseNullableNumber(
        p?.productPriceId ?? p?.id ?? p?.priceId
      );
      const amount = parseNullableNumber(p?.amount ?? p?.price ?? p?.value);
      const currencyValue =
        p?.currency ?? p?.currencyCode ?? p?.currency_type ?? p?.currencyType;

      if (productPriceId === null && amount === null && !currencyValue) {
        return null;
      }

      return {
        productPriceId,
        currency: currencyValue != null ? String(currencyValue) : null,
        amount,
      } as ProductPrice;
    })
    .filter(
      (price: ProductPrice | null): price is ProductPrice => price !== null
    );
}

function parseNullableNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeVariants(
  variants: any[] | null | undefined
): ProductVariantSummary[] {
  if (!Array.isArray(variants)) {
    return [];
  }

  return variants.map((variant: any, index: number) => {
    const id =
      parseNullableNumber(
        variant?.id ?? variant?.variantId ?? variant?.variantID
      ) ?? index;
    const stockQuantity = parseNullableNumber(
      variant?.stockQuantity ?? variant?.stock ?? variant?.quantity
    );

    const sizeValue =
      variant?.size ??
      variant?.name ??
      variant?.label ??
      variant?.dimension ??
      null;

    const skuValue = variant?.sku ?? variant?.code ?? null;

    return {
      id: Number(id),
      size: sizeValue != null ? String(sizeValue) : null,
      sku: skuValue != null ? String(skuValue) : null,
      stockQuantity:
        stockQuantity != null ? Number(stockQuantity) : stockQuantity,
      isDefault: Boolean(variant?.isDefault ?? variant?.default),
    } as ProductVariantSummary;
  });
}
export function normalizeProductList(rows: any[]): ProductRow[] {
  return (rows ?? []).map((r) => {
    const status: ProductStatus = r?.status === "SİLİNDİ" ? "SİLİNDİ" : "AKTİF";

    return {
      id: Number(r?.id),
      name: String(r?.name ?? ""),
      nameEn: r?.nameEn ?? null,
      code: String(r?.code ?? ""),
      description: r?.description ?? null,
      descriptionEn: r?.descriptionEn ?? null,
      categoryId: r?.categoryId != null ? Number(r.categoryId) : undefined,
      categoryName: r?.categoryName ?? null,
      primaryImageUrl: r?.primaryImageUrl ?? null,
      stockQuantity: r?.stockQuantity ?? null,
      unit: r?.unit ?? null,
      status,
      isActive: status === "AKTİF",
      isInStock: !!r?.isInStock,
      isFavorite: !!r?.isFavorite,
      prices: normalizePrices(r),
    } as ProductRow;
  });
}

export function normalizeImages(arr: any[] | null | undefined): ProductImage[] {
  return (arr ?? []).map((i) => ({
    id: Number(i?.id),
    imageUrl: String(i?.imageUrl ?? ""),
    isPrimary: Boolean(i?.isPrimary),
  }));
}

export function normalizeProductDetail(raw: any): Product {
  const normalizedVariants = normalizeVariants(raw?.variants);
  const defaultVariantId =
    parseNullableNumber(raw?.defaultVariantId ?? raw?.defaultVariant?.id) ??
    null;

  const defaultVariant = normalizedVariants.find((variant) => variant.isDefault);
  const fallbackVariant =
    defaultVariant ??
    (normalizedVariants.length > 0 ? normalizedVariants[0] : null);
  const derivedSize = raw?.size ?? fallbackVariant?.size ?? null;

  return {
    id: Number(raw?.id),
    name: String(raw?.name ?? ""),
    nameEn: raw?.nameEn ?? null,
    code: String(raw?.code ?? ""),
    description: raw?.description ?? null,
    descriptionEn: raw?.descriptionEn ?? null,
    categoryId: raw?.categoryId ?? null,
    categoryName: raw?.categoryName ?? null,
    material: raw?.material ?? null,
    size: derivedSize != null ? String(derivedSize) : null,
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

    prices: normalizePrices(raw),
    variants: normalizedVariants.length > 0 ? normalizedVariants : null,
    defaultVariantId,
  };
}
