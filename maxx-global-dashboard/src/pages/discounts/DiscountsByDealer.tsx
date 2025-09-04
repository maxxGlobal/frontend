// src/pages/discounts/DiscountsByDealer.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { listDiscountsByDealer } from "../../services/discounts/list-by-dealer";
import { listSimpleDealers } from "../../services/dealers/simple";
import { listUpcomingDiscounts } from "../../services/discounts/upcoming";
import type { Discount } from "../../types/discount";
import type { DealerSummary } from "../../types/dealer";
import EditDiscountModal from "./components/EditDiscountModal";

// helpers
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
function dedupeById<T extends { id: number }>(arr: T[]): T[] {
  const m = new Map<number, T>();
  for (const x of arr) m.set(x.id, x);
  return Array.from(m.values());
}
function statusBadge(d: Discount) {
  const now = Date.now();
  const s = d.startDate ? new Date(d.startDate).getTime() : 0;
  const e = d.endDate ? new Date(d.endDate).getTime() : 0;
  if (d.isValidNow || (s <= now && now <= e))
    return <span className="badge bg-success">AKTİF</span>;
  if (s > now)
    return <span className="badge bg-warning text-dark">YAKLAŞAN</span>;
  return <span className="badge bg-secondary">PASİF</span>;
}

export default function DiscountsByDealer() {
  // dropdown seçenekleri
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [optsLoading, setOptsLoading] = useState(true);

  // seçimler
  const [dealerId, setDealerId] = useState<string>("");
  const [includeUpcoming, setIncludeUpcoming] = useState<boolean>(true); // 👈 yeni

  // sonuçlar
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Discount[]>([]);

  // modal
  const [editTarget, setEditTarget] = useState<Discount | null>(null);

  // dropdown verileri
  useEffect(() => {
    (async () => {
      try {
        setOptsLoading(true);
        const dealers = await listSimpleDealers();
        dealers.sort((a, b) => a.name.localeCompare(b.name));
        setDealerOpts(dealers);
      } catch {
        Swal.fire("Hata", "Bayi listesi yüklenemedi", "error");
      } finally {
        setOptsLoading(false);
      }
    })();
  }, []);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    await reloadList();
  }

  async function reloadList() {
    const did = Number(dealerId);
    if (!Number.isFinite(did) || did <= 0) {
      await Swal.fire("Uyarı", "Lütfen bir bayi seçiniz.", "warning");
      return;
    }
    try {
      setLoading(true);

      // 1) Şu an geçerli indirimler
      const active = await listDiscountsByDealer(did);

      // 2) Yaklaşanlar (opsiyonel)
      let merged = active;
      if (includeUpcoming) {
        const upcomingAll = await listUpcomingDiscounts();
        const upcomingFiltered = (upcomingAll ?? []).filter(
          (d) =>
            Array.isArray(d.applicableDealers) &&
            d.applicableDealers.some((x) => x.id === did)
        );
        merged = dedupeById<Discount>([...active, ...upcomingFiltered]);
      }

      setRows(merged);

      if (!merged?.length) {
        await Swal.fire(
          "Bilgi",
          includeUpcoming
            ? "Bu bayi için aktif ya da yaklaşan indirim bulunamadı."
            : "Bu bayi için şu anda geçerli indirim bulunamadı.",
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

  return (
    <div className="sherah-page-inner sherah-default-bg sherah-border p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Bayiye Uygulanabilir İndirimler</h2>
        <div className="d-flex gap-2">
          <Link to="/discounts" className="btn btn-secondary">
            ← İndirim Listesi
          </Link>
          <Link to="/discounts/upcoming" className="btn btn-outline-primary">
            Yaklaşan İndirimler
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleFetch} className="card p-3 mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-8">
            <label className="form-label">Bayi *</label>
            <select
              className="form-select"
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
              disabled={optsLoading}
              required
            >
              <option value="">— Bayi seçin —</option>
              {dealerOpts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 d-flex">
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={optsLoading || loading || !dealerId}
            >
              {loading ? "Yükleniyor..." : "Getir"}
            </button>
          </div>

          <div className="col-12">
            <div className="form-check mt-2">
              <input
                id="incUpcomingDealer"
                className="form-check-input"
                type="checkbox"
                checked={includeUpcoming}
                onChange={(e) => setIncludeUpcoming(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="incUpcomingDealer">
                Yaklaşan indirimleri de göster
              </label>
            </div>
            <div className="form-text">
              Not: “Getir”, seçilen bayi için şu an geçerli indirimleri
              döndürür. Bu kutu işaretliyse, aynı bayiyi kapsayan yaklaşan
              indirimler de eklenir.
            </div>
          </div>
        </div>
      </form>

      {/* Sonuçlar */}
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
                <th>Başlangıç</th>
                <th>Bitiş</th>
                <th>Durum</th>
                <th style={{ width: 120 }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
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
                  <td>
                    {d.startDate ? new Date(d.startDate).toLocaleString() : "-"}
                  </td>
                  <td>
                    {d.endDate ? new Date(d.endDate).toLocaleString() : "-"}
                  </td>
                  <td>{statusBadge(d)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setEditTarget(d)}
                      title="Güncelle"
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-muted">
            Toplam: <strong>{rows.length}</strong> indirim.
          </div>
        </>
      ) : (
        <div className="alert alert-info">
          Sonuç yok. Bayi seçip “Getir”e tıklayın.
        </div>
      )}

      {/* Güncelleme Modalı */}
      {editTarget && (
        <EditDiscountModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            // seçim ve includeUpcoming durumuna göre tekrar yükle
            if (dealerId) {
              reloadList();
            }
          }}
        />
      )}
    </div>
  );
}
