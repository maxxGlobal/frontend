// src/pages/discounts/components/EditDiscountModal.tsx
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import type { Discount, DiscountUpdateRequest } from "../../../types/discount";
import { updateDiscount } from "../../../services/discounts/update";
import { listSimpleProducts } from "../../../services/products/simple";
import { listSimpleDealers } from "../../../services/dealers/simple";
import type { ProductSimple } from "../../../types/product";
import type { DealerSummary } from "../../../types/dealer";

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
  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED_AMOUNT"
  >(target.discountType);
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

  // ▼ Çoklu seçim: ürünler & bayiler (checkbox)
  const [productOpts, setProductOpts] = useState<ProductSimple[]>([]);
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [optsLoading, setOptsLoading] = useState<boolean>(true);

  const [productIds, setProductIds] = useState<number[]>(
    idsOf(target.applicableProducts)
  );
  const [dealerIds, setDealerIds] = useState<number[]>(
    idsOf(target.applicableDealers)
  );

  // Filtreler
  const [productFilter, setProductFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");

  // Hedef değişirse formu güncelle
  useEffect(() => {
    setName(target.name ?? "");
    setDescription(target.description ?? "");
    setDiscountType(target.discountType);
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
  }, [target]);

  // Seçenekleri getir
  useEffect(() => {
    (async () => {
      try {
        setOptsLoading(true);
        const [prods, dealers] = await Promise.all([
          listSimpleProducts(),
          listSimpleDealers(),
        ]);
        prods.sort((a, b) => a.name.localeCompare(b.name));
        dealers.sort((a, b) => a.name.localeCompare(b.name));
        setProductOpts(prods);
        setDealerOpts(dealers);
      } catch {
        Swal.fire("Hata", "Ürün/Bayi listeleri yüklenemedi", "error");
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
      productIds: Array.from(new Set(productIds)),
      dealerIds: Array.from(new Set(dealerIds)),
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

              {/* Checkbox listeleri */}
              <div className="row">
                {/* ÜRÜNLER */}
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
                        disabled={optsLoading || filteredProducts.length === 0}
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
                        const label = p.code ? `${p.name} (${p.code})` : p.name;
                        return (
                          <div className="form-check" key={p.id}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`prod_${p.id}`}
                              checked={checked}
                              onChange={() =>
                                toggleId(productIds, p.id, setProductIds)
                              }
                            />
                            <label
                              className="form-check-label"
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

                {/* BAYİLER */}
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
