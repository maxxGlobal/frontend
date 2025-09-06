import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { listSentNotifications } from "../../services/notifications/list";
import { listNotificationTypes } from "../../services/notifications/listTypes";

import type {
  NotificationType,
  NotificationRow,
} from "../../types/notifications";

const MySwal = withReactContent(Swal);

type TypeOpt = { value: string; label: string };

export default function AdminSentNotificationsList() {
  // filtreler
  const [q, setQ] = useState("");
  const [typeValue, setTypeValue] = useState<string>("");

  // sayfalama
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  // data
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // type options
  const [types, setTypes] = useState<NotificationType[]>([]);
  const typeOptions: TypeOpt[] = useMemo(
    () =>
      [{ value: "", label: "Tümü" }].concat(
        types
          .map((t) => ({
            value: t.name,
            label: t.displayName || t.name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, "tr"))
      ),
    [types]
  );

  const selectedType =
    typeOptions.find((t) => t.value === typeValue) || typeOptions[0];

  async function load() {
    try {
      setLoading(true);
      const res = await listSentNotifications({
        q: q.trim() || undefined,
        type: typeValue || undefined,
        page,
        size,
      });

      const content = Array.isArray((res as any).content)
        ? (res as any).content
        : (res as any).data?.content ?? [];
      const unique = Array.from(
        new Map(
          (content as NotificationRow[]).map((row) => [row.id, row])
        ).values()
      );
      setRows(unique);
      setTotalElements((res as any).totalElements ?? unique.length);
    } catch (e: any) {
      console.error(e);
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
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  function applyFilters() {
    setPage(0);
    load();
  }

  const totalPages = Math.ceil(totalElements / size) || 1;

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        {/* Başlık */}
        <div className="row align-items-center pb-3 mb-3">
          <div className="col-md-6 mb-2 mb-md-0">
            <h3 className="sherah-card__title m-0 fw-bold mt-5">
              Gönderilmiş Bildirimler
            </h3>
          </div>
        </div>

        {/* Filtre Bar */}
        <div className="card card-body mb-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Ara</label>
              <input
                style={{ height: 64 }}
                className="form-control"
                placeholder="Başlık / Mesaj"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tip</label>
              <Select<TypeOpt, false>
                options={typeOptions}
                value={selectedType}
                onChange={(opt) => setTypeValue(opt?.value ?? "")}
                isClearable={false}
              />
            </div>
            <div className="col-12 text-end">
              <button
                className="sherah-btn sherah-btn__primary"
                onClick={applyFilters}
              >
                Uygula
              </button>
            </div>
          </div>
        </div>

        {/* Tablo */}
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "200px" }}
          >
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Yükleniyor</span>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="alert alert-info m-3">Kayıt bulunamadı.</div>
        ) : (
          <>
            <table className="sherah-table__main sherah-table__main-v3 d-block overflow-y-scrolls">
              <thead className="sherah-table__head">
                <tr>
                  <th>Başlık </th>
                  <th>Mesaj</th>
                  <th>Tip</th>
                  <th>Öncelik</th>
                  <th>Oluşturma</th>
                  <th>Aksiyon</th>
                </tr>
              </thead>
              <tbody className="sherah-table__body">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-semibold">{r.title}</div>
                    </td>
                    <td>
                      {" "}
                      <div>{r.message}</div>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {r.typeDisplayName || r.type}
                      </span>
                    </td>
                    <td>{r.priority || "-"}</td>
                    <td>
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="d-flex justify-content-end">
                      {r.actionUrl ? (
                        <a
                          className="btn btn-sm btn-outline-secondary"
                          href={r.actionUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Aç
                        </a>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Sayfalama */}
            <div className="row align-items-center mt-3">
              <div className="col-sm-12 col-md-5">
                Toplam <strong>{totalElements.toLocaleString("tr-TR")}</strong>{" "}
                kayıt • Sayfa {page + 1} / {Math.max(1, totalPages)}
              </div>
              <div className="col-sm-12 col-md-7">
                <div className="dataTables_paginate paging_simple_numbers d-flex justify-content-end align-items-center gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={page <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    ‹ Önceki
                  </button>
                  <div className="small">
                    {page + 1} / {Math.max(1, totalPages)}
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Sonraki ›
                  </button>

                  <select
                    className="form-select form-select-sm ms-2"
                    style={{ width: 90 }}
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(0);
                    }}
                  >
                    {[10, 20, 50, 100].map((s) => (
                      <option key={s} value={s}>
                        {s}/sayfa
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
