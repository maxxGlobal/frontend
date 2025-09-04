// src/types/discount.ts

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface DiscountProduct {
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
  isFavorite?: boolean;
}

export interface DiscountDealer {
  id: number;
  name: string;
  status: string;
  preferredCurrency: string;
}

export interface Discount {
  id: number;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  applicableProducts: DiscountProduct[];
  applicableDealers: DiscountDealer[];
  isActive: boolean;
  isValidNow: boolean;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  createdDate: string;
  updatedDate: string;
  status: string;
}

export interface DiscountCreateRequest {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  productIds: number[];
  dealerIds: number[];
  isActive: boolean;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
}

export interface DiscountUpdateRequest extends DiscountCreateRequest {}

export interface DiscountCalculationRequest {
  productId: number;
  dealerId: number;
  quantity: number;
  unitPrice: number;
  includeDiscountIds?: number[];
  excludeDiscountIds?: number[];
}

export interface DiscountCalculationRequest {
  productId: number;
  dealerId: number;
  quantity: number;
  unitPrice: number;
  totalOrderAmount: number;
  includeDiscountIds?: number[];
  excludeDiscountIds?: number[];
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
