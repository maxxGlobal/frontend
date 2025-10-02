import ViewMoreTitle from "./ViewMoreTitle";

type Product = {
  id: number | string;
  [key: string]: any;
};

type SectionStyleFourProps = {
  className?: string;
  sectionTitle: string;
  seeMoreUrl: string;
  products?: Product[];
};

export default function SectionStyleFour({
  className,
  sectionTitle,
  seeMoreUrl,
}: SectionStyleFourProps) {
  return (
    <div className={`section-style-one ${className || ""}`}>
      <ViewMoreTitle categoryTitle={sectionTitle} seeMoreUrl={seeMoreUrl}>
        <div className="products-section w-full">
          <div className="grid lg:grid-cols-3 grid-cols-1 xl:gap-[30px] lg:gap-5"></div>
        </div>
      </ViewMoreTitle>
    </div>
  );
}
