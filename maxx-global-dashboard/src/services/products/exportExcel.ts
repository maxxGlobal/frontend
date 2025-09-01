// src/services/products/exportExcel.ts
import api from "../../lib/api";

export async function exportProductsToExcel(): Promise<Blob> {
  const res = await api.get("/products/excel/export", {
    responseType: "blob", // dosya indirme için önemli
  });
  return res.data as Blob;
}
