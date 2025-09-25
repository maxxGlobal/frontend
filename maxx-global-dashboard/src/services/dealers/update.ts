// src/services/dealers/update.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Dealer, DealerUpdateRequest } from "../../types/dealer";
import { getDealerById } from "./getById";
import { normalizeDealer } from "./_normalize";

// src/services/dealers/update.ts - preferredCurrency alanını ekle

export async function updateDealer(
  id: number,
  patch: DealerUpdateRequest
): Promise<Dealer> {
  const current = await getDealerById(id);
  const body = {
    name: patch.name ?? current.name ?? "",
    email: patch.email ?? current.email ?? null,
    fixedPhone: patch.fixedPhone ?? current.fixedPhone ?? null,
    mobilePhone: patch.mobilePhone ?? current.mobilePhone ?? null,
    address: patch.address ?? current.address ?? null,
    preferredCurrency: patch.preferredCurrency ?? current.preferredCurrency ?? null, // ✅ EKLENEN
  };

  const res = await api.put<ApiEnvelope<any> | any>(`/dealers/${id}`, body);
  const data = (res as any).data?.data ?? (res as any).data ?? null;
  return normalizeDealer(data || {});
}