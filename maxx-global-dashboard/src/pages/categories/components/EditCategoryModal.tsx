import { useEffect, useState } from "react";
import type {
  CategoryRow,
  CategoryUpdateRequest,
} from "../../../types/category";
import { updateCategory } from "../../../services/categories/update";
import { getCategoryById } from "../../../services/categories/getById";
import { getAllCategoryOptions } from "../../../services/categories/options";
import type { CategoryOption } from "../../../services/categories/_normalize";
// ✅ SweetAlert import'ları
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

type Props = {
  category: CategoryRow;
  onClose: () => void;
  onSaved: () => void;
};

// Girintiyi temizlemek için yardımcı (— ve boşlukları kırp)
const stripIndent = (s: string) => s.replace(/^[—\-\s]+/g, "").trim();

// ✅ Türkçe field name mapping
function getFieldDisplayName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    name: "Kategori Adı",
    nameEn: "Kategori Adı (İngilizce)",
    description: "Açıklama",
    descriptionEn: "Açıklama (İngilizce)",
    parentId: "Üst Kategori",
    status: "Durum",
  };

  return fieldMap[fieldName] || fieldName;
}

export default function EditCategoryModal({
  category,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<CategoryUpdateRequest>({
    name: category.name,
    nameEn: (category as any).nameEn ?? "",
    description: (category as any).description ?? "",
    descriptionEn: (category as any).descriptionEn ?? "",
    parentId: undefined, // detayla doldurulacak
    status: category.status as any,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(true);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        setLoadingOpts(true);
        setError(null);

        // 1) Detay: mevcut parent'ı öğren
        const detail = await getCategoryById(category.id, {
          signal: abort.signal,
        });

        // 2) Tüm kategorileri (girintili etiketlerle) al
        const all = await getAllCategoryOptions({ signal: abort.signal });

        // Kendisini listeden çıkar (kendi altına taşıma engeli için basit yol)
        const cleaned = all.filter((o) => o.id !== category.id);
        setOptions(cleaned);

        // parentId yoksa parentCategoryName ile bul
        let selectedParentId: number | null =
          (detail as any).parentId ?? (detail as any).parentCategoryId ?? null;

        if (
          (selectedParentId == null || selectedParentId === undefined) &&
          detail.parentCategoryName
        ) {
          const byName = cleaned.find(
            (o) => stripIndent(o.label) === detail.parentCategoryName
          );
          if (byName) selectedParentId = byName.id;
        }

        // formu güncelle
        setForm((f) => ({
          ...f,
          name: detail.name ?? f.name,
          nameEn: detail.nameEn ?? f.nameEn,
          description: detail.description ?? f.description,
          descriptionEn: detail.descriptionEn ?? f.descriptionEn,
          parentId:
            selectedParentId === undefined ? null : selectedParentId ?? null,
          status: (detail.status as any) ?? f.status,
        }));
      } catch (e: any) {
        if (e?.name === "AbortError" || e?.name === "CanceledError") return;
        setError("Kategori bilgileri yüklenemedi.");
      } finally {
        setLoadingOpts(false);
      }
    })();
    return () => abort.abort();
  }, [category.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Frontend validation
    if (!form.name?.trim()) {
      await MySwal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Kategori adı zorunludur.",
        confirmButtonText: "Tamam",
      });
      return;
    }
    if (!form.nameEn?.trim()) {
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

      await updateCategory(category.id, {
        name: form.name?.trim(),
        nameEn: form.nameEn?.trim(),
        description: form.description?.trim() ?? "",
        descriptionEn: form.descriptionEn?.trim() ?? "",
        parentId:
          form.parentId === ("" as unknown as number) ||
          form.parentId === undefined
            ? null
            : (form.parentId as number | null),
        status: form.status,
      });

      // ✅ Başarı SweetAlert'i
      await MySwal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Kategori başarıyla güncellendi.",
        confirmButtonText: "Tamam",
        timer: 2000,
        timerProgressBar: true,
      });

      onSaved();
    } catch (err: any) {
      // ✅ Backend hata mesajını detaylı işle
      let errorTitle = "Kategori Güncelleme Hatası";
      let errorMessage = "Kategori güncellenirken bilinmeyen bir hata oluştu.";
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
            // Birden fazla validation hatası
            if (Array.isArray(data.errors)) {
              errorMessage = `<ul class="text-start mb-0">
                ${data.errors
                  .map((error: string) => `<li>${error}</li>`)
                  .join("")}
              </ul>`;
              isHtml = true;
            } else if (typeof data.errors === "object") {
              // Field-based validation errors
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
        } else if (status === 404) {
          errorTitle = "Bulunamadı";
          errorMessage = "Güncellenmeye çalışılan kategori bulunamadı.";
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
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          tabIndex={-1}
        >
          <form className="modal-content" onSubmit={submit} noValidate>
            <div className="modal-header">
              <h5 className="modal-title">Kategori Düzenle</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* ✅ Error div'ini backup olarak tutabilirsiniz */}
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Ad *</label>
                <input
                  name="name"
                  className="form-control"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  title="Kategori adı zorunlu bir alandır"
                  placeholder="Kategori adını girin"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">İngilizce Ad *</label>
                <input
                  name="nameEn"
                  className="form-control"
                  value={form.nameEn || ""}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  required
                  title="İngilizce kategori adı zorunludur"
                  placeholder="Kategori adını İngilizce girin"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Açıklama</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Kategori açıklamasını girin"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Açıklama (İngilizce)</label>
                <textarea
                  name="descriptionEn"
                  className="form-control"
                  value={form.descriptionEn ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, descriptionEn: e.target.value })
                  }
                  rows={3}
                  placeholder="Kategori açıklamasını İngilizce girin"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Üst Kategori</label>
                {loadingOpts ? (
                  <div className="form-text">Seçenekler yükleniyor…</div>
                ) : (
                  <select
                    name="parentId"
                    className="form-select"
                    // null -> "" : "(Yok)" seçili görünür
                    value={
                      form.parentId === null || form.parentId === undefined
                        ? ""
                        : String(form.parentId)
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        parentId:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    title="Üst kategori seçimi"
                  >
                    <option value="">(Yok)</option>
                    {options.map((o) => (
                      <option key={o.id} value={String(o.id)}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-2">
                <label className="form-label d-block">Durum</label>
                {form.status}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Kapat
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}
