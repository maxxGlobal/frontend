import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Permission } from "../../types/permission";

/** Tüm permission'ları getirir */
export async function listPermissions(): Promise<Permission[]> {
  const res = await api.get<ApiEnvelope<Permission[]> | Permission[]>(
    "/permissions"
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return Array.isArray(payload) ? payload : [];
}

/** ID ile permission getir */
export async function getPermissionById(id: number): Promise<Permission> {
  const res = await api.get<ApiEnvelope<Permission> | Permission>(
    `/permissions/${id}`
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return payload as Permission;
}

/** İsim ile permission getir */
export async function getPermissionByName(name: string): Promise<Permission> {
  const res = await api.get<ApiEnvelope<Permission> | Permission>(
    `/permissions/by-name/${encodeURIComponent(name)}`
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return payload as Permission;
}
