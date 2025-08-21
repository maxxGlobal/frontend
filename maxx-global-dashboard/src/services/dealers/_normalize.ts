// services/dealers/_normalize.ts (istersen koy)
import type { Dealer, DealerSummary } from "../../types/dealer";

export const normalizeSummary = (list: any[]): DealerSummary[] =>
  list.map((d) => ({
    id: d.id ?? d.dealerId ?? d.dealerID,
    name: d.name ?? d.dealerName ?? d.title ?? String(d.id ?? d.dealerId),
  }));

export const normalizeDealer = (d: any): Dealer => ({
  id: d.id ?? d.dealerId ?? d.dealerID,
  name: d.name ?? d.dealerName ?? d.title ?? String(d.id ?? d.dealerId),
  email: d.email ?? d.dealerEmail ?? null,
  status: d.status ?? d.state ?? null,
  createdAt: d.createdAt ?? d.createDate,
  updatedAt: d.updatedAt ?? d.updateDate,
});
