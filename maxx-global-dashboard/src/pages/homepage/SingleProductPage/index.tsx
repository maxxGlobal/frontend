// src/pages/product/ProductPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../Partials/Layout";
import BreadcrumbCom from "../BreadcrumbCom";
import ProductView from "../SingleProductPage/ProductView";
import {
  getProductById,
  type ProductDetail,
} from "../../../services/products/getById";
import "../../../theme.css";
import "../../../assets/homepage.css";

export default function ProductPage() {
  const { id: idParam } = useParams<{ id: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const increment = () => {
    setQuantity((prev) => prev + 1);
  };
  const decrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

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
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        console.error("getProductById error:", e);
        setErr("Ürün detayı yüklenemedi.");
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
      <Layout>
        <div className="container-x mx-auto py-20 text-center text-gray-600">
          Ürün yükleniyor…
        </div>
      </Layout>
    );
  }

  if (err) {
    return (
      <Layout>
        <div className="container-x mx-auto py-20 text-center text-red-600">
          {err}
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout childrenClasses="w-full pt-0 pb-0">
      <div className="single-product-wrapper w-full">
        <div className="product-view-main-wrapper bg-white pt-[30px] w-full">
          <div className="breadcrumb-wrapper w-full">
            <div className="container-x mx-auto">
              <BreadcrumbCom
                paths={[
                  { name: "Anasayfa", path: "/homepage" },
                  {
                    name: product.name ?? "product",
                    path: `/homepage/product/${product.id}`,
                  },
                ]}
              />
            </div>
          </div>

          <div className="w-full bg-white pb-[60px]">
            <div className="container-x mx-auto">
              <div className="product-view w-full lg:flex justify-between">
                <ProductView
                  name={product.name}
                  images={product.images?.map((x) => ({
                    id: x.id,
                    url: x.imageUrl,
                    isPrimary: x.isPrimary,
                  }))}
                  primaryImageUrl={
                    product.primaryImageUrl ??
                    product.images?.find((i) => i.isPrimary)?.imageUrl ??
                    product.images?.[0]?.imageUrl ??
                    null
                  }
                />

                {/* Sağ kısım: detaylar */}
                <div className="flex-1">
                  <div className="product-details w-full mt-10 lg:mt-0">
                    <p className="text-xl font-medium text-qblack mb-4 aos-init aos-animate">
                      {product.name}
                    </p>
                    <p
                      data-aos="fade-up"
                      className="text-qgray text-sm text-normal mb-[30px] leading-7 aos-init aos-animate"
                    >
                      {product.description || "Ürün açıklaması mevcut değil."}
                    </p>

                    <p
                      data-aos="fade-up"
                      className={`text-xl font-medium text-qblack mb-4 aos-init aos-animate ${
                        product.isInStock ? "sherah-color3" : "text-danger"
                      }`}
                    >
                      {product.isInStock
                        ? `${product.stockQuantity ?? 0} adet stokta`
                        : "Stok yok"}
                    </p>

                    <div data-aos="fade-up" className="colors mb-[30px]">
                      <span className="text-sm font-normal uppercase text-qgray mb-[14px] inline-block">
                        Renk
                      </span>

                      <div className="flex space-x-4 items-center">
                        <div>
                          <button
                            type="button"
                            className="w-[20px] h-[20px]  rounded-full focus:ring-2  ring-offset-2 flex justify-center items-center"
                          >
                            <span
                              style={{ background: `${product.color}` }}
                              className="w-[20px] h-[20px] block rounded-full border"
                            ></span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      data-aos="fade-up"
                      className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px]"
                    >
                      <div className="w-[120px] h-full px-[26px] flex items-center border border-qgray-border">
                        <div className="flex justify-between items-center w-full">
                          <button
                            onClick={decrement}
                            type="button"
                            className="text-base text-qgray"
                          >
                            -
                          </button>
                          <span className="text-qblack">{quantity}</span>
                          <button
                            onClick={increment}
                            type="button"
                            className="text-base text-qgray"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="w-[60px] h-full flex justify-center items-center border border-qgray-border">
                        <button type="button">
                          <span>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M17 1C14.9 1 13.1 2.1 12 3.7C10.9 2.1 9.1 1 7 1C3.7 1 1 3.7 1 7C1 13 12 22 12 22C12 22 23 13 23 7C23 3.7 20.3 1 17 1Z"
                                stroke="#D5D5D5"
                                strokeWidth="2"
                                strokeMiterlimit="10"
                                strokeLinecap="square"
                              />
                            </svg>
                          </span>
                        </button>
                      </div>
                      <div className="flex-1 h-full">
                        <button
                          type="button"
                          className="cursor-pointer black-btn text-sm font-semibold w-full h-full"
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    </div>
                    <div
                      data-aos="fade-up"
                      className="mb-[20px] aos-init aos-animate"
                    >
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">Kategori :</span>
                        <span className="ms-2">
                          {product.categoryName || "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">Seri No :</span>
                        <span className="ms-2">
                          {product.serialNumber || "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">Materyal :</span>
                        <span className="ms-2">{product.material || "-"}</span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">Boyut :</span>
                        <span className="ms-2">{product.size || "-"}</span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">Çap :</span>
                        <span className="ms-2">{product.diameter || "-"}</span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">
                          Yüzey İşlemi :
                        </span>
                        <span className="ms-2">
                          {product.surfaceTreatment || "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">
                          Medikal Cihaz Sınıfı :
                        </span>
                        <span className="ms-2">
                          {product.medicalDeviceClass || "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">
                          Regülasyon No :
                        </span>
                        <span className="ms-2">
                          {product.regulatoryNumber || "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">
                          Üretim Tarihi :
                        </span>
                        <span className="ms-2">
                          {product.manufacturingDate || "-"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
