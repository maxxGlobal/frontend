export interface DealerSummary {
  id: number;
  name: string;
}

export interface Dealer {
  id: number;
  name: string;
  email?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // gerekirse ilave alanlar...
}

export interface DealerCreateRequest {
  name: string;
  email?: string;
  // diğer alanlar...
}

export interface DealerUpdateRequest {
  name?: string;
  email?: string;
  status?: string;
  // diğer alanlar...
}
