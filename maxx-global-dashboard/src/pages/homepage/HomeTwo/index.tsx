import React from "react";
import LayoutHomeTwo from "../Partials/LayoutHomeTwo";

import datas from "../../../data/productsTwo.json";
import SectionStyleFour from "../Helpers/SectionStyleFour";
import SectionStyleThreeHomeTwo from "../Helpers/SectionStyleThreeHomeTwo";
import SectionStyleTwo from "../Helpers/SectionStyleTwoHomeTwo";
import ViewMoreTitle from "../Helpers/ViewMoreTitle";

import Banner from "./Banner";
import CampaignCountDown from "./CampaignCountDown";
import CategoriesSection from "./CategoriesSection";
import "../../../theme.css";
import "../../../assets/homepage.css";

type Product = {
  id: number;
  title: string;
  price: string;
  offer_price?: string;
  image: string;
  [key: string]: any;
};

export default function HomeTwo() {
  // const { products } = datas as { products: Product[] };

  return (
    <LayoutHomeTwo>
      <Banner className="banner-wrapper mb-[46px]" />

      <ViewMoreTitle
        className="my-categories mb-[60px]"
        seeMoreUrl="/all-products"
        categoryTitle="Kategoriler"
      >
        <CategoriesSection />
      </ViewMoreTitle>

      <CampaignCountDown className="mb-[60px]" lastDate="2025-10-04 4:00:00" />

      {/* <ProductsAds
        ads={[
          `${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-2.2.png`,
          `${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-2.1.png`,
        ]}
        sectionHeight="sm:h-[290px] h-full"
        className="products-ads-section mb-[60px]"
      /> */}

      <SectionStyleThreeHomeTwo
        // products={products.slice(3, 7)}
        showProducts={3}
        sectionTitle="Popular Sales"
        seeMoreUrl="/all-products"
        className="feature-products mb-[60px]"
      />

      {/* <ProductsAds
        ads={[
          `${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-2.3.png`,
        ]}
        className="products-ads-section mb-[60px]"
      /> */}

      {/* <SectionStyleThreeHomeTwo
        // products={[...products].reverse().slice(0, 10)}
        showProducts={9}
        sectionTitle="New Arrivals"
        seeMoreUrl="/all-products"
        className="new-arrivals mb-[60px]"
      /> */}

      {/* <ProductsAds
        sectionHeight="164"
        ads={[
          `${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-2.4.png`,
        ]}
        className="products-ads-section mb-[60px]"
      /> */}

      {/* <SectionStyleFour
        // products={products}
        sectionTitle="Popular Sales"
        seeMoreUrl="/all-products"
        className="category-products mb-[60px]"
      /> */}
    </LayoutHomeTwo>
  );
}
