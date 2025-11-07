// src/services/products/excel.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

function parseFilename(cd?: string | null): string | null {
  if (!cd) return null;
  const m =
    /filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i.exec(cd) ||
    /filename=(.+)$/.exec(cd);
  if (!m) return null;
  try {
    const val = m[1].trim().replace(/\"/g, "");
    return decodeURIComponent(val);
  } catch {
    return m[1].trim().replace(/\"/g, "");
  }
}

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

export async function downloadProductsExcelTemplate(): Promise<void> {
  const res = await api.get<Blob>("/products/excel/template", {
    responseType: "blob",
  });

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
  success?: boolean;
  message?: string | null;
};

/** Örn. "Satır 10: Kategori bulunamadı: Omuz Artroskopi" -> {rowNumber:10, errorMessage:"Kategori bulunamadı: Omuz Artroskopi"} */
function parseServerErrorMessage(msg?: string | null): ExcelImportError | null {
  if (!msg) return null;

  // En çok görülen Türkçe kalıp
  let m = msg.match(/sat[ıi]r\s+(\d+)/i);
  if (m) {
    const row = Number(m[1]);
    // "Satır 10:" sonrasını kırp
    const after = msg.split(/sat[ıi]r\s+\d+\s*:\s*/i)[1] ?? msg;
    return {
      rowNumber: Number.isFinite(row) ? row : 0,
      productCode: null,
      errorMessage: after?.trim() || msg,
      rowData: null,
    };
  }

  // İngilizce olasılığı: "Row 10: ..."
  m = msg.match(/\brow\s+(\d+)\b/i);
  if (m) {
    const row = Number(m[1]);
    const after = msg.split(/\brow\s+\d+\s*:\s*/i)[1] ?? msg;
    return {
      rowNumber: Number.isFinite(row) ? row : 0,
      productCode: null,
      errorMessage: after?.trim() || msg,
      rowData: null,
    };
  }

  // Hiç yakalayamazsak genel hata
  return {
    rowNumber: 0,
    productCode: null,
    errorMessage: msg,
    rowData: null,
  };
}

/** /api/products/excel/import -> Excel dosyası içe aktar */
export async function importProductsExcel(file: File): Promise<ExcelImportResult> {
  const form = new FormData();
  form.append("file", file);

  try {
    const res = await api.post<ApiEnvelope<any> | any>(
      "/products/excel/import",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const root: any = (res as any)?.data ?? res;
    const payload = root?.data ?? root;

    // Backend "success:false" + sadece message döndürdüyse
    if (root && root.success === false) {
      const parsed = parseServerErrorMessage(root.message);
      return {
        totalRows: Number(payload?.totalRows ?? 0),
        successCount: 0,
        failedCount: parsed ? 1 : Number(payload?.failedCount ?? 1),
        updatedCount: 0,
        createdCount: 0,
        errors: parsed ? [parsed] : [],
        success: false,
        message: root.message ?? null,
      };
    }

    // Normal başarı ya da kısmi başarı yolu
    return {
      totalRows: Number(payload?.totalRows ?? 0),
      successCount: Number(payload?.successCount ?? 0),
      failedCount: Number(payload?.failedCount ?? 0),
      updatedCount: Number(payload?.updatedCount ?? 0),
      createdCount: Number(payload?.createdCount ?? 0),
      errors: Array.isArray(payload?.errors) ? payload.errors : [],
      success: !!(payload?.success ?? root?.success ?? true),
      message: payload?.message ?? root?.message ?? null,
    };
  } catch (err: any) {
    // Axios error.response?.data zarfı varsa yine derle
    const root = err?.response?.data ?? err?.data ?? err;
    const message: string | null =
      root?.message ??
      root?.error ??
      (typeof err?.message === "string" ? err.message : null);

    const parsed = parseServerErrorMessage(message);

    return {
      totalRows: 0,
      successCount: 0,
      failedCount: parsed ? 1 : 1,
      updatedCount: 0,
      createdCount: 0,
      errors: parsed ? [parsed] : (message ? [{ rowNumber: 0, errorMessage: message }] : []),
      success: false,
      message: message,
    };
  }
}
