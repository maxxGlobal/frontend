// src/services/orders/downloadPdf.ts
import api from "../../lib/api";

export async function downloadOrderPdf(orderId: number) {
  const response = await api.get(`/orders/${orderId}/pdf`, {
    responseType: "blob",
  });

  // Dosya adını backend content-disposition’dan al
  const disposition = response.headers["content-disposition"];
  let filename = `order-${orderId}.pdf`;
  if (disposition) {
    const match = disposition.match(/filename="?(.+)"?/);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  // Tarayıcıda indirme başlat
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
