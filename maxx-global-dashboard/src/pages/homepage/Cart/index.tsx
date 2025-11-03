import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../Helpers/CartContext";

interface CartProps {
  className?: string;
  type?: number;
}

function formatCurrency(amount: number | string | null | undefined, currency?: string | null) {
  if (amount === null || amount === undefined) return "-";
  const numeric = Number(amount);
  if (Number.isFinite(numeric)) {
    try {
      return numeric.toLocaleString("tr-TR", {
        style: "currency",
        currency: currency ?? "TRY",
      });
    } catch {
      return `${numeric.toFixed(2)} ${currency ?? ""}`.trim();
    }
  }
  return String(amount);
}

export default function Cart({ className, type }: CartProps) {
  const { items, cart } = useCart();

  const subtotal = useMemo(() => {
    if (cart?.subtotal !== undefined && cart?.subtotal !== null) {
      return cart.subtotal;
    }
    return items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
  }, [cart, items]);

  const currency = cart?.currency ?? (items[0]?.currency ?? "TRY");

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
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-[55px] h-[55px] flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName ?? "Ürün"}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="title text-[13px] font-semibold text-qblack leading-4 line-clamp-2">
                      {item.productName ?? "Ürün"}
                    </p>
                    <span className="text-qred font-bold text-[15px]">
                      {formatCurrency(item.unitPrice, item.currency)} x {item.quantity}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {items.length > 0 && (
          <>
            <div className="px-4 mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[15px] font-medium text-qblack">Toplam</span>
                <span className="text-[15px] font-bold text-qred">
                  {formatCurrency(subtotal, currency)}
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
                <span className="text-qblack">Sipariş Detayınız</span> için Sepeti Görüntüle butonuna tıklayınız.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
