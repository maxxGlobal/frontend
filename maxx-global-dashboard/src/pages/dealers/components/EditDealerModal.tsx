// src/pages/dealers/components/EditDealerModal.tsx
import { useState } from "react";
import type { DealerRow, DealerUpdateRequest } from "../../../types/dealer";
import { updateDealer } from "../../../services/dealers/update";

type Props = {
  dealer: DealerRow;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditDealerModal({ dealer, onClose, onSaved }: Props) {
  const [form, setForm] = useState<DealerUpdateRequest>({
    name: dealer.name ?? "",
    email: dealer.email ?? "",
    fixedPhone: dealer.fixedPhone ?? "",
    mobilePhone: dealer.mobilePhone ?? "",
    address: dealer.address ?? "",
    preferredCurrency: dealer.preferredCurrency ?? "",
    // status'i backend yönetiyor: burada göndermiyoruz
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusBadge = (s?: string | null) =>
    s === "AKTİF" ? (
      <div className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
        AKTİF
      </div>
    ) : s === "PASSIVE" ? (
      <div className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
        PASİF
      </div>
    ) : (
      <div className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
        SİLİNMİŞ
      </div>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await updateDealer(dealer.id, {
        name: (form.name ?? "").trim() || dealer.name,
        email: (form.email ?? "").trim() || dealer.email || undefined,
        fixedPhone:
          (form.fixedPhone ?? "").trim() || dealer.fixedPhone || undefined,
        mobilePhone:
          (form.mobilePhone ?? "").trim() || dealer.mobilePhone || undefined,
        address: (form.address ?? "").trim() || dealer.address || undefined,
        preferredCurrency:
          (form.preferredCurrency ?? "").trim() ||
          dealer.preferredCurrency ||
          undefined,

        // status YOK -> backend yönetsin
      });
      onSaved();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Güncelleme başarısız.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          tabIndex={-1}
        >
          <form className="modal-content" onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Bayi Düzenle</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={saving}
              />
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Durum - sadece gösterim (backend'den gelen) */}
              <div className="mb-3">
                <label className="form-label d-block">Durum</label>
                {statusBadge(dealer.status)}
              </div>

              <div className="mb-3">
                <label className="form-label">Ad *</label>
                <input
                  className="form-control"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">E-posta</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Sabit Telefon</label>
                  <input
                    className="form-control"
                    placeholder="+90 212 555 1234"
                    value={form.fixedPhone || ""}
                    onChange={(e) =>
                      setForm({ ...form, fixedPhone: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobil Telefon</label>
                  <input
                    className="form-control"
                    placeholder="+90 535 555 1234"
                    value={form.mobilePhone || ""}
                    onChange={(e) =>
                      setForm({ ...form, mobilePhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label">Adres</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.address || ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Para Birimi</label>
                <input
                  className="form-control"
                  value={form.preferredCurrency || ""}
                  onChange={(e) =>
                    setForm({ ...form, preferredCurrency: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={saving}
              >
                Kapat
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
