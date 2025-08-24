import api from "../../../lib/api";

export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  await api.delete(`/products/${productId}/images/${imageId}`);
}
