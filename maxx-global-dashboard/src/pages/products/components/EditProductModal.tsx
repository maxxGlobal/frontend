import React, { useEffect, useState } from "react";
import { updateProduct } from "../../../services/products/update";
import { getProductById } from "../../../services/products/getById";
import type { ProductUpdateRequest, Product } from "../../../types/product";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  setupTurkishValidation,
  validateFormInTurkish,
} from "../../../utils/validation";

interface EditProductModalProps {
  productId: number;
  categories: { id: number; name?: string; label?: string }[];
  onClose: () => void;
  onSaved: (updated?: Product) => void; // güncellenmiş ürünü geri gönder
}

function fmtDate(d?: string | null) {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}
function num(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  productId,
  categories,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState<ProductUpdateRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const MySwal = withReactContent(Swal);
  // Ürün detayını çek
  useEffect(() => {
    setupTurkishValidation(); // Sadece modal içinde

    const controller = new AbortController();
    (async () => {
      try {
        setError(null);
        const p = await getProductById(productId, {
          signal: controller.signal,
        });

        const f: ProductUpdateRequest = {
          name: p.name,
          code: p.code,
          description: p.description ?? "",
          categoryId: p.categoryId ?? 0,
          material: p.material ?? "",
          size: p.size ?? "",
          diameter: p.diameter ?? "",
          angle: p.angle ?? "",
          sterile: !!(p as any).sterile,
          singleUse: !!(p as any).singleUse,
          implantable: !!(p as any).implantable,
          ceMarking: !!(p as any).ceMarking,
          fdaApproved: !!(p as any).fdaApproved,
          medicalDeviceClass: p.medicalDeviceClass ?? "",
          regulatoryNumber: p.regulatoryNumber ?? "",

          weightGrams: p.weightGrams ?? undefined,
          dimensions: p.dimensions ?? "",
          color: (p as any).color ?? "",
          surfaceTreatment: p.surfaceTreatment ?? "",

          serialNumber: p.serialNumber ?? "",
          manufacturerCode: p.manufacturerCode ?? "",
          manufacturingDate: fmtDate(p.manufacturingDate),
          expiryDate: fmtDate(p.expiryDate),
          shelfLifeMonths: p.shelfLifeMonths ?? undefined,

          unit: p.unit ?? "",
          barcode: p.barcode ?? "",
          lotNumber: p.lotNumber ?? "",

          stockQuantity: p.stockQuantity ?? undefined,
          minimumOrderQuantity: (p as any).minimumOrderQuantity ?? undefined,
          maximumOrderQuantity: (p as any).maximumOrderQuantity ?? undefined,

          isActive: p.isActive ?? true,
        };

        setForm(f);
      } catch (e) {
      } finally {
        setBootLoading(false);
      }
    })();
    return () => controller.abort();
  }, [productId]);

  useEffect(() => {
    if (form && !bootLoading) {
      // Modal içindeki elementler için validation setup'ı
      setTimeout(() => {
        setupTurkishValidation(".modal");
      }, 100); // DOM'un render olmasını bekle
    }
  }, [form, bootLoading]);

  const numberFields = new Set([
    "weightGrams",
    "shelfLifeMonths",
    "stockQuantity",
    "minimumOrderQuantity",
    "maximumOrderQuantity",
  ]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!form) return;
    const { name, type, value, checked } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setForm((prev) => (prev ? { ...prev, [name]: checked } : prev));
      return;
    }

    if (name === "categoryId") {
      setForm((prev) =>
        prev ? { ...prev, categoryId: Number(value) || 0 } : prev
      );
      return;
    }

    if (numberFields.has(name)) {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              [name]: value === "" ? undefined : num(value),
            }
          : prev
      );
      return;
    }

    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const onDate =
    (field: "manufacturingDate" | "expiryDate") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setForm((prev) => (prev ? { ...prev, [field]: v } : prev));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const formElement = e.target as HTMLFormElement;
    if (!validateFormInTurkish(formElement)) {
      // Validation başarısızsa işlemi durdur
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: ProductUpdateRequest = {
        ...form,
        categoryId: Number(form.categoryId) || 0,
        weightGrams: num(form.weightGrams),
        shelfLifeMonths: num(form.shelfLifeMonths),
        stockQuantity: num(form.stockQuantity),
        minimumOrderQuantity: num(form.minimumOrderQuantity),
        maximumOrderQuantity: num(form.maximumOrderQuantity),
      };

      const updated = await updateProduct(productId, payload);
      const chosenId = Number(payload.categoryId) || 0;
      const chosenName =
        categories.find((c) => c.id === chosenId)?.name ??
        categories.find((c) => c.id === chosenId)?.label ??
        updated.categoryName ??
        null;

      const fixed: Product = {
        ...updated,
        categoryId: chosenId,
        categoryName: chosenName,
      };

      // Başarı durumunda SweetAlert
      await MySwal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Ürün başarıyla güncellendi.",
        confirmButtonText: "Tamam",
        timer: 2000,
        timerProgressBar: true,
      });

      onSaved(fixed);
    } catch (err: any) {
      let errorTitle = "Güncelleme Hatası";
      let errorMessage = "Ürün güncellenirken bilinmeyen bir hata oluştu.";
      let isHtml = false;

      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 400) {
          errorTitle = "Doğrulama Hatası";

          if (typeof data === "string") {
            errorMessage = data;
          } else if (data?.message) {
            errorMessage = data.message;
          } else if (data?.title) {
            errorMessage = data.title;
          } else if (data?.errors) {
            // Birden fazla validation hatası
            if (Array.isArray(data.errors)) {
              errorMessage = `<ul class="text-start mb-0">
              ${data.errors
                .map((error: string) => `<li>${error}</li>`)
                .join("")}
            </ul>`;
              isHtml = true;
            } else if (typeof data.errors === "object") {
              // Field-based validation errors
              const fieldErrors = Object.entries(data.errors)
                .map(([field, msgs]) => {
                  const fieldName = field;
                  const message = Array.isArray(msgs) ? msgs.join(", ") : msgs;
                  return `<li><strong>${fieldName}:</strong> ${message}</li>`;
                })
                .join("");
              errorMessage = `<ul class="text-start mb-0">${fieldErrors}</ul>`;
              isHtml = true;
            }
          } else {
            errorMessage = `Geçersiz veri gönderildi: ${JSON.stringify(data)}`;
          }
        } else if (status === 409) {
          errorTitle = "Çakışma Hatası";
          errorMessage =
            data?.message || data?.title || "Bu ürün kodu zaten kullanılıyor.";
        } else if (status === 422) {
          errorTitle = "Veri Hatası";
          errorMessage =
            data?.message || data?.title || "Gönderilen veriler işlenemedi.";
        } else if (status === 500) {
          errorTitle = "Sunucu Hatası";
          errorMessage =
            "Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
        } else if (status === 403) {
          errorTitle = "Yetki Hatası";
          errorMessage = "Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.";
        } else if (status === 404) {
          errorTitle = "Bulunamadı";
          errorMessage = "Güncellenmeye çalışılan ürün bulunamadı.";
        } else {
          errorTitle = `HTTP ${status} Hatası`;
          errorMessage =
            data?.message || data?.title || "Bilinmeyen sunucu hatası";
        }
      } else if (err?.code === "NETWORK_ERROR" || !err?.response) {
        errorTitle = "Bağlantı Hatası";
        errorMessage =
          "Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // SweetAlert ile hata göster
      await MySwal.fire({
        icon: "error",
        title: errorTitle,
        html: isHtml ? errorMessage : undefined,
        text: isHtml ? undefined : errorMessage,
        confirmButtonText: "Tamam",
        width: "500px",
        customClass: {
          htmlContainer: "text-start",
        },
      });

      // Modal'ı kapatma - opsiyonel
      // onClose();
    } finally {
      setLoading(false);
    }
  };

  if (bootLoading || !form) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6">Yükleniyor…</div>
      </div>
    );
  }

  return (
    <>
      {" "}
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            {error && (
              <div className="bg-red-200 p-2 mb-3 rounded">{error}</div>
            )}

            <form onSubmit={submit} className="sherah-wc__form-main p-0">
              <div className="modal-header">
                <h5 className="modal-title">Ürünü Güncelle</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  disabled={loading}
                />
              </div>
              <div className="modal-body">
                {/* Temel Bilgiler */}
                <div className="row g-3">
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Ad *{" "}
                        <small className="text-muted">
                          (örn. Titanyum İmplant)
                        </small>
                      </label>
                      <input
                        name="name"
                        className="sherah-wc__form-input"
                        value={form.name}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  {/*Kod */}
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Kod <small className="text-muted">(Örn: TI-001)</small>
                      </label>
                      <input
                        name="code"
                        className="sherah-wc__form-input"
                        value={form.code}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  {/* Kategori */}
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Kategori *{" "}
                      </label>
                      <select
                        name="categoryId"
                        className="sherah-wc__form-input"
                        value={form.categoryId ?? ""}
                        onChange={onChange}
                        required
                      >
                        <option value="">Kategori Seçin</option>
                        {categories.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Stok & Birim & Lot */}
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Birim <small className="text-muted">(Örn: adet)</small>
                      </label>
                      <input
                        name="unit"
                        className="sherah-wc__form-input"
                        value={form.unit ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Stok Adedi{" "}
                        <small className="text-muted">(Örn: 3)</small>
                      </label>
                      <input
                        name="stockQuantity"
                        type="number"
                        className="sherah-wc__form-input"
                        value={form.stockQuantity ?? ""}
                        onChange={onChange}
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Lot Numarası{" "}
                        <small className="text-muted">
                          (Örn: LOT-2024-001)
                        </small>
                      </label>
                      <input
                        name="lotNumber"
                        className="sherah-wc__form-input"
                        value={form.lotNumber ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>

                  {/* Fiziksel Özellikler */}
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">Malzeme</label>
                      <input
                        name="material"
                        className="sherah-wc__form-input"
                        value={form.material ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">Boyut</label>
                      <input
                        name="size"
                        className="sherah-wc__form-input"
                        value={form.size ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">Çap</label>
                      <input
                        name="diameter"
                        className="sherah-wc__form-input"
                        value={form.diameter ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">Açı</label>
                      <input
                        name="angle"
                        className="sherah-wc__form-input"
                        value={form.angle ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">Renk</label>
                      <input
                        name="color"
                        className="sherah-wc__form-input"
                        value={form.color ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Yüzey İşlemi
                      </label>
                      <input
                        name="surfaceTreatment"
                        className="sherah-wc__form-input"
                        value={form.surfaceTreatment ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>

                  {/* Kimlik & Üretici */}
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">Seri No</label>
                      <input
                        name="serialNumber"
                        className="sherah-wc__form-input"
                        value={form.serialNumber ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Üretici Kodu
                      </label>
                      <input
                        name="manufacturerCode"
                        className="sherah-wc__form-input"
                        value={form.manufacturerCode ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>

                  {/* Tarihler */}
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Üretim Tarihi
                      </label>
                      <input
                        type="date"
                        className="sherah-wc__form-input"
                        value={form.manufacturingDate ?? ""}
                        onChange={onDate("manufacturingDate")}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Son Kullanma Tarihi
                      </label>
                      <input
                        type="date"
                        className="sherah-wc__form-input"
                        value={form.expiryDate ?? ""}
                        onChange={onDate("expiryDate")}
                      />
                    </div>
                  </div>

                  {/* Medikal & Regülasyon */}
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Medikal Cihaz Sınıfı
                      </label>
                      <input
                        name="medicalDeviceClass"
                        className="sherah-wc__form-input"
                        value={form.medicalDeviceClass ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Regülasyon No
                      </label>
                      <input
                        name="regulatoryNumber"
                        className="sherah-wc__form-input"
                        value={form.regulatoryNumber ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">Barkod</label>
                      <input
                        name="barcode"
                        className="sherah-wc__form-input"
                        value={form.barcode ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>

                  {/* Sayısal Ek Alanlar */}
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Ağırlık (gram)
                      </label>
                      <input
                        name="weightGrams"
                        type="number"
                        step="any" // veya step="0.1"
                        className="sherah-wc__form-input"
                        value={form.weightGrams ?? ""}
                        onChange={onChange}
                        min={0}
                        placeholder="14.5"
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Raf Ömrü (ay)
                      </label>
                      <input
                        name="shelfLifeMonths"
                        type="number"
                        className="sherah-wc__form-input"
                        value={form.shelfLifeMonths ?? ""}
                        onChange={onChange}
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">Boyutlar</label>
                      <input
                        name="dimensions"
                        className="sherah-wc__form-input"
                        value={form.dimensions ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>

                  {/* Sipariş Limitleri */}
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Minimum Sipariş
                      </label>
                      <input
                        name="minimumOrderQuantity"
                        type="number"
                        className="sherah-wc__form-input"
                        value={form.minimumOrderQuantity ?? ""}
                        onChange={onChange}
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Maksimum Sipariş
                      </label>
                      <input
                        name="maximumOrderQuantity"
                        type="number"
                        className="sherah-wc__form-input"
                        value={form.maximumOrderQuantity ?? ""}
                        onChange={onChange}
                        min={0}
                      />
                    </div>
                  </div>

                  {/* Boolean’lar */}
                  <div className="col-12 d-flex flex-wrap align-items-center gap-3 pt-2">
                    {[
                      { id: "sterile", label: "Steril" },
                      { id: "singleUse", label: "Tek Kullanımlık" },
                      { id: "implantable", label: "İmplante Edilebilir" },
                      { id: "ceMarking", label: "CE İşareti" },
                      { id: "fdaApproved", label: "FDA Onaylı" },
                    ].map((b) => (
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input mb-0 border"
                          type="checkbox"
                          name={b.id}
                          checked={!!(form as any)[b.id]}
                          onChange={onChange}
                        />

                        <label
                          key={b.id}
                          className="form-check-label mb-0 mt-1 lh-sm"
                        >
                          {b.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="col-lg-12 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Açıklama{" "}
                        <small className="text-muted">
                          (Örn: Yüksek kaliteli titanyum implant)
                        </small>
                      </label>
                      <textarea
                        name="description"
                        className="sherah-wc__form-input"
                        rows={3}
                        value={form.description ?? ""}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  {/* Aksiyonlar */}
                  <div className="d-flex justify-content-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="sherah-btn sherah-gbcolor"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="sherah-btn sherah-btn__secondary"
                    >
                      {loading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default EditProductModal;
