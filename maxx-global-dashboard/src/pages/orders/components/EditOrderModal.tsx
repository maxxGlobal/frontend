import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import type {
  EditOrderBody,
  OrderItem,
  OrderResponse,
} from "../../../types/order";
import { editOrder } from "../../../services/orders/edit";
import { listSimpleProducts } from "../../../services/products/listSimple";
import {
  getProductDealerPrice,
  type ProductDealerPriceResponse,
} from "../../../services/product-prices/getByProductAndDealer";

// ✅ Simple product response'undaki variant tipi
type ProductVariant = {
  id: number;
  size: string | null;
  sku: string | null;
  stockQuantity: number | null;
  isDefault: boolean;
};

type ProductSimpleBase = Awaited<ReturnType<typeof listSimpleProducts>>[number];
type ProductSimple = ProductSimpleBase & { variants?: ProductVariant[] };

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

  const [availableProducts, setAvailableProducts] = useState<ProductSimple[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductPrice, setSelectedProductPrice] = useState<ProductDealerPriceResponse | null>(null);
  
  // ✅ Seçili ürünün varyantları (simple product'tan geliyor)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const currency = order.currency;

  // Ürünleri yükle
  useEffect(() => {
    async function loadProducts() {
      if (!open || !order) return;

      try {
        setLoading(true);
        const products = await listSimpleProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error("Error loading products:", error);
        Swal.fire("Hata", "Ürün listesi yüklenemedi", "error");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [open, order]);

  // ✅ Seçili ürünün varyantlarını al (zaten simple product'ta var!)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return availableProducts.find(p => p.id === selectedProductId);
  }, [selectedProductId, availableProducts]);

  const productVariants = useMemo<ProductVariant[]>(() => {
    return selectedProduct?.variants || [];
  }, [selectedProduct]);

  // ✅ Ürün seçildiğinde default varyantı seç
  useEffect(() => {
    if (!selectedProductId || productVariants.length === 0) {
      setSelectedVariantId(null);
      return;
    }

    // Default varyantı bul veya ilk varyantı seç
    const defaultVariant = productVariants.find(v => v.isDefault);
    setSelectedVariantId(defaultVariant?.id || productVariants[0].id);
  }, [selectedProductId, productVariants]);

  // ✅ Varyant seçildiğinde fiyatını çek
  useEffect(() => {
    async function loadVariantPrice() {
      if (!selectedProductId || !selectedVariantId || !order?.dealerId) return;

      try {
        setPriceLoading(true);
        const priceData = await getProductDealerPrice(
          selectedProductId,
          order.dealerId,
          selectedVariantId
        );

        const matchingPrice = priceData.prices.find(
          (p) => p.currency === order.currency
        );
        if (!matchingPrice) {
          Swal.fire(
            "Uyarı",
            `Bu varyant için ${order.currency} cinsinden fiyat bulunamadı`,
            "warning"
          );
          setSelectedProductPrice(null);
          return;
        }

        if (!priceData.isValidNow) {
          Swal.fire(
            "Uyarı",
            "Bu varyantın fiyatı şu anda geçerli değil",
            "warning"
          );
          setSelectedProductPrice(null);
          return;
        }

        setSelectedProductPrice(priceData);
      } catch (error) {
        console.error("Error loading variant price:", error);
        Swal.fire("Hata", "Varyant fiyatı yüklenemedi", "error");
        setSelectedProductPrice(null);
      } finally {
        setPriceLoading(false);
      }
    }

    loadVariantPrice();
  }, [selectedProductId, selectedVariantId, order?.dealerId, order?.currency]);

  // Mevcut siparişte olmayan ürünleri filtrele
 

  const selectedVariantPriceAmount = useMemo(() => {
    if (!selectedProductPrice || !order) return null;
    const matchingPrice = selectedProductPrice.prices.find(
      (p) => p.currency === order.currency
    );
    return matchingPrice?.amount || null;
  }, [selectedProductPrice, order?.currency]);

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return productVariants.find(v => v.id === selectedVariantId);
  }, [selectedVariantId, productVariants]);

  function handleQuantityChange(productId: number, quantity: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId
          ? { ...it, quantity: Math.max(1, quantity) }
          : it
      )
    );
  }

  function handleRemoveItem(
    productId: number,
    productPriceId: number | null
  ) {
    setItems((prev) => prev.filter((it) =>
      !(it.productId === productId && it.productPriceId === productPriceId)
    ));
  }

  function handleAddNewItem() {
    if (
      !selectedProductPrice ||
      !selectedVariantPriceAmount ||
      !selectedVariantId ||
      !selectedVariant ||
      newItemQuantity <= 0
    ) {
      Swal.fire(
        "Uyarı",
        "Lütfen geçerli bir ürün, varyant ve miktar seçiniz",
        "warning"
      );
      return;
    }

    const exists = items.some(
      item => item.productId === selectedProductPrice.productId && 
              item.productPriceId === selectedProductPrice.id
    );

    if (exists) {
      Swal.fire("Uyarı", "Bu varyant zaten siparişte mevcut", "warning");
      return;
    }

  const newItem: OrderItem = {
  productId: selectedProductPrice.productId,
  productPriceId: selectedProductPrice.id,
  productName: `${selectedProductPrice.productName} - ${selectedVariant.size || 'Standart'}`,
  quantity: newItemQuantity,
  unitPrice: selectedVariantPriceAmount,
  totalPrice: selectedVariantPriceAmount * newItemQuantity,

  // 🆕 Eksik zorunlu alanlar
  variantSize: selectedVariant.size || "Standart",
  variantSku: selectedVariant.sku || "",
};


    setItems((prev) => [...prev, newItem]);

    setSelectedProductId(null);
    setSelectedVariantId(null);
    setSelectedProductPrice(null);
    setNewItemQuantity(1);
    setShowAddSection(false);

    Swal.fire("Başarılı", "Varyant siparişe eklendi", "success");
  }

  function handleProductChange(productId: number | null) {
    setSelectedProductId(productId);
    setSelectedVariantId(null);
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
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
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
                <label className="form-label">Düzenleme Nedeni *</label>
                <input
                  type="text"
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="örn: ürün stokta yok"
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Sipariş Kalemleri ({items.length})</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowAddSection(!showAddSection)}
                    disabled={loading}
                  >
                    <i className="fa fa-plus me-1"></i>
                    {showAddSection ? 'Kapat' : 'Varyant Ekle'}
                  </button>
                </div>

                {showAddSection && (
                  <div className="card p-3 bg-light mb-3">
                    <h6 className="mb-3">
                      <i className="fa fa-box me-2"></i>
                      Yeni Varyant Ekle
                    </h6>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Ürün *</label>
                        <select
                          className="form-select"
                          value={selectedProductId || ""}
                          onChange={(e) =>
                            handleProductChange(Number(e.target.value) || null)
                          }
                          disabled={loading}
                        >
                          <option value="">Ürün Seçin...</option>
                          {availableProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Varyant *</label>
                        {productVariants.length > 0 ? (
                          <select
                            className="form-select"
                            value={selectedVariantId || ""}
                            onChange={(e) =>
                              setSelectedVariantId(Number(e.target.value) || null)
                            }
                            disabled={!selectedProductId}
                          >
                            <option value="">Varyant Seçin...</option>
                            {productVariants.map((variant) => (
                              <option key={variant.id} value={variant.id}>
                                {variant.size || 'Standart'} 
                                {variant.sku && ` (${variant.sku})`}
                                {variant.stockQuantity != null && ` - Stok: ${variant.stockQuantity}`}
                              </option>
                            ))}
                          </select>
                        ) : selectedProductId ? (
                          <div className="form-control text-muted">
                            Varyant yok
                          </div>
                        ) : (
                          <div className="form-control text-muted">
                            Önce ürün seçin
                          </div>
                        )}
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Birim Fiyat</label>
                        <div className="form-control d-flex align-items-center">
                          {priceLoading ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" />
                              <span className="small">...</span>
                            </>
                          ) : selectedVariantPriceAmount ? (
                            <span className="fw-bold text-success">
                              {selectedVariantPriceAmount} {currency}
                            </span>
                          ) : selectedVariantId ? (
                            <span className="text-danger small">Fiyat yok</span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Miktar *</label>
                        <input
                          type="number"
                          className="form-control"
                          min={1}
                          value={newItemQuantity}
                          onChange={(e) =>
                            setNewItemQuantity(Math.max(1, Number(e.target.value)))
                          }
                          disabled={loading || priceLoading}
                        />
                      </div>

                      <div className="col-md-1">
                        <label className="form-label">&nbsp;</label>
                        <button
                          type="button"
                          className="btn btn-success w-100"
                          onClick={handleAddNewItem}
                          disabled={
                            !selectedProductPrice ||
                            !selectedVariantPriceAmount ||
                            !selectedVariantId ||
                            loading ||
                            priceLoading
                          }
                        >
                          <i className="fa fa-check"></i>
                        </button>
                      </div>
                    </div>

                    {selectedVariantPriceAmount && selectedVariant && (
                      <div className="alert alert-info mt-3 mb-0">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>Önizleme:</strong>
                            <span className="ms-2">
                              {selectedVariant.size || 'Standart'} × {newItemQuantity}
                            </span>
                          </div>
                          <div className="fs-5 fw-bold">
                            {(newItemQuantity * selectedVariantPriceAmount).toFixed(2)} {currency}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40%' }}>Ürün & Varyant</th>
                      <th style={{ width: '15%' }}>Miktar</th>
                      <th style={{ width: '15%' }}>Birim Fiyat</th>
                      <th style={{ width: '20%' }}>Toplam</th>
                      <th style={{ width: '10%' }} className="text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          <i className="fa fa-inbox fa-2x mb-2 d-block"></i>
                          Sipariş boş. Varyant ekleyin.
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={`${it.productId}-${it.productPriceId}`}>
                          <td>
                            <div className="fw-medium">{it.productName}{" "}-{" "} {it.variantSku}</div>
                            <small className="text-muted">ID: {it.productId}</small>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min={1}
                              style={{ maxWidth: '80px' }}
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
                            {it.unitPrice.toFixed(2)} {currency}
                          </td>
                          <td>
                            <strong>
                              {(it.unitPrice * it.quantity).toFixed(2)} {currency}
                            </strong>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveItem(it.productId, it.productPriceId)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot className="table-light">
                      <tr>
                        <th colSpan={3} className="text-end">Ara Toplam:</th>
                        <th>
                          <span className="fs-5">
                            {calcTotals.subtotal.toFixed(2)} {currency}
                          </span>
                        </th>
                        <th></th>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                İptal
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleSave}
                disabled={loading || items.length === 0 || !reason.trim()}
              >
                <i className="fa fa-save me-1"></i>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}