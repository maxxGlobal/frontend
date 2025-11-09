// types/product.ts

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary?: boolean;
}
export type ProductStatus = "AKTİF" | "SİLİNDİ";
export interface ProductPrice {
  productPriceId: number | null;
  currency: string | null;
  amount: number | null;
}

export interface ProductVariantSummary {
  id: number;
  size?: string | null;
  sku?: string | null;
  stockQuantity?: number | null;
  isDefault?: boolean | null;
}

export interface ProductVariantInput {
  id?: number;
  size: string;
  sku?: string;
  stockQuantity?: number;
  isDefault?: boolean | null;
}

export interface ProductRow {
  id: number;
  name: string;
  code: string;
  description?: string;
  categoryId?: number;
  categoryName?: string | null;
  primaryImageUrl?: string | null;
  stockQuantity?: number | null;
  unit?: string | null;
  isActive?: boolean | null;
  isInStock?: boolean | null;
  stock?: number;
  status?: ProductStatus;
  isFavorite?: boolean;
  prices?: ProductPrice[];
}

export interface Product extends ProductRow {
  material?: string | null;
  size?: string | null;
  diameter?: string | null;
  angle?: string | null;
  sterile?: boolean | null;
  singleUse?: boolean | null;
  implantable?: boolean | null;
  ceMarking?: boolean | null;
  fdaApproved?: boolean | null;
  medicalDeviceClass?: string | null;
  regulatoryNumber?: string | null;
  weightGrams?: number | null;
  dimensions?: string | null;
  color?: string | null;
  surfaceTreatment?: string | null;
  serialNumber?: string | null;
  manufacturerCode?: string | null;
  manufacturingDate?: string | null; // "YYYY-MM-DD"
  expiryDate?: string | null; // "YYYY-MM-DD"
  shelfLifeMonths?: number | null;
  unit?: string | null;
  barcode?: string | null;
  lotNumber?: string | null;
  minimumOrderQuantity?: number | null;
  maximumOrderQuantity?: number | null;
  images?: ProductImage[];
  isExpired?: boolean | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  variants?: ProductVariantSummary[] | null;
  defaultVariantId?: number | null;
}

export interface ProductCreateRequest {
  name: string;
  code: string;
  description?: string;
  categoryId: number;
  material?: string;
  size?: string;
  diameter?: string;
  angle?: string;
  sterile?: boolean;
  singleUse?: boolean;
  implantable?: boolean;
  ceMarking?: boolean;
  fdaApproved?: boolean;
  medicalDeviceClass?: string;
  regulatoryNumber?: string;
  weightGrams?: number;
  dimensions?: string;
  color?: string;
  surfaceTreatment?: string;
  serialNumber?: string;
  manufacturerCode?: string;
  manufacturingDate?: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  shelfLifeMonths?: number;
  unit?: string;
  barcode?: string;
  lotNumber?: string;
  stockQuantity?: number;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  variants?: ProductVariantInput[];
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  name: string;
  code: string;
  description: string;
  categoryId: number;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

export interface ProductSimple {
  id: number;
  name: string;
  code?: string | null;
}

export type LowStockProduct = {
  id: number;
  name: string;
  code: string;
  categoryName: string;
  primaryImageUrl: string | null;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
  isInStock: boolean;
  status: string;
  isFavorite: boolean | null;
  prices?: ProductPrice[];
};
export interface RandomProduct {
  id: number;
  name: string;
  code: string;
  categoryName: string;
  primaryImageUrl: string | null;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
  isInStock: boolean;
  status: string;
  isFavorite: boolean;
  prices?: ProductPrice[];
}
