// src/services/userService.ts
import api from "../lib/api";

export type SortDirection = "asc" | "desc";

export interface DealerMini {
  id: number;
  name: string;
}
export interface RoleMini {
  id: number;
  name: string;
}
export interface PermissionMini {
  id: number;
  name: string;
  description?: string | null;
}

export interface UserRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  dealer?: DealerMini | null;
  roles: RoleMini[];
  status: string;
  createdAt: string;
}

export interface PageRequest {
  page: number; // 0-based
  size: number;
  sortBy: string; // örn: "firstName"
  sortDirection: SortDirection;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface SearchUsersRequest extends PageRequest {
  q: string; // arama terimi (min 3 karakter)
}

/** API tüm cevapları { success, data, ... } şeklinde sardığı için generic tip */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string | null;
  code?: number;
  timestamp?: string;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
  dealerId: number;
  roleId: number;
}

export interface RegisteredUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface RoleWithPermissions extends RoleMini {
  permissions?: PermissionMini[];
}

/* ---------- helpers ---------- */

/** /users/active bazı kurulumlarda dizi dönebiliyor; tek tipe çeviriyoruz */
function toPage<T>(rows: T[], req: PageRequest): PageResponse<T> {
  const totalElements = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / req.size));
  const from = req.page * req.size;
  const content = rows.slice(from, from + req.size);
  return {
    content,
    totalElements,
    totalPages,
    number: req.page,
    size: req.size,
    first: req.page === 0,
    last: req.page >= totalPages - 1,
  };
}

/** Eğer backend PageResponse döndürdüyse aynen bırak, dizi ise sayfalı hale getir */
function normalizeToPage<T>(payload: any, req: PageRequest): PageResponse<T> {
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.content)
  ) {
    return payload as PageResponse<T>;
  }
  if (Array.isArray(payload)) {
    return toPage<T>(payload, req);
  }
  // son çare: boş sayfa
  return toPage<T>([], req);
}

/* ---------- auth/me ---------- */

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  dealer?: DealerMini | null;
  roles: RoleWithPermissions[];
  status?: string;
  createdAt?: string;
  avatarUrl?: string | null;
}

export async function getMyProfile(opts?: {
  signal?: AbortSignal;
}): Promise<UserProfile> {
  const res = await api.get<ApiEnvelope<UserProfile>>("/users/profile", {
    signal: opts?.signal,
  });
  return res.data.data;
}

/* ---------- users (list/search/register) ---------- */

export async function registerUser(
  payload: RegisterUserRequest
): Promise<RegisteredUser> {
  const { data } = await api.post<RegisteredUser>("/users/register", payload);
  return data;
}

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

export async function searchUsers(
  req: PageRequest & { q: string },
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<UserRow>> {
  const { q, page, size, sortBy, sortDirection } = req;

  const res = await api.get<ApiEnvelope<PageResponse<UserRow>>>(
    "/users/search",
    {
      params: { q: q.trim(), page, size, sortBy, sortDirection },
      signal: opts?.signal,
    }
  );

  return res.data.data;
}

/* ---------- YENİ: bayi & aktif filtreleri ---------- */

/** Belirli bayiye bağlı kullanıcılar (sayfalı) */
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
  // bazı backendlere göre {success,data} sarmalı var
  return (res as any).data?.data ?? (res as any).data;
}

/** Sadece aktif kullanıcılar – dizi veya PageResponse dönebilir, her durumda PageResponse döndürür */
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
