// src/services/roleService.ts
import api from "../lib/api";

export interface RoleOption {
  id: number;
  name: string;
}

// Backend alan adları farklıysa burada normalize ediyoruz.
function normalize(list: any[]): RoleOption[] {
  return list.map((r: any) => ({
    id: r.id ?? r.roleId ?? r.roleID,
    name: r.name ?? r.roleName ?? r.title ?? String(r.id ?? r.roleId),
  }));
}

export async function getActiveRoles(): Promise<RoleOption[]> {
  const { data } = await api.get("/roles/active-simple"); // ← curl ile aynı endpoint
  const raw = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
  return normalize(raw);
}
