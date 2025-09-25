// src/pages/orders/components/EditOrderModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import type {
  EditOrderBody,
  OrderItem,
  OrderResponse,
} from "../../../types/order";
import { editOrder } from "../../../services/orders/edit";
import { listSimpleProducts, type ProductSimple } from "../../../services/products/listSimple";
import { getProductDealerPrice, type ProductDealerPriceResponse } from "../../../services/product-prices/getByProductAndDealer";

interface Props {
  open: boolean;
  onClose: () => void;
  order: OrderResponse | null;
  onUpdated: (order: OrderResponse) => void;
}

export default function EditOrderModal({
  open,
  onClose,
  order,
  onUpdated,
}: Props) {
  if (!open || !order) return null;

  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>(order.notes ?? "");
  const [items, setItems] = useState<OrderItem[]>(order.items);
  
  // ✅ YENİ: Ürün ekleme için state'ler
  const [availableProducts, setAvailableProducts] = useState<ProductSimple[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductPrice, setSelectedProductPrice] = useState<ProductDealerPriceResponse | null>(null);
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const currency = order.currency;

  // ✅ YENİ: Ürünleri yükle
  useEffect(() => {
    async function loadProducts() {
      if (!open || !order) return;
      
      try {
        setLoading(true);
        const products = await listSimpleProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
        Swal.fire('Hata', 'Ürün listesi yüklenemedi', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [open, order]);

  // ✅ YENİ: Ürün seçildiğinde fiyatını çek
  useEffect(() => {
    async function loadProductPrice() {
      if (!selectedProductId || !order?.dealerId) return;

      try {
        setPriceLoading(true);
        const priceData = await getProductDealerPrice(selectedProductId, order.dealerId);
        
        // Currency kontrolü
        const matchingPrice = priceData.prices.find(p => p.currency === order.currency);
        if (!matchingPrice) {
          Swal.fire('Uyarı', `Bu ürün için ${order.currency} cinsinden fiyat bulunamadı`, 'warning');
          setSelectedProductPrice(null);
          return;
        }

        if (!priceData.isValidNow) {
          Swal.fire('Uyarı', 'Bu ürünün fiyatı şu anda geçerli değil', 'warning');
          setSelectedProductPrice(null);
          return;
        }

        setSelectedProductPrice(priceData);
      } catch (error) {
        console.error('Error loading product price:', error);
        Swal.fire('Hata', 'Ürün fiyatı yüklenemedi', 'error');
        setSelectedProductPrice(null);
      } finally {
        setPriceLoading(false);
      }
    }

    loadProductPrice();
  }, [selectedProductId, order?.dealerId, order?.currency]);

  // ✅ YENİ: Mevcut siparişte olmayan ürünleri filtrele
  const availableProductsFiltered = useMemo(() => {
    const currentProductIds = items.map(item => item.productId);
    return availableProducts.filter(product => !currentProductIds.includes(product.id));
  }, [availableProducts, items]);

  // ✅ YENİ: Seçilen ürünün fiyat bilgisi
  const selectedProductPriceAmount = useMemo(() => {
    if (!selectedProductPrice || !order) return null;
    const matchingPrice = selectedProductPrice.prices.find(p => p.currency === order.currency);
    return matchingPrice?.amount || null;
  }, [selectedProductPrice, order?.currency]);

  function handleQuantityChange(productId: number, quantity: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId
          ? { ...it, quantity: Math.max(1, quantity) }
          : it
      )
    );
  }

  function handleRemoveItem(productId: number) {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  }

  // ✅ YENİ: Yeni ürün ekleme fonksiyonu
  function handleAddNewItem() {
    if (!selectedProductPrice || !selectedProductPriceAmount || newItemQuantity <= 0) {
      Swal.fire('Uyarı', 'Lütfen geçerli bir ürün ve miktar seçiniz', 'warning');
      return;
    }

    const newItem: OrderItem = {
      productId: selectedProductPrice.productId,
      productPriceId: selectedProductPrice.id,
      productName: selectedProductPrice.productName,
      quantity: newItemQuantity,
      unitPrice: selectedProductPriceAmount,
      totalPrice: selectedProductPriceAmount * newItemQuantity
    };

    setItems(prev => [...prev, newItem]);

    // Reset form
    setSelectedProductId(null);
    setSelectedProductPrice(null);
    setNewItemQuantity(1);
    setShowAddSection(false);
    
    Swal.fire('Başarılı', 'Ürün siparişe eklendi', 'success');
  }

  // Reset price when product selection changes
  function handleProductChange(productId: number | null) {
    setSelectedProductId(productId);
    setSelectedProductPrice(null);
  }

  const calcTotals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, it) => sum + it.unitPrice * it.quantity,
      0
    );
    return { subtotal, total: subtotal };
  }, [items]);

  async function handleSave() {
    if (!reason.trim()) {
      Swal.fire("Uyarı", "Lütfen bir düzenleme nedeni giriniz", "warning");
      return;
    }

    if (!order!.dealerId) {
      Swal.fire("Hata", "Dealer ID bulunamadı", "error");
      return;
    }

    if (items.length === 0) {
      Swal.fire("Uyarı", "En az bir ürün kalmalı.", "warning");
      return;
    }

    const body: EditOrderBody = {
      dealerId: order!.dealerId,
      products: items.map((it) => ({
        productPriceId: it.productPriceId,
        quantity: it.quantity,
      })),
      discountId: null,
      notes: notes.trim() ? notes : undefined,
    };

    try {
      const updated = await editOrder(order!.id, reason.trim(), body);
      Swal.fire("Başarılı", "Sipariş düzenlendi", "success");

      onUpdated(updated);
      setItems(updated.items);
      setNotes(updated.notes ?? "");
      setReason("");
      setShowAddSection(false);

      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Bilinmeyen hata oluştu";
      Swal.fire("Hata", msg, "error");
    }
  }

  return (
    <>
      <div className="modal show d-block z-3">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Sipariş Düzenle - #{order.orderNumber}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Düzenleme Nedeni</label>
                <input
                  type="text"
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="örn: ürün stokta yok"
                />
              </div>

              {/* ✅ YENİ: Ürün Ekleme Bölümü */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6>Ürünler ({items.length})</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowAddSection(!showAddSection)}
                    disabled={loading}
                  >
                    <i className="fa fa-plus me-1"></i>
                    Ürün Ekle
                  </button>
                </div>

                {/* Ürün Ekleme Formu */}
                {showAddSection && (
                  <div className="card mt-2 p-3 bg-light">
                    <h6 className="mb-3">Yeni Ürün Ekle</h6>
                    
                    <div className="row">
                      <div className="col-md-5">
                        <label className="form-label">Ürün</label>
                        <select
                          className="form-select"
                          value={selectedProductId || ""}
                          onChange={(e) => handleProductChange(Number(e.target.value) || null)}
                          disabled={loading}
                        >
                          <option value="">Ürün Seçin...</option>
                          {availableProductsFiltered.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Fiyat</label>
                        <div className="form-control d-flex align-items-center">
                          {priceLoading ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" />
                              Yükleniyor...
                            </>
                          ) : selectedProductPriceAmount ? (
                            <span className="fw-bold text-success">
                              {selectedProductPriceAmount} {currency}
                            </span>
                          ) : selectedProductId ? (
                            <span className="text-danger">Fiyat bulunamadı</span>
                          ) : (
                            <span className="text-muted">Ürün seçin</span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Miktar</label>
                        <input
                          type="number"
                          className="form-control"
                          min={1}
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(Math.max(1, Number(e.target.value)))}
                          disabled={loading || priceLoading}
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">&nbsp;</label>
                        <div>
                          <button
                            type="button"
                            className="btn btn-success w-100"
                            onClick={handleAddNewItem}
                            disabled={!selectedProductPrice || !selectedProductPriceAmount || loading || priceLoading}
                          >
                            Ekle
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Toplam Önizleme */}
                    {selectedProductPriceAmount && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <div className="alert alert-info small">
                            <strong>Önizleme:</strong> {newItemQuantity} x {selectedProductPriceAmount} {currency} = {(newItemQuantity * selectedProductPriceAmount).toFixed(2)} {currency}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {availableProductsFiltered.length === 0 && (
                      <div className="alert alert-info mt-2">
                        <i className="fa fa-info-circle me-1"></i>
                        Tüm ürünler zaten siparişte mevcut.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mevcut Ürün Listesi */}
              <table className="table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.productId}>
                      <td>{it.productName}</td>
                      <td style={{ maxWidth: 120 }}>
                        <input
                          type="number"
                          className="form-control"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              it.productId,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td>
                        {it.unitPrice} {currency}
                      </td>
                      <td>
                        {(it.unitPrice * it.quantity).toFixed(2)} {currency}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveItem(it.productId)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-end">
                      Ara Toplam
                    </th>
                    <th>
                      {calcTotals.subtotal.toFixed(2)} {currency}
                    </th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>

              {/* Loading State */}
              {loading && (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm me-2" />
                  Ürün bilgileri yükleniyor...
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-success p-2 px-3" onClick={handleSave}>
                Kaydet
              </button>

              <button className="btn btn-danger p-2 px-3" onClick={onClose}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}