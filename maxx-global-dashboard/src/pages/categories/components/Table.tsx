// src/pages/categories/components/Table.tsx
import type { PageResponse } from "../../../types/paging";
import type { CategoryRow } from "../../../types/category";
import type { JSX } from "react";

type Props = {
  data: PageResponse<CategoryRow>;
  canManage: boolean;
  toggleSort: (k: keyof CategoryRow) => void;
  sortIcon: (k: keyof CategoryRow) => JSX.Element;
  onEdit: (c: CategoryRow) => void;
  onAskDelete: (c: CategoryRow) => void;
  onRestore: (c: CategoryRow) => void;
};

export default function CategoriesTable({
  data,
  canManage,
  toggleSort,
  sortIcon,
  onEdit,
  onAskDelete,
  onRestore,
}: Props) {
  const statusBadge = (s?: string | null) =>
    (s ?? "").toUpperCase() === "ACTIVE" ? (
      <div className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
        AKTİF
      </div>
    ) : (
      <div className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
        PASİF
      </div>
    );

  return (
    <div className="sherah-table p-0">
      <table className="sherah-table__main sherah-table__main-v3">
        <thead className="sherah-table__head">
          <tr>
            <th
              onClick={() => toggleSort("name")}
              style={{ cursor: "pointer" }}
            >
              <span className="me-2">Ad</span>
              {sortIcon("name")}
            </th>
            <th
              onClick={() => toggleSort("parentName")}
              style={{ cursor: "pointer" }}
            >
              <span className="me-2">Üst Kategori</span>
              {sortIcon("parentName")}
            </th>
            <th>Durum</th>
            <th
              onClick={() => toggleSort("createdAt")}
              style={{ cursor: "pointer" }}
            >
              <span className="me-2">Oluşturma</span>
              {sortIcon("createdAt")}
            </th>
            {canManage && <th>Aksiyon</th>}
          </tr>
        </thead>
        <tbody className="sherah-table__body">
          {data.content.length ? (
            data.content.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">{c.name}</p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {c.parentName ?? "—"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    {statusBadge(c.status)}
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {c.createdAt ?? "—"}
                    </p>
                  </div>
                </td>
                {canManage && (
                  <td>
                    <div className="sherah-table__product-content">
                      <div className="sherah-table__status__group justify-content-start">
                        <a
                          href="#"
                          className="sherah-table__action sherah-color2 sherah-color3__bg--opactity"
                          title="Güncelle"
                          onClick={(e) => {
                            e.preventDefault();
                            onEdit(c);
                          }}
                        >
                          <i className="fa-regular fa-pen-to-square" />
                        </a>

                        {(c.status ?? "").toUpperCase() === "ACTIVE" ? (
                          <a
                            href="#"
                            className="sherah-table__action sherah-color2 sherah-color2__bg--offset"
                            title="Sil"
                            onClick={(e) => {
                              e.preventDefault();
                              onAskDelete(c);
                            }}
                          >
                            <i className="fa-regular fa-trash-can" />
                          </a>
                        ) : (
                          <a
                            href="#"
                            className="sherah-table__action sherah-color3 sherah-color3__bg--opactity"
                            title="Geri Yükle"
                            onClick={(e) => {
                              e.preventDefault();
                              onRestore(c);
                            }}
                          >
                            <i className="fa-solid fa-rotate-left" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={canManage ? 5 : 4} style={{ textAlign: "center" }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
