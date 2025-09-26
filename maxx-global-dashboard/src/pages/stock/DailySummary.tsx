import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDailySummary } from "../../services/stock/analytics";
import type { DailySummaryResponse } from "../../types/stock";

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0] // Bugünün tarihi YYYY-MM-DD formatında
  );

  const {
    data: summary,
    isLoading,
    error,
  } = useQuery<DailySummaryResponse>({
    queryKey: ["stock-daily-summary", selectedDate],
    queryFn: () => getDailySummary(selectedDate),
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="sherah-dsinner">
      <div className="row mg-top-30">
        <div className="col-12 sherah-flex-between">
          <div className="sherah-breadcrumb">
            <h2 className="sherah-breadcrumb__title">Günlük Stok Özeti</h2>
            <ul className="sherah-breadcrumb__list">
              <li>
                <a href="/dashboard">Ana Sayfa</a>
              </li>
              <li className="active">Günlük Özet</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="sherah-page-inner sherah-default-bg sherah-border mg-top-30">
        <div className="row">
          <div className="col-lg-4 col-md-6 col-12">
            <div className="form-group">
              <label className="sherah-wc__form-label">Rapor Tarihi</label>
              <input
                type="date"
                className="sherah-wc__form-input px-3"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger mg-top-30">
          Veri yüklenirken bir hata oluştu.
        </div>
      ) : summary ? (
        <>
          <div className="row mg-top-30">
            <div className="col-12">
              <h4>{formatDate(summary.date)} Tarihli Özet</h4>
            </div>
          </div>

          <div className="row mg-top-20">
            <div className="col-xxl-3 col-lg-6 col-md-6 col-12">
              <div className="sherah-overview__single sherah-default-bg sherah-border sherah-page-inner">
                <div className="sherah-overview__single--inner">
                  <div className="sherah-overview__single--count">
                    <h3 className="sherah-overview__single--title text-primary">
                      {summary.totalMovements}
                    </h3>
                    <p className="sherah-overview__single--text mb-2">
                      Toplam Hareket
                    </p>
                  </div>
                  <div className="sherah-overview__single--icon sherah-color1__bg p-2 rounded-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Stok Girişi */}
            <div className="col-xxl-3 col-lg-6 col-md-6 col-12">
              <div className="sherah-overview__single sherah-default-bg sherah-border sherah-page-inner">
                <div className="sherah-overview__single--inner">
                  <div className="sherah-overview__single--count">
                    <h3 className="sherah-overview__single--title text-success">
                      +{summary.totalStockIn}
                    </h3>
                    <p className="sherah-overview__single--text mb-2">
                      Toplam Giriş
                    </p>
                  </div>
                  <div className="sherah-overview__single--icon sherah-color3__bg p-2 rounded-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5V19M5 12L12 5L19 12"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Stok Çıkışı */}
            <div className="col-xxl-3 col-lg-6 col-md-6 col-12">
              <div className="sherah-overview__single sherah-default-bg sherah-border sherah-page-inner">
                <div className="sherah-overview__single--inner">
                  <div className="sherah-overview__single--count">
                    <h3 className="sherah-overview__single--title text-danger">
                      -{summary.totalStockOut}
                    </h3>
                    <p className="sherah-overview__single--text mb-2">
                      Toplam Çıkış
                    </p>
                  </div>
                  <div className="sherah-overview__single--icon sherah-color2__bg p-2 rounded-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 19V5M5 12L12 19L19 12"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Değişim */}
            <div className="col-xxl-3 col-lg-6 col-md-6 col-12">
              <div className="sherah-overview__single sherah-default-bg sherah-border sherah-page-inner">
                <div className="sherah-overview__single--inner">
                  <div className="sherah-overview__single--count">
                    <h3
                      className={`sherah-overview__single--title mb-2 ${
                        summary.netChange >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {summary.netChange >= 0 ? "+" : ""}
                      {summary.netChange}
                    </h3>
                    <p className="sherah-overview__single--text">Net Değişim</p>
                  </div>
                  <div
                    className={`sherah-overview__single--icon p-2 rounded-3 ${
                      summary.netChange >= 0
                        ? "sherah-color3__bg"
                        : "sherah-color2__bg"
                    }`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 12H2M15 5L22 12L15 19"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Özet Bilgiler */}
          <div className="sherah-table sherah-default-bg sherah-border mg-top-30 rounded-3">
            <div className="sherah-table__heading">
              <h3 className="sherah-heading__title mb-0">Detay Bilgiler</h3>
            </div>
            <div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Rapor Tarihi:</strong> {formatDate(summary.date)}
                  </div>
                  <div className="mb-3">
                    <strong>Toplam Hareket Sayısı:</strong>{" "}
                    {summary.totalMovements}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Giriş/Çıkış Oranı:</strong>{" "}
                    {summary.totalStockOut > 0
                      ? (summary.totalStockIn / summary.totalStockOut).toFixed(
                          2
                        )
                      : "N/A"}
                  </div>
                  <div className="mb-3">
                    <strong>Hareket Durumu:</strong>
                    <span
                      className={`ms-2 badge ${
                        summary.netChange > 0
                          ? "bg-success"
                          : summary.netChange < 0
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {summary.netChange > 0
                        ? "Artış"
                        : summary.netChange < 0
                        ? "Azalış"
                        : "Değişim Yok"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info mg-top-30">
          Seçilen tarih için veri bulunamadı.
        </div>
      )}
    </div>
  );
}
