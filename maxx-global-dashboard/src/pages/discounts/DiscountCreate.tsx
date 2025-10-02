// src/pages/discounts/DiscountCreate.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { createDiscount } from "../../services/discounts/create";
import { listSimpleProducts } from "../../services/products/simple";
import { listSimpleDealers } from "../../services/dealers/simple";
import { listAllCategories } from "../../services/categories/listAll";
import type { DiscountCreateRequest } from "../../types/discount";
import type { ProductSimple } from "../../types/product";
import type { DealerSummary } from "../../types/dealer";
import type { CategoryRow } from "../../types/category";

function ensureSeconds(v: string) {
  if (!v) return v;
  return v.length === 16 ? `${v}:00` : v;
}

export default function DiscountCreate() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>("");
  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED_AMOUNT"
  >("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<string>("");
  const [maximumDiscountAmount, setMaximumDiscountAmount] =
    useState<string>("");

  // ✅ yeni alanlar (opsiyonel)
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] =
    useState<string>("");

  // Seçenekler
  const [productOpts, setProductOpts] = useState<ProductSimple[]>([]);
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [categoryOpts, setCategoryOpts] = useState<CategoryRow[]>([]); // ✅ YENİ
  const [optsLoading, setOptsLoading] = useState<boolean>(true);

  // Seçimler (checkbox)
  const [productIds, setProductIds] = useState<number[]>([]);
  const [dealerIds, setDealerIds] = useState<number[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]); // ✅ YENİ

  // İndirim türü seçimi (ürün/kategori/genel)
  const [discountScope, setDiscountScope] = useState<
    "general" | "product" | "category"
  >("general");

  // Filtre (checkbox listesinde arama)
  const [productFilter, setProductFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // ✅ YENİ

  useEffect(() => {
    (async () => {
      try {
        setOptsLoading(true);
        const [prods, dealers, categories] = await Promise.all([
          listSimpleProducts(),
          listSimpleDealers(),
          listAllCategories(), // ✅ YENİ - kategorileri getir
        ]);
        prods.sort((a, b) => a.name.localeCompare(b.name));
        dealers.sort((a, b) => a.name.localeCompare(b.name));

        setProductOpts(prods);
        setDealerOpts(dealers);
        setCategoryOpts(categories); // ✅ YENİ
      } catch {
        Swal.fire("Hata", "Seçenek listeleri yüklenemedi", "error");
      } finally {
        setOptsLoading(false);
      }
    })();
  }, []);

  // Filtrelenmiş listeler
  const filteredProducts = useMemo(() => {
    const q = productFilter.trim().toLowerCase();
    if (!q) return productOpts;
    return productOpts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code ? p.code.toLowerCase().includes(q) : false)
    );
  }, [productFilter, productOpts]);

  const filteredDealers = useMemo(() => {
    const q = dealerFilter.trim().toLowerCase();
    if (!q) return dealerOpts;
    return dealerOpts.filter((d) => d.name.toLowerCase().includes(q));
  }, [dealerFilter, dealerOpts]);

  // ✅ YENİ - Filtrelenmiş kategori listesi
  const filteredCategories = useMemo(() => {
    const q = categoryFilter.trim().toLowerCase();
    if (!q) return categoryOpts;
    return categoryOpts.filter((c) => c.name.toLowerCase().includes(q));
  }, [categoryFilter, categoryOpts]);

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
      setProductIds([]);
      setCategoryIds([]);
    } else if (discountScope === "product") {
      setCategoryIds([]);
    } else if (discountScope === "category") {
      setProductIds([]);
    }
  }, [discountScope]);

  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire("Uyarı", "Ad zorunludur.", "warning");
      return;
    }
    if (!startDate || !endDate) {
      Swal.fire("Uyarı", "Başlangıç ve Bitiş tarihi zorunludur.", "warning");
      return;
    }

    // İndirim kapsamı kontrolü
    if (discountScope === "product" && productIds.length === 0) {
      Swal.fire(
        "Uyarı",
        "Ürün bazlı indirim için en az bir ürün seçmelisiniz.",
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

    // sayı doğrulama (opsiyonel alanlar pozitif tamsayı olmalı)
    const ul =
      usageLimit.trim() === "" ? undefined : Number.parseInt(usageLimit, 10);
    const ulpc =
      usageLimitPerCustomer.trim() === ""
        ? undefined
        : Number.parseInt(usageLimitPerCustomer, 10);

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

    const payload: DiscountCreateRequest = {
      name: name.trim(),
      description: description?.trim() || "",
      discountType,
      discountValue: Number(discountValue),
      startDate: ensureSeconds(startDate),
      endDate: ensureSeconds(endDate),
      productIds:
        discountScope === "product" ? Array.from(new Set(productIds)) : [],
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

      // ✅ Eksik alanlar için default değerler
    };

    try {
      setSaving(true);
      const created = await createDiscount(payload);
      await Swal.fire(
        "Başarılı",
        `İndirim oluşturuldu (ID: ${created.id ?? "-"})`,
        "success"
      );
      navigate("/discounts", { replace: true });
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

          {/* ✅ YENİ - İndirim Kapsamı Seçimi */}
          <div className="col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label mb-3">
                İndirim Kapsamı *
              </label>

              {/* Modern Button Group Style */}
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
                    id="scopeProduct"
                    value="product"
                    checked={discountScope === "product"}
                    onChange={(e) => setDiscountScope(e.target.value as any)}
                  />
                  <label
                    className={`btn btn-outline-primary ${
                      discountScope === "product" ? "active" : ""
                    }`}
                    htmlFor="scopeProduct"
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fa fa-box me-2"></i>
                      <div>
                        <div className="fw-semibold">Ürün Bazlı</div>
                        <small className="text-muted">Seçili Ürünler</small>
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

              {/* Custom CSS - Bu stilleri CSS dosyanıza ekleyin */}
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

          {/* Checkbox listeleri - Sadece seçilen kapsama göre göster */}
          <div className="row">
            {/* ÜRÜNLER - Sadece ürün bazlı seçildiyse göster */}
            {discountScope === "product" && (
              <div className="col-lg-6 col-12">
                <div className="d-flex justify-content-between align-items-end mt-4 mb-1">
                  <label className="sherah-wc__form-label">
                    Ürünler{" "}
                    {productIds.length > 0 && (
                      <span className="text-muted">
                        • {productIds.length} seçili
                      </span>
                    )}
                  </label>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-success border-0 outline-none shadow-none custom-box-shadow"
                      onClick={() => selectAll(filteredProducts, setProductIds)}
                      disabled={optsLoading || filteredProducts.length === 0}
                    >
                      Tümünü Seç
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger border-0 outline-none shadow-none custom-box-shadow"
                      onClick={() => clearAll(setProductIds)}
                      disabled={optsLoading || productIds.length === 0}
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                <input
                  className="sherah-wc__form-input"
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
                      const checked = productIds.includes(p.id);
                      const label = p.code ? `${p.name} (${p.code})` : p.name;
                      return (
                        <div
                          className="form-check d-flex align-items-center gap-2"
                          key={p.id}
                        >
                          <input
                            className="form-check-input mb-2"
                            style={{ padding: 0, width: 20, height: 20 }}
                            type="checkbox"
                            id={`prod_${p.id}`}
                            checked={checked}
                            onChange={() =>
                              toggleId(productIds, p.id, setProductIds)
                            }
                          />
                          <label
                            className="form-check-label mb-0"
                            htmlFor={`prod_${p.id}`}
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

            {/* ✅ YENİ - KATEGORİLER - Sadece kategori bazlı seçildiyse göster */}
            {discountScope === "category" && (
              <div className="col-lg-6 col-12">
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
                      onClick={() =>
                        selectAll(filteredCategories, setCategoryIds)
                      }
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
                      // Hiyerarşik görünüm için label kullan
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
            <div className="col-lg-6 col-12">
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

          {/* ✅ Kullanım limitleri */}
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

          {/* Aktif */}
          <div className="form-check mb-4 ms-3 d-flex align-items-center gap-2">
            <input
              style={{ padding: 0, width: 20, height: 20 }}
              type="checkbox"
              className="form-check-input mt-0s"
              id="isActiveChk"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label
              className="form-check-label mb-0 lh-sm"
              htmlFor="isActiveChk"
            >
              Aktif mi?
            </label>
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
          onClick={() => navigate("/discounts")}
          disabled={saving}
        >
          Vazgeç
        </button>
      </form>
    </div>
  );
}
