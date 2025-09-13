// src/pages/CartPage/index.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Partials/Layout";
import BreadcrumbCom from "../BreadcrumbCom";

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
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<{ product: ProductRow; qty: number }[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  // İndirimler
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(
    null
  );
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);

  // Bayi bilgisi
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

  // Sepet ve indirimleri çek
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const cart = getCart();
        const ids = cart.map((c) => c.id);
        const products = ids.length
          ? await fetchProductsByIds(ids, { signal: controller.signal })
          : [];
        const qtyMap = new Map(cart.map((c) => [c.id, c.qty]));
        setItems(
          products.map((p) => ({ product: p, qty: qtyMap.get(p.id) ?? 1 }))
        );

        if (dealerId) {
          const dRes = await listDiscountsByDealer(dealerId);
          setDiscounts(dRes);
        }
      } catch (e: any) {
      } finally {
        setLoading(false);
      }
    })();
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

  // Adet değiştir
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

  const handleClear = () => {
    setItems([]);
    clearCart();
    setDiscountedTotal(null);
    setSelectedDiscountId(null);
  };

  // İndirim uygula
  const handleApplyDiscount = async () => {
    try {
      if (!dealerId || !items.length || !selectedDiscountId) {
        alert("Lütfen bir indirim seçin.");
        return;
      }
      const validation = await validateDiscountForOrder(
        String(selectedDiscountId),
        dealerId,
        items,
        subtotal
      );
      if (!validation.ok) {
        alert(validation.reason);
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
      alert("İndirim hesaplanırken hata oluştu.");
    }
  };

  // Sipariş oluştur
  const handleCreateOrder = async () => {
    try {
      if (!dealerId || !items.length) {
        alert("Sepet veya bayi bilgisi eksik.");
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

      const order = await createOrder({
        dealerId,
        products: productsPayload,
        discountId: selectedDiscountId ?? undefined,
        notes: "Web sepetinden sipariş",
      });

      alert("Sipariş başarıyla oluşturuldu!");
      clearCart();
      setItems([]);
      setSelectedDiscountId(null);
      setDiscountedTotal(null);
    } catch (e) {
      console.error(e);
      alert("Sipariş oluşturulurken hata oluştu.");
    }
  };

  // ---------- RENDER ----------
  if (!items.length && !loading) {
    return (
      <Layout>
        <div className="cart-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/homepage" },
                { name: "homepage", path: "/homepage" },
              ]}
            />
          </div>
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

        {loading && <div className="p-4 bg-gray-50 rounded">Yükleniyor…</div>}
        {error && <div className="p-4 bg-red-50 text-red-600">{error}</div>}

        <div className="w-full mt-[23px]">
          <div className="container-x mx-auto">
            {/* Ürün Tablosu */}
            <div className="w-full mb-[30px]">
              <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <tbody>
                    <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap px-2 default-border-bottom uppercase">
                      <td className="py-4 pl-10 block whitespace-nowrap min-w-[300px]">
                        Ürün
                      </td>
                      <td className="py-4 whitespace-nowrap text-center">
                        Ürün Kodu
                      </td>
                      <td className="py-4 whitespace-nowrap text-center">
                        Fiyat
                      </td>
                      <td className="py-4 whitespace-nowrap text-center">
                        Adet
                      </td>
                      <td className="py-4 whitespace-nowrap text-center">
                        Tutar
                      </td>
                      <td className="py-4 whitespace-nowrap text-center">
                        İşlem
                      </td>
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
                              <div className="flex-1 flex flex-col">
                                <p className="font-medium text-[15px] text-qblack">
                                  {product.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="text-center py-4 px-2">
                            {product.code}
                          </td>

                          <td className="text-center py-4 px-2">
                            <div className="flex space-x-1 items-center justify-center">
                              <span className="text-[15px] font-normal">
                                {price
                                  ? fmt(price.amount, price.currency)
                                  : "—"}
                              </span>
                            </div>
                          </td>

                          <td className="text-center py-4 px-2">
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

                          <td className="text-center py-4 px-2">
                            {price ? fmt(line, price.currency) : "-"}
                          </td>

                          <td className="text-center py-4 px-2">
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

            {/* İndirim Kartları */}
            {discounts.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">
                  Uygulanabilir İndirimler
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discounts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSelectedDiscountId((prev) =>
                          prev === d.id ? null : d.id
                        );
                        setDiscountedTotal(null);
                      }}
                      className={`cursor-pointer border rounded p-4 shadow-sm hover:shadow-md transition ${
                        selectedDiscountId === d.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <h3 className="font-bold text-qblack mb-1">{d.name}</h3>
                      <p className="text-sm text-gray-600">
                        {d.description || "Açıklama yok"}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleApplyDiscount}
                  className="mt-4 px-4 py-2 black-btn text-white rounded"
                >
                  İndirimi Uygula
                </button>
              </div>
            )}

            {/* Toplam ve Sipariş */}
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
                  className="w-full h-[50px] black-btn flex justify-center items-center"
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
