// src/pages/products/ProductDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ProductGallery from "../products/components/ProductGallery";
import { getProductById } from "../../services/products/getById";
import { useTranslation } from "react-i18next";

import type { ProductDetail } from "../../services/products/getById";

function capitalize(str: string = ""): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ProductDetails() {
  const { t } = useTranslation();
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);

      const idNum = Number(idParam);
      if (!Number.isFinite(idNum) || idNum <= 0) {
        setErr("Geçersiz ürün numarası.");
        setLoading(false);
        return;
      }

      try {
        const p = await getProductById(idNum, { signal: controller.signal });
        setProduct(p);
        setLoading(false); // ✅ sadece successte
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setErr("Ürün detayı yüklenemedi.");
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [idParam]);

  const variants = product?.variants ?? [];

  const stockInfo = useMemo(() => {
    if (!product) {
      return { isInStock: false, text: "Stok bilgisi mevcut değil" };
    }

    const variantStockValues = variants
      .map((variant) => variant.stockQuantity)
      .filter(
        (qty): qty is number => qty !== null && qty !== undefined && !Number.isNaN(qty)
      );

    if (variantStockValues.length > 0) {
      const total = variantStockValues.reduce((acc, qty) => acc + qty, 0);
      return {
        isInStock: total > 0,
        text: total > 0 ? `${total} adet stokta` : "Stok yok",
      };
    }

    const fallbackStockQuantity =
      product.stockQuantity !== undefined ? product.stockQuantity : null;
    const fallbackInStock =
      typeof product.isInStock === "boolean"
        ? product.isInStock
        : fallbackStockQuantity != null
          ? fallbackStockQuantity > 0
          : false;

    if (fallbackStockQuantity != null) {
      return {
        isInStock: fallbackInStock,
        text: fallbackInStock
          ? `${fallbackStockQuantity} adet stokta`
          : "Stok yok",
      };
    }

    return {
      isInStock: fallbackInStock,
      text: fallbackInStock ? "Stokta" : "Stok yok",
    };
  }, [product, variants]);

  const statusBadge = useMemo(() => {
    if (!product) return null;
    const statusTr =
      (product as any).status ?? (product.isActive ? "AKTİF" : "SİLİNDİ");
    const isActive = statusTr === "AKTİF";
    return (
      <span className={`badge ${isActive ? "bg-success" : "bg-danger"}`}>
        {isActive ? "Aktif" : "Silinmiş"}
      </span>
    );
  }, [product]);

  // 1) Yükleniyorsa spinner
  if (loading) {
    return (
      <div className="sherah-dsinner">
        <div className="text-center vh-100 d-flex justify-content-center align-items-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor</span>
          </div>
        </div>
      </div>
    );
  }

  // 2) Hata varsa
  if (err) {
    return (
      <div className="sherah-dsinner">
        <div className="alert alert-warning mt-4">{err}</div>
        <button className="btn btn-light mt-3" onClick={() => navigate(-1)}>
          Geri
        </button>
      </div>
    );
  }

  // 3) Product bulunamadıysa
  if (!product) {
    return (
      <div className="sherah-dsinner">
        <div className="alert alert-warning mt-4">Ürün bulunamadı.</div>
        <button className="btn btn-light mt-3" onClick={() => navigate(-1)}>
          Geri
        </button>
      </div>
    );
  }

  // 4) Buradan sonrası: product garanti var (! kullandım)
  return (
    <div className="sherah-dsinner">
      <div className="row mg-top-30">
        <div className="col-12 sherah-flex-between">
          <div className="sherah-breadcrumb">
            <h2 className="sherah-breadcrumb__title">Ürün Detayı</h2>
            <ul className="sherah-breadcrumb__list">
              <li>
                <Link to="/">Ana Sayfa</Link>
              </li>
              <li className="active">
                <Link to="/product">Ürünler</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="product-detail-body sherah-default-bg sherah-border mg-top-30">
        <div className="row">
          <div className="col-lg-6 col-md-6 col-12">
            <ProductGallery
              name={product!.name}
              images={product!.images?.map((x) => ({
                id: x.id,
                url: x.imageUrl,
                isPrimary: x.isPrimary,
              }))}
              primaryImageUrl={
                product!.primaryImageUrl ??
                (product!.images?.find((i) => i.isPrimary)?.imageUrl ||
                  product!.images?.[0]?.imageUrl) ??
                null
              }
            />
          </div>

          {/* Right content */}
          <div className="col-lg-6 col-md-6 col-12">
            <div className="product-detail-body__content">
              <h2 className="product-detail-body__title mb-2">
                {product!.name}{" "}
              </h2>
              <p className="product-detail-body__stats">{statusBadge}</p>
              <p
                className={`product-detail-body__stock mt-3 ${stockInfo.isInStock ? "sherah-color3" : "text-danger"
                  }`}
              >
                {stockInfo.text}
              </p>

              <div className="sherah-products-meta">
                <ul className="sherah-products-meta__list mt-2">
                  <li>
                    <span className="p-list-title fw-bold">SKU :</span>{" "}
                    {product!.serialNumber || "-"}
                  </li>
                  <li>
                    <span className="p-list-title fw-bold">Kategori :</span>{" "}
                    {product!.categoryName || "-"}
                  </li>
                  <li>
                    <span className="p-list-title fw-bold">Birim :</span>{" "}
                    {product!.unit || "-"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="product-detail-body sherah-default-bg sherah-border mg-top-30">
        <div className="row">
          <div className="col-12">
            <div className="sherah-product-tabs mg-btm-30">
              <div
                className="sherah-product-tabs__list list-group"
                id="list-tab"
                role="tablist"
              >
                <a
                  className="list-group-item active"
                  data-bs-toggle="list"
                  href="#p_tab_1"
                  role="tab"
                >
                  Özellikler
                </a>
                <a
                  className="list-group-item"
                  data-bs-toggle="list"
                  href="#p_tab_2"
                  role="tab"
                >
                  Özet
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* içerikler */}
        <div className="row">
          <div className="col-12">
            <div className="tab-content" id="nav-tabContent">
              <div
                className="tab-pane fade show active"
                id="p_tab_1"
                role="tabpanel"
              >
                <div className="sherah-product-tabs__text">
                  <p>
                    {product!.description || "Ürün açıklaması mevcut değil."}
                  </p>
                </div>

                <div className="sherah-table p-0">
                  <table className="product-overview-table mg-top-30">
                    <tbody>
                      <tr>
                        <td>Malzeme</td>
                        <td>{product!.material || "-"}</td>
                      </tr>
                      {variants.length === 0 ? (
                        <tr>
                          <td>Boyut</td>
                          <td>{product!.size || "-"}</td>
                        </tr>
                      ) : null}
                      <tr>
                        <td>Çap</td>
                        <td>{product!.diameter || "-"}</td>
                      </tr>
                      <tr>
                        <td>Renk </td>
                        <td>
                          {t(
                            `colors.${(product as any).color?.toLowerCase()}`,
                            {
                              defaultValue: capitalize((product as any).color),
                            }
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Yüzey İşlemi</td>
                        <td>{product!.surfaceTreatment || "-"}</td>
                      </tr>
                      <tr>
                        <td>Medikal Cihaz Sınıfı</td>
                        <td>{product!.medicalDeviceClass || "-"}</td>
                      </tr>
                      <tr>
                        <td>Regülasyon No</td>
                        <td>{product!.regulatoryNumber || "-"}</td>
                      </tr>
                      <tr>
                        <td>Üretim Tarihi</td>
                        <td>{product!.manufacturingDate || "-"}</td>
                      </tr>
                      <tr>
                        <td>Son Kullanma</td>
                        <td>{product!.expiryDate || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {variants.length > 0 && (
                  <div className="mt-4"> 
                    <div className="sherah-table p-0">
                      <table className="product-overview-table">
                        <thead>
                          <tr>
                            <th>Boyut</th>
                            <th>Barkod No</th>
                            <th>Stok Durumu</th>
                            <th>Durum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((variant, index) => {
                            const stockText =
                              variant.stockQuantity != null
                                ? variant.stockQuantity > 0
                                  ? `${variant.stockQuantity} adet`
                                  : "Stok yok"
                                : "-";

                            return (
                              <tr key={variant.id ?? `variant-${index}`}>
                                <td>{variant.size || "-"}</td>
                                <td>{variant.sku || "-"}</td>
                                <td>
                                  <span
                                    className={
                                      variant.stockQuantity && variant.stockQuantity > 0
                                        ? "sherah-color3"
                                        : "text-danger"
                                    }
                                  >
                                    {stockText}
                                  </span>
                                </td>
                                <td>
                                  {variant.isDefault ? (
                                    <span className="badge bg-primary">Varsayılan</span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="tab-pane fade" id="p_tab_2" role="tabpanel">
                <ul className="sherah-features-list">
                  <li>Yüksek dayanım</li>
                  <li>Biyouyumlu kaplama</li>
                  <li>Hassas üretim toleransları</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
