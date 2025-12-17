// src/pages/homepage/BasketDetail/my-orders.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { listMyOrders } from "../../../services/orders/my-orders";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import type { OrderResponse, PageResponse } from "../../../types/order";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";
import {
  approveEditedOrder,
  rejectEditedOrder,
} from "../../../services/orders/approve-edited";
import { useCart } from "../Helpers/CartContext";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reorderingOrderId, setReorderingOrderId] = useState<number | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { addItem, refresh } = useCart();
  const { t, i18n } = useTranslation();

  const locale = useMemo(() => {
    if (i18n.language?.toLowerCase().startsWith("tr")) return "tr-TR";
    if (i18n.language?.toLowerCase().startsWith("en")) return "en-US";
    return i18n.language || "tr-TR";
  }, [i18n.language]);

  const getStatusLabel = (status: string) => {
    const normalized = status?.toLocaleUpperCase("tr-TR") ?? "";
    if (normalized === "TAMAMLANDI") return t("pages.myOrders.status.completed");
    if (normalized.includes("IPTAL") || normalized.includes("İPTAL")) {
      return t("pages.myOrders.status.cancelled");
    }
    if (normalized === "DÜZENLEME ONAY BEKLIYOR" || normalized === "DÜZENLEME ONAY BEKLİYOR") {
      return t("pages.myOrders.status.editPending");
    }
    return t("pages.myOrders.status.processing", { status });
  };

  // ✅ Siparişleri yükle
  const loadOrders = async () => {
    const controller = new AbortController();
    try {
      setOrders(null);
      setError(null);

      const res: PageResponse<OrderResponse> = await listMyOrders(0, 20, controller.signal);
      setOrders(res?.content ?? []);
    } catch (err: any) {
      if (err?.name !== "AbortError" && err?.code !== "ERR_CANCELED") {
        setError(t("pages.myOrders.errors.fetch"));
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ✅ Siparişi tekrarlama
  const handleReorder = async (order: OrderResponse) => {
    try {
      setReorderingOrderId(order.id);

      const result = await Swal.fire({
        title: t("pages.myOrders.reorder.title"),
        html: t("pages.myOrders.reorder.confirmHtml", {
          orderNumber: order.orderNumber,
          itemCount: order.items.length,
        }),
        icon: "question",
        showCancelButton: true,
        confirmButtonText: t("pages.myOrders.reorder.confirmButton"),
        cancelButtonText: t("pages.myOrders.actions.cancel"),
        confirmButtonColor: "#059669",
        cancelButtonColor: "#6b7280",
      });

      if (!result.isConfirmed) {
        setReorderingOrderId(null);
        return;
      }

      for (const item of order.items) {
        await addItem({
          productId: item.productId,
          productVariantId: item.productVariantId ?? null,
          productPriceId: item.productPriceId ?? null,
          quantity: item.quantity,
        });
      }

      await refresh();

      await Swal.fire({
        icon: "success",
        title: t("pages.myOrders.reorder.successTitle"),
        text: t("pages.myOrders.reorder.successText", {
          count: order.items.length,
        }),
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/homepage/basket");
    } catch (error: any) {
      console.error("Sipariş tekrarlama hatası:", error);

      Swal.fire({
        icon: "error",
        title: t("pages.myOrders.reorder.errorTitle"),
        text:
          error?.response?.data?.message ||
          error?.message ||
          t("pages.myOrders.reorder.errorText"),
        confirmButtonText: t("common.ok"),
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setReorderingOrderId(null);
    }
  };

  // ✅ Düzenlenmiş siparişi ONAYLA
  const handleApproveEdit = async (order: OrderResponse) => {
    const result = await Swal.fire({
      title: t("pages.myOrders.approve.title"),
      html: `
        <p>${t("pages.myOrders.approve.confirmLine1", {
          orderNumber: `<strong>${order.orderNumber}</strong>`,
        })}</p>
        <p class="text-sm text-gray-600 mt-2">${t("pages.myOrders.approve.confirmLine2")}</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("pages.myOrders.actions.approve"),
      cancelButtonText: t("pages.myOrders.actions.cancel"),
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingOrderId(order.id);

      await approveEditedOrder(order.id);

      await Swal.fire({
        icon: "success",
        title: t("pages.myOrders.approve.successTitle"),
        text: t("pages.myOrders.approve.successText"),
        confirmButtonText: t("common.ok"),
        confirmButtonColor: "#059669",
      });

      // ✅ Siparişleri yeniden yükle
      await loadOrders();
    } catch (error: any) {
      console.error("Onaylama hatası:", error);

      Swal.fire({
        icon: "error",
        title: t("pages.myOrders.approve.errorTitle"),
        text: error.message || t("pages.myOrders.approve.errorText"),
        confirmButtonText: t("common.ok"),
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  // ✅ Düzenlenmiş siparişi REDDET
  const handleRejectEdit = async (order: OrderResponse) => {
    const { value: rejectionReason } = await Swal.fire({
      title: t("pages.myOrders.reject.title"),
      html: `
        <p class="mb-4">${t("pages.myOrders.reject.prompt", {
          orderNumber: `<strong>${order.orderNumber}</strong>`,
        })}</p>
      `,
      input: "textarea",
      inputLabel: t("pages.myOrders.reject.reasonLabel"),
      inputPlaceholder: t("pages.myOrders.reject.placeholder"),
      inputAttributes: {
        maxlength: "500",
        rows: "4",
      },
      showCancelButton: true,
      confirmButtonText: t("pages.myOrders.actions.reject"),
      cancelButtonText: t("pages.myOrders.actions.cancel"),
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return t("pages.myOrders.reject.errors.required");
        }
        if (value.trim().length < 10) {
          return t("pages.myOrders.reject.errors.minLength");
        }
      },
    });

    if (!rejectionReason) return;

    try {
      setProcessingOrderId(order.id);

      await rejectEditedOrder(order.id, rejectionReason.trim());

      await Swal.fire({
        icon: "success",
        title: t("pages.myOrders.reject.successTitle"),
        text: t("pages.myOrders.reject.successText"),
        confirmButtonText: t("common.ok"),
        confirmButtonColor: "#059669",
      });

      // ✅ Siparişleri yeniden yükle
      await loadOrders();
    } catch (error: any) {
      console.error("Reddetme hatası:", error);

      Swal.fire({
        icon: "error",
        title: t("pages.myOrders.reject.errorTitle"),
        text: error.message || t("pages.myOrders.reject.errorText"),
        confirmButtonText: t("common.ok"),
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  // ✅ Loading state
  if (orders === null && !error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh] text-red-500">
          {error}
        </div>
      </Layout>
    );
  }

  // ✅ Empty state
  if (orders && orders.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh] text-gray-500">
          {t("pages.myOrders.empty")}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{t("pages.myOrders.metaTitle")}</title>
        <meta name="description" content={t("pages.myOrders.metaDescription") ?? ""} />
      </Helmet>
      <div className="w-full bg-white pb-10">
        <PageTitle
          title={t("pages.myOrders.pageTitle")}
          breadcrumb={[
            { name: t("pages.myOrders.breadcrumb.home"), path: "/homepage" },
            { name: t("pages.myOrders.breadcrumb.orders"), path: "/homepage/my-orders" },
          ]}
        />
        <div className="container-x mx-auto mt-6 space-y-6">
          {orders!.map((order) => {
            const normalizedStatus = order.orderStatus?.toLocaleUpperCase("tr-TR") ?? "";
            const isEditPending =
              normalizedStatus === "DÜZENLEME ONAY BEKLIYOR" ||
              normalizedStatus === "DÜZENLEME ONAY BEKLİYOR";
            const isCancelled = normalizedStatus.includes("İPTAL") || normalizedStatus.includes("IPTAL");
            const isCompleted = normalizedStatus === "TAMAMLANDI";
            const isProcessing = processingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg shadow-sm p-5 bg-white hover:shadow-md transition relative"
              >
                {/* Sipariş başlığı */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-800">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleString(locale)} – {order.dealerName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    {/* Sipariş durumu badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${isCompleted
                        ? "bg-green-100 text-green-700"
                        : isCancelled
                          ? "bg-red-100 text-red-700"
                          : isEditPending
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {getStatusLabel(order.orderStatus)}
                    </span>

                    {/* ✅ ONAYLA/REDDET Butonları (sadece DÜZENLEME_ONAY_BEKLİYOR için) */}
                    {isEditPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveEdit(order)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t("pages.myOrders.actions.approve")}
                        >
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("pages.myOrders.actions.processing")}
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              {t("pages.myOrders.actions.approve")}
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleRejectEdit(order)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t("pages.myOrders.actions.reject")}
                        >
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("pages.myOrders.actions.processing")}
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              {t("pages.myOrders.actions.reject")}
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Siparişi Tekrarla butonu */}
                    <button
                      onClick={() => handleReorder(order)}
                      disabled={reorderingOrderId === order.id || isProcessing}
                      className="flex items-center gap-2 px-3 py-2 bg-qh2-green text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t("pages.myOrders.reorder.title")}
                    >
                      {reorderingOrderId === order.id ? (
                        <>
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t("pages.myOrders.actions.processing")}
                        </>
                      ) : (
                        <>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t("pages.myOrders.actions.reorder")}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Ürün listesi */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex py-3 items-center">
                      <Link
                        to={`/homepage/product/${item.productId}`}
                        className="w-16 h-16 mr-4 border border-gray-200 rounded overflow-hidden hover:border-qh2-green transition-colors"
                      >
                        {item.primaryImageUrl ? (
                          <img
                            src={item.primaryImageUrl}
                            alt={item.productName}
                            className="w-full h-full object-contain hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-50">
                            {t("pages.myOrders.noImage")}
                          </div>
                        )}
                      </Link>

                      <div className="flex-1">
                        <Link
                          to={`/homepage/product/${item.productId}`}
                          className="text-sm font-medium text-gray-800 hover:text-qh2-green hover:underline transition-colors block"
                        >
                          {item.productName}
                        </Link>
                        {item.variantSize} / {item.variantSku}
                        <p className="text-xs text-gray-500 mt-1">
                          {item.quantity} ×{" "}
                          {item.unitPrice != null
                            ? item.unitPrice.toLocaleString(locale, {
                              style: "currency",
                              currency: order.currency || "TRY",
                            })
                            : "-"}
                        </p>
                      </div>

                      <div className="text-sm font-semibold text-gray-700">
                        {item.totalPrice != null
                          ? item.totalPrice.toLocaleString(locale, {
                            style: "currency",
                            currency:
                              order.currency == null ? "-" : order.currency || "TRY",
                          })
                          : "-"}
                      </div>
                    </div>
                  ))}

                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {order.adminNote}
                </p>
                {/* Toplam tutar */}
                <div className="flex justify-end mt-4">
                  <p className="font-semibold text-gray-900">
                    {t("pages.myOrders.totalLabel")}{" "}
                    {order.totalAmount != null
                      ? order.totalAmount.toLocaleString(locale, {
                        style: "currency",
                        currency: order.currency || "TRY",
                      })
                      : "-"}

                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
