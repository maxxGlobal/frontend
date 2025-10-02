// src/pages/orders/components/OrderDetailModal.tsx

import Swal from "sweetalert2";
import type { OrderResponse } from "../../../types/order";

interface Props {
  open: boolean;
  onClose: () => void;
  order: OrderResponse | null;
  onApprove: (id: number, note: string) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
  onShip: (id: number, note: string) => Promise<void>;
}

export default function OrderDetailModal({
  open,
  onClose,
  order,
  onApprove,
  onReject,
  onShip,
}: Props) {
  if (!open || !order) return null;

  const {
    id,
    orderNumber,
    dealerName,
    createdBy,
    orderDate,
    orderStatus,
    items,
    totalAmount,
    currency,
    notes,
    adminNotes,
  } = order;

  async function getNote(title: string, def: string) {
    const { value } = await Swal.fire({
      title,
      input: "textarea",
      inputValue: def,
      showCancelButton: true,
      confirmButtonText: "Tamam",
      cancelButtonText: "İptal",
    });
    return (value as string) ?? null;
  }

  async function safeAction<T>(fn: () => Promise<T>, successMsg: string) {
    try {
      await fn();
      onClose();
      await Swal.fire("Başarılı", successMsg, "success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Bilinmeyen bir hata oluştu";
      await Swal.fire("Hata", msg, "error");
    }
  }

  async function handleApproveClick() {
    const note = await getNote("Onay Notu", "Sipariş onaylandı");
    if (!note) return;
    await safeAction(() => onApprove(id, note), "Sipariş onaylandı");
  }

  async function handleRejectClick() {
    const reason = await getNote("Red Nedeni", "Stok yetersizliği");
    if (!reason) return;
    await safeAction(() => onReject(id, reason), "Sipariş reddedildi");
  }

  async function handleShipClick() {
    const note = await getNote("Kargo Notu", "Kargo firmasına teslim edildi");
    if (!note) return;
    await safeAction(() => onShip(id, note), "Sipariş kargolandı");
  }

  // 🛠 Düzenle: dealerId gerekiyor → yoksa simple listeden ad ile buluyoruz
  // async function handleEditClick() {
  //   const reason = await getNote(
  //     "Düzenleme Nedeni",
  //     "Stok durumu nedeniyle güncellendi"
  //   );
  //   if (!reason) return;

  //   let resolvedDealerId: number | undefined = dealerId;

  //   if (!resolvedDealerId) {
  //     // dealerId backend listesinden gelmiyorsa, /dealers/simple ile adı eşleştir
  //     try {
  //       const dealers = await listSimpleDealers(); // [{id, name}]
  //       const match = dealers.find((d) => d.name === dealerName);
  //       if (match) resolvedDealerId = match.id;
  //     } catch {
  //       /* ignore; fallback aşağıda */
  //     }
  //   }

  //   if (!resolvedDealerId) {
  //     await Swal.fire(
  //       "Hata",
  //       "Dealer ID bulunamadı. Lütfen bayi bilgisini kontrol edin.",
  //       "error"
  //     );
  //     return;
  //   }

  //   const body: EditOrderBody = {
  //     dealerId: resolvedDealerId,
  //     products: items.map((it) => ({
  //       productPriceId: it.productPriceId,
  //       quantity: it.quantity,
  //     })),
  //     discountId: null,
  //     notes: notes ?? undefined, // null ise hiç gönderme
  //   };

  //   await safeAction(() => editOrder(id, reason, body), "Sipariş düzenlendi");
  // }

  return (
    <>
      <div
        className={`modal fade ${open ? "show d-block" : ""}`}
        tabIndex={-1}
        style={{ transition: "opacity 0.2 ease" }}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sipariş Detayı - #{orderNumber}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <p>
                <strong>Bayi:</strong> {dealerName}
              </p>
              <p>
                <strong>Oluşturan:</strong> {createdBy.fullName}
              </p>
              <p>
                <strong>Tarih:</strong> {new Date(orderDate).toLocaleString()}
              </p>
              <p>
                <strong>Durum:</strong> {orderStatus}
              </p>
              <hr />
              <h6>Ürünler</h6>
              <ul>
                {items.map((it) => (
                  <li key={it.productId}>
                    {it.productName} x{it.quantity} → {it.totalPrice} {currency}
                  </li>
                ))}
              </ul>
              <hr />
              <p>
                <strong>Toplam:</strong> {totalAmount} {currency}
              </p>

              {notes && (
                <div className="alert alert-warning mt-4">
                  <strong className="text-dark">Müşteri Notu:</strong>
                  <br />
                  {notes.split("\n").map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              )}

              {adminNotes && (
                <div className="alert alert-success">
                  <strong className="text-dark">Admin Notu:</strong>
                  <ul className="list-group list-group-numbered">
                    {adminNotes
                      .split("\n")
                      .filter((l) => l.trim() !== "")
                      .map((l, i) => (
                        <li className="mb-2" key={i}>
                          {l}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {/* BEKLEMEDE → Onay/Reddet */}
              {orderStatus === "BEKLEMEDE" && (
                <>
                  <button
                    className="btn btn-success p-2 px-3"
                    onClick={handleApproveClick}
                  >
                    Onayla
                  </button>
                  <button
                    className="btn btn-danger p-2 px-3"
                    onClick={handleRejectClick}
                  >
                    Reddet
                  </button>
                </>
              )}

              {/* APPROVED → Kargola */}
              {orderStatus === "ONAYLANDI" && (
                <button
                  className="btn btn-success text-white p-2 px-3"
                  onClick={handleShipClick}
                >
                  Kargola
                </button>
              )}

              {/* Her durumda Düzenle butonu
              <button className="btn btn-warning" onClick={handleEditClick}>
                Düzenle
              </button> */}

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
