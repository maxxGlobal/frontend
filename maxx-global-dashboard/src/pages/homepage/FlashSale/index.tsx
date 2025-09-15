// src/pages/FlashSale/index.tsx
import { useEffect, useState, useMemo } from "react";
import Layout from "../Partials/Layout";
import { listDiscountsByDealer } from "../../../services/discounts/list-by-dealer";
import { listProductImages } from "../../../services/products/images/list";
import type { Discount } from "../../../types/discount";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import PopoverBadge from "./PopoverBadge";
import PageTitle from "../Helpers/PageTitle";
import type { Crumb } from "../Helpers/PageTitle";
import "../../../theme.css";
import "../../../assets/homepage.css";

const crumbs: Crumb[] = [
  { name: "home", path: "/homepage" },
  { name: "İndirimler", path: "/homepage/flash-sale" },
];
export default function FlashSale() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealerCurrency, setDealerCurrency] = useState<string | undefined>();

  useEffect(() => {
    const controller = new AbortController();
    const MIN_LOADER_TIME = 1000;
    const start = Date.now();

    (async () => {
      try {
        const userRaw = localStorage.getItem("user");
        const dealerId = userRaw ? JSON.parse(userRaw)?.dealer?.id : undefined;
        const currency = userRaw
          ? JSON.parse(userRaw)?.dealer?.preferredCurrency
          : undefined;

        setDealerCurrency(currency);
        if (!dealerId) {
          setError("Bayi bilgisi bulunamadı");
          return;
        }
        const res = await listDiscountsByDealer(dealerId);
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
        if (e?.name !== "AbortError" && e?.code !== "ERR_CANCELED") {
          console.error(e);
          setError("İndirimli ürünler getirilemedi");
        }
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
        setTimeout(() => setLoading(false), remaining);
      }
    })();

    return () => controller.abort();
  }, []);
  const grouped = useMemo(() => {
    const map = new Map<string, Discount[]>();
    discounts.forEach((d) => {
      if (!map.has(d.name)) map.set(d.name, []);
      map.get(d.name)!.push(d);
    });

    return Array.from(map.entries()).map(([name, list]) => {
      const base = list[0];
      return {
        ...base,
        allProducts: list.flatMap((x) => x.applicableProducts),
        allDealers: list.flatMap((x) => x.applicableDealers ?? []),
      };
    });
  }, [discounts]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center w-full h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="w-full">
        <div className="title-area w-full">
          <PageTitle title="Bayi İndirimleri" breadcrumb={crumbs} />
        </div>

        <div className="container-x mx-auto py-8">
          {error && <p className="text-red-500">{error}</p>}
          {!error && grouped.length > 0 && (
            <div className="overflow-x-auto border border-[#EDEDED] rounded-md">
              <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead>
                  <tr className="bg-[#F6F6F6] text-[13px] font-medium uppercase border-b border-[#e5e7eb]">
                    <th className="py-6 pl-6">Ad</th>
                    <th className="py-6 pl-6">Açıklama</th>
                    <th className="py-6 text-center">Değer</th>
                    <th className="py-6 text-center">Ürünler</th>
                    <th className="py-6 text-center">Bayiler</th>
                    <th className="py-6 text-center">Başlangıç</th>
                    <th className="py-6 text-center">Bitiş</th>
                  </tr>
                </thead>

                <tbody>
                  {grouped.map((d) => (
                    <tr
                      key={d.id}
                      className="bg-white border-b border-[#e5e7eb] hover:bg-gray-50"
                    >
                      <td className="pl-6 py-8 w-[200px]">{d.name}</td>
                      <td className="pl-6 py-8 w-[200px]">
                        {d.description || "-"}
                      </td>
                      <td className="text-center py-3">
                        {d.discountType === "PERCENTAGE"
                          ? `%${d.discountValue}`
                          : `${d.discountValue} ${dealerCurrency ?? ""}`}
                      </td>

                      <td className="text-center py-8">
                        <PopoverBadge products={d.allProducts} dealers={[]} />
                      </td>
                      <td className="text-center py-8">
                        <PopoverBadge products={[]} dealers={d.allDealers} />
                      </td>

                      <td className="text-center py-8">
                        {new Date(d.startDate).toLocaleString("tr-TR")}
                      </td>
                      <td className="text-center py-8">
                        {new Date(d.endDate).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!error && grouped.length === 0 && (
            <p className="text-center mt-6 text-gray-500">
              Bu bayi için indirim bulunamadı.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
