// src/pages/discounts/components/EditDiscountModal.tsx
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import type { Discount, DiscountUpdateRequest } from "../../../types/discount";
import { updateDiscount } from "../../../services/discounts/update";
import { listSimpleProducts } from "../../../services/products/simple";
import { listSimpleDealers } from "../../../services/dealers/simple";
import { listAllCategories } from "../../../services/categories/listAll";
import type { ProductSimple } from "../../../types/product";
import type { DealerSummary } from "../../../types/dealer";
import type { CategoryRow } from "../../../types/category";

type DiscountTypeCanonical = "PERCENTAGE" | "FIXED_AMOUNT";
function normalizeDiscountType(input: unknown): DiscountTypeCanonical {
  const raw = String(input ?? "").trim();

  // Zaten beklenen değerlerse direkt döndür
  if (raw === "PERCENTAGE" || raw === "FIXED_AMOUNT") {
    return raw;
  }

  // Yerelleştirilmiş/serbest değerleri eşle
  const u = raw.toLocaleUpperCase("tr-TR");
  if (u.includes("YÜZ") || u.includes("PERC")) return "PERCENTAGE";
  if (u.includes("SAB") || u.includes("FIX")) return "FIXED_AMOUNT";

  // Emniyetli varsayılan
  return "PERCENTAGE";
}
// Yardımcılar
function toInputLocal(iso: string | undefined) {
  if (!iso) return "";
  // "2024-12-01T00:00:00" -> "2024-12-01T00:00"
  return iso.slice(0, 16);
}
function ensureSeconds(v: string) {
  if (!v) return v;
  return v.length === 16 ? `${v}:00` : v;
}
function idsOf(arr?: { id: number }[]) {
  return Array.isArray(arr) ? arr.map((x) => x.id) : [];
}

type Props = {
  target: Discount;
  onClose: () => void;
  onSaved: (updated: Discount) => void;
};

export default function EditDiscountModal({ target, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);

  // Form alanları (prefill)
  const [name, setName] = useState(target.name ?? "");
  const [description, setDescription] = useState(target.description ?? "");
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

  // ✅ Yeni alanlar (opsiyonel)
  const [usageLimit, setUsageLimit] = useState<string>(
    (target as any)?.usageLimit != null
      ? String((target as any).usageLimit)
      : ""
  );
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState<string>(
    (target as any)?.usageLimitPerCustomer != null
      ? String((target as any).usageLimitPerCustomer)
      : ""
  );

  // ▼ Çoklu seçim: ürünler, bayiler & kategoriler (checkbox)
  const [productOpts, setProductOpts] = useState<ProductSimple[]>([]);
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [categoryOpts, setCategoryOpts] = useState<CategoryRow[]>([]); // ✅ YENİ
  const [optsLoading, setOptsLoading] = useState<boolean>(true);

  const [productIds, setProductIds] = useState<number[]>(
    idsOf(target.applicableProducts)
  );
  const [dealerIds, setDealerIds] = useState<number[]>(
    idsOf(target.applicableDealers)
  );
  const [categoryIds, setCategoryIds] = useState<number[]>(
    idsOf((target as any).applicableCategories) // ✅ YENİ
  );

  // İndirim kapsamı belirleme (mevcut veriye göre)
  const [discountScope, setDiscountScope] = useState<
    "general" | "product" | "category"
  >(() => {
    const hasProducts = idsOf(target.applicableProducts).length > 0;
    const hasCategories =
      idsOf((target as any).applicableCategories).length > 0;

    if (hasCategories) return "category";
    if (hasProducts) return "product";
    return "general";
  });

  const [productFilter, setProductFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    setName(target.name ?? "");
    setDescription(target.description ?? "");
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
    setProductIds(idsOf(target.applicableProducts));
    setDealerIds(idsOf(target.applicableDealers));
    setCategoryIds(idsOf((target as any).applicableCategories)); // ✅ YENİ
    setUsageLimit(
      (target as any)?.usageLimit != null
        ? String((target as any).usageLimit)
        : ""
    );
    setUsageLimitPerCustomer(
      (target as any)?.usageLimitPerCustomer != null
        ? String((target as any).usageLimitPerCustomer)
        : ""
    );

    // İndirim kapsamını yeniden belirle
    const hasProducts = idsOf(target.applicableProducts).length > 0;
    const hasCategories =
      idsOf((target as any).applicableCategories).length > 0;

    if (hasCategories) setDiscountScope("category");
    else if (hasProducts) setDiscountScope("product");
    else setDiscountScope("general");
  }, [target]);

  // Seçenekleri getir
  useEffect(() => {
    (async () => {
      try {
        setOptsLoading(true);
        const [prods, dealers, categories] = await Promise.all([
          listSimpleProducts(),
          listSimpleDealers(),
          listAllCategories(), // ✅ YENİ
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire("Uyarı", "Ad zorunludur.", "warning");
      return;
    }
    if (!startDate || !endDate) {
      Swal.fire("Uyarı", "Başlangıç/Bitiş tarihleri zorunludur.", "warning");
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

    const payload: DiscountUpdateRequest = {
      name: name.trim(),
      description: description?.trim() || "",
      discountType,
      discountValue: Number(discountValue),
      startDate: ensureSeconds(startDate),
      endDate: ensureSeconds(endDate),
      // İndirim kapsamına göre ID'leri gönder
      productIds:
        discountScope === "product" ? Array.from(new Set(productIds)) : [],
      dealerIds: Array.from(new Set(dealerIds)),
      categoryIds:
        discountScope === "category" ? Array.from(new Set(categoryIds)) : [], // ✅ YENİ
      isActive,
      minimumOrderAmount:
        minimumOrderAmount.trim() === ""
          ? undefined
          : Number(minimumOrderAmount),
      maximumDiscountAmount:
        maximumDiscountAmount.trim() === ""
          ? undefined
          : Number(maximumDiscountAmount),

      // ✅ yeni
      usageLimit: ul,
      usageLimitPerCustomer: ulpc,
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

            <div className="modal-body">
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
                <label className="form-label">Açıklama</label>
                <input
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

              {/* ✅ YENİ - İndirim Kapsamı Seçimi */}
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
                      id="scopeProductEdit"
                      value="product"
                      checked={discountScope === "product"}
                      onChange={(e) => setDiscountScope(e.target.value as any)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="scopeProductEdit"
                    >
                      Ürün Bazlı
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

              {/* Checkbox listeleri - Sadece seçilen kapsama göre göster */}
              <div className="row">
                {/* ÜRÜNLER - Sadece ürün bazlı seçildiyse göster */}
                {discountScope === "product" && (
                  <div className="col-md-6 mb-3">
                    <div className="d-flex justify-content-between align-items-end mb-1">
                      <label className="form-label mb-0">
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
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            selectAll(filteredProducts, setProductIds)
                          }
                          disabled={
                            optsLoading || filteredProducts.length === 0
                          }
                        >
                          Tümünü Seç
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => clearAll(setProductIds)}
                          disabled={optsLoading || productIds.length === 0}
                        >
                          Temizle
                        </button>
                      </div>
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
                      style={{ maxHeight: 260, overflow: "auto" }}
                    >
                      {optsLoading ? (
                        <div className="text-muted">Yükleniyor…</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="text-muted">Kayıt yok.</div>
                      ) : (
                        filteredProducts.map((p) => {
                          const checked = productIds.includes(p.id);
                          const label = p.code
                            ? `${p.name} (${p.code})`
                            : p.name;
                          return (
                            <div className="form-check" key={p.id}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`prod_edit_${p.id}`}
                                checked={checked}
                                onChange={() =>
                                  toggleId(productIds, p.id, setProductIds)
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`prod_edit_${p.id}`}
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
                  <div className="col-md-6 mb-3">
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
                          // Hiyerarşik görünüm için label kullan
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

                {/* BAYİLER - Her zaman göster */}
                <div className="col-md-6 mb-3">
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

              {/* ✅ Kullanım limitleri */}
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
