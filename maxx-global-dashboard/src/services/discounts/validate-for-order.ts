import type { Discount } from "../../types/discount";
import type { ProductRow } from "../../types/product";
import { listDiscountsByDealer } from "./list-by-dealer";

/** Kullanıcının girdiği kod/ID'yi siparişe uygun bir indirim nesnesine çözer ve doğrular. */
export async function validateDiscountForOrder(
  codeOrId: string,
  dealerId: number,
  items: { product: ProductRow; qty: number }[],
  subtotal: number
): Promise<
  { ok: true; id: number; discount: Discount } | { ok: false; reason: string }
> {
  const codeTrim = (codeOrId || "").trim();
  if (!codeTrim) return { ok: false, reason: "Kod boş." };

  const discounts = await listDiscountsByDealer(dealerId);

  // İsimle veya sayısal ID ile eşle
  const asNumber = Number(codeTrim);
  const match = discounts.find(
    (d) => d.id === asNumber || d.name?.toLowerCase() === codeTrim.toLowerCase()
  );

  if (!match) {
    return { ok: false, reason: "Kod bulunamadı." };
  }

  // Zaman/limit/minimum tutar kontrolleri
  if (!match.isValidNow) {
    return { ok: false, reason: "İndirim şu an geçerli değil." };
  }
  // Bazı backend'lerde usageLimitReached alanı olabilir
  // @ts-ignore
  if ((match as any).usageLimitReached === true) {
    return { ok: false, reason: "İndirim kullanım limiti dolmuş." };
  }
  if (match.minimumOrderAmount && subtotal < match.minimumOrderAmount) {
    return {
      ok: false,
      reason: `Minimum sipariş tutarı ${match.minimumOrderAmount} olmalı.`,
    };
  }

  // Ürün uygunluğu: En az bir satıra uygulanabilir mi?
  const applicableIds = new Set(
    match.applicableProducts?.map((p) => p.id) ?? []
  );
  const hasApplicableLine = items.some((it) =>
    applicableIds.has(it.product.id)
  );
  if (!hasApplicableLine) {
    return { ok: false, reason: "Kod sepetteki ürünler için geçerli değil." };
  }

  return { ok: true, id: match.id, discount: match };
}
