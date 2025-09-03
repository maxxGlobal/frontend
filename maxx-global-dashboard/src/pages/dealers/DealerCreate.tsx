// src/pages/dealers/DealerCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDealer } from "../../services/dealers/create";
import type { DealerCreateRequest } from "../../types/dealer";
import { hasPermission } from "../../utils/permissions";
import Swal from "sweetalert2";

export default function DealerCreate() {
  const canManage = hasPermission({ required: "DEALER_MANAGE" });
  const navigate = useNavigate();
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
    preferredCurrency: "TRY", // ✅ default
  });
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<DealerCreateRequest>) =>
    setForm((f) => ({ ...f, ...patch }));

  const norm = (v?: string) => (v && v.trim() !== "" ? v.trim() : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);

      const created = await createDealer({
        name: form.name.trim(),
        fixedPhone: norm(form.fixedPhone),
        mobilePhone: norm(form.mobilePhone),
        email: norm(form.email),
        address: norm(form.address),
        preferredCurrency: form.preferredCurrency,
      });

      const dealerId = created.id;
      if (dealerId) {
        await Swal.fire({
          title: "Başarılı",
          text: "Bayi oluşturuldu.",
          icon: "success",
          confirmButtonText: "Tamam", // ✅ buton adı değişti
        });
        navigate(`/dealers/${dealerId}/prices`);
      } else {
        await Swal.fire({
          title: "Uyarı",
          text: "Bayi oluşturuldu, fakat ID bilgisi alınamadı.",
          icon: "warning",
          confirmButtonText: "Tamam",
        });
      }

      setForm({
        name: "",
        fixedPhone: "",
        mobilePhone: "",
        email: "",
        address: "",
        preferredCurrency: "TRY",
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Bayi oluşturulamadı.";
      await Swal.fire("Hata", msg, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col-lg-12 col-md-12 col-12 sherah-wc-col-two register-add-form">
      <div className="sherah-wc__form">
        <div className="sherah-wc__form-inner">
          <h3 className="sherah-wc__form-title sherah-wc__form-title__one">
            Bayi Oluştur <span>Lütfen aşağıdaki bilgileri doldurun</span>
          </h3>

          <form onSubmit={submit} className="sherah-wc__form-main p-0">
            <div className="row">
              {/* Ad */}
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
                      pattern="^[0-9+\\-\\s()]{8,20}$"
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
                      pattern="^[0-9+\\-\\s()]{8,20}$"
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

              {/* Para Birimi */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">
                    Tercih Edilen Para Birimi *
                  </label>
                  <div className="form-group__input">
                    <select
                      className="sherah-wc__form-input"
                      value={form.preferredCurrency}
                      onChange={(e) =>
                        set({ preferredCurrency: e.target.value })
                      }
                      required
                    >
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
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
