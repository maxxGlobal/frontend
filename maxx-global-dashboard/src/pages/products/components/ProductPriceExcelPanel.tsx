// src/pages/products/components/ProductPriceExcelPanel.tsx
import React, { useRef, useState } from "react";
import {
  importPricesFromExcel,
  downloadDealerTemplate,
  downloadImportTemplate,
  exportDealerPrices,
  type ExcelImportResult,
  type PriceExcelImportError,
} from "../../../services/product-prices/excel";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
interface Props {
  dealerId: number;
}
const MySwal = withReactContent(Swal);

export default function ProductPriceExcelPanel({ dealerId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [summary, setSummary] = useState<ExcelImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Excel indirme helper
  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleDownloadDealerTemplate() {
    try {
      const blob = await downloadDealerTemplate(dealerId);
      downloadBlob(blob, `dealer-${dealerId}-template.xlsx`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      MySwal.fire({
        icon: "error",
        title: "Bayi şablonu indirilemedi",
        text: msg,
        confirmButtonText: "Tamam",
      });
    }
  }

  async function handleDownloadImportTemplate() {
    try {
      const blob = await downloadImportTemplate();
      downloadBlob(blob, `import-template.xlsx`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      MySwal.fire({
        icon: "error",
        title: "Genel import şablonu indirilemedi",
        text: msg,
        confirmButtonText: "Tamam",
      });
    }
  }

  async function handleExport() {
    try {
      const blob = await exportDealerPrices(dealerId);
      downloadBlob(blob, `dealer-${dealerId}-prices.xlsx`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      MySwal.fire({
        icon: "error",
        title: "Fiyatlar dışa aktarılamadı",
        text: msg,
        confirmButtonText: "Tamam",
      });
    }
  }

  // Import (Excel yükleme)
  async function handleImport() {
    if (!file) {
      setErr("Lütfen bir Excel dosyası seçin.");
      return;
    }
    try {
      setUploading(true);
      setErr(null);
      const res = await importPricesFromExcel(dealerId, file);
      setSummary(res);
      MySwal.fire({
        icon: "success",
        title: "Başarılı !",
        text: "Excel başarıyla içeri aktarıldı",
        confirmButtonText: "Tamam",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr("İçe aktarma hatası: " + msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sherah-default-bg sherah-border p-3 mt-3">
      <h5>Bayi Excel İşlemleri</h5>

      {/* Import */}
      <div className="mb-3">
        <label className="form-label">Excel Yükle</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          className="form-control"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setErr(null);
            setSummary(null);
            setFile(e.target.files?.[0] ?? null);
          }}
          disabled={uploading}
        />
        {file && (
          <div className="alert alert-secondary py-2 mt-2">
            Yüklenecek dosya: <strong>{file.name}</strong>
          </div>
        )}
        {err && (
          <div className="alert alert-danger mt-2" role="alert">
            {err}
          </div>
        )}
        <button
          className="sherah-btn sherah-btn__primary bg-primary mt-2"
          onClick={handleImport}
          disabled={uploading || !file}
        >
          {uploading ? "Yükleniyor..." : "Excel'i İçe Aktar"}
        </button>
      </div>

      <h5 className="mt-5">Fiyat Şablonları</h5>
      <label className="form-label">
        Bayilere Ait Ürünlerin Fiyat Bilgileri
      </label>
      <div className="d-flex flex-wrap gap-2">
        <button
          className="sherah-btn sherah-btn sherah-btn__secondary"
          onClick={handleDownloadDealerTemplate}
          disabled={uploading}
        >
          Bayi Şablonu İndir
        </button>

        <button
          className="sherah-btn sherah-btn__primary"
          onClick={handleDownloadImportTemplate}
          disabled={uploading}
        >
          Genel Import Şablonu
        </button>

        <button
          className="sherah-btn sherah-btn__third"
          onClick={handleExport}
          disabled={uploading}
        >
          Bayi Fiyatlarını Dışa Aktar
        </button>
      </div>
    </div>
  );
}
