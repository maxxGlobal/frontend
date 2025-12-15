import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../Helpers/CartContext";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

interface CartProps {
  className?: string;
  type?: number;
}

function formatCurrency(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
  locale: string
) {
  if (amount === null || amount === undefined) return "-";
  const numeric = Number(amount);
  if (Number.isFinite(numeric)) {
    try {
      if (currency) {
        return new Intl.NumberFormat(locale, { style: "currency", currency }).format(numeric);
      }
      return numeric.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch {
      const formatted = numeric.toFixed(2);
      return `${formatted}${currency ? ` ${currency}` : ""}`.trim();
    }
  }
  return String(amount);
}

export default function Cart({ className, type }: CartProps) {
  const { t, i18n } = useTranslation();
  const { items, cart, removeItem, clearCart } = useCart();

  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const subtotal = useMemo(() => {
    if (cart?.subtotal !== undefined && cart?.subtotal !== null) {
      return cart.subtotal;
    }
    return items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
  }, [cart, items]);

  const currency = cart?.currency ?? (items[0]?.currency ?? "TRY");

  const handleRemove = useCallback(
    async (id: number, name?: string | null) => {
      const result = await Swal.fire({
        title: t("pages.cart.removeConfirmTitle"),
        text: t("pages.cart.removeConfirmText", {
          product: name || t("pages.cart.mini.productFallback"),
        }),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("pages.cart.removeConfirmOk"),
        cancelButtonText: t("pages.cart.removeConfirmCancel"),
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
      });
      if (!result.isConfirmed) return;

      try {
        setRemovingItemId(id);
        await removeItem(id);
        Swal.fire({
          icon: "success",
          title: t("pages.cart.removeSuccessTitle"),
          timer: 1200,
          showConfirmButton: false,
        });
      } catch (e: any) {
        Swal.fire({
          icon: "error",
          title: t("pages.cart.removeErrorTitle"),
          text:
            e?.response?.data?.message ||
            e?.message ||
            t("pages.cart.removeErrorText"),
          confirmButtonText: t("common.ok", { defaultValue: "OK" }),
          confirmButtonColor: "#dc2626",
        });
      } finally {
        setRemovingItemId(null);
      }
    },
    [removeItem, t]
  );

  const handleClear = useCallback(async () => {
    const result = await Swal.fire({
      title: t("pages.cart.clearConfirmTitle"),
      text: t("pages.cart.clearConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("pages.cart.clearConfirmOk"),
      cancelButtonText: t("pages.cart.clearConfirmCancel"),
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;

    try {
      setClearing(true);
      await clearCart();
      Swal.fire({
        icon: "success",
        title: t("pages.cart.clearSuccessTitle"),
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: t("pages.cart.clearErrorTitle"),
        text:
          e?.response?.data?.message || e?.message || t("pages.cart.clearErrorText"),
        confirmButtonText: t("common.ok", { defaultValue: "OK" }),
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setClearing(false);
    }
  }, [clearCart, t]);

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
            <div className="p-4 text-center text-gray-500">
              {t("pages.cart.mini.empty")}
            </div>
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
                        alt={item.productName ?? t("pages.cart.mini.productFallback")}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="title text-[13px] font-semibold text-qblack leading-4 line-clamp-2">
                      {item.productName ?? t("pages.cart.mini.productFallback")}
                    </p>
                    <span className="text-qred font-bold text-[15px]">
                      {formatCurrency(item.unitPrice, item.currency, i18n.language || "tr")} x {item.quantity}
                    </span>
                  </div>
                </div>

                {/* Sil butonu */}
                <button
                  onClick={() => handleRemove(item.id, item.productName)}
                  disabled={removingItemId === item.id}
                  className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                  title={t("pages.cart.mini.removeTitle")}
                >
                  {removingItemId === item.id
                    ? t("pages.cart.mini.removing")
                    : t("pages.cart.mini.remove")}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {items.length > 0 && (
          <>
            <div className="px-4 mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[15px] font-medium text-qblack">
                  {t("pages.cart.mini.total")}
                </span>
                <span className="text-[15px] font-bold text-qred">
                  {formatCurrency(subtotal, currency, i18n.language || "tr")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link to="/homepage/basket">
                  <div className="bg-yellow-500 text-white w-full h-[45px] flex items-center justify-center rounded-md hover:brightness-95">
                    <span>{t("pages.cart.mini.viewCart")}</span>
                  </div>
                </Link>

                {/* Sepeti Temizle butonu */}
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="w-full h-[45px] bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {clearing ? t("pages.cart.mini.clearing") : t("pages.cart.mini.clearCart")}
                </button>
              </div>
            </div>

            <div className="px-4 mt-4 border-t border-gray-200 py-3 text-center">
              <p className="text-[13px] font-medium text-qgray">
                <span className="text-qblack">{t("pages.cart.mini.orderDetail")}</span>
                {" "}
                {t("pages.cart.mini.viewCartHint")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
