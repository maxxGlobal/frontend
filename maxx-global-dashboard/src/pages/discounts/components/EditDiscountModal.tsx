import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import type { Discount, DiscountUpdateRequest } from "../../../types/discount";
import { updateDiscount } from "../../../services/discounts/update";
import { getProductById } from "../../../services/products/getById";
import type { ProductSimple } from "../../../types/product";
import type { DealerSummary } from "../../../types/dealer";
import type { CategoryRow } from "../../../types/category";
import type { ProductVariant } from "../../../services/products/getById";
import { useSimpleProducts } from "../../../services/products/queries";
import { useSimpleDealers } from "../../../services/dealers/queries";
import { useAllCategories } from "../../../services/categories/queries";

type DiscountTypeCanonical = "PERCENTAGE" | "FIXED_AMOUNT";
function normalizeDiscountType(input: unknown): DiscountTypeCanonical {
  const raw = String(input ?? "").trim();
  if (raw === "PERCENTAGE" || raw === "FIXED_AMOUNT") return raw;
  const u = raw.toLocaleUpperCase("tr-TR");
  if (u.includes("YÜZ") || u.includes("PERC")) return "PERCENTAGE";
  if (u.includes("SAB") || u.includes("FIX")) return "FIXED_AMOUNT";
  return "PERCENTAGE";
}

function toInputLocal(iso: string | undefined) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function ensureSeconds(v: string) {
  if (!v) return v;
  return v.length === 16 ? `${v}:00` : v;
}

type Props = {
  target: Discount;
  onClose: () => void;
  onSaved: (updated: Discount) => void;
};

export default function EditDiscountModal({ target, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);

  // Form alanları
  const [name, setName] = useState(target.name ?? "");
  const [nameEn, setNameEn] = useState(target.nameEn ?? "");
  const [description, setDescription] = useState(target.description ?? "");
  const [descriptionEn, setDescriptionEn] = useState(
    target.descriptionEn ?? ""
  );
  const [discountType, setDiscountType] = useState<DiscountTypeCanonical>(
    normalizeDiscountType((target as any).discountType)
  );
  const [discountValue, setDiscountValue] = useState<number>(
    target.discountValue ?? 0
  );
  const [startDate, setStartDate] = useState<string>(
    toInputLocal(target.startDate)
  );
  const [endDate, setEndDate] = useState<string>(toInputLocal(target.endDate));
  const [isActive, setIsActive] = useState<boolean>(!!target.isActive);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<string>(
    target.minimumOrderAmount != null ? String(target.minimumOrderAmount) : ""
  );
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState<string>(
    target.maximumDiscountAmount != null
      ? String(target.maximumDiscountAmount)
      : ""
  );

  // Yeni alanlar
  const [usageLimit, setUsageLimit] = useState<string>(
    target.usageLimit != null ? String(target.usageLimit) : ""
  );
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState<string>(
    target.usageLimitPerCustomer != null
      ? String(target.usageLimitPerCustomer)
      : ""
  );
  const [discountCode, setDiscountCode] = useState<string>(
    target.discountCode ?? ""
  );
  const [autoApply, setAutoApply] = useState<boolean>(!!target.autoApply);
  const [priority, setPriority] = useState<string>(
    target.priority != null ? String(target.priority) : ""
  );
  const [stackable, setStackable] = useState<boolean>(!!target.stackable);
  const [configurationSummary, setConfigurationSummary] = useState<string>(
    target.configurationSummary ?? ""
  );

  // Seçenekler
  const { data: productOpts = [], isLoading: loadingProducts } =
    useSimpleProducts();
  const { data: dealerOpts = [], isLoading: loadingDealers } =
    useSimpleDealers();
  const { data: categoryOpts = [], isLoading: loadingCategories } =
    useAllCategories();
  const optsLoading = loadingProducts || loadingDealers || loadingCategories;

  // ✅ Variant seçimi
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productVariants, setProductVariants] = useState<
    Map<number, ProductVariant[]>
  >(new Map());
  const [loadingVariants, setLoadingVariants] = useState<Set<number>>(
    new Set()
  );
  const [variantIds, setVariantIds] = useState<number[]>([]);
  const [dealerIds, setDealerIds] = useState<number[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  // İndirim kapsamı
  const [discountScope, setDiscountScope] = useState<
    "general" | "variant" | "category"
  >(() => {
    const hasVariants =
      target.applicableVariants && target.applicableVariants.length > 0;
    const hasCategories =
      target.applicableCategories && target.applicableCategories.length > 0;

    if (hasCategories) return "category";
    if (hasVariants) return "variant";
    return "general";
  });

  const [productFilter, setProductFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Target değiştiğinde formu güncelle
  useEffect(() => {
    setName(target.name ?? "");
    setNameEn(target.nameEn ?? "");
    setDescription(target.description ?? "");
    setDescriptionEn(target.descriptionEn ?? "");
    setDiscountType(normalizeDiscountType((target as any).discountType));
    setDiscountValue(target.discountValue ?? 0);
    setStartDate(toInputLocal(target.startDate));
    setEndDate(toInputLocal(target.endDate));
    setIsActive(!!target.isActive);
    setMinimumOrderAmount(
      target.minimumOrderAmount != null ? String(target.minimumOrderAmount) : ""
    );
    setMaximumDiscountAmount(
      target.maximumDiscountAmount != null
        ? String(target.maximumDiscountAmount)
        : ""
    );
    setUsageLimit(
      target.usageLimit != null ? String(target.usageLimit) : ""
    );
    setUsageLimitPerCustomer(
      target.usageLimitPerCustomer != null
        ? String(target.usageLimitPerCustomer)
        : ""
    );
    setDiscountCode(target.discountCode ?? "");
    setAutoApply(!!target.autoApply);
    setPriority(target.priority != null ? String(target.priority) : "");
    setStackable(!!target.stackable);
    setConfigurationSummary(target.configurationSummary ?? "");

    // ✅ Variant ID'leri
    const vIds =
      target.applicableVariants?.map((v) => v.id) ?? [];
    setVariantIds(vIds);

    // Variant'ların product ID'lerini bul
    const productIds = Array.from(
      new Set(target.applicableVariants?.map((v) => v.productId) ?? [])
    );
    setSelectedProducts(productIds);

    setDealerIds(target.applicableDealers?.map((d) => d.id) ?? []);
    setCategoryIds(target.applicableCategories?.map((c) => c.id) ?? []);

    // Scope'u belirle
    const hasVariants =
      target.applicableVariants && target.applicableVariants.length > 0;
    const hasCategories =
      target.applicableCategories && target.applicableCategories.length > 0;

    if (hasCategories) setDiscountScope("category");
    else if (hasVariants) setDiscountScope("variant");
    else setDiscountScope("general");
  }, [target]);

  const sortedProducts = useMemo(
    () => [...productOpts].sort((a, b) => a.name.localeCompare(b.name)),
    [productOpts]
  );
  const sortedDealers = useMemo(
    () => [...dealerOpts].sort((a, b) => a.name.localeCompare(b.name)),
    [dealerOpts]
  );
  const sortedCategories = useMemo(
    () => [...categoryOpts].sort((a, b) => a.name.localeCompare(b.name)),
    [categoryOpts]
  );

  // ✅ Mevcut variant'ların ürünlerini yükle
  useEffect(() => {
    const loadInitialVariants = async () => {
      if (!target.applicableVariants || target.applicableVariants.length === 0)
        return;

      const productIds = Array.from(
        new Set(target.applicableVariants.map((v) => v.productId))
      );

      for (const productId of productIds) {
        await loadProductVariants(productId);
      }
    };

    loadInitialVariants();
  }, [target.applicableVariants]);

  // Variant yükleme
  const loadProductVariants = async (productId: number) => {
    if (productVariants.has(productId)) return;

    setLoadingVariants((prev) => new Set(prev).add(productId));
    try {
      const product = await getProductById(productId);
      if (product.variants && product.variants.length > 0) {
        setProductVariants((prev) =>
          new Map(prev).set(productId, product.variants!)
        );
      }
    } catch (err) {
      console.error("Varyantlar yüklenemedi:", err);
    } finally {
      setLoadingVariants((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Ürün toggle
  const toggleProduct = (productId: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        // Ürün kaldırılıyorsa varyantları temizle
        setVariantIds((vIds) => {
          const variants = productVariants.get(productId) || [];
          const variantIdsToRemove = new Set(variants.map((v) => v.id));
          return vIds.filter((id) => !variantIdsToRemove.has(id));
        });
        return prev.filter((id) => id !== productId);
      } else {
        loadProductVariants(productId);
        return [...prev, productId];
      }
    });
  };

  // Variant toggle
  const toggleVariant = (variantId: number) => {
    setVariantIds((prev) => {
      if (prev.includes(variantId)) {
        return prev.filter((id) => id !== variantId);
      } else {
        return [...prev, variantId];
      }
    });
  };

  // Filtrelenmiş listeler
  const filteredProducts = useMemo(() => {
    const q = productFilter.trim().toLowerCase();
    if (!q) return sortedProducts;
    return sortedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code ? p.code.toLowerCase().includes(q) : false)
    );
  }, [productFilter, sortedProducts]);

  const filteredDealers = useMemo(() => {
    const q = dealerFilter.trim().toLowerCase();
    if (!q) return sortedDealers;
    return sortedDealers.filter((d) => d.name.toLowerCase().includes(q));
  }, [dealerFilter, sortedDealers]);

  const filteredCategories = useMemo(() => {
    const q = categoryFilter.trim().toLowerCase();
    if (!q) return sortedCategories;
    return sortedCategories.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }, [categoryFilter, sortedCategories]);

  // Checkbox helpers
  function toggleId(
    current: number[],
    id: number,
    setter: (v: number[]) => void
  ) {
    if (current.includes(id)) setter(current.filter((x) => x !== id));
    else setter([...current, id]);
  }
  function selectAll(
    filtered: { id: number }[],
    setter: (v: number[]) => void
  ) {
    setter(Array.from(new Set(filtered.map((x) => x.id))));
  }
  function clearAll(setter: (v: number[]) => void) {
    setter([]);
  }

  // Scope değiştiğinde temizle
  useEffect(() => {
    if (discountScope === "general") {
      setSelectedProducts([]);
      setVariantIds([]);
      setCategoryIds([]);
    } else if (discountScope === "variant") {
      setCategoryIds([]);
    } else if (discountScope === "category") {
      setSelectedProducts([]);
      setVariantIds([]);
    }
  }, [discountScope]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire("Uyarı", "Ad zorunludur.", "warning");
      return;
    }
    if (!nameEn.trim()) {
      Swal.fire("Uyarı", "Ad (EN) zorunludur.", "warning");
      return;
    }
    if (!startDate || !endDate) {
      Swal.fire("Uyarı", "Başlangıç/Bitiş tarihleri zorunludur.", "warning");
      return;
    }

    // Scope kontrolleri
    if (discountScope === "variant" && variantIds.length === 0) {
      Swal.fire(
        "Uyarı",
        "Variant bazlı indirim için en az bir varyant seçmelisiniz.",
        "warning"
      );
      return;
    }
    if (discountScope === "category" && categoryIds.length === 0) {
      Swal.fire(
        "Uyarı",
        "Kategori bazlı indirim için en az bir kategori seçmelisiniz.",
        "warning"
      );
      return;
    }

    const ul =
      usageLimit.trim() === "" ? undefined : Number.parseInt(usageLimit, 10);
    const ulpc =
      usageLimitPerCustomer.trim() === ""
        ? undefined
        : Number.parseInt(usageLimitPerCustomer, 10);
    const prio =
      priority.trim() === "" ? undefined : Number.parseInt(priority, 10);

    if (ul !== undefined && (!Number.isFinite(ul) || ul < 0)) {
      Swal.fire(
        "Uyarı",
        "Toplam kullanım limiti 0 veya pozitif tamsayı olmalı.",
        "warning"
      );
      return;
    }
    if (ulpc !== undefined && (!Number.isFinite(ulpc) || ulpc < 0)) {
      Swal.fire(
        "Uyarı",
        "Müşteri başı kullanım limiti 0 veya pozitif tamsayı olmalı.",
        "warning"
      );
      return;
    }
    if (
      prio !== undefined &&
      (!Number.isFinite(prio) || prio < 0 || prio > 100)
    ) {
      Swal.fire("Uyarı", "Öncelik 0-100 arası olmalı.", "warning");
      return;
    }

    const payload: DiscountUpdateRequest = {
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      description: description?.trim() || "",
      descriptionEn: descriptionEn?.trim() || description?.trim() || "",
      discountType,
      discountValue: Number(discountValue),
      startDate: ensureSeconds(startDate),
      endDate: ensureSeconds(endDate),
      variantIds:
        discountScope === "variant" ? Array.from(new Set(variantIds)) : [],
      dealerIds: Array.from(new Set(dealerIds)),
      categoryIds:
        discountScope === "category" ? Array.from(new Set(categoryIds)) : [],
      isActive,
      minimumOrderAmount:
        minimumOrderAmount.trim() === ""
          ? undefined
          : Number(minimumOrderAmount),
      maximumDiscountAmount:
        maximumDiscountAmount.trim() === ""
          ? undefined
          : Number(maximumDiscountAmount),
      usageLimit: ul,
      usageLimitPerCustomer: ulpc,
      discountCode: discountCode.trim() || undefined,
      autoApply,
      priority: prio,
      stackable,
      dealerBasedDiscount: dealerIds.length > 0,
      variantBasedDiscount: discountScope === "variant",
      categoryBasedDiscount: discountScope === "category",
      generalDiscount: discountScope === "general",
      discountScope:
        discountScope === "variant"
          ? "VARIANT"
          : discountScope === "category"
            ? "CATEGORY"
            : "GENERAL",
      configurationSummary: configurationSummary.trim() || undefined,
    };

    try {
      setSaving(true);
      const updated = await updateDiscount(target.id, payload);
      await Swal.fire("Başarılı", "İndirim güncellendi", "success");
      onSaved(updated);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "İndirim güncellenemedi";
      Swal.fire("Hata", msg, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      role="dialog"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">İndirim Güncelle</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Temel bilgiler */}
              <div className="mb-3">
                <label className="form-label">Ad *</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Ad (EN) *</label>
                <input
                  className="form-control"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Discount Name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Açıklama</label>
                <input
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description (EN)</label>
                <input
                  className="form-control"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Discount description"
                />
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Tip *</label>
                  <select
                    className="form-select"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                  >
                    <option value="PERCENTAGE">Yüzde</option>
                    <option value="FIXED_AMOUNT">Sabit Tutar</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Değer *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={discountValue}
                    onChange={(e) =>
                      setDiscountValue(parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <div className="form-check mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActiveEditChk"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="isActiveEditChk"
                    >
                      Aktif mi?
                    </label>
                  </div>
                </div>
              </div>

              {/* ✅ İndirim Kodu ve Öncelik */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">İndirim Kodu</label>
                  <input
                    type="text"
                    className="form-control"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Öncelik (0-100)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* ✅ İndirim Kapsamı */}
              <div className="mb-3">
                <label className="form-label">İndirim Kapsamı *</label>
                <div className="d-flex gap-3 mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="discountScopeEdit"
                      id="scopeGeneralEdit"
                      value="general"
                      checked={discountScope === "general"}
                      onChange={(e) => setDiscountScope(e.target.value as any)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="scopeGeneralEdit"
                    >
                      Genel (Tüm Ürünler)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="discountScopeEdit"
                      id="scopeVariantEdit"
                      value="variant"
                      checked={discountScope === "variant"}
                      onChange={(e) => setDiscountScope(e.target.value as any)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="scopeVariantEdit"
                    >
                      Variant Bazlı
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="discountScopeEdit"
                      id="scopeCategoryEdit"
                      value="category"
                      checked={discountScope === "category"}
                      onChange={(e) => setDiscountScope(e.target.value as any)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="scopeCategoryEdit"
                    >
                      Kategori Bazlı
                    </label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Başlangıç *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Bitiş *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* ✅ VARIANT SEÇİMİ */}
              {discountScope === "variant" && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-end mb-1">
                    <label className="form-label mb-0">
                      Ürünler ve Varyantlar{" "}
                      {variantIds.length > 0 && (
                        <span className="text-muted">
                          • {variantIds.length} varyant seçili
                        </span>
                      )}
                    </label>
                  </div>

                  <input
                    className="form-control mb-2"
                    placeholder="Ürün ara (ad/kod)"
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    disabled={optsLoading}
                  />

                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: 300, overflow: "auto" }}
                  >
                    {optsLoading ? (
                      <div className="text-muted">Yükleniyor…</div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-muted">Kayıt yok.</div>
                    ) : (
                      filteredProducts.map((p) => {
                        const isProductSelected = selectedProducts.includes(
                          p.id
                        );
                        const variants = productVariants.get(p.id) || [];
                        const isLoadingVariants = loadingVariants.has(p.id);
                        const label = p.code ? `${p.name} (${p.code})` : p.name;

                        return (
                          <div key={p.id} className="mb-3 border-bottom pb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`prod_edit_${p.id}`}
                                checked={isProductSelected}
                                onChange={() => toggleProduct(p.id)}
                              />
                              <label
                                className="form-check-label fw-bold"
                                htmlFor={`prod_edit_${p.id}`}
                              >
                                {label}
                              </label>
                            </div>

                            {isProductSelected && (
                              <div className="ms-4 mt-1">
                                {isLoadingVariants ? (
                                  <div className="text-muted small">
                                    Yükleniyor...
                                  </div>
                                ) : variants.length === 0 ? (
                                  <div className="text-muted small">
                                    Varyant yok
                                  </div>
                                ) : (
                                  variants.map((variant) => (
                                    <div
                                      key={variant.id}
                                      className="form-check"
                                    >
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`variant_edit_${variant.id}`}
                                        checked={variantIds.includes(
                                          variant.id
                                        )}
                                        onChange={() =>
                                          toggleVariant(variant.id)
                                        }
                                      />
                                      <label
                                        className="form-check-label small"
                                        htmlFor={`variant_edit_${variant.id}`}
                                      >
                                        {variant.size || "Standart"}{" "}
                                        {variant.sku &&
                                          `(SKU: ${variant.sku})`}
                                      </label>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ✅ KATEGORİ SEÇİMİ */}
              {discountScope === "category" && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-end mb-1">
                    <label className="form-label mb-0">
                      Kategoriler{" "}
                      {categoryIds.length > 0 && (
                        <span className="text-muted">
                          • {categoryIds.length} seçili
                        </span>
                      )}
                    </label>
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          selectAll(filteredCategories, setCategoryIds)
                        }
                        disabled={
                          optsLoading || filteredCategories.length === 0
                        }
                      >
                        Tümünü Seç
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => clearAll(setCategoryIds)}
                        disabled={optsLoading || categoryIds.length === 0}
                      >
                        Temizle
                      </button>
                    </div>
                  </div>

                  <input
                    className="form-control mb-2"
                    placeholder="Kategori ara"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    disabled={optsLoading}
                  />

                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: 260, overflow: "auto" }}
                  >
                    {optsLoading ? (
                      <div className="text-muted">Yükleniyor…</div>
                    ) : filteredCategories.length === 0 ? (
                      <div className="text-muted">Kayıt yok.</div>
                    ) : (
                      filteredCategories.map((c) => {
                        const checked = categoryIds.includes(c.id);
                        const label = (c as any).label || c.name;
                        return (
                          <div className="form-check" key={c.id}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`cat_edit_${c.id}`}
                              checked={checked}
                              onChange={() =>
                                toggleId(categoryIds, c.id, setCategoryIds)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`cat_edit_${c.id}`}
                              style={{ fontFamily: "monospace" }}
                            >
                              {label}
                            </label>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* BAYİLER */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-end mb-1">
                  <label className="form-label mb-0">
                    Bayiler{" "}
                    {dealerIds.length > 0 && (
                      <span className="text-muted">
                        • {dealerIds.length} seçili
                      </span>
                    )}
                  </label>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => selectAll(filteredDealers, setDealerIds)}
                      disabled={optsLoading || filteredDealers.length === 0}
                    >
                      Tümünü Seç
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => clearAll(setDealerIds)}
                      disabled={optsLoading || dealerIds.length === 0}
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                <input
                  className="form-control mb-2"
                  placeholder="Bayi ara (ad)"
                  value={dealerFilter}
                  onChange={(e) => setDealerFilter(e.target.value)}
                  disabled={optsLoading}
                />

                <div
                  className="border rounded p-2"
                  style={{ maxHeight: 260, overflow: "auto" }}
                >
                  {optsLoading ? (
                    <div className="text-muted">Yükleniyor…</div>
                  ) : filteredDealers.length === 0 ? (
                    <div className="text-muted">Kayıt yok.</div>
                  ) : (
                    filteredDealers.map((d) => {
                      const checked = dealerIds.includes(d.id);
                      return (
                        <div className="form-check" key={d.id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`dealer_edit_${d.id}`}
                            checked={checked}
                            onChange={() =>
                              toggleId(dealerIds, d.id, setDealerIds)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`dealer_edit_${d.id}`}
                          >
                            {d.name}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Limitler */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Minimum Sipariş Tutarı</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={minimumOrderAmount}
                    onChange={(e) => setMinimumOrderAmount(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Maksimum İndirim Tutarı</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={maximumDiscountAmount}
                    onChange={(e) => setMaximumDiscountAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Kullanım limitleri */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Toplam Kullanım Limiti</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="form-control"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="örn. 100"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Müşteri Başı Kullanım Limiti
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="form-control"
                    value={usageLimitPerCustomer}
                    onChange={(e) => setUsageLimitPerCustomer(e.target.value)}
                    placeholder="örn. 1"
                  />
                </div>
              </div>

              {/* Yapılandırma Özeti */}
              <div className="mb-3">
                <label className="form-label">Yapılandırma Özeti</label>
                <textarea
                  className="form-control"
                  value={configurationSummary}
                  onChange={(e) => setConfigurationSummary(e.target.value)}
                  rows={3}
                  placeholder="Notlar veya yapılandırma özeti"
                />
              </div>

              {/* Checkbox'lar */}
              <div className="d-flex flex-wrap gap-3 mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="autoApplyEditChk"
                    checked={autoApply}
                    onChange={(e) => setAutoApply(e.target.checked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="autoApplyEditChk"
                  >
                    Otomatik Uygula
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="stackableEditChk"
                    checked={stackable}
                    onChange={(e) => setStackable(e.target.checked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="stackableEditChk"
                  >
                    Birleştirilebilir
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Kapat
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={saving}
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
