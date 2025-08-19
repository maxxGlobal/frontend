export type Permission = { id: number; name: string; description?: string };
export type Role = { id: number; name: string; permissions?: Permission[] };

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dealer?: any | null;
  roles: Role[];
};

export type LoginResponse = {
  token: string;
  user: User;
};
