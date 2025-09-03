// src/services/users/updateLite.ts
import api from "../../lib/api";
import type { DealerUserLite } from "../../types/dealer";

export async function updateUserLite(
  id: number,
  payload: Partial<DealerUserLite>
): Promise<DealerUserLite> {
  const res = await api.put(`/users/${id}`, payload);
  return res.data.data ?? res.data;
}
