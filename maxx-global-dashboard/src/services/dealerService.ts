// src/services/dealerService.ts
import api from "../lib/api";

export interface DealerSummary {
  id: number; // Backend’deki alan adı farklıysa aşağıda map’leyin
  name: string;
}

// NOT: Eğer backend doğrudan [{ id, name }] döndürüyorsa bu yeterli.
// Alan adları farklıysa (ör. dealerId/dealerName) map ile normalize edelim.
function normalize(list: any[]): DealerSummary[] {
  return list.map((d: any) => ({
    id: d.id ?? d.dealerId ?? d.dealerID,
    name: d.name ?? d.dealerName ?? d.title ?? String(d.id ?? d.dealerId),
  }));
}

export async function getDealerSummaries(): Promise<DealerSummary[]> {
  const { data } = await api.get("/dealers/summaries");
  // data bir dizi ise normalize et, değilse olası sarmalayıcı property’leri dene
  const raw = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
  return normalize(raw);
}
