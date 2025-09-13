import api from "../../lib/api";
import type { ProductSimple } from "../../types/stock";
import type { ApiEnvelope } from "../common";

export async function listSimpleProducts(): Promise<ProductSimple[]> {
  const res = await api.get<ApiEnvelope<ProductSimple[]>>("/products/simple");
  return res.data.data;
}