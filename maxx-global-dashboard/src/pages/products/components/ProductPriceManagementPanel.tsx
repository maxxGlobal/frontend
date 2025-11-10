// src/pages/products/components/ProductPriceManagementPanel.tsx
import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { listSimpleDealers } from "../../../services/dealers/listSimple";
import {
  listSimpleProducts,
  type SimpleProduct,
} from "../../../services/products/listSimple";
import {
  downloadDealerTemplate,
  downloadImportTemplate,
  importPricesFromExcel,
  validatePriceExcel,
  downloadBlob,
  type ExcelImportResult,
} from "../../../services/product-prices/excel";
import {
  getDealerProductVariants,
  updateDealerProductVariants,
  type DealerProductVariantResponse,
} from "../../../services/product-prices/variants";

const MySwal = withReactContent(Swal);

export default function ProductPriceManagementPanel() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantMeta, setVariantMeta] =
    useState<DealerProductVariantResponse | null>(null);
  const [variantForm, setVariantForm] = useState<
    Array<{
      variantId: number;
      variantSku: string;
      variantSize: string | null;
      prices: Array<{ currency: string; amount: string }>;
    }>
  >([]);
  const [savingVariants, setSavingVariants] = useState(false);
  const [variantsError, setVariantsError] = useState<string | null>(null);

  // Import state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExcelImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Options
  const [updateExisting, setUpdateExisting] = useState(true); 
  const [skipErrors] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  // İlk yükleme kontrolü için ref
  const didFetch = useRef(false);

  useEffect(() => {
    // StrictMode'daki ikinci tetiklemeyi önler
    if (didFetch.current) return;
    didFetch.current = true;
    void loadInitialData();
  }, []);

  async function loadInitialData() {
    await Promise.allSettled([loadDealers(), loadProducts()]);
  }

  useEffect(() => {
    if (!selectedDealerId || !selectedProductId) {
      setVariantMeta(null);
      setVariantForm([]);
      setVariantsError(null);
      return;
    }

    void fetchDealerVariants(selectedProductId, selectedDealerId);
  }, [selectedDealerId, selectedProductId]);

  async function loadDealers() {
    try {
      const dealerList = await listSimpleDealers();
      setDealers(dealerList);
    } catch (e: any) {
      MySwal.fire("Hata", "Bayiler yüklenemedi", "error");
    }
  }

  async function loadProducts() {
    try {
      const productList = await listSimpleProducts();
      setProducts(productList);
    } catch (e: any) {
      MySwal.fire("Hata", "Ürünler yüklenemedi", "error");
    }
  }

  async function fetchDealerVariants(productId: number, dealerId: number) {
    try {
      setVariantsLoading(true);
      setVariantsError(null);
      const response = await getDealerProductVariants(productId, dealerId);
      setVariantMeta(response);
      const normalized = response.variants.map((variant) => ({
        variantId: variant.variantId,
        variantSku: variant.variantSku,
        variantSize: variant.variantSize ?? null,
        prices: (variant.prices && variant.prices.length
          ? variant.prices
          : [
              {
                currency: "TRY",
                amount: null,
              },
            ]
        ).map((price) => ({
          currency: price.currency,
          amount:
            price.amount !== null && price.amount !== undefined
              ? price.amount.toString()
              : "",
        })),
      }));
      setVariantForm(normalized);
    } catch (e: any) {
      setVariantsError(e.message || "Varyantlar yüklenemedi");
      setVariantMeta(null);
      setVariantForm([]);
    } finally {
      setVariantsLoading(false);
    }
  }

  function handleVariantPriceChange(
    variantId: number,
    priceIndex: number,
    value: string
  ) {
    setVariantForm((prev) =>
      prev.map((variant) => {
        if (variant.variantId !== variantId) return variant;
        const updatedPrices = variant.prices.map((price, index) =>
          index === priceIndex ? { ...price, amount: value } : price
        );
        return { ...variant, prices: updatedPrices };
      })
    );
  }

  async function handleSaveVariantPrices() {
    if (!selectedDealerId || !selectedProductId) {
      MySwal.fire("Uyarı", "Lütfen bayi ve ürün seçin", "warning");
      return;
    }

    const payload = {
      variants: variantForm.map((variant) => ({
        variantId: variant.variantId,
        prices: variant.prices
          .filter(
            (price) =>
              price.amount !== "" && !Number.isNaN(Number(price.amount))
          )
          .map((price) => ({
            currency: price.currency,
            amount: Number(price.amount),
            validFrom: new Date().toISOString(),
            validUntil: null,
            isActive: true,
          })),
      })),
    };

    const hasAnyPrice = payload.variants.some(
      (variant) => variant.prices.length > 0
    );

    if (!hasAnyPrice) {
      MySwal.fire(
        "Uyarı",
        "Lütfen kaydetmek için en az bir varyant fiyatı girin",
        "warning"
      );
      return;
    }

    try {
      setSavingVariants(true);
      const response = await updateDealerProductVariants(
        selectedProductId,
        selectedDealerId,
        payload
      );
      setVariantMeta(response);
      const normalized = response.variants.map((variant) => ({
        variantId: variant.variantId,
        variantSku: variant.variantSku,
        variantSize: variant.variantSize ?? null,
        prices: (variant.prices && variant.prices.length
          ? variant.prices
          : [
              {
                currency: "TRY",
                amount: null,
              },
            ]
        ).map((price) => ({
          currency: price.currency,
          amount:
            price.amount !== null && price.amount !== undefined
              ? price.amount.toString()
              : "",
        })),
      }));
      setVariantForm(normalized);
      MySwal.fire("Başarılı", "Varyant fiyatları güncellendi", "success");
    } catch (e: any) {
      MySwal.fire(
        "Hata",
          "Varyant fiyatları güncellenemedi. En az bir fiyat girin.",
        "error"
      );
    } finally {
      setSavingVariants(false);
    }
  }

  // Template indirme (bayi seçili olmalı)
  async function handleDownloadDealerTemplate() {
    if (!selectedDealerId) {
      MySwal.fire("Uyarı", "Lütfen bir bayi seçin", "warning");
      return;
    }

    try {
      setLoading(true);
      const blob = await downloadDealerTemplate(selectedDealerId);
      downloadBlob(blob, `bayi_${selectedDealerId}_fiyat_sablonu.xlsx`);

      MySwal.fire({
        icon: "success",
        title: "Şablon İndirildi",
        text: "Bayi fiyat şablonu başarıyla indirildi (mevcut fiyatlarla dolu)",
        confirmButtonText: "Tamam",
      });
    } catch (e: any) {
      MySwal.fire({
        icon: "error",
        title: "Hata",
        text: e.message,
        confirmButtonText: "Tamam",
      });
    } finally {
      setLoading(false);
    }
  }

  // Genel şablon indirme
  async function handleDownloadImportTemplate() {
    try {
      setLoading(true);
      const blob = await downloadImportTemplate();
      downloadBlob(blob, "fiyat_import_sablonu.xlsx");

      MySwal.fire({
        icon: "success",
        title: "Şablon İndirildi",
        text: "Genel import şablonu başarıyla indirildi",
        confirmButtonText: "Tamam",
      });
    } catch (e: any) {
      MySwal.fire({
        icon: "error",
        title: "Hata",
        text: e.message,
        confirmButtonText: "Tamam",
      });
    } finally {
      setLoading(false);
    }
  }

  // Export
  // async function handleExportDealerPrices() {
  //   if (!selectedDealerId) {
  //     MySwal.fire("Uyarı", "Lütfen bir bayi seçin", "warning");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const blob = await exportDealerPrices(selectedDealerId, activeOnly);
  //     downloadBlob(blob, `bayi_${selectedDealerId}_fiyatlar.xlsx`);

  //     MySwal.fire({
  //       icon: "success",
  //       title: "Export Başarılı",
  //       text: "Bayi fiyatları başarıyla dışa aktarıldı",
  //       confirmButtonText: "Tamam",
  //     });
  //   } catch (e: any) {
  //     MySwal.fire({
  //       icon: "error",
  //       title: "Export Hatası",
  //       text: e.message,
  //       confirmButtonText: "Tamam",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // Import işlemi
  async function handleImport(isValidation = false) {
    if (!selectedDealerId) {
      MySwal.fire("Uyarı", "Lütfen bir bayi seçin", "warning");
      return;
    }

    if (!file) {
      setError("Lütfen bir Excel dosyası seçin.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUpdateExisting(true);

      const res = isValidation
        ? await validatePriceExcel(selectedDealerId, file)
        : await importPricesFromExcel(
            selectedDealerId,
            file,
            updateExisting,
            skipErrors
          );

      setResult(res);

      if (!isValidation && res.success !== false) {
        MySwal.fire({
          icon: "success",
          title: "Import Başarılı!",
          text: `${res.successCount} fiyat başarıyla işlendi (${res.createdCount} yeni, ${res.updatedCount} güncellenen)`,
          confirmButtonText: "Tamam",
        });

        // Dosya inputunu temizle
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (e: any) {
      setError("İşlem hatası: " + e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="row align-items-center mb-4">
        <div className="col-12">
          <h3 className="sherah-card__title py-3">
            <i className="fa-solid fa-file-excel me-2"></i>
            Ürün Fiyat Yönetimi (Excel)
          </h3>
          <p className="text-muted">
            Tüm fiyat işlemlerini Excel üzerinden yönetin. Esnek para birimi
            desteği - sadece doldurduğunuz kurları işler.
          </p>
        </div>
      </div>

      {/* Bayi Seçimi */}
      <div className="sherah-default-bg sherah-border p-4 mb-4">
        <h5>
          <i className="fa-solid fa-store me-2"></i>
          Bayi Seçimi
        </h5>
        <div className="row mt-3">
          <div className="col-md-6">
            <label className="form-label">
              Çalışmak istediğiniz bayi seçin
            </label>
            <Select
              options={dealers.map((d) => ({ value: d.id, label: d.name }))}
              value={
                selectedDealerId
                  ? dealers
                      .map((d) => ({ value: d.id, label: d.name }))
                      .find((opt) => opt.value === selectedDealerId) || null
                  : null
              }
              onChange={(opt) => {
                setSelectedDealerId(opt?.value || null);
                setSelectedProductId(null);
                setVariantMeta(null);
                setVariantForm([]);
                setVariantsError(null);
                setFile(null);
                setResult(null);
                setError(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              placeholder="Bayi seçin..."
              isClearable
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Ürün Seçin</label>
            <Select
              options={products.map((product) => ({
                value: product.id,
                label: `${product.name} (${product.code})`,
              }))}
              value={
                selectedProductId
                  ? products
                      .map((product) => ({
                        value: product.id,
                        label: `${product.name} (${product.code})`,
                      }))
                      .find((opt) => opt.value === selectedProductId) || null
                  : null
              }
              onChange={(opt) => {
                const productId = opt?.value || null;
                setSelectedProductId(productId);
                setVariantMeta(null);
                setVariantForm([]);
                setVariantsError(null);
                if (productId && selectedDealerId) {
                  void fetchDealerVariants(productId, selectedDealerId);
                }
              }}
              placeholder="Ürün seçin..."
              isClearable
              isDisabled={!selectedDealerId}
            />
          </div>
        </div>
      </div>

      {selectedDealerId && selectedProductId && (
        <div className="sherah-default-bg sherah-border p-4 mb-4">
          <h5 className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-tags"></i>
            Varyant Fiyatları
          </h5>
          {variantMeta && (
            <p className="text-muted mb-3">
              {variantMeta.productName} - {variantMeta.dealerName}
            </p>
          )}
          {variantsLoading ? (
            <div className="text-center py-4">
              <i className="fa-solid fa-spinner fa-spin fa-2x text-primary"></i>
              <p className="mt-2">Varyant fiyatları yükleniyor...</p>
            </div>
          ) : variantsError ? (
            <div className="alert alert-danger" role="alert">
              <i className="fa-solid fa-triangle-exclamation me-2"></i>
              {variantsError}
            </div>
          ) : variantForm.length === 0 ? (
            <div className="alert alert-info" role="alert">
              Bu ürüne ait varyant bulunamadı.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Varyant Kodu</th>
                      <th>Varyant Boyutu</th>
                      <th>Fiyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantForm.map((variant) => (
                      <tr key={variant.variantId}>
                        <td>
                          <strong>{variant.variantSku}</strong>
                        </td>
                        <td>{variant.variantSize ?? "-"}</td>
                        <td>
                          <div className="d-flex flex-column gap-2">
                            {variant.prices.map((price, index) => (
                              <div
                                className="d-flex align-items-center gap-2"
                                key={`${variant.variantId}-${price.currency}-${index}`}
                              >
                                <span className="badge bg-secondary">
                                  {price.currency}
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control"
                                  value={price.amount}
                                  onChange={(event) =>
                                    handleVariantPriceChange(
                                      variant.variantId,
                                      index,
                                      event.target.value
                                    )
                                  }
                                  placeholder="Fiyat girin"
                                />
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className="sherah-btn sherah-btn__primary"
                  onClick={handleSaveVariantPrices}
                  disabled={savingVariants}
                >
                  {savingVariants ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk me-2"></i>
                      Varyant Fiyatlarını Kaydet
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Şablon & Export */}
      <div className="sherah-default-bg sherah-border p-4 mb-4">
        <h5>
          <i className="fa-solid fa-download me-2"></i>
          Şablon & Export İşlemleri
        </h5>
        <div className="row mt-3">
          <div className="col-md-8">
            <div className="d-flex flex-wrap gap-3">
              <button
                className="sherah-btn sherah-btn__primary"
                onClick={handleDownloadDealerTemplate}
                disabled={loading || !selectedDealerId}
                title="Seçili bayinin mevcut fiyatları dolu olarak gelir"
              >
                <i className="fa-solid fa-file-excel me-2"></i>
                {loading ? "İndiriliyor..." : "Bayi Şablonu (Dolu)"}
              </button>

              <button
                className="sherah-btn sherah-btn__secondary"
                onClick={handleDownloadImportTemplate}
                disabled={loading}
                title="Genel boş şablon - talimatlar içerir"
              >
                <i className="fa-solid fa-file-arrow-down me-2"></i>
                {loading ? "İndiriliyor..." : "Genel Şablon (Boş)"}
              </button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="activeOnly"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="activeOnly">
                Sadece aktif fiyatları dışa aktar
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="sherah-default-bg sherah-border p-4">
        <h5>
          <i className="fa-solid fa-upload me-2"></i>
          Excel Import İşlemi
        </h5>

        {!selectedDealerId && (
          <div className="alert alert-warning">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            Import işlemi için önce bir bayi seçmelisiniz.
          </div>
        )}

        <div className="row mt-3">
          <div className="col-md-6">
            <label className="form-label">Excel Dosyası Seç</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="form-control"
              onChange={(e) => {
                setError(null);
                setResult(null);
                setFile(e.target.files?.[0] ?? null);
              }}
              disabled={uploading || !selectedDealerId}
            />
            {file && (
              <div className="alert alert-info py-2 mt-2">
                <i className="fa-solid fa-file-excel me-2"></i>
                Seçilen dosya: <strong>{file.name}</strong>
              </div>
            )}
          </div> 
        </div>

        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            {error}
          </div>
        )}

        <div className="d-flex gap-3 mt-3">
          <button
            className="sherah-btn sherah-btn__primary bg-primary"
            onClick={() => handleImport(false)}
            disabled={uploading || !file || !selectedDealerId}
          >
            {uploading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin me-2"></i>
                İçe Aktarılıyor...
              </>
            ) : (
              <>
                <i className="fa-solid fa-upload me-2"></i>
                Excel'i İçe Aktar
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fa-solid fa-chart-line me-2"></i>
                  İşlem Özeti
                </h6>
                <span
                  className={`badge ${
                    result.success !== false ? "bg-success" : "bg-warning"
                  }`}
                >
                  {result.success !== false ? "Başarılı" : "Uyarılar Var"}
                </span>
              </div>
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-6 col-lg-2">
                    <div className="text-center p-2 bg-light rounded">
                      <h5 className="text-primary mb-1">{result.totalRows}</h5>
                      <small className="text-muted">Toplam Satır</small>
                    </div>
                  </div>
                  <div className="col-6 col-lg-2">
                    <div className="text-center p-2 bg-light rounded">
                      <h5 className="text-success mb-1">
                        {result.successCount}
                      </h5>
                      <small className="text-muted">Başarılı</small>
                    </div>
                  </div>
                  <div className="col-6 col-lg-2">
                    <div className="text-center p-2 bg-light rounded">
                      <h5 className="text-info mb-1">{result.createdCount}</h5>
                      <small className="text-muted">Yeni</small>
                    </div>
                  </div>
                  <div className="col-6 col-lg-2">
                    <div className="text-center p-2 bg-light rounded">
                      <h5 className="text-warning mb-1">
                        {result.updatedCount}
                      </h5>
                      <small className="text-muted">Güncellenen</small>
                    </div>
                  </div>
                  <div className="col-6 col-lg-2">
                    <div className="text-center p-2 bg-light rounded">
                      <h5 className="text-danger mb-1">{result.failedCount}</h5>
                      <small className="text-muted">Başarısız</small>
                    </div>
                  </div>
                </div>

                {result.message && (
                  <div className="alert alert-info">
                    <strong>Durum:</strong> {result.message}
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-3">
                    <h6>
                      <i className="fa-solid fa-exclamation-triangle text-warning me-2"></i>
                      Hatalar ({result.errors.length})
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-striped table-bordered">
                        <thead className="table-dark">
                          <tr>
                            <th style={{ width: 60 }}>Satır</th>
                            <th style={{ width: 120 }}>Ürün Kodu</th>
                            <th style={{ width: 200 }}>Hata Açıklaması</th>
                            <th>Ham Veri</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.errors.slice(0, 10).map((error, i) => (
                            <tr key={i}>
                              <td className="text-center">{error.rowNumber}</td>
                              <td>{error.productCode || "-"}</td>
                              <td>{error.errorMessage}</td>
                              <td
                                className="text-truncate"
                                style={{ maxWidth: "300px" }}
                                title={error.rowData || ""}
                              >
                                {error.rowData}
                              </td>
                            </tr>
                          ))}
                          {result.errors.length > 10 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center text-muted"
                              >
                                ... ve {result.errors.length - 10} hata daha
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
