import React, { useEffect, useState } from "react";
import { updateProduct } from "../../../services/products/update";
import { getProductById } from "../../../services/products/getById";
import type { ProductUpdateRequest, Product } from "../../../types/product";

interface EditProductModalProps {
  productId: number;
  // {id,name} veya {id,label} şekilleri desteklenir
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

  // Ürün detayını çek
  useEffect(() => {
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
        console.error(e);
        setError("Ürün detayları yüklenemedi.");
      } finally {
        setBootLoading(false);
      }
    })();
    return () => controller.abort();
  }, [productId]);

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

      // BE bazen eski categoryId/Name döndürebilir → seçilen kategoriyi zorunlu uygula
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

      onSaved(fixed); // ✅ güncellenen ürünü, doğru kategori adıyla geri ver
    } catch (err) {
      console.error(err);
      setError("Ürün güncellenirken bir hata oluştu.");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-[900px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Ürünü Düzenle</h2>

        {error && <div className="bg-red-200 p-2 mb-3 rounded">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          {/* Temel Bilgiler */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ürün Adı{" "}
                <span className="text-xs text-gray-500">
                  (Örn: Titanyum İmplant)
                </span>
              </label>
              <input
                name="name"
                className="border rounded p-2 w-full"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Kod <span className="text-xs text-gray-500">(Örn: TI-001)</span>
              </label>
              <input
                name="code"
                className="border rounded p-2 w-full"
                value={form.code}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Açıklama{" "}
              <span className="text-xs text-gray-500">
                (Örn: Yüksek kaliteli titanyum implant)
              </span>
            </label>
            <textarea
              name="description"
              className="border rounded p-2 w-full"
              rows={3}
              value={form.description ?? ""}
              onChange={onChange}
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium mb-1">Kategori *</label>
            <select
              name="categoryId"
              className="border rounded p-2 w-full"
              value={String(form.categoryId ?? "")}
              onChange={onChange}
              required
            >
              <option value="">Kategori Seçin</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name ?? (c as any).label}
                </option>
              ))}
            </select>
          </div>

          {/* Stok & Birim & Lot */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Birim <span className="text-xs text-gray-500">(Örn: adet)</span>
              </label>
              <input
                name="unit"
                className="border rounded p-2 w-full"
                value={form.unit ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stok Adedi
              </label>
              <input
                name="stockQuantity"
                type="number"
                className="border rounded p-2 w-full"
                value={form.stockQuantity ?? ""}
                onChange={onChange}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Lot Numarası{" "}
                <span className="text-xs text-gray-500">
                  (Örn: LOT-2024-001)
                </span>
              </label>
              <input
                name="lotNumber"
                className="border rounded p-2 w-full"
                value={form.lotNumber ?? ""}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Fiziksel Özellikler */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Malzeme</label>
              <input
                name="material"
                className="border rounded p-2 w-full"
                value={form.material ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Boyut</label>
              <input
                name="size"
                className="border rounded p-2 w-full"
                value={form.size ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Çap</label>
              <input
                name="diameter"
                className="border rounded p-2 w-full"
                value={form.diameter ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Açı</label>
              <input
                name="angle"
                className="border rounded p-2 w-full"
                value={form.angle ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Renk</label>
              <input
                name="color"
                className="border rounded p-2 w-full"
                value={form.color ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Yüzey İşlemi
              </label>
              <input
                name="surfaceTreatment"
                className="border rounded p-2 w-full"
                value={form.surfaceTreatment ?? ""}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Kimlik & Üretici */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Seri No</label>
              <input
                name="serialNumber"
                className="border rounded p-2 w-full"
                value={form.serialNumber ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Üretici Kodu
              </label>
              <input
                name="manufacturerCode"
                className="border rounded p-2 w-full"
                value={form.manufacturerCode ?? ""}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Tarihler */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Üretim Tarihi
              </label>
              <input
                type="date"
                className="border rounded p-2 w-full"
                value={form.manufacturingDate ?? ""}
                onChange={onDate("manufacturingDate")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Son Kullanma Tarihi
              </label>
              <input
                type="date"
                className="border rounded p-2 w-full"
                value={form.expiryDate ?? ""}
                onChange={onDate("expiryDate")}
              />
            </div>
          </div>

          {/* Medikal & Regülasyon */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Medikal Cihaz Sınıfı
              </label>
              <input
                name="medicalDeviceClass"
                className="border rounded p-2 w-full"
                value={form.medicalDeviceClass ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Regülasyon No
              </label>
              <input
                name="regulatoryNumber"
                className="border rounded p-2 w-full"
                value={form.regulatoryNumber ?? ""}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Barkod</label>
              <input
                name="barcode"
                className="border rounded p-2 w-full"
                value={form.barcode ?? ""}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Sayısal Ek Alanlar */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ağırlık (gram)
              </label>
              <input
                name="weightGrams"
                type="number"
                className="border rounded p-2 w-full"
                value={form.weightGrams ?? ""}
                onChange={onChange}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Raf Ömrü (ay)
              </label>
              <input
                name="shelfLifeMonths"
                type="number"
                className="border rounded p-2 w-full"
                value={form.shelfLifeMonths ?? ""}
                onChange={onChange}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Boyutlar</label>
              <input
                name="dimensions"
                className="border rounded p-2 w-full"
                value={form.dimensions ?? ""}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Sipariş Limitleri */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Sipariş
              </label>
              <input
                name="minimumOrderQuantity"
                type="number"
                className="border rounded p-2 w-full"
                value={form.minimumOrderQuantity ?? ""}
                onChange={onChange}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Maksimum Sipariş
              </label>
              <input
                name="maximumOrderQuantity"
                type="number"
                className="border rounded p-2 w-full"
                value={form.maximumOrderQuantity ?? ""}
                onChange={onChange}
                min={0}
              />
            </div>
          </div>

          {/* Boolean’lar */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { id: "sterile", label: "Steril" },
              { id: "singleUse", label: "Tek Kullanımlık" },
              { id: "implantable", label: "İmplante Edilebilir" },
              { id: "ceMarking", label: "CE İşareti" },
              { id: "fdaApproved", label: "FDA Onaylı" },
            ].map((b) => (
              <label key={b.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={b.id}
                  checked={!!(form as any)[b.id]}
                  onChange={onChange}
                />
                {b.label}
              </label>
            ))}
          </div>

          {/* Aktiflik */}
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                checked={!!form.isActive}
                onChange={onChange}
              />
              Aktif
            </label>
          </div>

          {/* Aksiyonlar */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
