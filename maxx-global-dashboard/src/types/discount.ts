// src/types/discount.ts

export type DiscountType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "Yüzdesel"
  | "Sabit Tutar";

// ✅ YENİ - Variant özet bilgisi
export interface ProductVariantSummary {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  size?: string | null;
  sku?: string | null;
  stockQuantity?: number | null;
  isDefault?: boolean;
}

export interface DiscountDealer {
  id: number;
  name: string;
  status: string;
  preferredCurrency: string;
}

// ✅ Kategori özet bilgisi
export interface DiscountCategory {
  id: number;
  name: string;
}

export interface Discount {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  
  // ✅ YENİ - Variant bazlı
  applicableVariants?: ProductVariantSummary[];
  applicableDealers?: DiscountDealer[];
  applicableCategories?: DiscountCategory[];
  
  isActive: boolean;
  isValidNow: boolean;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  
  usageLimit?: number;
  usageCount?: number;
  usageLimitPerCustomer?: number;
  discountCode?: string;
  autoApply?: boolean;
  priority?: number;
  stackable?: boolean;
  configurationSummary?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Computed fields
  discountScope?: string;
  discountTypeDisplay?: string;
  isExpired: boolean;
  isNotYetStarted: boolean;
  hasUsageLeft?: boolean;
  remainingUsage?: number;
  validityStatus?: string;

  isCategoryBased?: boolean;
  isVariantBased?: boolean;
  isDealerBased?: boolean;
  isGeneralDiscount?: boolean;
  dealerBasedDiscount?: boolean;
  categoryBasedDiscount?: boolean;
  variantBasedDiscount?: boolean;
  generalDiscount?: boolean;

  // Geriye dönük uyumluluk için (eski API'lerle çalışabilmek için)
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface DiscountCreateRequest {
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  
  // ✅ YENİ - Variant bazlı
  variantIds?: number[];
  dealerIds?: number[];
  categoryIds?: number[];
  
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  discountCode?: string;
  autoApply?: boolean;
  priority?: number;
  stackable?: boolean;
  isActive: boolean;
  dealerBasedDiscount?: boolean;
  categoryBasedDiscount?: boolean;
  variantBasedDiscount?: boolean;
  generalDiscount?: boolean;
  discountScope?: string;
  configurationSummary?: string;
}

export interface DiscountUpdateRequest extends DiscountCreateRequest {}

export interface DiscountCalculationRequest {
  productId: number;
  dealerId: number;
  quantity: number;
  unitPrice: number;
  totalOrderAmount: number;
  includeDiscountIds?: number[];
  excludeDiscountIds?: number[];
  variantId?: number; // ✅ YENİ - Variant desteği
}

export interface PageResponse<T> {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  content: T[];
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface DiscountAppliedDetail {
  discountId: number;
  discountName: string;
  discountType: DiscountType;
  discountValue: number;
  calculatedDiscountAmount: number;
  discountedUnitPrice: number;
  minimumOrderMet: boolean;
  maximumDiscountApplied: boolean;
  isApplicable: boolean;
}

export interface DiscountCalculationSuccess {
  productId: number;
  productName?: string;
  variantId?: number; // ✅ YENİ
  variantSize?: string; // ✅ YENİ
  dealerId: number;
  dealerName?: string;
  originalUnitPrice: number;
  quantity: number;
  originalTotalAmount: number;
  applicableDiscounts: DiscountAppliedDetail[];
  bestDiscount?: DiscountAppliedDetail | null;
  totalDiscountAmount: number;
  finalTotalAmount: number;
  discountPercentage?: number;
  savingsAmount: number;
}