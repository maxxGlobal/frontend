// src/utils/permission.ts
import type { User } from "../lib/types";
import { getCurrentUser } from "../services/auth/authService";

export type PermissionFlags = {
  required?: string;
  anyOf?: string[];
  allOf?: string[];
};

function collectUserPerms(user: User | null): Set<string> {
  return new Set(
    (user?.roles ?? []).flatMap((r) => r.permissions?.map((p) => p.name) ?? [])
  );
}

export function hasPermission(flags: PermissionFlags = {}): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const mine = collectUserPerms(user);
  const { required, anyOf, allOf } = flags;

  if (required && !mine.has(required)) return false;
  if (anyOf?.length && !anyOf.some((p) => mine.has(p))) return false;
  if (allOf?.length && !allOf.every((p) => mine.has(p))) return false;

  return true;
}
