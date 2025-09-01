// src/services/products/excel.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

/** Content-Disposition'dan dosya adını çek */
function parseFilename(cd?: string | null): string | null {
  if (!cd) return null;
  // ör: attachment; filename="products.xlsx"
  const m =
    /filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i.exec(cd) ||
    /filename=(.+)$/.exec(cd);
  if (!m) return null;
  try {
    const val = m[1].trim().replace(/\"/g, "");
    // RFC5987 decode
    return decodeURIComponent(val);
  } catch {
    return m[1].trim().replace(/\"/g, "");
  }
}

/** Blob'u kullanıcının tarayıcısında indirt */
function saveBlob(blob: Blob, fallbackName: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/** /api/products/excel/template -> Excel indir */
export async function downloadProductsExcelTemplate(): Promise<void> {
  const res = await api.get<Blob>("/products/excel/template", {
    responseType: "blob",
  });

  // Axios: res.headers['content-disposition']
  // fetch wrapper vb. ise (res as any).headers.get(...)
  let cd: string | null = null;
  const anyRes: any = res as any;
  cd =
    anyRes?.headers?.["content-disposition"] ??
    anyRes?.headers?.get?.("content-disposition") ??
    null;

  const filename =
    parseFilename(cd) ||
    `urunler-sablon-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const blob = (res as any).data instanceof Blob ? (res as any).data : res.data;
  saveBlob(blob, filename);
}

/** Import sonuç tipi */
export type ExcelImportError = {
  rowNumber: number;
  productCode?: string | null;
  errorMessage?: string | null;
  rowData?: string | null;
};

export type ExcelImportResult = {
  totalRows: number;
  successCount: number;
  failedCount: number;
  updatedCount: number;
  createdCount: number;
  errors: ExcelImportError[];
  success?: boolean; // backend duplicate fields
  message?: string;
};

/** /api/products/excel/import -> Excel dosyası içe aktar */
export async function importProductsExcel(
  file: File
): Promise<ExcelImportResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post<ApiEnvelope<any> | any>(
    "/products/excel/import",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  const root = (res as any)?.data ?? res;
  const payload = root?.data ?? root;

  const result: ExcelImportResult = {
    totalRows: Number(payload?.totalRows ?? 0),
    successCount: Number(payload?.successCount ?? 0),
    failedCount: Number(payload?.failedCount ?? 0),
    updatedCount: Number(payload?.updatedCount ?? 0),
    createdCount: Number(payload?.createdCount ?? 0),
    errors: Array.isArray(payload?.errors) ? payload.errors : [],
    success: !!payload?.success,
    message: payload?.message ?? root?.message ?? null,
  };

  return result;
}
