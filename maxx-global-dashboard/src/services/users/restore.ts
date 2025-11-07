// src/services/users/restore.ts
import api from "../../lib/api";

export async function restoreUser(userId: number) {
  const { data } = await api.post(`/users/${userId}/restore`);
  return data;
} 