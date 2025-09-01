import api from "../../lib/api";
import type {
  ProductPrice,
  CreateProductPriceRequest,
} from "../../types/product-prices";
import type { ApiEnvelope } from "../../services/common";

export async function createProductPrice(payload: CreateProductPriceRequest) {
  const res = await api.post<ApiEnvelope<ProductPrice>>(
    `/product-prices`,
    payload
  );
  return res.data.data;
}
