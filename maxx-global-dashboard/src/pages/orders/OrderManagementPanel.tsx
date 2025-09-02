import React, { useEffect, useState } from "react";
import { listAdminOrders } from "../../services/orders/listAdminOrders";
import { approveOrder } from "../../services/orders/approve";
import { rejectOrder } from "../../services/orders/reject";
import { shipOrder } from "../../services/orders/ship";
import type { PageResponse, OrderResponse } from "../../types/order";
import OrderDetailModal from "./components/OrderDetailModal";
import EditOrderModal from "./components/EditOrderModal";
import { downloadOrderPdf } from "../../services/orders/downloadPdf";

import Swal from "sweetalert2";

export default function OrderManagementPanel() {
  const [orders, setOrders] = useState<PageResponse<OrderResponse> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );

  async function loadData() {
    try {
      setLoading(true);
      const data = await listAdminOrders({
        page,
        size,
        sortBy: "orderDate",
        sortDirection: "desc",
      });
      setOrders(data);
    } catch (e) {
      console.error("Siparişler yüklenemedi", e);
      Swal.fire("Hata", "Siparişler yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page]);

  function statusClass(s?: string | null) {
    switch (s) {
      case "BEKLEMEDE":
        return "sherah-table__status sherah-color4 sherah-color4__bg--opactity lh-sm";
      case "ONAYLANDI":
        return "sherah-table__status sherah-color3 sherah-color3__bg--opactity lh-sm";
      case "REDDEDİLDİ":
        return "sherah-table__status sherah-color2 sherah-color2__bg--opactity lh-sm";
      case "DÜZENLEME ONAY BEKLIYOR":
        return "sherah-table__status sherah-color1 sherah-color1__bg--opactity lh-sm";
      case "KARGOLANDI":
        return "sherah-table__status  sherah-color5__bg--opactity bg-info text-white lh-sm";
      case "İPTAL EDİLDİ":
        return "sherah-table__status sherah-color2 sherah-color2__bg--opactity lh-sm";
      default:
        return "sherah-table__status sherah-color3 sherah-color3__bg--opactity lh-sm";
    }
  }

  // ✅ Modal açma
  function openDetail(order: OrderResponse) {
    setSelectedOrder(order);
    setModalOpen(true);
  }

  function openEdit(order: OrderResponse) {
    setSelectedOrder(order);
    setEditModalOpen(true);
  }

  function closeModals() {
    setModalOpen(false);
    setEditModalOpen(false);
    setSelectedOrder(null);
  }

  // ✅ Aksiyonlar
  async function handleApprove(orderId: number, note: string) {
    const updated = await approveOrder(orderId, note);
    updateOrderInList(updated);
  }

  async function handleReject(orderId: number, reason: string) {
    const updated = await rejectOrder(orderId, reason);
    updateOrderInList(updated);
  }

  async function handleShip(orderId: number, note: string) {
    const updated = await shipOrder(orderId, note);
    updateOrderInList(updated);
  }

  function updateOrderInList(updated: OrderResponse) {
    setOrders((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((o) =>
              o.id === updated.id ? updated : o
            ),
          }
        : prev
    );
    setSelectedOrder(updated);
  }
  function canShowDetail(status: string) {
    return status === "BEKLEMEDE" || status === "ONAYLANDI";
  }

  return (
    <div className="sherah-table sherah-default-bg sherah-border mg-top-30 order-list">
      <div className="sherah-table__heading">
        <h3 className="sherah-heading__title mb-0">Sipariş Yönetimi</h3>
      </div>

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor</span>
          </div>
        </div>
      ) : (
        <>
          <table className="sherah-table__main sherah-table__main--front sherah-table__main-v1">
            <thead className="sherah-table__head">
              <tr>
                <th>Sipariş No</th>
                <th>Bayi</th>
                <th>Oluşturan</th>
                <th>Ürünler</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody className="sherah-table__body h-auto overflow-hidden">
              {orders?.content.map((o) => (
                <tr key={o.id}>
                  <td>#{o.orderNumber}</td>
                  <td>{o.dealerName}</td>
                  <td>{o.createdBy?.fullName}</td>
                  <td>
                    {o.items.map((it) => (
                      <div key={it.productPriceId}>
                        {it.productName} x{it.quantity}
                      </div>
                    ))}
                  </td>
                  <td>
                    {o.totalAmount} {o.currency}
                  </td>
                  <td>
                    <div className={statusClass(o.orderStatus)}>
                      {o.orderStatus}
                    </div>
                  </td>
                  <td className="text-end ">
                    <div className="d-flex gap-2 aligin-items-center">
                      <button
                        className="sherah-table__action sherah-color2 sherah-color3__bg--opactity border-0"
                        onClick={() => openDetail(o)}
                        title="Detay"
                      >
                        <i className="fa-solid fa-magnifying-glass" />
                      </button>
                      {canShowDetail(o.orderStatus) && (
                        <button
                          className="sherah-table__action sherah-color2 sherah-color3__bg--opactity border-0"
                          onClick={() => openEdit(o)}
                          title="Güncelle"
                        >
                          <i className="fa-regular fa-pen-to-square" />
                        </button>
                      )}
                      <button
                        className="sherah-table__action sherah-color2 sherah-color3__bg--opactity border-0"
                        onClick={() => downloadOrderPdf(o.id)}
                        title="PDF İndir"
                      >
                        <i className="fa-solid fa-file-pdf" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders && (
            <div className="dataTables_paginate paging_simple_numbers justify-content-end mt-3 px-3 pb-3">
              <ul className="pagination">
                <li
                  className={`paginate_button page-item previous ${
                    orders?.first ? "disabled" : ""
                  }`}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!orders?.first) setPage((p) => Math.max(0, p - 1));
                    }}
                  >
                    <i className="fas fa-angle-left" />
                  </a>
                </li>

                {/* Sayfa numaraları */}
                {orders &&
                  Array.from({ length: orders.totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`paginate_button page-item ${
                        i === orders.number ? "active" : ""
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

                {/* Sonraki */}
                <li
                  className={`paginate_button page-item next ${
                    orders?.last ? "disabled" : ""
                  }`}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!orders?.last)
                        setPage((p) =>
                          Math.min((orders?.totalPages ?? 1) - 1, p + 1)
                        );
                    }}
                  >
                    <i className="fas fa-angle-right" />
                  </a>
                </li>
              </ul>
            </div>
          )}
        </>
      )}

      {/* Modallar */}
      <OrderDetailModal
        open={modalOpen}
        onClose={closeModals}
        order={selectedOrder}
        onApprove={handleApprove}
        onReject={handleReject}
        onShip={handleShip}
      />
      {selectedOrder && (
        <EditOrderModal
          open={editModalOpen}
          order={selectedOrder} // ✅ burada null olmayacak
          onClose={() => {
            setEditModalOpen(false);
            setSelectedOrder(null);
          }}
          onUpdated={(updated) => {
            setOrders((prev) =>
              prev
                ? {
                    ...prev,
                    content: prev.content.map((o) =>
                      o.id === updated.id ? updated : o
                    ),
                  }
                : prev
            );
            setSelectedOrder(updated);
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
