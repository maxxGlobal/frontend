import { getProductById } from "../getById";
import type { ProductImage } from "../../../types/product";

export async function listProductImages(
  productId: number,
  opts?: { signal?: AbortSignal }
): Promise<ProductImage[]> {
  const p = await getProductById(productId, opts);
  return (p.images ?? []).map((img) => ({
    ...img,
    isPrimary: img.isPrimary ?? false,
  }));
}
