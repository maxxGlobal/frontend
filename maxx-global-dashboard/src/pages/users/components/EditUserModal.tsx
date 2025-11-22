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
  const [showPassword, setShowPassword] = useState(false);
  const canManage = hasPermission({ anyOf: ["SYSTEM_ADMIN", "USER_MANAGE"] });

  useEffect(() => {
    if (!target) return;
    setForm({
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      phoneNumber: target.phoneNumber ?? "",
      address: target.address,
      password: "",
      dealerId: target.dealer?.id,
      roleId: target.roles?.[0]?.id,
      status: target.status == "AKTİF" ? "ACTIVE" : "DELETED",
      authorizedUser: target.authorizedUser ?? false,
      emailNotifications: target.emailNotifications ?? false,
      preferredLanguage: target.preferredLanguage ?? "TR",
    });
  }, [target]);

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
    const targetEl = e.target as HTMLInputElement | HTMLSelectElement;
    const { name } = targetEl;

    let nextValue: string | number | boolean | undefined = targetEl.value;

    if (
      targetEl instanceof HTMLInputElement &&
      targetEl.type === "checkbox"
    ) {
      nextValue = targetEl.checked;
    } else if (name === "dealerId" || name === "roleId") {
      nextValue = targetEl.value
        ? Number(targetEl.value)
        : undefined;
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload: any = {};

      if (form.firstName?.trim()) payload.firstName = form.firstName.trim();
      if (form.lastName?.trim()) payload.lastName = form.lastName.trim();
      if (form.email?.trim()) payload.email = form.email.trim();
      if (form.phoneNumber?.trim()) payload.phoneNumber = form.phoneNumber.trim();
      if (form.address?.trim()) payload.address = form.address.trim();
      if (form.password?.trim()) payload.password = form.password.trim();
      if (form.status) payload.status = form.status;

      if (typeof form.authorizedUser === "boolean") {
        payload.authorizedUser = form.authorizedUser;
      }

      if (typeof form.emailNotifications === "boolean") {
        payload.emailNotifications = form.emailNotifications;
      }

      if (form.preferredLanguage) {
        payload.preferredLanguage = form.preferredLanguage;
      }

      // ✅ dealerId - sadece değer varsa ekle
      if (form.dealerId && typeof form.dealerId === "number") {
        payload.dealerId = form.dealerId;
      }

      // ✅ roleIds - ARRAY olarak gönder
      if (form.roleId && typeof form.roleId === "number") {
        payload.roleIds = [form.roleId]; // ⭐ Burada array yap
      }

      await updateUser(target.id, payload);
      onSaved();
    } catch (err: any) {
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
                      title="Telefon numarası sadece rakamlardan oluşmalı (10-20 karakter)."
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Adres</label>
                    <input
                      className="form-control"
                      name="address"
                      value={form.address ?? ""}
                      onChange={onChange}
                      placeholder="Adres bilgisi"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Şifre
                      <small className="text-muted ms-2">
                        (Boş bırakırsanız mevcut şifre korunur)
                      </small>
                    </label>
                    <input
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password ?? ""}
                      onChange={onChange}
                      placeholder="••••••••"
                      maxLength={100}
                      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,100}$"
                      title="En az 8 karakter; 1 büyük, 1 küçük, 1 sayı ve 1 sembol içermelidir."
                    />
                    <button
                      type="button"
                      className="pw-toggle-btn"
                      aria-label={
                        showPassword ? "Şifreyi gizle" : "Şifreyi göster"
                      }
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        /* eye-slash */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="eye-icon"
                        >
                          <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                          <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                          <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                        </svg>
                      ) : (
                        /* eye */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="eye-icon"
                        >
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                          <path
                            fill-rule="evenodd"
                            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="form-text">
                      Şifre değiştirmek istemiyorsanız bu alanı boş bırakın.
                    </div>
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

                  <div className="col-md-6">
                    <label className="form-label d-block">Bayi Yetkili Kullanıcısı</label>
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="authorizedUser"
                        id="modalAuthorizedUser"
                        checked={!!form.authorizedUser}
                        onChange={onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="modalAuthorizedUser"
                      >
                        {form.authorizedUser
                          ? "Evet, bayi yetkilisi"
                          : "Hayır"}
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-block">E-posta Bildirimleri</label>
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="emailNotifications"
                        id="modalEmailNotifications"
                        checked={!!form.emailNotifications}
                        onChange={onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="modalEmailNotifications"
                      >
                        {form.emailNotifications
                          ? "Evet, e-posta gönder"
                          : "Hayır"}
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Tercih Edilen Dil</label>
                    <select
                      className="form-select"
                      name="preferredLanguage"
                      value={form.preferredLanguage ?? "TR"}
                      onChange={onChange}
                    >
                      <option value="TR">Türkçe</option>
                      <option value="EN">English</option>
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
