import api from "../../../lib/api";
import type { ApiEnvelope } from "../../common";
import { normalizeProductDetail } from "../_normalize";
import type { Product } from "../../../types/product";

/** Tek veya çoklu dosya yükleyebilirsin; backend çoklu kabul ediyorsa append çoklu yap */
export async function uploadProductImage(
  productId: number,
  file: File,
  opts?: { signal?: AbortSignal }
): Promise<Product> {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post<ApiEnvelope<any> | any>(
    `/products/${productId}/images`,
    form,
    {
      signal: opts?.signal,
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  const payload = (res as any).data?.data ?? (res as any).data;
  return normalizeProductDetail(payload);
}
