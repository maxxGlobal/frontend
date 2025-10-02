// src/pages/roles/RolesList.tsx
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "../../utils/permissions";
import { listRoles, deleteRole, restoreRole } from "../../services/roles";
import type { RoleRow } from "../../types/role";
import FilterPanel from "./components/FilterPanel";
import RolesTable from "./components/Table";
import DeleteRoleModal from "./components/DeleteRoleModal";
import EditRoleModal from "./components/EditRoleModal";
import { useRef } from "react";

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

function toPage<T>(rows: T[], page: number, size: number): Page<T> {
  const totalElements = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const from = page * size;
  return {
    content: rows.slice(from, from + size),
    totalElements,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

export default function RolesList() {
  const canManage = hasPermission({ required: "SYSTEM_ADMIN" });

  if (!canManage) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (SYSTEM_ADMIN gerekli).
      </div>
    );
  }

  const [all, setAll] = useState<RoleRow[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [size, _setSize] = useState(DEFAULT_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [editTarget, setEditTarget] = useState<RoleRow | null>(null);

  const [forceDelete, setForceDelete] = useState(false);
  const [_deleting, setDeleting] = useState(false);

  const [lastDeleted, setLastDeleted] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await listRoles();
        setAll(
          rows.map((r) => ({
            ...r,
            status: r.status ?? "",
          }))
        );
      } catch (e) {
        setError("Roller yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const t = q.trim().toLocaleLowerCase("tr-TR");
    if (!t) return all;
    return all.filter((r) => {
      const inName = r.name?.toLocaleLowerCase("tr-TR").includes(t);
      const inPerm =
        r.permissions?.some((p) =>
          p.name?.toLocaleLowerCase("tr-TR").includes(t)
        ) ?? false;
      return inName || inPerm;
    });
  }, [q, all]);

  const data = useMemo(
    () => toPage(filtered, page, size),
    [filtered, page, size]
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteRole(deleteTarget.id, { force: forceDelete });

      // sayfalama / refresh
      if (data.content.length === 1 && page > 0) {
        setPage((p) => Math.max(0, p - 1));
      } else {
        refresh();
      }

      // ↓↓↓ UNDO verisini hazırla
      setLastDeleted({ id: deleteTarget.id, name: deleteTarget.name });
      setShowUndo(true);
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = window.setTimeout(() => setShowUndo(false), 8000); // 8 sn

      setForceDelete(false);
      setDeleteTarget(null);
    } catch (e: any) {
      const res = e?.response;
      const msg =
        res?.data?.message ||
        res?.data?.title ||
        res?.data?.error ||
        e?.message ||
        "Rol silinemedi.";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  }
  async function handleUndoRestore() {
    if (!lastDeleted) return;
    try {
      await restoreRole(lastDeleted.id);
      setShowUndo(false);
      refresh();
    } catch (e: any) {
      const res = e?.response;
      const msg =
        res?.data?.message ||
        res?.data?.title ||
        res?.data?.error ||
        e?.message ||
        "Rol geri yüklenemedi.";
      alert(msg);
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">Rol Listesi</h3>
          </div>
          <div className="col-sm-12 col-md-6 d-flex justify-content-end">
            <FilterPanel
              q={q}
              setQ={(v) => {
                setQ(v);
                setPage(0);
              }}
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
              <RolesTable
                data={data}
                onEdit={(r) => setEditTarget(r)}
                onAskDelete={(r) => setDeleteTarget(r)}
              />
            </div>

            {/* Pagination */}
            <div className="row align-items-center mt-3">
              <div className="col-sm-12 col-md-5">
                Toplam <strong>{data.totalElements}</strong> kayıt • Sayfa{" "}
                {data.number + 1} / {data.totalPages}
              </div>
              <div className="col-sm-12 col-md-7">
                <div className="dataTables_paginate paging_simple_numbers">
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
                          if (!data.first) setPage((p) => Math.max(0, p - 1));
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
                            setPage((p) =>
                              Math.min(data.totalPages - 1, p + 1)
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
          </>
        )}
      </div>

      {/* Silme Modalı */}
      <DeleteRoleModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Düzenle Modalı */}
      {editTarget && (
        <EditRoleModal
          role={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            refresh();
          }}
        />
      )}
      {showUndo && lastDeleted && (
        <div
          className="alert alert-success shadow-sm"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 9999,
            maxWidth: 360,
          }}
        >
          <div className="d-flex align-items-start justify-content-between">
            <div className="me-3">
              <strong>Silindi:</strong> {lastDeleted.name}
              <div className="small text-muted">Geri almak için tıklayın.</div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-success"
              onClick={handleUndoRestore}
            >
              Geri Al
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
