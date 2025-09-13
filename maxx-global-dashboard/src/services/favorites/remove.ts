// src/services/favorites/remove.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export async function removeFavorite(productId: number) {
  return api.delete<ApiEnvelope<any>>(`/favorites/${productId}`);
}
