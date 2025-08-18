export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
  dealerId?: number;
  roleId?: number;
}
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
