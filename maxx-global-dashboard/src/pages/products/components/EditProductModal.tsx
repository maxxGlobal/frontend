import React, { useEffect, useRef, useState } from "react";
import { updateProduct } from "../../../services/products/update";
import { getProductById } from "../../../services/products/getById";
import type {
  ProductUpdateRequest,
  Product,
  ProductVariantInput,
} from "../../../types/product";
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

interface VariantForm {
  key: string;
  id?: number | null;
  size: string;
  sku: string;
  stockQuantity: string;
  isDefault: boolean;
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
  const [variantForms, setVariantForms] = useState<VariantForm[]>([]);
  const variantKeyRef = useRef(0);
  const MySwal = withReactContent(Swal);

  const getNextVariantKey = () => {
    variantKeyRef.current += 1;
    return `variant-new-${variantKeyRef.current}-${Date.now()}`;
  };
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

        const defaultVariantId =
          p.defaultVariantId != null && Number.isFinite(Number(p.defaultVariantId))
            ? Number(p.defaultVariantId)
            : null;

        const mappedVariants = Array.isArray(p.variants)
          ? p.variants.map((variant, index) => {
            const rawId =
              variant?.id !== null && variant?.id !== undefined
                ? Number(variant.id)
                : null;
            const normalizedId =
              rawId !== null && Number.isFinite(rawId) ? rawId : undefined;

            const sizeValue =
              variant?.size !== null && variant?.size !== undefined
                ? String(variant.size)
                : "";
            const skuValue =
              variant?.sku !== null && variant?.sku !== undefined
                ? String(variant.sku)
                : "";
            const stockValue =
              variant?.stockQuantity !== null &&
                variant?.stockQuantity !== undefined &&
                Number.isFinite(Number(variant.stockQuantity))
                ? String(Number(variant.stockQuantity))
                : "";

            const key =
              normalizedId !== undefined
                ? `variant-${normalizedId}`
                : `variant-temp-${Date.now()}-${index}`;

            const matchesDefault =
              defaultVariantId !== null &&
              normalizedId !== undefined &&
              normalizedId === defaultVariantId;

            return {
              key,
              id: normalizedId,
              size: sizeValue,
              sku: skuValue,
              stockQuantity: stockValue,
              isDefault: Boolean(variant?.isDefault ?? matchesDefault),
            } as VariantForm;
          })
          : [];

        const normalizedVariants = mappedVariants.length
          ? [...mappedVariants]
          : [];

        if (normalizedVariants.length > 0) {
          variantKeyRef.current = Math.max(
            variantKeyRef.current,
            normalizedVariants.length
          );
        }

        if (
          normalizedVariants.length > 0 &&
          !normalizedVariants.some((variant) => variant.isDefault)
        ) {
          normalizedVariants[0] = {
            ...normalizedVariants[0],
            isDefault: true,
          };
        }

        setVariantForms(normalizedVariants);
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
  }, [form, bootLoading, variantForms.length]);

  const numberFields = new Set([
    "weightGrams",
    "shelfLifeMonths",
    "stockQuantity",
    "minimumOrderQuantity",
    "maximumOrderQuantity",
  ]);

  const handleVariantFieldChange = (
    key: string,
    field: "size" | "sku"
  ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setVariantForms((prev) =>
        prev.map((variant) =>
          variant.key === key ? { ...variant, [field]: value } : variant
        )
      );
    };

  const handleVariantStockChange = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const nextVariant: VariantForm = {
        key: getNextVariantKey(),
        id: undefined,
        size: "",
        sku: "",
        stockQuantity: "",
        isDefault: prev.length === 0,
      };

      if (prev.length === 0) {
        return [nextVariant];
      }

      return [...prev, nextVariant];
    });
  };

  const handleRemoveVariant = (key: string) => {
    setVariantForms((prev) => {
      const filtered = prev.filter((variant) => variant.key !== key);
      if (filtered.length === 0) {
        return filtered;
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

          const parsedId =
            variant.id !== null && variant.id !== undefined
              ? Number(variant.id)
              : undefined;
          const normalizedId =
            parsedId !== undefined && Number.isFinite(parsedId)
              ? parsedId
              : undefined;

          return {
            id: normalizedId,
            size: trimmedSize,
            sku: trimmedSku ? trimmedSku : undefined,
            stockQuantity,
            isDefault: variant.isDefault === true,
          };
        })
        .filter((variant): variant is ProductVariantInput => variant !== null);

      if (
        sanitizedVariants.length > 0 &&
        !sanitizedVariants.some((variant) => variant.isDefault)
      ) {
        sanitizedVariants[0] = {
          ...sanitizedVariants[0],
          isDefault: true,
        };
      }

      const payload: ProductUpdateRequest = {
        ...form,
        categoryId: Number(form.categoryId) || 0,
        weightGrams: num(form.weightGrams),
        shelfLifeMonths: num(form.shelfLifeMonths),
        stockQuantity: num(form.stockQuantity),
        minimumOrderQuantity: num(form.minimumOrderQuantity),
        maximumOrderQuantity: num(form.maximumOrderQuantity),
      };

      payload.variants = sanitizedVariants;

      if (sanitizedVariants.length > 0) {
        const defaultVariantPayload =
          sanitizedVariants.find((variant) => variant.isDefault) ??
          sanitizedVariants[0];
        if (defaultVariantPayload?.size) {
          payload.size = defaultVariantPayload.size;
        }

        if (
          payload.stockQuantity === undefined ||
          payload.stockQuantity === null
        ) {
          const aggregateStock = sanitizedVariants.reduce((sum, variant) => {
            const stock =
              typeof variant.stockQuantity === "number"
                ? variant.stockQuantity
                : 0;
            return sum + stock;
          }, 0);

          payload.stockQuantity = aggregateStock;
        }
      }

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

                  <div className="col-12">
                    <div className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h6 className="mb-0">Varyantlar</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={handleAddVariant}
                          disabled={loading}
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
                                    disabled={loading}
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
