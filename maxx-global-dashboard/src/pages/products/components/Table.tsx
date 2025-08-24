import type { PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";
import type { JSX } from "react";

type Props = {
  data: PageResponse<ProductRow>;
  canManage: boolean;
  toggleSort: (k: keyof ProductRow) => void;
  sortIcon: (k: keyof ProductRow) => JSX.Element;
  onEdit: (p: ProductRow) => void;
  onAskDelete: (p: ProductRow) => void;
  onImages: (p: ProductRow) => void;
};

export default function ProductsTable({
  data,
  canManage,
  toggleSort,
  sortIcon,
  onEdit,
  onAskDelete,
  onImages,
}: Props) {
  const statusBadge = (b?: boolean | null) =>
    b ? (
      <div className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
        AKTİF
      </div>
    ) : (
      <div className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
        PASİF
      </div>
    );

  const stockBadge = (b?: boolean | null) =>
    b ? (
      <span className="badge bg-success-subtle text-success">Stokta</span>
    ) : (
      <span className="badge bg-secondary-subtle text-secondary">Stok Yok</span>
    );

  return (
    <div className="sherah-table p-0">
      <table className="sherah-table__main sherah-table__main-v3">
        <thead className="sherah-table__head">
          <tr>
            <th>Resim</th>
            <th
              onClick={() => toggleSort("name")}
              style={{ cursor: "pointer" }}
            >
              <span className="me-2">Ad</span>
              {sortIcon("name")}
            </th>
            <th
              onClick={() => toggleSort("code")}
              style={{ cursor: "pointer" }}
            >
              <span className="me-2">Kod</span>
              {sortIcon("code")}
            </th>
            <th
              onClick={() => toggleSort("categoryName")}
              style={{ cursor: "pointer" }}
            >
              <span className="me-2">Kategori</span>
              {sortIcon("categoryName")}
            </th>
            <th
              onClick={() => toggleSort("stockQuantity")}
              style={{ cursor: "pointer" }}
            >
              <span className="me-2">Stok</span>
              {sortIcon("stockQuantity")}
            </th>
            <th>Birim</th>
            <th>Durum</th>
            <th>Stok</th>
            {canManage && <th>Aksiyon</th>}
          </tr>
        </thead>

        <tbody className="sherah-table__body">
          {data.content.length ? (
            data.content.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.primaryImageUrl ? (
                    <img
                      src={p.primaryImageUrl}
                      alt={p.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <div className="text-muted">—</div>
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.code}</td>
                <td>{p.categoryName ?? "—"}</td>
                <td>{p.stockQuantity ?? "—"}</td>
                <td>{p.unit ?? "—"}</td>
                <td>{statusBadge(p.isActive)}</td>
                <td>{stockBadge(p.isInStock)}</td>
                {canManage && (
                  <td>
                    <div className="d-flex gap-2">
                      <a
                        href="#"
                        className="btn btn-sm btn-light"
                        onClick={(e) => {
                          e.preventDefault();
                          onImages(p);
                        }}
                      >
                        Resimler
                      </a>
                      <a
                        href="#"
                        className="btn btn-sm btn-success"
                        onClick={(e) => {
                          e.preventDefault();
                          onEdit(p);
                        }}
                      >
                        Düzenle
                      </a>
                      <a
                        href="#"
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          onAskDelete(p);
                        }}
                      >
                        Sil
                      </a>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={canManage ? 9 : 8} style={{ textAlign: "center" }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
