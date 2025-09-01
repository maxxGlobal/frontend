// src/services/dealers/create.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { DealerRow, DealerCreateRequest } from "../../types/dealer";

export async function createDealer(
  payload: DealerCreateRequest
): Promise<DealerRow> {
  const res = await api.post<ApiEnvelope<DealerRow> | DealerRow>(
    "/dealers",
    payload
  );
  const data = (res as any).data?.data ?? (res as any).data;
  return data as DealerRow;
}
