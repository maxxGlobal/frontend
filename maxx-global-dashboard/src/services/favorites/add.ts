import api from "../../lib/api";
import type { FavoriteRequest, FavoriteResponse } from "../../types/favorite";

/** Ürünü favorilere ekler (axios) */
export async function addFavorite(
  body: FavoriteRequest
): Promise<FavoriteResponse> {
  const res = await api.post<FavoriteResponse>("/favorites", body);
  return res.data; // ← .data ile gerçek FavoriteResponse döner
}
