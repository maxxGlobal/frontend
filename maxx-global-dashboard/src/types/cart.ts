// src/types/cart.ts

export interface CartItemRequest {
  dealerId: number;
  productPriceId: number | null;
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string | null;
  productVariantId: number | null;
  variantSku: string | null;
  variantSize: string | null;
  productPriceId: number | null;
  quantity: number;
  availableStock: number | null;
  unitPrice: number | string;
  totalPrice: number | string;
  currency: string | null;
  imageUrl: string | null;
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
