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
import { addToCart, updateQty, getCart } from "../../../services/cart/storage";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useCart } from "../Helpers/CartContext";
import "../../../theme.css";
import "../../../assets/homepage.css";

const MySwal = withReactContent(Swal);
export default function ProductPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const { refresh } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState<string>("1");
  const increment = () => {
    setQuantity((prev) => {
      const next = prev + 1;
      setInputValue(String(next));
      return next;
    });
  };
  const decrement = () => {
    setQuantity((prev) => {
      const next = prev > 1 ? prev - 1 : 1;
      setInputValue(String(next));
      return next;
    });
  };
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) {
      setQuantity(num);
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
        const cartItem = getCart().find((c) => c.id === idNum);
        if (cartItem) setQuantity(cartItem.qty);
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          setErr("Ürün detayı yüklenemedi.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [idParam]);
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
    updateQty(product.id, quantity);
    refresh();
    MySwal.fire({
      icon: "success",
      title: "Başarılı",
      text: `${product.name} ürününden ${quantity} adet sepete eklendi`,
      confirmButtonText: "Tamam",
    });
  };

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
                    <p className="text-xl font-medium text-qblack mb-4">
                      {product.name} {statusBadge}
                    </p>

                    <p className="text-qgray text-sm mb-[30px] leading-7">
                      {product.description || "Ürün açıklaması mevcut değil."}
                    </p>

                    <p
                      className={`text-xl font-medium mb-4 ${
                        product.isInStock ? "sherah-color3" : "text-danger"
                      }`}
                    >
                      {product.isInStock
                        ? `${product.stockQuantity ?? 0} adet stokta`
                        : "Stok yok"}
                    </p>

                    {/* Adet ve Sepete Ekle */}
                    <div className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px]">
                      <div className="w-[120px] h-full px-[26px] flex items-center border border-qgray-border">
                        <div className="flex justify-between items-center w-full">
                          <button
                            onClick={decrement}
                            type="button"
                            className="text-base text-qgray"
                          >
                            –
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={inputValue}
                            onChange={handleManualChange}
                            className="w-14 text-center border-none outline-none text-qblack"
                          />
                          <button
                            onClick={increment}
                            type="button"
                            className="text-base text-qgray"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 h-full">
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="cursor-pointer black-btn text-sm font-semibold w-full h-full"
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    </div>

                    {/* Diğer ürün bilgileri */}
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
                        <span className="text-qblack font-600">Lot No :</span>
                        <span className="ms-2">{product.lotNumber || "-"}</span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">Birim :</span>
                        <span className="ms-2">{product.unit || "-"}</span>
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
                        <span className="text-qblack font-600">Açı :</span>
                        <span className="ms-2">{product.angle || "-"}</span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">Ağırlık :</span>
                        <span className="ms-2">
                          {product.weightGrams || "-"} gr
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
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">Steril :</span>
                        <span className="ms-2">
                          {product.sterile === true
                            ? "Evet"
                            : product.sterile === false
                            ? "Hayır"
                            : "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">
                          Tek Kullanımlık :
                        </span>
                        <span className="ms-2">
                          {product.singleUse === true
                            ? "Evet"
                            : product.singleUse === false
                            ? "Hayır"
                            : "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">
                          İmplante Edilebilir :
                        </span>
                        <span className="ms-2">
                          {product.implantable === true
                            ? "Evet"
                            : product.implantable === false
                            ? "Hayır"
                            : "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">
                          CE İşareti :
                        </span>
                        <span className="ms-2">
                          {product.ceMarking === true
                            ? "Evet"
                            : product.ceMarking === false
                            ? "Hayır"
                            : "-"}
                        </span>
                      </p>
                      <p className="text-[13px] text-qgray leading-7">
                        <span className="text-qblack font-600">
                          FDA Onaylı :
                        </span>
                        <span className="ms-2">
                          {product.fdaApproved === true
                            ? "Evet"
                            : product.fdaApproved === false
                            ? "Hayır"
                            : "-"}
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
