import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ProductCreateRequest, Product } from "../../types/product";
import { normalizeProductDetail } from "./_normalize";

export async function createProduct(
  body: ProductCreateRequest
): Promise<Product> {
  const res = await api.post<ApiEnvelope<any> | any>("/products", body);
  const payload = (res as any).data?.data ?? (res as any).data;
  return normalizeProductDetail(payload);
}
