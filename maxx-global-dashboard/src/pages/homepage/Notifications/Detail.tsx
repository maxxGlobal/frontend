import { useEffect, useState } from "react";
import { listNotifications } from "../../../services/notifications/list";
import type { NotificationRow } from "../../../types/notifications";
import { markAllNotificationsRead } from "../../../services/notifications/header";
import Layout from "../Partials/Layout";
import PageTitle from "../Helpers/PageTitle";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { Helmet } from "react-helmet-async";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationRow[] | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await listNotifications({ signal: controller.signal });
        const content = Array.isArray(res?.content) ? res.content : [];
        setItems(content);
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
        setItems([]);
      }
    })();

    return () => controller.abort();
  }, []);
  const handleMarkAll = async () => {
    if (!items || items.length === 0) return;
    try {
      setUpdating(true);
      await markAllNotificationsRead();
      setItems((prev) => prev?.map((n) => ({ ...n, isRead: true })) ?? []);
    } finally {
      setUpdating(false);
    }
  };
  if (items === null) {
    return (
      <Layout>
        <div className="flex justify-center items-center w-full h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <Helmet>
        <title>Medintera – Bildirimler</title>
        <meta name="description" content="Bildirimler" />
      </Helmet>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Tüm Bildirimler
                </h2>
                {items.length > 0 && (
                  <button
                    onClick={handleMarkAll}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-qh2-green text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                  >
                    {updating ? "İşleniyor..." : "Tümünü Oku"}
                  </button>
                )}
              </div>
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
