import type { Dealer, DealerUserLite, DealerSummary } from "../../types/dealer";

export function normalizeDealerSummaries(rawList: any[]): DealerSummary[] {
  return (rawList ?? []).map((d: any) => ({
    id: d?.id ?? d?.dealerId ?? d?.dealerID,
    name:
      d?.name ??
      d?.dealerName ??
      d?.title ??
      String(d?.id ?? d?.dealerId ?? ""),
  }));
}

export function normalizeDealer(raw: any): Dealer {
  const users: DealerUserLite[] = Array.isArray(raw?.users)
    ? raw.users.map((u: any) => ({
        id: u.id,
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        email: u.email ?? "",
        fullName:
          u.fullName ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
      }))
    : [];

  return {
    id: raw.id,
    name: raw.name ?? "",
    fixedPhone: raw.fixedPhone ?? raw.phone ?? null,
    mobilePhone: raw.mobilePhone ?? raw.gsm ?? null,
    email: raw.email ?? null,
    address: raw.address ?? null,
    status: raw.status ?? null,
    // backend createdDate döndürüyor -> createdAt'e taşıyoruz
    createdAt: raw.createdAt ?? raw.created_date ?? raw.createdDate ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_date ?? raw.updatedDate ?? null,
    users,
  };
}

export function normalizeDealers(rawList: any[]): Dealer[] {
  return (rawList ?? []).map(normalizeDealer);
}
