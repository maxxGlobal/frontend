import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  getUnreadCount,
  getNotificationSummary,
  markAllNotificationsRead,
} from "../../services/notifications/header";
import api from "../../lib/api";
import type {
  NotificationSummary,
  NotificationRow,
} from "../../types/notifications";

const MySwal = withReactContent(Swal);

const qkUnread = ["notifications", "unreadCount"];
const qkSummary = ["notifications", "summary"];
const qkLatest = ["notifications", "latest"];

/** createdAt -> "x dk / x sa / x gün önce" */
function formatTimeAgo(iso?: string | null) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);

  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa`;

  const days = Math.floor(hrs / 24);
  return `${days} gün`;
}

/** Başlığın/Tipin ilk harfi (avatar için) */
function initialOf(n: NotificationRow) {
  const s = (n.typeDisplayName || n.type || n.title || "").trim();
  return s ? s.charAt(0).toUpperCase() : "•";
}

/** Tip/kategoriye göre avatar rengi (çok sade) */
function colorFor(n: NotificationRow) {
  const cat = (n.typeCategory || "").toLowerCase();
  if (cat.includes("order")) return "#3b82f6"; // mavi
  if (cat.includes("warn") || cat.includes("high")) return "#f59e0b"; // amber
  if (cat.includes("error")) return "#ef4444"; // kırmızı
  if (cat.includes("success")) return "#10b981"; // yeşil
  return "#6366f1"; // default indigo
}

export default function HeaderBell() {
  const qc = useQueryClient();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // dışarı tıklayınca kapat
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Sayfa değişimlerinde notification verilerini yenile
  useEffect(() => {
    // Sayfa her değiştiğinde bildirim verilerini background'da yenile
    const refreshNotifications = () => {
      qc.invalidateQueries({ queryKey: qkUnread });
      qc.invalidateQueries({ queryKey: qkSummary });
      qc.invalidateQueries({ queryKey: qkLatest });
    };

    // Sayfa yüklendiğinde bir kere çalıştır
    refreshNotifications();
  }, [location.pathname, qc]);

  // Bildirim kutusunu açtığında verileri yenile
  useEffect(() => {
    if (open) {
      qc.invalidateQueries({ queryKey: qkLatest });
    }
  }, [open, qc]);

  const unreadQ = useQuery({
    queryKey: qkUnread,
    queryFn: () => getUnreadCount(),
    staleTime: 5 * 60 * 1000, // 5 dakika fresh kalsin
    // refetchInterval kaldırıldı - manuel yenileyeceğiz
  });

  const summaryQ = useQuery({
    queryKey: qkSummary,
    queryFn: () => getNotificationSummary(),
    staleTime: 5 * 60 * 1000, // 5 dakika fresh kalsin
    // refetchInterval kaldırıldı
  });

  const latestQ = useQuery({
    queryKey: qkLatest,
    queryFn: async (): Promise<NotificationRow[]> => {
      const res = await api.get(`/notifications?page=0&size=5`);
      return res.data?.data?.content ?? [];
    },
    staleTime: 2 * 60 * 1000, // 2 dakika fresh kalsin
    // refetchInterval kaldırıldı
  });

  const unread = unreadQ.data ?? 0;
  const summary: NotificationSummary | undefined = summaryQ.data;
  const latest: NotificationRow[] = latestQ.data ?? [];

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      await MySwal.fire(
        "Tamam",
        "Tüm bildirimler okundu olarak işaretlendi.",
        "success"
      );
      // Tüm notification cache'lerini yenile
      qc.invalidateQueries({ queryKey: qkUnread });
      qc.invalidateQueries({ queryKey: qkSummary });
      qc.invalidateQueries({ queryKey: qkLatest });
    } catch (e: any) {
      await MySwal.fire("Hata", e?.message ?? "İşlem başarısız", "error");
    }
  }

  function handleOpen(n: NotificationRow) {
    if (n.actionUrl) {
      window.open(n.actionUrl, "_blank", "noopener,noreferrer");
      // Bildirime tıklandığında da verileri yenile (okundu durumu değişebilir)
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: qkUnread });
        qc.invalidateQueries({ queryKey: qkLatest });
      }, 1000);
    }
  }

  // Manuel yenileme butonu fonksiyonu
  const handleManualRefresh = () => {
    qc.invalidateQueries({ queryKey: qkUnread });
    qc.invalidateQueries({ queryKey: qkSummary });
    qc.invalidateQueries({ queryKey: qkLatest });
  };

  return (
    <div
      className={`sherah-header__dropmenu np ${open ? "is-open" : ""}`}
      ref={boxRef}
    >
      {/* Zil butonu — SVG'ye dokunmuyoruz */}
      <button
        type="button"
        className="btn p-0 border-0 bg-transparent shadow-none"
        aria-expanded={open}
        aria-label="Bildirimler"
        onClick={() => setOpen((s) => !s)}
      >
        <svg
          className="sherah-offset__fill"
          id="Icon"
          xmlns="http://www.w3.org/2000/svg"
          width="22.875"
          height="25.355"
          viewBox="0 0 22.875 25.355"
        >
          <g id="Group_7" data-name="Group 7" transform="translate(0 0)">
            <path
              id="Path_28"
              data-name="Path 28"
              d="M37.565,16.035V11.217a8.43,8.43,0,0,0-5.437-7.864,2.865,2.865,0,0,0,.057-.56,2.79,2.79,0,1,0-5.58,0,2.994,2.994,0,0,0,.053.544,8.17,8.17,0,0,0-5.433,7.7v4.993a.324.324,0,0,1-.323.323,2.932,2.932,0,0,0-2.933,2.585,2.862,2.862,0,0,0,2.847,3.141h4.926a3.674,3.674,0,0,0,7.3,0h4.926a2.869,2.869,0,0,0,2.116-.937,2.9,2.9,0,0,0,.731-2.2,2.935,2.935,0,0,0-2.933-2.585A.321.321,0,0,1,37.565,16.035ZM29.4,1.636a1.158,1.158,0,0,1,1.156,1.157,1,1,0,0,1-.016.155,7.23,7.23,0,0,0-.841-.078,8.407,8.407,0,0,0-1.438.082A1,1,0,0,1,28.24,2.8,1.159,1.159,0,0,1,29.4,1.636Zm0,22.083a2.05,2.05,0,0,1-2-1.636h4A2.05,2.05,0,0,1,29.4,23.719ZM39.2,19.1a1.222,1.222,0,0,1-1.221,1.349H20.818A1.228,1.228,0,0,1,19.6,19.1a1.284,1.284,0,0,1,1.307-1.1,1.961,1.961,0,0,0,1.957-1.959V11.042A6.542,6.542,0,0,1,29.4,4.5c.082,0,.159,0,.241,0a6.687,6.687,0,0,1,6.295,6.715v4.817a1.961,1.961,0,0,0,1.957,1.959A1.287,1.287,0,0,1,39.2,19.1Z"
              transform="translate(-17.958 0)"
            ></path>
          </g>
        </svg>

        {unread > 0 && (
          <span className="sherah-header__count sherah-color1__bg">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} />
          <div className="sherah-dropdown-card notifications-header sherah-dropdown-card__alarm sherah-border">
            <svg
              className="sherah-dropdown-arrow"
              xmlns="http://www.w3.org/2000/svg"
              width="43.488"
              height="22.207"
              viewBox="0 0 43.488 22.207"
            >
              <path
                d="M-15383,7197.438l20.555-20.992,20.555,20.992Z"
                transform="translate(15384.189 -7175.73)"
              />
            </svg>
            <div className="np-header sherah-border-btm">
              <h3 className="sherah-dropdown-card__title px-0 py-2">
                Bildirimler
              </h3>
              <div className="np-header-actions">
                <button
                  className="np-icon-btn text-primary"
                  onClick={handleManualRefresh}
                  title="Yenile"
                  disabled={latestQ.isFetching}
                >
                  {latestQ.isFetching ? "⟳" : "↻"}
                </button>
                <button
                  className="np-icon-btn text-success"
                  onClick={handleMarkAll}
                  title="Tümünü okundu işaretle"
                >
                  ✓
                </button>
              </div>
            </div>
            <ul className="sherah-dropdown-card_list notif-list">
              {latestQ.isLoading && (
                <li className="notif-loading">Yükleniyor…</li>
              )}

              {!latestQ.isLoading && latest.length === 0 && (
                <li className="notif-empty">Bildirim yok</li>
              )}

              {!latestQ.isLoading &&
                latest.map((n) => {
                  const unread = !n.isRead && n.notificationStatus !== "READ";
                  return (
                    <li
                      key={n.id}
                      className={`notif-item ${
                        unread ? "is-unread" : "is-read"
                      }`}
                      onClick={() => handleOpen(n)}
                      role={n.actionUrl ? "button" : undefined}
                      style={{ cursor: n.actionUrl ? "pointer" : "default" }}
                    >
                      <div className="d-flex gap-3">
                        <div
                          className="notif-avatar"
                          style={{ backgroundColor: colorFor(n) }}
                          aria-hidden
                        >
                          {initialOf(n)}
                        </div>

                        <div className="notif-body">
                          <div className="notif-title">{n.title}</div>
                          {n.message && (
                            <div className="notif-desc">{n.message}</div>
                          )}
                        </div>
                      </div>

                      <div className="notif-time">
                        {formatTimeAgo(n.createdAt)} önce
                      </div>
                    </li>
                  );
                })}
            </ul>
            <div className="sherah-dropdown-card__button mt-4">
              <a
                href="/my-notifications"
                className="sherah-dropdown-card__sell-all"
              >
                Tüm Bildirimleri Görüntele
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
