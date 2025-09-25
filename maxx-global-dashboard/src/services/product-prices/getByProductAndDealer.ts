// src/services/products/prices/getByProductAndDealer.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export interface ProductDealerPriceResponse {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  dealerId: number;
  dealerName: string;
  prices: Array<{
    currency: string;
    amount: number;
  }>;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  isValidNow: boolean;
  createdDate: string;
  updatedDate: string;
  status: string;
}

export async function getProductDealerPrice(
  productId: number,
  dealerId: number
): Promise<ProductDealerPriceResponse> {
  const res = await api.get<ApiEnvelope<ProductDealerPriceResponse>>(
    `/product-prices/product/${productId}/dealer/${dealerId}`
  );
  return res.data.data;
}