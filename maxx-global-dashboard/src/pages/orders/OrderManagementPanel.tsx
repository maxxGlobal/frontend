/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate ,useSearchParams } from "react-router-dom";
import { listAdminOrders } from "../../services/orders/listAdminOrders";
import { approveOrder } from "../../services/orders/approve";
import { rejectOrder } from "../../services/orders/reject";
import { shipOrder } from "../../services/orders/ship";
import { listSimpleDealers } from "../../services/dealers/listSimple";
import type { PageResponse, OrderResponse } from "../../types/order";
import type { SimpleDealer } from "../../services/dealers/listSimple";
import OrderDetailModal from "./components/OrderDetailModal";
import EditOrderModal from "./components/EditOrderModal";
import { downloadOrderPdf } from "../../services/orders/downloadPdf";
import Swal from "sweetalert2";
import PopoverBadgeOrderItem from "../../components/popover/PopoverBadgeOrderItem";

// Sipariş durumları sabitleri
const ORDER_STATUSES = [
  { value: "", label: "Tüm Durumlar" },
  { value: "PENDING", label: "Beklemede" },
  { value: "APPROVED", label: "Onaylandı" },
  { value: "REJECTED", label: "Reddedildi" },
  { value: "EDITED_PENDING_APPROVAL", label: "Düzenleme Onay Bekliyor" },
  { value: "SHIPPED", label: "Kargolandı" },
  { value: "CANCELLED", label: "İptal Edildi" },
];

export default function OrderManagementPanel() {
  const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams(); // YENİ

  const [orders, setOrders] = useState<PageResponse<OrderResponse> | null>(
    null
  );
  const [dealers, setDealers] = useState<SimpleDealer[]>([]);
  const [loading, setLoading] = useState(false);
 const [page, setPage] = useState(() => 
    Math.max(0, parseInt(searchParams.get('page') || '1', 10) - 1)
  );
  const [size] = useState(10);

  // Filtre state'leri
 const [selectedStatus, setSelectedStatus] = useState(() => 
    searchParams.get('status') || ''
  );
 const [selectedDealerId, setSelectedDealerId] = useState<number | null>(() => {
    const dealerId = searchParams.get('dealerId');
    return dealerId ? parseInt(dealerId, 10) : null;
  });
  const [searchTerm, setSearchTerm] = useState(() => 
    searchParams.get('search') || ''
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );

  // Dealers'ı yükle
  useEffect(() => {
    async function loadDealers() {
      try {
        const dealerList = await listSimpleDealers();
        setDealers(dealerList);
      } catch (error) {}
    }
    loadDealers();
  }, []);

const updateUrlParams = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        newParams.delete(key);
      } else if (key === 'page') {
        // Sayfa numarasını 1-based yap (0 -> 1, 1 -> 2, vs.)
        const pageValue = typeof value === 'number' ? value + 1 : parseInt(value.toString()) + 1;
        if (pageValue <= 1) {
          newParams.delete(key); // İlk sayfa için parametreyi silme
        } else {
          newParams.set(key, pageValue.toString());
        }
      } else {
        newParams.set(key, value.toString());
      }
    });
    
    setSearchParams(newParams);
  }; 

 const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
  };

  // Filtre değiştirme fonksiyonları - YENİ
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(0);
    updateUrlParams({ status, page: 0 });
  };

  const handleDealerChange = (dealerId: number | null) => {
    setSelectedDealerId(dealerId);
    setPage(0);
    updateUrlParams({ dealerId, page: 0 });
  };

  // Siparişleri yükle
  async function loadData() {
    try {
      setLoading(true);
      const data = await listAdminOrders({
        page,
        size,
        sortBy: "orderDate",
        sortDirection: "desc",
        status: selectedStatus || undefined,
        dealerId: selectedDealerId || undefined,
      });
      setOrders(data);
    } catch (e) {
      Swal.fire("Hata", "Siparişler yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page, selectedStatus, selectedDealerId]);

  // Filtreleri temizle
  function clearFilters() {
    setSelectedStatus("");
    setSelectedDealerId(null);
    setSearchTerm("");
    setPage(0);
    setSearchParams(new URLSearchParams()); // URL'yi de temizle
  }

  // Arama fonksiyonu
   function handleSearch() {
    setPage(0);
    updateUrlParams({ search: searchTerm, page: 0 });
  }

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

  // Modal helpers
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

  // ✅ Detay sayfasına yönlendir
  function goToDetailPage(order: OrderResponse) {
    navigate(`/admin/orders/${order.id}`);
  }

  // Actions
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

  // İndirim kolonu için yardımcı render
  function renderDiscountCol(o: OrderResponse) {
    const hasDiscount = (o as any)?.hasDiscount as boolean | undefined;
    const discountAmount = (o as any)?.discountAmount as number | undefined;
    const applied = (o as any)?.appliedDiscount as
      | {
          discountId: number;
          discountName: string;
          discountType: string;
          discountValue: number;
          calculatedAmount: number | null;
        }
      | null
      | undefined;

    if (hasDiscount) {
      return (
        <div>
          <span className="badge bg-success me-2">İndirim</span>
          <div className="small text-muted">
            −{discountAmount} {o.currency}
            {applied?.discountName ? ` • ${applied.discountName}` : ""}
          </div>
        </div>
      );
    }
    return <span className="badge bg-secondary">İndirim Yok</span>;
  }

  return (
    <div className="sherah-table sherah-default-bg sherah-border mg-top-30 order-list">
      <div className="sherah-table__heading">
        <h3 className="sherah-heading__title mb-0">Sipariş Yönetimi</h3>
      </div>

      {/* Filtre Bölümü */}
      <div className="sherah-table__filter p-3 border-bottom">
        <div className="row g-3 align-items-end">
          {/* Sipariş Durumu Filtresi */}
          <div className="col-md-3">
            <label className="form-label small fw-medium">Sipariş Durumu</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bayi Filtresi */}
          <div className="col-md-3">
            <label className="form-label small fw-medium">Bayi</label>
            <select
              className="form-select"
              value={selectedDealerId || ""}
              onChange={(e) => handleDealerChange(e.target.value ? Number(e.target.value) : null)}

            >
              <option value="">Tüm Bayiler</option>
              {dealers.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Arama Kutusu */}
          <div className="col-md-4">
            <label className="form-label small fw-medium">Arama</label>
            <div className="input-group flex-nowrap">
              <input
                type="text"
                className="form-control"
                placeholder="Sipariş no, müşteri adı..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleSearch}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          {/* Filtre Butonları */}
          <div className="col-md-2">
            <div className="d-flex gap-2">
              <button
                className="sherah-btn sherah-btn__primary"
                style={{ height: 50 }}
                onClick={clearFilters}
                title="Filtreleri Temizle"
              >
                <i className="fa-solid fa-eraser me-1"></i>
                Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Aktif Filtreler Göstergesi */}
        {(selectedStatus || selectedDealerId || searchTerm) && (
          <div className="mt-2">
            <small className="text-muted">Aktif filtreler: </small>
            {selectedStatus && (
              <span className="badge bg-primary me-1">
                Durum:{" "}
                {ORDER_STATUSES.find((s) => s.value === selectedStatus)?.label}
              </span>
            )}
            {selectedDealerId && (
              <span className="badge bg-primary me-1">
                Bayi: {dealers.find((d) => d.id === selectedDealerId)?.name}
              </span>
            )}
            {searchTerm && (
              <span className="badge bg-primary me-1">Arama: {searchTerm}</span>
            )}
          </div>
        )}
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
                <th>İndirim</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody className="sherah-table__body h-auto overflow-hidden">
              {orders?.content.map((o) => (
                <tr key={o.id}>
                  <td>
                    <button
                      className="btn btn-link p-0 text-primary fw-semibold text-decoration-none"
                      onClick={() => goToDetailPage(o)}
                      title="Detay sayfasına git"
                    >
                      #{o.orderNumber}
                    </button>
                  </td>
                  <td>{o.dealerName}</td>
                  <td>{o.createdBy?.fullName}</td>
                  <td>
                    <PopoverBadgeOrderItem items={o.items} />
                  </td>
                  <td>
                    <strong>
                      {o.totalAmount} {o.currency}
                    </strong>
                  </td>
                  <td>{renderDiscountCol(o)}</td>
                  <td>
                    <div className={statusClass(o.orderStatus)}>
                      {o.orderStatus}
                    </div>
                  </td>
                  <td className="text-end">
                    <div className="d-flex gap-2 align-items-center">
                      <button
                        className="sherah-table__action sherah-color2 sherah-color3__bg--opactity border-0"
                        onClick={() => goToDetailPage(o)}
                        title="Detay Sayfası"
                      >
                        <i className="fa-solid fa-eye" />
                      </button>
                      <button
                        className="sherah-table__action sherah-color2 sherah-color3__bg--opactity border-0"
                        onClick={() => openDetail(o)}
                        title="Hızlı İşlem"
                      >
                        <i className="fa-solid fa-bolt" />
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
              {orders?.content.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    <div className="text-muted">
                      <i className="fa-solid fa-box-open fa-2x mb-2"></i>
                      <p>Filtrelere uygun sipariş bulunamadı</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

         {orders && orders.totalElements > 0 && (
  <div className="dataTables_paginate paging_simple_numbers justify-content-end mt-3 px-3 pb-3">
    <div className="d-flex justify-content-between align-items-center">
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
              if (!orders?.first) handlePageChange(Math.max(0, page - 1));
            }}
          >
            <i className="fas fa-angle-left" />
          </a>
        </li>

        {orders &&
          Array.from(
            { length: Math.min(orders.totalPages, 5) },
            (_, i) => {
              const pageNum = Math.max(0, page - 2) + i;
              if (pageNum >= orders.totalPages) return null;
              return (
                <li
                  key={pageNum}
                  className={`paginate_button page-item ${
                    pageNum === orders.number ? "active" : ""
                  }`}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                  >
                    {pageNum + 1}
                  </a>
                </li>
              );
            }
          )}

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
                handlePageChange(Math.min((orders?.totalPages ?? 1) - 1, page + 1));
            }}
          >
            <i className="fas fa-angle-right" />
          </a>
        </li>
      </ul>
    </div>
  </div>
)}
        </>
      )}

      {/* Modals */}
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
          order={selectedOrder}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedOrder(null);
          }}
          onUpdated={(updated) => {
            setOrders((prev) =>
              prev
                ? {
                    ...prev,
                    content: prev.content.map((oo) =>
                      oo.id === updated.id ? updated : oo
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
