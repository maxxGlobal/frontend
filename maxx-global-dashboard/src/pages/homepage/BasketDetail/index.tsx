// src/pages/homepage/BasketDetail/index.tsx
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
import { listDiscountsByDealer } from "../../../services/discounts/list-by-dealer";
import {
  calculateOrder,
  previewOrder,
} from "../../../services/orders/calculate";
import { createOrderWithValidation } from "../../../services/orders/create";
import type { ProductRow } from "../../../types/product";
import type { Discount } from "../../../types/discount";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import "../../../theme.css";
import "../../../assets/homepage.css";

type OrderProductRequest = {
  productPriceId: number;
  quantity: number;
};

type OrderRequest = {
  dealerId: number;
  products: OrderProductRequest[];
  discountId?: number;
  notes?: string;
};

type OrderItemCalculation = {
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inStock: boolean;
  availableStock: number;
  discountAmount: number;
  stockStatus: string;
};

type OrderCalculationResponse = {
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  totalItems: number;
  itemCalculations: OrderItemCalculation[];
  stockWarnings: string[];
  discountDescription?: string;
};

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
  const [initLoading, setInitLoading] = useState(true);

  const [items, setItems] = useState<{ product: ProductRow; qty: number }[]>(
    []
  );
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(
    null
  );

  const [calculationResult, setCalculationResult] =
    useState<OrderCalculationResponse | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] =
    useState<OrderCalculationResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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
  const manualSubtotal = useMemo(
    () =>
      items.reduce((sum, it) => {
        const price = it.product.prices?.[0];
        return price ? sum + price.amount * it.qty : sum;
      }, 0),
    [items]
  );

  const displayedSubtotal = calculationResult?.subtotal ?? manualSubtotal;
  const displayedDiscountAmount = calculationResult?.discountAmount ?? 0;
  const displayedTotal = calculationResult?.totalAmount ?? manualSubtotal;

  const handleQtyChange = (id: number, next: number) => {
    const q = Math.max(1, next);
    setItems((prev) =>
      prev.map((r) => (r.product.id === id ? { ...r, qty: q } : r))
    );
    updateQty(id, q);
    setCalculationResult(null);
    setSelectedDiscountId(null);
  };

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((r) => r.product.id !== id));
    removeFromCart(id);
    setCalculationResult(null);
    setSelectedDiscountId(null);
  };

  const createOrderRequest = (
    includeDiscount: boolean = false
  ): OrderRequest => {
    const products: OrderProductRequest[] = items
      .map((it) => {
        const price = it.product.prices?.[0];
        return price
          ? {
              productPriceId: price.productPriceId,
              quantity: it.qty,
            }
          : null;
      })
      .filter(Boolean) as OrderProductRequest[];

    return {
      dealerId,
      products,
      discountId: includeDiscount ? selectedDiscountId || undefined : undefined,
      notes: "Web sepetinden sipariş",
    };
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
      const orderRequest = createOrderRequest(true);
      const result = await calculateOrder(orderRequest);
      setCalculationResult(result);
      if (result.stockWarnings && result.stockWarnings.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Stok Uyarısı",
          text: result.stockWarnings.join(", "),
          confirmButtonText: "Tamam",
          confirmButtonColor: "#059669",
        });
      } else if (result.discountAmount > 0) {
        Swal.fire({
          icon: "success",
          title: "İndirim Uygulandı!",
          text: `${fmt(
            result.discountAmount,
            result.currency
          )} indirim uygulandı`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "İndirim Uygulanamadı",
          text:
            result.discountDescription || "Bu indirim şu anda uygulanamıyor.",
          confirmButtonText: "Tamam",
          confirmButtonColor: "#059669",
        });
      }
    } catch (e: any) {
      console.error("İndirim hesaplama hatası:", e);
      setCalculationResult(null);
      setSelectedDiscountId(null);

      let errorMessage = "İndirim hesaplanırken bir hata oluştu.";

      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }

      Swal.fire({
        icon: "error",
        title: "İndirim Hesaplama Hatası",
        text: errorMessage,
        confirmButtonText: "Tamam",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleShowPreview = async () => {
    if (!dealerId || !items.length) {
      Swal.fire({
        icon: "error",
        title: "Sepet boş veya bayi bilgisi eksik.",
        timer: 1200,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setLoadingPreview(true);

      const orderRequest = createOrderRequest(true);
      const preview = await previewOrder(orderRequest);

      setPreviewData(preview);
      setShowPreviewModal(true);
    } catch (e: any) {
      console.error("Sipariş önizleme hatası:", e);

      let errorMessage = "Sipariş önizlemesi oluşturulamadı.";
      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }

      Swal.fire({
        icon: "error",
        title: "Önizleme Hatası",
        text: errorMessage,
        confirmButtonText: "Tamam",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoadingPreview(false);
    }
  };
  const handleCreateOrder = async () => {
    if (!dealerId || !items.length) {
      Swal.fire({
        icon: "error",
        title: "Sepet boş veya bayi bilgisi eksik.",
        timer: 1200,
        showConfirmButton: false,
      });
      return;
    }
    if (
      calculationResult?.stockWarnings &&
      calculationResult.stockWarnings.length > 0
    ) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Stok Uyarısı Mevcut",
        text: "Bazı ürünlerde stok problemi var. Yine de devam etmek istiyor musunuz?",
        showCancelButton: true,
        confirmButtonText: "Evet, Devam Et",
        cancelButtonText: "İptal",
        confirmButtonColor: "#059669",
        cancelButtonColor: "#dc2626",
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      setCreatingOrder(true);

      const finalOrderRequest = createOrderRequest(true);
      const result = await createOrderWithValidation(finalOrderRequest);

      Swal.fire({
        icon: "success",
        title: "Sipariş Başarıyla Oluşturuldu!",
        html: `
          <p><strong>Sipariş Numarası:</strong> ${result.orderNumber}</p>
          <p><strong>Toplam Tutar:</strong> ${fmt(
            result.totalAmount,
            result.currency
          )}</p>
          ${
            result.hasDiscount
              ? `<p><strong>İndirim:</strong> ${fmt(
                  result.savingsAmount,
                  result.currency
                )}</p>`
              : ""
          }
        `,
        confirmButtonText: "Tamam",
        confirmButtonColor: "#059669",
      }).then(() => {});
      setShowPreviewModal(false);
      setPreviewData(null);
      clearCart();
      setItems([]);
      setSelectedDiscountId(null);
      setCalculationResult(null);
    } catch (e: any) {
      console.error("Sipariş oluşturma hatası:", e);
      let errorMessage = "Sipariş oluşturulurken bir hata oluştu.";
      let errorDetail = "";

      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }
      if (e.response?.status === 400) {
        errorDetail = "Lütfen sepetinizi kontrol ederek tekrar deneyiniz.";
      } else if (e.response?.status === 403) {
        errorDetail = "Bu işlem için yetkiniz bulunmuyor.";
      } else if (e.response?.status === 500) {
        errorDetail =
          "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.";
      }

      Swal.fire({
        icon: "error",
        title: "Sipariş Oluşturma Hatası",
        text: errorMessage,
        footer: errorDetail,
        confirmButtonText: "Tamam",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleClearDiscount = () => {
    setSelectedDiscountId(null);
    setCalculationResult(null);
  };

  if (initLoading) {
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

  if (!items.length) {
    return (
      <Layout>
        <Helmet>
          <title>Medintera – Sepet</title>
          <meta name="description" content="Sepet" />
        </Helmet>
        <div className="container-x mx-auto py-10 text-center">
          <p className="text-lg font-medium">Sepetiniz boş.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Medintera – Sepet</title>
        <meta name="description" content="Sepet" />
      </Helmet>
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
                      const itemCalculation =
                        calculationResult?.itemCalculations?.find(
                          (calc) => calc.productId === product.id
                        );
                      const itemDiscountAmount =
                        itemCalculation?.discountAmount || 0;
                      const finalItemTotal = line - itemDiscountAmount;

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
                                {itemCalculation && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Stok: {itemCalculation.availableStock} -{" "}
                                    {itemCalculation.stockStatus}
                                  </p>
                                )}
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
                            <div className="flex flex-col items-center">
                              {price && (
                                <span
                                  className={
                                    itemDiscountAmount > 0
                                      ? "line-through text-gray-400 text-xs"
                                      : ""
                                  }
                                >
                                  {fmt(line, price.currency)}
                                </span>
                              )}
                              {itemDiscountAmount > 0 && price && (
                                <span className="text-green-600 font-semibold">
                                  {fmt(finalItemTotal, price.currency)}
                                </span>
                              )}
                              {itemDiscountAmount > 0 && (
                                <span className="text-xs text-green-500">
                                  -{fmt(itemDiscountAmount, price?.currency)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-4">
                            <button
                              onClick={() => handleRemove(product.id)}
                              className="text-red-600 hover:text-red-800"
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
                          setCalculationResult(null);
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

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount || !selectedDiscountId}
                    className="px-4 py-2 bg-qh2-green text-white rounded cursor-pointer transition hover:bg-qh2-green disabled:opacity-50"
                  >
                    {applyingDiscount ? "Hesaplanıyor..." : "İndirimi Uygula"}
                  </button>
                  {(selectedDiscountId || calculationResult) && (
                    <button
                      onClick={handleClearDiscount}
                      disabled={applyingDiscount}
                      className="px-4 py-2 bg-gray-400 text-white rounded cursor-pointer transition hover:bg-gray-500 disabled:opacity-50"
                    >
                      İndirimi Temizle
                    </button>
                  )}
                </div>
              </div>
            )}
            {calculationResult?.stockWarnings &&
              calculationResult.stockWarnings.length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded">
                  <h3 className="text-orange-800 font-semibold mb-2">
                    Stok Uyarıları:
                  </h3>
                  <ul className="list-disc list-inside text-orange-700 text-sm">
                    {calculationResult.stockWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            <div className="w-full mt-[30px] flex sm:justify-end">
              <div className="sm:w-[370px] w-full border border-[#EDEDED] px-[30px] py-[26px]">
                <div className="flex justify-between mb-6">
                  <p className="text-[15px] font-medium text-qblack">
                    Ara Toplam
                  </p>
                  <p className="text-[15px] font-medium text-qred">
                    {fmt(displayedSubtotal, dealerCurrency)}
                  </p>
                </div>
                {displayedDiscountAmount > 0 && (
                  <>
                    <div className="flex justify-between mb-4">
                      <p className="text-[15px] font-medium text-green-600">
                        İndirim
                      </p>
                      <p className="text-[15px] font-medium text-green-600">
                        -{fmt(displayedDiscountAmount, dealerCurrency)}
                      </p>
                    </div>
                    {calculationResult?.discountDescription && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 italic">
                          {calculationResult.discountDescription}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="w-full h-[1px] bg-[#EDEDED] mb-6" />

                <div className="flex justify-between mb-6">
                  <p className="text-[18px] font-bold text-qblack">
                    Toplam Tutar
                  </p>
                  <p className="text-[18px] font-bold text-qred">
                    {fmt(displayedTotal, dealerCurrency)}
                  </p>
                </div>
                <button
                  onClick={handleShowPreview}
                  disabled={loadingPreview || applyingDiscount}
                  className="w-full h-[50px] rounded-sm flex justify-center cursor-pointer items-center bg-qh2-green opacity-90 transition hover:opacity-100 disabled:opacity-50"
                >
                  <span className="text-sm font-semibold text-white">
                    {loadingPreview ? "Yükleniyor..." : "Sipariş Önizleme"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {showPreviewModal && previewData && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Sipariş Önizleme
                </h2>
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
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Sipariş Özeti
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Toplam Ürün:</span>
                        <span className="font-medium ml-2">
                          {previewData.totalItems} adet
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Para Birimi:</span>
                        <span className="font-medium ml-2">
                          {previewData.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Ürün Detayları
                  </h3>
                  <div className="space-y-3">
                    {previewData.itemCalculations.map((item) => (
                      <div
                        key={item.productId}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Kod: {item.productCode}
                            </p>
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <span>Miktar: {item.quantity}</span>
                              <span>•</span>
                              <span>
                                Birim:{" "}
                                {fmt(item.unitPrice, previewData.currency)}
                              </span>
                              <span>•</span>
                              <span
                                className={
                                  item.inStock
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {item.stockStatus === "IN_STOCK"
                                  ? "Stokta"
                                  : item.stockStatus === "LOW_STOCK"
                                  ? "Az Stok"
                                  : item.stockStatus === "INSUFFICIENT_STOCK"
                                  ? "Yetersiz Stok"
                                  : "Stok Yok"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.discountAmount > 0 ? (
                              <div>
                                <div className="line-through text-gray-400 text-sm">
                                  {fmt(
                                    item.totalPrice + item.discountAmount,
                                    previewData.currency
                                  )}
                                </div>
                                <div className="font-semibold text-green-600">
                                  {fmt(item.totalPrice, previewData.currency)}
                                </div>
                                <div className="text-xs text-green-500">
                                  -
                                  {fmt(
                                    item.discountAmount,
                                    previewData.currency
                                  )}{" "}
                                  indirim
                                </div>
                              </div>
                            ) : (
                              <div className="font-semibold">
                                {fmt(item.totalPrice, previewData.currency)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {previewData.stockWarnings &&
                  previewData.stockWarnings.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-orange-800">
                        Stok Uyarıları
                      </h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
                          {previewData.stockWarnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                {previewData.discountAmount > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-800">
                      İndirim Bilgisi
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-green-700">
                        <p className="font-medium">
                          {previewData.discountDescription}
                        </p>
                        <p className="mt-1">
                          <strong>İndirim Tutarı:</strong>{" "}
                          {fmt(
                            previewData.discountAmount,
                            previewData.currency
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Tutar Hesabı
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Ara Toplam:</span>
                      <span className="font-medium">
                        {fmt(previewData.subtotal, previewData.currency)}
                      </span>
                    </div>
                    {previewData.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>İndirim:</span>
                        <span className="font-medium">
                          -
                          {fmt(
                            previewData.discountAmount,
                            previewData.currency
                          )}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Toplam:</span>
                      <span className="text-qred">
                        {fmt(previewData.totalAmount, previewData.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 p-6 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewData(null);
                  }}
                  disabled={creatingOrder}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={creatingOrder}
                  className="flex-1 px-4 py-2 bg-qh2-green text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {creatingOrder ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sipariş Oluşturuluyor...
                    </>
                  ) : (
                    "Siparişi Oluştur"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
