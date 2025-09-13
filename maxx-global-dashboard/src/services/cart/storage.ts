// src/services/cart/storage.ts
export type CartItem = { id: number; qty: number };
const KEY = "cartProducts";
function notify() {
  window.dispatchEvent(new Event("cart:changed"));
}
export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  notify();
}

export function addToCart(id: number, qty = 1) {
  const cart = getCart();
  const found = cart.find((i) => i.id === id);
  if (found) found.qty += qty;
  else cart.push({ id, qty });
  setCart(cart);
}

export function updateQty(id: number, qty: number) {
  const cart = getCart().map((i) =>
    i.id === id ? { ...i, qty: Math.max(1, qty) } : i
  );
  setCart(cart);
}

export function removeFromCart(id: number) {
  setCart(getCart().filter((i) => i.id !== id));
}

export function clearCart() {
  setCart([]);
}
