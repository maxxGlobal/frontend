// src/pages/categories/CategoryCreate.tsx
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "../../utils/permissions";
import { createCategory } from "../../services/categories/create";
import { listAllCategories } from "../../services/categories/listAll";
import {
  buildCategoryTree,
  flattenNodesToOptions,
  type CatNode,
} from "../../services/categories/buildTree";
import type { CategoryCreateRequest } from "../../types/category";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

type SelectOption = { value: number | null; label: string };

function getFieldDisplayName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    name: "Kategori Adı",
    nameEn: "Kategori Adı (İngilizce)",
    description: "Açıklama",
    descriptionEn: "Açıklama (İngilizce)",
    parentId: "Üst Kategori",
  };

  return fieldMap[fieldName] || fieldName;
}

export default function CategoryCreate() {
  if (
    !hasPermission({
      anyOf: ["CATEGORY_CREATE", "CATEGORY_MANAGE", "SYSTEM_ADMIN"],
    })
  ) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (CATEGORY_CREATE gerekli).
      </div>
    );
  }

  const [form, setForm] = useState<CategoryCreateRequest>({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    parentId: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tree, setTree] = useState<CatNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [treeErr, setTreeErr] = useState<string | null>(null);

  async function loadAll(signal?: AbortSignal) {
    const flat = await listAllCategories({ signal });
    const t = buildCategoryTree(flat);
    setTree(t);
  }

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingTree(true);
        setTreeErr(null);
        await loadAll(controller.signal);
      } catch (e: any) {
        if (e?.name !== "AbortError" && e?.name !== "CanceledError") {
          setTreeErr("Kategori listesi yüklenemedi.");
        }
      } finally {
        setLoadingTree(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const options: SelectOption[] = useMemo(() => {
    const flat = flattenNodesToOptions(tree).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    return [{ value: null, label: "(Yok)" }, ...flat];
  }, [tree]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      await MySwal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Kategori adı zorunludur.",
        confirmButtonText: "Tamam",
      });
      return;
    }
    if (!form.nameEn.trim()) {
      await MySwal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "İngilizce kategori adı zorunludur.",
        confirmButtonText: "Tamam",
      });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await createCategory({
        name: form.name.trim(),
        nameEn: form.nameEn.trim(),
        description: form.description?.trim() || "",
        descriptionEn: form.descriptionEn?.trim() || "",
        parentId: form.parentId ?? undefined,
      });

      await MySwal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Kategori başarıyla oluşturuldu.",
        confirmButtonText: "Tamam",
        timer: 2000,
        timerProgressBar: true,
      });
      await loadAll();
      setForm({
        name: "",
        nameEn: "",
        description: "",
        descriptionEn: "",
        parentId: null,
      });
    } catch (err: any) {
      let errorTitle = "Kategori Oluşturma Hatası";
      let errorMessage = "Kategori oluşturulurken bilinmeyen bir hata oluştu.";
      let isHtml = false;

      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 400) {
          errorTitle = "Doğrulama Hatası";

          if (typeof data === "string") {
            errorMessage = data;
          } else if (data?.message) {
            errorMessage = data.message;
          } else if (data?.title) {
            errorMessage = data.title;
          } else if (data?.errors) {
            if (Array.isArray(data.errors)) {
              errorMessage = `<ul class="text-start mb-0">
                ${data.errors
                  .map((error: string) => `<li>${error}</li>`)
                  .join("")}
              </ul>`;
              isHtml = true;
            } else if (typeof data.errors === "object") {
              const fieldErrors = Object.entries(data.errors)
                .map(([field, msgs]) => {
                  const fieldName = getFieldDisplayName(field);
                  const message = Array.isArray(msgs) ? msgs.join(", ") : msgs;
                  return `<li><strong>${fieldName}:</strong> ${message}</li>`;
                })
                .join("");
              errorMessage = `<ul class="text-start mb-0">${fieldErrors}</ul>`;
              isHtml = true;
            }
          } else {
            errorMessage = `Geçersiz veri gönderildi: ${JSON.stringify(data)}`;
          }
        } else if (status === 409) {
          errorTitle = "Çakışma Hatası";
          errorMessage =
            data?.message ||
            data?.title ||
            "Bu kategori adı zaten kullanılıyor.";
        } else if (status === 422) {
          errorTitle = "Veri Hatası";
          errorMessage =
            data?.message || data?.title || "Gönderilen veriler işlenemedi.";
        } else if (status === 500) {
          errorTitle = "Sunucu Hatası";
          errorMessage =
            "Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
        } else if (status === 403) {
          errorTitle = "Yetki Hatası";
          errorMessage = "Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.";
        } else {
          errorTitle = `HTTP ${status} Hatası`;
          errorMessage =
            data?.message || data?.title || "Bilinmeyen sunucu hatası";
        }
      } else if (err?.code === "NETWORK_ERROR" || !err?.response) {
        errorTitle = "Bağlantı Hatası";
        errorMessage =
          "Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // ✅ SweetAlert ile hata göster
      await MySwal.fire({
        icon: "error",
        title: errorTitle,
        html: isHtml ? errorMessage : undefined,
        text: isHtml ? undefined : errorMessage,
        confirmButtonText: "Tamam",
        width: "500px",
        customClass: {
          htmlContainer: "text-start",
        },
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col-lg-12 col-md-12 col-12 sherah-wc-col-two register-add-form">
      <div className="sherah-wc__form">
        <div className="sherah-wc__form-inner">
          <h3 className="sherah-wc__form-title sherah-wc__form-title__one">
            Yeni Kategori
          </h3>

          {/* ✅ Error div'ini kaldırabilir veya backup olarak tutabilirsiniz */}
          {error && <div className="alert alert-danger">{error}</div>}

          <form
            onSubmit={submit}
            className="sherah-wc__form-main p-0"
            noValidate
          >
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Ad *</label>
                  <div className="form-group__input">
                    <input
                      name="name"
                      className="sherah-wc__form-input"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                      title="Kategori adı zorunlu bir alandır"
                      placeholder="Kategori adını girin"
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">
                    İngilizce Ad *
                  </label>
                  <div className="form-group__input">
                    <input
                      name="nameEn"
                      className="sherah-wc__form-input"
                      value={form.nameEn}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nameEn: e.target.value }))
                      }
                      required
                      title="İngilizce kategori adı zorunlu bir alandır"
                      placeholder="Kategori adını İngilizce girin"
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Açıklama</label>
                  <div className="form-group__input">
                    <textarea
                      name="description"
                      className="sherah-wc__form-input"
                      value={form.description ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      rows={3}
                      placeholder="Kategori açıklamasını girin"
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">
                    Açıklama (İngilizce)
                  </label>
                  <div className="form-group__input">
                    <textarea
                      name="descriptionEn"
                      className="sherah-wc__form-input"
                      value={form.descriptionEn ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          descriptionEn: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Kategori açıklamasını İngilizce girin"
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <label className="sherah-wc__form-label">Üst Kategori</label>
                  {loadingTree ? (
                    <div className="form-text">Kategoriler yükleniyor…</div>
                  ) : treeErr ? (
                    <div className="text-danger small">{treeErr}</div>
                  ) : (
                    <select
                      name="parentId"
                      className="sherah-wc__form-input ps-2"
                      value={form.parentId ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          parentId:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }))
                      }
                      title="Üst kategori seçimi"
                    >
                      {options.map((o) => (
                        <option
                          key={String(o.value ?? "root")}
                          value={o.value ?? ""}
                        >
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="col-3">
                <div className="form-group form-mg-top25">
                  <div className="sherah-wc__button sherah-wc__button--bottom">
                    <button
                      className="ntfmax-wc__btn"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
