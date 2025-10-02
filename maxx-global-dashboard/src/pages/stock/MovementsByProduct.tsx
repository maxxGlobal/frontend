import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSimpleProducts } from "../../services/stock/simple";
import { getStockMovementsByProduct } from "../../services/stock/movements";
import type { StockMovementResponse } from "../../types/stock";
import type { PageResponse } from "../../types/paging";

export default function MovementsByProduct() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  // Ürün listesi
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", "simple"],
    queryFn: listSimpleProducts,
  });

  // Stok hareketleri
  const { data: movementsData, isLoading: movementsLoading } = useQuery<
    PageResponse<StockMovementResponse>
  >({
    queryKey: ["stock-movements", selectedProductId, page, size],
    queryFn: () => getStockMovementsByProduct(selectedProductId!, page, size),
    enabled: !!selectedProductId,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("tr-TR") +
      " " +
      date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <div className="sherah-dsinner">
      <div className="row mg-top-30">
        <div className="col-12 sherah-flex-between">
          <div className="sherah-breadcrumb">
            <h2 className="sherah-breadcrumb__title">
              Ürün Bazlı Stok Hareketleri
            </h2>
            <ul className="sherah-breadcrumb__list">
              <li>
                <a href="/dashboard">Ana Sayfa</a>
              </li>
              <li className="active">Stok İşlemleri</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ürün Seçimi */}
      <div className="sherah-page-inner sherah-default-bg sherah-border mg-top-30">
        <div className="row">
          <div className="col-lg-6 col-md-12 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Ürün Seçin</label>
              <select
                className="sherah-wc__form-input"
                value={selectedProductId || ""}
                onChange={(e) => {
                  setSelectedProductId(
                    e.target.value ? Number(e.target.value) : null
                  );
                  setPage(0);
                }}
                disabled={productsLoading}
              >
                <option value="">Ürün seçiniz...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stok Hareketleri Tablosu */}
      {selectedProductId && (
        <div className="sherah-table sherah-default-bg sherah-border mg-top-30">
          <div className="sherah-table__heading">
            <h3 className="sherah-heading__title mb-0">
              Stok Hareketleri
              {movementsData && ` (${movementsData.totalElements} kayıt)`}
            </h3>
          </div>

          {movementsLoading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Yükleniyor</span>
              </div>
            </div>
          ) : (
            <div className="sherah-table p-0">
              <table className="sherah-table__main sherah-table__main-v3">
                <thead className="sherah-table__head">
                  <tr>
                    <th>Tarih</th>
                    <th>Hareket Tipi</th>
                    <th>Miktar</th>
                    <th>Önceki Stok</th>
                    <th>Yeni Stok</th>
                    <th>Referans</th>
                    <th>Notlar</th>
                  </tr>
                </thead>
                <tbody className="sherah-table__body">
                  {movementsData?.content.map((movement) => (
                    <tr key={movement.id}>
                      <td>{formatDate(movement.movementDate)}</td>
                      <td>
                        <span className="badge bg-primary">
                          {movement.movementType}
                        </span>
                      </td>
                      <td className="fw-bold">{movement.quantity}</td>
                      <td>{movement.previousStock}</td>
                      <td>{movement.newStock}</td>
                      <td>
                        {movement.referenceType && (
                          <span className="text-muted">
                            {movement.referenceType}
                            {movement.referenceId &&
                              ` #${movement.referenceId}`}
                          </span>
                        )}
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 200 }}>
                        {movement.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sayfalama */}
          {movementsData && movementsData.totalPages > 1 && (
            <div className="row align-items-center mt-3">
              <div className="col-sm-12 col-md-12">
                <div className="dataTables_paginate paging_simple_numbers justify-content-end">
                  <ul className="pagination">
                    <li
                      className={`paginate_button page-item previous ${
                        movementsData.first ? "disabled" : ""
                      }`}
                    >
                      <a
                        href="#"
                        className="page-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!movementsData.first)
                            setPage((p) => Math.max(0, p - 1));
                        }}
                      >
                        <i className="fas fa-angle-left" />
                      </a>
                    </li>
                    {Array.from(
                      { length: movementsData.totalPages },
                      (_, i) => (
                        <li
                          key={i}
                          className={`paginate_button page-item ${
                            i === movementsData.number ? "active" : ""
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
                      )
                    )}
                    <li
                      className={`paginate_button page-item next ${
                        movementsData.last ? "disabled" : ""
                      }`}
                    >
                      <a
                        href="#"
                        className="page-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!movementsData.last)
                            setPage((p) =>
                              Math.min(movementsData.totalPages - 1, p + 1)
                            );
                        }}
                      >
                        <i className="fas fa-angle-right" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
