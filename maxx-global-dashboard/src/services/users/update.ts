// src/services/users/update.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { UpdateUserRequest, UpdatedUser } from "../../types/user";

/** undefined olan alanları payload'dan çıkar (tip güvenli) */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((k) => {
    const v = obj[k];
    if (v !== undefined) out[k] = v;
  });
  return out;
}

/** PUT /users/{userId} */
export async function updateUser(
  userId: number,
  payload: UpdateUserRequest,
  opts?: { signal?: AbortSignal }
): Promise<UpdatedUser> {
  const clean = compact(payload); // isterseniz payload'ı direkt de gönderebilirsiniz (JSON.stringify undefined'ları zaten düşürür)

  const res = await api.put<ApiEnvelope<UpdatedUser>>(
    `/users/${userId}`,
    clean,
    { signal: opts?.signal }
  );

  // {success,data} sarmalı veya direkt body—ikisinden birini normalize et
  const data = (res as any).data?.data ?? (res as any).data;
  return data as UpdatedUser;
}
