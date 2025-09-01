import { type PageResponse } from "../../../types/paging";
import { type UserRow } from "../../../types/user";
import { hasPermission } from "../../../utils/permissions";

type Props = {
  data: PageResponse<UserRow> | null;
  sortBy: string;
  sortIcon: (col: string) => string;
  toggleSort: (col: string) => void;
  fmtDate: (v: string | number | Date) => string;
  statusClass: (s?: string | null) => string;
  onAskEdit: (u: UserRow) => void;
  onAskDelete: (u: UserRow) => void;
};

export default function UsersTable({
  data,
  sortBy,
  sortIcon,
  toggleSort,
  fmtDate,
  statusClass,
  onAskDelete,
  onAskEdit,
}: Props) {
  const canDelete = hasPermission({ required: "USER_MANAGE" });

  return (
    <div className="sherah-table p-0">
      <table
        id="sherah-table__vendor"
        className="sherah-table__main sherah-table__main-v3"
      >
        <thead className="sherah-table__head">
          <tr>
            <th
              className="sherah-table__column-1 sherah-table__h1"
              style={{ cursor: "pointer" }}
              onClick={() => toggleSort("firstName")}
            >
              Ad {sortIcon("firstName")}
            </th>
            <th
              className="sherah-table__column-2 sherah-table__h2"
              style={{ cursor: "pointer" }}
              onClick={() => toggleSort("lastName")}
            >
              Soyad {sortIcon("lastName")}
            </th>
            <th
              className="sherah-table__column-3 sherah-table__h3"
              style={{ cursor: "pointer" }}
              onClick={() => toggleSort("email")}
            >
              E-posta {sortIcon("email")}
            </th>
            <th className="sherah-table__column-4 sherah-table__h4">Telefon</th>
            <th className="sherah-table__column-5 sherah-table__h5">Bayi</th>
            <th className="sherah-table__column-6 sherah-table__h6">Roller</th>
            <th
              className="sherah-table__column-7 sherah-table__h7"
              style={{ cursor: "pointer" }}
              onClick={() => toggleSort("createdAt")}
            >
              Oluşturma {sortIcon("createdAt")}
            </th>
            <th
              className="sherah-table__column-8 sherah-table__h8"
              style={{ cursor: "pointer" }}
              onClick={() => toggleSort("status")}
            >
              Durum {sortIcon("status")}
            </th>
            <th className="sherah-table__column-9 sherah-table__h9">Aksiyon</th>
          </tr>
        </thead>

        <tbody className="sherah-table__body">
          {data && data.content.length > 0 ? (
            data.content.map((u) => (
              <tr key={u.id}>
                <td className="sherah-table__column-1 sherah-table__data-1">
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">{u.firstName}</p>
                  </div>
                </td>
                <td className="sherah-table__column-2 sherah-table__data-2">
                  <div className="sherah-table__vendor">
                    <h4 className="sherah-table__vendor--title">
                      <a href={`/users/${u.id}`}>{u.lastName}</a>
                    </h4>
                  </div>
                </td>
                <td className="sherah-table__column-3 sherah-table__data-3">
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">{u.email}</p>
                  </div>
                </td>
                <td className="sherah-table__column-4 sherah-table__data-4">
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {u.phoneNumber || "-"}
                    </p>
                  </div>
                </td>
                <td className="sherah-table__column-5 sherah-table__data-5">
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {u.dealer?.name || "-"}
                    </p>
                  </div>
                </td>
                <td className="sherah-table__column-6 sherah-table__data-6">
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {u.roles?.map((r) => r.name).join(", ") || "-"}
                    </p>
                  </div>
                </td>
                <td className="sherah-table__column-7 sherah-table__data-7">
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {fmtDate(u.createdAt)}
                    </p>
                  </div>
                </td>
                <td className="sherah-table__column-8 sherah-table__data-8">
                  <div className="sherah-table__product-content">
                    <div className={statusClass(u.status)}>
                      {u.status || "-"}
                    </div>
                  </div>
                </td>
                <td className="sherah-table__column-9 sherah-table__data-9">
                  <div className="sherah-table__product-content">
                    <div className="sherah-table__status__group">
                      <a
                        href={`/users/${u.id}/edit`}
                        className="sherah-table__action sherah-color2 sherah-color3__bg--opactity"
                        title="Güncelle"
                        onClick={(e) => {
                          e.preventDefault();
                          onAskEdit(u);
                        }}
                      >
                        {/* edit icon */}
                        <i className="fa-regular fa-pen-to-square" />
                      </a>
                      {canDelete && (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onAskDelete(u);
                          }}
                          className="sherah-table__action sherah-color2 sherah-color2__bg--offset"
                          title="Sil"
                        >
                          {/* trash icon */}
                          <i className="fa-regular fa-trash-can" />
                        </a>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} style={{ textAlign: "center" }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
