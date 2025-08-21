// src/types/user.ts
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

export interface RoleWithPermissions extends RoleMini {
  permissions?: PermissionMini[];
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

export type UpdateUserRequest = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  dealerId: number;
  roleId: number; // tek rol veriyorsanız
  status: string; // ör: "ACTIVE" | "PASSIVE" vs.
}>;
export type UpdatedUser = UserRow;
