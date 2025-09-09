import { useQuery } from "@tanstack/react-query";
import { listLowStockProducts } from "../../services/products/lowStock";
import type { LowStockProduct } from "../../types/product";

export default function LowStockProductsPage() {
  const {
    data: rows = [],
    isLoading,
    isError,
  } = useQuery<LowStockProduct[]>({
    queryKey: ["products", "low-stock"],
    queryFn: () => listLowStockProducts(5000),
  });

  if (isLoading) {
    return <p>Yükleniyor...</p>;
  }
  if (isError) {
    return <p>Bir hata oluştu.</p>;
  }

  return (
    <div className="col-lg-12 col-12">
      <div className="sherah-table sherah-default-bg sherah-border mg-top-30">
        <div className="sherah-table__heading">
          <h3 className="sherah-heading__title mb-0">Düşük Stok Ürünleri</h3>
        </div>
        <div className="sherah-table p-0">
          <table className="sherah-table__main sherah-table__main-v3">
            <thead className="sherah-table__head">
              <tr>
                <th className="sherah-table__h1">Resim</th>
                <th className="sherah-table__h2">Kod</th>
                <th className="sherah-table__h3">Ad</th>
                <th className="sherah-table__h4">Kategori</th>
                <th className="sherah-table__h5">Stok</th>
                <th className="sherah-table__h6">Durum</th>
              </tr>
            </thead>

            <tbody className="sherah-table__body">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.primaryImageUrl ? (
                      <img
                        src={p.primaryImageUrl}
                        alt={p.name}
                        width={50}
                        className="rounded"
                      />
                    ) : (
                      <span className="text-muted">
                        <img
                          src="/src/assets/img/resim-yok.jpg"
                          alt={p.name}
                          width={50}
                          className="border rounded-2"
                        />
                      </span>
                    )}
                  </td>

                  <td>
                    <p className="sherah-table__product-desc mb-0">{p.code}</p>
                  </td>

                  <td>
                    <p className="sherah-table__product-desc mb-0">{p.name}</p>
                  </td>

                  <td>
                    <p className="sherah-table__product-desc mb-0">
                      {p.categoryName}
                    </p>
                  </td>

                  <td>
                    <h5 className="sherah-table__inner--title mb-0">
                      {p.stockQuantity} {p.unit}
                    </h5>
                  </td>

                  <td>
                    <div
                      className={`badge text-uppercase bg-${
                        p.isInStock ? "success" : "danger"
                      }`}
                      style={{ padding: "6px 10px" }}
                    >
                      {p.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
