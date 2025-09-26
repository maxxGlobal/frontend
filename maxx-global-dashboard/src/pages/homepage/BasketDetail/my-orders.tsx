// src/pages/homepage/BasketDetail/my-orders.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { listMyOrders } from "../../../services/orders/my-orders";
import { addToCart, clearCart } from "../../../services/cart/storage";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import type {
  OrderResponse,
  PageResponse,
} from "../../../types/order";
import "../../../theme.css";
import "../../../assets/homepage.css";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reorderingOrderId, setReorderingOrderId] = useState<number | null>(null);
  const navigate = useNavigate();

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

  // Siparişi tekrarlama fonksiyonu
  const handleReorder = async (order: OrderResponse) => {
    try {
      setReorderingOrderId(order.id);
      
      // Kullanıcıya onay sor
      const result = await Swal.fire({
        title: 'Siparişi Tekrarla',
        html: `
          <p><strong>${order.orderNumber}</strong> numaralı siparişinizi tekrarlamak istediğinizden emin misiniz?</p>
          <p class="text-sm text-gray-600 mt-2">Bu işlem mevcut sepetinizi temizleyecek ve bu siparişteki ${order.items.length} ürünü sepetinize ekleyecektir.</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Evet, Tekrarla',
        cancelButtonText: 'İptal',
        confirmButtonColor: '#059669',
        cancelButtonColor: '#6b7280'
      });

      if (!result.isConfirmed) {
        setReorderingOrderId(null);
        return;
      }

      // Sepeti temizle
      clearCart();

      // Her ürünü sepete ekle
      order.items.forEach(item => {
        addToCart(item.productId, item.quantity);
      });

      // Başarı mesajı göster
      await Swal.fire({
        icon: 'success',
        title: 'Sipariş Tekrarlandı!',
        text: `${order.items.length} ürün sepetinize eklendi. Sepet sayfasına yönlendiriliyorsunuz...`,
        timer: 2000,
        showConfirmButton: false
      });

      // Sepet sayfasına yönlendir
       navigate('/homepage/basket');

    } catch (error) {
      console.error('Sipariş tekrarlama hatası:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'Sipariş tekrarlanırken bir hata oluştu. Lütfen tekrar deneyiniz.',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setReorderingOrderId(null);
    }
  };

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
              className="border border-gray-200 rounded-lg shadow-sm p-5 bg-white hover:shadow-md transition relative"
            >
              {/* Sipariş başlığı ve Tekrarla butonu */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1">
                  <p className="font-semibold text-lg text-gray-800">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleString("tr-TR")} –{" "}
                    {order.dealerName}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  {/* Sipariş durumu */}
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
                  
                  {/* Siparişi Tekrarla butonu */}
                  <button
                    onClick={() => handleReorder(order)}
                    disabled={reorderingOrderId === order.id}
                    className="flex items-center gap-2 px-3 py-2 bg-qh2-green text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Bu siparişi tekrarla"
                  >
                    {reorderingOrderId === order.id ? (
                      <>
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Siparişi Tekrarla
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex py-3 items-center">
                    {/* Ürün görseli - tıklanabilir */}
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
                          No Image
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1">
                      {/* Ürün adı - tıklanabilir */}
                      <Link
                        to={`/homepage/product/${item.productId}`}
                        className="text-sm font-medium text-gray-800 hover:text-qh2-green hover:underline transition-colors block"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
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