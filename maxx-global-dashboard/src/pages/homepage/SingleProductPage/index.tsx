// src/pages/product/ProductPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../Partials/Layout";
import BreadcrumbCom from "../BreadcrumbCom";
import ProductView from "../SingleProductPage/ProductView";
import {
  getProductById,
  type ProductDetail,
  type ProductPriceInfo,
} from "../../../services/products/getById";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useCart } from "../Helpers/CartContext";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";

const MySwal = withReactContent(Swal);
export default function ProductPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState<string>("1");
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
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

        let nextVariantId: number | null = null;
        if (p.defaultVariantId !== undefined && p.defaultVariantId !== null) {
          const num = Number(p.defaultVariantId);
          nextVariantId = Number.isFinite(num) ? num : null;
        }

        if (nextVariantId === null && Array.isArray(p.variants) && p.variants.length) {
          const defaultVariant = p.variants.find((v) => v.isDefault);
          const candidate = defaultVariant ?? p.variants[0];
          if (candidate?.id !== undefined && candidate?.id !== null) {
            const num = Number(candidate.id);
            if (Number.isFinite(num)) {
              nextVariantId = num;
            }
          }
        }

        setSelectedVariantId(nextVariantId);
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
  useEffect(() => {
    const idNum = Number(idParam);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      return;
    }

    const cartItem = items.find((item) => item.productId === idNum);
    if (cartItem) {
      setQuantity(cartItem.quantity);
      setInputValue(String(cartItem.quantity));
    } else {
      setQuantity(1);
      setInputValue("1");
    }
  }, [items, idParam]);

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

  const variants = product?.variants ?? [];

  const variantOptions = useMemo(
    () =>
      variants.map((variant, index) => {
        const labelParts = [variant.size, variant.sku]
          .filter((val): val is string => !!val && String(val).trim().length > 0)
          .map((val) => String(val));
        const label =
          labelParts.join(" • ") || `Varyant ${index + 1}`;
        return {
          id: variant.id,
          label,
        };
      }),
    [variants]
  );

  const selectedVariant = useMemo(() => {
    if (!variants.length || selectedVariantId === null) return null;
    return variants.find((variant) => variant.id === selectedVariantId) ?? null;
  }, [variants, selectedVariantId]);

  const selectedVariantLabel = useMemo(() => {
    if (!selectedVariant) return "";
    const parts = [selectedVariant.size, selectedVariant.sku]
      .filter((val): val is string => !!val && String(val).trim().length > 0)
      .map((val) => String(val));
    return parts.join(" • ");
  }, [selectedVariant]);

  const availablePrices = useMemo<ProductPriceInfo[]>(() => {
    if (selectedVariant?.prices?.length) {
      return selectedVariant.prices;
    }

    if (product?.prices?.length) {
      return product.prices;
    }

    return [];
  }, [product, selectedVariant]);

  const selectedPrice = useMemo(() => {
    if (!availablePrices.length) return null;

    return (
      availablePrices.find(
        (price) => price.amount !== null && price.amount !== undefined
      ) ?? availablePrices[0]
    );
  }, [availablePrices]);

  const resolvedPriceId = useMemo(() => {
    if (selectedPrice?.productPriceId != null) {
      return selectedPrice.productPriceId;
    }

    const priceWithId = availablePrices.find(
      (price) => price.productPriceId !== null && price.productPriceId !== undefined
    );

    return priceWithId?.productPriceId ?? null;
  }, [availablePrices, selectedPrice]);

  const formattedPrice = useMemo(() => {
    if (!selectedPrice || selectedPrice.amount === null || selectedPrice.amount === undefined)
      return null;
    const amount = Number(selectedPrice.amount);
    if (!Number.isFinite(amount)) return null;
    const currency = selectedPrice.currency ?? "";
    try {
      if (currency) {
        return new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency,
        }).format(amount);
      }
      return amount.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return `${amount.toLocaleString("tr-TR")}${currency ? ` ${currency}` : ""}`;
    }
  }, [selectedPrice]);

  const stockInfo = useMemo(() => {
    if (!product) {
      return { isInStock: false, text: "Stok bilgisi mevcut değil" };
    }

    const fallbackStockQuantity = product.stockQuantity ?? null;
    const fallbackInStock =
      typeof product.isInStock === "boolean"
        ? product.isInStock
        : fallbackStockQuantity != null
        ? fallbackStockQuantity > 0
        : false;

    if (selectedVariant) {
      const variantStock = selectedVariant.stockQuantity;
      if (variantStock !== null && variantStock !== undefined) {
        return {
          isInStock: variantStock > 0,
          text: variantStock > 0 ? `${variantStock} adet stokta` : "Stok yok",
        };
      }
    }

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
  }, [product, selectedVariant]);

  const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (!value) {
      setSelectedVariantId(null);
      return;
    }
    const num = Number(value);
    setSelectedVariantId(Number.isFinite(num) ? num : null);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const priceId = resolvedPriceId;
    if (priceId === null) {
      const result = await MySwal.fire({
        icon: "question",
        title: "Fiyat bilgisi bulunamadı",
        text: "Bu ürünü fiyat bilgisi olmadan sepete eklemek istediğinize emin misiniz?",
        confirmButtonText: "Evet, ekle",
        cancelButtonText: "Vazgeç",
        showCancelButton: true,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      const rawVariantId =
        selectedVariant?.id ?? (selectedVariantId != null ? selectedVariantId : null);
      const variantId =
        rawVariantId != null && Number.isFinite(Number(rawVariantId))
          ? Number(rawVariantId)
          : null;

      await addItem({
        productId: product.id,
        productVariantId: variantId,
        productPriceId: priceId,
        quantity,
      });
      const variantLabel = selectedVariantLabel ? ` (${selectedVariantLabel})` : "";
      await MySwal.fire({
        icon: "success",
        title: "Başarılı",
        text: `${product.name}${variantLabel} ürününden ${quantity} adet sepete eklendi`,
        confirmButtonText: "Tamam",
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Sepete ürün eklenirken bir hata oluştu.";
      MySwal.fire({
        icon: "error",
        title: "Hata",
        text: message,
      });
    }
  };

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

                    {variantOptions.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-qblack mb-2">
                          Boy Seçimi
                        </label>
                        <select
                          value={
                            selectedVariantId !== null
                              ? String(selectedVariantId)
                              : ""
                          }
                          onChange={handleVariantChange}
                          className="w-full border border-qgray-border px-3 py-2 text-sm outline-none"
                        >
                          <option value="">Boy seçiniz</option>
                          {variantOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formattedPrice ? (
                      <p className="text-2xl font-semibold text-qblack mb-4">
                        {formattedPrice}
                      </p>
                    ) : (
                      <p className="text-sm text-qgray mb-4">
                        {variantOptions.length > 0
                          ? "Fiyat için gerekli yetkiniz yok"
                          : "Bu ürün için fiyat bilgisi bulunamadı. Siparişiniz fiyatlandırıldıktan sonra bilgilendirileceksiniz."}
                      </p>
                    )}

                    <p
                      className={`text-xl font-medium mb-4 ${
                        stockInfo.isInStock ? "sherah-color3" : "text-danger"
                      }`}
                    >
                      {stockInfo.text}
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
                        <span className="ms-2">
                          {selectedVariant?.size || product.size || "-"}
                        </span>
                      </p>
                      {selectedVariant && (
                        <p className="text-[13px] text-qgray leading-7">
                          <span className="text-qblack font-600">SKU :</span>
                          <span className="ms-2">{selectedVariant.sku || "-"}</span>
                        </p>
                      )}
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
