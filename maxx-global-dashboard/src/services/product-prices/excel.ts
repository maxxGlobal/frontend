// src/services/product-prices/excel.ts
import api from "../../lib/api";

/** Tekil hata satırı */
export type PriceExcelImportError = {
  rowNumber: number;
  productCode?: string | null;
  errorMessage?: string | null;
  rowData?: string | null;
};

/** Import özeti */
export type ExcelImportResult = {
  totalRows: number;
  successCount: number;
  failedCount: number;
  updatedCount: number;
  createdCount: number;
  errors: PriceExcelImportError[];
};

/** Excel'den fiyat içe aktarımı */
export async function importPricesFromExcel(
  dealerId: number,
  file: File,
  opts?: { signal?: AbortSignal }
): Promise<ExcelImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/product-prices/excel/import/${dealerId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal: opts?.signal,
    }
  );

  // Backend bu şekle yakın bir özet dönmeli; yoksa mapping yapabilirsin.
  return res.data as ExcelImportResult;
}

/** Bayi özel şablon indir */
export async function downloadDealerTemplate(
  dealerId: number,
  opts?: { signal?: AbortSignal }
): Promise<Blob> {
  const res = await api.get(`/product-prices/excel/template/${dealerId}`, {
    responseType: "blob",
    signal: opts?.signal,
  });
  return res.data as Blob;
}

/** Genel import şablonu indir */
export async function downloadImportTemplate(opts?: {
  signal?: AbortSignal;
}): Promise<Blob> {
  const res = await api.get(`/product-prices/excel/import-template`, {
    responseType: "blob",
    signal: opts?.signal,
  });
  return res.data as Blob;
}

/** Bayi fiyatlarını Excel'e export et */
export async function exportDealerPrices(
  dealerId: number,
  opts?: { signal?: AbortSignal }
): Promise<Blob> {
  const res = await api.get(`/product-prices/excel/export/${dealerId}`, {
    responseType: "blob",
    signal: opts?.signal,
  });
  return res.data as Blob;
}
