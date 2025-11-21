// src/pages/notifications/AdminSentNotificationsList.tsx
import { useEffect, useState } from "react";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  deleteSentNotification,
  listSentNotifications,
} from "../../services/notifications/list";
import { listNotificationTypes } from "../../services/notifications/listTypes";

import type {
  NotificationType,
  NotificationRow,
} from "../../types/notifications";

const MySwal = withReactContent(Swal);

// type TypeOpt = { value: string; label: string };

// Öncelik -> TR
function trPriority(p?: string | null) {
  if (!p) return "-";
  switch (String(p).toUpperCase()) {
    case "HIGH":
      return "Yüksek";
    case "MEDIUM":
      return "Orta";
    case "LOW":
      return "Düşük";
    default:
      return p;
  }
}

export default function AdminSentNotificationsList() {
  // filtreler
  const [q, _setQ] = useState("");
  const [typeValue, _setTypeValue] = useState<string>("");

  // sayfalama
  const [page, setPage] = useState(0); // 0-tabanlı
  const [size, _setSize] = useState(20); // API için gerekli ama UI RolesList ile aynı

  // data
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // type options
  const [_types, setTypes] = useState<NotificationType[]>([]);
  // const typeOptions: TypeOpt[] = useMemo(
  //   () =>
  //     [{ value: "", label: "Tümü" }].concat(
  //       types
  //         .map((t) => ({
  //           value: t.name,
  //           label: t.displayName || t.name,
  //         }))
  //         .sort((a, b) => a.label.localeCompare(b.label, "tr"))
  //     ),
  //   [types]
  // );

  async function load() {
    try {
      setLoading(true);
      const res = await listSentNotifications({
        q: q.trim() || undefined,
        type: typeValue || undefined,
        page,
        size,
      });

      // sunucunun farklı zarf desenlerine tolerans
      const content = Array.isArray((res as any).content)
        ? (res as any).content
        : (res as any).data?.content ?? [];
      const te =
        (res as any).totalElements ??
        (res as any).data?.totalElements ??
        content.length;
      const tp =
        (res as any).totalPages ??
        (res as any).data?.totalPages ??
        Math.max(1, Math.ceil(te / size));

      // aynı id’leri tekilleştir (backend birden çok hedefe gidenleri çoğaltabiliyor)
      const unique = Array.from(
        new Map(
          (content as NotificationRow[]).map((row) => [row.id, row])
        ).values()
      );

      setRows(unique);
      setTotalElements(te);
      setTotalPages(tp);
    } catch (e: any) {
      MySwal.fire("Hata", e?.message || "Kayıtlar yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const tps = await listNotificationTypes();
        setTypes(
          [...tps].sort((a, b) =>
            (a.displayName || a.name).localeCompare(
              b.displayName || b.name,
              "tr"
            )
          )
        );
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  async function handleDelete(id: number) {
    const res = await MySwal.fire({
      title: "Emin misiniz?",
      text: "Bu bildirimi silmek üzeresiniz.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#d33",
    });

    if (!res.isConfirmed) return;

    try {
      await deleteSentNotification(id);
      await MySwal.fire("Başarılı", "Bildirim silindi.", "success");

      if (rows.length === 1 && page > 0) {
        setPage((p) => Math.max(0, p - 1));
      } else {
        await load();
      }
    } catch (e: any) {
      await MySwal.fire("Hata", e?.message || "Bildirim silinemedi", "error");
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        {/* Üst başlık: RolesList ile aynı düzen */}
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-6 py-4">
            <h3 className="sherah-card__title py-3">Gönderilmiş Bildirimler</h3>
          </div>

          {/* Sağda kompakt filtre paneli (RolesList’teki FilterPanel konumu) */}
          {/* <div className="col-sm-12 col-md-6 d-flex justify-content-end">
            <div className="d-flex gap-2" style={{ minWidth: 420 }}>
              <input
                className="form-control form-control-sm"
                placeholder="Ara (başlık / mesaj)"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
              <div style={{ width: 200 }}>
                <Select<TypeOpt, false>
                  options={typeOptions}
                  value={selectedType}
                  onChange={(opt) => setTypeValue(opt?.value ?? "")}
                  isClearable={false}
                  // react-select’i kompakt göstermek için
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 31,
                      height: 31,
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      paddingTop: 0,
                      paddingBottom: 0,
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      height: 31,
                    }),
                  }}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={applyFilters}>
                Uygula
              </button>
            </div>
          </div> */}
        </div>

        <div className="sherah-card__body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Yükleniyor</span>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="alert alert-info m-3">Kayıt bulunamadı.</div>
          ) : (
            <>
              {/* RolesList’teki içerik kabı */}
              <div className="sherah-page-inner sherah-default-bg sherah-border">
                <div className="table-responsive">
                  <table className="sherah-table__main sherah-table__main-v3">
                    <thead className="sherah-table__head">
                      <tr>
                        <th>Başlık</th>
                        <th>Mesaj</th>
                        <th>Tip</th>
                        <th>Öncelik</th>
                        <th>Oluşturma</th>
                        <th className="text-end">Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody className="sherah-table__body">
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <td className="fw-semibold">{r.title}</td>
                          <td>{r.message}</td>
                          <td>
                            <span className="badge bg-info">
                              {r.typeDisplayName || r.type}
                            </span>
                          </td>
                          <td>{trPriority(r.priority)}</td>
                          <td>
                            {r.createdAt
                              ? new Date(r.createdAt).toLocaleString("tr-TR")
                              : "-"}
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              {r.actionUrl ? (
                                <a
                                  className="btn btn-sm btn-outline-secondary"
                                  href={r.actionUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Aç
                                </a>
                              ) : null}

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(r.id)}
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination — RolesList ile birebir aynı markup/sınıflar */}
              <div className="row align-items-center mt-3">
                <div className="col-sm-12 col-md-5">
                  Toplam{" "}
                  <strong>{totalElements.toLocaleString("tr-TR")}</strong> kayıt
                  • Sayfa {page + 1} / {totalPages}
                </div>
                <div className="col-sm-12 col-md-7">
                  <div className="dataTables_paginate paging_simple_numbers">
                    <ul className="pagination">
                      <li
                        className={`paginate_button page-item previous ${
                          page === 0 ? "disabled" : ""
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

                      {Array.from({ length: totalPages }, (_, i) => (
                        <li
                          key={i}
                          className={`paginate_button page-item ${
                            i === page ? "active" : ""
                          }`}
                        >
                          <a
                            href="#"
                            className="page-link"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(i);
                            }}
                          >
                            {i + 1}
                          </a>
                        </li>
                      ))}

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
