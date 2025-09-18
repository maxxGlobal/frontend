// src/pages/homepage/BasketDetail/my-orders.tsx
import { useEffect, useState } from "react";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { listMyOrders } from "../../../services/orders/my-orders";
import { Helmet } from "react-helmet-async";
import type {
  OrderResponse,
  PageResponse,
} from "../../../types/order";
import "../../../theme.css";
import "../../../assets/homepage.css";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const MIN_LOADER = 1000;
    const start = Date.now();

    async function loadOrders() {
      try {
        setOrders(null);
        setError(null);

        const res: PageResponse<OrderResponse> = await listMyOrders(
          0,
          20,
          controller.signal
        );
        
        // ✅ Backend artık primaryImageUrl'i direkt gönderiyor, 
        // ekstra API çağrısı yapmaya gerek yok
        const content = res?.content ?? [];

        const elapsed = Date.now() - start;
        const remain = Math.max(0, MIN_LOADER - elapsed);
        setTimeout(() => setOrders(content), remain);
      } catch (err: any) {
        if (err?.name !== "AbortError" && err?.code !== "ERR_CANCELED") {
          setError("Siparişler alınırken hata oluştu.");
        }
      }
    }

    loadOrders();
    return () => controller.abort();
  }, []);

  if (orders === null && !error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh] text-red-500">
          {error}
        </div>
      </Layout>
    );
  }

  if (orders && orders.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh] text-gray-500">
          Henüz siparişiniz yok.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Medintera – Geçmiş Siparişler</title>
        <meta name="description" content="Geçmiş Siparişler" />
      </Helmet>
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
                {order.items.map((item) => (
                  <div key={item.productId} className="flex py-3 items-center">
                    <div className="w-16 h-16 mr-4 border border-gray-200 rounded overflow-hidden">
                      {item.primaryImageUrl ? (
                        <img
                          src={item.primaryImageUrl}
                          alt={item.productName}
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
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} ×{" "}
                        {item.unitPrice.toLocaleString("tr-TR", {
                          style: "currency",
                          currency: order.currency || "TRY",
                        })}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {item.totalPrice.toLocaleString("tr-TR", {
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