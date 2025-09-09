import ProductCardRowStyleOne from "./Cards/ProductCardRowStyleOne";
import DataIteration from "./DataIteration";

type Product = {
  id: number | string;
  title: string;
  price: string;
  offer_price?: string;
  image: string;
  [key: string]: any;
};

type SectionStyleTwoProps = {
  className?: string;
  products: Product[];
  type?: number;
};

export default function SectionStyleTwo({
  className,
  products,
  type,
}: SectionStyleTwoProps) {
  return (
    <div
      className={`section-content w-full grid sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 ${
        className || ""
      }`}
    >
      <DataIteration datas={products} startLength={0} endLength={4}>
        {({ datas }) => (
          <div key={datas.id} className="item w-full">
            <ProductCardRowStyleOne type={type} datas={datas} />
          </div>
        )}
      </DataIteration>
    </div>
  );
}
