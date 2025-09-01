import api from "../../lib/api";
import type { ApiEnvelope } from "../../services/common";

export interface SimpleProduct {
  id: number;
  name: string;
  code: string;
}

export async function listSimpleProducts() {
  const res = await api.get<ApiEnvelope<SimpleProduct[]>>("/products/simple");
  return res.data.data;
}
