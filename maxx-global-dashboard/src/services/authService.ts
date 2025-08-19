// src/services/authService.ts
import api from "../lib/api";
import type { LoginResponse, User } from "../lib/types";

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export function persistAuth(res: LoginResponse) {
  localStorage.setItem("token", res.token);
  localStorage.setItem("user", JSON.stringify(res.user));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("user");
  try {
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
