import type { Permission } from "./permission";

export type RoleRow = {
  id: number;
  name: string;
  permissions?: Permission[];
  createdAt?: string;
};

export type RoleCreateRequest = {
  name: string;
  permissionIds: number[];
};

export type RoleUpdateRequest = {
  name?: string;
  permissionIds?: number[];
};
