// src/services/userService.ts
import api from "../lib/api";

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

// Basit ve temiz: axios error’u component yakalasın:
export async function registerUser(
  payload: RegisterUserRequest
): Promise<RegisteredUser> {
  console.log("request", payload);
  const { data } = await api.post<RegisteredUser>("/users/register", payload);
  console.log("request", data);
  return data;
}
