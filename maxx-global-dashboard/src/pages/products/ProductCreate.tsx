import { useEffect, useState } from "react";
import { hasPermission } from "../../utils/permissions";
import { createProduct } from "../../services/products/create";
import type { ProductCreateRequest } from "../../types/product";
import { getAllCategoryOptions } from "../../services/categories/options";
import type { CategoryOption } from "../../services/categories/_normalize";
import { useNavigate } from "react-router-dom";

export default function ProductCreate() {
  if (!hasPermission({ required: "PRODUCT_MANAGE" })) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (PRODUCT_MANAGE gerekli).
      </div>
    );
  }

  const nav = useNavigate();

  // NOT: bool alanları backend NULL kabul etmiyor; false ile başlatıyoruz
  const [form, setForm] = useState<
    ProductCreateRequest & {
      sterile: boolean;
      singleUse: boolean;
      implantable: boolean;
      ceMarking: boolean;
      fdaApproved: boolean;
    }
  >({
    name: "",
    code: "",
    description: "",
    categoryId: 0,
    unit: "adet",
    stockQuantity: 0,

    // bool zorunlular
    sterile: false,
    singleUse: false,
    implantable: false,
    ceMarking: false,
    fdaApproved: false,

    // opsiyoneller (ihtiyaç olursa doldurulacak)
    lotNumber: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [catOpts, setCatOpts] = useState<CategoryOption[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const opts = await getAllCategoryOptions();
        setCatOpts(opts);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      if (!form.categoryId || form.categoryId <= 0) {
        setError("Lütfen bir kategori seçiniz.");
        setSaving(false);
        return;
      }

      // Bool alanları kesin boolean'a çevir (undefined bırakmıyoruz)
      const payload: ProductCreateRequest = {
        ...form,
        name: form.name.trim(),
        code: form.code.trim(),
        unit: form.unit?.trim() || "adet",
        stockQuantity: Number(form.stockQuantity ?? 0),

        // aşağıdakiler not-null hatasını önler
        sterile: !!form.sterile,
        singleUse: !!form.singleUse,
        implantable: !!form.implantable,
        ceMarking: !!form.ceMarking,
        fdaApproved: !!form.fdaApproved,
      };

      const created = await createProduct(payload);

      // Başarılı → resim yükleme sayfasına
      nav(`/products/${created.id}/images`);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Ürün oluşturulamadı.";
      setError(`Ürün oluşturulurken bir hata oluştu: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col-lg-10">
      <h3 className="sherah-card__title py-3">Yeni Ürün</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Ad *</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Kod *</label>
            <input
              className="form-control"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Kategori *</label>
            <select
              className="form-select"
              value={form.categoryId || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId: e.target.value ? Number(e.target.value) : 0,
                })
              }
              disabled={loadingCats}
            >
              <option value="">Seçiniz</option>
              {catOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Birim</label>
            <input
              className="form-control"
              value={form.unit ?? ""}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Stok</label>
            <input
              type="number"
              className="form-control"
              value={form.stockQuantity ?? 0}
              onChange={(e) =>
                setForm({ ...form, stockQuantity: Number(e.target.value) })
              }
              min={0}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Lot Numarası</label>
            <input
              className="form-control"
              value={form.lotNumber ?? ""}
              onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
            />
          </div>

          <div className="col-md-6 d-flex flex-wrap align-items-end gap-3">
            {/* Bool switch'ler */}
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="sterile"
                checked={!!form.sterile}
                onChange={() => setForm({ ...form, sterile: !form.sterile })}
              />
              <label className="form-check-label" htmlFor="sterile">
                Steril
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="singleUse"
                checked={!!form.singleUse}
                onChange={() =>
                  setForm({ ...form, singleUse: !form.singleUse })
                }
              />
              <label className="form-check-label" htmlFor="singleUse">
                Tek Kullanımlık
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="implantable"
                checked={!!form.implantable}
                onChange={() =>
                  setForm({ ...form, implantable: !form.implantable })
                }
              />
              <label className="form-check-label" htmlFor="implantable">
                İmplante Edilebilir
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="ceMarking"
                checked={!!form.ceMarking}
                onChange={() =>
                  setForm({ ...form, ceMarking: !form.ceMarking })
                }
              />
              <label className="form-check-label" htmlFor="ceMarking">
                CE İşareti
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="fdaApproved"
                checked={!!form.fdaApproved}
                onChange={() =>
                  setForm({ ...form, fdaApproved: !form.fdaApproved })
                }
              />
              <label className="form-check-label" htmlFor="fdaApproved">
                FDA Onaylı
              </label>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label">Açıklama</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet ve Resim Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
}
