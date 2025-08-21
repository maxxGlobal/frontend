import api from "../../lib/api";
import { type ApiEnvelope } from "../common";
import { type UserProfile } from "../../types/user";

export async function getMyProfile(opts?: {
  signal?: AbortSignal;
}): Promise<UserProfile> {
  const res = await api.get<ApiEnvelope<UserProfile>>("/users/profile", {
    signal: opts?.signal,
  });
  return res.data.data;
}
