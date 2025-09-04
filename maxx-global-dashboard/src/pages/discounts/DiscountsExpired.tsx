// src/pages/discounts/DiscountsExpired.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { listExpiredDiscounts } from "../../services/discounts/expired";
import type { Discount } from "../../types/discount";
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

function formatTimeSince(endIso?: string) {
  if (!endIso) return "-";
  const ms = Date.now() - new Date(endIso).getTime();
  if (ms <= 0) return "Bitiş saati gelmedi";
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}g ${hours}s ${mins}dk önce`;
  if (hours > 0) return `${hours}s ${mins}dk önce`;
  return `${mins}dk önce`;
}

export default function DiscountsExpired() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [editTarget, setEditTarget] = useState<Discount | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await listExpiredDiscounts();
      setRows(data);
    } catch (e) {
      Swal.fire("Hata", "Süresi dolan indirimler yüklenemedi", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const hasRows = rows.length > 0;

  return (
    <div className="sherah-page-inner sherah-default-bg sherah-border p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Süresi Dolmuş İndirimler</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/discounts/new")}
          >
            + Yeni İndirim
          </button>
          <Link to="/discounts" className="btn btn-secondary">
            ← İndirim Listesi
          </Link>
        </div>
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
                <th>Ne Zaman Bitti</th>
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
                  <td style={{ minWidth: 180 }}>
                    {renderBadges(d.applicableDealers, 3)}
                  </td>
                  <td>
                    {d.startDate ? new Date(d.startDate).toLocaleString() : "-"}
                  </td>
                  <td>
                    {d.endDate ? new Date(d.endDate).toLocaleString() : "-"}
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {formatTimeSince(d.endDate)}
                    </span>
                  </td>
                  <td>{d.status ?? (d.isActive ? "AKTİF" : "PASİF")}</td>
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
            Toplam: <strong>{rows.length}</strong> kayıt.
          </div>
        </>
      ) : (
        <div className="alert alert-info">
          Süresi dolmuş indirim bulunamadı.
        </div>
      )}

      {/* Güncelleme Modalı */}
      {editTarget && (
        <EditDiscountModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            load(); // kayıttan sonra tazele
          }}
        />
      )}
    </div>
  );
}
