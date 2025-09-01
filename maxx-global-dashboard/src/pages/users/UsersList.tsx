import { useState } from "react";
import { useUsersList } from "./hooks/useUsersList";
import FilterPanel from "./components/FilterPanel";
import UsersTable from "./components/Table";
import DeleteUserModal from "./components/DeleteUserModal";
import { deleteUser } from "../../services/users/delete";
import { hasPermission } from "../../utils/permissions";
import { type UserRow } from "../../types/user";
import EditUserModal from "./components/EditUserModal";

export default function UsersList() {
  if (!hasPermission({ required: "USER_MANAGE" })) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok.
      </div>
    );
  }

  const { state, actions, helpers } = useUsersList();
  const {
    dealers,
    dealerId,
    activeOnly,
    q,
    data,
    loading,
    error,
    selectedDealerName,
    page,
    size,
    sortBy,
  } = state;
  const {
    setDealerId,
    setActiveOnly,
    setQ,
    setPage,
    onChangeSize,
    toggleSort,
    sortIcon,
    refresh,
  } = actions;
  const { fmtDate, statusClass } = helpers;

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const askDelete = (u: UserRow) => setDeleteTarget(u);
  const askEdit = (u: UserRow) => setEditTarget(u);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteUser(deleteTarget.id);

      // son kayıt silinmişse sayfayı geri al; değilse yenile
      if (data?.content.length === 1 && page > 0) {
        setPage(Math.max(0, page - 1));
      } else {
        refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Kullanıcı silinirken bir hata oluştu.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="sherah-table p-0 user-list">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">Kullanıcı Listesi</h3>
          </div>
          <div className="col-sm-12 col-md-6 d-flex justify-content-end">
            <FilterPanel
              dealers={dealers}
              dealerId={dealerId}
              setDealerId={setDealerId}
              activeOnly={activeOnly}
              setActiveOnly={setActiveOnly}
              q={q}
              setQ={setQ}
              selectedDealerName={selectedDealerName}
              setPage={setPage}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="sherah-card__body">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Yükleniyor</span>
            </div>
          </div>
        ) : (
          <>
            <div className="sherah-page-inner sherah-default-bg sherah-border">
              <UsersTable
                data={data}
                sortBy={sortBy}
                sortIcon={sortIcon}
                toggleSort={toggleSort}
                fmtDate={fmtDate}
                statusClass={statusClass}
                onAskDelete={askDelete}
                onAskEdit={askEdit}
              />
            </div>

            {/* Pagination */}
            {data && (
              <div className="row align-items-center mt-3">
                <div className="col-sm-12 col-md-5">
                  Toplam <strong>{data.totalElements}</strong> kayıt • Sayfa{" "}
                  {data.number + 1} / {data.totalPages}
                </div>
                <div className="col-sm-12 col-md-7">
                  <div
                    className="dataTables_paginate paging_simple_numbers"
                    id="sherah-table__vendor_paginate"
                  >
                    <ul className="pagination">
                      <li
                        className={`paginate_button page-item previous ${
                          data.first ? "disabled" : ""
                        }`}
                      >
                        <a
                          href="#"
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!data.first) setPage(Math.max(0, page - 1));
                          }}
                        >
                          <i className="fas fa-angle-left" />
                        </a>
                      </li>
                      {Array.from({ length: data.totalPages }, (_, i) => (
                        <li
                          key={i}
                          className={`paginate_button page-item ${
                            i === data.number ? "active" : ""
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
                      ))}
                      <li
                        className={`paginate_button page-item next ${
                          data.last ? "disabled" : ""
                        }`}
                      >
                        <a
                          href="#"
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!data.last)
                              setPage(Math.min(data.totalPages - 1, page + 1));
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
          </>
        )}
      </div>

      <DeleteUserModal
        target={deleteTarget}
        deleting={deleting}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      {editTarget && (
        <EditUserModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            refresh(); // listeyi tazele
          }}
        />
      )}
    </div>
  );
}
