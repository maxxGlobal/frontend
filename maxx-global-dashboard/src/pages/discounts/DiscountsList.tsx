// src/pages/discounts/DiscountsList.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { listDiscounts } from "../../services/discounts/list";
import { restoreDiscount } from "../../services/discounts/restore";
import { searchDiscounts } from "../../services/discounts/search";
import type { Discount, PageResponse } from "../../types/discount";
import EditDiscountModal from "./components/EditDiscountModal";
import DeleteDiscountModal from "./components/DeleteDiscountModal";

export default function DiscountsList() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<Discount> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const size = 30;
  // Search & sort state
  const [q, setQ] = useState("");

  // Modal state
  const [editTarget, setEditTarget] = useState<Discount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);

  async function loadData(p = 0) {
    try {
      setLoading(true);
      const query = q.trim();
      const res =
        query.length >= 2
          ? await searchDiscounts(query, p, size)
          : await listDiscounts(p, size);
      setPageData(res);
      setPage(res.number ?? p);
    } catch {
      Swal.fire("Hata", "İndirimler yüklenemedi", "error");
      setPageData({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: 0,
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true,
      });
      setPage(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const query = q.trim();

    // boşsa normal listeye dön
    if (query.length === 0) {
      const t = setTimeout(() => loadData(0), 0);
      return () => clearTimeout(t);
    }

    // min 2 karakter şartı
    if (query.length < 2) return;

    const t = setTimeout(() => loadData(0), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function handleRestore(id: number) {
    const result = await Swal.fire({
      title: "Geri Yükle",
      text: "Bu indirim geri yüklenecek. Onaylıyor musunuz?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, geri yükle",
      cancelButtonText: "Vazgeç",
    });
    if (!result.isConfirmed) return;

    try {
      await restoreDiscount(id);
      await Swal.fire("Başarılı", "İndirim geri yüklendi", "success");
      loadData(page);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Geri yükleme yapılamadı";
      Swal.fire("Hata", msg, "error");
    }
  }

  const hasRows =
    !!pageData &&
    Array.isArray(pageData.content) &&
    pageData.content.length > 0;

  function nextPage() {
    if (pageData?.last) return;
    loadData(page + 1);
  }

  function prevPage() {
    if (page <= 0 || pageData?.first) return;
    loadData(page - 1);
  }

  const isPassive = (d: Discount) => {
    const st = (d.status ?? "").toString().toUpperCase();
    return (
      st === "PASSIVE" ||
      st === "PASİF" ||
      st === "PASIF" ||
      d.isActive === false
    );
  };

  // ---- helpers: rozetler ----
  function namesFrom<T extends { id: number; name?: string }>(arr?: T[]) {
    const list = Array.isArray(arr) ? arr : [];
    return list.map((x) => (x.name?.trim() ? x.name : `#${x.id}`));
  }
  function renderBadges<T extends { id: number; name?: string }>(
    arr?: T[],
    max = 3
  ) {
    const all = namesFrom(arr);
    const shown = all.slice(0, max);
    const rest = all.slice(max);
    const restTitle = rest.join(", ");

    return (
      <div className="d-flex flex-wrap gap-1" title={all.join(", ")}>
        {shown.map((n, i) => (
          <span key={i} className="badge bg-info text-dark">
            {n}
          </span>
        ))}
        {rest.length > 0 && (
          <span className="badge bg-secondary" title={restTitle}>
            +{rest.length}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="sherah-page-inner sherah-default-bg sherah-border p-4">
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <h2 className="mb-0">İndirimler</h2>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/discounts/new")}
          >
            + Yeni İndirim
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/discounts/calculate")}
          >
            İndirim Hesapla
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/discounts/upcoming")}
          >
            Yaklaşan İndirimler
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/discounts/by-product")}
          >
            Ürüne Göre İndirimler
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/discounts/expired")}
          >
            Süresi Dolmuş
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/discounts/by-dealer")}
          >
            Bayiye Göre İndirimler
          </button>
        </div>
      </div>
      {/* Search toolbar */}
      <div className="card p-3 mb-3">
        <label className="form-label">Arama (min 2 karakter)</label>
        <input
          className="form-control"
          placeholder="ör. kış, bahar, kampanya..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q.trim().length > 0 && q.trim().length < 2 && (
          <div className="form-text text-danger mt-1">
            Arama için en az 2 karakter girin.
          </div>
        )}
      </div>
      {loading ? (
        <div className="text-center">Yükleniyor...</div>
      ) : hasRows ? (
        <>
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Ad</th>
                <th>Açıklama</th>
                <th>Tip</th>
                <th>Değer</th>
                <th>Ürünler</th>
                <th>Bayiler</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
                <th>Durum</th>
                <th style={{ width: 260 }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {pageData!.content.map((d) => {
                const passive = isPassive(d);
                return (
                  <tr
                    key={d.id}
                    className={passive ? "table-secondary" : undefined}
                  >
                    <td>{d.name}</td>
                    <td>{d.description ?? "-"}</td>
                    <td>{d.discountType}</td>
                    <td>
                      {d.discountType === "PERCENTAGE"
                        ? `%${d.discountValue}`
                        : `${d.discountValue} ₺`}
                    </td>
                    <td style={{ minWidth: 180 }}>
                      {renderBadges(d.applicableProducts, 3)}
                    </td>
                    <td style={{ minWidth: 180 }}>
                      {renderBadges(d.applicableDealers, 3)}
                    </td>
                    <td>
                      {d.startDate
                        ? new Date(d.startDate).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {d.endDate ? new Date(d.endDate).toLocaleString() : "-"}
                    </td>
                    <td>{d.status ?? (d.isActive ? "ACTIVE" : "PASSIVE")}</td>
                    <td>
                      {/* GÜNCELLE: modal aç */}
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => setEditTarget(d)}
                        title="Güncelle"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>

                      {/* SİL: modal aç (sadece aktiflerde) */}
                      {!passive && (
                        <button
                          className="btn btn-sm btn-danger me-2"
                          onClick={() => setDeleteTarget(d)}
                          title="Sil"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}

                      {/* RESTORE: sadece pasiflerde */}
                      {passive && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleRestore(d.id)}
                          title="Geri Yükle"
                        >
                          <i className="fa-solid fa-rotate-left"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Basit sayfalama */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              Sayfa: <strong>{(pageData?.number ?? 0) + 1}</strong> /{" "}
              <strong>{pageData?.totalPages ?? 1}</strong> • Kayıt:{" "}
              <strong>{pageData?.totalElements ?? 0}</strong>
            </div>
            <div>
              <button
                className="btn btn-outline-secondary me-2"
                disabled={pageData?.first}
                onClick={prevPage}
              >
                ‹ Önceki
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={pageData?.last}
                onClick={nextPage}
              >
                Sonraki ›
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info">Henüz indirim bulunamadı.</div>
      )}

      {/* Modals */}
      {editTarget && (
        <EditDiscountModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            loadData(page);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteDiscountModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            loadData(page);
          }}
        />
      )}
    </div>
  );
}
