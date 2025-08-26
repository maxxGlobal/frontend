import { useEffect, useState } from "react";
import { hasPermission } from "../../utils/permissions";
import { createProduct } from "../../services/products/create";
import type { ProductCreateRequest } from "../../types/product";
import { getAllCategoryOptions } from "../../services/categories/options";
import type { CategoryOption } from "../../services/categories/_normalize";
import { useNavigate } from "react-router-dom";

function numOrUndef(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function ProductCreate() {
  if (!hasPermission({ required: "PRODUCT_MANAGE" })) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (PRODUCT_MANAGE gerekli).
      </div>
    );
  }

  const nav = useNavigate();

  // Tüm create alanları + bool’lar
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

    material: "",
    size: "",
    diameter: "",
    angle: "",
    weightGrams: undefined as unknown as number,
    dimensions: "",
    color: "",
    surfaceTreatment: "",
    serialNumber: "",
    manufacturerCode: "",
    manufacturingDate: "",
    expiryDate: "",
    shelfLifeMonths: undefined as unknown as number,
    unit: "adet",
    barcode: "",
    lotNumber: "",
    stockQuantity: undefined as unknown as number,
    minimumOrderQuantity: undefined as unknown as number,
    maximumOrderQuantity: undefined as unknown as number,
    medicalDeviceClass: "",
    regulatoryNumber: "",

    sterile: false,
    singleUse: false,
    implantable: false,
    ceMarking: false,
    fdaApproved: false,
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

      // Basit FE validasyonları
      if (!form.name.trim()) throw new Error("Ad zorunludur.");
      if (!form.code.trim()) throw new Error("Kod zorunludur.");
      if (!form.categoryId || form.categoryId <= 0)
        throw new Error("Lütfen bir kategori seçiniz.");
      if (!form.unit || !form.unit.trim())
        throw new Error("Birim zorunludur (örn. 'adet').");
      if (!form.lotNumber || !form.lotNumber.trim())
        throw new Error("Lot numarası zorunludur.");
      if (
        form.stockQuantity === undefined ||
        form.stockQuantity === null ||
        Number.isNaN(Number(form.stockQuantity))
      ) {
        throw new Error("Stok adedi zorunludur.");
      }

      // Temiz payload (trim + cast)
      const payload: ProductCreateRequest = {
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description?.trim() || "",
        categoryId: Number(form.categoryId),

        material: form.material?.trim() || "",
        size: form.size?.trim() || "",
        diameter: form.diameter?.trim() || "",
        angle: form.angle?.trim() || "",
        dimensions: form.dimensions?.trim() || "",
        color: form.color?.trim() || "",
        surfaceTreatment: form.surfaceTreatment?.trim() || "",
        serialNumber: form.serialNumber?.trim() || "",
        manufacturerCode: form.manufacturerCode?.trim() || "",
        medicalDeviceClass: form.medicalDeviceClass?.trim() || "",
        regulatoryNumber: form.regulatoryNumber?.trim() || "",
        unit: form.unit?.trim() || "adet",
        barcode: form.barcode?.trim() || "",
        lotNumber: form.lotNumber?.trim(), // zorunlu

        // sayısallar
        weightGrams: numOrUndef(form.weightGrams),
        shelfLifeMonths: numOrUndef(form.shelfLifeMonths),
        stockQuantity: Number(form.stockQuantity), // zorunlu
        minimumOrderQuantity: numOrUndef(form.minimumOrderQuantity),
        maximumOrderQuantity: numOrUndef(form.maximumOrderQuantity),

        // tarihler (YYYY-MM-DD)
        manufacturingDate: form.manufacturingDate || "",
        expiryDate: form.expiryDate || "",

        // bool’lar
        sterile: !!form.sterile,
        singleUse: !!form.singleUse,
        implantable: !!form.implantable,
        ceMarking: !!form.ceMarking,
        fdaApproved: !!form.fdaApproved,
      };

      const created = await createProduct(payload);
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
          {/* Temel */}
          <div className="col-md-6">
            <label className="form-label">
              Ad * <small className="text-muted">(örn. Titanyum İmplant)</small>
            </label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Kod * <small className="text-muted">(örn. TI-001)</small>
            </label>
            <input
              className="form-control"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          {/* Kategori */}
          <div className="col-md-6">
            <label className="form-label">
              Kategori * <small className="text-muted">(seçiniz)</small>
            </label>
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
              required
            >
              <option value="">Seçiniz</option>
              {catOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Birim & Stok & Lot */}
          <div className="col-md-3">
            <label className="form-label">
              Birim * <small className="text-muted">(örn. adet, kutu)</small>
            </label>
            <input
              className="form-control"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Stok Adedi * <small className="text-muted">(örn. 100)</small>
            </label>
            <input
              type="number"
              className="form-control"
              value={form.stockQuantity ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  stockQuantity:
                    e.target.value === ""
                      ? (undefined as any)
                      : Number(e.target.value),
                })
              }
              min={0}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Lot Numarası *{" "}
              <small className="text-muted">(örn. LOT-2024-001)</small>
            </label>
            <input
              className="form-control"
              value={form.lotNumber || ""}
              onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
              placeholder="LOT-YYYY-###"
              required
            />
          </div>

          {/* Malzeme / Ölçüler */}
          <div className="col-md-6">
            <label className="form-label">
              Malzeme <small className="text-muted">(örn. Titanyum)</small>
            </label>
            <input
              className="form-control"
              value={form.material || ""}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Boyut <small className="text-muted">(örn. 4.5mm)</small>
            </label>
            <input
              className="form-control"
              value={form.size || ""}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Çap <small className="text-muted">(örn. 6.0mm)</small>
            </label>
            <input
              className="form-control"
              value={form.diameter || ""}
              onChange={(e) => setForm({ ...form, diameter: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Açı <small className="text-muted">(örn. 30°)</small>
            </label>
            <input
              className="form-control"
              value={form.angle || ""}
              onChange={(e) => setForm({ ...form, angle: e.target.value })}
            />
          </div>

          {/* Görünüm */}
          <div className="col-md-6">
            <label className="form-label">
              Renk <small className="text-muted">(örn. Gümüş)</small>
            </label>
            <input
              className="form-control"
              value={form.color || ""}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Yüzey İşlemi <small className="text-muted">(örn. Anodize)</small>
            </label>
            <input
              className="form-control"
              value={form.surfaceTreatment || ""}
              onChange={(e) =>
                setForm({ ...form, surfaceTreatment: e.target.value })
              }
            />
          </div>

          {/* Seri / Üretici */}
          <div className="col-md-6">
            <label className="form-label">
              Seri No <small className="text-muted">(örn. SN-2024-001)</small>
            </label>
            <input
              className="form-control"
              value={form.serialNumber || ""}
              onChange={(e) =>
                setForm({ ...form, serialNumber: e.target.value })
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Üretici Kodu <small className="text-muted">(örn. MFG-001)</small>
            </label>
            <input
              className="form-control"
              value={form.manufacturerCode || ""}
              onChange={(e) =>
                setForm({ ...form, manufacturerCode: e.target.value })
              }
            />
          </div>

          {/* Tarihler */}
          <div className="col-md-6">
            <label className="form-label">
              Üretim Tarihi <small className="text-muted">(YYYY-MM-DD)</small>
            </label>
            <input
              type="date"
              className="form-control"
              value={form.manufacturingDate || ""}
              onChange={(e) =>
                setForm({ ...form, manufacturingDate: e.target.value })
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Son Kullanma Tarihi{" "}
              <small className="text-muted">(YYYY-MM-DD)</small>
            </label>
            <input
              type="date"
              className="form-control"
              value={form.expiryDate || ""}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          {/* Medikal */}
          <div className="col-md-6">
            <label className="form-label">
              Medikal Cihaz Sınıfı{" "}
              <small className="text-muted">(örn. Class II)</small>
            </label>
            <input
              className="form-control"
              value={form.medicalDeviceClass || ""}
              onChange={(e) =>
                setForm({ ...form, medicalDeviceClass: e.target.value })
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Regülasyon No{" "}
              <small className="text-muted">(örn. REG-2024-001)</small>
            </label>
            <input
              className="form-control"
              value={form.regulatoryNumber || ""}
              onChange={(e) =>
                setForm({ ...form, regulatoryNumber: e.target.value })
              }
            />
          </div>

          {/* Sayısal diğ. */}
          <div className="col-md-4">
            <label className="form-label">
              Ağırlık (gram) <small className="text-muted">(örn. 15.5)</small>
            </label>
            <input
              type="number"
              step="any"
              className="form-control"
              value={form.weightGrams ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  weightGrams:
                    e.target.value === ""
                      ? (undefined as any)
                      : Number(e.target.value),
                })
              }
              min={0}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">
              Raf Ömrü (ay) <small className="text-muted">(örn. 36)</small>
            </label>
            <input
              type="number"
              className="form-control"
              value={form.shelfLifeMonths ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  shelfLifeMonths:
                    e.target.value === ""
                      ? (undefined as any)
                      : Number(e.target.value),
                })
              }
              min={0}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">
              Boyutlar <small className="text-muted">(örn. 10x15x20mm)</small>
            </label>
            <input
              className="form-control"
              value={form.dimensions || ""}
              onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
            />
          </div>

          {/* Sipariş limitleri */}
          <div className="col-md-4">
            <label className="form-label">
              Minimum Sipariş <small className="text-muted">(örn. 1)</small>
            </label>
            <input
              type="number"
              className="form-control"
              value={form.minimumOrderQuantity ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  minimumOrderQuantity:
                    e.target.value === ""
                      ? (undefined as any)
                      : Number(e.target.value),
                })
              }
              min={0}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">
              Maksimum Sipariş <small className="text-muted">(örn. 1000)</small>
            </label>
            <input
              type="number"
              className="form-control"
              value={form.maximumOrderQuantity ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  maximumOrderQuantity:
                    e.target.value === ""
                      ? (undefined as any)
                      : Number(e.target.value),
                })
              }
              min={0}
            />
          </div>

          {/* Barkod */}
          <div className="col-md-4">
            <label className="form-label">
              Barkod <small className="text-muted">(örn. 1234567890123)</small>
            </label>
            <input
              className="form-control"
              value={form.barcode || ""}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            />
          </div>

          {/* Bool Switch’ler */}
          <div className="col-12 d-flex flex-wrap align-items-center gap-4 pt-2">
            {[
              { id: "sterile", label: "Steril" },
              { id: "singleUse", label: "Tek Kullanımlık" },
              { id: "implantable", label: "İmplante Edilebilir" },
              { id: "ceMarking", label: "CE İşareti" },
              { id: "fdaApproved", label: "FDA Onaylı" },
            ].map((sw) => (
              <div key={sw.id} className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={sw.id}
                  checked={!!(form as any)[sw.id]}
                  onChange={() =>
                    setForm({
                      ...form,
                      [sw.id]: !(form as any)[sw.id],
                    } as any)
                  }
                />
                <label className="form-check-label" htmlFor={sw.id}>
                  {sw.label}
                </label>
              </div>
            ))}
          </div>

          {/* Açıklama */}
          <div className="col-12">
            <label className="form-label">
              Açıklama{" "}
              <small className="text-muted">
                (örn. Yüksek kaliteli titanyum implant)
              </small>
            </label>
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
