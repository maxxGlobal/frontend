// src/pages/roles/components/EditRoleModal.tsx
import { useEffect, useState } from "react";
import type { RoleRow } from "../../../types/role";
import type { Permission } from "../../../types/permission";
import { listPermissions } from "../../../services/permissions";
import { updateRole } from "../../../services/roles";

type Props = {
  role: RoleRow;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditRoleModal({ role, onClose, onSaved }: Props) {
  const [name, setName] = useState(role.name);
  const [perms, setPerms] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<number[]>(
    role.permissions?.map((p) => p.id) ?? []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await listPermissions();
        setPerms(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (id: number) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  async function save() {
    try {
      setSaving(true);
      await updateRole(role.id, { name: name.trim(), permissionIds: selected });
      onSaved();
    } catch (e) {
      console.error(e);
      alert("Rol güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Rolü Güncelle</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Kapat"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Rol Adı</label>
                <input
                  className="form-control sherah-wc__form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label d-block">Yetkiler</label>
                {loading ? (
                  <div>Yükleniyor…</div>
                ) : (
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-2">
                    {perms.map((p) => (
                      <div key={p.id} className="col">
                        <label className="d-flex align-items-start gap-2 p-2 border rounded-3">
                          <input
                            type="checkbox"
                            className="form-check-input mt-1"
                            checked={selected.includes(p.id)}
                            onChange={() => toggle(p.id)}
                          />
                          <div>
                            <div className="fw-semibold">{p.name}</div>
                            {p.description && (
                              <div className="text-muted small">
                                {p.description}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-light"
                onClick={onClose}
                disabled={saving}
              >
                İptal
              </button>
              <button
                className="btn btn-success"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
