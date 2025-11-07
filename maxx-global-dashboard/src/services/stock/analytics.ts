import api from "../../lib/api";
import type { DailySummaryResponse, TopMovementProduct } from "../../types/stock";
import type { ApiEnvelope } from "../common";

/** Günlük özet (değişmedi) */
export async function getDailySummary(
  reportDate?: string
): Promise<DailySummaryResponse> {
  const res = await api.get<ApiEnvelope<DailySummaryResponse>>(
    "/stock/analytics/daily-summary",
    { params: reportDate ? { reportDate } : undefined }
  );
  return res.data.data;
}

/** API’nin array-of-arrays yapısını normalize ederek TopMovementProduct[] döndürür */
export async function getTopMovements(
  startDate?: string,
  endDate?: string,
  limit = 10
): Promise<TopMovementProduct[]> {
  const res = await api.get<ApiEnvelope<unknown>>(
    "/stock/analytics/top-movements",
    { params: { startDate, endDate, limit } }
  );

  // ApiEnvelope ise .data’ya in; değilse geleni ham olarak al
  const payload: unknown = (res as any)?.data?.data ?? (res as any)?.data ?? res;

  // 1) Diziyi güvenle çıkar (array-of-arrays ise flatten et)
  const items: any[] =
    Array.isArray(payload) && Array.isArray(payload[0])
      ? (payload as any[][]).flat()
      : Array.isArray(payload)
      ? (payload as any[])
      : [];

  // 2) İhtiyaç duyduğumuz minimal alanlara map + sayısal güvenlik
 const normalized: TopMovementProduct[] = items.map((x): TopMovementProduct => ({
  productId: Number(x?.productId ?? 0),
  productName: String(x?.productName ?? ""),
  productCode: String(x?.productCode ?? ""),
  totalMovements: Number(x?.totalMovements ?? 0),
  totalQuantity: Number(x?.totalQuantity ?? 0),

  variantSku: String(x?.variantSku ?? ""),
  variantSize: String(x?.variantSize ?? ""),

  // 🔽 Eksik olan zorunlu alanlar
  variantDisplayName:
    String(x?.variantDisplayName ??
      [x?.productName, x?.variantSize].filter(Boolean).join(" - ")),

  currentStock: Number(x?.currentStock ?? 0),

  variantId: Number(x?.variantId ?? 0),
}));

  return normalized;
}
