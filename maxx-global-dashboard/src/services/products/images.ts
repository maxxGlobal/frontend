import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export type ProductImage = {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
};

export async function listProductImages(
  productId: number,
  opts?: { signal?: AbortSignal }
): Promise<ProductImage[]> {
  const res = await api.get<ApiEnvelope<any> | any>(
    `/products/${productId}/images`,
    { signal: opts?.signal }
  );
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  return Array.isArray(payload) ? payload : [];
}

/** ÖNEMLİ: Backend 'images' adında part bekliyor */
export async function uploadProductImages(
  productId: number,
  files: File[],
  opts?: { signal?: AbortSignal }
): Promise<void> {
  const fd = new FormData();
  files.forEach((f) => fd.append("images", f, f.name)); // <-- 'images'!

  await api.post(`/products/${productId}/images`, fd, {
    signal: opts?.signal,
    // Eğer axios'unuz globalde JSON header basıyorsa bunu ezin:
    headers: { "Content-Type": "multipart/form-data" },
    // transformRequest'i olduğu gibi bırakın ki FormData stringify edilmesin
    transformRequest: (d) => d,
  });
}

export async function deleteProductImage(
  productId: number,
  imageId: number,
  opts?: { signal?: AbortSignal }
): Promise<void> {
  await api.delete(`/products/${productId}/images/${imageId}`, {
    signal: opts?.signal,
  });
}

export async function setPrimaryProductImage(
  productId: number,
  imageId: number,
  opts?: { signal?: AbortSignal }
): Promise<void> {
  await api.put(`/products/${productId}/images/${imageId}/primary`, null, {
    signal: opts?.signal,
  });
}
