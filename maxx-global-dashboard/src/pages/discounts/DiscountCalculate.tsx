import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

import { calculateDiscount } from "../../services/discounts/calculate";
import { listSimpleProducts } from "../../services/products/simple";
import { listSimpleDealers } from "../../services/dealers/simple";

import type {
  DiscountCalculationRequest,
  DiscountCalculationSuccess,
} from "../../types/discount";
import type { ProductSimple } from "../../types/product";
import type { DealerSummary } from "../../types/dealer";

// "1,2, 3" -> [1,2,3]
function parseIds(input: string): number[] {
  if (!input?.trim()) return [];
  return input
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

export default function DiscountCalculate() {
  // ► Ürün/Bayi seçenekleri
  const [productOpts, setProductOpts] = useState<ProductSimple[]>([]);
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [optsLoading, setOptsLoading] = useState<boolean>(true);

  // Form state
  const [productId, setProductId] = useState<string>(""); // select => id as string
  const [dealerId, setDealerId] = useState<string>(""); // select => id as string
  const [quantity, setQuantity] = useState<string>("1");
  const [unitPrice, setUnitPrice] = useState<string>("0");
  const [totalOrderAmount, setTotalOrderAmount] = useState<string>("0");
  const [includeDiscountIdsInput, setIncludeDiscountIdsInput] =
    useState<string>("");
  const [excludeDiscountIdsInput, setExcludeDiscountIdsInput] =
    useState<string>("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscountCalculationSuccess | null>(null);

  // ► Ürün/Bayi basit listelerini çek
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
      } catch (e) {
        Swal.fire("Hata", "Ürün/Bayi listeleri yüklenemedi", "error");
      } finally {
        setOptsLoading(false);
      }
    })();
  }, []);

  // qty * unitPrice -> totalOrderAmount auto
  const autoTotal = useMemo(() => {
    const q = Number(quantity);
    const u = Number(unitPrice);
    if (!Number.isFinite(q) || !Number.isFinite(u)) return 0;
    return q * u;
  }, [quantity, unitPrice]);

  // totalOrderAmount alanını otomatik doldur (kullanıcı elle de değiştirebilir)
  useEffect(() => {
    setTotalOrderAmount(String(autoTotal));
  }, [autoTotal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const pid = Number(productId);
    const did = Number(dealerId);
    const qty = Number(quantity);
    const price = Number(unitPrice);
    const total = Number(totalOrderAmount);

    if (!Number.isFinite(pid) || pid <= 0) {
      await Swal.fire("Uyarı", "Lütfen bir ürün seçin.", "warning");
      return;
    }
    if (!Number.isFinite(did) || did <= 0) {
      await Swal.fire("Uyarı", "Lütfen bir bayi seçin.", "warning");
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      await Swal.fire(
        "Uyarı",
        "Geçerli bir adet (quantity) giriniz.",
        "warning"
      );
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      await Swal.fire(
        "Uyarı",
        "Geçerli bir birim fiyat (unitPrice) giriniz.",
        "warning"
      );
      return;
    }
    if (!Number.isFinite(total) || total < 0) {
      await Swal.fire(
        "Uyarı",
        "Geçerli bir toplam tutar (totalOrderAmount) giriniz.",
        "warning"
      );
      return;
    }

    const payload: DiscountCalculationRequest = {
      productId: pid,
      dealerId: did,
      quantity: qty,
      unitPrice: price,
      totalOrderAmount: total,
      includeDiscountIds: parseIds(includeDiscountIdsInput),
      excludeDiscountIds: parseIds(excludeDiscountIdsInput),
    };

    try {
      setLoading(true);
      const res = await calculateDiscount(payload);
      setResult(res);
      await Swal.fire("Başarılı", "İndirim hesaplandı.", "success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Hesaplama yapılamadı";
      await Swal.fire("Hata", msg, "error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sherah-page-inner sherah-default-bg sherah-border p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">İndirim Hesaplama</h2>
        <Link to="/discounts-list" className="sherah-btn sherah-gbcolor">
          ← İndirim Listesi
        </Link>
      </div>

      <div className="row">
        {/* Form */}
        <div className="col-lg-5">
          <form onSubmit={handleSubmit} className="card p-3 mb-3">
            {/* ÜRÜN SEÇİMİ */}
            <div className="mb-3">
              <label className="form-label">Ürün *</label>
              <select
                className="form-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={optsLoading}
              >
                <option value="">
                  {optsLoading ? "Yükleniyor..." : "— Seçiniz —"}
                </option>
                {productOpts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `${p.name} (${p.code})` : p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BAYİ SEÇİMİ */}
            <div className="mb-3">
              <label className="form-label">Bayi *</label>
              <select
                className="form-select"
                value={dealerId}
                onChange={(e) => setDealerId(e.target.value)}
                disabled={optsLoading}
              >
                <option value="">
                  {optsLoading ? "Yükleniyor..." : "— Seçiniz —"}
                </option>
                {dealerOpts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Adet *</label>
                <input
                  type="number"
                  className="form-control"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={1}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Birim Fiyat *</label>
                <input
                  type="number"
                  className="form-control"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  step="0.01"
                  min={0}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Toplam Tutar *</label>
                <input
                  type="number"
                  className="form-control"
                  value={totalOrderAmount}
                  onChange={(e) => setTotalOrderAmount(e.target.value)}
                  step="0.01"
                  min={0}
                />
                <div className="form-text">Otomatik: adet × birim fiyat</div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Dahil Edilecek İndirim ID'leri (1,2,3)
                </label>
                <input
                  className="form-control"
                  value={includeDiscountIdsInput}
                  onChange={(e) => setIncludeDiscountIdsInput(e.target.value)}
                  placeholder="örn. 10,11"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Hariç Tutulacak İndirim ID'leri (1,2,3)
                </label>
                <input
                  className="form-control"
                  value={excludeDiscountIdsInput}
                  onChange={(e) => setExcludeDiscountIdsInput(e.target.value)}
                  placeholder="örn. 5,7"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Hesaplanıyor..." : "Hesapla"}
            </button>
          </form>
        </div>

        {/* Sonuç Paneli */}
        <div className="col-lg-7">
          {!result ? (
            <div className="alert alert-info">
              Hesap sonucu burada görünecek.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {/* Özet */}
              <div className="card p-3">
                <h5 className="mb-3">Özet</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Ürün:</strong>{" "}
                      {result.productName ?? `#${result.productId}`}
                    </p>
                    <p className="mb-1">
                      <strong>Bayi:</strong>{" "}
                      {result.dealerName ?? `#${result.dealerId}`}
                    </p>
                    <p className="mb-1">
                      <strong>Adet:</strong> {result.quantity}
                    </p>
                    <p className="mb-1">
                      <strong>Birim Fiyat:</strong> {result.originalUnitPrice}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Orijinal Toplam:</strong>{" "}
                      {result.originalTotalAmount}
                    </p>
                    <p className="mb-1">
                      <strong>Toplam İndirim:</strong>{" "}
                      {result.totalDiscountAmount}
                    </p>
                    <p className="mb-1">
                      <strong>Oran (%):</strong>{" "}
                      {result.discountPercentage ?? "-"}
                    </p>
                    <p className="mb-1">
                      <strong>Nihai Tutar:</strong> {result.finalTotalAmount}
                    </p>
                  </div>
                </div>
              </div>

              {/* En iyi indirim */}
              <div className="card p-3">
                <h5 className="mb-3">En İyi İndirim</h5>
                {result.bestDiscount ? (
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Ad:</strong> {result.bestDiscount.discountName}
                      </p>
                      <p className="mb-1">
                        <strong>Tip:</strong> {result.bestDiscount.discountType}
                      </p>
                      <p className="mb-1">
                        <strong>Değer:</strong>{" "}
                        {result.bestDiscount.discountValue}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Hesaplanan İndirim:</strong>{" "}
                        {result.bestDiscount.calculatedDiscountAmount}
                      </p>
                      <p className="mb-1">
                        <strong>İndirimli Birim Fiyat:</strong>{" "}
                        {result.bestDiscount.discountedUnitPrice}
                      </p>
                      <p className="mb-1">
                        <strong>Koşullar:</strong>{" "}
                        {result.bestDiscount.minimumOrderMet
                          ? "Min. tutar OK"
                          : "Min. tutar YOK"}{" "}
                        •{" "}
                        {result.bestDiscount.maximumDiscountApplied
                          ? "Max. tavan uygulandı"
                          : "Tavan yok"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted">
                    Uygulanabilir en iyi indirim bulunamadı.
                  </div>
                )}
              </div>

              {/* Uygulanabilir indirimler tablosu */}
              <div className="card p-3">
                <h5 className="mb-3">Uygulanabilir İndirimler</h5>
                {Array.isArray(result.applicableDiscounts) &&
                result.applicableDiscounts.length > 0 ? (
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Ad</th>
                        <th>Tip</th>
                        <th>Değer</th>
                        <th>Hesaplanan İndirim</th>
                        <th>İnd. Birim Fiyat</th>
                        <th>Min.?</th>
                        <th>Max. Tavan?</th>
                        <th>Uygun?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.applicableDiscounts.map((x) => (
                        <tr key={x.discountId}>
                          <td>{x.discountId}</td>
                          <td>{x.discountName}</td>
                          <td>{x.discountType}</td>
                          <td>{x.discountValue}</td>
                          <td>{x.calculatedDiscountAmount}</td>
                          <td>{x.discountedUnitPrice}</td>
                          <td>{x.minimumOrderMet ? "Evet" : "Hayır"}</td>
                          <td>{x.maximumDiscountApplied ? "Evet" : "Hayır"}</td>
                          <td>{x.isApplicable ? "Evet" : "Hayır"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-muted">İlgili indirim bulunamadı.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
