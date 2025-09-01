// src/pages/products/components/ImportProductsModal.tsx
import React, { useState } from "react";
import {
  downloadProductsExcelTemplate,
  importProductsExcel,
  type ExcelImportResult,
} from "../../../services/products/excel";

type Props = {
  onClose: () => void;
  onImported?: (summary: ExcelImportResult) => void; // başarıdan sonra listeyi refresh etmen için
};

export default function ImportProductsModal({ onClose, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [summary, setSummary] = useState<ExcelImportResult | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErr(null);
    setSummary(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const onDownloadTemplate = async () => {
    try {
      setErr(null);
      setBusy(true);
      await downloadProductsExcelTemplate();
    } catch (e: any) {
      setErr(e?.message || "Şablon indirilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const onImport = async () => {
    if (!file) {
      setErr("Lütfen bir Excel dosyası seçin.");
      return;
    }
    try {
      setErr(null);
      setBusy(true);
      const res = await importProductsExcel(file);
      setSummary(res);
      onImported?.(res);
    } catch (e: any) {
      setErr(
        e?.response?.data?.message || e?.message || "İçe aktarma başarısız."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Excel İçeri Aktar</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="d-flex gap-2 align-items-center mb-3">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={onDownloadTemplate}
                  disabled={busy}
                >
                  Şablonu İndir
                </button>

                <div className="ms-auto" />

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="form-control form-control-sm"
                  onChange={onPick}
                  disabled={busy}
                />
              </div>

              {file && (
                <div className="alert alert-secondary py-2">
                  Yüklenecek dosya: <strong>{file.name}</strong>
                </div>
              )}

              {err && (
                <div className="alert alert-danger" role="alert">
                  {err}
                </div>
              )}

              {summary && (
                <div className="mt-3">
                  <h6>Özet</h6>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      Toplam Satır: <strong>{summary.totalRows}</strong>
                    </li>
                    <li className="list-group-item">
                      Başarılı: <strong>{summary.successCount}</strong>
                    </li>
                    <li className="list-group-item">
                      Başarısız: <strong>{summary.failedCount}</strong>
                    </li>
                    <li className="list-group-item">
                      Güncellenen: <strong>{summary.updatedCount}</strong>
                    </li>
                    <li className="list-group-item">
                      Oluşturulan: <strong>{summary.createdCount}</strong>
                    </li>
                  </ul>

                  {summary.errors?.length > 0 && (
                    <>
                      <h6 className="mt-3">
                        Hatalar ({summary.errors.length})
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-striped align-middle">
                          <thead>
                            <tr>
                              <th># Satır</th>
                              <th>Ürün Kodu</th>
                              <th>Hata</th>
                              <th>Ham Satır</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.errors.map((e, i) => (
                              <tr key={i}>
                                <td>{e.rowNumber}</td>
                                <td>{e.productCode || "-"}</td>
                                <td>{e.errorMessage || "-"}</td>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: 420 }}
                                >
                                  {e.rowData || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-light"
                onClick={onClose}
                disabled={busy}
              >
                Kapat
              </button>
              <button
                className="btn btn-success"
                onClick={onImport}
                disabled={busy || !file}
              >
                {busy ? "Yükleniyor…" : "İçe Aktar"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
