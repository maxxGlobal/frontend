// src/pages/FlashSale/index.tsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "../Partials/Layout";
import { listDiscountsByDealer } from "../../../services/discounts/list-by-dealer";
import { listProductImages } from "../../../services/products/images/list";
import type { Discount, DiscountProduct } from "../../../types/discount";
import "../../../theme.css";
import "../../../assets/homepage.css";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";

export default function FlashSale() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dealerCurrency, setDealerCurrency] = useState<string | undefined>();

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const userRaw = localStorage.getItem("user");
        const dealerId = userRaw ? JSON.parse(userRaw)?.dealer?.id : undefined;
        const currency = userRaw
          ? JSON.parse(userRaw)?.dealer?.preferredCurrency
          : undefined;

        // 🔹 state’e kaydet
        setDealerCurrency(currency);
        if (!dealerId) {
          setError("Bayi bilgisi bulunamadı");
          return;
        }

        const res = await listDiscountsByDealer(dealerId);

        // Resimleri tamamla
        const completed = await Promise.all(
          res.map(async (d) => {
            const prods = await Promise.all(
              d.applicableProducts.map(async (p) => {
                if (!p.primaryImageUrl) {
                  const imgs = await listProductImages(p.id);
                  const firstImg = imgs.find((i) => i.isPrimary) ?? imgs[0];
                  return { ...p, primaryImageUrl: firstImg?.imageUrl ?? null };
                }
                return p;
              })
            );
            return { ...d, applicableProducts: prods };
          })
        );

        setDiscounts(completed);
      } catch (e: any) {
        console.error(e);
        setError("İndirimli ürünler getirilemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // tüm ürünleri tek satır listesine çevir
  const rows: {
    discount: Discount;
    product: DiscountProduct;
  }[] = useMemo(() => {
    const out: { discount: Discount; product: DiscountProduct }[] = [];
    discounts.forEach((d) =>
      d.applicableProducts.forEach((p) => out.push({ discount: d, product: p }))
    );
    return out;
  }, [discounts]);

  // toplam sayfa
  const totalPages = Math.ceil(rows.length / pageSize);

  // aktif sayfanın satırları
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout>
      <div className="container-x mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">
          Bayiye Uygulanabilir İndirimler
        </h1>

        {loading && <LoaderStyleOne />}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && rows.length > 0 && (
          <>
            <div className="overflow-x-auto border border-[#EDEDED] rounded-md">
              <table className="w-full text-sm text-left text-gray-700">
                <thead>
                  <tr className="bg-[#F6F6F6] text-[13px] font-semibold uppercase border-b">
                    <th className="py-4 pl-6">İndirim Kodu</th>
                    <th className="py-4 pl-6">İndirim Mİktarı</th>
                    <th className="py-4 text-center">Resim</th>
                    <th className="py-4 text-center">Ürün Adı</th>
                    <th className="py-4 text-center">Kategori</th>
                    <th className="py-4 text-center">Stok</th>
                    <th className="py-4 text-center">Başlangıç</th>
                    <th className="py-4 text-center">Bitiş</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map(({ discount: d, product: p }) => (
                    <tr
                      key={`${d.id}-${p.id}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="pl-6 py-3 font-medium">{d.name}</td>
                      <td className="pl-6 py-3 font-medium">
                        {d.discountType === "PERCENTAGE"
                          ? `% ${d.discountValue}`
                          : `${d.discountValue} ${dealerCurrency ?? ""}`}
                      </td>
                      <td className="text-center py-3">
                        <img
                          src={
                            p.primaryImageUrl ||
                            `${
                              import.meta.env.VITE_PUBLIC_URL
                            }src/assets/images/resim-yok.jpg`
                          }
                          alt={p.name}
                          className="w-16 h-16 object-contain mx-auto border"
                        />
                      </td>
                      <td className="text-center py-3">
                        <Link
                          to={`/homepage/product/${p.id}`}
                          className="hover:text-blue-600"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="text-center py-3">{p.categoryName}</td>
                      <td className="text-center py-3">
                        {p.stockQuantity} {p.unit}
                      </td>
                      <td className="text-center py-3">
                        {new Date(d.startDate).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="text-center py-3">
                        {new Date(d.endDate).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 🔹 Sayfalama Kontrolleri */}
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Önceki
              </button>
              <span>
                Sayfa {page} / {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sonraki
              </button>
            </div>
          </>
        )}

        {!loading && !error && rows.length === 0 && (
          <p className="text-center mt-6 text-gray-500">
            Bu bayi için indirim bulunamadı.
          </p>
        )}
      </div>
    </Layout>
  );
}
