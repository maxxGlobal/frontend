// src/types/cart.ts

export interface CartItemRequest {
  dealerId: number;
  productPriceId: number;
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  productId: number;
  productPriceId: number;
  productName?: string | null;
  quantity: number;
  unitPrice?: number | null;
  totalPrice?: number | null;
  currency?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CartResponse {
  id: number;
  dealerId: number;
  dealerName: string | null;
  lastActivityAt: string | null;
  subtotal: string | number | null;
  currency: string | null;
  totalItems: number;
  items: CartItemResponse[];
}
