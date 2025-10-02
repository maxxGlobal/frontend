import LayoutHomeTwo from "../Partials/LayoutHomeTwo";
import SectionStyleThreeHomeTwo from "../Helpers/SectionStyleThreeHomeTwo";
import ViewMoreTitle from "../Helpers/ViewMoreTitle";
import Banner from "./Banner";
import CampaignCountDown from "./CampaignCountDown";
import CategoriesSection from "./CategoriesSection";
import WhatsAppButton from "../Whatsapp/WhatsAppButton";
import { Helmet } from "react-helmet-async";
import "../../../theme.css";
import "../../../assets/homepage.css";

export default function HomeTwo() {
  // const { products } = datas as { products: Product[] };

  return (
    <LayoutHomeTwo>
      <Helmet>
        <title>Medintera – Anasayfa</title>
        <meta name="description" content="Anasayfa" />
      </Helmet>
      <Banner className="banner-wrapper mb-[46px]" />

      <ViewMoreTitle
        className="my-categories mb-[60px]"
        seeMoreUrl="/homepage/all-products"
        categoryTitle="Kategoriler"
      >
        <CategoriesSection />
      </ViewMoreTitle>

      <CampaignCountDown className="mb-[60px]" lastDate="2025-10-04 4:00:00" />

      <SectionStyleThreeHomeTwo
        showProducts={3}
        sectionTitle="Popular Sales"
        seeMoreUrl="/all-products"
        className="feature-products mb-[60px]"
      />
      <WhatsAppButton />
    </LayoutHomeTwo>
  );
}
