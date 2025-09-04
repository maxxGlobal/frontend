// src/pages/product-prices/ProductPriceManagementPanel.tsx
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { listAllProductPrices } from "../../../services/product-prices/listAll";
import { createProductPrice } from "../../../services/product-prices/create";
import { updateProductPrice } from "../../../services/product-prices/update";
import { deleteProductPrice } from "../../../services/product-prices/delete";

import { listSimpleProducts } from "../../../services/products/listSimple";
import { listSimpleDealers } from "../../../services/dealers/listSimple";

import type {
  ProductPrice,
  PageResponse,
  CreateProductPriceRequest,
  UpdateProductPriceRequest,
} from "../../../types/product-prices";

const MySwal = withReactContent(Swal);

// Helpers
function ensureSeconds(v?: string | null) {
  if (!v) return v ?? null;
  return v.length === 16 ? `${v}:00` : v;
}
function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  return iso.slice(0, 16);
}
const PREFERRED = ["TRY", "USD", "EUR"];

type Row = {
  currency: string;
  amount: number | undefined;
  existing: boolean; // mevcut prices[]'ten mi geldi?
};

export default function ProductPriceManagementPanel() {
  const [prices, setPrices] = useState<PageResponse<ProductPrice> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ProductPrice | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);

  // kayıt seviyesi alanlar (tüm satırlara birlikte uygulanır)
  const [productId, setProductId] = useState<number | undefined>(undefined);
  const [dealerId, setDealerId] = useState<number | undefined>(undefined);
  const [validFromInput, setValidFromInput] = useState<string>("");
  const [validUntilInput, setValidUntilInput] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // çoklu para birimi satırları
  const [rows, setRows] = useState<Row[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      const data = await listAllProductPrices(page, size);
      setPrices(data);
    } catch (e: any) {
      console.error(e);
      MySwal.fire("Hata", e.message || "Fiyatlar yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadData();
  }, [page]);

  async function hydrateLookups() {
    const prods = await listSimpleProducts();
    const dels = await listSimpleDealers();
    setProducts(prods);
    setDealers(dels);
  }

  // Yeni Fiyat
  async function handleAdd() {
    await hydrateLookups();
    setEditItem(null);

    setProductId(undefined);
    setDealerId(undefined);
    setValidFromInput("");
    setValidUntilInput("");
    setIsActive(true);

    // başlangıçta tek satır (TRY)
    setRows([{ currency: "TRY", amount: undefined, existing: false }]);

    setShowModal(true);
  }

  // Güncelle
  async function handleEdit(item: ProductPrice) {
    await hydrateLookups();
    setEditItem(item);

    setProductId(item.productId);
    setDealerId(item.dealerId);
    setValidFromInput(toLocalInput(item.validFrom));
    setValidUntilInput(toLocalInput(item.validUntil));
    setIsActive(!!item.isActive);

    // Mevcut tüm currency'leri satıra dök
    const ordered = [...item.prices].sort((a, b) => {
      const ai = PREFERRED.indexOf(a.currency);
      const bi = PREFERRED.indexOf(b.currency);
      const as = ai === -1 ? 999 : ai;
      const bs = bi === -1 ? 999 : bi;
      return as - bs;
    });
    setRows(
      ordered.map((p) => ({
        currency: p.currency,
        amount: p.amount,
        existing: true,
      }))
    );

    setShowModal(true);
  }

  // Currency seçenekleri (mevcut + tercih edilenler)
  const currencyOptions = useMemo(() => {
    const set = new Set<string>(PREFERRED);
    rows.forEach((r) => set.add(r.currency));
    return Array.from(set);
  }, [rows]);

  function usedCurrencies(excludeIndex?: number) {
    return new Set(
      rows
        .map((r, i) =>
          excludeIndex != null && i === excludeIndex ? null : r.currency
        )
        .filter((x): x is string => !!x)
    );
  }

  function addRow() {
    // ilk kullanılmayan tercih edilen para birimini seç
    const used = usedCurrencies();
    const firstFree = PREFERRED.find((c) => !used.has(c)) || "";
    setRows((prev) => [
      ...prev,
      { currency: firstFree, amount: undefined, existing: false },
    ]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  // Kaydet
  async function handleSave() {
    try {
      // temel kontroller
      if (!productId || !dealerId) {
        await MySwal.fire("Hata", "Ürün ve Bayi seçiniz.", "error");
        return;
      }
      if (rows.length === 0) {
        await MySwal.fire(
          "Hata",
          "En az bir para birimi satırı ekleyin.",
          "error"
        );
        return;
      }
      // para birimi boş/duplikasyon/miktar kontrolü
      const seen = new Set<string>();
      for (const r of rows) {
        if (!r.currency) {
          await MySwal.fire("Hata", "Para birimi boş olamaz.", "error");
          return;
        }
        if (seen.has(r.currency)) {
          await MySwal.fire(
            "Hata",
            `Aynı para birimi birden fazla: ${r.currency}`,
            "error"
          );
          return;
        }
        seen.add(r.currency);
        if (
          r.amount == null ||
          !Number.isFinite(Number(r.amount)) ||
          Number(r.amount) < 0
        ) {
          await MySwal.fire("Hata", `Geçersiz tutar (${r.currency}).`, "error");
          return;
        }
      }

      const vf = ensureSeconds(validFromInput || null);
      const vu = ensureSeconds(validUntilInput || null);

      // edit: değişenleri update, yeni eklenenleri create
      if (editItem) {
        const original = new Map<string, number>();
        editItem.prices.forEach((p) => original.set(p.currency, p.amount));

        const ops: Promise<any>[] = [];

        rows.forEach((r) => {
          const amt = Number(r.amount);
          if (r.existing) {
            const prevAmt = original.get(r.currency);
            // sadece miktar değiştiyse update çekelim
            if (
              prevAmt !== amt ||
              vf !== editItem.validFrom ||
              vu !== editItem.validUntil ||
              isActive !== editItem.isActive
            ) {
              ops.push(
                updateProductPrice(editItem.id, {
                  productId,
                  dealerId,
                  currency: r.currency,
                  amount: amt,
                  validFrom: vf,
                  validUntil: vu,
                  isActive,
                } as UpdateProductPriceRequest)
              );
            }
          } else {
            // yeni para birimi -> create
            ops.push(
              createProductPrice({
                productId,
                dealerId,
                currency: r.currency,
                amount: amt,
                validFrom: vf,
                validUntil: vu,
                isActive,
              } as CreateProductPriceRequest)
            );
          }
        });

        await Promise.all(ops);
        await MySwal.fire("Başarılı", "Fiyat(lar) güncellendi", "success");
      } else {
        // create: her satır için create çağrısı
        const ops: Promise<any>[] = rows.map((r) =>
          createProductPrice({
            productId,
            dealerId,
            currency: r.currency,
            amount: Number(r.amount),
            validFrom: vf,
            validUntil: vu,
            isActive,
          } as CreateProductPriceRequest)
        );
        await Promise.all(ops);
        await MySwal.fire("Başarılı", "Fiyat(lar) oluşturuldu", "success");
      }

      setShowModal(false);
      loadData();
    } catch (e: any) {
      await MySwal.fire("Hata", e?.message || "Kaydetme başarısız", "error");
    }
  }

  // Sil
  async function handleDelete(item: ProductPrice) {
    const confirm = await MySwal.fire({
      title: "Emin misiniz?",
      text: `Fiyat #${item.id} silinecek`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });
    if (!confirm.isConfirmed) return;
    try {
      const ok = await deleteProductPrice(item.id);
      if (ok) {
        setPrices((prev) =>
          prev
            ? { ...prev, content: prev.content.filter((p) => p.id !== item.id) }
            : prev
        );
        MySwal.fire("Silindi", "Fiyat başarıyla silindi", "success");
      }
    } catch (e: any) {
      MySwal.fire("Hata", e?.message || "Silme başarısız", "error");
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center mb-5 justify-content-between">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">Ürün Fiyat Yönetimi</h3>
          </div>
          <button
            className="sherah-btn sherah-gbcolor ms-2"
            onClick={handleAdd}
            title="Yeni Fiyat"
          >
            Yeni Fiyat
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor</span>
          </div>
        </div>
      ) : (
        <table className="sherah-table__main sherah-table__main-v3">
          <thead className="sherah-table__head">
            <tr>
              <th>Ürün Fiyat ID</th>
              <th>Ürün</th>
              <th>Bayi</th>
              <th>Tutar(lar)</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody className="sherah-table__body">
            {prices?.content.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.productName} <small>({p.productCode})</small>
                </td>
                <td>{p.dealerName}</td>
                <td>
                  {Array.isArray(p.prices) && p.prices.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {p.prices.map((pa) => (
                        <span
                          key={pa.currency}
                          className="badge bg-light text-dark border"
                        >
                          {pa.amount} {pa.currency}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  {p.isActive ? (
                    <span className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
                      Aktif
                    </span>
                  ) : (
                    <span className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
                      Pasif
                    </span>
                  )}
                </td>
                <td>
                  <div className="sherah-table__status__group justify-content-start">
                    <button
                      className="sherah-table__action sherah-color2 sherah-color3__bg--opactity"
                      title="Güncelle"
                      onClick={() => handleEdit(p)}
                    >
                      <i className="fa-regular fa-pen-to-square" />
                    </button>
                    <button
                      className="sherah-table__action sherah-color2 sherah-color2__bg--offset"
                      title="Sil"
                      onClick={() => handleDelete(p)}
                    >
                      <i className="fa-regular fa-trash-can" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editItem ? "Fiyat Güncelle" : "Yeni Fiyat"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* Ürün */}
                <label>Ürün</label>
                <Select
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.code})`,
                  }))}
                  value={
                    productId
                      ? products
                          .map((p) => ({
                            value: p.id,
                            label: `${p.name} (${p.code})`,
                          }))
                          .find((opt) => opt.value === productId) || null
                      : null
                  }
                  onChange={(opt) => setProductId(opt?.value)}
                />

                {/* Bayi */}
                <label className="mt-2">Bayi</label>
                <Select
                  options={dealers.map((d) => ({ value: d.id, label: d.name }))}
                  value={
                    dealerId
                      ? dealers
                          .map((d) => ({ value: d.id, label: d.name }))
                          .find((opt) => opt.value === dealerId) || null
                      : null
                  }
                  onChange={(opt) => setDealerId(opt?.value)}
                />

                {/* Çoklu fiyat satırları */}
                <div className="d-flex align-items-center justify-content-between mt-3">
                  <h6 className="mb-0">Fiyatlar (çoklu para birimi)</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addRow}
                  >
                    + Para Birimi Ekle
                  </button>
                </div>

                <div className="border rounded p-2 mt-2">
                  {rows.length === 0 ? (
                    <div className="text-muted">Satır yok.</div>
                  ) : (
                    rows.map((r, idx) => {
                      const used = usedCurrencies(idx);
                      const opts = currencyOptions; // ["TRY","USD","EUR", + mevcutlar]
                      return (
                        <div
                          className="row align-items-end g-2 mb-2"
                          key={`${r.currency}_${idx}`}
                        >
                          <div className="col-md-4">
                            <label className="form-label">Para Birimi</label>
                            <select
                              className="form-select"
                              value={r.currency}
                              disabled={r.existing} // mevcutta para birimi sabit
                              onChange={(e) => {
                                const val = e.target.value;
                                if (used.has(val)) {
                                  MySwal.fire(
                                    "Uyarı",
                                    "Bu para birimi zaten eklendi.",
                                    "warning"
                                  );
                                  return;
                                }
                                updateRow(idx, { currency: val });
                              }}
                            >
                              <option value="">Seçiniz</option>
                              {opts.map((c) => (
                                <option
                                  key={c}
                                  value={c}
                                  disabled={used.has(c)}
                                >
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Tutar</label>
                            <input
                              type="number"
                              className="form-control"
                              step="0.01"
                              min={0}
                              value={r.amount ?? ""}
                              onChange={(e) =>
                                updateRow(idx, {
                                  amount:
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label d-block"> </label>
                            {!r.existing ? (
                              <button
                                type="button"
                                className="btn btn-outline-danger w-100"
                                onClick={() => removeRow(idx)}
                              >
                                Sil
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                disabled
                              >
                                Mevcut
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Geçerlilik ve durum */}
                <div className="row mt-3">
                  <div className="col-md-6">
                    <label className="form-label">Geçerlilik Başlangıç</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={validFromInput}
                      onChange={(e) => setValidFromInput(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Geçerlilik Bitiş</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={validUntilInput}
                      onChange={(e) => setValidUntilInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-check mt-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    className="form-check-input"
                    checked={!!isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Aktif mi?
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  İptal
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sayfalama */}
      {prices && (
        <div className="dataTables_paginate paging_simple_numbers justify-content-end mt-3 px-3 pb-3">
          <ul className="pagination">
            <li
              className={`paginate_button page-item previous ${
                prices.first ? "disabled" : ""
              }`}
            >
              <a
                href="#"
                className="page-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (!prices.first) setPage((p) => Math.max(0, p - 1));
                }}
              >
                <i className="fas fa-angle-left" />
              </a>
            </li>
            {Array.from({ length: prices.totalPages }, (_, i) => (
              <li
                key={i}
                className={`paginate_button page-item ${
                  i === prices.number ? "active" : ""
                }`}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i);
                  }}
                >
                  {i + 1}
                </a>
              </li>
            ))}
            <li
              className={`paginate_button page-item next ${
                prices.last ? "disabled" : ""
              }`}
            >
              <a
                href="#"
                className="page-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (!prices.last)
                    setPage((p) =>
                      Math.min((prices.totalPages ?? 1) - 1, p + 1)
                    );
                }}
              >
                <i className="fas fa-angle-right" />
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
