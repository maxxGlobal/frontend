import { useEffect, useState } from "react";
import { listNotifications } from "../../../services/notifications/list";
import type { NotificationRow } from "../../../types/notifications";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import "../../../theme.css";
import "../../../assets/homepage.css";

export default function NotificationsPage() {
  // null = daha yüklenmedi (loader göster)
  const [items, setItems] = useState<NotificationRow[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await listNotifications({ signal: controller.signal });
        const content = Array.isArray(res?.content) ? res.content : [];
        setItems(content); // yüklendi (boş da olabilir, dolu da)
      } catch (err: any) {
        // iptal ise sessizce çık
        if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
        console.error("Bildirimler alınırken hata:", err);
        setItems([]); // hata durumunda “boş” göster
      }
    })();

    return () => controller.abort();
  }, []);

  // 1) Daha yüklenmedi -> sadece loader
  if (items === null) {
    return (
      <Layout>
        <div className="flex justify-center items-center w-full h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  // 2) Yüklendikten sonra: boşsa mesaj, doluysa liste
  return (
    <Layout>
      <div className="cart-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full">
          <PageTitle
            title="Bildirimlerim"
            breadcrumb={[
              { name: "home", path: "/homepage" },
              { name: "homepage", path: "/homepage" },
            ]}
          />
        </div>

        <div className="w-full mt-[23px]">
          <div className="container-x mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {items.length === 0 ? (
                <div className="text-center text-gray-500">
                  Görüntülenecek bildirim yok.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className="py-4 px-2 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {n.title}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {n.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 mt-2 sm:mt-0 sm:ml-4">
                        {new Date(n.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
