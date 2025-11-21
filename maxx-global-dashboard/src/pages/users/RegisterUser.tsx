import { useEffect, useState } from "react";
import { registerUser } from "../../services/users/register";
import { hasPermission } from "../../utils/permissions";
import { getDealerSummaries } from "../../services/dealers";
import type { DealerSummary } from "../../types/dealer";
import Swal from "sweetalert2";
import { getActiveRolesSimple } from "../../services/roles";
import type { RoleOption } from "../../types/role";

type FieldErrors = Record<string, string[]>;

export default function RegisterUser() {
  if (!hasPermission({ anyOf: ["SYSTEM_ADMIN", "USER_READ", "USER_MANAGE"] })) {
    return (
      <div className="alert alert-danger m-3">
        Swal.fire("Uyarı", "Bu sayfaya erişim yetkiniz yok.", "warning");
      </div>
    );
  }

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
    dealerId: "",
    roleId: "",
    authorizedUser: false,
    emailNotifications: false,
    preferredLanguage: "TR",
  });
  const [loading, setLoading] = useState(false);

  const [dealers, setDealers] = useState<DealerSummary[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    (async () => {
      try {
        setListsLoading(true);
        setListsError(null);
        const [dealerList, roleList] = await Promise.all([
          getDealerSummaries(),
          getActiveRolesSimple(),
        ]);
        setDealers(dealerList);
        setRoles(roleList);
      } catch (err) {
        setListsError("Liste verileri yüklenirken hata oluştu.");
      } finally {
        setListsLoading(false);
      }
    })();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;

    setForm({ ...form, [target.name]: value });

    if (fieldErrors[target.name]) {
      const next = { ...fieldErrors };
      delete next[target.name];
      setFieldErrors(next);
    }
  };

  function parseApiErrors(err: any): { global?: string; fields: FieldErrors } {
    const result: { global?: string; fields: FieldErrors } = { fields: {} };
    const resp = err?.response;
    const data = resp?.data;

    if (
      data &&
      typeof data === "object" &&
      data.errors &&
      typeof data.errors === "object"
    ) {
      for (const [key, val] of Object.entries<any>(data.errors)) {
        const field = key.length
          ? key.charAt(0).toLowerCase() + key.slice(1)
          : key;
        const messages = Array.isArray(val) ? val.map(String) : [String(val)];
        result.fields[field] = messages;
      }
      if (data.title) result.global = String(data.title);
      return result;
    }

    if (data && typeof data === "object" && data.message) {
      result.global = String(data.message);
      return result;
    }

    if (typeof data === "string") {
      result.global = data;
      return result;
    }

    result.global = err?.message || "İstek sırasında bir hata oluştu.";
    return result;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null);
    setFieldErrors({});

    // dealerId artık opsiyonel
    const dealerIdNum = form.dealerId ? Number(form.dealerId) : undefined;
    const roleIdNum = Number(form.roleId);

    const localErrors: FieldErrors = {};
    if (!roleIdNum) localErrors.roleId = ["Rol seçimi zorunludur."];
    if (!form.password) localErrors.password = ["Şifre zorunludur."];

    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        // Address alanını her zaman string olarak gönder (boş da olsa)
        address: form.address || "",
        // PhoneNumber boş ise göndermeme veya boş string gönder
        phoneNumber: form.phoneNumber || "",
        roleId: roleIdNum,
        authorizedUser: form.authorizedUser,
        emailNotifications: form.emailNotifications,
        preferredLanguage: form.preferredLanguage,
      };

      // dealerId varsa ekle
      if (dealerIdNum) {
        payload.dealerId = dealerIdNum;
      }

      await registerUser(payload);
      Swal.fire({
        title: "Başarılı",
        text: "Kullanıcı oluşturuldu",
        icon: "success",
        confirmButtonText: "Tamam",
      });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        address: "",
        phoneNumber: "",
        dealerId: "",
        roleId: "",
        authorizedUser: false,
        emailNotifications: false,
        preferredLanguage: "TR",
      });
    } catch (err: any) {
      const parsed = parseApiErrors(err);
      setGlobalError(parsed.global ?? null);
      setFieldErrors(parsed.fields);
    } finally {
      setLoading(false);
    }
  };

  const fe = (name: keyof typeof form) => fieldErrors[name] ?? [];

  return (
    <div className="col-lg-12 col-md-12 col-12 sherah-wc-col-two register-add-form">
      <div className="sherah-wc__form">
        <div className="sherah-wc__form-inner">
          <h3 className="sherah-wc__form-title sherah-wc__form-title__one">
            Kullanıcı Oluştur <span>Lütfen aşağıdaki bilgileri doldurun</span>
          </h3>

          {globalError && (
            <div className="alert alert-danger mb-3">{globalError}</div>
          )}
          {listsError && (
            <div className="alert alert-warning mb-3">{listsError}</div>
          )}

          <form
            className="sherah-wc__form-main p-0"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="row">
              {/* Ad */}
              <div className="col-lg-6 col-md-6 col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Ad *</label>
                  <div className="form-group__input">
                    <input
                      className={`sherah-wc__form-input ${
                        fe("firstName").length ? "is-invalid" : ""
                      }`}
                      type="text"
                      name="firstName"
                      placeholder="Ad"
                      required
                      value={form.firstName}
                      onChange={onChange}
                    />
                  </div>
                  {fe("firstName").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Soyad */}
              <div className="col-lg-6 col-md-6 col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Soyad *</label>
                  <div className="form-group__input">
                    <input
                      className={`sherah-wc__form-input ${
                        fe("lastName").length ? "is-invalid" : ""
                      }`}
                      type="text"
                      name="lastName"
                      placeholder="Soyad"
                      required
                      value={form.lastName}
                      onChange={onChange}
                    />
                  </div>
                  {fe("lastName").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">
                    Eposta Adresi *
                  </label>
                  <div className="form-group__input">
                    <input
                      className={`sherah-wc__form-input ${
                        fe("email").length ? "is-invalid" : ""
                      }`}
                      type="email"
                      name="email"
                      placeholder="demo@example.com"
                      required
                      value={form.email}
                      onChange={onChange}
                    />
                  </div>
                  {fe("email").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Şifre */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Şifre *</label>
                  <div className="form-group__input">
                    <input
                      className={`sherah-wc__form-input ${
                        fe("password").length ? "is-invalid" : ""
                      }`}
                      id="password-field"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      required
                      maxLength={100}
                      value={form.password}
                      onChange={onChange}
                      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,100}$"
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
                            fillRule="evenodd"
                            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fe("password").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Adres */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Adres</label>
                  <div className="form-group__input">
                    <input
                      className={`sherah-wc__form-input ${
                        fe("address").length ? "is-invalid" : ""
                      }`}
                      type="text"
                      name="address"
                      placeholder="Adres"
                      value={form.address}
                      onChange={onChange}
                    />
                  </div>
                  {fe("address").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Telefon */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Telefon</label>
                  <div className="form-group__input">
                    <input
                      className={`sherah-wc__form-input ${
                        fe("phoneNumber").length ? "is-invalid" : ""
                      }`}
                      type="tel"
                      name="phoneNumber"
                      placeholder="5051234567"
                      value={form.phoneNumber}
                      onChange={onChange}
                      pattern="^\\d{10,20}$"
                      title="Telefon numarası sadece rakamlardan oluşmalı (10-20 karakter)."
                    />
                  </div>
                  {fe("phoneNumber").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bayi - ✅ ARTIK OPSİYONEL */}
              <div className="col-lg-6 col-md-6 col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">
                    Bayi <small className="text-muted">(İsteğe bağlı)</small>
                  </label>
                  <div className="form-group__input">
                    <select
                      className={`sherah-wc__form-input ${
                        fe("dealerId").length ? "is-invalid" : ""
                      }`}
                      name="dealerId"
                      disabled={listsLoading || !!listsError}
                      value={form.dealerId}
                      onChange={onChange}
                    >
                      <option value="">
                        {listsLoading
                          ? "Bayi listesi yükleniyor..."
                          : "Bayi seçin (Dashboard kullanıcısı için boş bırakın)"}
                      </option>
                      {dealers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <small className="text-muted">
                    Bayi seçilmezse kullanıcı dashboard kullanıcısı olur
                  </small>
                  {fe("dealerId").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rol */}
              <div className="col-lg-6 col-md-6 col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Rol *</label>
                  <div className="form-group__input">
                    <select
                      className={`sherah-wc__form-input ${
                        fe("roleId").length ? "is-invalid" : ""
                      }`}
                      name="roleId"
                      required
                      disabled={listsLoading || !!listsError}
                      value={form.roleId}
                      onChange={onChange}
                    >
                      <option value="">
                        {listsLoading
                          ? "Rol listesi yükleniyor..."
                          : "Rol seçin"}
                      </option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fe("roleId").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Yetkili Kullanıcı */}
              <div className="col-lg-6 col-md-6 col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">
                    Bayi Yetkili Kullanıcısı
                  </label>
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      name="authorizedUser"
                      id="authorizedUser"
                      checked={form.authorizedUser}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="authorizedUser">
                      {form.authorizedUser
                        ? "Evet, bayi yetkilisi"
                        : "Hayır"}
                    </label>
                  </div>
                  {fe("authorizedUser").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* E-posta Bildirimleri */}
              <div className="col-lg-6 col-md-6 col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">
                    E-posta Bildirimleri
                  </label>
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      name="emailNotifications"
                      id="emailNotifications"
                      checked={form.emailNotifications}
                      onChange={onChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="emailNotifications"
                    >
                      {form.emailNotifications
                        ? "Evet, e-posta gönder"
                        : "Hayır"}
                    </label>
                  </div>
                  {fe("emailNotifications").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tercih Edilen Dil */}
              <div className="col-lg-6 col-md-6 col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Tercih Edilen Dil</label>
                  <div className="form-group__input">
                    <select
                      className={`sherah-wc__form-input ${
                        fe("preferredLanguage").length ? "is-invalid" : ""
                      }`}
                      name="preferredLanguage"
                      value={form.preferredLanguage}
                      onChange={onChange}
                    >
                      <option value="TR">Türkçe</option>
                      <option value="EN">English</option>
                    </select>
                  </div>
                  {fe("preferredLanguage").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="col-12">
                <div className="form-group form-mg-top25">
                  <div className="sherah-wc__button sherah-wc__button--bottom">
                    <button
                      className="ntfmax-wc__btn"
                      type="submit"
                      disabled={loading || listsLoading}
                    >
                      {loading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          {/* END FORM */}
        </div>
      </div>
    </div>
  );
}