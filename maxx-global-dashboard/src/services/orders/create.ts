import api from "../../lib/api";

export type CreateOrderPayload = {
  dealerId: number;
  products: { productPriceId: number; quantity: number }[];
  discountId?: number;
  notes?: string;
};

export async function createOrder(payload: CreateOrderPayload) {
  try {
    const { data } = await api.post("/orders", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (e: any) {
    console.error(
      "createOrder error",
      e?.response?.status,
      e?.response?.data || e?.message
    );
    throw e;
  }
}
