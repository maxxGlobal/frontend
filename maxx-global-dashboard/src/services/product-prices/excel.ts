// src/services/product-prices/excel.ts
import api from "../../lib/api"; 

/** Tekil hata satırı - mevcut yapınıza uygun */
export type PriceExcelImportError = {
  rowNumber: number;
  productCode?: string | null;
  errorMessage?: string | null;
  rowData?: string | null;
};

/** Import özeti - mevcut yapınıza uygun */
export type ExcelImportResult = {
  totalRows: number;
  successCount: number;
  failedCount: number;
  updatedCount: number;
  createdCount: number;
  errors: PriceExcelImportError[];
  success?: boolean;
  message?: string;
};

/**
 * Excel'den fiyat içe aktarımı
 * Backend endpoint: POST /api/products/excel/import (ProductExcelController'da)
 */
export async function importPricesFromExcel(
  dealerId: number,
  file: File,
  updateExisting: boolean = true,
  skipErrors: boolean = false,
  opts?: { signal?: AbortSignal }
): Promise<ExcelImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("updateExisting", updateExisting.toString());
  formData.append("skipErrors", skipErrors.toString());

  const res = await api.post(
    `/product-prices/excel/import/${dealerId}`, // Backend endpoint'inize uygun
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal: opts?.signal,
    }
  );

  return res.data.data; // BaseResponse<ProductImportResult> yapısından data'yı al
}

/**
 * Bayi özel şablon indir
 * Backend'de ProductPriceExcelService.generatePriceTemplate method'u kullanılacak
 */
export async function downloadDealerTemplate(
  dealerId: number,
  opts?: { signal?: AbortSignal }
): Promise<Blob> {
  const res = await api.get(`/product-prices/excel/template/${dealerId}`, {
    responseType: "blob",
    signal: opts?.signal,
  });
  return res.data;
}

/**
 * Genel import şablonu indir
 * Backend'de ProductPriceExcelService.generateImportTemplate method'u kullanılacak
 */
export async function downloadImportTemplate(opts?: {
  signal?: AbortSignal;
}): Promise<Blob> {
  const res = await api.get(`/product-prices/excel/import-template`, {
    responseType: "blob",
    signal: opts?.signal,
  });
  return res.data;
}

/**
 * Bayi fiyatlarını Excel'e export et
 * Backend'de ProductPriceExcelService.exportDealerPrices method'u kullanılacak
 */
export async function exportDealerPrices(
  dealerId: number,
  activeOnly: boolean = true,
  opts?: { signal?: AbortSignal }
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append("activeOnly", activeOnly.toString());

  const res = await api.get(
    `/product-prices/excel/dealer/${dealerId}/export?${params}`, 
    {
      responseType: "blob",
      signal: opts?.signal,
    }
  );
  return res.data;
}

/**
 * Fiyat Excel dosyasını doğrula
 * Backend'de validation endpoint'i gerekecek
 */
export async function validatePriceExcel(
  dealerId: number,
  file: File,
  opts?: { signal?: AbortSignal }
): Promise<ExcelImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/product-prices/excel/dealer/${dealerId}/validate`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal: opts?.signal,
    }
  );

  return res.data.data;
}

/**
 * Helper function: Blob'u dosya olarak indir
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}