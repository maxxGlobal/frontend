// src/pages/notifications/MyNotificationsListPage.tsx
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  listMyNotifications,
  markMyNotificationRead,
  type MyNotifListRes,
} from "../../services/notifications/my";
import { markAllNotificationsRead } from "../../services/notifications/header";
import type { NotificationRow } from "../../types/notifications";

const MySwal = withReactContent(Swal);

/* ---------- helpers ---------- */

// TR öncelik metni
function trPriority(p?: string | null) {
  if (p === "HIGH") return "Yüksek";
  if (p === "MEDIUM") return "Orta";
  if (p === "LOW") return "Düşük";
  return "";
}

// önceliğe göre badge rengi (Bootstrap)
function chipForPriority(p?: string | null) {
  if (p === "HIGH") return "badge bg-danger py-0";
  if (p === "MEDIUM") return "badge bg-primary";
  if (p === "LOW") return "badge bg-secondary";
  return "badge bg-secondary";
}

// createdAt -> “x dk / x sa / x gün”
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

// sayfa penceresi (1-tabanlı)
function getPageWindow(current: number, total: number, span = 5) {
  const half = Math.floor(span / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + span - 1);
  start = Math.max(1, end - span + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function MyNotificationsListPage() {
  // sayfalama
  const [page, setPage] = useState(0); // 0-tabanlı
  const [size] = useState(10);

  // liste
  const qk = useMemo(
    () => ["myNotifications", { page, size }] as const,
    [page, size]
  );
  const listQ = useQuery<MyNotifListRes>({
    queryKey: qk,
    queryFn: () => listMyNotifications({ page, size }),
    placeholderData: (prev) => prev,
    staleTime: 15_000,
  });

  const rows: NotificationRow[] = listQ.data?.content ?? [];

  const totalPages = Math.max(1, listQ.data?.totalPages ?? 1);

  const qc = useQueryClient();

  async function handleMarkOne(id: number) {
    try {
      await markMyNotificationRead(id);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["myNotifications"] }),
        qc.invalidateQueries({ queryKey: ["notifications", "unreadCount"] }),
        qc.invalidateQueries({ queryKey: ["notifications", "summary"] }),
        qc.invalidateQueries({ queryKey: ["notifications", "latest"] }),
      ]);
    } catch (e: any) {
      await MySwal.fire("Hata", e?.message ?? "İşlem başarısız", "error");
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      await MySwal.fire(
        "Tamam",
        "Tüm bildirimler okundu olarak işaretlendi.",
        "success"
      );
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["myNotifications"] }),
        qc.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    } catch (e: any) {
      await MySwal.fire("Hata", e?.message ?? "İşlem başarısız", "error");
    }
  }

  return (
    <div className="container-fluid px-0 pt-5">
      {/* Üst başlık + toplu aksiyon */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <h3 className="sherah-card__title py-3 mb-0">Bildirimlerim</h3>
        <button className="btn btn-success" onClick={handleMarkAll}>
          Tümünü okundu işaretle
        </button>
      </div>

      {/* KART / LİSTE GÖRÜNÜMÜ */}
      <div className="card">
        {listQ.isLoading ? (
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Yükleniyor</span>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted py-5">Bildirim yok.</div>
        ) : (
          <ul className="list-group list-group-flush">
            {rows.map((n) => {
              const unread = !n.isRead && n.notificationStatus !== "READ";
              const absolute = n.createdAt
                ? new Date(n.createdAt).toLocaleString("tr-TR")
                : "-";
              return (
                <li
                  key={n.id}
                  className="list-group-item p-3"
                  style={{
                    background: unread ? "rgba(255,196,0,0.06)" : undefined,
                  }}
                >
                  <div className="d-flex gap-3 align-items-center">
                    {/* sol: durum noktası */}
                    <div className="pt-1">
                      <span
                        className="d-inline-block rounded-circle"
                        title={unread ? "Okunmamış" : "Okunmuş"}
                        style={{
                          width: 10,
                          height: 10,
                          background: unread ? "#f59e0b" : "#9ca3af",
                        }}
                      />
                    </div>

                    {/* orta: içerik */}
                    <div className="flex-grow-1 aligin-items-center">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className={unread ? "fw-bold" : ""}>{n.title}</div>

                        {/* sağ üst: “x dk/sa/gün önce” + tooltip’te tam tarih */}
                      </div>

                      {n.message && (
                        <div className={`small ${unread ? "" : "text-muted"}`}>
                          {n.message}
                        </div>
                      )}

                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className="badge bg-info">
                          {n.typeDisplayName || n.type}
                        </span>
                        {n.priority && (
                          <span className={chipForPriority(n.priority)}>
                            {trPriority(n.priority)}
                          </span>
                        )}
                        {unread ? (
                          <span className="badge bg-warning text-dark">
                            Okunmamış
                          </span>
                        ) : (
                          <span className="badge bg-secondary">Okunmuş</span>
                        )}
                      </div>
                    </div>

                    {/* sağ: aksiyonlar */}
                    <div className="d-flex flex-column gap-2 align-items-end">
                      {n.actionUrl ? (
                        <a
                          className="btn btn-sm btn-outline-secondary"
                          href={n.actionUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Aç
                        </a>
                      ) : null}

                      {unread ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleMarkOne(n.id)}
                        >
                          Okundu Olarak İşaretle
                        </button>
                      ) : (
                        <span className="text-muted small">Okundu</span>
                      )}
                      <small className="text-muted" title={absolute}>
                        {n.createdAt
                          ? `${formatTimeAgo(n.createdAt)} önce`
                          : "-"}
                      </small>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* DataTables stili sayfalama */}
      <div className="row align-items-center mt-3">
        <div className="col-sm-12 col-md-7">
          <div className="dataTables_paginate paging_simple_numbers justify-content-end">
            <ul className="pagination">
              {/* previous */}
              <li
                className={`paginate_button page-item previous ${
                  page <= 0 ? "disabled" : ""
                }`}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 0) setPage((p) => Math.max(0, p - 1));
                  }}
                >
                  <i className="fas fa-angle-left" />
                </a>
              </li>

              {/* page numbers */}
              {getPageWindow(page + 1, totalPages, 5).map((pn) => (
                <li
                  key={pn}
                  className={`paginate_button page-item ${
                    pn - 1 === page ? "active" : ""
                  }`}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pn - 1);
                    }}
                  >
                    {pn}
                  </a>
                </li>
              ))}

              {/* next */}
              <li
                className={`paginate_button page-item next ${
                  page + 1 >= totalPages ? "disabled" : ""
                }`}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page + 1 < totalPages) setPage((p) => p + 1);
                  }}
                >
                  <i className="fas fa-angle-right" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
