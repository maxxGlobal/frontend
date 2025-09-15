// src/pages/MyOrdersPage/index.tsx
import { useEffect, useState } from "react";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { listMyOrders } from "../../../services/orders/my-orders";
import { listProductImages } from "../../../services/products/images/list";
import type {
  OrderResponse,
  OrderItem,
  PageResponse,
} from "../../../types/order";
import type { ProductImage } from "../../../types/product";
import "../../../theme.css";
import "../../../assets/homepage.css";

type OrderItemWithImage = OrderItem & { primaryImageUrl?: string | null };
type OrderWithImages = Omit<OrderResponse, "items"> & {
  items: OrderItemWithImage[];
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderWithImages[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const MIN_LOADER = 1000;
    const start = Date.now();

    async function loadOrders() {
      try {
        // ilk mount sırasında sıfırla
        setOrders(null);
        setError(null);

        const res: PageResponse<OrderResponse> = await listMyOrders(
          0,
          20,
          controller.signal
        );
        const content = res?.content ?? [];

        const withImages: OrderWithImages[] = await Promise.all(
          content.map(async (order) => {
            const items: OrderItemWithImage[] = await Promise.all(
              order.items.map(async (it) => {
                try {
                  const imgs: ProductImage[] = await listProductImages(
                    it.productId,
                    { signal: controller.signal }
                  );
                  const first = imgs.find((i) => i.isPrimary) ?? imgs[0];
                  return { ...it, primaryImageUrl: first?.imageUrl ?? null };
                } catch {
                  return { ...it, primaryImageUrl: null };
                }
              })
            );
            return { ...order, items };
          })
        );

        // Loader en az MIN_LOADER kadar görünsün
        const elapsed = Date.now() - start;
        const remain = Math.max(0, MIN_LOADER - elapsed);
        setTimeout(() => setOrders(withImages), remain);
      } catch (err: any) {
        // ❗ yalnızca gerçek hatalarda error set et
        if (err?.name !== "AbortError" && err?.code !== "ERR_CANCELED") {
          console.error("Siparişler alınırken hata:", err);
          setError("Siparişler alınırken hata oluştu.");
        }
      }
    }

    loadOrders();
    return () => controller.abort();
  }, []);

  // 🟢 1) Veri henüz yüklenmediyse yalnızca loader
  if (orders === null && !error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  // 🟢 2) Gerçek hata varsa
  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh] text-red-500">
          {error}
        </div>
      </Layout>
    );
  }

  // 🟢 3) Yükleme tamam ama sipariş yoksa
  if (orders && orders.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh] text-gray-500">
          Henüz siparişiniz yok.
        </div>
      </Layout>
    );
  }

  // 🟢 4) Siparişler listesi
  return (
    <Layout>
      <div className="w-full bg-white pb-10">
        <PageTitle
          title="Siparişlerim"
          breadcrumb={[
            { name: "home", path: "/homepage" },
            { name: "siparişlerim", path: "/homepage/my-orders" },
          ]}
        />
        <div className="container-x mx-auto mt-6 space-y-6">
          {orders!.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg shadow-sm p-5 bg-white hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <p className="font-semibold text-lg text-gray-800">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleString("tr-TR")} –{" "}
                    {order.dealerName}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.orderStatus === "TAMAMLANDI"
                      ? "bg-green-100 text-green-700"
                      : order.orderStatus.includes("IPTAL")
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((it) => (
                  <div key={it.productId} className="flex py-3 items-center">
                    <div className="w-16 h-16 mr-4 border border-gray-200 rounded overflow-hidden">
                      {it.primaryImageUrl ? (
                        <img
                          src={it.primaryImageUrl}
                          alt={it.productName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {it.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {it.quantity} ×{" "}
                        {it.unitPrice.toLocaleString("tr-TR", {
                          style: "currency",
                          currency: order.currency || "TRY",
                        })}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {it.totalPrice.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: order.currency || "TRY",
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <p className="font-semibold text-gray-900">
                  Toplam:{" "}
                  {order.totalAmount.toLocaleString("tr-TR", {
                    style: "currency",
                    currency: order.currency || "TRY",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
