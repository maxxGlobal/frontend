// src/services/dealers/delete.ts
import api from "../../lib/api";

export async function deleteDealer(
  id: number,
  opts?: { force?: boolean }
): Promise<any> {
  const res = await api.delete(`/dealers/${id}`, {
    params: opts?.force ? { force: true } : undefined,
  });
  return (res as any).data ?? null;
}
