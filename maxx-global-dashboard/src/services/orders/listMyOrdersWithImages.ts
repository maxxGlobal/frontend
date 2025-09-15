import { listMyOrders } from "./my-orders";
import { listProductImages } from "../products/images/list";
import type { OrderResponse, OrderItem, PageResponse } from "../../types/order";
import type { ProductImage } from "../../types/product";

export type OrderItemWithImage = OrderItem & {
  primaryImageUrl?: string | null;
};
export type OrderWithImages = Omit<OrderResponse, "items"> & {
  items: OrderItemWithImage[];
};

/** Siparişleri ve her siparişin ürün görsellerini tek seferde döner */
export async function listMyOrdersWithImages(
  page = 0,
  size = 20,
  signal?: AbortSignal
): Promise<OrderWithImages[]> {
  const res: PageResponse<OrderResponse> = await listMyOrders(
    page,
    size,
    signal
  );
  const content = res?.content ?? [];

  return Promise.all(
    content.map(async (order) => {
      const items: OrderItemWithImage[] = await Promise.all(
        order.items.map(async (it) => {
          try {
            const imgs: ProductImage[] = await listProductImages(it.productId, {
              signal,
            });
            const first = imgs.find((i) => i.isPrimary) ?? imgs[0];
            return { ...it, primaryImageUrl: first?.imageUrl ?? null };
          } catch {
            return { ...it, primaryImageUrl: null };
          }
        })
      );
      return { ...order, items };
    })
  );
}
