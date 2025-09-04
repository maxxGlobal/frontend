// src/services/discounts/delete.ts
import api from "../../lib/api";

/** DELETE /discounts/:id -> 204 No Content veya wrapper success */
export async function deleteDiscount(id: number): Promise<void> {
  await api.delete(`/discounts/${id}`);
}
