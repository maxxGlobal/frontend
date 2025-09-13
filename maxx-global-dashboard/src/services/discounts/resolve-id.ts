import { listDiscountsByDealer } from "./list-by-dealer";

export async function resolveDiscountId(code: string, dealerId: number) {
  // Girilen kod zaten rakamsa direkt ID kabul et
  const numeric = Number(code);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;

  // Bayiye ait tüm indirimleri çek
  const discounts = await listDiscountsByDealer(dealerId);
  const match = discounts.find(
    (d) => d.name.trim().toLowerCase() === code.trim().toLowerCase()
  );
  return match?.id ?? null;
}
