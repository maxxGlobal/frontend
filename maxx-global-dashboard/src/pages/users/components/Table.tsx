import Swal from "sweetalert2";
import { type PageResponse } from "../../../types/paging";
import { type UserRow } from "../../../types/user";
import { hasPermission } from "../../../utils/permissions";
import { restoreUser } from "../../../services/users/restore";

type Props = {
  data: PageResponse<UserRow> | null;
  // sort
  sortBy: string;
  sortIcon: (col: string) => string;         // mevcut imzanı bozmadım
  toggleSort: (col: string) => void;

  // helpers
  fmtDate: (v: string | number | Date) => string;
  statusClass: (s?: string | null) => string;

  // actions
  onAskEdit: (u: UserRow) => void;
  onAskDelete: (u: UserRow) => void;

  // opsiyonel: dışarıdan ek iş yapmak istersen (örn. state temizliği)
  onRestoreDone?: (u: UserRow) => void;

  // listeyi yeniden yükleyecek fonksiyon (parent’tan gönder)
  onReload?: () => void;
};

export default function UsersTable({
  data,
  sortIcon,
  toggleSort,
  fmtDate,
  statusClass,
  onAskDelete,
  onAskEdit,
  onRestoreDone,
  onReload,
}: Props) {
  // dealer tablosundaki gibi yetki ayrımı
  const canManage = hasPermission({ anyOf: ["SYSTEM_ADMIN", "USER_MANAGE"] });
  const deleted = "SİLİNDİ";

  async function handleRestore(u: UserRow) {
    const ok = await Swal.fire({
      title: "Kullanıcıyı geri yükle?",
      text: `${u.firstName} ${u.lastName} tekrar AKTİF olacak.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, geri yükle",
      cancelButtonText: "Vazgeç",
    }).then((r) => r.isConfirmed);

    if (!ok) return;

    try {
      await restoreUser(u.id);
      await Swal.fire("Başarılı", "Kullanıcı geri yüklendi.", "success");
      onRestoreDone?.(u);
      onReload?.(); // parent’ta sayfayı/refetch’i tetiklemek için
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Kullanıcı geri yüklenemedi";
      Swal.fire("Hata", msg, "error");
    }
  }

  return (
    <div className="sherah-table p-0">
      {/* dealer tablosu stili ile aynı, sade thead */}
      <table className="sherah-table__main sherah-table__main-v3">
        <thead className="sherah-table__head">
          <tr>
            <th onClick={() => toggleSort("firstName")} style={{ cursor: "pointer" }}>
              <span className="me-2">Ad</span>
              {sortIcon("firstName")}
            </th>
            <th onClick={() => toggleSort("lastName")} style={{ cursor: "pointer" }}>
              <span className="me-2">Soyad</span>
              {sortIcon("lastName")}
            </th>
            <th onClick={() => toggleSort("email")} style={{ cursor: "pointer" }}>
              <span className="me-2">E-posta</span>
              {sortIcon("email")}
            </th>
            <th>Telefon</th>
            <th>Bayi</th>
            <th>Roller</th>
            <th onClick={() => toggleSort("createdAt")} style={{ cursor: "pointer" }}>
              <span className="me-2">Oluşturma</span>
              {sortIcon("createdAt")}
            </th>
            <th onClick={() => toggleSort("status")} style={{ cursor: "pointer" }}>
              <span className="me-2">Durum</span>
              {sortIcon("status")}
            </th>
            {canManage && <th>Aksiyon</th>}
          </tr>
        </thead>

        <tbody className="sherah-table__body">
          {data && data.content.length ? (
            data.content.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">{u.firstName}</p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__vendor">
                    <h4 className="sherah-table__vendor--title">
                      <a href={`/users/${u.id}`}>{u.lastName}</a>
                    </h4>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">{u.email}</p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {u.phoneNumber || "—"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {u.dealer?.name || "—"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {u.roles?.map((r) => r.name).join(", ") || "—"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {fmtDate(u.createdAt)}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <div className={statusClass(u.status)}>{u.status || "—"}</div>
                  </div>
                </td>

                {canManage && (
                  <td>
                    <div className="sherah-table__product-content">
                      <div className="sherah-table__status__group justify-content-start">
                        {/* Güncelle */}
                        <a
                          href="#"
                          className="sherah-table__action sherah-color2 sherah-color3__bg--opactity"
                          title="Güncelle"
                          onClick={(e) => {
                            e.preventDefault();
                            onAskEdit(u);
                          }}
                        >
                          <i className="fa-regular fa-pen-to-square" />
                        </a>

                        {/* Sil veya Geri Yükle */}
                        {u.status !== deleted ? (
                          <a
                            href="#"
                            className="sherah-table__action sherah-color2 sherah-color2__bg--offset"
                            title="Sil"
                            onClick={(e) => {
                              e.preventDefault();
                              onAskDelete(u);
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
                              handleRestore(u);
                            }}
                          >
                            <i className="fa-solid fa-rotate-left"></i>
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
