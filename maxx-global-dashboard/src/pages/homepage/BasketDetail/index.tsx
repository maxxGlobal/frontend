// src/pages/CartPage/index.tsx
import { useEffect, useMemo, useState } from "react";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import {
  getCart,
  updateQty,
  removeFromCart,
  clearCart,
} from "../../../services/cart/storage";
import { fetchProductsByIds } from "../../../services/products/bulk";
import { calculateDiscount } from "../../../services/discounts/calculate";
import { createOrder } from "../../../services/orders/create";
import { listDiscountsByDealer } from "../../../services/discounts/list-by-dealer";
import { validateDiscountForOrder } from "../../../services/discounts/validate-for-order";
import type { ProductRow } from "../../../types/product";
import type { Discount } from "../../../types/discount";
import Swal from "sweetalert2";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import "../../../theme.css";
import "../../../assets/homepage.css";

function fmt(amount: number, currency?: string | null) {
  try {
    return amount.toLocaleString("tr-TR", {
      style: "currency",
      currency: currency || "TRY",
    });
  } catch {
    return `${amount.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

export default function CartPage() {
  /** Tüm sayfa yükleme durumu: ürünler + kuponlar birlikte bitene kadar true */
  const [initLoading, setInitLoading] = useState(true);

  const [items, setItems] = useState<{ product: ProductRow; qty: number }[]>(
    []
  );
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(
    null
  );
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);

  /** Sadece indirim hesaplanırken kullanılan local loader */
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const { dealerId, dealerCurrency } = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        dealerId: user?.dealer?.id || 0,
        dealerCurrency: user?.dealer?.preferredCurrency || "TRY",
      };
    } catch {
      return { dealerId: 0, dealerCurrency: "TRY" };
    }
  })();

  /** Ürünler + kuponlar birlikte yüklensin; bitince initLoading kapansın */
  useEffect(() => {
    const controller = new AbortController();

    async function loadAll() {
      setInitLoading(true);

      const cart = getCart();
      const ids = cart.map((c) => c.id);

      const pProducts = (async () => {
        try {
          const products = ids.length
            ? await fetchProductsByIds(ids, { signal: controller.signal })
            : [];
          const qtyMap = new Map(cart.map((c) => [c.id, c.qty]));
          setItems(
            products.map((p) => ({ product: p, qty: qtyMap.get(p.id) ?? 1 }))
          );
        } catch (e) {
          console.error("Ürünler alınırken hata:", e);
          setItems([]);
        }
      })();

      const pDiscounts = (async () => {
        try {
          if (dealerId) {
            const dRes = await listDiscountsByDealer(dealerId);
            setDiscounts(dRes);
          } else {
            setDiscounts([]);
          }
        } catch (e) {
          console.error("İndirimler alınırken hata:", e);
          setDiscounts([]);
        }
      })();
      await Promise.allSettled([pProducts, pDiscounts]);
      setInitLoading(false);
    }

    loadAll();
    return () => controller.abort();
  }, [dealerId]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, it) => {
        const price = it.product.prices?.[0];
        return price ? sum + price.amount * it.qty : sum;
      }, 0),
    [items]
  );

  const handleQtyChange = (id: number, next: number) => {
    const q = Math.max(1, next);
    setItems((prev) =>
      prev.map((r) => (r.product.id === id ? { ...r, qty: q } : r))
    );
    updateQty(id, q);
    setDiscountedTotal(null);
  };

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((r) => r.product.id !== id));
    removeFromCart(id);
    setDiscountedTotal(null);
  };

  const handleApplyDiscount = async () => {
    if (!dealerId || !items.length || !selectedDiscountId) {
      Swal.fire({
        icon: "info",
        title: "Lütfen Bir İndirim Seçiniz",
        timer: 1200,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setApplyingDiscount(true);

      const validation = await validateDiscountForOrder(
        String(selectedDiscountId),
        dealerId,
        items,
        subtotal
      );
      if (!validation.ok) {
        Swal.fire({
          icon: "error",
          title: validation.reason,
          timer: 1400,
          showConfirmButton: false,
        });
        return;
      }

      const first = items[0];
      const price = first.product.prices?.[0];
      if (!price) return;

      const result = await calculateDiscount({
        productId: first.product.id,
        dealerId,
        quantity: first.qty,
        unitPrice: price.amount,
        totalOrderAmount: subtotal,
        includeDiscountIds: [validation.id],
      });

      setDiscountedTotal(result.finalTotalAmount);
      setSelectedDiscountId(validation.id);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "İndirim hesaplanırken hata oluştu.",
        timer: 1400,
        showConfirmButton: false,
      });
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      if (!dealerId || !items.length) {
        Swal.fire({
          icon: "error",
          title: "Sepet veya bayi bilgisi eksik.",
          timer: 1200,
          showConfirmButton: false,
        });
        return;
      }

      const productsPayload = items
        .map((it) => {
          const p = it.product.prices?.[0];
          return p
            ? { productPriceId: p.productPriceId, quantity: it.qty }
            : null;
        })
        .filter(Boolean) as { productPriceId: number; quantity: number }[];

      await createOrder({
        dealerId,
        products: productsPayload,
        discountId: selectedDiscountId ?? undefined,
        notes: "Web sepetinden sipariş",
      });

      Swal.fire({
        icon: "success",
        title: "Sipariş başarıyla oluşturuldu!",
        timer: 1200,
        showConfirmButton: false,
      });

      clearCart();
      setItems([]);
      setSelectedDiscountId(null);
      setDiscountedTotal(null);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Sipariş oluşturulurken hata oluştu.",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  if (initLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  if (!items.length) {
    return (
      <Layout>
        <div className="container-x mx-auto py-10 text-center">
          <p className="text-lg font-medium">Sepetiniz boş.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cart-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full">
          <PageTitle
            title="Sepetim"
            breadcrumb={[
              { name: "home", path: "/homepage" },
              { name: "homepage", path: "/homepage" },
            ]}
          />
        </div>

        <div className="w-full mt-[23px]">
          <div className="container-x mx-auto">
            {/* Ürün tablosu */}
            <div className="w-full mb-[30px]">
              <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
                <table className="w-full text-sm text-left text-gray-500">
                  <tbody>
                    <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap px-2 uppercase">
                      <td className="py-4 pl-10 min-w-[300px]">Ürün</td>
                      <td className="py-4 text-center">Ürün Kodu</td>
                      <td className="py-4 text-center">Fiyat</td>
                      <td className="py-4 text-center">Adet</td>
                      <td className="py-4 text-center">Tutar</td>
                      <td className="py-4 text-center">İşlem</td>
                    </tr>
                    {items.map(({ product, qty }) => {
                      const price = product.prices?.[0];
                      const line = price ? price.amount * qty : 0;
                      return (
                        <tr
                          key={product.id}
                          className="bg-white hover:bg-gray-50"
                        >
                          <td className="pl-10 py-4 w-[380px]">
                            <div className="flex space-x-6 items-center">
                              <div className="w-[80px] h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED]">
                                <img
                                  src={
                                    product.primaryImageUrl ||
                                    `${
                                      import.meta.env.VITE_PUBLIC_URL
                                    }/assets/images/placeholder.png`
                                  }
                                  className="w-16 h-16 object-cover rounded"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-[15px] text-qblack">
                                  {product.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4">{product.code}</td>
                          <td className="text-center py-4">
                            {price ? fmt(price.amount, price.currency) : "—"}
                          </td>
                          <td className="text-center py-4">
                            <input
                              type="number"
                              min={1}
                              value={qty}
                              onChange={(e) =>
                                handleQtyChange(
                                  product.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 border rounded px-2 py-1 text-center"
                            />
                          </td>
                          <td className="text-center py-4">
                            {price ? fmt(line, price.currency) : "-"}
                          </td>
                          <td className="text-center py-4">
                            <button
                              onClick={() => handleRemove(product.id)}
                              className="text-red-600"
                            >
                              Kaldır
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* İndirimler */}
            {discounts.length > 0 && (
              <div className="mb-6 relative">
                <h2 className="text-lg font-semibold mb-3">
                  Uygulanabilir İndirimler
                </h2>

                {applyingDiscount && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
                    <LoaderStyleOne />
                  </div>
                )}

                <div
                  className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
                    applyingDiscount ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {discounts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        if (!applyingDiscount) {
                          setSelectedDiscountId((prev) =>
                            prev === d.id ? null : d.id
                          );
                          setDiscountedTotal(null);
                        }
                      }}
                      className={`cursor-pointer border-2 coupon__wrap transition ${
                        selectedDiscountId === d.id
                          ? "border-yellow-500 bg-yellow-50 active"
                          : "border-qh2-green bg-green-50 pasif"
                      }`}
                    >
                      <div className="coupon__title font-bold text-qh2-green mb-1 pe-3 border-r border-dashed border-qh2-green">
                        <div className="bg-qh2-green rounded text-xs mb-2 text-green-50 px-2 py-1">
                          İndirim Kodu
                        </div>
                        <div className="text-sm text-center">{d.name}</div>
                      </div>
                      <div className="coupon__detail text-sm text-gray-600">
                        <div className="coupon__price text-qh2-green">
                          {d.discountValue}{" "}
                          {d.discountType === "PERCENTAGE"
                            ? "%"
                            : dealerCurrency}
                        </div>
                        <div className="coupon__info text-qh2-green">
                          {d.description || "Açıklama yok"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleApplyDiscount}
                  disabled={applyingDiscount || !selectedDiscountId}
                  className="mt-4 px-4 py-2 bg-qh2-green text-white rounded cursor-pointer transition hover:bg-qh2-green disabled:opacity-50"
                >
                  {applyingDiscount ? "Hesaplanıyor..." : "İndirimi Uygula"}
                </button>
              </div>
            )}

            <div className="w-full mt-[30px] flex sm:justify-end">
              <div className="sm:w-[370px] w-full border border-[#EDEDED] px-[30px] py-[26px]">
                <div className="flex justify-between mb-6">
                  <p className="text-[15px] font-medium text-qblack">
                    Toplam Tutar
                  </p>
                  <p className="text-[15px] font-medium text-qred">
                    {fmt(subtotal, dealerCurrency)}
                  </p>
                </div>
                <div className="w-full h-[1px] bg-[#EDEDED] mb-6" />
                {discountedTotal !== null && (
                  <div className="flex justify-between mb-6">
                    <p className="text-[15px] font-medium text-qblack">
                      İndirimli Toplam
                    </p>
                    <p className="text-[15px] font-medium text-green-600">
                      {fmt(discountedTotal, dealerCurrency)}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleCreateOrder}
                  className="w-full h-[50px] rounded-sm flex justify-center cursor-pointer items-center bg-qh2-green opacity-90 transition hover:opacity-100"
                >
                  <span className="text-sm font-semibold text-white">
                    Sepeti Onayla
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
