import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ProductRow } from "../../types/product";
import { normalizeProductList } from "./_normalize";
import axios from "axios";

export async function searchProducts(params: any) {
  // boşları at
  const clean: Record<string, any> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") clean[k] = v;
  });

  return axios
    .get("/api/products/search", {
      params: clean,
      // array kullanmıyoruz; ama ileride gerekirse klasik query formatı:
      paramsSerializer: (p) => new URLSearchParams(p as any).toString(),
      withCredentials: true,
    })
    .then((r) => r.data);
}
