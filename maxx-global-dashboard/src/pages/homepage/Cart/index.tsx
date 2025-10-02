import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, removeFromCart } from "../../../services/cart/storage";
import { fetchProductsByIds } from "../../../services/products/bulk";
import type { ProductRow } from "../../../types/product";
import { useCart } from "../Helpers/CartContext";

type CartProps = {
  className?: string;
  type?: number;
};

export default function Cart({ className, type }: CartProps) {
  const { items: cartItems } = useCart();
  const [items, setItems] = useState<{ product: ProductRow; qty: number }[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const cart = getCart();
        const ids = cart.map((c) => c.id);
        if (!ids.length) {
          setItems([]);
          return;
        }
        const products = await fetchProductsByIds(ids, {
          signal: controller.signal,
        });
        const qtyMap = new Map(cart.map((c) => [c.id, c.qty]));
        setItems(
          products.map((p) => ({
            product: p,
            qty: qtyMap.get(p.id) ?? 1,
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [cartItems]);

  const handleRemove = (id: number) => {
    removeFromCart(id);
    setItems((prev) => prev.filter((x) => x.product.id !== id));
  };

  const subtotal = items.reduce((sum, it) => {
    const price = it.product.prices?.[0];
    return price ? sum + price.amount * it.qty : sum;
  }, 0);

  if (loading) {
    return (
      <div className={`p-4 text-center ${className || ""}`}>Yükleniyor…</div>
    );
  }

  return (
    <div
      style={{ boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)" }}
      className={`w-[300px] bg-white border-t-[3px] rounded-xl overflow-hidden ${
        type === 3 ? "border-qh3-blue" : "cart-wrapper"
      } ${className || ""}`}
    >
      <div className="w-full h-full flex flex-col">
        <div className="product-items max-h-[310px] overflow-y-auto">
          {items.length === 0 && (
            <div className="p-4 text-center text-gray-500">Sepet boş</div>
          )}
          <ul>
            {items.map(({ product, qty }) => {
              const price = product.prices?.[0];

              return (
                <li
                  key={product.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-[55px] h-[55px] flex-shrink-0">
                      <img
                        src={
                          product.primaryImageUrl ||
                          `${
                            import.meta.env.VITE_PUBLIC_URL
                          }/assets/images/placeholder.png`
                        }
                        alt={product.name}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="title text-[13px] font-semibold text-qblack leading-4 line-clamp-2">
                        {product.name}
                      </p>
                      <span className="text-qred font-bold text-[15px]">
                        {price
                          ? `${price.amount.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: price.currency || "TRY",
                            })} x ${qty}`
                          : "Fiyat yok"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="p-1 rounded-full hover:bg-red-100 transition"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 8 8"
                      className="fill-current text-gray-400 hover:text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7.76 0.24C7.44 -0.08 6.96 -0.08 6.64 0.24L4 2.88 1.36 0.24C1.04 -0.08 0.56 -0.08 0.24 0.24-0.08 0.56-0.08 1.04 0.24 1.36L2.88 4 0.24 6.64C-0.08 6.96-0.08 7.44 0.24 7.76c0.32 0.32 0.8 0.32 1.12 0L4 5.12l2.64 2.64c0.32 0.32 0.8 0.32 1.12 0 0.32-0.32 0.32-0.8 0-1.12L5.12 4l2.64-2.64c0.32-0.32 0.32-0.8 0-1.12Z" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Alt kısımlar */}
        {items.length > 0 && (
          <>
            <div className="px-4 mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[15px] font-medium text-qblack">
                  Toplam
                </span>
                <span className="text-[15px] font-bold text-qred">
                  {subtotal.toLocaleString("tr-TR", {
                    style: "currency",
                    currency: items[0].product.prices?.[0]?.currency || "TRY",
                  })}
                </span>
              </div>
              <div className="space-y-2">
                <Link to="/homepage/basket">
                  <div className="bg-yellow-500 text-white w-full h-[45px] flex items-center justify-center rounded-md">
                    <span>Sepeti Görüntüle</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="px-4 mt-4 border-t border-gray-200 py-3 text-center">
              <p className="text-[13px] font-medium text-qgray">
                <span className="text-qblack">Sipariş Detayınız</span> için
                Sepeti Görüntüle butonuna tıklayınız.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
