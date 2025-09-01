import { useEffect, useState } from "react";
import { updateUser } from "../../../services/users/update";
import { getDealerSummaries } from "../../../services/dealers";
import type { DealerSummary } from "../../../types/dealer";
import { getActiveRoles, type RoleOption } from "../../../services/roleService";
import { hasPermission } from "../../../utils/permissions";
import type { UserRow, UpdateUserRequest } from "../../../types/user";

type Props = {
  target: UserRow | null;
  onClose: () => void;
  onSaved: () => void; // kaydedince listeyi tazelemek için
};

export default function EditUserModal({ target, onClose, onSaved }: Props) {
  const [form, setForm] = useState<UpdateUserRequest>({});
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dealers, setDealers] = useState<DealerSummary[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const canManage = hasPermission({ required: "USER_MANAGE" });

  useEffect(() => {
    if (!target) return;
    setForm({
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      phoneNumber: target.phoneNumber ?? "",
      dealerId: target.dealer?.id,
      roleId: target.roles?.[0]?.id, // tek rol varsa
      status: target.status,
      // address, password vs. gerekiyorsa ekleyin
    });
  }, [target]);

  // açılınca listeleri çek
  useEffect(() => {
    if (!target) return;
    (async () => {
      try {
        setListsLoading(true);
        setError(null);
        const [ds, rs] = await Promise.all([
          getDealerSummaries(),
          getActiveRoles(),
        ]);
        setDealers(ds);
        setRoles(rs);
      } catch (e) {
        console.error(e);
        setError("Liste verileri yüklenirken hata oluştu.");
      } finally {
        setListsLoading(false);
      }
    })();
  }, [target]);

  if (!target) return null;

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        name === "dealerId" || name === "roleId"
          ? value
            ? Number(value)
            : undefined
          : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await updateUser(target.id, form);
      onSaved(); // modal kapanışı + refresh
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Güncelleme sırasında hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Kullanıcıyı Güncelle</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  disabled={loading}
                />
              </div>

              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger mb-3">{error}</div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Ad</label>
                    <input
                      className="form-control"
                      name="firstName"
                      value={form.firstName ?? ""}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Soyad</label>
                    <input
                      className="form-control"
                      name="lastName"
                      value={form.lastName ?? ""}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">E-posta</label>
                    <input
                      className="form-control"
                      type="email"
                      name="email"
                      value={form.email ?? ""}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Telefon</label>
                    <input
                      className="form-control"
                      name="phoneNumber"
                      value={form.phoneNumber ?? ""}
                      onChange={onChange}
                    />
                  </div>

                  {/* Yönetici ise bayi/rol değiştirebilsin */}
                  <div className="col-md-6">
                    <label className="form-label">Bayi</label>
                    <select
                      className="form-select"
                      name="dealerId"
                      value={form.dealerId ?? ""}
                      onChange={onChange}
                      disabled={!canManage || listsLoading}
                    >
                      <option value="">Seçiniz</option>
                      {dealers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      name="roleId"
                      value={form.roleId ?? ""}
                      onChange={onChange}
                      disabled={!canManage || listsLoading}
                    >
                      <option value="">Seçiniz</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                  disabled={loading}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Kaydediliyor…
                    </>
                  ) : (
                    "Kaydet"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* backdrop */}
      <div className="modal-backdrop fade show" />
    </>
  );
}
