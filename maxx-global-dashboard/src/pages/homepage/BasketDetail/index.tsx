/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/homepage/BasketDetail/index.tsx
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import type { Crumb } from "../Helpers/PageTitle";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { useCart } from "../Helpers/CartContext";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";
import { listDiscountsByDealer } from "../../../services/discounts/list-by-dealer";
import {
  calculateOrder,
  previewOrder,
  type OrderCalculationResponse,
  type OrderRequest,
} from "../../../services/orders/calculate";
import { createOrderWithValidation } from "../../../services/orders/create";
import type { Discount } from "../../../types/discount";
import type { CartItemResponse } from "../../../types/cart";

function formatCurrency(
  amount: number | string | null | undefined,
  currency?: string | null,
  locale: string = "tr-TR"
) {
  if (amount === null || amount === undefined) return "-";

  const numeric = Number(amount);
  if (Number.isFinite(numeric)) {
    try {
      return numeric.toLocaleString(locale, {
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
  const { t, i18n } = useTranslation();
  const locale = useMemo(
    () => (i18n.language?.startsWith("en") ? "en-US" : "tr-TR"),
    [i18n.language]
  );
  const crumbs: Crumb[] = useMemo(
    () => [
      { name: t("drawer.home"), path: "/homepage" },
      { name: t("pages.cart.pageTitle"), path: "/homepage/basket" },
    ],
    [t]
  );
  const { cart, items, loading, error, refresh, updateItem, removeItem, clearCart, dealerId: contextDealerId } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
  const [calculationResult, setCalculationResult] =
    useState<OrderCalculationResponse | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<OrderCalculationResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");

  // Miktar güncelleme için debounce
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});
const updateTimeoutRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // İlk yüklemede local quantities'i ayarla
  useEffect(() => {
    const initial: Record<number, number> = {};
    items.forEach(item => {
      initial[item.id] = item.quantity;
    });
    setLocalQuantities(initial);
  }, [items.length]); // Sadece items değiştiğinde

  // ✅ Miktar güncelleme - debounced
  const handleQtyChange = useCallback(
    (item: CartItemResponse, newQuantity: number) => {
      const quantity = Math.max(1, newQuantity);

      // Local state'i hemen güncelle (UI responsive olsun)
      setLocalQuantities(prev => ({
        ...prev,
        [item.id]: quantity
      }));

      // Önceki timeout'u temizle
      if (updateTimeoutRef.current[item.id]) {
        clearTimeout(updateTimeoutRef.current[item.id]);
      }

      // 800ms sonra backend'e istek at
      updateTimeoutRef.current[item.id] = setTimeout(async () => {
        try {
          setUpdatingItemId(item.id);
    if (!activeDealerId) throw new Error(t("pages.cart.missingDealerTitle"));

    await updateItem(item.id, {
      dealerId: activeDealerId,
      productId: item.productId,
      productVariantId: item.productVariantId ?? null,
      productPriceId: item.productPriceId, // item’dan geliyor
      quantity,
    });
          // İndirim hesaplaması varsa temizle
          setCalculationResult(null);
          setSelectedDiscountId(null);
        } catch (error: any) {
          console.error("Miktar güncellenirken hata:", error);

          // Hata durumunda eski değere geri dön
          setLocalQuantities(prev => ({
            ...prev,
            [item.id]: item.quantity
          }));

          Swal.fire({
            icon: "error",
            title: t("pages.cart.qtyErrorTitle"),
            text:
              error?.response?.data?.message ||
              error?.message ||
              t("pages.cart.qtyErrorText"),
            confirmButtonText: t("pages.cart.modal.confirm") ?? "OK",
            confirmButtonColor: "#dc2626",
          });
        } finally {
          setUpdatingItemId(null);
          delete updateTimeoutRef.current[item.id];
        }
      }, 800); // 800ms debounce
    },
    [t, updateItem]
  );


  const handleRemove = useCallback(
    async (item: CartItemResponse) => {
      const result = await Swal.fire({
        title: t("pages.cart.removeConfirmTitle"),
        text: t("pages.cart.removeConfirmText", { product: item.productName }),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("pages.cart.removeConfirmOk"),
        cancelButtonText: t("pages.cart.removeConfirmCancel"),
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
      });

      if (!result.isConfirmed) return;

      try {
        setRemovingItemId(item.id);
        await removeItem(item.id);

        // İndirim ve hesaplamaları temizle
        setCalculationResult(null);
        setSelectedDiscountId(null);

        Swal.fire({
          icon: "success",
          title: t("pages.cart.removeSuccessTitle"),
          text: t("pages.cart.removeSuccessText"),
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error("Ürün kaldırılırken hata:", error);
        Swal.fire({
          icon: "error",
          title: t("pages.cart.removeErrorTitle"),
          text:
            error?.response?.data?.message ||
            error?.message ||
            t("pages.cart.removeErrorText"),
          confirmButtonText: t("pages.cart.modal.confirm") ?? "OK",
          confirmButtonColor: "#dc2626",
        });
      } finally {
        setRemovingItemId(null);
      }
    },
    [removeItem, t]
  );


  // Cleanup - component unmount olduğunda timeout'ları temizle
  useEffect(() => {
    return () => {
      Object.values(updateTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Miktar güncelleme için loading state'leri
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const activeDealerId = useMemo(() => {
    if (cart?.dealerId) return cart.dealerId;
    if (contextDealerId) return contextDealerId;
    return null;
  }, [cart?.dealerId, contextDealerId]);

  const handleManualRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refresh();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t("pages.cart.refreshErrorTitle"),
        text:
          err?.response?.data?.message ||
          err?.message ||
          t("pages.cart.refreshErrorText"),
      });
    } finally {
      setRefreshing(false);
    }
  }, [refresh, t]);

  // İndirimleri yükle
  useEffect(() => {
    let cancelled = false;

    if (!activeDealerId) {
      setDiscounts([]);
      return () => {
        cancelled = true;
      };
    }

    setDiscountsLoading(true);
    listDiscountsByDealer(activeDealerId)
      .then((response) => {
        if (!cancelled) {
          setDiscounts(response);
        }
      })
      .catch((err) => {
        console.error("İndirimler alınırken hata oluştu:", err);
        if (!cancelled) {
          setDiscounts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDiscountsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeDealerId]);

  // Sepet değiştiğinde hesaplamayı temizle
  useEffect(() => {
    setCalculationResult(null);
    setSelectedDiscountId(null);
  }, [cart?.id]);

  const cartSubtotalValue = useMemo(() => {
    if (typeof cart?.subtotal === "number") {
      return cart.subtotal;
    }
    const parsed = Number(cart?.subtotal);
    return Number.isFinite(parsed) ? parsed : null;
  }, [cart?.subtotal]);

  const subtotal = useMemo(
    () => calculationResult?.subtotal ?? cartSubtotalValue ?? cart?.subtotal ?? null,
    [calculationResult?.subtotal, cartSubtotalValue, cart?.subtotal]
  );
  const currency = cart?.currency ?? "TRY";

  const totalItems = useMemo(() => {
    if (typeof cart?.totalItems === "number" && Number.isFinite(cart.totalItems)) {
      return cart.totalItems;
    }
    return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  }, [cart, items]);

  const pageTitle = useMemo(() => {
    if (!cart?.dealerName) {
      return t("pages.cart.pageTitle");
    }
    return `${t("pages.cart.pageTitle")} – ${cart.dealerName}`;
  }, [cart?.dealerName, t]);



  const buildOrderRequest = useCallback(
    (includeDiscount: boolean): OrderRequest | null => {
      if (!activeDealerId) {
        Swal.fire({
          icon: "error",
          title: t("pages.cart.missingDealerTitle"),
          text: t("pages.cart.missingDealerText"),
        });
        return null;
      }

      if (!items.length) {
        Swal.fire({
          icon: "info",
          title: t("pages.cart.emptyTitle"),
          text: t("pages.cart.emptyText"),
        });
        return null;
      }

      const products = items
        .map((item) => ({
          productPriceId: item.productPriceId,
          quantity: Math.max(1, item.quantity ?? 0),
        }))
        .filter((product) => product.quantity > 0);

      if (!products.length) {
        Swal.fire({
          icon: "info",
          title: t("pages.cart.invalidProductsTitle"),
          text: t("pages.cart.invalidProductsText"),
        });
        return null;
      }

      return {
        dealerId: activeDealerId,
        products,
        discountId: includeDiscount ? selectedDiscountId ?? undefined : undefined,
        // 🆕 Sipariş notu (trim boşsa göndermeyiz) 
        notes: notes.trim() ? notes.trim() : undefined,
      };
    },
    [activeDealerId, items, selectedDiscountId, notes, t]
  );

  const handleApplyDiscount = useCallback(async () => {
    if (!selectedDiscountId) {
      Swal.fire({
        icon: "info",
        title: t("pages.cart.selectDiscount"),
        timer: 1200,
        showConfirmButton: false,
      });
      return;
    }

    const request = buildOrderRequest(true);
    if (!request) {
      return;
    }

    try {
      setApplyingDiscount(true);
      const result = await calculateOrder(request);
      setCalculationResult(result);
      if (result.stockWarnings?.length) {
        Swal.fire({
          icon: "warning",
          title: t("pages.cart.stockWarningTitle"),
          text: result.stockWarnings.join(", "),
          confirmButtonText: t("pages.cart.modal.confirm") ?? "OK",
          confirmButtonColor: "#059669",
        });
    } else if ((result.discountAmount ?? 0) > 0 || result.discountDescription) {
        Swal.fire({
          icon: "success",
          title: t("pages.cart.discountApplied"),
          text: t("pages.cart.discountAppliedText", {
            amount: formatCurrency(result.discountAmount, result.currency, locale),
          }),
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "info",
          title: t("pages.cart.discountNotAppliedTitle"),
          text: result.discountDescription || t("pages.cart.discountNotAppliedText"),
          confirmButtonText: t("pages.cart.modal.confirm") ?? "OK",
          confirmButtonColor: "#059669",
        });
      }
    } catch (err: any) {
      console.error("İndirim hesaplanırken hata oluştu:", err);
      setCalculationResult(null);
      Swal.fire({
        icon: "error",
        title: t("pages.cart.discountFailedTitle"),
        text:
          err?.response?.data?.message ||
          err?.message ||
          t("pages.cart.discountFailedText"),
      });
    } finally {
      setApplyingDiscount(false);
    }
  }, [buildOrderRequest, locale, selectedDiscountId, t]);

  const handleClearDiscount = useCallback(() => {
    setSelectedDiscountId(null);
    setCalculationResult(null);
  }, []);

  const displayedDiscountAmount = useMemo(() => {
    if (calculationResult) {
      return calculationResult.discountAmount ?? 0;
    }
    return 0;
  }, [calculationResult]);

  const displayedTotal = useMemo(() => {
    if (calculationResult) {
      if (calculationResult.totalAmount != null) {
        return calculationResult.totalAmount;
      }
      return calculationResult.subtotal;
    }
    if (typeof subtotal === "number") {
      return subtotal;
    }
    const parsed = Number(subtotal);
    return Number.isFinite(parsed) ? parsed : subtotal ?? 0;
  }, [calculationResult, subtotal]);

  const handleShowPreview = useCallback(async () => {
    const request = buildOrderRequest(true);
    if (!request) {
      return;
    }

    try {
      setLoadingPreview(true);
      const preview = await previewOrder(request);
      setPreviewData(preview);
      setShowPreviewModal(true);
    } catch (err: any) {
      console.error("Sipariş önizlemesi alınamadı:", err);
      Swal.fire({
        icon: "error",
        title: t("pages.cart.previewFailedTitle"),
        text:
          err?.response?.data?.message ||
          err?.message ||
          t("pages.cart.previewFailedText"),
      });
    } finally {
      setLoadingPreview(false);
    }
  }, [buildOrderRequest, t]);

  const handleCreateOrder = useCallback(async () => {
    const request = buildOrderRequest(true);
    if (!request) {
      return;
    }

    try {
      setCreatingOrder(true);
      const result = await createOrderWithValidation(request);
      Swal.fire({
        icon: "success",
        title: t("pages.cart.orderCreatedTitle"),
        html: `
          <p><strong>${t("pages.cart.orderCreatedNumber")}</strong> ${result.orderNumber}</p>
          <p><strong>${t("pages.cart.orderCreatedTotal")}</strong> ${formatCurrency(
            result.totalAmount <= 1 ? "" : result.totalAmount,
            result.currency,
            locale
          )}</p>
          ${result.hasDiscount
            ? `<p><strong>${t("pages.cart.orderCreatedDiscount")}</strong> ${formatCurrency(
                result.savingsAmount,
                result.currency,
                locale
              )}</p>`
            : ""
          }
        `,
        confirmButtonText: t("pages.cart.modal.confirm") ?? "OK",
        confirmButtonColor: "#059669",
      });
      setShowPreviewModal(false);
      setPreviewData(null);
      setCalculationResult(null);
      setSelectedDiscountId(null);
      await clearCart(); 
      setNotes(""); // 🆕 notu sıfırla

    } catch (err: any) {
      console.error("Sipariş oluşturulamadı:", err);
      Swal.fire({
        icon: "error",
        title: t("pages.cart.orderCreateFailedTitle"),
        text:
          err?.response?.data?.message ||
          err?.message ||
          t("pages.cart.orderCreateFailedText"),
      });
    } finally {
      setCreatingOrder(false);
    }
  }, [buildOrderRequest, clearCart, locale, t]);

  if (loading && !cart) {
    return (
      <Layout>
        <Helmet>
          <title>{t("pages.cart.metaTitle")}</title>
          <meta
            name="description"
            content={t("pages.cart.metaDescription") ?? ""}
          />
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
        <title>{t("pages.cart.metaTitle")}</title>
        <meta
          name="description"
          content={t("pages.cart.metaDescription") ?? ""}
        />
      </Helmet>
      <div className="cart-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full">
          <PageTitle
            title={pageTitle}
            breadcrumb={crumbs}
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
              <h2 className="text-lg font-semibold text-qblack">{t("pages.cart.summary")}</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleManualRefresh}
                  disabled={refreshing || loading}
                  className="px-4 py-2 bg-qh2-green text-white rounded disabled:opacity-50 hover:bg-green-600 transition"
                >
                  {refreshing || loading
                    ? t("pages.cart.cartTotals.loading")
                    : t("pages.cart.refresh")}
                </button>
                {hasItems && (
                  <button
                    onClick={async () => {
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

                      if (result.isConfirmed) {
                        try {
                          await clearCart();
                          Swal.fire({
                            icon: "success",
                            title: t("pages.cart.clearSuccessTitle"),
                            text: t("pages.cart.clearSuccessText"),
                            timer: 1500,
                            showConfirmButton: false,
                          });
                        } catch (error: any) {
                          Swal.fire({
                            icon: "error",
                            title: t("pages.cart.clearErrorTitle"),
                            text:
                              error?.response?.data?.message ||
                              error?.message ||
                              t("pages.cart.clearErrorText"),
                            confirmButtonText: t("pages.cart.modal.confirm") ?? "OK",
                            confirmButtonColor: "#dc2626",
                          });
                        }
                      }
                    }}
                    disabled={refreshing || loading}
                    className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50 hover:bg-red-700 transition"
                  >
                    {t("pages.cart.clearCart")}
                  </button>
                )}
              </div>
            </div>

            {!hasItems ? (
              <div className="py-20 text-center text-qgray text-sm">{t("pages.cart.emptyText")}</div>
            ) : (
              <div className="overflow-x-auto border border-[#EDEDED]">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-[#F6F6F6] text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">{t("pages.cart.table.product")}</th>
                      <th className="px-6 py-3 text-center">{t("pages.cart.table.variant")}</th>
                      <th className="px-6 py-3 text-center">{t("pages.cart.table.quantity")}</th>
                      <th className="px-6 py-3 text-center">{t("pages.cart.table.unitPrice")}</th>
                      <th className="px-6 py-3 text-center">{t("pages.cart.table.total")}</th>
                      <th className="px-6 py-3 text-center">{t("pages.cart.table.actions")}</th>
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
                                alt={item.productName ?? t("pages.cart.table.product")}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-qblack">
                                {item.productName ?? t("pages.cart.table.product")}
                              </p>
                              {item.variantSku && (
                                <p className="text-xs text-qgray">SKU: {item.variantSku}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">{item.variantSize || "-"}</td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            min={1}
                            value={localQuantities[item.id] ?? item.quantity}
                            onChange={(e) => handleQtyChange(item, Number(e.target.value))}
                            disabled={updatingItemId === item.id}
                            className="w-20 border rounded px-2 py-1 text-center disabled:opacity-50"
                          />
                          {updatingItemId === item.id && (
                            <span className="block text-xs text-gray-500 mt-1">
                              {t("pages.cart.table.updating")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {formatCurrency(item.unitPrice, item.currency, locale)}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-qred">
                          {formatCurrency(item.totalPrice, item.currency, locale)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleRemove(item)}
                            disabled={removingItemId === item.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {removingItemId === item.id
                              ? t("pages.cart.table.removing")
                              : t("pages.cart.table.remove")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {hasItems && (
              <>
                {/* Order note */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3 text-qblack">
                    {t("pages.cart.notesLabel")}
                  </h3>
                  <div className="border border-[#EDEDED] rounded p-4 bg-white">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      maxLength={500}
                      placeholder={t("pages.cart.notesPlaceholder", { max: 500 }) ?? ""}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-qh2-green"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {t("pages.cart.notesCounter", { count: notes.length, max: 500 })}
                    </div>
                  </div>
                </div>

              </>
            )}
            {hasItems && (
              <>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3 text-qblack">
                    {t("pages.cart.availableDiscountsTitle")}
                  </h3>
                  {discountsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoaderStyleOne />
                    </div>
                  ) : !discounts.length ? (
                    <p className="text-sm text-qgray">
                      {t("pages.cart.noDiscountsText")}
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {discounts.map((discount) => (
                        <button
                          key={discount.id}
                          type="button"
                          onClick={() => {
                            setSelectedDiscountId((prev) =>
                              prev === discount.id ? null : discount.id
                            );
                            setCalculationResult(null);
                          }}
                          className={`text-left border-2 rounded-lg p-4 transition bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-qh2-green ${selectedDiscountId === discount.id
                            ? "border-qh2-green"
                            : "border-transparent"
                            }`}
                        >
                          <div className="text-xs uppercase font-semibold text-qh2-green mb-2">
                            {t("pages.cart.discountCodeLabel")}
                          </div>
                          <div className="text-base font-semibold text-qblack mb-1">
                            {discount.name}
                          </div>
                          <div className="text-sm text-qh2-green font-semibold">
                            {discount.discountValue}{" "}
                            {discount.discountType === "Yüzdesel" ? "%" : currency}
                          </div>
                          {discount.description && (
                            <div className="text-xs text-qgray mt-2">
                              {discount.description}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleApplyDiscount}
                      disabled={
                      applyingDiscount || !selectedDiscountId || !discounts.length
                      }
                      className="px-4 py-2 bg-qh2-green text-white rounded disabled:opacity-50"
                    >
                      {applyingDiscount
                        ? t("pages.cart.cartTotals.applying")
                        : t("pages.cart.cartTotals.apply")}
                    </button>
                    {(selectedDiscountId || calculationResult) && (
                      <button
                        onClick={handleClearDiscount}
                        disabled={applyingDiscount}
                        className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
                      >
                        {t("pages.cart.cartTotals.clear")}
                      </button>
                    )}
                  </div>
                </div>

                {calculationResult?.stockWarnings?.length ? (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded">
                    <h4 className="text-orange-800 font-semibold mb-2">
                      {t("pages.cart.cartTotals.stockWarnings")}
                    </h4>
                    <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
                      {calculationResult.stockWarnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="border border-[#EDEDED] rounded p-6">
                    <h3 className="text-base font-semibold mb-4 text-qblack">
                      {t("pages.cart.cartTotals.orderInfo")}
                    </h3>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-qgray">{t("pages.cart.cartTotals.itemCount")}</span>
                      <span className="text-qblack font-medium">{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-qgray">{t("pages.cart.cartTotals.subtotal")}</span>
                      <span className="text-qblack font-semibold">
                        {formatCurrency(subtotal, currency, locale)}
                      </span>
                    </div>
                    {displayedDiscountAmount > 0 && (
                      <div className="flex justify-between text-sm mt-2 text-green-600">
                        <span>{t("pages.cart.cartTotals.discount")}</span>
                        <span>-{formatCurrency(displayedDiscountAmount, currency, locale)}</span>
                      </div>
                    )}
                    {calculationResult?.discountDescription && (
                      <p className="text-xs text-qgray mt-2">
                        {calculationResult.discountDescription}
                      </p>
                    )}
                  </div>

                  <div className="border border-[#EDEDED] rounded p-6 bg-gray-50">
                    <h3 className="text-base font-semibold mb-4 text-qblack">
                      {t("pages.cart.cartTotals.dealerInfo")}
                    </h3>
                    <div className="text-sm text-qgray">
                      <p>
                        <span className="font-medium text-qblack">{t("pages.cart.cartTotals.dealer")}</span>{" "}
                        {cart?.dealerName ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium text-qblack">{t("pages.cart.cartTotals.lastActivity")}</span>{" "}
                        {cart?.lastActivityAt
                          ? new Date(cart.lastActivityAt).toLocaleString(locale)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <div className="w-full sm:w-[360px] border border-[#EDEDED] rounded p-6">
                    <div className="flex justify-between text-base font-semibold text-qblack mb-2">
                      <span>{t("pages.cart.cartTotals.grandTotal")}</span>
                      <span className="text-qred">
                        {formatCurrency(displayedTotal, currency, locale)}
                      </span>
                    </div>
                    <button
                      onClick={handleShowPreview}
                      disabled={loadingPreview || applyingDiscount}
                      className="w-full h-[50px] rounded-sm flex justify-center items-center bg-qh2-green text-white font-semibold disabled:opacity-50"
                    >
                      {loadingPreview
                        ? t("pages.cart.cartTotals.loading")
                        : t("pages.cart.cartTotals.createOrder")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Önizleme Modal */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">{t("pages.cart.modal.title")}</h2>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewData(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={creatingOrder}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{t("pages.cart.modal.summary")}</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>{t("pages.cart.cartTotals.itemCount")}</span>
                    <span className="font-medium">{previewData.totalItems}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>{t("pages.cart.cartTotals.currency")}</span>
                    <span className="font-medium">{previewData.currency}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{t("pages.cart.modal.items")}</h3>
                <div className="space-y-3">
                  {(previewData.itemCalculations ?? []).map((item) => {
                    const hasDiscount = (item.discountAmount ?? 0) > 0;
                    const originalPrice =
                      item.totalPrice != null && item.discountAmount != null
                        ? item.totalPrice + item.discountAmount
                        : null;

                    return (
                      <div
                        key={item.productId}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              {t("pages.cart.modal.productCode")} {item.productCode}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t("pages.cart.modal.quantity")}: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            {hasDiscount ? (
                              <div>
                                <div className="line-through text-gray-400">
                                  {formatCurrency(originalPrice, previewData.currency, locale)}
                                </div>
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(item.totalPrice, previewData.currency, locale)}
                                </div>
                                <div className="text-xs text-green-500">
                                  -
                                  {formatCurrency(
                                    item.discountAmount,
                                    previewData.currency,
                                    locale
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="font-semibold">
                                {formatCurrency(item.totalPrice, previewData.currency, locale)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {previewData.stockWarnings?.length ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-orange-800 font-semibold mb-2">
                    {t("pages.cart.cartTotals.stockWarnings")}
                  </h4>
                  <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
                    {previewData.stockWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>{t("pages.cart.modal.subtotal")}</span>
                  <span className="font-medium">
                    {formatCurrency(previewData.subtotal, previewData.currency, locale)}
                  </span>
                </div>
                {(previewData.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("pages.cart.cartTotals.discount")}</span>
                    <span>
                      -
                      {formatCurrency(previewData.discountAmount, previewData.currency, locale)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-qblack border-t pt-2">
                  <span>{t("pages.cart.modal.total")}</span>
                  <span className="text-qred">
                    {formatCurrency(previewData.totalAmount, previewData.currency, locale)}
                  </span>
                </div>
              </div>
            </div>

            {notes.trim() && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-gray-800 font-semibold mb-2">{t("pages.cart.modal.note")}</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {notes.trim()}
                </p>
              </div>
            )}

            <div className="flex gap-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewData(null);
                }}
                disabled={creatingOrder}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                {t("pages.cart.modal.cancel")}
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={creatingOrder}
                className="flex-1 px-4 py-2 bg-qh2-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {creatingOrder
                  ? t("pages.cart.modal.confirming")
                  : t("pages.cart.modal.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
