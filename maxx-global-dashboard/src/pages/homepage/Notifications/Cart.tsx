import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listNotifications } from "../../../services/notifications/list";
import type { NotificationRow } from "../../../types/notifications";

type NotificationBoxProps = {
  className?: string;
  type?: number;
};

export default function NotificationBox({
  className,
  type,
}: NotificationBoxProps) {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await listNotifications({ signal: controller.signal });
        setItems(res.content ?? []);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

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
        <div className="product-items max-h-[310px] overflow-y-auto">
          {items.length === 0 && (
            <div className="p-4 text-center text-gray-500">Bildirim yok</div>
          )}
          <ul>
            {items.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="flex flex-col w-full">
                  <p className="text-[13px] font-semibold text-qblack leading-4 line-clamp-2">
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

        {items.length > 0 && (
          <>
            <div className="px-4 mt-4 border-t border-gray-200 pt-4">
              <Link to="/homepage/notifications">
                <div className="bg-yellow-500 text-white w-full h-[45px] flex items-center justify-center rounded-md">
                  <span>Tüm Bildirimleri Gör</span>
                </div>
              </Link>
            </div>

            <div className="px-4 mt-4 border-t border-gray-200 py-3 text-center">
              <p className="text-[13px] font-medium text-qgray">
                Detay için
                <span className="text-qblack"> Tüm Bildirimleri Gör</span>{" "}
                butonuna tıklayınız.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
