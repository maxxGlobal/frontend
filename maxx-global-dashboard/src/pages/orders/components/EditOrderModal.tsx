// src/pages/orders/components/EditOrderModal.tsx
import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import type {
  EditOrderBody,
  OrderItem,
  OrderResponse,
} from "../../../types/order";
import { editOrder } from "../../../services/orders/edit";

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

  const currency = order.currency;

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

      // ✅ Parent güncelle
      onUpdated(updated);
      setItems(updated.items);
      setNotes(updated.notes ?? "");
      setReason("");

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
        <div className="modal-dialog modal-lg ">
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

              <h6>Ürünler</h6>
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
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSave}>
                Kaydet
              </button>

              <button className="btn btn-secondary" onClick={onClose}>
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
