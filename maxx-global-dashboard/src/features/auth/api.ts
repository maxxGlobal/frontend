import { api } from "../../lib/api";
import type { RegisterRequest, ApiResponse } from "./types";

export async function register(req: RegisterRequest) {
  const { data } = await api.post<ApiResponse>("/auth/register", req);
  return data;
}
