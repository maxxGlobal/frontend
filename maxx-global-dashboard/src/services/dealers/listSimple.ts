// src/services/dealers/listSimple.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../../services/common";

export interface SimpleDealer {
  id: number;
  name: string;
}

export async function listSimpleDealers() {
  const res = await api.get<ApiEnvelope<SimpleDealer[]>>("/dealers/simple");
  return res.data.data;
}
