import api from "../../lib/api";
import type {
  ProductPrice,
  UpdateProductPriceRequest,
} from "../../types/product-prices";
import type { ApiEnvelope } from "../../services/common";

export async function updateProductPrice(
  id: number,
  payload: UpdateProductPriceRequest
) {
  const res = await api.put<ApiEnvelope<ProductPrice>>(
    `/product-prices/${id}`,
    payload
  );
  return res.data.data;
}
