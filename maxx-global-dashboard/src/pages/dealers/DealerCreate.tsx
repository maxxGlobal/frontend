// src/pages/dealers/DealerCreate.tsx
import { useState } from "react";
import { createDealer } from "../../services/dealers/create";
import type { DealerCreateRequest } from "../../types/dealer";
import { hasPermission } from "../../utils/permissions";

export default function DealerCreate() {
  const canManage = hasPermission({ required: "DEALER_MANAGE" });
  if (!canManage) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (DEALER_MANAGE gerekli).
      </div>
    );
  }

  const [form, setForm] = useState<DealerCreateRequest>({
    name: "",
    fixedPhone: "",
    mobilePhone: "",
    email: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<DealerCreateRequest>) =>
    setForm((f) => ({ ...f, ...patch }));

  const norm = (v?: string) => (v && v.trim() !== "" ? v.trim() : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await createDealer({
        name: form.name.trim(),
        fixedPhone: norm(form.fixedPhone),
        mobilePhone: norm(form.mobilePhone),
        email: norm(form.email),
        address: norm(form.address),
      });

      alert("Bayi oluşturuldu.");
      setForm({
        name: "",
        fixedPhone: "",
        mobilePhone: "",
        email: "",
        address: "",
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Bayi oluşturulamadı.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col-lg-12 col-md-12 col-12 sherah-wc-col-two register-add-form">
      <div className="sherah-wc__form">
        <div className="sherah-wc__form-inner">
          <h3 className="sherah-wc__form-title sherah-wc__form-title__one">
            {" "}
            Bayi Oluştur <span>Lütfen aşağıdaki bilgileri doldurun</span>
          </h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={submit} className="sherah-wc__form-main p-0">
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Ad *</label>
                  <div className="form-group__input">
                    <input
                      className="sherah-wc__form-input"
                      value={form.name}
                      onChange={(e) => set({ name: e.target.value })}
                      required
                      placeholder="Bayi adı"
                    />
                  </div>
                </div>
              </div>

              {/* Sabit Telefon */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Sabit Telefon</label>
                  <div className="form-group__input">
                    <input
                      className="sherah-wc__form-input"
                      value={form.fixedPhone || ""}
                      onChange={(e) => set({ fixedPhone: e.target.value })}
                      placeholder="+90 212 555 1234"
                      pattern="^[0-9+\-\s()]{8,20}$"
                      title="Lütfen geçerli bir telefon formatı girin."
                    />
                  </div>
                </div>
              </div>

              {/* Cep Telefonu */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Cep Telefonu</label>
                  <div className="form-group__input">
                    <input
                      className="sherah-wc__form-input"
                      value={form.mobilePhone || ""}
                      onChange={(e) => set({ mobilePhone: e.target.value })}
                      placeholder="+90 535 555 1234"
                      pattern="^[0-9+\-\s()]{8,20}$"
                      title="Lütfen geçerli bir telefon formatı girin."
                    />
                  </div>
                </div>
              </div>

              {/* E-posta */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">E-posta</label>
                  <div className="form-group__input">
                    <input
                      className="sherah-wc__form-input"
                      type="email"
                      value={form.email || ""}
                      onChange={(e) => set({ email: e.target.value })}
                      placeholder="ornek@firma.com"
                    />
                  </div>
                </div>
              </div>

              {/* Adres */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Adres</label>
                  <div className="form-group__input">
                    <input
                      className="sherah-wc__form-input"
                      type="text"
                      value={form.address || ""}
                      onChange={(e) => set({ address: e.target.value })}
                      placeholder="Adres"
                    />
                  </div>
                </div>
              </div>

              <div className="col-3">
                <div className="form-group form-mg-top25">
                  <div className="sherah-wc__button sherah-wc__button--bottom">
                    <button
                      className="ntfmax-wc__btn"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
