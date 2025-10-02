import CategoryCard from "./Cards/CategoryCard";

import ViewMoreTitle from "./ViewMoreTitle";

type Product = {
  id: number | string;
  title: string;
  price: string;
  offer_price?: string;
  image: string;
  [key: string]: any;
};

type SectionStyleOneProps = {
  className?: string;
  categoryTitle: string;
  sectionTitle: string;
  seeMoreUrl: string;
  brands?: string[];
  products?: Product[];
  categoryBackground?: string;
};

export default function SectionStyleOne({
  className,
  categoryTitle,
  sectionTitle,
  seeMoreUrl,
  brands = [],

  categoryBackground,
}: SectionStyleOneProps) {
  const filterBrands = brands.filter(
    (value, index, array) => array.indexOf(value) === index
  );

  return (
    <div data-aos="fade-up" className={`section-style-one ${className || ""}`}>
      <ViewMoreTitle categoryTitle={sectionTitle} seeMoreUrl={seeMoreUrl}>
        <div className="products-section w-full">
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
            <div className="category-card hidden xl:block w-full">
              <CategoryCard
                background={categoryBackground}
                title={categoryTitle}
                brands={filterBrands}
              />
            </div>
          </div>
        </div>
      </ViewMoreTitle>
    </div>
  );
}
