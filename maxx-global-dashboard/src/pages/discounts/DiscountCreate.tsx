/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/discounts/DiscountCreate.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { createDiscount } from "../../services/discounts/create";
import { getProductById } from "../../services/products/getById";
import type { DiscountCreateRequest } from "../../types/discount"; 
import type { ProductVariant } from "../../services/products/getById";
import { useSimpleProducts } from "../../services/products/queries";
import { useSimpleDealers } from "../../services/dealers/queries";
import { useAllCategories } from "../../services/categories/queries";

function ensureSeconds(v: string) {
  if (!v) return v;
  return v.length === 16 ? `${v}:00` : v;
}

export default function DiscountCreate() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [description, setDescription] = useState<string>("");
  const [descriptionEn, setDescriptionEn] = useState<string>("");
  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED_AMOUNT"
  >("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>(""); 
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<string>("");
  const [maximumDiscountAmount, setMaximumDiscountAmount] =
    useState<string>("");

  // ✅ Yeni alanlar
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] =
    useState<string>("");
  const [discountCode, setDiscountCode] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [autoApply, setAutoApply] = useState<boolean>(true);
  const [stackable, setStackable] = useState<boolean>(true);
  const [configurationSummary, setConfigurationSummary] =
    useState<string>("");

  // Seçenekler
  const { data: productOpts = [], isLoading: loadingProducts } =
    useSimpleProducts();
  const { data: dealerOpts = [], isLoading: loadingDealers } =
    useSimpleDealers();
  const { data: categoryOpts = [], isLoading: loadingCategories } =
    useAllCategories();
  const optsLoading = loadingProducts || loadingDealers || loadingCategories;


  // ✅ YENİ - Variant seçimi için
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productVariants, setProductVariants] = useState<Map<number, ProductVariant[]>>(
    new Map()
  );
  const [loadingVariants, setLoadingVariants] = useState<Set<number>>(new Set());
  const [variantIds, setVariantIds] = useState<number[]>([]);

  // Seçimler (checkbox)
  const [dealerIds, setDealerIds] = useState<number[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  // İndirim türü seçimi (variant/kategori/genel)
  const [discountScope, setDiscountScope] = useState<
    "general" | "variant" | "category"
  >("general");

  // Filtre
  const [productFilter, setProductFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

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

  // ✅ YENİ - Ürün seçildiğinde varyantlarını yükle
  const loadProductVariants = async (productId: number) => {
    if (productVariants.has(productId)) return; // Zaten yüklü

    setLoadingVariants((prev) => new Set(prev).add(productId));
    try {
      const product = await getProductById(productId);
      if (product.variants && product.variants.length > 0) {
        setProductVariants((prev) => new Map(prev).set(productId, product.variants!));
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

  // ✅ YENİ - Ürün checkbox toggle
  const toggleProduct = (productId: number) => {
      setPriority("")
      setIsActive(true)
      setAutoApply(false)
      setStackable(false)
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        // Ürün kaldırılıyorsa, o ürüne ait varyantları da temizle
        setVariantIds((vIds) => {
          const variants = productVariants.get(productId) || [];
          const variantIdsToRemove = new Set(variants.map((v) => v.id));
          return vIds.filter((id) => !variantIdsToRemove.has(id));
        });
        return prev.filter((id) => id !== productId);
      } else {
        // Ürün ekleniyor, varyantlarını yükle
        loadProductVariants(productId);
        return [...prev, productId];
      }
    });
  };

  // ✅ YENİ - Variant checkbox toggle
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
    return sortedCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categoryFilter, sortedCategories]);

  // Checkbox yardımcıları
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

  // İndirim kapsamı değiştiğinde seçimleri temizle
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

  const [saving, setSaving] = useState(false);

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
      Swal.fire("Uyarı", "Başlangıç ve Bitiş tarihi zorunludur.", "warning");
      return;
    }

    // İndirim kapsamı kontrolü
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

    // Sayı doğrulama
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
    if (prio !== undefined && (!Number.isFinite(prio) || prio < 0 || prio > 100)) {
      Swal.fire("Uyarı", "Öncelik 0-100 arası olmalı.", "warning");
      return;
    }

    const payload: DiscountCreateRequest = {
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
      priority: prio,
      isActive,
      autoApply,
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
      configurationSummary: configurationSummary.trim() || undefined
    };

    try {
      setSaving(true);
      const created = await createDiscount(payload);
      await Swal.fire(
        "Başarılı",
        `İndirim oluşturuldu (ID: ${created.id ?? "-"})`,
        "success"
      );
      navigate("/discounts-list", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "İndirim oluşturulamadı";
      Swal.fire("Hata", msg, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sherah-page-inner sherah-default-bg sherah-border p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Yeni İndirim</h2>
        <Link to="/discounts-list" className="sherah-btn sherah-gbcolor">
          ← İndirim Listesi
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="sherah-wc__form-main p-0">
        <div className="row">
          {/* Ad */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Ad *</label>
              <div className="form-group__input">
                <input
                  type="text"
                  className="sherah-wc__form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="İndirim Adı"
                />
              </div>
            </div>
          </div>

          {/* Ad (EN) */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Ad (EN) *</label>
              <div className="form-group__input">
                <input
                  type="text"
                  className="sherah-wc__form-input"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                  placeholder="Discount Name"
                />
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Açıklama</label>
              <div className="form-group__input">
                <input
                  type="text"
                  className="sherah-wc__form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="İndirim Açıklaması"
                />
              </div>
            </div>
          </div>

          {/* Description (EN) */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Description (EN)</label>
              <div className="form-group__input">
                <input
                  type="text"
                  className="sherah-wc__form-input"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Discount description"
                />
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Tip *</label>
              <div className="form-group__input">
                <select
                  className="form-group__input"
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(
                      e.target.value as "PERCENTAGE" | "FIXED_AMOUNT"
                    )
                  }
                >
                  <option value="PERCENTAGE">Yüzde</option>
                  <option value="FIXED_AMOUNT">Sabit Tutar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Değer */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Değer *</label>
              <div className="form-group__input">
                <input
                  type="number"
                  className="sherah-wc__form-input"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                  required
                  step="0.01"
                  placeholder="örn. 100"
                />
              </div>
            </div>
          </div>

          {/* ✅ İndirim Kodu */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">İndirim Kodu</label>
              <div className="form-group__input">
                <input
                  type="text"
                  className="sherah-wc__form-input"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="örn. YILBASI2025"
                  maxLength={50}
                />
              </div>
            </div>
          </div> 

           

           

          {/* ✅ İndirim Kapsamı Seçimi */}
          <div className="col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label mb-3">
                İndirim Kapsamı *
              </label>

              <div className="discount-scope-selector">
                <div
                  className="btn-group w-100"
                  role="group"
                  aria-label="İndirim Kapsamı"
                >
                  <input
                    type="radio"
                    className="btn-check"
                    name="discountScope"
                    id="scopeGeneral"
                    value="general"
                    checked={discountScope === "general"}
                    onChange={(e) => setDiscountScope(e.target.value as any)}
                  />
                  <label
                    className={`btn btn-outline-primary ${
                      discountScope === "general" ? "active" : ""
                    }`}
                    htmlFor="scopeGeneral"
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fa fa-globe me-2"></i>
                      <div>
                        <div className="fw-semibold">Genel</div>
                        <small className="text-muted">Tüm Ürünler</small>
                      </div>
                    </div>
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="discountScope"
                    id="scopeVariant"
                    value="variant"
                    checked={discountScope === "variant"}
                    onChange={(e) => setDiscountScope(e.target.value as any)}
                  />
                  <label
                    className={`btn btn-outline-primary ${
                      discountScope === "variant" ? "active" : ""
                    }`}
                    htmlFor="scopeVariant"
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fa fa-box me-2"></i>
                      <div>
                        <div className="fw-semibold">Variant Bazlı</div>
                        <small className="text-muted">Seçili Varyantlar</small>
                      </div>
                    </div>
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="discountScope"
                    id="scopeCategory"
                    value="category"
                    checked={discountScope === "category"}
                    onChange={(e) => setDiscountScope(e.target.value as any)}
                  />
                  <label
                    className={`btn btn-outline-primary ${
                      discountScope === "category" ? "active" : ""
                    }`}
                    htmlFor="scopeCategory"
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fa fa-tags me-2"></i>
                      <div>
                        <div className="fw-semibold">Kategori Bazlı</div>
                        <small className="text-muted">Seçili Kategoriler</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <style>{`
      .discount-scope-selector {
        .btn-group {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .btn {
          border: none;
          background: #f8f9fa;
          color: #6c757d;
          padding: 1rem;
          transition: all 0.3s ease;
          border-radius: 0 !important;
          min-height: 80px;
          
          &:hover {
            background: #e9ecef;
            transform: translateY(-1px);
          }

          &.active {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            
            .text-muted {
              color: rgba(255,255,255,0.8) !important;
            }
          }

          i {
            font-size: 1.25rem;
          }
        }

        .btn:first-child {
          border-top-left-radius: 12px !important;
          border-bottom-left-radius: 12px !important;
        }

        .btn:last-child {
          border-top-right-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
        }

        .btn-check {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .discount-scope-selector .btn-group {
          flex-direction: column;
        }
        
        .discount-scope-selector .btn {
          border-radius: 0 !important;
          
          &:first-child {
            border-top-left-radius: 12px !important;
            border-top-right-radius: 12px !important;
            border-bottom-left-radius: 0 !important;
          }
          
          &:last-child {
            border-bottom-left-radius: 12px !important;
            border-bottom-right-radius: 12px !important;
            border-top-right-radius: 0 !important;
          }
        }
      }
    `}</style>
            </div>
          </div>

          {/* Tarihler */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">
                Başlangıç Tarihi *
              </label>
              <div className="form-group__input">
                <input
                  type="datetime-local"
                  lang="tr"
                  className="sherah-wc__form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Bitiş Tarihi *</label>
              <div className="form-group__input">
                <input
                  type="datetime-local"
                  className="sherah-wc__form-input"
                  lang="tr"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* ✅ ÜRÜN/VARIANT SEÇİMİ - Sadece variant bazlı seçildiyse göster */}
          {discountScope === "variant" && (
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-end mt-4 mb-1">
                <label className="sherah-wc__form-label">
                  Ürünler ve Varyantlar{" "}
                  {variantIds.length > 0 && (
                    <span className="text-muted">
                      • {variantIds.length} varyant seçili
                    </span>
                  )}
                </label>
              </div>

              <input
                className="sherah-wc__form-input mb-2"
                placeholder="Ürün ara (ad/kod)"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                disabled={optsLoading}
              />

              <div
                className="border rounded p-3"
                style={{ maxHeight: 500, overflow: "auto" }}
              >
                {optsLoading ? (
                  <div className="text-muted">Yükleniyor…</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-muted">Kayıt yok.</div>
                ) : (
                  filteredProducts.map((p) => {
                    const isProductSelected = selectedProducts.includes(p.id);
                    const variants = productVariants.get(p.id) || [];
                    const isLoadingVariants = loadingVariants.has(p.id);
                    const label = p.code ? `${p.name} (${p.code})` : p.name;

                    return (
                      <div key={p.id} className="mb-3 pb-3" style={{ borderBottom: '1px solid #e9ecef' }}>
                        {/* ✅ Ürün başlığı - Normal font weight */}
                        <div 
                          className="d-flex align-items-center gap-2"
                          onClick={() => toggleProduct(p.id)}
                          style={{ 
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            backgroundColor: isProductSelected ? '#f8f9fa' : 'transparent',
                            transition: 'background-color 0.2s',
                            userSelect: 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!isProductSelected) {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isProductSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <i 
                            className={`fas ${isProductSelected ? 'fa-chevron-down' : 'fa-chevron-right'}`}
                            style={{ 
                              width: 16, 
                              color: '#6c757d',
                              transition: 'transform 0.2s'
                            }}
                          ></i>
                          {/* ✅ Normal font-weight */}
                          <span style={{ fontSize: '14px', fontWeight: 400, color: '#212529' }}>
                            {label}
                          </span>
                          {isProductSelected && variants.length > 0 && (
                            <span 
                              className="badge ms-2"
                              style={{
                                backgroundColor: '#0d6efd',
                                color: 'white',
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '12px'
                              }}
                            >
                              {variantIds.filter(vid => 
                                variants.some(v => v.id === vid)
                              ).length} / {variants.length}
                            </span>
                          )}
                        </div>

                        {/* Varyantlar */}
                        {isProductSelected && (
                          <div className="ms-4 mt-2">
                            {isLoadingVariants ? (
                              <div className="text-muted small d-flex align-items-center gap-2" style={{ padding: '8px 12px' }}>
                                <i className="fa fa-spinner fa-spin"></i>
                                <span>Varyantlar yükleniyor...</span>
                              </div>
                            ) : variants.length === 0 ? (
                              <div className="text-muted small" style={{ padding: '8px 12px' }}>
                                Bu üründe varyant bulunamadı.
                              </div>
                            ) : (
                              <div className="d-flex flex-column">
                                {variants.map((variant) => {
                                  const isVariantSelected = variantIds.includes(variant.id);
                                  return (
                                    <div
                                      key={variant.id}
                                      className="d-flex align-items-center gap-2"
                                      style={{
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }}
                                      onClick={() => toggleVariant(variant.id)}
                                    >
                                      {/* ✅ Tek checkbox */}
                                      <input
                                        type="checkbox"
                                        id={`variant_${variant.id}`}
                                        checked={isVariantSelected}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          toggleVariant(variant.id);
                                        }}
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          cursor: 'pointer',
                                          margin: 0
                                        }}
                                      />
                                      <label
                                        htmlFor={`variant_${variant.id}`}
                                        style={{
                                          fontSize: '13px',
                                          color: '#495057',
                                          cursor: 'pointer',
                                          margin: 0,
                                          userSelect: 'none',
                                          fontWeight: 400
                                        }}
                                      >
                                        {variant.size || "Standart"}{" "}
                                        {variant.sku && (
                                          <span style={{ color: '#6c757d' }}>
                                            (SKU: {variant.sku})
                                          </span>
                                        )}
                                        {variant.stockQuantity != null && (
                                          <span style={{ color: '#6c757d' }}>
                                            {" "}- Stok: {variant.stockQuantity}
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
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

          {/* ✅ KATEGORİLER - Sadece kategori bazlı seçildiyse göster */}
          {discountScope === "category" && (
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-end mt-4 mb-1">
                <label className="sherah-wc__form-label">
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
                    className="btn btn-success border-0 outline-none shadow-none custom-box-shadow"
                    onClick={() => selectAll(filteredCategories, setCategoryIds)}
                    disabled={optsLoading || filteredCategories.length === 0}
                  >
                    Tümünü Seç
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger border-0 outline-none shadow-none custom-box-shadow"
                    onClick={() => clearAll(setCategoryIds)}
                    disabled={optsLoading || categoryIds.length === 0}
                  >
                    Temizle
                  </button>
                </div>
              </div>

              <input
                className="sherah-wc__form-input"
                placeholder="Kategori ara"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={optsLoading}
              />

              <div
                className="border rounded p-2"
                style={{ maxHeight: 300, overflow: "auto" }}
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
                      <div
                        className="form-check d-flex align-items-center gap-2"
                        key={c.id}
                      >
                        <input
                          className="form-check-input mb-2"
                          style={{ padding: 0, width: 20, height: 20 }}
                          type="checkbox"
                          id={`cat_${c.id}`}
                          checked={checked}
                          onChange={() =>
                            toggleId(categoryIds, c.id, setCategoryIds)
                          }
                        />
                        <label
                          className="form-check-label mb-0"
                          htmlFor={`cat_${c.id}`}
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

          {/* BAYİLER - Her zaman göster */}
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-end mt-4 mb-1">
              <label className="sherah-wc__form-label">
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
                  className="btn btn-success border-0 outline-none shadow-none custom-box-shadow"
                  onClick={() => selectAll(filteredDealers, setDealerIds)}
                  disabled={optsLoading || filteredDealers.length === 0}
                >
                  Tümünü Seç
                </button>
                <button
                  type="button"
                  className="btn btn-danger border-0 outline-none shadow-none custom-box-shadow"
                  onClick={() => clearAll(setDealerIds)}
                  disabled={optsLoading || dealerIds.length === 0}
                >
                  Temizle
                </button>
              </div>
            </div>

            <input
              className="sherah-wc__form-input"
              placeholder="Bayi ara (ad)"
              value={dealerFilter}
              onChange={(e) => setDealerFilter(e.target.value)}
              disabled={optsLoading}
            />

            <div
              className="border rounded p-2"
              style={{ maxHeight: 300, overflow: "auto" }}
            >
              {optsLoading ? (
                <div className="text-muted">Yükleniyor…</div>
              ) : filteredDealers.length === 0 ? (
                <div className="text-muted">Kayıt yok.</div>
              ) : (
                filteredDealers.map((d) => {
                  const checked = dealerIds.includes(d.id);
                  return (
                    <div
                      className="form-check d-flex align-items-center gap-2"
                      key={d.id}
                    >
                      <input
                        className="form-check-input mb-2"
                        style={{ padding: 0, width: 20, height: 20 }}
                        type="checkbox"
                        id={`dealer_${d.id}`}
                        checked={checked}
                        onChange={() =>
                          toggleId(dealerIds, d.id, setDealerIds)
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`dealer_${d.id}`}
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
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">
                Minimum Sipariş Tutarı
              </label>
              <div className="form-group__input">
                <input
                  type="number"
                  className="sherah-wc__form-input"
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(e.target.value)}
                  step="0.01"
                  placeholder="örn. 100"
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">
                Maksimum İndirim Tutarı
              </label>
              <div className="form-group__input">
                <input
                  type="number"
                  className="sherah-wc__form-input"
                  value={maximumDiscountAmount}
                  onChange={(e) => setMaximumDiscountAmount(e.target.value)}
                  step="0.01"
                  placeholder="örn. 500"
                />
              </div>
            </div>
          </div>

          {/* Kullanım limitleri */}
          <div className="col-lg-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">
                Toplam Kullanım Limiti
              </label>
              <div className="form-group__input">
                <input
                  type="number"
                  className="sherah-wc__form-input"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  step="1"
                  min="0"
                  placeholder="örn. 100"
                />
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="form-group">
              <label className="sherah-wc__form-label">
                Müşteri Başı Kullanım Limiti
              </label>
              <div className="form-group__input">
                <input
                  type="number"
                  className="sherah-wc__form-input"
                  value={usageLimitPerCustomer}
                  onChange={(e) => setUsageLimitPerCustomer(e.target.value)}
                  step="1"
                  min="0"
                  placeholder="örn. 1"
                />
              </div>
            </div>
          </div>

          {/* Yapılandırma Özeti */}
          <div className="col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Yapılandırma Özeti</label>
              <div className="form-group__input">
                <textarea
                  className="sherah-wc__form-input"
                  value={configurationSummary}
                  onChange={(e) => setConfigurationSummary(e.target.value)}
                  rows={3}
                  placeholder="Notlar veya yapılandırma özeti"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="sherah-btn sherah-btn__secondary"
          disabled={saving}
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          className="sherah-btn bg-secondary ms-3"
          onClick={() => navigate("/discounts-list")}
          disabled={saving}
        >
          Vazgeç
        </button>
      </form>
    </div>
  );
}
