import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CountDown from "../Helpers/CountDown";
import Layout from "../Partials/Layout";
import { listDiscounts } from "../../../services/discounts/list";
import type { Discount, PageResponse } from "../../../types/discount";
import "../../../theme.css";
import "../../../assets/homepage.css";

export default function FlashSale() {
  const { showDate, showHour, showMinute, showSecound } =
    CountDown("2023-03-04 4:00:00");

  const [products, setProducts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const cacheRaw = localStorage.getItem("gbFeaturesCache");
        let dealerId: number | undefined = undefined;

        if (cacheRaw) {
          try {
            const cache = JSON.parse(cacheRaw);
            // Burada senin screenshot'taki gibi "dealer" objesi var
            dealerId = cache?.dealer?.id;
            console.log(dealerId);
          } catch (e) {
            console.warn("Cache parse edilemedi:", e);
          }
        }
        const pageRes: PageResponse<Discount> = await listDiscounts(dealerId);
        console.log(pageRes);
        setProducts(pageRes?.content ?? [dealerId]);
      } catch (e: any) {
        console.error(e);
        setError("İndirimli ürünler yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <Layout>
      <div className="flashsale-wrapper w-full">
        <div className="container-x mx-auto">
          <div className="w-full">
            {/* Banner + Countdown */}
            <div
              style={{
                background: `url(${
                  import.meta.env.VITE_PUBLIC_URL
                }/assets/images/flash-sale-ads.png) no-repeat`,
                backgroundSize: "cover",
              }}
              data-aos="fade-right"
              className="flash-ad w-full h-[400px] flex sm:justify-end justify-center items-center mb-10"
            >
              <div className="sm:mr-[75px]">
                <div className="countdown-wrapper w-full flex sm:space-x-6 space-x-3 sm:justify-between justify-evenly">
                  <div className="countdown-item">
                    <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
                      <span className="font-700 sm:text-[30px] text-base text-[#EB5757]">
                        {showDate}
                      </span>
                    </div>
                    <p className="sm:text-[18px] text-xs font-500 text-center leading-8 text-white">
                      Days
                    </p>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
                      <span className="font-700 sm:text-[30px] text-base text-[#2F80ED]">
                        {showHour}
                      </span>
                    </div>
                    <p className="sm:text-[18px] text-xs font-500 text-center leading-8 text-white">
                      Hours
                    </p>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
                      <span className="font-700 sm:text-[30px] text-base text-[#219653]">
                        {showMinute}
                      </span>
                    </div>
                    <p className="sm:text-[18px] text-xs font-500 text-center leading-8 text-white">
                      Minutes
                    </p>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
                      <span className="font-700 sm:text-[30px] text-base text-[#EF5DA8]">
                        {showSecound}
                      </span>
                    </div>
                    <p className="sm:text-[18px] text-xs font-500 text-center leading-8 text-white">
                      Seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading && <p className="text-center">Yükleniyor…</p>}
            {error && (
              <p className="text-center text-red-500 text-sm">{error}</p>
            )}
            {!loading && !error && (
              <div className="products grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
                {products.map((p) => (
                  <div data-aos="fade-up" key={p.id} className="item">
                    <div
                      className="product-card-style-one-two w-full h-full bg-white relative group overflow-hidden"
                      style={{
                        boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div
                        className="product-card-img w-full h-[322px] mt-4"
                        style={{
                          background: `url(${
                            import.meta.env.VITE_PUBLIC_URL
                          }/assets/images/) no-repeat center`,
                        }}
                      ></div>

                      <div className="product-card-details flex justify-center h-[102px] items-center relative">
                        {/* add to cart button */}
                        <div className="absolute w-[204px] h-[54px] left-[80px] -bottom-20 group-hover:bottom-[65px] transition-all duration-300 ease-in-out">
                          <button type="button" className="yellow-btn">
                            <div>
                              <span>Add To Cart</span>
                            </div>
                          </button>
                        </div>
                        <div>
                          <Link to="/single-product">
                            <p className="title mb-2.5 text-[20px] font-600 text-center text-qblack leading-[24px] line-clamp-2 hover:text-blue-600"></p>
                          </Link>
                          <div className="flex justify-center">
                            <div className="price">
                              <span className="offer-price text-center text-qred font-600 text-[18px] mr-1 inline-block">
                                {p.applicableProducts.map((x) => x.name)}
                              </span>
                              <span className="main-price text-qgray line-through font-600 text-center text-[18px]"></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* quick-access-btns */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
