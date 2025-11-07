// src/types/order.ts
export type OrderItem = {
  productId: number;
  productPriceId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantSize: string;
  variantSku:string;
  primaryImageUrl?: string | null; // ✅ YENİ ALAN EKLENDI
};

export type OrderUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
};

export type OrderStatus =
  | "BEKLEMEDE"
  | "TAMAMLANDI"
  | "IPTAL_EDILDI"
  | "İPTAL_EDİLDİ";

export interface OrderResponse {
  id: number;
  orderNumber: string;
  dealerName: string;
  dealerId: number;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
  items: OrderItem[];
  orderDate: string;
  orderStatus: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  notes: string | null;
  adminNote: string | null;
  status: string;
  hasDiscount: string;
  appliedDiscount: string;
  discountName: string;
  adminNotes:string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ListAdminOrdersRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  status?: string;
  dealerId?: number;
  userId?: number;
}

export interface EditOrderBody {
  dealerId: number;
  products: { productPriceId: number; quantity: number }[];
  discountId: number | null;
  notes?: string;
}