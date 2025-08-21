import api from "../../lib/api";
import type { RegisterUserRequest, RegisteredUser } from "../../types/user";

export async function registerUser(
  payload: RegisterUserRequest
): Promise<RegisteredUser> {
  const { data } = await api.post<RegisteredUser>("/users/register", payload);
  return data;
}
