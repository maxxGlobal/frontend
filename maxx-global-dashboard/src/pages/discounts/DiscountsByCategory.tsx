// src/pages/discounts/DiscountsByCategory.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { listAllCategories } from "../../services/categories/listAll";
import { listUpcomingDiscounts } from "../../services/discounts/upcoming";
import type { Discount } from "../../types/discount";
import type { CategoryRow } from "../../types/category";
import EditDiscountModal from "./components/EditDiscountModal";
import PopoverBadgeDealer from "../../components/popover/PopoverBadgeDealer";

// API servisleri (kategori bazlı indirimler için)
async function listDiscountsByCategory(categoryId: number): Promise<Discount[]> {
  // Bu servis henüz backend'de yoksa boş array döndür veya mock data kullan
  // Gerçek implementasyon için backend'e uygun endpoint eklenmelidir
  return [];
}

function dedupeById<T extends { id: number }>(arr: T[]): T[] {
  const map = new Map<number, T>();
  for (const x of arr) map.set(x.id, x);
  return Array.from(map.values());
}

function statusBadge(d: Discount) {
  const now = Date.now();
  const start = d.startDate ? new Date(d.startDate).getTime() : 0;
  const end = d.endDate ? new Date(d.endDate).getTime() : 0;

  if (d.isValidNow || (start <= now && now <= end)) {
    return <span className="badge bg-success">AKTİF</span>;
  }
  if (start > now) {
    return <span className="badge bg-warning text-dark">YAKLAŞAN</span>;
  }
  return <span className="badge bg-secondary">PASİF</span>;
}

export default function DiscountsByCategory() {
  const [categoryOpts, setCategoryOpts] = useState<CategoryRow[]>([]);
  const [optsLoading, setOptsLoading] = useState(true);

  const [categoryId, setCategoryId] = useState<string>("");
  const [includeUpcoming, setIncludeUpcoming] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Discount[]>([]);
  const [editTarget, setEditTarget] = useState<Discount | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOptsLoading(true);
        const categories = await listAllCategories();
        setCategoryOpts(categories);
      } catch {
        Swal.fire("Hata", "Kategori listesi yüklenemedi", "error");
      } finally {
        setOptsLoading(false);
      }
    })();
  }, []);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    const cid = Number(categoryId);
    if (!Number.isFinite(cid) || cid <= 0) {
      await Swal.fire("Uyarı", "Lütfen bir kategori seçiniz.", "warning");
      return;
    }

    try {
      setLoading(true);

      const active = await listDiscountsByCategory(cid);

      let merged = active;
      if (includeUpcoming) {
        const upcomingAll = await listUpcomingDiscounts();
        const upcomingFiltered = (upcomingAll ?? []).filter((d) => {
          const okCategory = Array.isArray((d as any).applicableCategories)
            ? (d as any).applicableCategories.some((c: any) => c.id === cid)
            : false;
          return okCategory;
        });
        merged = dedupeById<Discount>([...active, ...upcomingFiltered]);
      }

      setRows(merged);

      if (!merged?.length) {
        await Swal.fire(
          "Bilgi",
          includeUpcoming
            ? "Bu kategori için aktif ya da yaklaşan indirim bulunamadı."
            : "Bu kategori için şu anda geçerli indirim bulunamadı.",
          "info"
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "İndirimler getirilemedi";
      await Swal.fire("Hata", msg, "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const hasRows = rows.length > 0;
  const statusBadgeComponent = (s?: string | null) =>
    s === "AKTİF" ? (
      <div className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
        AKTİF
      </div>
    ) : (
      <div className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
        PASİF
      </div>
    );

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer mb-4">
        <div className="row align-items-center border-bottom pb-3 mb-3">
          <div className="col-md-6">
            <h3 className="sherah-card__title m-0 fw-bold">
              Kategoriye Göre İndirimler
            </h3>
          </div>
          <div className="col-md-6 d-flex flex-wrap justify-content-md-end gap-2 mt-4">
            <Link to="/discounts-list" className="sherah-btn sherah-gbcolor">
              ← İndirim Listesi
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleFetch} className="card p-3 mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-8">
            <label className="form-label">Kategori *</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={optsLoading}
              required
            >
              <option value="">— Kategori seçin —</option>
              {categoryOpts.map((c) => (
                <option key={c.id} value={c.id}>
                  {(c as any).label || c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 d-flex">
            <button
              style={{ height: 50 }}
              type="submit"
              className="sherah-btn sherah-btn__secondary"
              disabled={optsLoading || loading || !categoryId}
            >
              {loading ? "Yükleniyor..." : "Getir"}
            </button>
          </div>

          <div className="col-12">
            <div className="form-check mt-2">
              <input
                id="incUpcomingCategory"
                className="form-check-input"
                type="checkbox"
                checked={includeUpcoming}
                onChange={(e) => setIncludeUpcoming(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="incUpcomingCategory">
                Yaklaşan indirimleri de göster
              </label>
            </div>
          </div>
        </div>
      </form>

      {/* Tablo */}
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "300px" }}
        >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      ) : hasRows ? (
        <>
          <table className="sherah-table__main sherah-table__main-v3 d-block overflow-y-scrolls">
            <thead className="sherah-table__head">
              <tr>
                <th>Ad</th>
                <th>Tip</th>
                <th>Değer</th>
                <th>Bayiler</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody className="sherah-table__body">
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="sherah-table__product-content">
                      <p className="sherah-table__product-desc">{d.name}</p>
                    </div>
                  </td>
                  <td>{d.discountType}</td>
                  <td>
                    {d.discountType === "PERCENTAGE"
                      ? `%${d.discountValue}`
                      : `${d.discountValue} ₺`}
                  </td>
                  <td>
                    {d.applicableDealers?.length ? (
                      <PopoverBadgeDealer items={d.applicableDealers} />
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {d.startDate ? new Date(d.startDate).toLocaleString() : "-"}
                  </td>
                  <td>
                    {d.endDate ? new Date(d.endDate).toLocaleString() : "-"}
                  </td>
                  <td>{statusBadgeComponent(d.status)}</td>
                  <td className="d-flex gap-1 flex-nowrap">
                    <button
                      className="sherah-table__action sherah-color3 sherah-color3__bg--opactit border-0"
                      onClick={() => setEditTarget(d)}
                      title="Güncelle"
                    >
                      <i className="fa-regular fa-pen-to-square" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-muted mt-3">
            Toplam: <strong>{rows.length}</strong> indirim.
          </div>
        </>
      ) : (
        <div className="alert alert-info">
          Sonuç yok. Kategori seçip "Getir"e tıklayın.
        </div>
      )}

      {/* Güncelleme Modalı */}
      {editTarget && (
        <EditDiscountModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            if (categoryId) {
              handleFetch({ preventDefault: () => {} } as any);
            }
          }}
        />
      )}
    </div>
  );
}