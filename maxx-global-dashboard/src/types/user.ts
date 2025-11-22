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
  address:string;
  createdAt: string;
  authorizedUser?: boolean;
  emailNotifications?: boolean;
  preferredLanguage?: string | null;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
  dealerId?: number;
  roleId: number;
  authorizedUser: boolean;
  emailNotifications: boolean;
  preferredLanguage: string;
}

export interface RegisteredUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authorizedUser?: boolean;
  emailNotifications?: boolean;
  preferredLanguage?: string | null;
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
  authorizedUser?: boolean;
  emailNotifications?: boolean;
  preferredLanguage?: string | null;
}

export type UpdateUserRequest = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  password: string;
  phoneNumber: string;
  dealerId: number;
  roleId: number; // tek rol veriyorsanız
  status: string; // ör: "ACTIVE" | "PASSIVE" vs.
  authorizedUser: boolean;
  emailNotifications: boolean;
  preferredLanguage: string;
}>;

export type UpdatedUser = UserRow;
