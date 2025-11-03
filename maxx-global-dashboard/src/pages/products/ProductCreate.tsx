/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { hasPermission } from "../../utils/permissions";
import { createProduct } from "../../services/products/create";
import type {
  ProductCreateRequest,
  ProductVariantInput,
} from "../../types/product";
import { getAllCategoryOptions } from "../../services/categories/options";
import type { CategoryOption } from "../../services/categories/_normalize";
import { exportProductsToExcel } from "../../services/products/exportExcel";
import { useNavigate } from "react-router-dom";
import {
  setupTurkishValidation,
  validateFormInTurkish,
} from "../../utils/validation";
// ✅ SweetAlert import'larını ekleyin
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  downloadProductsExcelTemplate,
  importProductsExcel,
  type ExcelImportResult,
} from "../../services/products/excel";

// ✅ MySwal'ı tanımlayın
const MySwal = withReactContent(Swal);

function numOrUndef(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// ✅ getFieldDisplayName fonksiyonunu ekleyin
function getFieldDisplayName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    name: "Ürün Adı",
    code: "Ürün Kodu",
    categoryId: "Kategori",
    stockQuantity: "Stok Adedi",
    unit: "Birim",
    lotNumber: "Lot Numarası",
    material: "Malzeme",
    size: "Boyut",
    diameter: "Çap",
    angle: "Açı",
    color: "Renk",
    surfaceTreatment: "Yüzey İşlemi",
    weightGrams: "Ağırlık",
    dimensions: "Boyutlar",
    serialNumber: "Seri No",
    manufacturerCode: "Üretici Kodu",
    manufacturingDate: "Üretim Tarihi",
    expiryDate: "Son Kullanma Tarihi",
    shelfLifeMonths: "Raf Ömrü",
    medicalDeviceClass: "Medikal Cihaz Sınıfı",
    regulatoryNumber: "Regülasyon No",
    barcode: "Barkod",
    minimumOrderQuantity: "Minimum Sipariş",
    maximumOrderQuantity: "Maksimum Sipariş",
    description: "Açıklama",
  };

  return fieldMap[fieldName] || fieldName;
}

interface VariantForm {
  key: string;
  size: string;
  sku: string;
  stockQuantity: string;
  isDefault: boolean;
}

export default function ProductCreate() {
  if (!hasPermission({ anyOf: ["PRODUCT_MANAGE", "SYSTEM_ADMIN"] })) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (PRODUCT_MANAGE gerekli).
      </div>
    );
  }

  const nav = useNavigate();

  // Tüm create alanları + bool'lar
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
    unit: "",
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

  const [excelMode, setExcelMode] = useState<"TEMPLATE" | "UPLOAD">("TEMPLATE");
  const [excelBusy, setExcelBusy] = useState(false);
  const [excelErr, setExcelErr] = useState<string | null>(null);
  const [excelResult, setExcelResult] = useState<ExcelImportResult | null>(
    null
  );
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [userConfirmedDownloaded, setUserConfirmedDownloaded] = useState(false);

  const variantKeyRef = useRef(0);
  const createVariant = (isDefault = false): VariantForm => {
    variantKeyRef.current += 1;
    return {
      key: `variant-${variantKeyRef.current}`,
      size: "",
      sku: "",
      stockQuantity: "",
      isDefault,
    };
  };

  const [variantForms, setVariantForms] = useState<VariantForm[]>(() => [
    createVariant(true),
  ]);

  const totalVariantStock = variantForms.reduce((sum, variant) => {
    const parsed = Number(variant.stockQuantity);
    if (!Number.isFinite(parsed)) {
      return sum;
    }
    return sum + (parsed < 0 ? 0 : parsed);
  }, 0);

  const handleVariantFieldChange = (
    key: string,
    field: "size" | "sku"
  ) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setVariantForms((prev) =>
        prev.map((variant) =>
          variant.key === key ? { ...variant, [field]: value } : variant
        )
      );
    };

  const handleVariantStockChange = (key: string) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setVariantForms((prev) =>
        prev.map((variant) => {
          if (variant.key !== key) return variant;
          if (rawValue === "") {
            return { ...variant, stockQuantity: "" };
          }

          const parsed = Number(rawValue);
          if (!Number.isFinite(parsed)) {
            return variant;
          }

          const sanitized = parsed < 0 ? 0 : parsed;
          return { ...variant, stockQuantity: String(sanitized) };
        })
      );
    };

  const handleAddVariant = () => {
    setVariantForms((prev) => {
      const next = createVariant(prev.length === 0);
      if (prev.length === 0) {
        return [next];
      }
      return [...prev, next];
    });
  };

  const handleRemoveVariant = (key: string) => {
    setVariantForms((prev) => {
      const filtered = prev.filter((variant) => variant.key !== key);
      if (filtered.length === prev.length) {
        return prev;
      }

      if (filtered.length === 0) {
        return [createVariant(true)];
      }

      if (!filtered.some((variant) => variant.isDefault)) {
        const [first, ...rest] = filtered;
        return [{ ...first, isDefault: true }, ...rest];
      }

      return filtered;
    });
  };

  const handleSetDefaultVariant = (key: string) => {
    setVariantForms((prev) =>
      prev.map((variant) => ({
        ...variant,
        isDefault: variant.key === key,
      }))
    );
  };

  // ✅ useEffect'leri düzenleyin - çakışmaları önlemek için
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

  // ✅ Validation setup - sadece bir kez
  useEffect(() => {
    const timer = setTimeout(() => {
      setupTurkishValidation();
    }, 200);

    return () => clearTimeout(timer);
  }, [catOpts]); // Categories yüklendikten sonra validation setup et

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    if (!validateFormInTurkish(formElement)) {
      // Validation başarısızsa işlemi durdur
      return;
    }
    try {
      setSaving(true);
      setError(null);

      // Frontend validasyonları
      if (!form.name.trim()) throw new Error("Ad zorunludur.");
      if (!form.code.trim()) throw new Error("Kod zorunludur.");
      if (!form.categoryId || form.categoryId <= 0)
        throw new Error("Lütfen bir kategori seçiniz.");
      if (!form.unit || !form.unit.trim())
        throw new Error("Birim zorunludur (örn. 'adet').");
      if (!form.lotNumber || !form.lotNumber.trim())
        throw new Error("Lot numarası zorunludur.");

      const sanitizedVariants: ProductVariantInput[] = variantForms
        .map((variant): ProductVariantInput | null => {
          const trimmedSize = variant.size.trim();
          if (!trimmedSize) {
            return null;
          }

          const trimmedSku = variant.sku.trim();
          const stockRaw = variant.stockQuantity.trim();

          let stockQuantity: number | undefined;
          if (stockRaw !== "") {
            const parsedStock = Number(stockRaw);
            if (Number.isFinite(parsedStock)) {
              stockQuantity = parsedStock < 0 ? 0 : parsedStock;
            }
          }

          return {
            size: trimmedSize,
            sku: trimmedSku ? trimmedSku : undefined,
            stockQuantity,
            isDefault: variant.isDefault === true,
          };
        })
        .filter((variant): variant is ProductVariantInput => variant !== null);

      if (sanitizedVariants.length === 0) {
        throw new Error(
          "En az bir varyant eklemelisiniz ve her varyant için boyut alanı doldurulmalıdır."
        );
      }

      if (!sanitizedVariants.some((variant) => variant.isDefault)) {
        sanitizedVariants[0] = {
          ...sanitizedVariants[0],
          isDefault: true,
        };
      }

      const defaultVariant =
        sanitizedVariants.find((variant) => variant.isDefault) ||
        sanitizedVariants[0];

      const aggregateVariantStock = sanitizedVariants.reduce((sum, variant) => {
        const stock =
          typeof variant.stockQuantity === "number" ? variant.stockQuantity : 0;
        return sum + stock;
      }, 0);

      // Payload hazırlama
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
        unit: form.unit?.trim() || "",
        barcode: form.barcode?.trim() || "",
        lotNumber: form.lotNumber?.trim(),
        weightGrams: numOrUndef(form.weightGrams),
        shelfLifeMonths: numOrUndef(form.shelfLifeMonths),
        stockQuantity: numOrUndef(form.stockQuantity),
        minimumOrderQuantity: numOrUndef(form.minimumOrderQuantity),
        maximumOrderQuantity: numOrUndef(form.maximumOrderQuantity),
        manufacturingDate: form.manufacturingDate || "",
        expiryDate: form.expiryDate || "",
        sterile: !!form.sterile,
        singleUse: !!form.singleUse,
        implantable: !!form.implantable,
        ceMarking: !!form.ceMarking,
        fdaApproved: !!form.fdaApproved,
      };

      payload.variants = sanitizedVariants;

      if (defaultVariant?.size) {
        payload.size = defaultVariant.size;
      }

      if (payload.stockQuantity === undefined || payload.stockQuantity === null) {
        payload.stockQuantity = aggregateVariantStock;
      }

      const created = await createProduct(payload);

      // Başarı SweetAlert'i
      await MySwal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Ürün başarıyla oluşturuldu. Şimdi resim ekleme sayfasına yönlendiriliyorsunuz.",
        confirmButtonText: "Tamam",
        timer: 3000,
        timerProgressBar: true,
      });

      nav(`/products/${created.id}/images`);
    } catch (err: any) {
      // Frontend validation hatası
      if (err?.message && !err?.response) {
        await MySwal.fire({
          icon: "warning",
          title: "Eksik Bilgi",
          text: err.message,
          confirmButtonText: "Tamam",
        });
        return;
      }

      // Backend hata mesajını işle
      let errorTitle = "Ürün Oluşturma Hatası";
      let errorMessage = "Ürün oluşturulurken bilinmeyen bir hata oluştu.";
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
            if (Array.isArray(data.errors)) {
              errorMessage = `<ul class="text-start mb-0">
              ${data.errors
                .map((error: string) => `<li>${error}</li>`)
                .join("")}
            </ul>`;
              isHtml = true;
            } else if (typeof data.errors === "object") {
              const fieldErrors = Object.entries(data.errors)
                .map(([field, msgs]) => {
                  const fieldName = getFieldDisplayName(field);
                  const message = Array.isArray(msgs) ? msgs.join(", ") : msgs;
                  return `<li><strong>${fieldName}:</strong> ${message}</li>`;
                })
                .join("");
              errorMessage = `<ul class="text-start mb-0">${fieldErrors}</ul>`;
              isHtml = true;
            }
          }
        } else if (status === 409) {
          errorTitle = "Çakışma Hatası";
          errorMessage =
            data?.message ||
            data?.title ||
            "Bu ürün kodu zaten kullanılıyor. Lütfen farklı bir kod deneyin.";
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
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      setExcelErr(null);
      setExcelBusy(true);
      await downloadProductsExcelTemplate();
      setExcelMode("UPLOAD");
    } catch (e: any) {
      setExcelErr(e?.message || "Şablon indirilemedi.");
    } finally {
      setExcelBusy(false);
    }
  }

  function onPickExcel(e: React.ChangeEvent<HTMLInputElement>) {
    setExcelErr(null);
    setExcelResult(null);
    setPickedFile(e.target.files?.[0] ?? null);
  }

  async function handleExcelImport() {
    if (!pickedFile) {
      setExcelErr("Lütfen Excel dosyası seçin.");
      return;
    }
    if (!userConfirmedDownloaded) {
      setExcelErr("Lütfen önce şablonu indirdiğinizi onaylayın.");
      return;
    }
    try {
      setExcelErr(null);
      setExcelBusy(true);
      const res = await importProductsExcel(pickedFile);
      setExcelResult(res);
    } catch (e: any) {
      setExcelErr(
        e?.response?.data?.message ||
          e?.message ||
          "Excel içe aktarma başarısız."
      );
    } finally {
      setExcelBusy(false);
    }
  }

  const handleExportExcel = async () => {
    try {
      const blob = await exportProductsToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "urunler.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Ürünler Excel'e aktarılamadı!");
    }
  };

  return (
    <div className="col-lg-12 col-md-12 col-12 register-add-form">
      <div className="sherah-wc__form">
        <div className="w-100 p-4 bg-white rounded-4">
          <h3 className="sherah-wc__form-title sherah-wc__form-title__one">
            Ürün Oluştur <span>Lütfen aşağıdaki bilgileri doldurun</span>
          </h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row">
            <div className="col-lg-8 col-md-12 col-12">
              <form onSubmit={submit} className="sherah-wc__form-main p-0">
                <div className="row g-3">
                  {/* Temel */}
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Ad *{" "}
                        <small className="text-muted">
                          (örn. Titanyum İmplant)
                        </small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="sherah-wc__form-input"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Kod *{" "}
                        <small className="text-muted">(örn. TI-001)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="sherah-wc__form-input"
                          value={form.code}
                          onChange={(e) =>
                            setForm({ ...form, code: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kategori */}
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Kategori *{" "}
                        <small className="text-muted">(seçiniz)</small>
                      </label>
                      <select
                        className="sherah-wc__form-input"
                        value={form.categoryId || ""}
                        style={{ display: "block" }}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            categoryId: e.target.value
                              ? Number(e.target.value)
                              : 0,
                          })
                        }
                        disabled={loadingCats}
                        required
                      >
                        <option value="" style={{ display: "block" }}>
                          Seçiniz
                        </option>
                        {catOpts.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Birim & Lot */}
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Birim *{" "}
                        <small className="text-muted">(örn. adet, kutu)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="sherah-wc__form-input"
                          value={form.unit}
                          onChange={(e) =>
                            setForm({ ...form, unit: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-9 col-md-12 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Lot Numarası *{" "}
                        <small className="text-muted">
                          (örn. LOT-2024-001)
                        </small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="sherah-wc__form-input"
                          value={form.lotNumber || ""}
                          onChange={(e) =>
                            setForm({ ...form, lotNumber: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div>
                          <h6 className="mb-0">Varyantlar</h6>
                          <small className="text-muted">
                            Toplam stok: <strong>{totalVariantStock}</strong>
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={handleAddVariant}
                          disabled={saving}
                        >
                          Varyant Ekle
                        </button>
                      </div>

                     {variantForms.length === 0 ? (
  <p className="text-muted mb-0">
    Henüz varyant eklenmedi. "Varyant Ekle" butonu ile yeni
    varyantlar oluşturabilirsiniz.
  </p>
) : (
  <div className="d-flex flex-column gap-3">
    {variantForms.map((variant, index) => (
      <div key={variant.key} className="border rounded p-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <span className="fw-semibold">Varyant #{index + 1}</span>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div 
              className="d-flex align-items-center gap-2 cursor-pointer"
              onClick={() => handleSetDefaultVariant(variant.key)}
              style={{ cursor: 'pointer' }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #0d6efd',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: variant.isDefault ? '#0d6efd' : 'white',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                {variant.isDefault && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <label 
                className="mb-0"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Varsayılan
              </label>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleRemoveVariant(variant.key)}
              disabled={saving || variantForms.length === 1}
            >
              Sil
            </button>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-4 col-12">
            <div className="form-group mb-0">
              <label className="sherah-wc__form-label">
                Boyut * {" "}
                <small className="text-muted">(örn. 4.5mm)</small>
              </label>
              <input
                className="sherah-wc__form-input"
                value={variant.size}
                onChange={handleVariantFieldChange(variant.key, "size")}
                required
              />
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div className="form-group mb-0">
              <label className="sherah-wc__form-label">SKU</label>
              <input
                className="sherah-wc__form-input"
                value={variant.sku}
                onChange={handleVariantFieldChange(variant.key, "sku")}
              />
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div className="form-group mb-0">
              <label className="sherah-wc__form-label">Stok</label>
              <input
                type="number"
                min={0}
                className="sherah-wc__form-input"
                value={variant.stockQuantity}
                onChange={handleVariantStockChange(variant.key)}
              />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

                      <p className="text-muted small mb-0 mt-3">
                        Varsayılan varyant, ürün detay sayfalarında başlangıç olarak
                        gösterilecek boyutu belirler.
                      </p>
                    </div>
                  </div>

                  {/* Malzeme / Ölçüler */}
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Malzeme{" "}
                        <small className="text-muted">(örn. Titanyum)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="sherah-wc__form-input"
                          value={form.material || ""}
                          onChange={(e) =>
                            setForm({ ...form, material: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Boyut <small className="text-muted">(örn. 4.5mm)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="sherah-wc__form-input"
                          value={form.size || ""}
                          onChange={(e) =>
                            setForm({ ...form, size: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Çap <small className="text-muted">(örn. 6.0mm)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          value={form.diameter || ""}
                          onChange={(e) =>
                            setForm({ ...form, diameter: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Açı <small className="text-muted">(örn. 30°)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          value={form.angle || ""}
                          onChange={(e) =>
                            setForm({ ...form, angle: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Görünüm */}
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Renk
                        <small className="text-muted">
                          (örn:red,silver,white..)
                        </small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          value={form.color || ""}
                          onChange={(e) =>
                            setForm({ ...form, color: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Yüzey İşlemi{" "}
                        <small className="text-muted">(örn. Anodize)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          value={form.surfaceTreatment || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              surfaceTreatment: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seri / Üretici */}
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Seri No{" "}
                        <small className="text-muted">(örn. SN-2024-001)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          value={form.serialNumber || ""}
                          onChange={(e) =>
                            setForm({ ...form, serialNumber: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Üretici Kodu{" "}
                        <small className="text-muted">(örn. MFG-001)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          value={form.manufacturerCode || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              manufacturerCode: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tarihler */}
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Medikal Cihaz Sınıfı{" "}
                        <small className="text-muted">(örn. Class II)</small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          value={form.medicalDeviceClass || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              medicalDeviceClass: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Son Kullanma Tarihi{" "}
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          type="date"
                          value={form.expiryDate || ""}
                          onChange={(e) =>
                            setForm({ ...form, expiryDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {/* Medikal */}
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Üretim Tarihi{" "}
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          type="date"
                          value={form.manufacturingDate || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              manufacturingDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-6 col-12">
                    <div className="form-group">
                      <label className="sherah-wc__form-label">
                        Regülasyon No{" "}
                        <small className="text-muted">
                          (örn. REG-2024-001)
                        </small>
                      </label>
                      <div className="form-group__input">
                        <input
                          className="herah-wc__form-input"
                          value={form.regulatoryNumber || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              regulatoryNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sayısal diğ. */}

                  <div className="col-lg-4 col-md-12 col-12">
                    <label className="sherah-wc__form-label">
                      Ağırlık (gram){" "}
                      <small className="text-muted">(örn. 15.5)</small>
                    </label>
                    <input
                      step="any" // Bu satırı ekleyin
                      type="number"
                      className="sherah-wc__form-input"
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
                      placeholder="14.5"
                    />
                  </div>
                  <div className="col-lg-4 col-md-12 col-12">
                    <label className="sherah-wc__form-label">
                      Raf Ömrü (ay){" "}
                      <small className="text-muted">(örn. 36)</small>
                    </label>
                    <input
                      type="number"
                      className="herah-wc__form-input"
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

                  <div className="col-lg-4 col-md-12 col-12">
                    <label className="sherah-wc__form-label">
                      Boyutlar{" "}
                      <small className="text-muted">(örn. 10x15x20mm)</small>
                    </label>
                    <input
                      className="herah-wc__form-input"
                      value={form.dimensions || ""}
                      onChange={(e) =>
                        setForm({ ...form, dimensions: e.target.value })
                      }
                    />
                  </div>

                  {/* Sipariş limitleri */}
                  <div className="col-lg-4 col-md-12 col-12">
                    <label className="sherah-wc__form-label">
                      Minimum Sipariş{" "}
                      <small className="text-muted">(örn. 1)</small>
                    </label>
                    <input
                      className="herah-wc__form-input"
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

                  <div className="col-lg-4 col-md-12 col-12">
                    <label className="sherah-wc__form-label">
                      Maksimum Sipariş{" "}
                      <small className="text-muted">(örn. 1000)</small>
                    </label>
                    <input
                      className="herah-wc__form-input"
                      type="number"
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
                  <div className="col-lg-4 col-md-12 col-12">
                    <label className="sherah-wc__form-label">
                      Barkod{" "}
                      <small className="text-muted">(örn. 1234567890123)</small>
                    </label>
                    <input
                      className="herah-wc__form-input"
                      value={form.barcode || ""}
                      onChange={(e) =>
                        setForm({ ...form, barcode: e.target.value })
                      }
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
                      <div key={sw.id} className="form-check form-switch mb-0">
                        <input
                          className="form-check-input mb-0 border"
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
                        <label
                          className="form-check-label mb-0 mt-1 lh-sm"
                          htmlFor={sw.id}
                        >
                          {sw.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Açıklama */}
                  <div className="col-12">
                    <label className="sherah-wc__form-label">
                      Açıklama{" "}
                      <small className="text-muted">
                        (örn. Yüksek kaliteli titanyum implant)
                      </small>
                    </label>
                    <textarea
                      className="herah-wc__form-inpu"
                      rows={3}
                      value={form.description ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-lg-3 col-md-12 col-12">
                    <div className="form-group mt-1">
                      <div className="sherah-wc__button sherah-wc__button--bottom">
                        <button className="ntfmax-wc__btn" disabled={saving}>
                          {saving ? "Kaydediliyor…" : "Kaydet ve Resim Ekle"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-lg-4 col-md-12 col-12">
              <div className="sherah-default-bg p-3 mb-4 border border-primary rounded-3">
                <h5 className="mb-2">Ürünleri Excel'e Aktar</h5>
                <p className="text-muted mb-2">
                  Sistemdeki Ürünleri Excel Tablosuna Aktarıp İndirmek İçin
                  Tıklayınız
                </p>
                <button
                  type="button"
                  className="sherah-btn sherah-btn__primary"
                  onClick={handleExportExcel}
                >
                  Ürünleri Excel'e Aktar
                </button>
              </div>
              <div className="sherah-default-bg p-3 mb-4 border border-primary rounded-3">
                <h5 className="mb-2">Excel ile Ürün Ekle</h5>

                {excelMode === "TEMPLATE" ? (
                  <>
                    <p className="text-muted mb-2">
                      Önce Excel şablonunu indirip ürünleri tabloya ekleyin.
                    </p>
                    <button
                      type="button"
                      className="sherah-btn sherah-btn__primary"
                      onClick={handleDownloadTemplate}
                      disabled={excelBusy}
                    >
                      {excelBusy
                        ? "İndiriliyor…"
                        : "Excel ile Ürün Ekle (Şablonu İndir)"}
                    </button>
                    {excelErr && (
                      <div className="alert alert-danger mt-3" role="alert">
                        {excelErr}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-muted">
                      Şablonu doldurduysanız Excel’i yükleyerek ürünleri
                      oluşturun/güncelleyin.
                    </p>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="form-control"
                        onChange={onPickExcel}
                        disabled={excelBusy}
                      />
                    </div>

                    <div className="form-check mb-2">
                      <input
                        id="confirmDownloaded"
                        type="checkbox"
                        className="form-check-input"
                        checked={userConfirmedDownloaded}
                        onChange={(e) =>
                          setUserConfirmedDownloaded(e.target.checked)
                        }
                        disabled={excelBusy}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="confirmDownloaded"
                      >
                        Şablonu indirdim ve doldurdum
                      </label>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="sherah-btn sherah-btn__primary bg-primary"
                        onClick={handleExcelImport}
                        disabled={
                          excelBusy || !pickedFile || !userConfirmedDownloaded
                        }
                      >
                        {excelBusy ? "Yükleniyor…" : "Excel ile Ürün Yükle"}
                      </button>

                      <button
                        type="button"
                        className="sherah-btn sherah-btn__primary"
                        onClick={() => {
                          // akışı başa almak istersen:
                          setExcelMode("TEMPLATE");
                          setExcelErr(null);
                          setExcelResult(null);
                          setPickedFile(null);
                          setUserConfirmedDownloaded(false);
                        }}
                        disabled={excelBusy}
                      >
                        Başa Dön
                      </button>
                    </div>

                    {excelErr && (
                      <div className="alert alert-danger mt-3" role="alert">
                        {excelErr}
                      </div>
                    )}

                    {excelResult && (
                      <div className="mt-3">
                        <h6>İçe Aktarma Özeti</h6>
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item">
                            Toplam Satır:{" "}
                            <strong>{excelResult.totalRows}</strong>
                          </li>
                          <li className="list-group-item">
                            Başarılı:{" "}
                            <strong>{excelResult.successCount}</strong>
                          </li>
                          <li className="list-group-item">
                            Başarısız:{" "}
                            <strong>{excelResult.failedCount}</strong>
                          </li>
                          <li className="list-group-item">
                            Güncellenen:{" "}
                            <strong>{excelResult.updatedCount}</strong>
                          </li>
                          <li className="list-group-item">
                            Oluşturulan:{" "}
                            <strong>{excelResult.createdCount}</strong>
                          </li>
                        </ul>

                        {excelResult.errors?.length > 0 && (
                          <>
                            <h6 className="mt-3">
                              Hatalar ({excelResult.errors.length})
                            </h6>
                            <div className="table-responsive">
                              <table className="table table-sm table-striped align-middle">
                                <thead>
                                  <tr>
                                    <th># Satır</th>
                                    <th>Ürün Kodu</th>
                                    <th>Hata</th>
                                    <th>Ham Satır</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {excelResult.errors.map((e, i) => (
                                    <tr key={i}>
                                      <td>{e.rowNumber}</td>
                                      <td>{e.productCode || "-"}</td>
                                      <td>{e.errorMessage || "-"}</td>
                                      <td
                                        className="text-truncate"
                                        style={{ maxWidth: 420 }}
                                      >
                                        {e.rowData || "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
