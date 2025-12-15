// src/types/auth.ts
import type { DealerMini, RoleMini, PermissionMini } from "./user";

export type Permission = PermissionMini;

export type Role = RoleMini & {
  permissions?: Permission[];
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  dealer?: DealerMini | null;
  roles: Role[];
  preferredLanguage?: string | null;
};

export type LoginResponse = {
  token: string;
  user: User;
  isDealer: boolean;
};
