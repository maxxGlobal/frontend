// src/pages/orders/OrderDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/orders/getOrderById";
import { approveOrder } from "../../services/orders/approve";
import { rejectOrder } from "../../services/orders/reject";
import { shipOrder } from "../../services/orders/ship";
import { downloadOrderPdf } from "../../services/orders/downloadPdf";
import type { OrderResponse } from "../../types/order";
const emailIconUrl = "/assets/img/email.svg";
import Swal from "sweetalert2";
import EditOrderModal from "./components/EditOrderModal";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getOrderById(Number(id));
        setOrder(data);

        // primaryImageUrl doğrudan order item içinden geliyor
        const map: Record<number, string> = {};
        data.items.forEach((it) => {
          map[it.productId] =
            it.primaryImageUrl ?? "/assets/img/resim-yok.jpg";
        });
        setImages(map);
      } catch (error) {
        Swal.fire("Hata", "Sipariş bulunamadı", "error");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  // Helper functions
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
      setActionLoading(true);
      const result = await fn();
      await Swal.fire("Başarılı", successMsg, "success");

      // Siparişi yeniden yükle
      if (order?.id) {
        const updatedOrder = await getOrderById(order.id);
        setOrder(updatedOrder);
      }

      return result;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Bilinmeyen bir hata oluştu";
      await Swal.fire("Hata", msg, "error");
    } finally {
      setActionLoading(false);
    }
  }

  // Action handlers
  async function handleApprove() {
    if (!order) return;
    const note = await getNote("Onay Notu", "Sipariş onaylandı");
    if (!note) return;
    await safeAction(() => approveOrder(order.id, note), "Sipariş onaylandı");
  }

  async function handleReject() {
    if (!order) return;
    const reason = await getNote("Red Nedeni", "Stok yetersizliği");
    if (!reason) return;
    await safeAction(() => rejectOrder(order.id, reason), "Sipariş reddedildi");
  }

  async function handleShip() {
    if (!order) return;
    const note = await getNote("Kargo Notu", "Kargo firmasına teslim edildi");
    if (!note) return;
    await safeAction(() => shipOrder(order.id, note), "Sipariş kargolandı");
  }

  async function handleEdit() {
    if (!order) return;

    // Modal açmak için state ekle
    setEditModalOpen(true);
    setSelectedOrder(order);
  }

  async function handleDownloadPdf() {
    if (!order) return;
    try {
      await downloadOrderPdf(order.id);
    } catch (error) {
      Swal.fire("Hata", "PDF indirilemedi", "error");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "BEKLEMEDE":
        return "sherah-table__status sherah-color4 sherah-color4__bg--opactity";
      case "ONAYLANDI":
        return "sherah-table__status sherah-color3 sherah-color3__bg--opactity";
      case "REDDEDİLDİ":
        return "sherah-table__status sherah-color2 sherah-color2__bg--opactity";
      case "DÜZENLEME ONAY BEKLIYOR":
        return "sherah-table__status sherah-color1 sherah-color1__bg--opactity";
      case "KARGOLANDI":
        return "sherah-table__status bg-info text-white";
      case "İPTAL EDİLDİ":
        return "sherah-table__status sherah-color2 sherah-color2__bg--opactity";
      default:
        return "sherah-table__status sherah-color3 sherah-color3__bg--opactity";
    }
  }

  function canShowActionButtons() {
    if (!order) return false;
    return ["BEKLEMEDE", "ONAYLANDI", "DÜZENLEME ONAY BEKLIYOR"].includes(
      order.orderStatus
    );
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="alert alert-danger">
            Sipariş bulunamadı.
            <div className="mt-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/orders-list")}
              >
                Sipariş Listesine Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="sherah-body">
          <div className="sherah-dsinner">
            {/* Breadcrumb */}
            <div className="row mg-top-30">
              <div className="col-12 sherah-flex-between">
                <div className="sherah-breadcrumb">
                  <h2 className="sherah-breadcrumb__title">Sipariş Detayı</h2>
                  <ul className="sherah-breadcrumb__list">
                    <li>
                      <a href="/dashboard">Anasayfa</a>
                    </li>
                    <li>
                      <a href="/orders-list">Siparişler</a>
                    </li>
                    <li className="active">
                      <a href={`/admin/orders/${order.id}`}>
                        Sipariş #{order.orderNumber}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Order Header with Action Buttons */}
            <div className="sherah-page-inner sherah-border sherah-default-bg mg-top-25">
              <div className="sherah-table__head sherah-table__main d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <h4 className="sherah-order-title mb-2">
                    Sipariş No #{order.orderNumber}
                  </h4>
                  <p className="sherah-order-text mb-2">
                    {new Date(order.orderDate).toLocaleString()} /{" "}
                    {order.items.length} ürün / Toplam {order.totalAmount}{" "}
                    {order.currency}
                  </p>
                  <div className="sherah-table-status">
                    <div className={getStatusBadge(order.orderStatus)}>
                      {order.orderStatus}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleDownloadPdf}
                    title="PDF İndir"
                  >
                    <i className="fa-solid fa-file-pdf me-1"></i>
                    PDF İndir
                  </button>

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate("/orders-list")}
                  >
                    <i className="fa-solid fa-arrow-left me-1"></i>
                    Listeye Dön
                  </button>

                  {canShowActionButtons() && (
                    <>
                      {/* BEKLEMEDE → Onay/Reddet */}
                      {order.orderStatus === "BEKLEMEDE" && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={handleApprove}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <span className="spinner-border spinner-border-sm me-1" />
                            ) : (
                              <i className="fa-solid fa-check me-1"></i>
                            )}
                            Onayla
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={handleReject}
                            disabled={actionLoading}
                          >
                            <i className="fa-solid fa-times me-1"></i>
                            Reddet
                          </button>
                        </>
                      )}

                      {/* ONAYLANDI → Kargola */}
                      {order.orderStatus === "ONAYLANDI" && (
                        <button
                          className="btn btn-info btn-sm text-white"
                          onClick={handleShip}
                          disabled={actionLoading}
                        >
                          <i className="fa-solid fa-truck me-1"></i>
                          Kargola
                        </button>
                      )}

                      {/* Her durumda Düzenle butonu */}
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={handleEdit}
                        disabled={actionLoading}
                      >
                        <i className="fa-solid fa-edit me-1"></i>
                        Düzenle
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="row align-items-stretch mt-4">
                {/* Ürünler */}
                <h3 className="mb-3">Sipariş Detayları</h3>
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="sherah-table-order h-100">
                    <table className="sherah-table__main sherah-table__main--orderv1">
                      <thead className="sherah-table__head">
                        <tr>
                          <th>Ürün</th>
                          <th>Ürün Adı</th>
                          <th>Fiyat</th>
                          <th>Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="sherah-table__body">
                        {(order.items ?? []).map((it, idx) => (
                          <tr
                            key={it.productPriceId ?? `${it.productId}-${idx}`}
                          >
                            <td>
                              <div className="sherah-table__product--thumb">
                                <img
                              src={images[it.productId] ?? "/assets/img/resim-yok.jpg"}
                                  alt={it.productName}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "contain",
                                  }}
                                  className="border p-2 rounded-2"
                                />
                              </div>
                            </td>
                            <td>
                              <div className="sherah-table__product-name">
                                <h4 className="sherah-table__product-name--title">
                                  {it.productName}
                                </h4>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                {it.unitPrice}{" "}
                                <p className="d-block">{order.currency}</p>
                                <p className="sherah-table__product-name--text">
                                  x {it.quantity}
                                </p>
                              </div>
                            </td>
                            <td>
                              <p>
                                {it.totalPrice} {order.currency}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="order-totals mt-3">
                      <ul className="order-totals__list">
                        <li>
                          <span>Tutar</span>
                          <span className="order-totals__amount">
                            {order.subtotal} {order.currency}
                          </span>
                        </li>
                        {order.hasDiscount && (
                          <li>
                            <span>İndirim</span>
                            <span className="order-totals__amount text-success">
                              -{order.discountAmount} {order.currency}
                            </span>
                          </li>
                        )}
                        <li className="order-totals__bottom">
                          <span>Toplam</span>
                          <span className="order-totals__amount">
                            {order.totalAmount} {order.currency}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="col-lg-6 col-md-6 col-12">
                  <div className="sherah-contact-card sherah-default-bg sherah-border h-100">
                    <h4 className="sherah-contact-card__title">
                      Müşteri Bilgileri
                    </h4>
                    <div className="sherah-vcard__body">
                      <div className="sherah-vcard__img">
                        <img
                          src="/assets/img/user-default.png"
                          alt={order.createdBy.fullName}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div className="sherah-vcard__content">
                        <h4 className="sherah-vcard__title mb-2">
                          {order.createdBy.fullName}
                        </h4>
                        <p className="mb-2">
                          <strong>Bayi:</strong> {order.dealerName}
                        </p>
                        <ul className="sherah-vcard__contact gap-2">
                          <li>
                            <a href={`mailto:${order.createdBy.email}`}>
                              <img
                                src={emailIconUrl}
                                alt="Email"
                                width={14}
                                height={14}
                                style={{ marginRight: 6 }}
                              />
                              {order.createdBy.email}
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(order.notes || order.adminNotes) && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="sherah-contact-card sherah-default-bg sherah-border">
                      <h4 className="sherah-contact-card__title">Notlar</h4>
                      <div className="sherah-vcard__body d-block">
                        {order.notes && (
                          <div className="alert alert-warning mb-3">
                            <strong>Müşteri Notu:</strong>
                            <ul className="mt-2 list-unstyled">
                              {order.notes
                                .split("\n")
                                .filter((l) => l.trim() !== "")
                                .map((l, i) => (
                                  <li key={i}>• {l}</li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {order.adminNotes && (
                          <div className="alert alert-success mb-0">
                            <strong>Admin Notu:</strong>
                            <ul className="mt-2 list-unstyled">
                              {order.adminNotes
                                .split("\n")
                                .filter((l) => l.trim() !== "")
                                .map((l, i) => (
                                  <li key={i}>• {l}</li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Edit Modal - OrderManagementPanel ile aynı */}
      {selectedOrder && (
        <EditOrderModal
          open={editModalOpen}
          order={selectedOrder}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedOrder(null);
          }}
          onUpdated={(updated) => {
            setOrder(updated); // Mevcut order'ı güncelle
            setEditModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
