import ProductCardStyleOneTwo from "./Cards/ProductCardStyleOneTwo";
import DataIteration from "./DataIteration";
import ViewMoreTitle from "./ViewMoreTitle";

type Product = {
  id: number | string;
  title: string;
  price: string;
  offer_price?: string;
  image: string;
  [key: string]: any;
};

type SectionStyleThreeHomeTwoProps = {
  className?: string;
  sectionTitle: string;
  seeMoreUrl: string;
  products?: Product[];
  showProducts: number;
};

export default function SectionStyleThreeHomeTwo({
  className,
  sectionTitle,
  seeMoreUrl,
  products = [],
  showProducts,
}: SectionStyleThreeHomeTwoProps) {
  return (
    <div className={`section-style-one ${className || ""}`}>
      <ViewMoreTitle categoryTitle={sectionTitle} seeMoreUrl={seeMoreUrl}>
        <div className="products-section w-full">
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10">
            <DataIteration
              datas={products}
              startLength={0}
              endLength={showProducts}
            >
              {({ datas }) => (
                <div data-aos="fade-up" key={datas.id} className="item">
                  <ProductCardStyleOneTwo datas={datas} />
                </div>
              )}
            </DataIteration>
          </div>
        </div>
      </ViewMoreTitle>
    </div>
  );
}
