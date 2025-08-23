import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type {
  Role,
  RoleOption,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "../../types/role";

/** Tüm rolleri getirir */
export async function listRoles(): Promise<Role[]> {
  const res = await api.get<ApiEnvelope<Role[]> | Role[]>("/roles");
  const payload = (res as any).data?.data ?? (res as any).data;
  return Array.isArray(payload) ? payload : [];
}

/** ID ile rol getirir */
export async function getRoleById(roleId: number): Promise<Role> {
  const res = await api.get<ApiEnvelope<Role> | Role>(`/roles/${roleId}`);
  const payload = (res as any).data?.data ?? (res as any).data;
  return payload as Role;
}

/** Yeni rol oluştur */
export async function createRole(payload: CreateRoleRequest): Promise<Role> {
  const res = await api.post<ApiEnvelope<Role> | Role>("/roles", payload);
  const data = (res as any).data?.data ?? (res as any).data;
  return data as Role;
}

/** Rol güncelle (kısmi) */
export async function updateRole(
  roleId: number,
  payload: UpdateRoleRequest
): Promise<Role> {
  const res = await api.put<ApiEnvelope<Role> | Role>(
    `/roles/${roleId}`,
    payload
  );
  const data = (res as any).data?.data ?? (res as any).data;
  return data as Role;
}

/** Rol sil */
export async function deleteRole(id: number, opts?: { force?: boolean }) {
  const cfg: any = {};
  if (opts?.force) {
    // hem query hem body gönder
    cfg.params = { force: true };
    cfg.data = { force: true };
  }
  const res = await api.delete<ApiEnvelope<null> | null>(`/roles/${id}`, cfg);
  return (res as any).data?.data ?? (res as any).data ?? null;
}

/** Silinen rolü geri yükle */
export async function restoreRole(roleId: number): Promise<Role> {
  const res = await api.post<ApiEnvelope<Role> | Role>(
    `/roles/restore/${roleId}`
  );
  const data = (res as any).data?.data ?? (res as any).data;
  return data as Role;
}

/** Özet liste (endpoint: /roles/summaries) */
export async function listRoleSummaries(): Promise<RoleOption[]> {
  const res = await api.get<ApiEnvelope<RoleOption[]> | RoleOption[]>(
    "/roles/summaries"
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return Array.isArray(payload) ? payload : [];
}

/** Aktif rollerin basit listesi (endpoint: /roles/active-simple) */
export async function getActiveRolesSimple(): Promise<RoleOption[]> {
  const res = await api.get<ApiEnvelope<RoleOption[]> | RoleOption[]>(
    "/roles/active-simple"
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return Array.isArray(payload) ? payload : [];
}
