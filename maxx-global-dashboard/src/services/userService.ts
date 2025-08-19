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
  number: number; // current page (0-based)
  size: number;
  first: boolean;
  last: boolean;
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

// Basit ve temiz: axios error’u component yakalasın:
export async function registerUser(
  payload: RegisterUserRequest
): Promise<RegisteredUser> {
  console.log("request", payload);
  const { data } = await api.post<RegisteredUser>("/users/register", payload);
  console.log("request", data);
  return data;
}

export async function listUsers(
  req: PageRequest
): Promise<PageResponse<UserRow>> {
  const res = await api.get<ApiEnvelope<PageResponse<UserRow>>>(`/users`, {
    params: {
      page: req.page,
      size: req.size,
      sortBy: req.sortBy,
      sortDirection: req.sortDirection,
    },
  });

  return res.data.data; // swagger örneğinde payload 'data' içinde
}
