// src/pages/discounts/DiscountCreate.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { createDiscount } from "../../services/discounts/create";
import { listSimpleProducts } from "../../services/products/simple";
import { listSimpleDealers } from "../../services/dealers/simple";
import type { DiscountCreateRequest } from "../../types/discount";
import type { ProductSimple } from "../../types/product";
import type { DealerSummary } from "../../types/dealer";

// "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00"
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
  const [usageLimit, setUsageLimit] = useState<string>(""); // toplam limit
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] =
    useState<string>(""); // müşteri başı

  // Seçenekler
  const [productOpts, setProductOpts] = useState<ProductSimple[]>([]);
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [optsLoading, setOptsLoading] = useState<boolean>(true);

  // Seçimler (checkbox)
  const [productIds, setProductIds] = useState<number[]>([]);
  const [dealerIds, setDealerIds] = useState<number[]>([]);

  // Filtre (checkbox listesinde arama)
  const [productFilter, setProductFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");

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

      // ✅ yeni alanlar
      usageLimit: ul,
      usageLimitPerCustomer: ulpc,
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
        <Link to="/discounts" className="btn btn-secondary">
          ← İndirim Listesi
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Ad */}
        <div className="mb-3">
          <label className="form-label">Ad *</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Açıklama */}
        <div className="mb-3">
          <label className="form-label">Açıklama</label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Tip */}
        <div className="mb-3">
          <label className="form-label">Tip *</label>
          <select
            className="form-select"
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as "PERCENTAGE" | "FIXED_AMOUNT")
            }
          >
            <option value="PERCENTAGE">Yüzde</option>
            <option value="FIXED_AMOUNT">Sabit Tutar</option>
          </select>
        </div>

        {/* Değer */}
        <div className="mb-3">
          <label className="form-label">Değer *</label>
          <input
            type="number"
            className="form-control"
            value={discountValue}
            onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
            step="0.01"
            required
          />
        </div>

        {/* Tarihler */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Başlangıç Tarihi *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Bitiş Tarihi *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
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
                  onClick={() => selectAll(filteredProducts, setProductIds)}
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
                    <div className="form-check" key={d.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`dealer_${d.id}`}
                        checked={checked}
                        onChange={() => toggleId(dealerIds, d.id, setDealerIds)}
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
              className="form-control"
              value={minimumOrderAmount}
              onChange={(e) => setMinimumOrderAmount(e.target.value)}
              step="0.01"
              placeholder="örn. 100"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Maksimum İndirim Tutarı</label>
            <input
              type="number"
              className="form-control"
              value={maximumDiscountAmount}
              onChange={(e) => setMaximumDiscountAmount(e.target.value)}
              step="0.01"
              placeholder="örn. 500"
            />
          </div>
        </div>

        {/* ✅ Kullanım limitleri */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Toplam Kullanım Limiti</label>
            <input
              type="number"
              className="form-control"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              step="1"
              min="0"
              placeholder="örn. 100"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Müşteri Başı Kullanım Limiti</label>
            <input
              type="number"
              className="form-control"
              value={usageLimitPerCustomer}
              onChange={(e) => setUsageLimitPerCustomer(e.target.value)}
              step="1"
              min="0"
              placeholder="örn. 1"
            />
          </div>
        </div>

        {/* Aktif */}
        <div className="form-check mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            id="isActiveChk"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="isActiveChk">
            Aktif mi?
          </label>
        </div>

        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/discounts")}
          disabled={saving}
        >
          Vazgeç
        </button>
      </form>
    </div>
  );
}
