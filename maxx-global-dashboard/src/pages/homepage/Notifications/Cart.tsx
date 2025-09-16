import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { listNotifications } from "../../../services/notifications/list";
import { markAllNotificationsRead } from "../../../services/notifications/header";
import type { NotificationRow } from "../../../types/notifications";

const MySwal = withReactContent(Swal);

type NotificationBoxProps = { className?: string; type?: number };

export default function NotificationBox({
  className,
  type,
}: NotificationBoxProps) {
  const qc = useQueryClient();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Bildirimleri getir
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await listNotifications({ signal: controller.signal });
        setItems(res.content ?? []);
      } catch (err: any) {
        if (err?.code !== "ERR_CANCELED") console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // 🔑 Tümünü okundu işaretle
  const handleMarkAll = async () => {
    const confirm = await MySwal.fire({
      title: "Tümünü Oku?",
      text: "Tüm bildirimleri okundu olarak işaretlemek istiyor musunuz?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "Vazgeç",
    });

    if (!confirm.isConfirmed) return;

    try {
      setUpdating(true);
      await markAllNotificationsRead(); // backend API çağrısı

      // local state'i güncelle ve gri görünüm ver
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));

      // Middlebar’daki bildirimi sıfırlamak için query invalidate
      qc.invalidateQueries({ queryKey: ["notificationCount"] });

      await MySwal.fire(
        "Tamam",
        "Tüm bildirimler okundu olarak işaretlendi.",
        "success"
      );
    } catch (err: any) {
      await MySwal.fire("Hata", err?.message ?? "İşlem başarısız", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 text-center ${className || ""}`}>Yükleniyor…</div>
    );
  }

  return (
    <div
      style={{ boxShadow: "0px 15px 50px 0px rgba(0,0,0,0.14)" }}
      className={`w-[300px] bg-white border-t-[3px] rounded-xl overflow-hidden ${
        type === 3 ? "border-qh3-blue" : "cart-wrapper"
      } ${className || ""}`}
    >
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        {items.length > 0 && (
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
            <h3 className="text-qblack font-semibold">Bildirimler</h3>
            <button
              onClick={handleMarkAll}
              disabled={updating}
              className="np-icon-btn text-qh2-green hover:text-green-700 transition"
              title="Tümünü okundu işaretle"
            >
              ✓
            </button>
          </div>
        )}

        {/* Liste */}
        <div className="product-items max-h-[310px] overflow-y-auto">
          {items.length === 0 && (
            <div className="p-4 text-center text-gray-500">Bildirim yok</div>
          )}
          <ul>
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 transition ${
                  n.isRead ? "bg-gray-50 text-gray-500" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col w-full">
                  <p className="text-[13px] font-semibold leading-4 line-clamp-2">
                    {n.title}
                  </p>
                  <span className="text-qh2-green text-[12px]">
                    {n.message}
                  </span>
                  <span className="text-gray-500 text-[11px] mt-1">
                    {new Date(n.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 mt-4 border-t border-gray-200 pt-4">
            <Link to="/homepage/notifications">
              <div className="bg-yellow-500 text-white w-full h-[45px] flex items-center justify-center rounded-md">
                <span>Tüm Bildirimleri Gör</span>
              </div>
            </Link>
          </div>
        )}
        <div className="px-4 mt-4 border-t border-gray-200 py-3 text-center">
          <p className="text-[13px] font-medium text-qgray">
            <span className="text-qblack">Tüm bildirimleri </span>görmek için
            Tüm Bildirimleri Gör butonuna tıklayınız.
          </p>
        </div>
      </div>
    </div>
  );
}
