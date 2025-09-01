// src/pages/product-prices/ProductPriceManagementPanel.tsx
import React, { useEffect, useState } from "react";
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
  const [form, setForm] = useState<
    Partial<CreateProductPriceRequest & UpdateProductPriceRequest>
  >({
    productId: undefined,
    dealerId: undefined,
    amount: 0,
    currency: "TRY",
    isActive: true,
  });

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

  // ✅ Yeni fiyat ekle modalı aç
  async function handleAdd() {
    const prods = await listSimpleProducts();
    const dels = await listSimpleDealers();
    setProducts(prods);
    setDealers(dels);

    setForm({
      productId: undefined,
      dealerId: undefined,
      amount: 0,
      currency: "TRY",
      isActive: true,
    });
    setEditItem(null);
    setShowModal(true);
  }

  // ✅ Güncelle modalı aç
  async function handleEdit(price: ProductPrice) {
    const prods = await listSimpleProducts();
    const dels = await listSimpleDealers();
    setProducts(prods);
    setDealers(dels);

    setForm({
      productId: price.productId,
      dealerId: price.dealerId,
      amount: price.amount,
      currency: price.currency,
      validFrom: price.validFrom,
      validUntil: price.validUntil,
      isActive: price.isActive,
    });

    setEditItem(price);
    setShowModal(true);
  }

  // ✅ Kaydet (create veya update)
  async function handleSave() {
    try {
      if (!form.productId || !form.dealerId || !form.amount) {
        MySwal.fire("Hata", "Tüm alanlar doldurulmalı", "error");
        return;
      }

      if (editItem) {
        await updateProductPrice(
          editItem.id,
          form as UpdateProductPriceRequest
        );
        MySwal.fire("Başarılı", "Fiyat güncellendi", "success");
      } else {
        await createProductPrice(form as CreateProductPriceRequest);
        MySwal.fire("Başarılı", "Yeni fiyat oluşturuldu", "success");
      }

      setShowModal(false);
      loadData();
    } catch (e: any) {
      MySwal.fire("Hata", e.message || "Kaydetme başarısız", "error");
    }
  }

  // ✅ Silme
  async function handleDelete(price: ProductPrice) {
    const confirm = await MySwal.fire({
      title: "Emin misiniz?",
      text: `Fiyat #${price.id} silinecek`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const success = await deleteProductPrice(price.id);
      if (success) {
        setPrices((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.filter((p) => p.id !== price.id),
              }
            : prev
        );
        MySwal.fire("Silindi", "Fiyat başarıyla silindi", "success");
      }
    } catch (e: any) {
      MySwal.fire("Hata", e.message || "Silme başarısız", "error");
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center mb-5">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">Ürün Fiyat Yönetimi</h3>
          </div>
          <div className="col-sm-12 col-md-6 d-flex justify-content-end">
            <button className="sherah-btn sherah-gbcolor" onClick={handleAdd}>
              Yeni Fiyat
            </button>
          </div>
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
              <th>Ürün ID</th>
              <th>Ürün</th>
              <th>Bayi</th>
              <th>Tutar</th>
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
                  {p.amount} {p.currency}
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
                    <a
                      href="#"
                      className="sherah-table__action sherah-color2 sherah-color3__bg--opactity"
                      title="Güncelle"
                      onClick={() => handleEdit(p)}
                    >
                      <i className="fa-regular fa-pen-to-square" />
                    </a>
                    <a
                      href="#"
                      className="sherah-table__action sherah-color2 sherah-color2__bg--offset"
                      title="Sil"
                      onClick={() => handleDelete(p)}
                    >
                      <i className="fa-regular fa-trash-can" />
                    </a>
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
                <label>Ürün</label>
                <Select
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.code})`,
                  }))}
                  value={
                    form.productId
                      ? products
                          .map((p) => ({
                            value: p.id,
                            label: `${p.name} (${p.code})`,
                          }))
                          .find((opt) => opt.value === form.productId) || null
                      : null
                  }
                  onChange={(opt) =>
                    setForm((prev) => ({ ...prev, productId: opt?.value }))
                  }
                />

                <label className="mt-2">Bayi</label>
                <Select
                  options={dealers.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                  value={
                    form.dealerId
                      ? dealers
                          .map((d) => ({ value: d.id, label: d.name }))
                          .find((opt) => opt.value === form.dealerId) || null
                      : null
                  }
                  onChange={(opt) =>
                    setForm((prev) => ({ ...prev, dealerId: opt?.value }))
                  }
                />

                <label className="mt-2">Tutar</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.amount ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                />

                <label className="mt-2">Para Birimi</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.currency ?? "TRY"}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, currency: e.target.value }))
                  }
                />
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
    </div>
  );
}
