// src/pages/homepage/FlashSale/index.tsx
import { useEffect, useState, useMemo } from "react";
import Layout from "../Partials/Layout";
import { listDiscountsByDealer } from "../../../services/discounts/list-by-dealer";
import type { Discount } from "../../../types/discount";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import PageTitle from "../Helpers/PageTitle";
import type { Crumb } from "../Helpers/PageTitle";
import { Helmet } from "react-helmet-async";
import "../../../theme.css";
import "../../../assets/homepage.css";

const crumbs: Crumb[] = [
  { name: "home", path: "/homepage" },
  { name: "İndirimler", path: "/homepage/flash-sale" },
];

function fmt(amount: number, currency?: string | null) {
  try {
    return amount.toLocaleString("tr-TR", {
      style: "currency",
      currency: currency || "TRY",
    });
  } catch {
    return `${amount.toFixed(2)} ${currency ?? "TRY"}`.trim();
  }
}

function isPercentageDiscount(discountType: any): boolean {
  if (typeof discountType === "object" && discountType !== null) {
    const typeValue = discountType.name || discountType.value || discountType;
    return typeValue === "PERCENTAGE" || typeValue === "Yüzdesel";
  }

  const typeStr = discountType?.toString() || "";
  return (
    typeStr === "PERCENTAGE" ||
    typeStr === "Yüzdesel" ||
    typeStr === "PERCENT" ||
    typeStr.toLowerCase().includes("percent") ||
    typeStr.toLowerCase().includes("yüzde")
  );
}

// Ürün Modal component'i
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Array<{
    id: number;
    name: string;
    code: string;
    categoryName: string;
  }>;
  discountName: string;
}

function ProductModal({
  isOpen,
  onClose,
  products,
  discountName,
}: ProductModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm md:backdrop-blur transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {discountName} - Geçerli Ürünler ({products.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Bu indirim için ürün bulunamadı.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-mono">{product.code}</span> •{" "}
                      {product.categoryName}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      İndirimli
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlashSale() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealerCurrency, setDealerCurrency] = useState<string>("TRY");
  const [selectedDiscountProducts, setSelectedDiscountProducts] = useState<{
    products: Array<{
      id: number;
      name: string;
      code: string;
      categoryName: string;
    }>;
    discountName: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const MIN_LOADER_TIME = 800;
    const start = Date.now();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        const dealerId = user?.dealer?.id;
        const currency = user?.dealer?.preferredCurrency || "TRY";

        setDealerCurrency(currency);

        if (!dealerId) {
          setError(
            "Bayi bilgisi bulunamadı. Lütfen giriş yapmayı kontrol edin."
          );
          return;
        }
        const discountList = await listDiscountsByDealer(dealerId);
        const activeDiscounts = discountList.filter(
          (d) => d.isActive === true && !d.isExpired && !d.isNotYetStarted
        );
        setDiscounts(activeDiscounts);
      } catch (e: any) {
        if (e?.name !== "AbortError" && e?.code !== "ERR_CANCELED") {
          setError("İndirimli ürünler getirilemedi. Lütfen sayfayı yenileyin.");
        }
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
        setTimeout(() => setLoading(false), remaining);
      }
    })();

    return () => controller.abort();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Discount[]>();
    discounts.forEach((d) => {
      if (!map.has(d.name)) map.set(d.name, []);
      map.get(d.name)!.push(d);
    });

    return Array.from(map.entries()).map(([_, list]) => {
      const base = list[0];
      return {
        ...base,
        allProducts: list.flatMap((x) => x.applicableProducts || []),
        totalUsage: list.reduce((sum, x) => sum + (x.usageCount || 0), 0),
      };
    });
  }, [discounts]);

  const getDiscountBadgeColor = (discount: any) => {
    const now = new Date();
    const endDate = new Date(discount.endDate);
    const daysLeft = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 3) return "bg-red-500";
    if (daysLeft <= 7) return "bg-orange-500";
    return "bg-green-500";
  };

  const getDaysLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 0) return "Süresi dolmuş";
    if (daysLeft === 1) return "1 gün kaldı";
    if (daysLeft <= 7) return `${daysLeft} gün kaldı`;
    return `${daysLeft} gün kaldı`;
  };

  const handleShowProducts = (discount: any) => {
    setSelectedDiscountProducts({
      products: discount.allProducts || [],
      discountName: discount.name,
    });
  };

  const handleCloseModal = () => {
    setSelectedDiscountProducts(null);
  };

  if (loading) {
    return (
      <Layout>
        <Helmet>
          <title>Medintera – Bayi İndirimleri</title>
          <meta name="description" content="Bayi İndirimleri" />
        </Helmet>
        <div className="flex justify-center items-center w-full h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <Helmet>
        <title>Medintera – Bayi İndirimleri</title>
        <meta name="description" content="Bayi İndirimleri" />
      </Helmet>
      <div className="w-full">
        <div className="title-area w-full">
          <PageTitle title="Bayi İndirimleri" breadcrumb={crumbs} />
        </div>

        <div className="container-x mx-auto py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!error && grouped.length > 0 && (
            <>
              <div className="grid lg:grid-cols-1 gap-6">
                {grouped.map((discount) => (
                  <div
                    key={discount.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`${getDiscountBadgeColor(
                              discount
                            )} text-white px-4 py-2 rounded-full text-lg font-bold`}
                          >
                            {(() => {
                              const isPercentage = isPercentageDiscount(
                                discount.discountType
                              );

                              return isPercentage
                                ? `%${discount.discountValue}`
                                : fmt(discount.discountValue, dealerCurrency);
                            })()}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {discount.name}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {discount.description ||
                                "Özel indirim kampanyası"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              getDaysLeft(discount.endDate).includes("dolmuş")
                                ? "bg-red-100 text-red-800"
                                : getDaysLeft(discount.endDate).includes(
                                    "1 gün"
                                  ) ||
                                  getDaysLeft(discount.endDate).includes(
                                    "2 gün"
                                  ) ||
                                  getDaysLeft(discount.endDate).includes(
                                    "3 gün"
                                  )
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {getDaysLeft(discount.endDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            {/* Geçerli Ürün - modal ile */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-2xl font-bold text-gray-900">
                                    {discount.allProducts?.length || 0}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Geçerli Ürün
                                  </div>
                                </div>
                                {discount.allProducts?.length > 0 && (
                                  <button
                                    onClick={() => handleShowProducts(discount)}
                                    className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                  >
                                    Ürünleri Görüntüle
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {discount.minimumOrderAmount && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 text-blue-500 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm text-blue-700">
                                  Minimum sipariş tutarı:{" "}
                                  <strong>
                                    {fmt(
                                      discount.minimumOrderAmount,
                                      dealerCurrency
                                    )}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          )}

                          {discount.maximumDiscountAmount && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 text-purple-500 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm text-purple-700">
                                  Maksimum indirim:{" "}
                                  <strong>
                                    {fmt(
                                      discount.maximumDiscountAmount,
                                      dealerCurrency
                                    )}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Kampanya Tarihleri
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Başlangıç:
                                </span>
                                <span className="font-medium">
                                  {new Date(
                                    discount.startDate
                                  ).toLocaleDateString("tr-TR")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Bitiş:</span>
                                <span className="font-medium">
                                  {new Date(
                                    discount.endDate
                                  ).toLocaleDateString("tr-TR")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {discount.usageLimit && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                  Kullanım Durumu
                                </span>
                                <span className="text-xs text-gray-500">
                                  {discount.totalUsage || 0} /{" "}
                                  {discount.usageLimit}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((discount.totalUsage || 0) /
                                        discount.usageLimit) *
                                        100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Product Modal */}
              <ProductModal
                isOpen={selectedDiscountProducts !== null}
                onClose={handleCloseModal}
                products={selectedDiscountProducts?.products || []}
                discountName={selectedDiscountProducts?.discountName || ""}
              />
            </>
          )}

          {!error && grouped.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  ></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz indirim bulunmuyor
                </h3>
                <p className="text-gray-600">
                  Bu bayi için aktif indirim kampanyası bulunmamaktadır.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
