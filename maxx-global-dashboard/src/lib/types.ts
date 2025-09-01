// src/lib/types.ts
export type Permission = { id: number; name: string; description?: string };
export type Role = { id: number; name: string; permissions?: Permission[] };
export type Dealer = { id: number; name: string };

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dealer?: Dealer | null;
  roles?: Role[];
};

export type LoginResponse = { token: string; user: User };

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
  dealerId: number;
  roleId: number;
};
// Generic API response tipleri
export type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
  code?: number;
  timestamp?: string;
};

export type PageResponse<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};
