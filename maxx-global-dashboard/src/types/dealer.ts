// src/types/dealer.ts

/** API'nin status alanı genelde ACTIVE | PASSIVE olarak geliyor */
export type DealerStatus = "ACTIVE" | "PASSIVE" | string;

export interface DealerSummary {
  id: number;
  name: string;
}
export interface DealerUserLite {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName?: string;
}

/** Tekil bayi modeli (normalize sonrası) */
export interface Dealer {
  id: number;
  name: string;
  fixedPhone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  address?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  users?: DealerUserLite[];
}

/** Liste tablolarında kullanışlı */
export interface DealerRow extends Dealer {}

export interface DealerCreateRequest {
  name: string;
  fixedPhone?: string;
  mobilePhone?: string;
  email?: string;
  address?: string;
}

export interface DealerUpdateRequest {
  name?: string;
  fixedPhone?: string;
  mobilePhone?: string;
  email?: string;
  address?: string;
  status?: string;
}
