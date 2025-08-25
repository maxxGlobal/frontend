// src/pages/roles/RoleCreate.tsx
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "../../utils/permissions";
import { listPermissions } from "../../services/permissions";
import { createRole } from "../../services/roles";
import type { Permission } from "../../types/permission";

export default function RoleCreate() {
  // sadece SYSTEM_ADMIN erişsin
  if (!hasPermission({ required: "SYSTEM_ADMIN" })) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (SYSTEM_ADMIN gerekli).
      </div>
    );
  }

  const [name, setName] = useState("");
  const [perms, setPerms] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [permQuery, setPermQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // permissions yükle
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await listPermissions();
        setPerms(all);
      } catch (e) {
        console.error(e);
        setError("Permission listesi yüklenemedi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // arama filtresi
  const visiblePerms = useMemo(() => {
    const q = permQuery.trim().toLowerCase();
    if (!q) return perms;
    return perms.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [permQuery, perms]);

  // seçim helpers
  const toggle = (id: number) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  const selectAllVisible = () =>
    setSelected((prev) =>
      Array.from(new Set([...prev, ...visiblePerms.map((p) => p.id)]))
    );

  const clearAllVisible = () =>
    setSelected((prev) =>
      prev.filter((id) => !visiblePerms.some((p) => p.id === id))
    );

  // kaydet
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Rol adı zorunludur.");
    if (!selected.length) return setError("En az bir permission seçmelisiniz.");

    try {
      setSaving(true);
      setError(null);
      await createRole({ name: name.trim(), permissionIds: selected });
      alert("Rol oluşturuldu.");
      setName("");
      setSelected([]);
      setPermQuery("");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Rol oluşturulamadı.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="role-create mt-lg-5 mt-md-2">
      <h3 className="sherah-card__title mb-3">Yeni Rol Oluştur</h3>

      {error && <div className="alert alert-warning">{error}</div>}

      <form onSubmit={submit} className="sherah-wc__form-main p-0">
        <div className="row g-3">
          {/* Rol adı */}
          <div className="col-lg-6">
            <div className="form-group perm-search">
              <label className="sherah-wc__form-label">Rol Adı *</label>
              <div className="form-group__input">
                <input
                  className="sherah-wc__form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn. FINANCE_MANAGER"
                  required
                />
              </div>
            </div>
          </div>
          {/* Permissions */}
          <div className="col-12">
            <div className="mb-2 d-flex align-items-center flex-wrap gap-2 mt-lg-3 mt-md-3">
              <div className="form-group mt-0">
                <div className="form-group__input d-flex">
                  <div className="input-group-text border-0 perm-search-icon rounded-0">
                    <i className="fa-solid fa-magnifying-glass" />
                  </div>
                  <input
                    type="search"
                    className="sherah-wc__form-input"
                    placeholder="Yetki Ara…"
                    value={permQuery}
                    onChange={(e) => setPermQuery(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="sherah-btn sherah-btn__secondary"
                onClick={selectAllVisible}
                disabled={loading || visiblePerms.length === 0}
              >
                Tümünü Seç
              </button>
              <button
                type="button"
                className="sherah-btn sherah-btn__primary"
                onClick={clearAllVisible}
                disabled={loading || visiblePerms.length === 0}
              >
                Temizle
              </button>
            </div>
            <h3 className="sherah-card__title mb-3 mt-lg-4 mt-md-3">
              Yetkiler
            </h3>
            {/* Grid (checkbox + label) */}
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Yükleniyor</span>
                </div>
              </div>
            ) : visiblePerms.length ? (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-2 ">
                {visiblePerms.map((p) => {
                  const isOn = selected.includes(p.id);
                  const cid = `perm-${p.id}`;
                  return (
                    <div className="col" key={p.id}>
                      <div className={`perm-card ${isOn ? "selected" : ""}`}>
                        <div className="form-check">
                          <input
                            id={cid}
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={isOn}
                            onChange={() => toggle(p.id)}
                          />
                          <label
                            htmlFor={cid}
                            className="form-check-label w-100 mb-0"
                          >
                            {p.description ? (
                              <div className="perm-name-desc">
                                {p.description}
                              </div>
                            ) : null}
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted small">
                Eşleşen permission bulunamadı.
              </div>
            )}
          </div>

          {/* Kaydet */}
          <div className="col-12 mt-2">
            <button
              type="submit"
              className="sherah-btn sherah-btn__secondary"
              disabled={saving || loading}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
