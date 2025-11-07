import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopMovements } from "../../services/stock/analytics";
import type { TopMovementProduct } from "../../types/stock"
export default function TopMovements() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [limit, setLimit] = useState(10);

  const {
    data: topProducts = [],
    isLoading,
    error,
  } = useQuery<TopMovementProduct[]>({
    queryKey: ["stock-top-movements", startDate, endDate, limit],
    queryFn: () => getTopMovements(startDate, endDate, limit),
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR");
  };

  return (
    <div className="sherah-dsinner">
      {/* Header / Breadcrumb */}
      <div className="row mg-top-20">
        <div className="col-12">
          <div className="sherah-breadcrumb sherah-flex-between align-items-center">
            <div>
              <h2 className="sherah-breadcrumb__title mb-1">En Çok Hareket Eden Ürünler</h2>
              <ul className="sherah-breadcrumb__list mb-0">
                <li><a href="/dashboard">Ana Sayfa</a></li>
                <li className="active">En Çok Hareket Eden</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="sherah-page-inner sherah-default-bg sherah-border mg-top-20">
        <div className="row g-3 align-items-end">
          <div className="col-xl-3 col-lg-4 col-md-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Başlangıç Tarihi</label>
              <input
                type="date"
                className="sherah-wc__form-input w-100"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Bitiş Tarihi</label>
              <input
                type="date"
                className="sherah-wc__form-input w-100"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Gösterilecek Sayı</label>
              <select
                className="sherah-wc__form-input w-100"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={5}>İlk 5</option>
                <option value={10}>İlk 10</option>
                <option value={20}>İlk 20</option>
                <option value={50}>İlk 50</option>
              </select>
            </div>
          </div>
          <div className="col-xl-3 col-lg-12 col-md-6 col-12">
            <div className="form-group mb-0">
              <label className="sherah-wc__form-label d-block">&nbsp;</label>
              <div className="text-muted small mt-1">
                {formatDate(startDate)} — {formatDate(endDate)} arası
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablo / Durumlar */}
      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger mg-top-20">
          Veri yüklenirken bir hata oluştu.
        </div>
      ) : topProducts.length > 0 ? (
        <div className="sherah-table sherah-default-bg sherah-border mg-top-20">
          <div className="sherah-table__heading sherah-flex-between align-items-center">
            <h3 className="sherah-heading__title mb-0">En Çok Hareket Eden Ürünler</h3>
            <span className="text-muted small">Toplam: {topProducts.length}</span>
          </div>

          <div className="sherah-table p-0">
            <div className="table-responsive">
              <table className="sherah-table__main sherah-table__main-v3 table mb-0">
                <thead className="sherah-table__head">
                  <tr>
                    <th className="text-center text-nowrap">#</th>
                    <th className="text-nowrap">Ürün Kodu</th>
                    <th>Ürün Adı</th>
                    <th className="text-center text-nowrap">Hareket Sayısı</th>
                    <th className="text-center text-nowrap">Toplam Miktar</th>
                  </tr>
                </thead>
                <tbody className="sherah-table__body">
                  {topProducts.map((product, index) => (
                    <tr key={product.productId} className="align-middle">
                      <td className="text-center">{index + 1}</td>
                      <td className="text-nowrap">{product.variantSku} <h6>/</h6> {product.variantSize}</td>
                      <td className="fw-medium">{product.productName}</td>
                      <td className="text-center">{product.totalMovements}</td>
                      <td className="text-center">
                        {Number(product.totalQuantity).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info mg-top-20 mb-0">
          Seçilen tarih aralığında hareket eden ürün bulunamadı.
        </div>
      )}
    </div>
  );
}
