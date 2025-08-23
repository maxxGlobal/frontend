// src/services/dealers/getByEmail.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Dealer } from "../../types/dealer";
import { normalizeDealer } from "./_normalize";

export async function getDealerByEmail(email: string): Promise<Dealer | null> {
  const res = await api.get<ApiEnvelope<any> | any>("/dealers/by-email", {
    params: { email },
  });
  const payload = (res as any).data?.data ?? (res as any).data ?? null;
  return payload ? normalizeDealer(payload) : null;
}
