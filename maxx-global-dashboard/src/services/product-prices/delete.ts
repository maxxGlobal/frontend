import api from "../../lib/api";
import type { ApiResponse } from "../../lib/types";

// 🔹 Fiyat sil
export async function deleteProductPrice(id: number) {
  const res = await api.delete<ApiResponse<null>>(`/product-prices/${id}`);
  return res.data.success;
}
