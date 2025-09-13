// src/pages/Helpers/SectionStyleThreeHomeTwo.tsx
import { useEffect, useState } from "react";
import ViewMoreTitle from "./ViewMoreTitle";
import { Link } from "react-router-dom";
import Compair from "./icons/Compair";
import QuickViewIco from "./icons/QuickViewIco";
import ThinLove from "./icons/ThinLove";
import { listRandomProducts } from "../../../services/products/random";
import type { ProductRow } from "../../../types/product";
import { addToCart, updateQty } from "../../../services/cart/storage";

type BannerProps = { className?: string };

export default function SectionStyleThreeHomeTwo({ className }: BannerProps) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Her ürün için ayrı quantity state tutuyoruz */
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listRandomProducts(3);
        setProducts(data);
        // default qty = 1
        const initialQty: Record<number, number> = {};
        data.forEach((p) => (initialQty[p.id] = 1));
        setQuantities(initialQty);
      } catch (e: any) {
        console.error(e);
        setError("Ürünler getirilemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const increment = (id: number) =>
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));

  const decrement = (id: number) =>
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : 1,
    }));

  const handleManualChange = (id: number, value: string) => {
    const val = parseInt(value, 10);
    if (!isNaN(val) && val >= 1) {
      setQuantities((prev) => ({ ...prev, [id]: val }));
    }
  };

  const handleAddToCart = (id: number) => {
    const qty = quantities[id] || 1;
    addToCart(id, qty); // localStorage güncelle
    updateQty(id, qty);
    alert(`Ürün sepete eklendi (ID: ${id}, Adet: ${qty})`);
  };

  return (
    <div className={`section-style-one ${className || ""}`}>
      <ViewMoreTitle categoryTitle="Popüler Ürünler">
        <div className="products-section w-full mt-5">
          {loading && <p className="text-center py-6">Yükleniyor…</p>}
          {error && <p className="text-center py-6 text-red-500">{error}</p>}
          {!loading && !error && products.length > 0 && (
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10">
              {products.map((p) => (
                <div key={p.id} data-aos="fade-up" className="item">
                  <div
                    className="product-card-style-one-two w-full h-full bg-white relative group overflow-hidden"
                    style={{ boxShadow: "0px 15px 64px 0px rgba(0,0,0,0.05)" }}
                  >
                    {/* Ürün görseli */}
                    <div
                      className="product-card-img w-full h-[322px] mt-4 bg-center bg-no-repeat bg-cover"
                      style={{
                        backgroundImage: `url(${p.primaryImageUrl || ""})`,
                      }}
                    />

                    {/* İçerik */}
                    <div className="product-card-details flex justify-center h-[150px] items-center relative px-4">
                      {/* Sepete ekle + adet */}
                      <div className="absolute flex w-[234px] h-[54px] left-1/2 -translate-x-1/2 -bottom-20 group-hover:bottom-[20px] transition-all duration-300 ease-in-out">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(p.id)}
                          className="yellow-btn w-full h-full cursor-pointer"
                        >
                          Sepete Ekle
                        </button>
                        <div className="w-[130px] h-full px-[10px] flex items-center border bg-white border-qgray-border">
                          <div className="flex justify-between items-center w-full">
                            <button
                              onClick={() => decrement(p.id)}
                              type="button"
                              className="text-base text-qgray px-2"
                            >
                              –
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={quantities[p.id] || 1}
                              onChange={(e) =>
                                handleManualChange(p.id, e.target.value)
                              }
                              className="w-14 text-center border-none outline-none text-qblack"
                            />
                            <button
                              onClick={() => increment(p.id)}
                              type="button"
                              className="text-base text-qgray"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <Link to={`/homepage/product/${p.id}`}>
                          <p className="title mb-2 text-[20px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
                            {p.name}
                          </p>
                        </Link>

                        {p.categoryName && (
                          <p className="text-xs text-gray-500 mb-1">
                            {p.categoryName}
                          </p>
                        )}
                        {p.stockQuantity != null && (
                          <p className="text-xs text-gray-500 mb-1">
                            Stok: {p.stockQuantity} {p.unit ?? ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Hızlı erişim butonları */}
                    <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-[50px] -right-[50px] top-20 transition-all duration-300 ease-in-out">
                      <button className="w-10 h-10 flex justify-center items-center bg-[#CCECEB] rounded">
                        <QuickViewIco />
                      </button>
                      <button className="w-10 h-10 flex justify-center items-center bg-[#CCECEB] rounded">
                        <ThinLove />
                      </button>
                      <button className="w-10 h-10 flex justify-center items-center bg-[#CCECEB] rounded">
                        <Compair />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ViewMoreTitle>
    </div>
  );
}
