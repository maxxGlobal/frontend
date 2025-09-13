// src/services/orders/calculate.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export type CalcLine = { productPriceId: number; quantity: number };
export type CalcRequest = { dealerId: number; products: CalcLine[] };

export async function calculateOrder(
  body: CalcRequest,
  opts?: { signal?: AbortSignal }
): Promise<any> {
  const res = await api.post<ApiEnvelope<any> | any>(
    "/orders/calculate",
    body,
    { signal: opts?.signal }
  );
  return (res as any).data?.data ?? (res as any).data;
}
