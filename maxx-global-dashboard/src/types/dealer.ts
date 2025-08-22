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
}

export interface DealerCreateRequest {
  name: string;
  email?: string;
}

export interface DealerUpdateRequest {
  name?: string;
  email?: string;
  status?: string;
}
