import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  getUnreadCount,
  getNotificationSummary,
  markAllNotificationsRead,
} from "../../services/notifications/header";
import type { NotificationSummary } from "../../types/notifications";

const MySwal = withReactContent(Swal);

const qkUnread = ["notifications", "unreadCount"];
const qkSummary = ["notifications", "summary"];

export default function HeaderBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const unreadQ = useQuery({
    queryKey: qkUnread,
    queryFn: () => getUnreadCount(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const summaryQ = useQuery({
    queryKey: qkSummary,
    queryFn: () => getNotificationSummary(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const unread = unreadQ.data ?? 0;
  const summary: NotificationSummary | undefined = summaryQ.data;

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      await MySwal.fire(
        "Tamam",
        "Tüm bildirimler okundu olarak işaretlendi.",
        "success"
      );
      // sayıları/özeti tazele
      qc.invalidateQueries({ queryKey: qkUnread });
      qc.invalidateQueries({ queryKey: qkSummary });
    } catch (e: any) {
      await MySwal.fire("Hata", e?.message ?? "İşlem başarısız", "error");
    }
  }

  return (
    <div className="sherah-header__dropmenu" ref={boxRef}>
      {/* Zil butonu */}
      <button
        type="button"
        className="btn p-0 border-0 bg-transparent"
        onClick={() => setOpen((s) => !s)}
        aria-label="Bildirimler"
      >
        {/* Aynı SVG'yi kullandım; dilersen değiştir */}
        <svg
          className="sherah-offset__fill"
          id="Icon"
          xmlns="http://www.w3.org/2000/svg"
          width="22.875"
          height="25.355"
          viewBox="0 0 22.875 25.355"
        >
          <g transform="translate(0 0)">
            <path
              d="M37.565,16.035V11.217a8.43,8.43,0,0,0-5.437-7.864,2.865,2.865,0,0,0,.057-.56,2.79,2.79,0,1,0-5.58,0,2.994,2.994,0,0,0,.053.544,8.17,8.17,0,0,0-5.433,7.7v4.993a.324.324,0,0,1-.323.323,2.932,2.932,0,0,0-2.933,2.585,2.862,2.862,0,0,0,2.847,3.141h4.926a3.674,3.674,0,0,0,7.3,0h4.926a2.869,2.869,0,0,0,2.116-.937,2.9,2.9,0,0,0,.731-2.2,2.935,2.935,0,0,0-2.933-2.585A.321.321,0,0,1,37.565,16.035ZM29.4,1.636a1.158,1.158,0,0,1,1.156,1.157,1,1,0,0,1-.016.155,7.23,7.23,0,0,0-.841-.078,8.407,8.407,0,0,0-1.438.082A1,1,0,0,1,28.24,2.8,1.159,1.159,0,0,1,29.4,1.636Zm0,22.083a2.05,2.05,0,0,1-2-1.636h4A2.05,2.05,0,0,1,29.4,23.719ZM39.2,19.1a1.222,1.222,0,0,1-1.221,1.349H20.818A1.228,1.228,0,0,1,19.6,19.1a1.284,1.284,0,0,1,1.307-1.1,1.961,1.961,0,0,0,1.957-1.959V11.042A6.542,6.542,0,0,1,29.4,4.5c.082,0,.159,0,.241,0a6.687,6.687,0,0,1,6.295,6.715v4.817a1.961,1.961,0,0,0,1.957,1.959A1.287,1.287,0,0,1,39.2,19.1Z"
              transform="translate(-17.958 0)"
            />
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
        <div className="sherah-dropdown-card sherah-dropdown-card__alarm sherah-border">
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
              strokeWidth="1"
            />
          </svg>

          <div className="d-flex align-items-center justify-content-between">
            <h3 className="sherah-dropdown-card__title sherah-border-btm mb-0">
              Bildirim Özeti
            </h3>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  unreadQ.refetch();
                  summaryQ.refetch();
                }}
              >
                Yenile
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleMarkAll}
              >
                Tümünü okundu işaretle
              </button>
            </div>
          </div>

          {summaryQ.isLoading || unreadQ.isLoading ? (
            <div className="p-3 text-center">
              <div className="spinner-border spinner-border-sm" role="status" />
            </div>
          ) : summaryQ.isError ? (
            <div className="p-3 text-danger small">Özet yüklenemedi.</div>
          ) : (
            <ul className="sherah-dropdown-card_list">
              <SummaryRow label="Toplam" value={summary?.totalCount ?? 0} />
              <SummaryRow
                label="Okunmamış"
                value={summary?.unreadCount ?? 0}
                strong
              />
              <SummaryRow label="Okunmuş" value={summary?.readCount ?? 0} />
              <SummaryRow label="Arşiv" value={summary?.archivedCount ?? 0} />
              <SummaryRow label="Bugün" value={summary?.todayCount ?? 0} />

              <SummaryRow
                label="Bu Hafta"
                value={summary?.thisWeekCount ?? 0}
              />
              <SummaryRow
                label="Öncelikli (Okunmamış)"
                value={summary?.highPriorityUnreadCount ?? 0}
              />
            </ul>
          )}

          {/* alt kısım (opsiyonel link) */}
          <div className="sherah-dropdown-card__button">
            <a className="sherah-dropdown-card__sell-all" href="/notifications">
              Tüm bildirimleri gör
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <li className="py-1 px-2 d-flex align-items-center justify-content-between">
      <span className="small">{label}</span>
      <span className={`small ${strong ? "fw-bold" : ""}`}>{value}</span>
    </li>
  );
}
