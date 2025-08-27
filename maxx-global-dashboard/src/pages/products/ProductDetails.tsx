// src/pages/products/ProductDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ProductGallery from "../products/components/ProductGallery";
import { getProductById } from "../../services/products/getById";

import type { ProductDetail } from "../../services/products/getById";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";
const FALLBACK_IMG = "src/assets/img/resim-yok.jpg";

function absolutify(url?: string | null): string {
  if (!url) return FALLBACK_IMG;
  if (url.startsWith("http")) return url;
  if (/^\/uploads?\//i.test(url)) return `${API_BASE}${url}`;
  return url || FALLBACK_IMG;
}

export default function ProductDetails() {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const cover =
    product?.primaryImageUrl ||
    product?.images?.find((i) => i.isPrimary)?.imageUrl ||
    product?.images?.[0]?.imageUrl ||
    "src/assets/img/resim-yok.jpg";

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);

      // ✅ id’yi güvenli parse et
      const idNum = Number(idParam);
      if (!Number.isFinite(idNum) || idNum <= 0) {
        setErr("Geçersiz ürün numarası.");
        setLoading(false);
        return;
      }

      try {
        const p = await getProductById(idNum, { signal: controller.signal });
        setProduct(p);
      } catch (e: any) {
        // Abort ise kullanıcı navigasyon vs. yapmıştır; uyarı göstermeyelim
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setErr("Ürün detayı yüklenemedi.");
        console.error("getProductById error:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [idParam]);

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

  if (err || !product) {
    return (
      <div className="sherah-dsinner">
        <div className="alert alert-danger mt-4">
          {err || "Ürün bulunamadı."}
        </div>
        <button className="btn btn-light mt-3" onClick={() => navigate(-1)}>
          Geri
        </button>
      </div>
    );
  }

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
              name={product?.name}
              images={product?.images?.map((x) => ({
                id: x.id,
                url: x.imageUrl,
                isPrimary: x.isPrimary,
              }))}
              primaryImageUrl={
                product?.primaryImageUrl ??
                (product?.images?.find((i) => i.isPrimary)?.imageUrl ||
                  product?.images?.[0]?.imageUrl) ??
                null
              }
            />
          </div>

          {/* Right content */}
          <div className="col-lg-6 col-md-6 col-12">
            <div className="product-detail-body__content">
              <h2 className="product-detail-body__title mb-2">
                {product.name}{" "}
              </h2>
              <p className="product-detail-body__stats">{statusBadge}</p>
              <p
                className={`product-detail-body__stock mt-3 ${
                  product.isInStock ? "sherah-color3" : "text-danger"
                }`}
              >
                {product.isInStock
                  ? `${product.stockQuantity ?? 0} adet stokta`
                  : "Stok yok"}
              </p>

              {/* Meta alanları */}
              <div className="sherah-products-meta">
                <ul className="sherah-products-meta__list mt-2">
                  <li>
                    <span className="p-list-title fw-bold">SKU :</span>{" "}
                    {product.serialNumber || "-"}
                  </li>
                  <li>
                    <span className="p-list-title fw-bold">Kategori :</span>{" "}
                    {product.categoryName || "-"}
                  </li>
                  <li>
                    <span className="p-list-title fw-bold">Birim :</span>{" "}
                    {product.unit || "-"}
                  </li>
                  <li>
                    <span className="p-list-title fw-bold">Raf Ömrü :</span>{" "}
                    {product.shelfLifeMonths ?? "-"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs (Specifications / Features / Reviews) */}
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
              {/* Specs */}
              <div
                className="tab-pane fade show active"
                id="p_tab_1"
                role="tabpanel"
              >
                <div className="sherah-product-tabs__text">
                  <p>
                    {product.description || "Ürün açıklaması mevcut değil."}
                  </p>
                </div>

                <div className="sherah-table p-0">
                  <table className="product-overview-table mg-top-30">
                    <tbody>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Malzeme
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {product.material || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Boyut
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {product.size || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Çap
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {product.diameter || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Renk
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {(product as any).color || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Yüzey İşlemi
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {product.surfaceTreatment || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Medikal Cihaz Sınıfı
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {product.medicalDeviceClass || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Regülasyon No
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {product.regulatoryNumber || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Üretim Tarihi
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {product.manufacturingDate || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="product-overview-table_title">
                            Son Kullanma
                          </span>
                        </td>
                        <td>
                          <span className="product-overview-table_text">
                            {product.expiryDate || "-"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Features (örnek dummy liste) */}
              <div className="tab-pane fade" id="p_tab_2" role="tabpanel">
                <ul className="sherah-features-list">
                  <li>Yüksek dayanım</li>
                  <li>Biyouyumlu kaplama</li>
                  <li>Hassas üretim toleransları</li>
                </ul>
              </div>

              {/* Reviews (dummy UI) */}
              <div className="tab-pane fade" id="p_tab_3" role="tabpanel">
                <div className="sherah-user-reviews">
                  <div className="sherah-user-reviews__single">
                    <div className="shera-user-reviews_thumb">
                      <img src="/img/review-1.png" />
                    </div>
                    <div className="sherah-user-reviews__content">
                      <h4 className="sherah-user-reviews_title">
                        Abubokkor Siddik
                      </h4>
                      <div className="sherah-product-card__rating sherah-dflex sherah-flex-gap-5">
                        <span className="sherah-color4">
                          <i className="fa fa-star"></i>
                        </span>
                        <span className="sherah-color4">
                          <i className="fa fa-star"></i>
                        </span>
                        <span className="sherah-color4">
                          <i className="fa fa-star"></i>
                        </span>
                        <span className="sherah-color4">
                          <i className="fa fa-star"></i>
                        </span>
                      </div>
                      <p className="sherah-user-reviews__text">
                        This is some unreal beauty! I really liked it!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review form — statik */}
                <div className="sherah-review-comment mg-top-30">
                  <h3 className="sherah-review-comment__title">
                    Add Your Review
                  </h3>
                  <form className="sherah-wc__form-main sherah-form-main--v2 p-0">
                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-12">
                        <div className="form-group">
                          <label className="sherah-wc__form-label">
                            First Name *
                          </label>
                          <div className="form-group__input">
                            <input
                              className="sherah-wc__form-input"
                              placeholder="Your name here"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-12">
                        <div className="form-group">
                          <label className="sherah-wc__form-label">
                            Email Address*
                          </label>
                          <div className="form-group__input">
                            <input
                              className="sherah-wc__form-input"
                              placeholder="Your email address here"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label className="sherah-wc__form-label">
                            Review*
                          </label>
                          <div className="form-group__input">
                            <textarea
                              className="sherah-wc__form-input sherah-wc__form-input--big"
                              placeholder="Write your text"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group mg-top-30">
                      <button
                        type="button"
                        className="sherah-btn sherah-btn__primary"
                      >
                        Submit Now
                      </button>
                    </div>
                  </form>
                </div>
                {/* /review form */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
