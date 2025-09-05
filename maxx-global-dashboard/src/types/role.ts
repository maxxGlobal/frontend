import type { Permission } from "./permission";

export interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
  createdAt?: string;
  status?: string; // backend'de varsa
  active?: boolean; // backend'de varsa
}

// Basit seçenek (select/dropdown için)
export interface RoleOption {
  id: number;
  name: string;
}
export type RoleRow = {
  id: number;
  name: string;
  status: string;
  permissions?: Permission[];
  createdAt?: string;
};

// Oluşturma / güncelleme payload'ları
export interface CreateRoleRequest {
  name: string;
  permissionIds: number[];
}

export interface UpdateRoleRequest {
  name?: string;
  permissionIds?: number[];
}
