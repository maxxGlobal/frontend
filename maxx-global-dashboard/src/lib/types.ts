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
