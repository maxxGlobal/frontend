import { useCallback, useMemo, useState } from "react";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { useCart } from "../Helpers/CartContext";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";

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

export default function CartPage() {
  const { cart, items, loading, error, refresh } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refresh();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Sepet Yenilenemedi",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Sepet bilgileri yenilenirken bir hata oluştu.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const subtotal = useMemo(() => cart?.subtotal ?? null, [cart]);
  const currency = cart?.currency ?? "TRY";

  const totalItems = useMemo(() => {
    if (typeof cart?.totalItems === "number" && Number.isFinite(cart.totalItems)) {
      return cart.totalItems;
    }
    return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  }, [cart, items]);

  const pageTitle = useMemo(() => {
    if (!cart?.dealerName) {
      return "Sepetim";
    }
    return `Sepetim – ${cart.dealerName}`;
  }, [cart?.dealerName]);

  if (loading && !cart) {
    return (
      <Layout>
        <Helmet>
          <title>Medintera – Sepet</title>
          <meta name="description" content="Sepet" />
        </Helmet>
        <div className="flex justify-center items-center h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  const hasItems = items.length > 0;

  return (
    <Layout>
      <Helmet>
        <title>Medintera – Sepet</title>
        <meta name="description" content="Sepet" />
      </Helmet>
      <div className="cart-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full">
          <PageTitle
            title={pageTitle}
            breadcrumb={[
              { name: "home", path: "/homepage" },
              { name: "homepage", path: "/homepage" },
            ]}
          />
        </div>

        <div className="w-full mt-[23px]">
          <div className="container-x mx-auto">
            {error && (
              <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 rounded">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-qblack">Sepet Özeti</h2>
              <button
                onClick={handleManualRefresh}
                disabled={refreshing || loading}
                className="px-4 py-2 bg-qh2-green text-white rounded disabled:opacity-50"
              >
                {refreshing || loading ? "Yenileniyor..." : "Sepeti Yenile"}
              </button>
            </div>

            {!hasItems ? (
              <div className="py-20 text-center text-qgray text-sm">Sepetiniz boş.</div>
            ) : (
              <div className="overflow-x-auto border border-[#EDEDED]">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-[#F6F6F6] text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Ürün</th>
                      <th className="px-6 py-3 text-center">Varyant</th>
                      <th className="px-6 py-3 text-center">Adet</th>
                      <th className="px-6 py-3 text-center">Birim Fiyat</th>
                      <th className="px-6 py-3 text-center">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-[#EDEDED]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName ?? "Ürün"}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-qblack">
                                {item.productName ?? "Ürün"}
                              </p>
                              {item.variantSku && (
                                <p className="text-xs text-qgray">SKU: {item.variantSku}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.variantSize || "-"}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-qblack">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {formatCurrency(item.unitPrice, item.currency)}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-qred">
                          {formatCurrency(item.totalPrice, item.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="border border-[#EDEDED] rounded p-6">
                <h3 className="text-base font-semibold mb-4 text-qblack">Sipariş Bilgileri</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-qgray">Ürün Sayısı</span>
                  <span className="text-qblack font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-qgray">Ara Toplam</span>
                  <span className="text-qblack font-semibold">
                    {formatCurrency(subtotal, currency)}
                  </span>
                </div>
              </div>

              <div className="border border-[#EDEDED] rounded p-6 bg-gray-50">
                <h3 className="text-base font-semibold mb-4 text-qblack">Bayi Bilgileri</h3>
                <div className="text-sm text-qgray">
                  <p>
                    <span className="font-medium text-qblack">Bayi:</span>{" "}
                    {cart?.dealerName ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium text-qblack">Sepet Güncelleme:</span>{" "}
                    {cart?.lastActivityAt
                      ? new Date(cart.lastActivityAt).toLocaleString("tr-TR")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
