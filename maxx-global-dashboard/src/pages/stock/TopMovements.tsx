import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopMovements } from "../../services/stock/analytics";
import type { TopMovementProduct } from "../../types/stock";

export default function TopMovements() {
    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [limit, setLimit] = useState(10);

    const { data: topProducts = [], isLoading, error } = useQuery<TopMovementProduct[]>({
        queryKey: ["stock-top-movements", startDate, endDate, limit],
        queryFn: () => getTopMovements(startDate, endDate, limit),
    });

    console.log("seee",topProducts)

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("tr-TR");
    };

    return (
        <div className="sherah-dsinner">
            <div className="row mg-top-30">
                <div className="col-12 sherah-flex-between">
                    <div className="sherah-breadcrumb">
                        <h2 className="sherah-breadcrumb__title">En Çok Hareket Eden Ürünler</h2>
                        <ul className="sherah-breadcrumb__list">
                            <li>
                                <a href="/dashboard">Ana Sayfa</a>
                            </li>
                            <li className="active">En Çok Hareket Eden</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Filtreler */}
            <div className="sherah-page-inner sherah-default-bg sherah-border mg-top-30">
                <div className="row g-3">
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className="form-group">
                            <label className="sherah-wc__form-label">Başlangıç Tarihi</label>
                            <input
                                type="date"
                                className="sherah-wc__form-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate}
                            />
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className="form-group">
                            <label className="sherah-wc__form-label">Bitiş Tarihi</label>
                            <input
                                type="date"
                                className="sherah-wc__form-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className="form-group">
                            <label className="sherah-wc__form-label">Gösterilecek Sayı</label>
                            <select
                                className="sherah-wc__form-input"
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
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className="form-group">
                            <label className="sherah-wc__form-label">&nbsp;</label>
                            <div className="text-muted small mt-2">
                                {formatDate(startDate)} - {formatDate(endDate)} arası
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tablo */}
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
            ) : topProducts.length > 0 ? (
                <div className="sherah-table sherah-default-bg sherah-border mg-top-30">
                    <div className="sherah-table__heading">
                        <h3 className="sherah-heading__title mb-0">En Çok Hareket Eden Ürünler</h3>
                    </div>
                    <div className="sherah-table p-0">
                        <table className="sherah-table__main sherah-table__main-v3">
                            <thead className="sherah-table__head">
                                <tr>
                                    <th className="text-center">#</th>
                                    <th>Ürün Kodu</th>
                                    <th>Ürün Adı</th>
                                    <th className="text-center">Hareket Sayısı</th>
                                            <th className="text-center">Toplam Miktar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="sherah-table__body">
                                        {topProducts.map((products) => (
                                            products.map((product:TopMovementProduct, index:number) => (
                                                <tr key={product.productId}>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td>{product.productCode}</td>
                                                    <td>{product.productName}</td>
                                                    <td className="text-center">{product.totalMovements}</td>
                                                    <td className="text-center">{product.totalQuantity.toLocaleString("tr-TR")}</td>
                                                </tr>
                                            ))

                                        ))}
                                    </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="alert alert-info mg-top-30">
                    Seçilen tarih aralığında hareket eden ürün bulunamadı.
                </div>
            )}
        </div>
    );
}