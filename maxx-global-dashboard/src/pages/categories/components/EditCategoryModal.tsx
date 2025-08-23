import { useEffect, useState } from "react";
import type {
  CategoryRow,
  CategoryUpdateRequest,
} from "../../../types/category";
import { updateCategory } from "../../../services/categories/update";
import { getCategoryById } from "../../../services/categories/getById";
import { getAllCategoryOptions } from "../../../services/categories/options";
import type { CategoryOption } from "../../../services/categories/_normalize";

type Props = {
  category: CategoryRow;
  onClose: () => void;
  onSaved: () => void;
};

// Girintiyi temizlemek için yardımcı (— ve boşlukları kırp)
const stripIndent = (s: string) => s.replace(/^[—\-\s]+/g, "").trim();

export default function EditCategoryModal({
  category,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<CategoryUpdateRequest>({
    name: category.name,
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
          parentId:
            selectedParentId === undefined ? null : selectedParentId ?? null,
          status: (detail.status as any) ?? f.status,
        }));
      } catch (e: any) {
        if (e?.name === "AbortError" || e?.name === "CanceledError") return;
        console.error(e);
        setError("Kategori bilgileri yüklenemedi.");
      } finally {
        setLoadingOpts(false);
      }
    })();
    return () => abort.abort();
  }, [category.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await updateCategory(category.id, {
        name: form.name?.trim(),
        parentId:
          form.parentId === ("" as unknown as number) ||
          form.parentId === undefined
            ? null
            : (form.parentId as number | null),
        status: form.status,
      });

      onSaved();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Güncelleme başarısız.";
      setError(msg);
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
          <form className="modal-content" onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Kategori Düzenle</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Ad *</label>
                <input
                  className="form-control"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Üst Kategori</label>
                {loadingOpts ? (
                  <div className="form-text">Seçenekler yükleniyor…</div>
                ) : (
                  <select
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
