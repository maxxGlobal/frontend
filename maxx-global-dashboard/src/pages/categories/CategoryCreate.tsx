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

type SelectOption = { value: number | null; label: string };

export default function CategoryCreate() {
  if (!hasPermission({ required: "CATEGORY_CREATE" })) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (CATEGORY_CREATE gerekli).
      </div>
    );
  }

  const [form, setForm] = useState<CategoryCreateRequest>({
    name: "",
    parentId: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tree, setTree] = useState<CatNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [treeErr, setTreeErr] = useState<string | null>(null);

  async function loadAll(signal?: AbortSignal) {
    const flat = await listAllCategories({ signal }); // <— TÜM KATEGORİLER
    const t = buildCategoryTree(flat); // <— AĞAÇ
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
          console.error(e);
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
      setError("Kategori adı zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await createCategory({
        name: form.name.trim(),
        parentId: form.parentId ?? undefined,
      });
      // yeni ekleneni hemen görebilmek için ağacı tekrar dolduralım
      await loadAll();
      setForm({ name: "", parentId: null });
      alert("Kategori oluşturuldu.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Kategori oluşturulamadı.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col-lg-8">
      <h3 className="sherah-card__title py-3">Yeni Kategori</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Ad *</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Üst Kategori</label>
          {loadingTree ? (
            <div className="form-text">Kategoriler yükleniyor…</div>
          ) : treeErr ? (
            <div className="text-danger small">{treeErr}</div>
          ) : (
            <select
              className="form-select"
              value={form.parentId ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  parentId:
                    e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            >
              {options.map((o) => (
                <option key={String(o.value ?? "root")} value={o.value ?? ""}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
