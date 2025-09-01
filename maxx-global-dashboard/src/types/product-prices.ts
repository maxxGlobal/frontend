// src/types/product-prices.ts

export interface ProductPrice {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  dealerId: number;
  dealerName: string;
  currency: string;
  amount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  isValidNow: boolean;
  createdDate: string;
  updatedDate: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  code: number;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export type BulkUpdateRequest = {
  priceIds: number[];
  newAmount?: number;
  percentageChange?: number;
  isActive?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
};

export type CreateProductPriceRequest = {
  productId: number;
  dealerId: number;
  currency: string;
  amount: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
};

export type UpdateProductPriceRequest = {
  productId: number;
  dealerId: number;
  currency: string;
  amount: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
};
