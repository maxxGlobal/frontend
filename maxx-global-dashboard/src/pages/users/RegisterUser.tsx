// src/pages/users/RegisterUser.tsx
import { useEffect, useState } from "react";
import { registerUser } from "../../services/--userService";
import { hasPermission } from "../../utils/permissions";
import { getDealerSummaries } from "../../services/dealers";
import type { DealerSummary } from "../../types/dealer";
import { getActiveRoles, type RoleOption } from "../../services/roleService";

type FieldErrors = Record<string, string[]>;

export default function RegisterUser() {
  if (!hasPermission({ required: "USER_MANAGE" })) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok.
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
  });
  const [loading, setLoading] = useState(false);

  const [dealers, setDealers] = useState<DealerSummary[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState<string | null>(null);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    (async () => {
      try {
        setListsLoading(true);
        setListsError(null);
        const [dealerList, roleList] = await Promise.all([
          getDealerSummaries(),
          getActiveRoles(),
        ]);
        setDealers(dealerList);
        setRoles(roleList);
      } catch (err) {
        console.error(err);
        setListsError("Liste verileri yüklenirken hata oluştu.");
      } finally {
        setListsLoading(false);
      }
    })();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (fieldErrors[e.target.name]) {
      const next = { ...fieldErrors };
      delete next[e.target.name];
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

    try {
      await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        address: form.address || undefined,
        phoneNumber: form.phoneNumber || undefined,
        dealerId: Number(form.dealerId),
        roleId: Number(form.roleId),
      });

      alert("Kullanıcı oluşturuldu");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",

        address: "",
        phoneNumber: "",
        dealerId: "",
        roleId: "",
      });
    } catch (err: any) {
      console.error(err);
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

          {/* GLOBAL ERROR */}
          {globalError && (
            <div className="alert alert-danger mb-3">{globalError}</div>
          )}
          {listsError && (
            <div className="alert alert-warning mb-3">{listsError}</div>
          )}

          {/* FORM */}
          <form
            className="sherah-wc__form-main p-0"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="row">
              {/* First Name */}
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

              {/* Last Name */}
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

              {/* Password */}
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Şifre *</label>
                  <div className="form-group__input">
                    <input
                      className={`sherah-wc__form-input ${
                        fe("password").length ? "is-invalid" : ""
                      }`}
                      id="password-field"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      maxLength={100}
                      value={form.password}
                      onChange={onChange}
                      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,100}$"
                      title="En az 8 karakter; 1 büyük, 1 küçük, 1 sayı ve 1 sembol içermelidir."
                    />
                  </div>
                  {fe("password").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">
                    Confirm Password *
                  </label>
                  <div className="form-group__input">
                    <input
                      className={`sherah-wc__form-input ${
                        fe("confirmPassword").length ? "is-invalid" : ""
                      }`}
                      id="confirm-password-field"
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      required
                      maxLength={100}
                      value={form.confirmPassword}
                      onChange={onChange}
                    />
                  </div>
                  {fe("confirmPassword").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Address */}
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

              {/* Phone Number */}
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
                      // 10-20 arası rakam
                      pattern="^\d{10,20}$"
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

              {/* Dealer */}
              <div className="col-lg-6 col-md-6 col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Bayi *</label>
                  <div className="form-group__input">
                    <select
                      className={`sherah-wc__form-input ${
                        fe("dealerId").length ? "is-invalid" : ""
                      }`}
                      name="dealerId"
                      required
                      disabled={listsLoading || !!listsError}
                      value={form.dealerId}
                      onChange={onChange}
                    >
                      <option value="">
                        {listsLoading
                          ? "Bayi listesi yükleniyor..."
                          : "Bayi seçin"}
                      </option>
                      {dealers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fe("dealerId").map((m, i) => (
                    <div key={i} className="text-danger small mt-1">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Role */}
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
