import api from "../../lib/api";
import { normalizeToPage, type ApiEnvelope } from "../common";
import { type PageRequest, type PageResponse } from "../../types/paging";
import { type UserRow } from "../../types/user";

/** Tüm kullanıcılar (sayfalı) */
export async function listUsers(
  req: PageRequest,
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<UserRow>> {
  const res = await api.get<ApiEnvelope<PageResponse<UserRow>>>(`/users`, {
    params: {
      page: req.page,
      size: req.size,
      sortBy: req.sortBy,
      sortDirection: req.sortDirection,
    },
    signal: opts?.signal,
  });
  return res.data.data;
}

/** Arama */
export async function searchUsers(
  req: PageRequest & { q: string },
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<UserRow>> {
  const { q, page, size, sortBy, sortDirection } = req;
  const res = await api.get<ApiEnvelope<PageResponse<UserRow>>>(
    `/users/search`,
    {
      params: { q: q.trim(), page, size, sortBy, sortDirection },
      signal: opts?.signal,
    }
  );
  return res.data.data;
}

/** Belirli bayinin kullanıcıları */
export async function listUsersByDealer(
  req: PageRequest & { dealerId: number },
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<UserRow>> {
  const { dealerId, page, size, sortBy, sortDirection } = req;
  const res = await api.get<ApiEnvelope<PageResponse<UserRow>>>(
    `/users/byDealer/${dealerId}`,
    {
      params: { page, size, sortBy, sortDirection },
      signal: opts?.signal,
    }
  );
  return (res as any).data?.data ?? (res as any).data;
}

/** Sadece aktif kullanıcılar (dizi veya PageResponse gelebilir) */
export async function listActiveUsers(
  req: PageRequest,
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<UserRow>> {
  const res = await api.get<ApiEnvelope<PageResponse<UserRow> | UserRow[]>>(
    `/users/active`,
    {
      params: {
        page: req.page,
        size: req.size,
        sortBy: req.sortBy,
        sortDirection: req.sortDirection,
      },
      signal: opts?.signal,
    }
  );

  const payload = (res as any).data?.data ?? (res as any).data;
  return normalizeToPage<UserRow>(payload, req);
}
